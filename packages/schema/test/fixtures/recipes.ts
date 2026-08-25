import type { Recipe } from '../../src/index.js';

export const minimalRecipe = {
  version: 1,
  id: 'pilot.sign-in',
  page: { path: '/demo/sign-in' },
  accessibility: {
    alt: 'The demo sign-in form.',
  },
} satisfies Recipe;

export const fullRecipe = {
  $schema: '../.guideshot/project.schema.json',
  version: 1,
  id: 'pilot.recipes.create',
  title: 'Create a recipe',
  description: 'Open the recipe dialog and enter a stable name.',
  tags: ['pilot', 'recipes'],
  profile: 'guide.desktop',
  scenario: {
    use: 'pilot:authenticated',
    with: {
      organization: 'docs-workspace',
      permissions: ['recipes:write'],
      flags: { newRecipeDialog: true },
    },
  },
  page: {
    path: '/demo/recipes/${scenario.recipeId}',
  },
  matrix: {
    dimensions: {
      locale: ['en', 'da', 'nb'],
      theme: ['light', 'dark'],
      density: [1, 2],
      review: [true],
    },
    include: [{ locale: 'en', theme: 'dark' }],
    exclude: [{ locale: 'nb', theme: 'dark', density: 2 }],
  },
  prepare: [
    { do: 'click', target: 'recipes.create' },
    {
      do: 'fill',
      target: 'recipe.name',
      value: {
        message: 'guides.recipes.exampleName',
        args: { number: 1 },
      },
    },
    { do: 'press', target: 'recipe.name', key: 'Tab' },
    { do: 'select', target: 'recipe.locale', value: ['en', 'da'] },
    { do: 'check', target: 'recipe.annotated' },
    { do: 'uncheck', target: 'recipe.draft' },
    { do: 'hover', target: 'recipe.preview' },
    { do: 'focus', target: 'recipe.path' },
    {
      do: 'scroll',
      target: 'recipe.form',
      block: 'center',
      inline: 'nearest',
    },
    { do: 'upload', target: 'recipe.logo', files: ['fixtures/logo.png'] },
    { do: 'drag', target: 'recipe.card', to: 'recipe.archive' },
    { do: 'waitFor', target: 'recipe.form', state: 'visible' },
    { do: 'clear', target: 'recipe.search' },
  ],
  ready: [
    { expect: 'visible', target: 'recipe.form' },
    { expect: 'hidden', target: 'app.loading' },
    { expect: 'absent', target: 'app.error' },
    { expect: 'enabled', target: 'recipe.save' },
    { expect: 'disabled', target: 'recipe.delete' },
    { expect: 'checked', target: 'recipe.annotated' },
    { expect: 'editable', target: 'recipe.name' },
    {
      expect: 'text',
      target: 'recipe.title',
      value: { en: 'Create recipe', da: 'Opret opskrift' },
    },
    { expect: 'value', target: 'recipe.path', value: '/demo/recipes' },
    {
      expect: 'attribute',
      target: 'recipe.form',
      name: 'data-state',
      value: 'open',
    },
    { expect: 'count', target: 'recipe.field', count: 3 },
    { expect: 'url', value: 'http://localhost:3000/demo/recipes' },
    { expect: 'route', path: '/demo/recipes' },
  ],
  capture: {
    frame: {
      around: ['recipe.form', 'recipe.preview'],
      padding: { top: 24, right: 32, bottom: 24, left: 32 },
      aspectRatio: '4:3',
      fit: 'expand',
    },
    pixelRatio: 2,
    stability: 'documentation',
  },
  annotations: [
    {
      id: 'recipe-name',
      kind: 'callout',
      target: 'recipe.name',
      content: {
        message: 'guides.recipes.enterName',
        args: { example: 'Invite a teammate' },
      },
      placement: {
        side: 'auto',
        align: 'center',
        offset: 16,
        nudge: { x: 8, y: -4 },
      },
      connector: { kind: 'arrow', anchor: 'center' },
      emphasis: { kind: 'spotlight', padding: 6 },
    },
    {
      id: 'save-arrow',
      kind: 'arrow',
      target: 'recipe.save',
      placement: { side: 'right' },
    },
    {
      id: 'form-spotlight',
      kind: 'spotlight',
      target: 'recipe.form',
      padding: 8,
    },
    {
      id: 'path-outline',
      kind: 'outline',
      target: 'recipe.path',
      padding: 4,
    },
  ],
  accessibility: {
    alt: {
      en: 'The recipe dialog with the name field highlighted.',
      da: 'Opskriftsdialogen med navnefeltet fremhævet.',
      nb: 'Oppskriftsdialogen med navnefeltet fremhevet.',
    },
  },
  output: {
    formats: ['webp'],
    width: 1280,
    height: 960,
    quality: 92,
  },
} satisfies Recipe;

export const decorativeRecipe = {
  version: 1,
  id: 'pilot.decorative-divider',
  page: { path: '/demo' },
  capture: { frame: { kind: 'viewport' } },
  accessibility: { decorative: true },
} satisfies Recipe;
