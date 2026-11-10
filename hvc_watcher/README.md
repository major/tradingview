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

Each multiplier has a minimum of 1.0x and a step of 0.1x. The selected setting applies consistently to HVC markers, labels, rays, alerts, and the Data Window comparison threshold. HVE detection is unchanged.

### From event to price level 🔍

```text
┌──────────────────┐     ┌──────────────────┐
│ Event bar closes │ --> │ HVC or HVE?      │
└──────────────────┘     └──────────────────┘
                                  |
                                 Yes
                                  v
                         ┌──────────────────┐
                         │ Retain its close │
                         │ One ray per bar  │
                         └──────────────────┘
```

If neither signal qualifies, no level is added. If both qualify, the candle adds **one HVE ray** (green by default), not two rays. HVE marker visibility does not change this choice. The level is the candle's finalized close, not its high or low.

## Display and alerts

* **Show Event Rays** is off by default and controls visibility only. Each confirmed HVC or HVE event retains one horizontal ray at its candle's finalized close, extending right, even while hidden. Enable the checkbox to show the rays instead of the former high/low rectangles. Visible rays default to 🟢 green for HVE and 🟠 orange for HVC, with color and opacity independent of the markers. An event that is both uses the HVE ray color even when HVE markers are hidden. HVE-only events also retain rays, including before SMA warm-up.
* **Maximum Event Rays** defaults to 5, with a range of 1 to 200, and remains configurable while rays are hidden. The oldest ray is explicitly deleted before allocating a replacement. Both visible and hidden rays use the indicator's 200-line budget and retain the same monitored levels. Price crossing a ray does not remove it.
* Optional historical HVC and current-bar labels show multipliers rounded to one decimal place. Shape, color, and labels are configurable.
* The current-bar label is reused rather than recreated on each update, and shows N/A when its multiplier is unavailable. Historical labels retain the most recent 500 signals, or 499 when the current-bar label is enabled to reserve its drawing slot.
* Dependent settings are disabled when their feature is off. HVE marker color is enabled only when HVE markers are on; ray colors are enabled only when rays are visible. Related label colors share a settings row.
* The Data Window shows Volume, Volume SMA, HVE Threshold, Volume Multiplier, HVC Comparison Threshold, HVC Signal, and HVE Signal. Signals are numeric 1 or 0. The comparison threshold is the current SMA multiplied by the HVC setting for the chart timeframe, in volume units. Since the SMA includes the current bar, it is not a fixed volume target.
* HVE, HVC, and combined alerts include the ticker, timeframe, close, and volume multiplier. HVE can occur before SMA warm-up, so its alert multiplier can be unavailable. TradingView substitutes the alert placeholders when the alert fires.
* TradingView alerts use a snapshot of the script and settings. Delete and recreate alerts after editing the script or changing settings you want reflected in the alert.

### Independent marker and ray colors 🎨

Use **HVE Color** and **HVC Color** under **Markers** for the dots or other selected marker shapes. Use **HVE Ray Color** and **HVC Ray Color** under **Rays** for the horizontal lines. Each color picker includes opacity, so no separate transparency setting is needed.

Both sets default to fully opaque green for HVE and fully opaque orange for HVC. Changing a marker color or opacity does not change the rays, and changing a ray color or opacity does not change the markers. Ray color and opacity do not change touch monitoring, even when a selected color is fully transparent.

### Five events, not five bars 📌

The default limit keeps the **latest five qualifying event candles** in the loaded chart history. These events can span many chart bars. With the default limit, a sixth event removes the oldest level before saving its own close:

| State | Retained event levels, oldest to newest |
| --- | --- |
| Before event 6 closes | Event 1, Event 2, Event 3, Event 4, Event 5 |
| After event 6 closes | Event 2, Event 3, Event 4, Event 5, Event 6 |

An unfinished event does not remove or replace a level. Touching a retained level does not remove it either. An older level can still trigger a touch on the candle that retires it, because touches are checked before replacement.

