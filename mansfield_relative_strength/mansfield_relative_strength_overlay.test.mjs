// Execute the production Pine logic with synthetic data, not a translated model.
// PineTS is a compatibility runtime, not the TradingView compiler.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import test from 'node:test';

const { PineTS } = createRequire(import.meta.url)('pinets');
const sourcePath = new URL('./mansfield_relative_strength_overlay.pine', import.meta.url);

test('diagnostic plots are transparent and cannot be enabled as lines in Style settings', async () => {
    // Arrange
    const source = await readFile(sourcePath, 'utf8');
    const diagnosticPlots = source.match(/^plot\(.*$/gm);

    // Act / Assert: PineTS cannot validate TradingView's Style overrides.
    assert.equal(diagnosticPlots.length, 2);
    for (const plot of diagnosticPlots) {
        assert.match(plot, /color = na/);
        assert.match(plot, /editable = false/);
        assert.match(plot, /display = display\.data_window/);
    }
    assert.match(diagnosticPlots.find(plot => plot.includes("title = 'Mansfield RS'")), /precision = 4/);
    assert.match(diagnosticPlots.find(plot => plot.includes("title = 'Ready for Next Crossover'")), /precision = 0/);
});

/** Replace exactly one fixture boundary so source drift cannot silently skip it. */
function replaceOnce(source, pattern, replacement) {
    assert.equal([...source.matchAll(new RegExp(pattern.source, 'gm'))].length, 1);
    return source.replace(pattern, replacement);
}

/** Build deterministic historical weekly bars with benchmark prices in open. */
function weeklyBars(closes, benchmarks = closes.map(() => 100)) {
    return closes.map((close, index) => ({
        open: benchmarks[index],
        high: Math.max(close, benchmarks[index]),
        low: Math.min(close, benchmarks[index]),
        close,
        volume: 1000,
        openTime: Date.UTC(2020, 0, 6) + index * 7 * 86400000,
        closeTime: Date.UTC(2020, 0, 11) + index * 7 * 86400000 - 1,
    }));
}

/** Run the actual Pine source, replacing only data feeds and explicit test inputs. */
async function runIndicator(closes, { benchmarks, mrsFixture = false, reset = 1, cooldown, unconfirmed = [], timeframe = 'W', displayInputs = {}, rawPlots = false } = {}) {
    let source = await readFile(sourcePath, 'utf8');
    source = replaceOnce(source, /^stockClose = request\.security\(.*\)$/m, 'stockClose = close');
    source = replaceOnce(source, /^benchmarkClose = request\.security\(.*\)$/m, 'benchmarkClose = open');
    source = replaceOnce(source, /^resetMagnitude = input\.float\(.*\)$/m, `resetMagnitude = ${reset.toFixed(1)}`);
    if (cooldown !== undefined) {
        source = replaceOnce(source, /^cooldownWeeks = input\.int\(.*\)$/m, `cooldownWeeks = ${cooldown}`);
    }
    for (const [name, value] of Object.entries(displayInputs)) {
        source = replaceOnce(source, new RegExp(`^${name} = input\\.(?:bool|color)\\(.*\\)$`, 'm'), `${name} = ${value}`);
    }
    if (mrsFixture) {
        source = replaceOnce(source, /^mansfieldRS = .*$/m, 'mansfieldRS = close');
    }
    if (unconfirmed.length) {
        const exclusions = unconfirmed.map(index => `bar_index != ${index}`).join(' and ');
        source = source.replaceAll('barstate.isconfirmed', `(barstate.isconfirmed and ${exclusions})`);
    }
    source += '\nplot(signal ? 1 : 0, title = "Test signal")\nplot(armed ? 1 : 0, title = "Test armed")\n';

    const runtime = new PineTS(weeklyBars(closes, benchmarks), 'TEST', timeframe);
    const context = await runtime.run(source);
    if (rawPlots) {
        return context.plots;
    }
    return Object.fromEntries(Object.entries(context.plots).map(([name, plot]) => [name, plot.data.map(point => point.value)]));
}

const displayScenarios = [
    { name: 'default marker and text colors match', inputs: {}, markerColor: '#00E676', textColor: '#00E676' },
    { name: 'marker and text colors can be changed independently', inputs: { markerColor: 'color.red', rsTextColor: 'color.white' }, markerColor: '#F23645', textColor: '#FFFFFF' },
    { name: 'RS text can be hidden without hiding markers', inputs: { showRSText: 'false' }, markerColor: '#00E676', textColor: null },
    { name: 'hiding markers does not suppress signals or consume eligibility differently', inputs: { showMarkers: 'false' }, markerColor: '#00E676', textColor: '#00E676', hidden: true },
];

for (const { name, inputs, markerColor, textColor, hidden = false } of displayScenarios) {
    test(name, async () => {
        // Arrange
        const values = [-2, 0.2, -1.2, 0.2, -0.2, 0.2];

        // Act
        const plots = await runIndicator(values, { mrsFixture: true, displayInputs: inputs, rawPlots: true });

        // Assert: display controls never alter the signal shared with alerts.
        assert.deepEqual(plots['Test signal'].data.map(point => point.value), [0, 1, 0, 0, 0, 1]);
        const markers = plots['Mansfield RS Zero Cross'];
        assert.equal(markers.options.editable, false);
        assert.deepEqual(markers.data.map(point => Boolean(point.value)), [false, !hidden, false, false, false, !hidden]);
        for (const { options } of markers.data.filter(point => point.value)) {
            assert.equal(options.color, markerColor);
            assert.equal(options.text, 'RS');
            if (textColor === null) {
                assert.ok(options.textcolor == null || Number.isNaN(options.textcolor));
            } else {
                assert.equal(options.textcolor, textColor);
            }
        }
    });
}

test('52-week warm-up and a constant ratio produce zero RS without signals', async () => {
    // Arrange
    const closes = Array(54).fill(100);

    // Act
    const plots = await runIndicator(closes);

    // Assert
    assert.ok(plots['Mansfield RS'].slice(0, 51).every(Number.isNaN));
    assert.deepEqual(plots['Mansfield RS'].slice(51), [0, 0, 0]);
    assert.ok(plots['Ready for Next Crossover'].slice(0, 52).every(Number.isNaN));
    assert.deepEqual(plots['Ready for Next Crossover'].slice(52), [1, 1]);
    assert.ok(plots['Test signal'].every(value => value === 0));
});

test('Mansfield averages 52 price ratios, not separately averaged prices', async () => {
    // Arrange
    const benchmarks = Array.from({ length: 53 }, (_, index) => 100 + index * 2);
    const ratios = Array.from({ length: 53 }, (_, index) => 1 + index / 100);
    const closes = ratios.map((ratio, index) => ratio * benchmarks[index]);

    // Act
    const plots = await runIndicator(closes, { benchmarks });

    // Assert
    for (const index of [51, 52]) {
        const mean = ratios.slice(index - 51, index + 1).reduce((sum, ratio) => sum + ratio, 0) / 52;
        assert.ok(Math.abs(plots['Mansfield RS'][index] - 100 * (ratios[index] / mean - 1)) < 1e-9);
    }
});

test('weekly prices drive calculation, crossover suppression, reset, and another signal together', async () => {
    // Arrange
    const closes = [...Array(51).fill(100), 99, 101, 99.8, 101, 98, 101];

    // Act: retain the production formula and state logic together.
    const plots = await runIndicator(closes);

    // Assert
    const signalBars = plots['Test signal'].flatMap((value, index) => value ? [index] : []);
    assert.deepEqual(signalBars, [52, 56]);
    assert.deepEqual(plots['Ready for Next Crossover'].slice(51), [NaN, 0, 0, 0, 1, 0]);
});

const scenarios = [
    { name: 'first valid positive value does not invent a crossing', values: [NaN, 0.2, 0.3], expected: [0, 0, 0] },
    { name: 'first negative-to-positive crossing is eligible', values: [-0.2, 0.2], expected: [0, 1] },
    { name: 'zero-to-positive crossing is eligible', values: [0, 0.2], expected: [0, 1] },
    { name: 'shallow recrossings stay suppressed until a deep reset', values: [-2, 0.2, -0.15, 0.3, -0.4, 0.1, -1.2, 0.15], expected: [0, 1, 0, 0, 0, 0, 0, 1] },
    { name: 'unrounded crossings and reset boundaries determine eligibility', values: [-2, 0.004, -1, 0.004, -1.004, 0.004], expected: [0, 1, 0, 0, 0, 1] },
    { name: 'touching zero does not signal', values: [-0.2, 0, 0.2], expected: [0, 0, 1] },
    { name: 'zero reset still requires a strictly negative close', values: [-1, 0.2, 0, 0.2, -0.01, 0.2], reset: 0, expected: [0, 1, 0, 0, 0, 1] },
    { name: 'larger reset magnitude suppresses additional signals', values: [-3, 0.2, -1.5, 0.2, -2.1, 0.2], reset: 2, expected: [0, 1, 0, 0, 0, 1] },
    { name: 'missing values cannot create a crossing', values: [-2, NaN, 0.2, -0.2, 0.2], expected: [0, 0, 0, 0, 1] },
    { name: 'unconfirmed crossing does not signal or disarm', values: [-2, 0.2, -0.2, 0.2], unconfirmed: [1], expected: [0, 0, 0, 1] },
    { name: 'unconfirmed threshold breach does not rearm', values: [-2, 0.2, -1.2, 0.2], unconfirmed: [2], expected: [0, 1, 0, 0] },
    { name: 'default cooldown suppresses a cross on the second following weekly bar', values: [-2, 0.2, -1.2, 0.2], expected: [0, 1, 0, 0] },
    { name: 'default cooldown permits a fresh cross on the third following weekly bar', values: [-2, 0.2, -1.2, -1.2, 0.2], expected: [0, 1, 0, 0, 1] },
    { name: 'suppressed crossings do not restart the cooldown or consume eligibility', values: [-2, 0.2, -1.2, 0.2, -0.2, 0.2], expected: [0, 1, 0, 0, 0, 1] },
    { name: 'cooldown expiry does not queue a delayed marker while RS stays positive', values: [-2, 0.2, -1.2, 0.2, 0.3, 0.4], expected: [0, 1, 0, 0, 0, 0] },
    { name: 'zero cooldown restores depth-only recrossings', values: [-2, 0.2, -1.2, 0.2, -1.2, 0.2], cooldown: 0, expected: [0, 1, 0, 1, 0, 1] },
    { name: 'custom cooldown blocks five following bars and allows the sixth', values: [-2, 0.2, -1.2, 0.2, -1.2, 0.2, -1.2, 0.2], cooldown: 5, expected: [0, 1, 0, 0, 0, 0, 0, 1] },
    { name: 'unconfirmed crossing cannot restart an expired cooldown', values: [-2, 0.2, -1.2, -1.2, 0.2, -1.2, 0.2], unconfirmed: [4], expected: [0, 1, 0, 0, 0, 0, 1] },
];

for (const { name, values, expected, ...options } of scenarios) {
    test(name, async () => {
        // Arrange: replace only MRS so boundary values are exact.
        // Act
        const plots = await runIndicator(values, { ...options, mrsFixture: true });

        // Assert
        assert.deepEqual(plots['Test signal'], expected);
        for (const index of options.unconfirmed ?? []) {
            assert.ok(Number.isNaN(plots['Mansfield RS'][index]));
            assert.ok(Number.isNaN(plots['Ready for Next Crossover'][index]));
            assert.equal(plots['Test armed'][index], plots['Test armed'][index - 1]);
        }
    });
}

test('readiness combines the depth reset and cooldown eligibility for the current bar', async () => {
    // Arrange
    const values = [-2, 0.2, -1.2, 0.2, 0.3];

    // Act
    const plots = await runIndicator(values, { mrsFixture: true });

    // Assert: a reset can arm during cooldown, without claiming a signal is ready.
    assert.deepEqual(plots['Test armed'], [1, 0, 1, 1, 1]);
    assert.deepEqual(plots['Ready for Next Crossover'], [NaN, 0, 0, 0, 1]);
});

test('invalid benchmark prices produce missing RS, not artificial zeroes', async () => {
    // Arrange
    const closes = Array(55).fill(100);
    const benchmarks = Array(55).fill(100);
    benchmarks[52] = 0;

    // Act
    const plots = await runIndicator(closes, { benchmarks });

    // Assert
    assert.ok(Number.isNaN(plots['Mansfield RS'][52]));
    assert.equal(plots['Mansfield RS'][53], 0);
    assert.ok(plots['Ready for Next Crossover'].slice(52, 54).every(Number.isNaN));
    assert.equal(plots['Ready for Next Crossover'][54], 1);
    assert.ok(plots['Test signal'].every(value => value === 0));
});

for (const timeframe of ['D', '2W']) {
    test(`${timeframe} charts are rejected rather than silently calculating a different SMA`, async () => {
        // Arrange / Act / Assert
        await assert.rejects(runIndicator([100, 101], { timeframe }), /standard 1W chart/);
    });
}
