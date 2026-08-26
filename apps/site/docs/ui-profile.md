# GuideShot site UI profile

## User job

Understand GuideShot, see one real connected guide immediately, install it,
and continue to documentation or examples without entering a separate demo
experience.

## Surface contract

- The homepage is a short developer-library landing page, not an app shell.
- The selected reference in `apps/site/design/reference-homepage.png` is the
  canonical source for homepage hierarchy, density, and carousel composition.
- `@guideshot/ui` is the sole source of tokens, generic icons, primitives,
  theme behavior, and accessibility contracts.
- GuideShot application code owns navigation, translated copy, the connected
  release workflow, generated-image selection, carousel state, and package
  documentation.
- The app shell components remain available for product surfaces but are not
  used on the public landing page.

## Information order

1. What GuideShot is and the problem it solves.
2. Copyable installation command.
3. A live, connected three-step guide carousel.
4. Minimal footer navigation.

Docs and Examples are separate routes. They retain the same header, tokens,
and focused content widths while allowing denser technical content.

## Responsive contract

At desktop widths, all three guide steps remain visible with the active step
dominant. At 390px and the 320px reflow boundary, one active step is shown,
controls remain reachable, and no required content creates page-level
horizontal scrolling.
