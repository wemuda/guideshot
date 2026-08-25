import { describe, expect, it } from 'vitest';

import {
  AnnotationPlacementError,
  connectorPoints,
  placeAnnotations,
  placementCandidates,
  rectsOverlap,
} from '../src/placement.js';

describe('placement', () => {
  it('places annotations in deterministic id order', () => {
    const requests = [
      {
        id: 'second',
        target: { x: 170, y: 120, width: 60, height: 40 },
        size: { width: 90, height: 36 },
      },
      {
        id: 'first',
        target: { x: 170, y: 120, width: 60, height: 40 },
        size: { width: 90, height: 36 },
      },
    ];

    const placed = placeAnnotations(requests, { width: 420, height: 300 });

    expect(placed.map(({ id }) => id)).toEqual(['first', 'second']);
    expect(placed[0]?.side).toBe('right');
    expect(placed[1]?.side).toBe('left');
    expect(rectsOverlap(placed[0]!.rect, placed[1]!.rect)).toBe(false);
  });

  it('uses a fixed direction-aware candidate order', () => {
    const request = {
      id: 'callout',
      target: { x: 100, y: 100, width: 50, height: 30 },
      size: { width: 80, height: 40 },
    };

    expect(
      placementCandidates(request, 'ltr').map(
        ({ side, align }) => `${side}:${align}`,
      ),
    ).toEqual([
      'right:center',
      'right:start',
      'right:end',
      'left:center',
      'left:start',
      'left:end',
      'bottom:center',
      'bottom:start',
      'bottom:end',
      'top:center',
      'top:start',
      'top:end',
    ]);
    expect(placementCandidates(request, 'rtl')[0]?.side).toBe('left');
  });

  it('avoids explicit obstacles and previously occupied boxes', () => {
    const target = { x: 150, y: 110, width: 60, height: 40 };
    const [placed] = placeAnnotations(
      [{ id: 'callout', target, size: { width: 80, height: 40 } }],
      { width: 400, height: 260 },
      { obstacles: [{ x: 226, y: 100, width: 100, height: 80 }] },
    );

    expect(placed?.side).toBe('left');
  });

  it('fails instead of emitting an overlapping fallback', () => {
    expect(() =>
      placeAnnotations(
        [
          {
            id: 'too-large',
            target: { x: 40, y: 40, width: 20, height: 20 },
            size: { width: 200, height: 100 },
          },
        ],
        { width: 120, height: 100 },
      ),
    ).toThrow(AnnotationPlacementError);
  });

  it('connects from the nearest box edge to the target edge', () => {
    expect(
      connectorPoints(
        {
          id: 'callout',
          side: 'right',
          align: 'center',
          rect: { x: 200, y: 80, width: 100, height: 60 },
        },
        { x: 120, y: 90, width: 40, height: 30 },
      ),
    ).toEqual({
      start: { x: 200, y: 105 },
      end: { x: 160, y: 105 },
    });
  });
});
