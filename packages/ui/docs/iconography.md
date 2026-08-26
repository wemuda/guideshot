# Iconography

Hugeicons Free Stroke Rounded is the only generic interface icon family. Every
frontend package must use the same `@hugeicons/core-free-icons` dependency range
as `@guideshot/ui` and render its named icon data through the shared `Icon`.

## Visual contract

`Icon` owns the complete generic icon rendering contract:

- rounded stroke icon data from `@hugeicons/core-free-icons`;
- `currentColor`, controlled with semantic `text-*` utilities;
- a fixed stroke width of `1.5`;
- supported sizes of 12, 16, 18, 20, and 24 pixels.

The stroke width is intentionally not a prop. Do not apply `stroke-*` or
`fill-*` utilities, inline SVG paint styles, descendant selectors, or
application CSS to change an icon's weight. `fill="currentColor"` is the only
fill exception and is reserved for a selected, favorite, or primary state where
the filled shape carries meaning. Do not alias the icon-data package or mix
package majors. Older icon-data releases can contain filled path geometry; a
renderer stroke-width prop cannot turn that geometry into the rounded stroke
family.

Use semantic text color when an icon communicates state:

```tsx
<Icon icon={Alert02Icon} className="text-warning" />
```

Brand marks, illustrations, charts, and other purpose-built graphics are not
generic interface icons. Keep them in dedicated components instead of weakening
the shared `Icon` contract with weight or fill variants.

Domain state marks also stay in dedicated application components when their
filled and outlined treatments carry established meaning. Infood Web's
standard-product/basisvare state must use its `StandardMark` component: filled
for a standard product and outlined for a non-standard product. Do not replace
it with a generic check, badge icon, text badge, or one-off SVG. See the
[Infood Web UI profile](../../infood-web/docs/ui-profile.md) for the application
contract.

```tsx
import { Search01Icon } from '@hugeicons/core-free-icons'
import { Icon } from '@guideshot/ui/components/icon'

<Icon icon={Search01Icon} />
```

The default 16-pixel icon fits controls. Use 12 for dense supporting UI, 18 for
sidebar navigation, 20 for prominent controls, and 24 for large state
affordances. The surrounding button or link owns its hit target.

## Accessibility

Icons are decorative by default. A control must carry its own accessible name:

```tsx
<button type="button" aria-label="Search">
  <Icon icon={Search01Icon} />
</button>
```

When an icon conveys meaning without adjacent text, opt in to an image role and provide a translated label:

```tsx
<Icon icon={Search01Icon} decorative={false} label="Search" />
```

Do not rely on an icon alone for critical actions or status. Pair it with visible text where meaning is not universal.

## Selection and ownership

- Import named icons so bundlers can tree-shake unused assets.
- Keep `currentColor`; use semantic text utilities to set color.
- Use one icon metaphor consistently for the same action.
- Render icons through the shared `Icon`; do not use `HugeiconsIcon` directly outside that primitive.
- Applications must not depend on or import Lucide or Font Awesome.
- Admin, Data Core, and Infood Web render generic icons through the shared `Icon` primitive.
- Route, module, food-category, and other domain icon maps remain application-owned.

Data-table filter controls use semantic field icons rather than typography or data-type glyphs. Text filters fall back to `Search01Icon`; when a field has a clear concept, applications set `column.meta.filterIcon` to the relevant domain icon.

`pnpm check:ui-boundaries` enforces the canonical dependency, renderer boundary,
and absence of consumer-level weight and fill overrides. Run it whenever icon
imports, the shared `Icon`, or frontend visual CSS changes.
