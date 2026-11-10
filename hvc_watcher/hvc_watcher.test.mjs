// Execute production Pine with tiny offline fixtures, not a translated formula.
// PineTS is a compatibility runtime, not TradingView's compiler or realtime engine.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import test from 'node:test';

const { PineTS } = createRequire(import.meta.url)('pinets');
const sourcePath = new URL('./hvc_watcher.pine', import.meta.url);

/** Replace one input with a Pine expression and fail if the declaration changes. */
function replaceInput(source, name, value) {
    const pattern = new RegExp(`^${name} = input\\.(?:int|float|bool|color)\\(.*\\)$`, 'gm');
    assert.equal([...source.matchAll(pattern)].length, 1, name);
    return source.replace(pattern, `${name} = ${value}`);
}

/** Run synthetic volume and optional OHLC overrides; null preserves an input's default. */
async function runIndicator(volumes, inputs = {}, { rawContext = false, unconfirmed = [], timeframe = 'D', prices = [] } = {}) {
    let source = await readFile(sourcePath, 'utf8');
    for (const [name, value] of Object.entries({ sma_length: 3, hvc_threshold: 2.0, ...inputs })) {
        if (value !== null) {
            source = replaceInput(source, name, value);
        }
    }
    if (unconfirmed.length) {
        const confirmed = unconfirmed.map(index => `bar_index != ${index}`).join(' and ');
        source = source.replaceAll('barstate.isconfirmed', `(barstate.isconfirmed and ${confirmed})`);
    }
    source += '\nplot(is_hvc ? 1 : 0, title = "Test HVC")\nplot(is_hve ? 1 : 0, title = "Test HVE")\nplot(volume_multiplier, title = "Test multiplier")\nplot(ray_touched ? 1 : 0, title = "Test Ray Touch")\nplot(array.size(event_rays), title = "Test Ray Count")\n';
    const bars = volumes.map((volume, index) => ({
        open: 100, high: 102, low: 99, close: 101, ...prices[index], volume,
        openTime: Date.UTC(2020, 0, 1) + index * 86400000,
        closeTime: Date.UTC(2020, 0, 2) + index * 86400000 - 1,
    }));
    const context = await new PineTS(bars, 'TEST', timeframe).run(source);
    if (rawContext) {
        return context;
    }
    return Object.fromEntries(Object.entries(context.plots).map(([name, plot]) => [name, plot.data.map(point => point.value)]));
}

for (const [timeframe, multiplier] of [['1', 3], ['D', 3], ['2D', 3], ['W', 2], ['2W', 2], ['M', 2], ['3M', 2], ['12M', 2]]) {
    test(`${timeframe} uses the default multiplier with an inclusive boundary`, async () => {
        // Arrange: a four-bar SMA reaches 3x at volume 90, or 2x at volume 30.
        const boundary = multiplier === 3 ? 90 : 30;
        const inputs = { sma_length: 4, hvc_threshold: null };

        for (const offset of [-1, 0, 1]) {
            // Act
            const plots = await runIndicator([10, 10, 10, boundary + offset], inputs, { timeframe });

            // Assert
            assert.deepEqual(plots['HVC Signal'], [0, 0, 0, offset < 0 ? 0 : 1]);
            assert.equal(plots['HVC Comparison Threshold'][3], plots['Volume SMA'][3] * multiplier);
        }
    });
}

for (const [timeframe, multiplier] of [['1', 1.5], ['D', 1.5], ['2D', 1.5], ['W', 2.5], ['2W', 2.5], ['M', 3.5], ['3M', 3.5], ['12M', 3.5]]) {
    test(`${timeframe} selects its independently configured multiplier`, async () => {
        // Arrange: distinct thresholds expose accidental reuse of another timeframe's input.
        const inputs = { sma_length: 4, hvc_threshold: 1.5, hvc_threshold_weekly: 2.5, hvc_threshold_monthly: 3.5 };

        // Act
        const plots = await runIndicator([10, 10, 10, 90], inputs, { timeframe });

        // Assert: both the diagnostic and shared signal use the selected threshold.
        assert.equal(plots['HVC Comparison Threshold'][3], 30 * multiplier);
        assert.deepEqual(plots['HVC Signal'], [0, 0, 0, multiplier <= 3 ? 1 : 0]);
    });
}

