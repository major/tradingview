// Execute production Pine with tiny offline fixtures, not a translated formula.
// PineTS is a compatibility runtime, not TradingView's compiler or realtime engine.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import test from 'node:test';

const { PineTS } = createRequire(import.meta.url)('pinets');
const sourcePath = new URL('./hvc_watcher.pine', import.meta.url);

/** Replace one input declaration and fail loudly if the source boundary changes. */
function replaceInput(source, name, value) {
    const pattern = new RegExp(`^${name} = input\\.(?:int|float|bool)\\(.*\\)$`, 'gm');
    assert.equal([...source.matchAll(pattern)].length, 1, name);
    return source.replace(pattern, `${name} = ${value}`);
}

/** Run the complete indicator with synthetic daily volume and explicit input overrides. */
async function runIndicator(volumes, inputs = {}, { rawContext = false, unconfirmed = [] } = {}) {
    let source = await readFile(sourcePath, 'utf8');
    for (const [name, value] of Object.entries({ sma_length: 3, hvc_threshold: 2.0, ...inputs })) {
        source = replaceInput(source, name, value);
    }
    if (unconfirmed.length) {
        const confirmed = unconfirmed.map(index => `bar_index != ${index}`).join(' and ');
        source = source.replaceAll('barstate.isconfirmed', `(barstate.isconfirmed and ${confirmed})`);
    }
    source += '\nplot(is_hvc ? 1 : 0, title = "Test HVC")\nplot(is_hve ? 1 : 0, title = "Test HVE")\nplot(volume_multiplier, title = "Test multiplier")\n';
    const bars = volumes.map((volume, index) => ({
        open: 100, high: 102, low: 99, close: 101, volume,
        openTime: Date.UTC(2020, 0, 1) + index * 86400000,
        closeTime: Date.UTC(2020, 0, 2) + index * 86400000 - 1,
    }));
    const context = await new PineTS(bars, 'TEST', 'D').run(source);
    if (rawContext) {
        return context;
    }
    return Object.fromEntries(Object.entries(context.plots).map(([name, plot]) => [name, plot.data.map(point => point.value)]));
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

test('source wires bounded zones, shared formatting, and hidden diagnostics', async () => {
    // Arrange
    const source = await readFile(sourcePath, 'utf8');

    // Act / Assert
    assert.match(source, /zone_length = input\.int\(90,.*maxval = 500/);
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
        const inputs = { sma_length: 1, hvc_threshold: 1.0, show_zones: false, show_multiplier_labels: true, show_current_multiplier: showLive };

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

for (const confirmOnClose of [false, true]) {
    for (const showHve of [false, true]) {
        test(`unconfirmed outputs share timing (${confirmOnClose}) independent of HVE display (${showHve})`, async () => {
            // Arrange: simulate an unfinished bar without pretending to simulate realtime rollback.
            const inputs = { confirm_on_close: confirmOnClose, show_hve_markers: showHve, show_multiplier_labels: true, show_current_multiplier: true };

            // Act
            const context = await runIndicator([10, 10, 40], inputs, { unconfirmed: [2], rawContext: true });

            // Assert: historical labels, zones, public flags, and markers share the close gate.
            const values = name => context.plots[name].data.map(point => point.value);
            assert.deepEqual(values('HVC Signal'), [0, 0, confirmOnClose ? 0 : 1]);
            assert.deepEqual(values('HVE Signal'), [1, 0, confirmOnClose ? 0 : 1]);
            assert.deepEqual(values('HVC (High Volume Close)').map(Boolean), [false, false, !confirmOnClose && !showHve]);
            assert.deepEqual(values('HVE (Highest Volume Ever)').map(Boolean), [showHve, false, !confirmOnClose && showHve]);
            assert.equal(context.pine.line.all.length, confirmOnClose ? 0 : 2);
            const labels = Array.from(context.pine.label.all);
            assert.equal(labels.length, confirmOnClose ? 1 : 2);
            assert.equal(labels.find(label => label.style === context.pine.label.style_label_upper_left).text, '2.0x');
        });
    }
}

test('confirmed mode does not change historical signals or the running HVE record', async () => {
    // Arrange
    const inputs = { confirm_on_close: true };

    // Act
    const historical = await runIndicator([10, 10, 40], inputs);
    const simulated = await runIndicator([10, 10, 40, 30], inputs, { unconfirmed: [2] });

    // Assert: suppressing an output must not suppress the record used on the following bar.
    assert.deepEqual(historical['HVC Signal'], [0, 0, 1]);
    assert.deepEqual(simulated['HVE Signal'], [1, 0, 0, 0]);
    assert.deepEqual(simulated['HVE Threshold'], [0, 10, 10, 40]);
});

test('dependent controls and alert context are wired without changing alert titles', async () => {
    // Arrange
    const source = await readFile(sourcePath, 'utf8');

    // Act / Assert: TradingView must validate disabled controls and alert placeholder substitution.
    assert.match(source, /confirm_on_close = input\.bool\(false/);
    assert.match(source, /color_hve = input\.color\([^\n]*active = show_hve_markers/);
    assert.match(source, /zone_length = input\.int\([^\n]*active = show_zones and not zone_extend_right/);
    for (const [name, toggle] of [['multiplier_label_color', 'show_multiplier_labels'], ['multiplier_text_color', 'show_multiplier_labels'], ['current_label_color', 'show_current_multiplier'], ['current_text_color', 'show_current_multiplier']]) {
        assert.match(source, new RegExp(`^${name} = input\\.color\\([^\\n]*active = ${toggle}`, 'm'));
    }
    const alerts = source.match(/^alertcondition\(.*$/gm);
    assert.equal(alerts.length, 3);
    for (const alert of alerts) {
        assert.ok(alert.includes('{{ticker}}'));
        assert.ok(alert.includes('{{interval}}'));
        assert.ok(alert.includes('{{close}}'));
        assert.ok(alert.includes('{{plot("Volume Multiplier")}}'));
    }
});
