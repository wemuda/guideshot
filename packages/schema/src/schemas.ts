import { Type, type Static } from '@sinclair/typebox';

export const SCHEMA_VERSION = 1 as const;
export const JSON_SCHEMA_DIALECT =
  'https://json-schema.org/draft/2020-12/schema' as const;

const StrictObjectOptions = { additionalProperties: false } as const;
const NonEmptyStringSchema = Type.String({ minLength: 1 });
const IdentifierSchema = Type.String({
  minLength: 1,
  pattern: '^[a-z0-9](?:[a-z0-9._:-]*[a-z0-9])?$',
});
const TargetSchema = NonEmptyStringSchema;

const createJsonValueSchema = ($id: string) =>
  Type.Recursive(
    (JsonValue) =>
      Type.Union([
        Type.Null(),
        Type.Boolean(),
        Type.Number(),
        Type.String(),
        Type.Array(JsonValue),
        Type.Record(Type.String(), JsonValue),
      ]),
    { $id },
  );

export const JsonValueSchema = createJsonValueSchema(
  'https://guideshot.dev.wemuda.com/schemas/json-value.v1.json',
);
export type JsonValue = Static<typeof JsonValueSchema>;

export const JsonObjectSchema = Type.Record(Type.String(), JsonValueSchema);
export type JsonObject = Static<typeof JsonObjectSchema>;

const ScenarioJsonObjectSchema = Type.Record(
  Type.String(),
  createJsonValueSchema('scenario-json-value'),
);
const MessageArgumentSchema = Type.Union([
  Type.Null(),
  Type.Boolean(),
  Type.Number(),
  Type.String(),
]);

export const VariantValueSchema = Type.Union([
  Type.String(),
  Type.Number(),
  Type.Boolean(),
]);
export type VariantValue = Static<typeof VariantValueSchema>;

const MessageReferenceSchema = Type.Object(
  {
    message: NonEmptyStringSchema,
    args: Type.Optional(Type.Record(Type.String(), MessageArgumentSchema)),
  },
  StrictObjectOptions,
);

const LocaleMapSchema = Type.Record(
  Type.String({ pattern: '^[a-z]{2,3}(?:-[A-Za-z0-9]+)*$' }),
  NonEmptyStringSchema,
  { additionalProperties: false, minProperties: 1 },
);

export const LocalizedTextSchema = Type.Union([
  NonEmptyStringSchema,
  MessageReferenceSchema,
  LocaleMapSchema,
]);
export type LocalizedText = Static<typeof LocalizedTextSchema>;

const TargetActionSchema = <T extends string>(action: T) =>
  Type.Object(
    {
      do: Type.Literal(action),
      target: TargetSchema,
    },
    StrictObjectOptions,
  );

const ClickActionSchema = TargetActionSchema('click');
const ClearActionSchema = TargetActionSchema('clear');
const CheckActionSchema = TargetActionSchema('check');
const UncheckActionSchema = TargetActionSchema('uncheck');
const HoverActionSchema = TargetActionSchema('hover');
const FocusActionSchema = TargetActionSchema('focus');

const FillActionSchema = Type.Object(
  {
    do: Type.Literal('fill'),
    target: TargetSchema,
    value: LocalizedTextSchema,
  },
  StrictObjectOptions,
);

const PressActionSchema = Type.Object(
  {
    do: Type.Literal('press'),
    target: TargetSchema,
    key: NonEmptyStringSchema,
  },
  StrictObjectOptions,
);

const SelectActionSchema = Type.Object(
  {
    do: Type.Literal('select'),
    target: TargetSchema,
    value: Type.Union([
      NonEmptyStringSchema,
      Type.Array(NonEmptyStringSchema, { minItems: 1, uniqueItems: true }),
    ]),
  },
  StrictObjectOptions,
);

const ScrollActionSchema = Type.Object(
  {
    do: Type.Literal('scroll'),
    target: TargetSchema,
    block: Type.Optional(
      Type.Union([
        Type.Literal('start'),
        Type.Literal('center'),
        Type.Literal('end'),
        Type.Literal('nearest'),
      ]),
    ),
    inline: Type.Optional(
      Type.Union([
        Type.Literal('start'),
        Type.Literal('center'),
        Type.Literal('end'),
        Type.Literal('nearest'),
      ]),
    ),
  },
  StrictObjectOptions,
);

const UploadActionSchema = Type.Object(
  {
    do: Type.Literal('upload'),
    target: TargetSchema,
    files: Type.Array(NonEmptyStringSchema, { minItems: 1 }),
  },
  StrictObjectOptions,
);

const DragActionSchema = Type.Object(
  {
    do: Type.Literal('drag'),
    target: TargetSchema,
    to: TargetSchema,
  },
  StrictObjectOptions,
);

