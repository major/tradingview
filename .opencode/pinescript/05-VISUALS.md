# Pine Script v6 Visuals

## plot()

Main function for drawing lines and series data.

```pine
plot(
    series,                         // Value to plot (required)
    title = "",                     // Display name
    color = color.blue,             // Line color
    linewidth = 1,                  // 1-4
    style = plot.style_line,        // See styles below
    trackprice = false,             // Show price label on scale
    histbase = 0,                   // Base for histogram style
    offset = 0,                     // Bar offset
    join = true,                    // Connect gaps
    editable = true,                // User can modify
    show_last = na,                 // Show only last N bars
    display = display.all,          // Where to display
    format = format.inherit,        // Number format
    precision = na,                 // Decimal places
    force_overlay = false,          // Force on price chart
    linestyle = plot.linestyle_solid // solid, dashed, dotted
)
```

### Plot Styles

```pine
plot.style_line          // Continuous line
plot.style_linebr        // Line with breaks on na
plot.style_stepline      // Step line
plot.style_steplinebr    // Step line with breaks
plot.style_stepline_diamond  // Step with diamond markers
plot.style_histogram     // Vertical bars from histbase
plot.style_area          // Filled area to bottom
plot.style_areabr        // Area with breaks
plot.style_columns       // Column bars
plot.style_circles       // Circle markers
plot.style_cross         // Cross markers
```

### Line Styles (for linestyle parameter)

```pine
plot.linestyle_solid     // ─────────
plot.linestyle_dashed    // ┄┄┄┄┄┄┄┄┄
plot.linestyle_dotted    // ┈ ┈ ┈ ┈ ┈
```

### Display Options

```pine
display.all              // Everywhere
display.none             // Nowhere
display.pane             // Chart pane only
display.status_line      // Status line only
display.data_window      // Data window only
display.price_scale      // Price scale only
```

## plotshape()

Plot shapes at specific points.

```pine
plotshape(
    series,                         // Condition (bool series)
    title = "",
    style = shape.xcross,           // See shapes below
    location = location.abovebar,   // See locations below
    color = color.green,
    size = size.normal,             // See sizes below
    text = "",                      // Label text
    textcolor = color.white,
    offset = 0,
    editable = true,
    display = display.all,
    force_overlay = false
)
```

### Shape Styles

```pine
shape.xcross            // X cross
shape.cross             // + cross
shape.circle            // Circle
shape.square            // Square
shape.diamond           // Diamond
shape.triangleup        // Triangle pointing up
shape.triangledown      // Triangle pointing down
shape.arrowup           // Arrow pointing up
shape.arrowdown         // Arrow pointing down
shape.flag              // Flag
shape.labelup           // Label with arrow up
shape.labeldown         // Label with arrow down
```

### Locations

```pine
location.abovebar       // Above the bar
location.belowbar       // Below the bar
location.top            // Top of pane
location.bottom         // Bottom of pane
location.absolute       // At the series value
```

### Sizes

```pine
size.tiny
size.small
size.normal
size.large
size.huge
size.auto               // Auto-size
```

## plotchar()

Plot single character markers.

```pine
plotchar(
    series,                         // Condition
    title = "",
    char = "",                      // Single character or emoji
    location = location.abovebar,
    color = color.green,
    size = size.normal,
    text = "",
    textcolor = color.white,
    offset = 0,
    editable = true,
    display = display.all
)

// Example with emoji
plotchar(buySignal, "Buy", "🚀", location.belowbar, color.green)
```

## plotarrow()

Plot directional arrows.

```pine
plotarrow(
    series,                         // Positive = up, negative = down, 0/na = none
    title = "",
    colorup = color.green,
    colordown = color.red,
    offset = 0,
    minheight = 5,
    maxheight = 100
)

// Example
direction = close > open ? 1 : -1
plotarrow(direction, colorup=color.green, colordown=color.red)
```

## Background and Bar Colors

### bgcolor()

```pine
bgcolor(
    color,                          // Color or na for no background
    offset = 0,
    editable = true,
    show_last = na,
    title = "",
    display = display.all,
    force_overlay = false
)

// Example: Highlight when RSI is overbought
bgcolor(rsi > 70 ? color.new(color.red, 80) : na)
```

### barcolor()

```pine
barcolor(
    color,                          // Color or na for default
    offset = 0,
    editable = true,
    show_last = na,
    title = "",
    display = display.all
)

// Example: Color bars by trend
barcolor(close > ta.sma(close, 20) ? color.green : color.red)
```

## fill()

Fill area between two plots or lines. **Note:** You cannot mix plot and hline IDs in the same `fill()` call.

```pine
// Between plots
p1 = plot(upperBand)
p2 = plot(lowerBand)
fill(p1, p2, color=color.new(color.blue, 80), title="Band Fill", fillgaps=true)

// Between hlines
h1 = hline(70)
h2 = hline(30)
fill(h1, h2, color=color.new(color.purple, 90), title="Level Fill")
```

## Lines

### line.new()

