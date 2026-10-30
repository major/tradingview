# HVC Watcher 🔍

Watch for High Volume Closes (HVC) and unusual volume patterns.

## Signals and volume context

* **HVC** 🟠 means positive volume is at least the configured multiple of a positive volume SMA (default: 3.0x over 20 bars). The SMA includes the current bar, so a length of 1 cannot produce a multiplier above 1.
* **HVE** 🟢 means positive volume exceeds every earlier volume in the loaded chart history. Record ties do not qualify. This is not necessarily an all-time record. HVE markers are off by default.
* HVE markers take priority when both signals occur. Turning HVE markers off still allows the HVC marker. Alerts use the signals, not marker visibility.
* Missing volume or an unavailable or nonpositive SMA cannot produce HVC. Zero volume produces neither signal. A zero current volume with a positive SMA has a 0.0x multiplier; an unavailable multiplier is N/A.
* Volume units depend on the symbol and feed. Some feeds report tick volume rather than traded volume. Mixed sessions and differences in time of day can affect the comparison.

## Display and alerts

* Optional HVC zones mark the high and low of each HVC bar. Fixed zones default to 90 bars and have a maximum length of 500 bars; zones can instead extend right.
* Optional historical HVC and current-bar labels show multipliers rounded to one decimal place. Shape, color, zone transparency, and labels are configurable.
* The Data Window shows Volume, Volume SMA, HVE Threshold, Volume Multiplier, HVC Comparison Threshold, HVC Signal, and HVE Signal. Signals are numeric 1 or 0. The comparison threshold is the current SMA multiplied by the HVC setting, in volume units. Since the SMA includes the current bar, it is not a fixed volume target.
* HVE, HVC, and combined alerts are available. On an incomplete bar, volume, the SMA, signals, labels, and alerts can change intrabar. TradingView alert frequency settings also affect delivery.
* TradingView alerts use a snapshot of the script and settings. Delete and recreate alerts after editing the script or changing settings you want reflected in the alert.

## Tests and TradingView checks

Run the tiny offline fixtures with the existing cached PineTS 0.13.1 installation:

```sh
NODE_PATH=/home/major/.cache/opencode-tmp/opencode/mansfield-pinets/node_modules node --test hvc_watcher/hvc_watcher.test.mjs
```

PineTS is a compatibility runtime, not TradingView's compiler or realtime engine. Its SMA handling of missing values can differ from Pine's valid-sample semantics, so the fixtures do not establish behavior after missing samples. Source-wiring checks do not compile Pine or verify rendering or alerts. Manually compile in TradingView, check historical and replay behavior, and test live alerts before relying on the indicator.
