# HVC Watcher 🔍

Watch for High Volume Closes (HVC) and unusual volume patterns.

## Signals and volume context

* **HVC** 🟠 means positive volume is at least the configured multiple of a positive volume SMA (default: 20 bars). The multiplier is selected automatically from three independent settings based on the chart timeframe. The SMA includes the current bar, so a length of 1 cannot produce a multiplier above 1.
* **HVE** 🟢 means positive volume exceeds every earlier volume in the loaded chart history. Record ties do not qualify. This is not necessarily an all-time record. HVE markers are off by default.
* HVE markers take priority when both signals occur. Turning HVE markers off still allows the HVC marker. Alerts use the signals, not marker visibility.
* Missing volume or an unavailable or nonpositive SMA cannot produce HVC. Zero volume produces neither signal. A zero current volume with a positive SMA has a 0.0x multiplier; an unavailable multiplier is N/A.
* Volume units depend on the symbol and feed. Some feeds report tick volume rather than traded volume. Mixed sessions and differences in time of day can affect the comparison.

### Timeframe multipliers ⚙️

| Volume Settings input | Chart timeframes | Default |
| --- | --- | --- |
| HVC Multiplier: Daily and Below | Intraday, daily, and multi-day charts such as 2D | 3.0x |
| HVC Multiplier: Weekly | Weekly and multi-week charts such as 2W | 2.0x |
| HVC Multiplier: Monthly and Above | Monthly, quarterly (3M), yearly (12M), and other monthly multiples | 2.0x |

Each multiplier has a minimum of 1.0x and a step of 0.1x. The selected setting applies consistently to HVC markers, labels, zones, alerts, and the Data Window comparison threshold. HVE detection is unchanged.

## Display and alerts

* Optional HVC zones mark the high and low of each HVC bar. Fixed zones default to 90 bars and have a maximum length of 500 bars; zones can instead extend right.
* Optional historical HVC and current-bar labels show multipliers rounded to one decimal place. Shape, color, zone transparency, and labels are configurable.
* The current-bar label is reused rather than recreated on each update, and shows N/A when its multiplier is unavailable. Historical labels retain the most recent 500 signals, or 499 when the current-bar label is enabled to reserve its drawing slot. Zones continue to use TradingView's drawing garbage collection.
* Dependent settings are disabled when their feature is off. Fixed zone length is also disabled while zones extend right. Related label colors share a settings row.
* The Data Window shows Volume, Volume SMA, HVE Threshold, Volume Multiplier, HVC Comparison Threshold, HVC Signal, and HVE Signal. Signals are numeric 1 or 0. The comparison threshold is the current SMA multiplied by the HVC setting for the chart timeframe, in volume units. Since the SMA includes the current bar, it is not a fixed volume target.
* HVE, HVC, and combined alerts include the ticker, timeframe, close, and volume multiplier. HVE can occur before SMA warm-up, so its alert multiplier can be unavailable. TradingView substitutes the alert placeholders when the alert fires.
* TradingView alerts use a snapshot of the script and settings. Delete and recreate alerts after editing the script or changing settings you want reflected in the alert.

## Signal timing 🔔

**Confirm Signals at Bar Close** is off by default to preserve existing intrabar behavior. On an incomplete bar, volume, the SMA, zones, and signal eligibility can update. This is not a projection of the final closing volume.

Enable confirmation to wait for the bar to close before emitting markers, historical multiplier labels, zones, Data Window signal flags, or alert eligibility. The current-bar multiplier and other volume diagnostics remain live. HVE's running record is independent of this setting, and confirmed historical signals are unchanged.

TradingView's alert frequency is a separate control. **Once Per Bar Close** can restrict alert delivery even with confirmation off; enabling confirmation also synchronizes the chart's signal outputs with bar close. Alerts do not fire retroactively for historical markers. HVC/HVE events are volume observations, not standalone buy or sell recommendations.

## Tests and TradingView checks

Install the pinned compatibility runtime outside the repository, then run the tiny offline fixtures from the repository root:

```sh
npm install --prefix "$HOME/.cache/opencode-tmp/opencode/hvc-pinets" --no-audit --no-fund --save-exact pinets@0.13.1
NODE_PATH="$HOME/.cache/opencode-tmp/opencode/hvc-pinets/node_modules" \
  node --test hvc_watcher/hvc_watcher.test.mjs
```

The tests run the production source with synthetic volume and explicit input overrides. Timeframe fixtures cover default threshold boundaries on intraday, daily, multi-day, weekly, multi-week, monthly, quarterly, and yearly charts, plus independently configured multipliers. Simulated unconfirmed bars exercise confirmation gates, not realtime ticks. Capacity fixtures cover more than 500 signals without external data requests.

PineTS is a compatibility runtime, not TradingView's compiler or realtime engine. Its SMA handling of missing values can differ from Pine's valid-sample semantics, so the fixtures do not establish behavior after missing samples. Source-wiring checks do not compile Pine or verify rendering or alerts.

### Manual TradingView checklist

1. Compile in Pine Editor and add to a standard chart. Compare historical markers with the prior version on a positive-volume symbol using the same history and settings. Weekly and monthly defaults now use 2.0x instead of 3.0x; set all three multipliers to the prior threshold for a like-for-like comparison. Switch between intraday, daily, 2D, weekly, 2W, monthly, 3M, and 12M charts, and verify that changing one multiplier affects only its timeframe group.
2. Inspect threshold equality and SMA warm-up in the Data Window. Check a no-volume symbol and missing-volume gaps. Pine's SMA uses valid samples, so missing data can extend warm-up beyond the configured number of chart bars.
3. Check fixed zones at lengths 1 and 500, then enable extend-right. Confirm fixed length and dependent settings are disabled when appropriate.
4. Enable both label options. Inspect decimal formatting and an unavailable multiplier. For a capacity stress check, use SMA length 1, the chart timeframe's threshold set to 1, and more than 500 positive-volume bars with zones off. Confirm 499 historical labels plus the live label remain; with the live label off, retain 500 historical labels. Restore normal settings afterward.
5. Compare confirmation on and off in Bar Replay. Historical confirmed signals should match. Observe an actual live bar to check intrabar updates, closing execution, and reload behavior; replay alone does not validate realtime rollback. Check the last-bar label on both an open and a closed market.
6. Create HVC, HVE, and combined alerts. Verify placeholder substitution and timing on live data, including simultaneous HVC/HVE with HVE markers off and on. Recreate alerts after changing relevant settings.
7. If measuring performance, compare repeated Pine Profiler runs with identical symbols, timeframes, history, and feature toggles. Separate loading from realtime behavior. Label reuse reduces repeated object creation, but no measured TradingView speedup is claimed.