### Ray-touch alerts 🔔

Create a TradingView alert with the condition **HVC Watcher → Event Ray Touch**. It becomes eligible when a later candle's low is at or below an existing ray and its high is at or above that ray. Exact high/low equality counts. The originating candle does not count, and a gap across a level does not count unless the candle's range includes it.

```text
┌────────────────────────────┐
│ Later candle updates       │
└────────────────────────────┘
              |
              v
┌────────────────────────────┐
│ low <= level <= high?      │ --> No: no touch alert
└────────────────────────────┘
              |
             Yes
              v
┌────────────────────────────┐
│ Touch condition is true    │
│ Hidden or visible: same    │
└────────────────────────────┘
              |
              v
┌────────────────────────────┐
│ TradingView delivers alert │
│ At the selected frequency  │
└────────────────────────────┘
```

This flow checks previously retained levels, not the current candle's newly created ray. It stops at the first match, so touching several levels still produces one shared alert condition.

* Any retained HVE or HVC ray can trigger the condition. Multiple touched rays share one condition; the message includes the ticker, timeframe, and current close, not a separate price or message for each ray.
* The same ray can trigger again on a later candle. Choose **Once Per Bar** or **Once Per Bar Close** in TradingView to avoid repeated delivery within one candle.
* Touch detection on previously saved levels stays live during the current candle. TradingView's alert frequency controls intrabar or closing delivery. New rays are only saved at the event candle's finalized close, so they never follow a developing close. A delivered alert cannot be rolled back.
* Touches are checked before a confirmed event's new ray replaces the oldest one. A retiring ray can alert on its final candle, but is not monitored on later candles. An unfinished event cannot replace a retained level.
* Turning **Show Event Rays** off only hides the lines. Touch monitoring and the existing HVC/HVE event alerts work with either visibility setting. Recreate alerts after changing the script or relevant settings.

### Changing settings after creating an alert ⚙️

An existing alert keeps its own snapshot of the script and inputs, separate from the chart. For example:

| Action | Chart indicator | Existing alert |
| --- | --- | --- |
| Create a touch alert with a limit of 10 | Monitors 10 events | Monitors 10 events |
| Change the chart's limit to 5 | Monitors 5 events | Still monitors 10 events |
| Delete the alert and recreate it with the chart limit at 5 | Monitors 5 events | New alert monitors 5 events |

Changing the script's default does not update existing alerts. Do not assume it changed a saved chart input either: verify **Maximum Event Rays** in the chart settings before creating a replacement alert. The **Show Event Rays** checkbox only affects drawing visibility; either setting supports touch alerts.

## Event timing 🔔

Events always wait for the candle to close. Markers, historical multiplier labels, new ray levels, Data Window signal flags, and HVC/HVE event alert eligibility all use the same confirmed event signals. There is no separate Signal Timing setting. Historical confirmed signals are unchanged.

The current-bar multiplier, volume SMA, other volume diagnostics, and touches of older retained rays remain live. HVE's running record is independent of output confirmation. The live multiplier is not a projection of the final closing volume.

For **Event Ray Touch**, use TradingView's **Once Per Bar** frequency for intrabar notifications or **Once Per Bar Close** for closing notifications. Event alerts cannot fire intrabar regardless of frequency, because their signals wait for close. Alerts do not fire retroactively for historical markers. HVC/HVE events are volume observations, not standalone buy or sell recommendations.

## Tests and TradingView checks

Install the pinned compatibility runtime outside the repository, then run the tiny offline fixtures from the repository root:

```sh
npm install --prefix "$HOME/.cache/opencode-tmp/opencode/hvc-pinets" --no-audit --no-fund --save-exact pinets@0.13.1
NODE_PATH="$HOME/.cache/opencode-tmp/opencode/hvc-pinets/node_modules" \
  node --test hvc_watcher/hvc_watcher.test.mjs
```