```pine
var line myLine = line.new(
    x1, y1,                         // Start point
    x2, y2,                         // End point
    xloc = xloc.bar_index,          // xloc.bar_index or xloc.bar_time
    extend = extend.none,           // extend.none, .left, .right, .both
    color = color.blue,
    style = line.style_solid,       // See styles below
    width = 1,
    force_overlay = false
)

// Using chart.point
p1 = chart.point.from_index(bar_index[10], low[10])
p2 = chart.point.now(high)
myLine2 = line.new(p1, p2, color=color.red)
```

// Styles
line.style_solid
line.style_dotted
line.style_dashed
line.style_arrow_left
line.style_arrow_right
line.style_arrow_both

### Line Updates

```pine
line.set_xy1(myLine, x1, y1)        // Move start point
line.set_xy2(myLine, x2, y2)        // Move end point
line.set_first_point(myLine, p1)    // Update using chart.point
line.set_color(myLine, color.red)
line.set_width(myLine, 2)
line.set_style(myLine, line.style_dashed)
line.set_extend(myLine, extend.right)
line.delete(myLine)                 // Remove line
```

## Polylines

Polylines connect multiple points with line segments.

### polyline.new()

```pine
var array<chart.point> points = array.new<chart.point>()
if barstate.isfirst
    points.push(chart.point.from_index(bar_index, low))
    points.push(chart.point.from_index(bar_index + 10, high))
    points.push(chart.point.from_index(bar_index + 20, low))

var polyline myPoly = polyline.new(
    points,
    closed = false,                 // Connect last point to first
    line_color = color.blue,
    fill_color = color.new(color.blue, 80),
    line_style = line.style_solid,
    line_width = 1,
    xloc = xloc.bar_index,
    force_overlay = false
)
```

## Boxes

### box.new()

```pine
var box myBox = box.new(
    left, top,                      // Top-left corner
    right, bottom,                  // Bottom-right corner
    border_color = color.blue,
    border_width = 1,
    border_style = line.style_solid,
    bgcolor = color.new(color.blue, 80),
    xloc = xloc.bar_index,
    extend = extend.none,
    text = "",
    text_size = size.normal,
    text_color = color.white,
    text_halign = text.align_center,
    text_valign = text.align_center,
    force_overlay = false
)

// Using chart.point
p1 = chart.point.from_index(bar_index[10], high[10])
p2 = chart.point.now(low)
myBox2 = box.new(p1, p2, bgcolor=color.new(color.red, 80))
```

### Box Updates

```pine
box.set_lefttop(myBox, left, top)
box.set_rightbottom(myBox, right, bottom)
box.set_bgcolor(myBox, color.new(color.red, 80))
box.set_border_color(myBox, color.red)
box.set_text(myBox, "New Text")
box.delete(myBox)
```

## Labels

### label.new()

```pine
var label myLabel = label.new(
    x, y,                           // Position
    text = "",                      // Label text
    xloc = xloc.bar_index,
    yloc = yloc.price,              // yloc.price, .abovebar, .belowbar
    color = color.blue,             // Background color
    style = label.style_label_down, // See styles below
    textcolor = color.white,
    size = size.normal,
    textalign = text.align_center,
    tooltip = "",
    text_font_family = font.family_default,
    force_overlay = false
)
```


### Label Updates

```pine
label.set_xy(myLabel, x, y)
label.set_text(myLabel, "New Text")
label.set_color(myLabel, color.red)
label.set_textcolor(myLabel, color.black)
label.set_tooltip(myLabel, "Hover text")
label.delete(myLabel)
```

## Tables

### table.new()

```pine
var table myTable = table.new(
    position,                       // See positions below
    columns,                        // Number of columns
    rows,                           // Number of rows
    bgcolor = color.white,
    frame_color = color.gray,
    frame_width = 1,
    border_color = color.gray,
    border_width = 1
)

// Positions
position.top_left
position.top_center
position.top_right
position.middle_left
position.middle_center
position.middle_right
position.bottom_left
position.bottom_center
position.bottom_right
```

### table.cell()

```pine
table.cell(
    table_id,
    column,                         // 0-indexed
    row,                            // 0-indexed
    text = "",
    width = 0,                      // 0 = auto
    height = 0,                     // 0 = auto
    text_color = color.black,
    text_halign = text.align_center,
    text_valign = text.align_center,
    text_size = size.normal,
    bgcolor = color.white,
    tooltip = "",
    text_font_family = font.family_default
)

// Merge cells
table.merge_cells(myTable, 0, 0, 1, 0) // Merge first two columns in first row

// Set text formatting
table.cell_set_text_formatting(myTable, 0, 0, text.format_bold)
```

### Table Pattern (Update on Last Bar Only)

```pine
var table t = table.new(position.top_right, 2, 3)

if barstate.islast
    table.cell(t, 0, 0, "Metric", text_color=color.white, bgcolor=color.gray)
    table.cell(t, 1, 0, "Value", text_color=color.white, bgcolor=color.gray)
    table.cell(t, 0, 1, "RSI")
    table.cell(t, 1, 1, str.tostring(rsi, "#.##"))
    table.cell(t, 0, 2, "MACD")
    table.cell(t, 1, 2, str.tostring(macd, "#.####"))
```