const WaitForActionSchema = Type.Object(
  {
    do: Type.Literal('waitFor'),
    target: TargetSchema,
    state: Type.Union([
      Type.Literal('visible'),
      Type.Literal('hidden'),
      Type.Literal('attached'),
      Type.Literal('detached'),
      Type.Literal('enabled'),
    ]),
  },
  StrictObjectOptions,
);

export const ActionSchema = Type.Union([
  ClickActionSchema,
  FillActionSchema,
  ClearActionSchema,
  PressActionSchema,
  SelectActionSchema,
  CheckActionSchema,
  UncheckActionSchema,
  HoverActionSchema,
  FocusActionSchema,
  ScrollActionSchema,
  UploadActionSchema,
  DragActionSchema,
  WaitForActionSchema,
]);
export type Action = Static<typeof ActionSchema>;

const TargetExpectationSchema = <T extends string>(expectation: T) =>
  Type.Object(
    {
      expect: Type.Literal(expectation),
      target: TargetSchema,
    },
    StrictObjectOptions,
  );

const VisibleExpectationSchema = TargetExpectationSchema('visible');
const HiddenExpectationSchema = TargetExpectationSchema('hidden');
const AbsentExpectationSchema = TargetExpectationSchema('absent');
const EnabledExpectationSchema = TargetExpectationSchema('enabled');
const DisabledExpectationSchema = TargetExpectationSchema('disabled');
const CheckedExpectationSchema = TargetExpectationSchema('checked');
const EditableExpectationSchema = TargetExpectationSchema('editable');

const TextExpectationSchema = Type.Object(
  {
    expect: Type.Literal('text'),
    target: TargetSchema,
    value: LocalizedTextSchema,
  },
  StrictObjectOptions,
);

const ValueExpectationSchema = Type.Object(
  {
    expect: Type.Literal('value'),
    target: TargetSchema,
    value: LocalizedTextSchema,
  },
  StrictObjectOptions,
);

const AttributeExpectationSchema = Type.Object(
  {
    expect: Type.Literal('attribute'),
    target: TargetSchema,
    name: NonEmptyStringSchema,
    value: NonEmptyStringSchema,
  },
  StrictObjectOptions,
);

const CountExpectationSchema = Type.Object(
  {
    expect: Type.Literal('count'),
    target: TargetSchema,
    count: Type.Integer({ minimum: 0 }),
  },
  StrictObjectOptions,
);

const UrlExpectationSchema = Type.Object(
  {
    expect: Type.Literal('url'),
    value: NonEmptyStringSchema,
  },
  StrictObjectOptions,
);

const RouteExpectationSchema = Type.Object(
  {
    expect: Type.Literal('route'),
    path: Type.String({ minLength: 1, pattern: '^/' }),
  },
  StrictObjectOptions,
);

export const ExpectationSchema = Type.Union([
  VisibleExpectationSchema,
  HiddenExpectationSchema,
  AbsentExpectationSchema,
  EnabledExpectationSchema,
  DisabledExpectationSchema,
  CheckedExpectationSchema,
  EditableExpectationSchema,
  TextExpectationSchema,
  ValueExpectationSchema,
  AttributeExpectationSchema,
  CountExpectationSchema,
  UrlExpectationSchema,
  RouteExpectationSchema,
]);
export type Expectation = Static<typeof ExpectationSchema>;

const PaddingSchema = Type.Union([
  Type.Number({ minimum: 0 }),
  Type.Object(
    {
      top: Type.Number({ minimum: 0 }),
      right: Type.Number({ minimum: 0 }),
      bottom: Type.Number({ minimum: 0 }),
      left: Type.Number({ minimum: 0 }),
    },
    StrictObjectOptions,
  ),
]);

const AspectRatioSchema = Type.String({ pattern: '^[1-9][0-9]*:[1-9][0-9]*$' });
const FitSchema = Type.Union([
  Type.Literal('expand'),
  Type.Literal('contain'),
  Type.Literal('cover'),
  Type.Literal('crop'),
]);

const ViewportFrameSchema = Type.Object(
  { kind: Type.Literal('viewport') },
  StrictObjectOptions,
);
const PageFrameSchema = Type.Object(
  { kind: Type.Literal('page') },
  StrictObjectOptions,
);
const TargetFrameSchema = Type.Object(
  {
    target: TargetSchema,
    padding: Type.Optional(PaddingSchema),
    aspectRatio: Type.Optional(AspectRatioSchema),
    fit: Type.Optional(FitSchema),
  },
  StrictObjectOptions,
);
const AroundFrameSchema = Type.Object(
  {
    around: Type.Array(TargetSchema, { minItems: 1, uniqueItems: true }),
    padding: Type.Optional(PaddingSchema),
    aspectRatio: Type.Optional(AspectRatioSchema),
    fit: Type.Optional(FitSchema),
  },
  StrictObjectOptions,
);
const RegionFrameSchema = Type.Object(
  {
    region: Type.Object(
      {
        x: Type.Number({ minimum: 0 }),
        y: Type.Number({ minimum: 0 }),
        width: Type.Number({ exclusiveMinimum: 0 }),
        height: Type.Number({ exclusiveMinimum: 0 }),
      },
      StrictObjectOptions,
    ),
    padding: Type.Optional(PaddingSchema),
    aspectRatio: Type.Optional(AspectRatioSchema),
    fit: Type.Optional(FitSchema),
  },
  StrictObjectOptions,
);