for (const { name, volumes, expected } of [
    { name: 'below threshold', volumes: [10, 10, 39], expected: 0 },
    { name: 'exact threshold', volumes: [10, 10, 40], expected: 1 },
    { name: 'above threshold', volumes: [10, 10, 41], expected: 1 },
]) {
    test(`current-inclusive SMA detects ${name}`, async () => {
        // Arrange / Act
        const plots = await runIndicator(volumes);

        // Assert
        assert.deepEqual(plots['Test HVC'], [0, 0, expected]);
        const expectedSma = volumes.reduce((sum, volume) => sum + volume, 0) / 3;
        assert.ok(Math.abs(plots['Volume SMA'][2] - expectedSma) < 1e-9);
    });
}

test('a length-one SMA cannot reach a multiplier above one', async () => {
    // Arrange / Act
    const plots = await runIndicator([10, 50, 100], { sma_length: 1 });

    // Assert
    assert.deepEqual(plots['Test multiplier'], [1, 1, 1]);
    assert.deepEqual(plots['Test HVC'], [0, 0, 0]);
});

test('HVE starts at the first positive volume and excludes record ties', async () => {
    // Arrange / Act
    const plots = await runIndicator([0, 10, 10, 40, 30, 40, 41]);

    // Assert
    assert.deepEqual(plots['Test HVE'], [0, 1, 0, 1, 0, 0, 1]);
    assert.deepEqual(plots['HVE Threshold'], [0, 0, 10, 10, 40, 40, 40]);
});

for (const showHve of [false, true]) {
    test(`HVE marker visibility (${showHve}) does not suppress simultaneous HVC eligibility`, async () => {
        // Arrange / Act
        const plots = await runIndicator([10, 10, 40], { show_hve_markers: showHve });

        // Assert: presentation priority is separate from both signal conditions.
        assert.deepEqual(plots['Test HVC'], [0, 0, 1]);
        assert.deepEqual(plots['Test HVE'], [1, 0, 1]);
        assert.deepEqual(plots['HVC (High Volume Close)'].map(Boolean), [false, false, !showHve]);
        assert.deepEqual(plots['HVE (Highest Volume Ever)'].map(Boolean), [showHve, false, showHve]);
    });
}

test('event eligibility depends on volume rather than candle prices', async () => {
    // Arrange: distinct closes will also identify each event's drawing anchor.
    const prices = [
        { open: 8, high: 11, low: 7, close: 10 },
        { open: 18, high: 22, low: 17, close: 20 },
        { open: 28, high: 33, low: 27, close: 30 },
    ];

    // Act
    const plots = await runIndicator([40, 10, 100], {}, { prices });

    // Assert: the last event is both HVC and HVE, despite unrelated prices.
    assert.deepEqual(plots['HVC Signal'], [0, 0, 1]);
    assert.deepEqual(plots['HVE Signal'], [1, 0, 1]);
});