## Colors

### Built-in Colors

```pine
color.aqua, color.black, color.blue, color.fuchsia, color.gray,
color.green, color.lime, color.maroon, color.navy, color.olive,
color.orange, color.purple, color.red, color.silver, color.teal,
color.white, color.yellow
```

### Creating Colors

```pine
// Modify transparency (0=opaque, 100=invisible)
myColor = color.new(color.red, 80)

// From RGB values (0-255)
myColor = color.rgb(255, 100, 50, 20)  // Last param = transparency

// Gradient based on value
myColor = color.from_gradient(rsi, 30, 70, color.red, color.green)

// Extract components
r = color.r(myColor)
g = color.g(myColor)
b = color.b(myColor)
t = color.t(myColor)
```

### Dynamic Colors

```pine
// Conditional color
lineColor = close > open ? color.green : color.red

// Color based on intensity
intensity = math.min(100, rsi)
dynamicColor = color.from_gradient(intensity, 0, 100, color.green, color.red)
```

## Common Visual Patterns

### Signal Markers

```pine
buySignal = ta.crossover(shortMA, longMA)
sellSignal = ta.crossunder(shortMA, longMA)

plotshape(buySignal, "Buy", shape.triangleup, location.belowbar, color.green, size=size.small)
plotshape(sellSignal, "Sell", shape.triangledown, location.abovebar, color.red, size=size.small)
```

### Zone Highlighting

```pine
inBullZone = close > ta.sma(close, 200)
bgcolor(inBullZone ? color.new(color.green, 90) : color.new(color.red, 90))
```

### Trend Channel

```pine
upperBand = ta.sma(high, 20)
lowerBand = ta.sma(low, 20)

p1 = plot(upperBand, "Upper", color.blue)
p2 = plot(lowerBand, "Lower", color.blue)
fill(p1, p2, color.new(color.blue, 85))
```

### Support/Resistance Lines

```pine
var float support = na
var line supportLine = na

pivotLow = ta.pivotlow(low, 5, 5)
if not na(pivotLow)
    support := pivotLow
    if not na(supportLine)
        line.delete(supportLine)
    supportLine := line.new(bar_index - 5, support, bar_index, support, 
                           extend=extend.right, color=color.green, style=line.style_dashed)
```

## Drawing Limits

Scripts have limits on the number of drawing objects they can display.

| Object Type | Default Limit | Maximum Limit |
|-------------|---------------|---------------|
| Lines       | ~50           | 500           |
| Boxes       | ~50           | 500           |
| Labels      | ~50           | 500           |
| Polylines   | ~50           | 100           |

Set limits in `indicator()` or `strategy()`:
```pine
indicator("My Script", max_lines_count = 500, max_labels_count = 500, max_boxes_count = 500, max_polylines_count = 100)
```

## Conditional Plotting

Since `plot()` cannot be used inside `if` blocks, use `na` to control visibility.

```pine
// Plot only when RSI is above 70
plot(rsi > 70 ? rsi : na, color=color.red, style=plot.style_circles)

// Change color conditionally
plot(close, color = close > open ? color.green : color.red)

// Hide plot by setting color to na
plot(close, color = hidePlot ? na : color.blue)
```

## Horizontal Levels (hline)

### Basic hline
```pine
// Fixed horizontal line at a price level
// NOTE: price must be input (not series)
hline(50, "Midline", color.gray)
hline(70, "Overbought", color.red, hline.style_dashed)
hline(30, "Oversold", color.green, hline.style_dashed)
```

### hline Parameters
```pine
hline(price, title, color, linestyle, linewidth, editable, display) → hline
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `price` | input int/float | Price level (NOT series!) |
| `title` | const string | Display name |
| `color` | input color | Line color (NOT series!) |
| `linestyle` | hline.style_* | solid/dotted/dashed |
| `linewidth` | input int | Line thickness |

### Line Styles
```pine
hline.style_solid   // ─────────
hline.style_dotted  // ···········
hline.style_dashed  // - - - - - -
```

### Filling Between Levels
```pine
// Create hlines and capture references
h1 = hline(70, "Upper", color.red)
h2 = hline(30, "Lower", color.green)

// Fill the space between them
fill(h1, h2, color.new(color.gray, 90), "Band")
```

### Common Pattern: Oscillator Bands
```pine
//@version=6
indicator("RSI with Bands")
rsiVal = ta.rsi(close, 14)

// Plot RSI
plot(rsiVal, "RSI", color.purple)

// Add reference levels
upper = hline(70, "Overbought", color.red, hline.style_dashed)
lower = hline(30, "Oversold", color.green, hline.style_dashed)
mid = hline(50, "Midline", color.gray, hline.style_dotted)

// Fill overbought/oversold zones
fill(upper, hline(100), color.new(color.red, 90))
fill(lower, hline(0), color.new(color.green, 90))
```

### Limitations
- `price` must be `input` type (cannot change per bar)
- `color` must be `input` type (cannot be dynamic)
- Use `line.new()` if you need series-based horizontal lines
