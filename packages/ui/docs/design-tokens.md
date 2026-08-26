# Design tokens

`src/styles/globals.css` is the canonical visual source of truth. It preserves
the proven Infood token contract and maps its literal values into Tailwind CSS
4 utilities. Every GuideShot surface consumes the same stylesheet and must not
redefine these values locally.

Geist is the only interface family and Geist Mono is the only monospace family. Use weights 400, 500, and 600. The shared type utilities encode the fixed scale: `text-page-title`, `text-card-title`, `text-body`, `text-cell`, `text-control`, `text-caption`, `text-column`, and `text-eyebrow`.

## Color contract

| Semantic token | Use |
| --- | --- |
| `background` / `foreground` | `#FAFAFA` app canvas and `#17171A` primary text |
| `card` / `card-foreground` | Contained content surfaces |
| `popover` / `popover-foreground` | Floating surfaces |
| `primary` / `primary-foreground` | `#1063CF` action blue and white action text |
| `secondary` / `secondary-foreground` | Supporting actions and emphasis |
| `muted` / `muted-foreground` | Subdued surfaces and supporting text |
| `accent` / `accent-foreground` | `#F1F1F4` neutral hover and active navigation fill |
| `destructive` | Errors and destructive actions |
| `success` | Confirmed positive state |
| `warning` | State that needs attention |
| `info` | Neutral informational state |
| `field-edited` | Manually changed field state |
| `value-product` | Value resolved from the product |
| `value-estimated` | Estimated or inferred value |
| `value-supplier-product` | Value resolved from a supplier product |
| `border`, `input`, `ring` | Boundaries, form controls, and focus |
| `chart-1` through `chart-14` | Ordered categorical data series |
| `sidebar-*` | Shared shell and navigation surfaces |

Use the semantic utility, not its current value:

```tsx
<div className="border-border bg-card text-card-foreground" />
<div className="bg-success/10 text-success" />
```

Do not use a chart token for status, encode state with `primary`, or add a raw color when a semantic token already exists. Status must also have text or an icon; color alone is not sufficient.

## Literal shell contract

| Concern | Token and value |
| --- | --- |
| Actions | `--accent: #1063CF`, `--accent-hover: #0B4FA6`, `--accent-soft: #EFF5FE` |
| Surfaces | `--surface: #FFFFFF`, `--canvas: #FAFAFA`, `--sidebar: var(--surface)` |
| Boundaries | card `#E8E8EC`, separator `#F0F0F3`, line `#EAEAEE`, control `#E4E4E9` |
| Fills | hover `#F1F1F4`, segmented `#F2F2F5`, table/search `#FBFBFC` |
| Text | primary `#17171A`, secondary `#55555E`, label `#6B6B73`, meta `#8E8E96`, faint `#9A9AA2`, glyph `#C7C7CE` |
| Status | success `#1E874B`, warning `#B4761B`, danger `#C0392B`, notification `#E0603C` |
| Density | row `44px`, card padding `16px`, content gap `14px` |
| Radii | frame `14px`, overlay `12px`, card `10px`, control `8px`, chip `6px`, pill `999px` |

Admin purple `#6D3BF5` and Data Core teal `#0E8A7D` are identity marks only. They must not color buttons, links, focus rings, active navigation, or charts. Cards are flat and bordered. Only floating layers use `shadow-floating`.

## Theme contract

GuideShot surfaces wrap their roots with the shared `ThemeProvider`. The
provider applies `light` or `dark` to the document root,
persists the explicit user choice under `guideshot-ui-theme`, and follows
`prefers-color-scheme` when set to `system`. Applications must use semantic
tokens so both palettes remain complete; do not add page-specific theme state
or raw light-only colors.

The user menu renders the shared `ThemeSelector` with light, dark, and system tabs. Keep the selector connected to the root provider rather than duplicating theme state in the sidebar.

The provider resolves stored or system theme before the first
stylesheet-driven paint. A default light canvas before a dark surface is a
regression; do not introduce page-specific theme state.

## Data visualization

The 14 chart tokens provide an ordered categorical palette for existing charts. Product identity colors are not chart colors.

Use `chartColors` or `getChartColor(index)` when a chart library needs a JavaScript color value:

```tsx
import { getChartColor } from '@guideshot/ui'

const color = getChartColor(seriesIndex)
```

The order is categorical, not a scale from good to bad. Always include labels, legends, direct values, patterns, or another non-color distinction when users must identify a series. Sequential and diverging metrics need a component-specific, documented scale rather than an arbitrary slice of this palette.

## Component rules

| Concern | Canonical rule |
| --- | --- |
| Typography | Use Geist semantic type utilities and weights 400, 500, or 600. |
| Spacing | Use flex or grid `gap`; content scroll padding is `18px 20px 26px`. |
| Radius | Use the fixed radius hierarchy; do not round values to a nearby Tailwind default. |
| Elevation | Cards use no shadow. Popovers use `shadow-floating`. |
| Motion | Color uses 140–160ms ease; size and disclosure use 180–240ms `cubic-bezier(.22,1,.36,1)`. |

Motion must preserve meaning when disabled. Add `motion-reduce:duration-0` to non-essential transitions and never make animation the only indication of state.

## Application adoption

The GuideShot site compiles Tailwind CSS 4 and imports the canonical stylesheet
through one application pipeline. Do not copy shared values into an
application theme, add a second unprefixed Tailwind compiler, or import
`globals.css` into an incompatible pipeline.