The tests run the production source with synthetic volume, optional OHLC fixtures, and explicit input overrides. Timeframe fixtures cover default threshold boundaries on intraday, daily, multi-day, weekly, multi-week, monthly, quarterly, and yearly charts, plus independently configured multipliers. Ray fixtures cover close anchors, HVE priority with markers hidden, independent marker/ray colors and opacity, exact touch boundaries, gaps, repeat touches, hidden-by-default rays, and retirement. Fully transparent colors preserve touch eligibility. Unconfirmed-event retention, live touches, and capacity fixtures cover both visibility settings. Simulated unconfirmed bars check that events wait for close while diagnostics and older-ray touches stay live; they do not simulate realtime ticks. Capacity fixtures cover up to 202 ray events at limits of 1, 5, and 200, and more than 500 label signals without external data requests.

PineTS is a compatibility runtime, not TradingView's compiler or realtime engine. Its SMA handling of missing values can differ from Pine's valid-sample semantics, so the fixtures do not establish behavior after missing samples. Source-wiring checks do not compile Pine or verify rendering or alerts.

### Manual TradingView checklist

1. Compile in Pine Editor and add to a standard chart. Compare historical markers on a positive-volume symbol using the same history and explicitly matched multiplier settings. Switch between intraday, daily, 2D, weekly, 2W, monthly, 3M, and 12M charts, and verify that changing one multiplier affects only its timeframe group.
2. Inspect threshold equality and SMA warm-up in the Data Window. Check a no-volume symbol and missing-volume gaps. Pine's SMA uses valid samples, so missing data can extend warm-up beyond the configured number of chart bars.
3. Confirm rays are hidden by default and Maximum Event Rays defaults to 5. Enable Show Event Rays and check close-price rays with HVE markers off and on. Verify HVE-only and overlapping events default to fully opaque green, HVC-only events default to fully opaque orange, and no rectangles remain. Change marker and ray colors and opacity independently, including fully transparent rays; touch alerts must remain eligible. Toggle rays off and inspect dependent color controls; Maximum Event Rays must stay enabled. Set the limit to 1, 5, and 200 with more qualifying events than each limit; only the newest rays should remain when made visible. For a quick stress check, use SMA length 1 and the chart timeframe's threshold set to 1. Restore normal settings afterward.
4. Enable both label options. Inspect decimal formatting and an unavailable multiplier. For a capacity stress check, use SMA length 1, the chart timeframe's threshold set to 1, and more than 500 positive-volume bars with rays off. Confirm 499 historical labels plus the live label remain; with the live label off, retain 500 historical labels. Restore normal settings afterward.
5. Confirm there is no Signal Timing setting. Compare historical confirmed signals in Bar Replay, then observe an actual live bar. Markers, historical labels, rays, and Data Window event flags must wait for close while volume diagnostics and older-ray touches remain live. At a ray limit of 1, watch an unfinished event and its closing update: the older ray must remain until the new event closes. Check closing execution and reload behavior; replay alone does not validate realtime rollback. Check the last-bar label on both an open and a closed market.
6. Create HVC, HVE, combined, and Event Ray Touch alerts. Verify placeholder substitution and timing on live data, including simultaneous HVC/HVE with HVE markers off and on. Event alerts must wait for close. Check touches from above and below, high/low equality, gaps, repeated touches, and an event touching an older ray. The originating candle must not touch its own ray. Verify retired levels do not trigger future touches, while retained levels still trigger with Show Event Rays off. Compare Once Per Bar intrabar touch delivery with Once Per Bar Close delivery for both visibility settings. Recreate alerts after changing relevant settings.
7. If measuring performance, compare repeated Pine Profiler runs with identical symbols, timeframes, history, and feature toggles. Separate loading from realtime behavior. Label reuse avoids repeated allocation, and touch scanning stops at the first match instead of checking every remaining ray. No measured TradingView speedup is claimed.
