import type { PublicManifest } from '../../src/index.js';

export const publicManifest = {
  version: 1,
  entries: [
    {
      id: 'pilot.recipes.create',
      title: 'Create a recipe',
      variants: {
        'locale=da;theme=dark;viewport=desktop': {
          src: './assets/pilot.recipes.create.da.dark.desktop.a91f.webp',
          width: 1280,
          height: 960,
          format: 'webp',
          hash: 'a91f',
          alt: 'Opskriftsdialogen med navnefeltet fremhævet.',
        },
        'locale=en;theme=light;viewport=desktop': {
          src: './assets/pilot.recipes.create.en.light.desktop.f20b.png',
          width: 1280,
          height: 960,
          format: 'png',
          hash: 'f20b',
          alt: 'The recipe dialog with the name field highlighted.',
        },
      },
    },
  ],
} satisfies PublicManifest;
