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
async function runIndicator(volumes, inputs = {}) {
    let source = await readFile(sourcePath, 'utf8');
    for (const [name, value] of Object.entries({ sma_length: 3, hvc_threshold: 2.0, ...inputs })) {
        source = replaceInput(source, name, value);
    }
    source += '\nplot(is_hvc ? 1 : 0, title = "Test HVC")\nplot(is_hve ? 1 : 0, title = "Test HVE")\nplot(volume_multiplier, title = "Test multiplier")\n';
    const bars = volumes.map((volume, index) => ({
        open: 100, high: 102, low: 99, close: 101, volume,
        openTime: Date.UTC(2020, 0, 1) + index * 86400000,
        closeTime: Date.UTC(2020, 0, 2) + index * 86400000 - 1,
    }));
    const context = await new PineTS(bars, 'TEST', 'D').run(source);
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