export const FrameSchema = Type.Union([
  ViewportFrameSchema,
  PageFrameSchema,
  TargetFrameSchema,
  AroundFrameSchema,
  RegionFrameSchema,
]);
export type Frame = Static<typeof FrameSchema>;

export const AnnotationPlacementSchema = Type.Object(
  {
    side: Type.Optional(
      Type.Union([
        Type.Literal('auto'),
        Type.Literal('top'),
        Type.Literal('right'),
        Type.Literal('bottom'),
        Type.Literal('left'),
      ]),
    ),
    align: Type.Optional(
      Type.Union([
        Type.Literal('start'),
        Type.Literal('center'),
        Type.Literal('end'),
      ]),
    ),
    offset: Type.Optional(Type.Number({ minimum: 0 })),
    nudge: Type.Optional(
      Type.Object(
        {
          x: Type.Number(),
          y: Type.Number(),
        },
        StrictObjectOptions,
      ),
    ),
  },
  StrictObjectOptions,
);
export type AnnotationPlacement = Static<typeof AnnotationPlacementSchema>;

const ConnectorSchema = Type.Object(
  {
    kind: Type.Literal('arrow'),
    anchor: Type.Optional(
      Type.Union([Type.Literal('center'), Type.Literal('edge')]),
    ),
  },
  StrictObjectOptions,
);

const EmphasisSchema = Type.Object(
  {
    kind: Type.Union([Type.Literal('spotlight'), Type.Literal('outline')]),
    padding: Type.Optional(Type.Number({ minimum: 0 })),
  },
  StrictObjectOptions,
);

const CalloutAnnotationSchema = Type.Object(
  {
    id: IdentifierSchema,
    kind: Type.Literal('callout'),
    target: TargetSchema,
    content: LocalizedTextSchema,
    placement: Type.Optional(AnnotationPlacementSchema),
    connector: Type.Optional(ConnectorSchema),
    emphasis: Type.Optional(EmphasisSchema),
  },
  StrictObjectOptions,
);

const ArrowAnnotationSchema = Type.Object(
  {
    id: IdentifierSchema,
    kind: Type.Literal('arrow'),
    target: TargetSchema,
    placement: Type.Optional(AnnotationPlacementSchema),
  },
  StrictObjectOptions,
);

const SpotlightAnnotationSchema = Type.Object(
  {
    id: IdentifierSchema,
    kind: Type.Literal('spotlight'),
    target: TargetSchema,
    padding: Type.Optional(Type.Number({ minimum: 0 })),
  },
  StrictObjectOptions,
);

const OutlineAnnotationSchema = Type.Object(
  {
    id: IdentifierSchema,
    kind: Type.Literal('outline'),
    target: TargetSchema,
    padding: Type.Optional(Type.Number({ minimum: 0 })),
  },
  StrictObjectOptions,
);

const MarkerAnnotationSchema = Type.Object(
  {
    id: IdentifierSchema,
    kind: Type.Literal('marker'),
    target: TargetSchema,
    content: Type.Optional(LocalizedTextSchema),
    placement: Type.Optional(AnnotationPlacementSchema),
  },
  StrictObjectOptions,
);

const LabelAnnotationSchema = Type.Object(
  {
    id: IdentifierSchema,
    kind: Type.Literal('label'),
    target: TargetSchema,
    content: LocalizedTextSchema,
    placement: Type.Optional(AnnotationPlacementSchema),
  },
  StrictObjectOptions,
);

const RedactionAnnotationSchema = Type.Object(
  {
    id: IdentifierSchema,
    kind: Type.Literal('redaction'),
    target: TargetSchema,
    padding: Type.Optional(Type.Number({ minimum: 0 })),
  },
  StrictObjectOptions,
);

export const AnnotationSchema = Type.Union([
  CalloutAnnotationSchema,
  ArrowAnnotationSchema,
  SpotlightAnnotationSchema,
  OutlineAnnotationSchema,
  MarkerAnnotationSchema,
  LabelAnnotationSchema,
  RedactionAnnotationSchema,
]);
export type Annotation = Static<typeof AnnotationSchema>;