test('alert conditions use detection flags, not marker visibility', async () => {
    // Arrange
    const source = await readFile(sourcePath, 'utf8');

    // Act / Assert: this checks wiring, not TradingView alert delivery.
    assert.match(source, /alertcondition\(is_hve, title = 'HVE'/);
    assert.match(source, /alertcondition\(is_hvc, title = 'HVC'/);
    assert.match(source, /alertcondition\(is_hve or is_hvc, title = 'HVE or HVC'/);
});

test('zero volume suppresses signals and an unavailable baseline has no multiplier', async () => {
    // Arrange / Act
    const plots = await runIndicator([0, 0, 0, 0]);

    // Assert
    assert.deepEqual(plots['Test HVC'], [0, 0, 0, 0]);
    assert.deepEqual(plots['Test HVE'], [0, 0, 0, 0]);
    assert.ok(plots['Test multiplier'].every(value => value == null || Number.isNaN(value)));
});

test('zero current volume with a positive baseline has a zero multiplier', async () => {
    // Arrange / Act
    const plots = await runIndicator([10, 10, 0]);

    // Assert
    assert.equal(plots['Test multiplier'][2], 0);
    assert.equal(plots['Test HVC'][2], 0);
});

test('warmup and missing current volume do not produce HVC signals', async () => {
    // Arrange / Act
    const plots = await runIndicator([10, 10, NaN]);

    // Assert
    assert.deepEqual(plots['Test HVC'], [0, 0, 0]);
    assert.ok(plots['Test multiplier'].every(value => value == null || Number.isNaN(value)));
});

test('missing current volume is excluded even after the SMA warms up', async () => {
    // Arrange / Act
    const plots = await runIndicator([10, 10, 10, NaN]);

    // Assert
    assert.equal(plots['Test HVC'][3], 0);
    assert.ok(plots['Test multiplier'][3] == null || Number.isNaN(plots['Test multiplier'][3]));
});

test('Data Window diagnostics expose the calculated values', async () => {
    // Arrange / Act
    const plots = await runIndicator([10, 10, 40]);

    // Assert
    assert.deepEqual(plots['Volume Multiplier'].slice(2), [2]);
    assert.deepEqual(plots['HVC Comparison Threshold'].slice(2), [40]);
    assert.deepEqual(plots['HVC Signal'], [0, 0, 1]);
    assert.deepEqual(plots['HVE Signal'], [1, 0, 1]);
});

test('source wires bounded rays, shared formatting, and hidden diagnostics', async () => {
    // Arrange
    const source = await readFile(sourcePath, 'utf8');

    // Act / Assert
    assert.match(source, /indicator\([^\n]*max_lines_count = 200/);
    assert.match(source, /show_rays = input\.bool\(false/);
    assert.match(source, /ray_limit = input\.int\(5,.*minval = 1, maxval = 200/);
    assert.doesNotMatch(source, /linefill\.new|show_zones|zone_length/);
    assert.match(source, /\/\/@function[^\n]*\ngetMultiplierText\(value\) =>/);
    assert.match(source, /str\.tostring\(value, '0\.0'\) \+ 'x'/);
    assert.match(source, /na\(value\) \? 'N\/A'/);
    assert.equal((source.match(/getMultiplierText\(volume_multiplier\)/g) || []).length, 2);
    for (const title of ['Volume', 'Volume SMA', 'HVE Threshold', 'Volume Multiplier', 'HVC Comparison Threshold', 'HVC Signal', 'HVE Signal']) {
        assert.match(source, new RegExp(`plot\\([^\\n]*title = '${title}'[^\\n]*color = na[^\\n]*editable = false[^\\n]*display = display\\.data_window`));
    }
    assert.match(source, /title = 'Volume Multiplier'[^\n]*precision = 1/);
});

test('one live label is allocated before the last bar and displays a fractional multiplier', async () => {
    // Arrange / Act
    const context = await runIndicator([10, 10, 50], { show_current_multiplier: true }, { rawContext: true });

    // Assert: creation timing is observable here, but realtime rollback still needs TradingView.
    const [label] = context.pine.label.all;
    assert.equal(context.pine.label.all.length, 1);
    assert.equal(label._createdAtBar, 0);
    assert.equal(label.x, 2);
    assert.equal(label.y, 99);
    assert.equal(label.text, '2.1x');
});

test('the live label shows N/A instead of a stale or absent multiplier', async () => {
    // Arrange / Act
    const context = await runIndicator([0, 0, 0], { show_current_multiplier: true }, { rawContext: true });

    // Assert
    assert.equal(context.pine.label.all.length, 1);
    const [label] = context.pine.label.all;
    assert.equal(label.text, 'N/A');
});

for (const showLive of [false, true]) {
    test(`historical labels stay within capacity with live label ${showLive}`, async () => {
        // Arrange: length-one, threshold-one volume makes every bar an HVC.
        const inputs = { sma_length: 1, hvc_threshold: 1.0, show_rays: false, show_multiplier_labels: true, show_current_multiplier: showLive };

        // Act
        const context = await runIndicator(Array(502).fill(10), inputs, { rawContext: true });

        // Assert: deterministic retention must not let GC evict the persistent live label.
        const labels = Array.from(context.pine.label.all);
        const historical = labels.filter(label => label.style === context.pine.label.style_label_right);
        assert.equal(labels.length, 500);
        assert.equal(historical.length, showLive ? 499 : 500);
        assert.equal(Math.min(...historical.map(label => label.x)), showLive ? 3 : 2);
        assert.ok(historical.every(label => label.text === '1.0x'));
        if (showLive) {
            const live = labels.find(label => label.style === context.pine.label.style_label_upper_left);
            assert.equal(live._createdAtBar, 0);
            assert.equal(live.x, 501);
        }
    });
}

for (const showHve of [false, true]) {
    test(`events wait for close while diagnostics and older-ray touches stay live (HVE display ${showHve})`, async () => {
        // Arrange: simulate an unfinished bar without pretending to simulate realtime rollback.
        const inputs = { show_hve_markers: showHve, show_multiplier_labels: true, show_current_multiplier: true };

        // Act
        const context = await runIndicator([10, 10, 40], inputs, { unconfirmed: [2], rawContext: true });

        // Assert: only event outputs wait for close; older levels and diagnostics remain live.
        const values = name => context.plots[name].data.map(point => point.value);
        assert.deepEqual(values('HVC Signal'), [0, 0, 0]);
        assert.deepEqual(values('HVE Signal'), [1, 0, 0]);
        assert.deepEqual(values('HVC (High Volume Close)').map(Boolean), [false, false, false]);
        assert.deepEqual(values('HVE (Highest Volume Ever)').map(Boolean), [showHve, false, false]);
        assert.deepEqual(values('Test Ray Touch'), [0, 1, 1]);
        assert.equal(values('Volume Multiplier')[2], 2);
        assert.equal(context.pine.line.all.length, 1);
        const labels = Array.from(context.pine.label.all);
        assert.equal(labels.length, 1);
        assert.equal(labels[0].style, context.pine.label.style_label_upper_left);
        assert.equal(labels[0].text, '2.0x');
    });
}

test('event confirmation preserves historical signals and the running HVE record', async () => {
    // Arrange / Act
    const historical = await runIndicator([10, 10, 40]);
    const simulated = await runIndicator([10, 10, 40, 30], {}, { unconfirmed: [2] });

    // Assert: suppressing an output must not suppress the record used on the following bar.
    assert.deepEqual(historical['HVC Signal'], [0, 0, 1]);
    assert.deepEqual(simulated['HVE Signal'], [1, 0, 0, 0]);
    assert.deepEqual(simulated['HVE Threshold'], [0, 10, 10, 40]);
});

test('dependent controls and alert context are wired without changing alert titles', async () => {
    // Arrange
    const source = await readFile(sourcePath, 'utf8');

    // Act / Assert: TradingView must validate disabled controls and alert placeholder substitution.
    assert.doesNotMatch(source, /confirm_on_close|signals_ready|Signal Timing/);
    assert.match(source, /^color_hve = input\.color\([^\n]*active = show_hve_markers\)$/m);
    for (const [name, color] of [['ray_color_hve', 'green'], ['ray_color_hvc', 'orange']]) {
        assert.match(source, new RegExp(`^${name} = input\\.color\\(color\\.${color},[^\\n]*group = 'Rays'[^\\n]*active = show_rays\\)$`, 'm'));
    }
    assert.doesNotMatch(source.match(/^ray_limit = .*$/m)[0], /active =/);
    for (const [name, toggle] of [['multiplier_label_color', 'show_multiplier_labels'], ['multiplier_text_color', 'show_multiplier_labels'], ['current_label_color', 'show_current_multiplier'], ['current_text_color', 'show_current_multiplier']]) {
        assert.match(source, new RegExp(`^${name} = input\\.color\\([^\\n]*active = ${toggle}`, 'm'));
    }
    const alerts = source.match(/^alertcondition\(.*$/gm);
    assert.equal(alerts.length, 4);
    for (const alert of alerts) {
        assert.ok(alert.includes('{{ticker}}'));
        assert.ok(alert.includes('{{interval}}'));
        assert.ok(alert.includes('{{close}}'));
    }
    assert.ok(alerts.slice(0, 3).every(alert => alert.includes('{{plot("Volume Multiplier")}}')));
    assert.match(alerts[3], /alertcondition\(ray_touched, title = 'Event Ray Touch'/);
});

test('marker color and opacity changes preserve ray defaults', async () => {
    // Arrange: separate HVE and HVC events expose both marker color inputs.
    const inputs = { show_rays: true, show_hve_markers: true, color_hve: 'color.new(color.blue, 50)', color_hvc: 'color.new(color.red, 25)' };

    // Act
    const context = await runIndicator([100, 10, 10, 40], inputs, { rawContext: true });

    // Assert: Pine color inputs include their alpha channel, not just the RGB value.
    assert.equal(context.plots['HVE (Highest Volume Ever)'].data[0].options.color, '#2962FF80');
    assert.equal(context.plots['HVC (High Volume Close)'].data[3].options.color, '#F23645BF');
    assert.deepEqual(Array.from(context.pine.line.all, ray => ray.color), ['#4CAF50', '#FF9800']);
});

for (const showRays of [false, true]) {
    test(`ray color and opacity changes preserve markers and touch alerts with visibility ${showRays}`, async () => {
        // Arrange: a fully transparent HVE ray and partially transparent HVC ray.
        const inputs = { show_rays: showRays, show_hve_markers: true, ray_color_hve: 'color.new(color.purple, 100)', ray_color_hvc: 'color.new(color.blue, 50)' };

        // Act
        const context = await runIndicator([100, 10, 10, 40], inputs, { rawContext: true });

        // Assert: picker alpha is retained, visibility wins, and neither affects eligibility.
        const rays = Array.from(context.pine.line.all);
        assert.equal(rays.length, 2);
        if (showRays) {
            assert.deepEqual(rays.map(ray => ray.color), ['#9C27B000', '#2962FF80']);
        } else {
            assert.ok(rays.every(ray => ray.color == null || Number.isNaN(ray.color)));
        }
        assert.equal(context.plots['HVE (Highest Volume Ever)'].data[0].options.color, '#4CAF50');
        assert.equal(context.plots['HVC (High Volume Close)'].data[3].options.color, '#FF9800');
        assert.deepEqual(context.plots['Test Ray Touch'].data.map(point => point.value), [0, 1, 1, 1]);
        assert.deepEqual(context.plots['HVC Signal'].data.map(point => point.value), [0, 0, 0, 1]);
        assert.deepEqual(context.plots['HVE Signal'].data.map(point => point.value), [1, 0, 0, 0]);
    });
}

for (const { volumes, anchors, colors, inputs = {} } of [
    { volumes: [10, 10, 40], anchors: [0, 2], colors: ['#4CAF50', '#4CAF50'] },
    { volumes: [100, 10, 10, 40], anchors: [0, 3], colors: ['#4CAF50', '#FF9800'] },
    { volumes: [10, 10, 40], anchors: [0, 2], colors: ['#2962FF80', '#2962FF80'], inputs: { ray_color_hve: 'color.new(color.blue, 50)', ray_color_hvc: 'color.new(color.red, 25)' } },
]) {
    test(`close rays use signal colors with HVE markers off (${volumes}; ${colors})`, async () => {
        // Arrange: HVE-only, overlapping HVC/HVE, and HVC-only events have distinct closes.
        const prices = volumes.map((_, index) => ({ open: index + 8, high: index + 11, low: index + 7, close: index + 10 }));

        // Act
        const context = await runIndicator(volumes, { show_rays: true, ...inputs }, { prices, rawContext: true });

        // Assert: exactly one horizontal right ray per event, independent of marker priority.
        const rays = Array.from(context.pine.line.all);
        assert.deepEqual(rays.map(ray => ray.x1), anchors);
        assert.deepEqual(rays.map(ray => ray.color), colors);
        for (const ray of rays) {
            assert.equal(ray.y1, prices[ray.x1].close);
            assert.equal(ray.y2, ray.y1);
            assert.equal(ray.x2, ray.x1 + 1);
            assert.equal(ray.extend, 'r');
        }
    });
}

for (const showRays of [false, true]) {
    test(`touch boundaries and repeat touches stay live with visibility ${showRays}`, async () => {
        // Arrange: one ray at 10; gaps across it do not touch, but high/low equality does.
        const prices = [
            { open: 10, high: 11, low: 9, close: 10 },
            { open: 8, high: 9, low: 7, close: 8 },
            { open: 12, high: 13, low: 11, close: 12 },
            { open: 11, high: 12, low: 10, close: 11 },
            { open: 9, high: 10, low: 8, close: 9 },
            { open: 10, high: 11, low: 9, close: 10 },
        ];

        // Act
        const plots = await runIndicator([100, 0, 0, 0, 0, 0], { show_rays: showRays }, { prices, unconfirmed: [3, 4] });

        // Assert: no self-touch or gap touch, but unconfirmed and repeat touches count.
        assert.deepEqual(plots['Test Ray Touch'], [0, 0, 0, 1, 1, 1]);
    });
}

for (const showRays of [false, true]) {
    test(`touch scanning handles later, first, and multiple matching levels with visibility ${showRays}`, async () => {
        // Arrange: two saved levels at 10 and 20, followed by three distinct touch ranges.
        const prices = [
            { open: 10, high: 11, low: 9, close: 10 },
            { open: 20, high: 21, low: 19, close: 20 },
            { open: 20, high: 21, low: 19, close: 20 },
            { open: 10, high: 11, low: 9, close: 10 },
            { open: 10, high: 21, low: 9, close: 20 },
        ];

        // Act
        const context = await runIndicator([100, 200, 0, 0, 0], { show_rays: showRays }, { prices, rawContext: true });

        // Assert: nonmatches do not stop scanning, and any match leaves retention unchanged.
        assert.deepEqual(context.plots['Test Ray Touch'].data.map(point => point.value), [0, 0, 1, 1, 1]);
        assert.deepEqual(Array.from(context.pine.line.all, ray => ray.y1), [10, 20]);
    });

    test(`unconfirmed events cannot replace saved levels at capacity with visibility ${showRays}`, async () => {
        // Arrange: an unfinished event at 20 must not replace the saved ray at 10.
        const prices = [
            { open: 10, high: 11, low: 9, close: 10 },
            { open: 12, high: 13, low: 11, close: 12 },
            { open: 10, high: 21, low: 9, close: 20 },
            { open: 10, high: 11, low: 9, close: 10 },
            { open: 10, high: 21, low: 9, close: 20 },
            { open: 10, high: 11, low: 9, close: 10 },
        ];

        // Act: a later confirmed event replaces the old ray normally.
        const context = await runIndicator([100, 10, 300, 0, 400, 0], { ray_limit: 1, show_rays: showRays }, { prices, unconfirmed: [2], rawContext: true });

        // Assert: old-ray touches continue until the confirmed replacement, never afterward.
        const values = name => context.plots[name].data.map(point => point.value);
        assert.deepEqual(values('HVC Signal'), [0, 0, 0, 0, 0, 0]);
        assert.deepEqual(values('HVE Signal'), [1, 0, 0, 0, 1, 0]);
        assert.deepEqual(values('Test Ray Touch'), [0, 0, 1, 1, 1, 0]);
        assert.deepEqual(values('Test Ray Count'), [1, 1, 1, 1, 1, 1]);
        const [ray] = Array.from(context.pine.line.all);
        assert.equal(context.pine.line.all.length, 1);
        assert.equal(ray.x1, 4);
        assert.equal(ray.y1, 20);
    });
}

test('rays are hidden by default without disabling touch monitoring or event signals', async () => {
    // Arrange / Act
    const context = await runIndicator([100, 10, 10, 40], {}, { rawContext: true });

    // Assert
    const rays = Array.from(context.pine.line.all);
    assert.equal(rays.length, 2);
    assert.ok(rays.every(ray => ray.color == null || Number.isNaN(ray.color)));
    assert.deepEqual(context.plots['Test Ray Touch'].data.map(point => point.value), [0, 1, 1, 1]);
    assert.deepEqual(context.plots['HVC Signal'].data.map(point => point.value), [0, 0, 0, 1]);
    assert.deepEqual(context.plots['HVE Signal'].data.map(point => point.value), [1, 0, 0, 0]);
});

for (const [limit, showRays] of [[1, false], [5, false], [200, false], [1, true], [5, true], [200, true]]) {
    test(`rays retain only the latest ${limit} events with visibility ${showRays}`, async () => {
        // Arrange: every bar is an HVC, with more events than TradingView's line budget.
        const inputs = { sma_length: 1, hvc_threshold: 1, ray_limit: limit === 5 ? null : limit, show_rays: showRays };

        // Act
        const context = await runIndicator(Array(202).fill(10), inputs, { rawContext: true });

        // Assert: both the monitored array and live drawings have the same bounded retention.
        const rays = Array.from(context.pine.line.all);
        assert.equal(rays.length, limit);
        assert.equal(Math.min(...rays.map(ray => ray.x1)), 202 - limit);
        assert.equal(context.plots['Test Ray Count'].data.at(-1).value, limit);
        assert.ok(context.plots['Test Ray Count'].data.every(point => point.value <= limit));
    });
}

test('a retiring ray can alert on its last candle but is not monitored afterward', async () => {
    // Arrange: the second event touches the old 10 ray and replaces it with a 20 ray.
    const prices = [
        { open: 10, high: 11, low: 9, close: 10 },
        { open: 10, high: 21, low: 9, close: 20 },
        { open: 10, high: 11, low: 9, close: 10 },
    ];

    // Act
    const context = await runIndicator([100, 200, 0], { ray_limit: 1 }, { prices, rawContext: true });

    // Assert
    assert.deepEqual(context.plots['Test Ray Touch'].data.map(point => point.value), [0, 1, 0]);
    assert.equal(context.pine.line.all.length, 1);
    assert.equal(Array.from(context.pine.line.all)[0].y1, 20);
});
