# GuideShot site rebuild brief

Task mode: rebuild and feature change

User job: Understand GuideShot, experience a useful connected guide on the
homepage, install the library, and reach package documentation or examples.

Surface type: Short developer-library landing page with documentation and
example routes.

Required behavior and data: Functional copy command, three connected carousel
steps, previous and next controls, direct step selection, locale selection,
light and dark themes, generated GuideShot assets, working Docs, Examples, npm,
GitHub, and license links.

Frozen application contracts: Declarative recipes, stable targets, locale and
theme matrices, GuideShot manifest selection, package boundaries, and offline
annotation composition.

Information order: Definition, installation, live guide, footer.

Primary action: Copy the CLI installation command.

States: Light and dark themes; English, Danish, and Norwegian assets; each of
three active carousel steps; copied command feedback; missing-variant failure;
desktop, 390px, and 320px layouts.

Transient behavior: Carousel changes preserve control geometry and move the
selected step to the center on desktop. Theme and locale changes update both
controls and the generated assets. Reduced motion removes non-essential
transitions.

Narrow behavior at 390px: The active slide remains visible at full readable
width; adjacent steps become direct-selection labels below it; toolbar controls
wrap without changing semantic order.

Affected reflow at 320px: All text and controls remain available with no
page-level horizontal scrolling.

Canonical evidence: `apps/site/design/reference-homepage.png` for public
homepage hierarchy and composition. `@guideshot/ui` documents and token source
for all visual and interaction mechanics.

Unknown product decisions: None.