const MatrixSelectionSchema = Type.Record(Type.String(), VariantValueSchema, {
  minProperties: 1,
});

export const MatrixSchema = Type.Object(
  {
    dimensions: Type.Record(
      IdentifierSchema,
      Type.Array(VariantValueSchema, { minItems: 1, uniqueItems: true }),
      { minProperties: 1 },
    ),
    include: Type.Optional(Type.Array(MatrixSelectionSchema)),
    exclude: Type.Optional(Type.Array(MatrixSelectionSchema)),
  },
  StrictObjectOptions,
);
export type Matrix = Static<typeof MatrixSchema>;

const ScenarioSchema = Type.Object(
  {
    use: IdentifierSchema,
    with: Type.Optional(ScenarioJsonObjectSchema),
  },
  StrictObjectOptions,
);

const PageSchema = Type.Object(
  {
    path: Type.String({ minLength: 1, pattern: '^/' }),
  },
  StrictObjectOptions,
);

const CaptureSchema = Type.Object(
  {
    frame: Type.Optional(FrameSchema),
    pixelRatio: Type.Optional(Type.Number({ minimum: 1, maximum: 4 })),
    stability: Type.Optional(
      Type.Union([Type.Literal('documentation'), Type.Literal('balanced')]),
    ),
  },
  StrictObjectOptions,
);

export const AccessibilitySchema = Type.Union([
  Type.Object({ alt: LocalizedTextSchema }, StrictObjectOptions),
  Type.Object({ decorative: Type.Literal(true) }, StrictObjectOptions),
]);
export type Accessibility = Static<typeof AccessibilitySchema>;

export const OutputFormatSchema = Type.Union([
  Type.Literal('png'),
  Type.Literal('webp'),
]);
export type OutputFormat = Static<typeof OutputFormatSchema>;

export const OutputSchema = Type.Object(
  {
    formats: Type.Optional(
      Type.Array(OutputFormatSchema, {
        minItems: 1,
        maxItems: 1,
        uniqueItems: true,
      }),
    ),
    width: Type.Optional(Type.Integer({ minimum: 1 })),
    height: Type.Optional(Type.Integer({ minimum: 1 })),
    quality: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
  },
  StrictObjectOptions,
);
export type Output = Static<typeof OutputSchema>;

export const RecipeSchema = Type.Object(
  {
    $schema: Type.Optional(NonEmptyStringSchema),
    version: Type.Literal(SCHEMA_VERSION),
    id: IdentifierSchema,
    title: Type.Optional(NonEmptyStringSchema),
    description: Type.Optional(NonEmptyStringSchema),
    tags: Type.Optional(Type.Array(IdentifierSchema, { uniqueItems: true })),
    profile: Type.Optional(IdentifierSchema),
    scenario: Type.Optional(ScenarioSchema),
    page: PageSchema,
    matrix: Type.Optional(MatrixSchema),
    prepare: Type.Optional(Type.Array(ActionSchema)),
    ready: Type.Optional(Type.Array(ExpectationSchema)),
    capture: Type.Optional(CaptureSchema),
    annotations: Type.Optional(Type.Array(AnnotationSchema, { minItems: 1 })),
    accessibility: AccessibilitySchema,
    output: Type.Optional(OutputSchema),
  },
  {
    $schema: JSON_SCHEMA_DIALECT,
    $id: 'https://guideshot.dev.wemuda.com/schemas/recipe.v1.json',
    additionalProperties: false,
    title: 'GuideShot recipe',
  },
);
export type Recipe = Static<typeof RecipeSchema>;

export const ManifestVariantSchema = Type.Object(
  {
    src: NonEmptyStringSchema,
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    format: OutputFormatSchema,
    hash: NonEmptyStringSchema,
    alt: Type.String(),
  },
  StrictObjectOptions,
);
export type ManifestVariant = Static<typeof ManifestVariantSchema>;

export const ManifestEntrySchema = Type.Object(
  {
    id: IdentifierSchema,
    title: Type.Optional(NonEmptyStringSchema),
    variants: Type.Record(NonEmptyStringSchema, ManifestVariantSchema, {
      minProperties: 1,
    }),
  },
  StrictObjectOptions,
);
export type ManifestEntry = Static<typeof ManifestEntrySchema>;

export const PublicManifestSchema = Type.Object(
  {
    version: Type.Literal(SCHEMA_VERSION),
    entries: Type.Array(ManifestEntrySchema),
  },
  {
    $schema: JSON_SCHEMA_DIALECT,
    $id: 'https://guideshot.dev.wemuda.com/schemas/manifest.v1.json',
    additionalProperties: false,
    title: 'GuideShot public manifest',
  },
);
export type PublicManifest = Static<typeof PublicManifestSchema>;

export const schemas = {
  recipe: RecipeSchema,
  publicManifest: PublicManifestSchema,
} as const;
