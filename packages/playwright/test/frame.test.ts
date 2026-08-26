import { describe, expect, it } from 'vitest';

import {
  fitAspectRatio,
  relativeRect,
  resolveFrameRect,
  unionRects,
} from '../src/frame.js';

const documentBounds = { x: 0, y: 0, width: 1200, height: 900 };
const viewport = { x: 0, y: 120, width: 800, height: 600 };

describe('resolveFrameRect', () => {
  it('uses the current viewport by default', () => {
    expect(
      resolveFrameRect({
        document: documentBounds,
        viewport,
        targets: {},
      }),
    ).toEqual(viewport);
  });

  it('captures the whole document for page frames', () => {
    expect(
      resolveFrameRect({
        frame: { kind: 'page' },
        document: documentBounds,
        viewport,
        targets: {},
      }),
    ).toEqual(documentBounds);
  });

  it('pads and expands a target to the requested aspect ratio', () => {
    expect(
      resolveFrameRect({
        frame: {
          target: 'dialog',
          padding: 20,
          aspectRatio: '4:3',
          fit: 'expand',
        },
        document: documentBounds,
        viewport,
        targets: {
          dialog: { x: 400, y: 300, width: 200, height: 100 },
        },
      }),
    ).toEqual({ x: 380, y: 260, width: 240, height: 180 });
  });

  it('uses the union of around targets and shifts expansion inside the page', () => {
    expect(
      resolveFrameRect({
        frame: {
          around: ['left', 'right'],
          padding: { top: 10, right: 20, bottom: 10, left: 20 },
          aspectRatio: '2:1',
        },
        document: { x: 0, y: 0, width: 500, height: 300 },
        viewport: { x: 0, y: 0, width: 500, height: 300 },
        targets: {
          left: { x: 5, y: 40, width: 40, height: 40 },
          right: { x: 405, y: 80, width: 60, height: 40 },
        },
      }),
    ).toEqual({ x: 0, y: 0, width: 500, height: 250 });
  });

  it('supports explicit regions and crop fitting', () => {
    expect(
      resolveFrameRect({
        frame: {
          region: { x: 100, y: 100, width: 300, height: 300 },
          aspectRatio: '2:1',
          fit: 'crop',
        },
        document: documentBounds,
        viewport,
        targets: {},
      }),
    ).toEqual({ x: 100, y: 175, width: 300, height: 150 });
  });

  it.each([
    ['16:9', 16 / 9],
    ['4:3', 4 / 3],
    ['9:16', 9 / 16],
  ] as const)('resolves a %s target frame', (aspectRatio, ratio) => {
    const frame = resolveFrameRect({
      frame: { target: 'device', aspectRatio, fit: 'expand' },
      document: { x: 0, y: 0, width: 2000, height: 2000 },
      viewport: { x: 0, y: 0, width: 2000, height: 2000 },
      targets: {
        device: { x: 500, y: 500, width: 600, height: 600 },
      },
    });

    expect(frame.width / frame.height).toBeCloseTo(ratio, 2);
  });

  it('fails when a frame target was not measured', () => {
    expect(() =>
      resolveFrameRect({
        frame: { target: 'missing' },
        document: documentBounds,
        viewport,
        targets: {},
      }),
    ).toThrow('Frame target "missing"');
  });
});

describe('frame helpers', () => {
  it('unions rectangles deterministically', () => {
    expect(
      unionRects([
        { x: 20, y: 30, width: 40, height: 50 },
        { x: 5, y: 70, width: 20, height: 20 },
      ]),
    ).toEqual({ x: 5, y: 30, width: 55, height: 60 });
  });

  it('centers aspect fitting and frame-relative geometry', () => {
    expect(
      fitAspectRatio({ x: 10, y: 20, width: 100, height: 100 }, 2, 'expand'),
    ).toEqual({ x: -40, y: 20, width: 200, height: 100 });
    expect(
      relativeRect(
        { x: 140, y: 90, width: 20, height: 10 },
        { x: 100, y: 50, width: 200, height: 100 },
      ),
    ).toEqual({ x: 40, y: 40, width: 20, height: 10 });
  });
});
