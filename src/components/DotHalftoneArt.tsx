import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type ObjectFitMode = 'cover' | 'contain' | 'fill';

interface FillDefinition {
  // Multi-stop linear gradient only
  angleDeg?: number;
  stops: string[];
}

export interface OverlayCell {
  row: number;
  col: number;
}

interface DotHalftoneArtProps {
  src: string;
  rows: number;
  columns: number;
  cellSize: number;
  style?: React.CSSProperties;
  // Visual transform animation
  scaleFrom?: number; // e.g. 2
  scaleTo?: number; // e.g. 1
  panFrom?: { x: number; y: number }; // in UV units (0..1 space), positive moves content right/up
  panTo?: { x: number; y: number };
  objectFit?: ObjectFitMode;
  imageScale?: number; // scale the source image itself [0..1+], 0.8 = 80% size
  // Fill color base
  fill?: FillDefinition;
  // Overlay full-fill cells and color
  overlayCells?: OverlayCell[];
  overlayColor?: string; // hex
  // Secondary overlay set (e.g., endpoints) with its own color
  overlayCellsAlt?: OverlayCell[];
  overlayColorAlt?: string; // hex
  // Alt overlay: optionally darken base color instead of using a fixed color
  overlayAltDarkenBase?: boolean;
  overlayAltDarkenFactor?: number; // [0..1], 0.45 -> 45% darker
  // Tertiary overlay set (e.g., temporary city highlights) that darkens base
  overlayCellsTemp?: OverlayCell[];
  overlayTempDarkenFactor?: number; // [0..1]
  // Temp overlay fade controls
  overlayTempFadeInMs?: number;
  overlayTempFadeOutMs?: number;
  overlayTempFadeDelayMs?: number;
  // Quaternary overlay set: second temp channel (e.g., path) with its own darken factor
  overlayCellsTempB?: OverlayCell[];
  overlayTempDarkenFactorB?: number; // [0..1]
  // Dot tuning
  dotScale?: number; // scale base (image) dot radius [0..]
  minDotDiameterPx?: number; // minimum base dot diameter in pixels (applied before edge)
  binaryThreshold?: number; // [0..1] threshold of normalized radius to choose small vs large
  // Hover interaction
  hoverEnabled?: boolean;
  mouseRadius?: number; // UV units [0..1]
  mouseStrength?: number; // [0..1]
  mouseDecayTau?: number; // seconds
  mouseInfluenceMultiplier?: number; // scales hover growth
  // Hover darken strength for base fill [0..1]
  hoverDarkenStrength?: number;
  // Procedural overlay cross that follows visual transform
  overlayCrossEnabled?: boolean;
  overlayCrossCenterBase?: { x: number; y: number }; // UV in sample space pre-transform
  overlayCrossArmWidth?: number; // UV units (half-thickness)
  overlayCrossSize?: number; // UV half-extent from center
  // Overlay fade controls
  overlayFadeInMs?: number;
  overlayFadeOutMs?: number;
  overlayFadeDelayMs?: number;
  // Separate easing curves
  transformEaseScale?: (t: number) => number;
  transformEasePan?: (t: number) => number;
  transformEasePanX?: (t: number) => number;
  transformEasePanY?: (t: number) => number;
  // CSS-like cubic-bezier control points for scale/pan (x1,y1,x2,y2)
  transformBezierScale?: readonly [number, number, number, number];
  transformBezierPan?: readonly [number, number, number, number];
  transformBezierPanX?: readonly [number, number, number, number];
  transformBezierPanY?: readonly [number, number, number, number];
  // Optional per-component durations and delays (independent)
  transformDurationScaleMs?: number;
  transformDelayScaleMs?: number;
  transformDurationPanXMs?: number;
  transformDelayPanXMs?: number;
  transformDurationPanYMs?: number;
  transformDelayPanYMs?: number;
  // Radial reveal driven by dot size only
  revealEnabled?: boolean;
  revealCenterUV?: { x: number; y: number }; // in sample UV space
  revealProgress?: number; // [0..1], if omitted will animate via revealDurationMs
  revealDurationMs?: number;
  revealDelayMs?: number;
  revealFeatherCells?: number; // softness of reveal front in cells
  // Animated reveal feathering (lerp by reveal progress)
  revealFeatherCellsStart?: number;
  revealFeatherCellsEnd?: number;
  // Edge fade (dot size only)
  edgeFadeStrength?: number; // [0..1] amount to reduce radius at extreme edges
  edgeFadeFeatherCells?: number; // width of edge fade region in cells
  // Animated edge fade feathering (lerp by reveal progress)
  edgeFadeFeatherCellsStart?: number;
  edgeFadeFeatherCellsEnd?: number;
  // Easing for reveal
  revealEase?: (t: number) => number;
  revealBezier?: readonly [number, number, number, number];
  // NEW: Minimum overlay dot diameter during growth (px)
  overlayMinDotDiameterPx?: number;
  // Ripple effect around a UV center (e.g., London) triggered via start signal
  rippleEnabled?: boolean;
  rippleCenterUV?: { x: number; y: number };
  rippleDurationMs?: number;
  rippleIntensity?: number; // radius modulation in pixels at peak
  rippleFrequency?: number; // cycles per cell distance
  rippleRadiusCells?: number; // falloff radius in cells
  rippleWaveSpeed?: number; // cells per second phase advance
  rippleStartSignal?: number; // change to trigger a new ripple
  onTransformsComplete?: () => void;
  // Visual pivot for scale/pan in UV space (0..1). Defaults to center (0.5, 0.5)
  visualPivotUV?: { x: number; y: number };
  // Click callback to parent with nearest cell
  onCanvasClick?: (cell: OverlayCell) => void;
}

const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

const fragmentShaderSource = `
  precision highp float;

  uniform sampler2D u_image;
  uniform sampler2D u_overlayMap; // R channel: alpha per cell (NEAREST)
  uniform sampler2D u_overlayMapB; // secondary overlay alpha
  uniform sampler2D u_overlayMapC; // tertiary overlay alpha (temporary cities). Signed: >0 grow, <0 decay
  uniform sampler2D u_overlayMapD; // quaternary overlay alpha (path temp)
  uniform vec2 u_resolution;
  uniform float u_rows;
  uniform float u_columns;
  uniform float u_overlayColumns; // width of overlay textures (cells)
  uniform float u_cellSize;
  uniform float u_pixelRatio;
  uniform vec2 u_imageAspect;
  uniform int u_objectFit;
  uniform float u_imageScale;
  uniform vec2 u_visualPan;    // UV space
  uniform float u_visualScale; // >0, 1 = normal
  uniform vec2 u_visualPivot;  // UV pivot for visual transform
  uniform float u_dotScale;    // scales base dot radius
  uniform float u_minDotRadiusPx; // minimum base dot radius in pixels
  uniform float u_binaryThreshold; // [0..1]
  uniform int u_hoverEnabled;
  uniform vec2 u_mousePos;     // UV (sample space), y up
  uniform float u_mouseRadius; // UV radius
  uniform float u_mouseStrength; // [0..1]
  uniform float u_time;
  uniform float u_decayTau; // seconds
  uniform sampler2D u_influenceMap; // mouse-drawn influence
  uniform float u_mouseInfluenceMultiplier;
  uniform float u_hoverDarkenStrength;
  
  // Radial reveal & edge fade controls
  uniform int u_revealEnabled;
  uniform vec2 u_revealCenter; // UV in sample space pre-transform
  uniform float u_revealProgress; // [0..1]
  uniform float u_revealFeatherCells; // in cells
  uniform float u_edgeFadeStrength; // [0..1]
  uniform float u_edgeFadeFeatherCells; // in cells
  uniform float u_revealMinRadiusPx; // px for dots before front

  // Fill uniforms (multi-stop linear only)
  uniform float u_fillAngle;        // radians

  // Multi-stop linear gradient support (up to 8 stops)
  uniform int u_fillStopCount;
  uniform vec3 u_fillStop0;
  uniform vec3 u_fillStop1;
  uniform vec3 u_fillStop2;
  uniform vec3 u_fillStop3;
  uniform vec3 u_fillStop4;
  uniform vec3 u_fillStop5;
  uniform vec3 u_fillStop6;
  uniform vec3 u_fillStop7;

  uniform vec3 u_overlayColor;      // color for overlay cells
  uniform vec3 u_overlayColorB;     // color for overlay cells (secondary)
  uniform int u_overlayBUseDarken;  // if 1, use darkened base color for overlay B
  uniform float u_overlayBDarkenFactor; // [0..1] amount to darken base for overlay B
  uniform float u_overlayTempDarkenFactor; // [0..1] darken factor for temp overlay C
  uniform float u_overlayTempDarkenFactorB; // [0..1] darken factor for temp overlay D
  uniform int u_overlayCrossEnabled;
  uniform vec2 u_overlayCrossCenter;   // UV in pre-transform sample space
  uniform float u_overlayCrossArmWidthCells; // half thickness in cells
  uniform float u_overlayCrossSizeCells;     // half extent in cells
  uniform float u_overlayMinDotRadiusPx; // NEW: minimum overlay dot radius (px)

  // Ripple uniforms (multi-ripple)
  uniform int u_rippleCount;
  uniform vec2 u_rippleCenters[8];
  uniform float u_rippleTimes[8];
  uniform float u_rippleDurations[8];
  uniform float u_rippleIntensityPx; // px amplitude on radius
  uniform float u_rippleFrequency; // band half-width in cells for single ring
  uniform float u_rippleRadiusCells; // radial falloff in cells
  uniform float u_rippleWaveSpeed; // phase speed in cells/sec

  varying vec2 v_texCoord;

  float getGrayscale(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
  }

  vec2 applyVisualTransform(vec2 uv) {
    // Lock grid and sampling together
    vec2 centered = uv - u_visualPivot;
    centered /= max(u_visualScale, 0.00001);
    centered += u_visualPan;
    return centered + u_visualPivot;
  }

  vec2 getAspectCorrectedCoord(vec2 coord, vec2 imageAspect, int objectFit) {
    // Scale the image first, then apply object fit
    vec2 scaledCoord = (coord - 0.5) / max(u_imageScale, 0.001) + 0.5;
    
    if (objectFit == 2) { // fill
      return scaledCoord;
    }
    float canvasAspectRatio = u_resolution.x / u_resolution.y;
    float imageAspectRatio = imageAspect.x / imageAspect.y;
    if (objectFit == 0) { // cover
      if (canvasAspectRatio > imageAspectRatio) {
        float scale = imageAspectRatio / canvasAspectRatio;
        float cropStart = (1.0 - scale) * 0.5;
        return vec2(scaledCoord.x, cropStart + scaledCoord.y * scale);
      } else {
        float scale = canvasAspectRatio / imageAspectRatio;
        float cropStart = (1.0 - scale) * 0.5;
        return vec2(cropStart + scaledCoord.x * scale, scaledCoord.y);
      }
    } else { // contain
      if (canvasAspectRatio > imageAspectRatio) {
        float imageWidth = imageAspectRatio / canvasAspectRatio;
        float letterboxWidth = (1.0 - imageWidth) * 0.5;
        float mappedX = (scaledCoord.x - letterboxWidth) / imageWidth;
        return vec2(mappedX, scaledCoord.y);
      } else {
        float imageHeight = canvasAspectRatio / imageAspectRatio;
        float letterboxHeight = (1.0 - imageHeight) * 0.5;
        float mappedY = (scaledCoord.y - letterboxHeight) / imageHeight;
        return vec2(scaledCoord.x, mappedY);
      }
    }
  }

  vec3 getFillColor(float angle, vec2 uv) {
    vec2 d = vec2(cos(angle), sin(angle));
    float t = dot(uv - vec2(0.5), d) + 0.5;
    t = clamp(t, 0.0, 1.0);
    int last = u_fillStopCount - 1;
    if (last < 1) last = 1;
    float seg = 1.0 / float(last);
    float idxF = floor(t / seg);
    float upperF = float(last - 1);
    if (idxF < 0.0) idxF = 0.0;
    if (idxF > upperF) idxF = upperF;
    int idx = int(idxF);
    float localT = (t - float(idx) * seg) / seg;
    int nextIdx = idx + 1;
    if (nextIdx > last) nextIdx = last;
    vec3 c0 = (idx == 0) ? u_fillStop0 :
               (idx == 1) ? u_fillStop1 :
               (idx == 2) ? u_fillStop2 :
               (idx == 3) ? u_fillStop3 :
               (idx == 4) ? u_fillStop4 :
               (idx == 5) ? u_fillStop5 :
               (idx == 6) ? u_fillStop6 : u_fillStop7;
    vec3 c1 = (nextIdx == 0) ? u_fillStop0 :
               (nextIdx == 1) ? u_fillStop1 :
               (nextIdx == 2) ? u_fillStop2 :
               (nextIdx == 3) ? u_fillStop3 :
               (nextIdx == 4) ? u_fillStop4 :
               (nextIdx == 5) ? u_fillStop5 :
               (nextIdx == 6) ? u_fillStop6 : u_fillStop7;
    return mix(c0, c1, localT);
  }

  void main() {
    // Lock grid and sampling together so image, dots, and overlays zoom in unison
    vec2 uvT = applyVisualTransform(v_texCoord);
    vec2 pixelCoord = uvT * u_resolution;

    vec2 cellIndex = floor(pixelCoord / u_cellSize);
    vec2 cellPixelPos = mod(pixelCoord, u_cellSize);
    vec2 cellCenter = vec2(u_cellSize * 0.5);
    float distancePixels = distance(cellPixelPos, cellCenter);
    vec2 sampleCoord = (cellIndex + 0.5) / vec2(u_columns, u_rows);
    sampleCoord.y = 1.0 - sampleCoord.y;

    // Sampling uses the same transformed grid
    vec2 correctedCoord = getAspectCorrectedCoord(sampleCoord, u_imageAspect, u_objectFit);
    bool isOutsideBounds = correctedCoord.x < 0.0 || correctedCoord.x > 1.0 || correctedCoord.y < 0.0 || correctedCoord.y > 1.0;

    float brightness;
    if (isOutsideBounds && u_objectFit == 1) {
      brightness = 1.0;
    } else {
      vec4 texColor = texture2D(u_image, correctedCoord);
      brightness = getGrayscale(texColor.rgb);
    }

    float maxRadiusPixels = u_cellSize * 0.45;
    float dotRadiusPixels = (1.0 - brightness) * maxRadiusPixels * max(u_dotScale, 0.0);
    float minR = u_minDotRadiusPx;
    dotRadiusPixels = max(minR, dotRadiusPixels);
    // Influence-based growth from a decaying map (grid-locked, circular)
    // Sample from a 2x-columns-wide influence map to support negative columns on the left half
    vec2 influenceUV = vec2(
      (cellIndex.x + 0.5 + u_columns) / max(1.0, u_overlayColumns),
      1.0 - (cellIndex.y + 0.5) / max(1.0, u_rows)
    );
    float extraRaw = texture2D(u_influenceMap, influenceUV).r;
    // Size-biased influence (stronger): non-linear to boost smallest dots more
    float normSize = clamp(dotRadiusPixels / maxRadiusPixels, 0.0, 1.0);
    float curvature = pow(1.0 - normSize, 1.35);
    float sizeBias = 0.35 + 2.6 * curvature; // small≈2.95x, large≈0.35x
    float grownRadius = dotRadiusPixels * (1.0 + u_mouseInfluenceMultiplier * extraRaw * sizeBias);
    float selectedRadius = grownRadius;

    // Apply radial reveal (increase radius only after the front passes)
    if (u_revealEnabled == 1) {
      // Compute distance in cells from reveal center; use transformed center and current grid cell center
      vec2 rcT = applyVisualTransform(u_revealCenter);
      vec2 hereUVReveal = applyVisualTransform(sampleCoord);
      vec2 rcCell = vec2(rcT.x * u_columns, (1.0 - rcT.y) * u_rows);
      vec2 hereCell = vec2(hereUVReveal.x * u_columns, (1.0 - hereUVReveal.y) * u_rows);
      float distCells = distance(hereCell, rcCell);
      float front = u_revealProgress * max(u_rows, u_columns);
      float feather = max(0.001, u_revealFeatherCells);
      float revealMaskOuter = smoothstep(front - feather, front + feather, distCells);
      float revealMaskInner = 1.0 - revealMaskOuter; // 1 inside wavefront, 0 outside
      if (u_revealProgress >= 0.999) revealMaskInner = 1.0;
      // Before front (outside): shrink to tiny; after front (inside): full size
      selectedRadius = mix(u_revealMinRadiusPx, selectedRadius, revealMaskInner);
    }

    // Edge fade: compute explicit 20-cell band fades in canvas space (independent of pan/scale)
    float edgeMask = 1.0;
    if (u_edgeFadeStrength > 0.0) {
      // Use v_texCoord (canvas UV) so fades always occur at actual canvas edges
      float bandX = 65.0 / u_columns;
      float bandY = 45.0 / u_rows;
      float leftFade = smoothstep(0.0, bandX, v_texCoord.x);
      float rightFade = smoothstep(0.0, bandX, 1.0 - v_texCoord.x);
      float bottomFade = smoothstep(0.0, bandY, v_texCoord.y);
      float topFade = smoothstep(0.0, bandY, 1.0 - v_texCoord.y);
      float bandMask = leftFade * rightFade * bottomFade * topFade;
      edgeMask = mix(1.0 - u_edgeFadeStrength, 1.0, bandMask);
    }

    // Crisp edges at zoom with tight AA band
    float edgeWidth = 0.25;
    float circleAlpha = 1.0 - smoothstep(selectedRadius - edgeWidth, selectedRadius + edgeWidth, distancePixels);

    // Fill base color (multi-stop linear only)
    vec3 baseColor = getFillColor(u_fillAngle, uvT);
    // Darken by hover influence in the same area dots grow
    float hoverAmt = clamp(extraRaw * u_mouseInfluenceMultiplier, 0.0, 1.0);
    float darken = clamp(u_hoverDarkenStrength, 0.0, 1.0) * hoverAmt;
    baseColor *= (1.0 - darken);

    // Overlay: per-cell override to full fill with overlay color(s)
    // Sample from a texture that is 2x columns wide to support negative columns in left half.
    // Shift x by +u_columns so existing [0..columns-1] map unchanged to the right half.
    vec2 overlayUV = vec2(
      (cellIndex.x + 0.5 + u_columns) / max(1.0, u_overlayColumns),
      (cellIndex.y + 0.5) / max(1.0, u_rows)
    );
    float overlayMask = texture2D(u_overlayMap, overlayUV).r;
    float overlayMaskB = texture2D(u_overlayMapB, overlayUV).r;
    float overlayMaskCRaw = texture2D(u_overlayMapC, overlayUV).r; // signed during decay
    float overlayMaskD = texture2D(u_overlayMapD, overlayUV).r;

    // Procedural cross that follows visual transform; mark cells on diagonals
    float crossMask = 0.0;
    if (u_overlayCrossEnabled == 1) {
      // Compute in cell space so thickness tracks one-dot width as grid scales
      vec2 cT = applyVisualTransform(u_overlayCrossCenter);
      vec2 centerCell = vec2(cT.x * u_columns, (1.0 - cT.y) * u_rows) - vec2(0.5);
      vec2 hereCell = (cellIndex + vec2(0.5));
      vec2 dCell = hereCell - centerCell;
      float halfW = u_overlayCrossArmWidthCells;
      float halfL = u_overlayCrossSizeCells;
      float inExtent = step(max(abs(dCell.x), abs(dCell.y)), halfL);
      float diag1 = step(abs(dCell.x - dCell.y), halfW);
      float diag2 = step(abs(dCell.x + dCell.y), halfW);
      crossMask = inExtent * max(diag1, diag2);
    }

    // Use overlay/cross as progression for morphing base dot into large blue dot (no opacity fade)
    float overlayProgress = max(overlayMask, crossMask);
    float overlayProgressB = overlayMaskB; // alt has no cross
    float overlayProgressC = clamp(abs(overlayMaskCRaw), 0.0, 1.0); // temp has no cross; abs for color blending
    float overlayProgressD = overlayMaskD; // path temp has no cross

    // Exit bounce for temp overlay C: when removing (negative), shrink to min radius mid-way then return.
    float exitP = overlayMaskCRaw < 0.0 ? clamp(abs(overlayMaskCRaw), 0.0, 1.0) : 0.0;
    float exitW = (exitP > 0.0) ? sin(3.14159265 * exitP) : 0.0; // 0->1->0 over decay phase
    float minAllowed = max(u_minDotRadiusPx, 0.0001);
    if (exitW > 0.0) {
      selectedRadius = mix(selectedRadius, minAllowed, clamp(exitW, 0.0, 1.0));
    }

    // During exit, reduce C's contribution to radius expansion so dot visibly shrinks
    float overlayAnyC = overlayProgressC * (1.0 - exitW);
    float overlayAny = max(max(overlayProgress, overlayProgressB), max(overlayAnyC, overlayProgressD));
    float morphedRadius = mix(selectedRadius, maxRadiusPixels, overlayAny);

    // Optional ripple(s) around centers that modulate radius briefly
    if (u_rippleCount > 0) {
      vec2 hereUV = applyVisualTransform(sampleCoord);
      vec2 hereCell = vec2(hereUV.x * u_columns, (1.0 - hereUV.y) * u_rows);
      float rippleAccumPx = 0.0;
      for (int i = 0; i < 8; i++) {
        if (i >= u_rippleCount) break;
        vec2 rcT = applyVisualTransform(u_rippleCenters[i]);
        vec2 rcCell = vec2(rcT.x * u_columns, (1.0 - rcT.y) * u_rows);
        float distCells = distance(hereCell, rcCell);
        float life = clamp(u_rippleTimes[i] / max(0.0001, u_rippleDurations[i]), 0.0, 1.0);
        float env = 1.0 - smoothstep(0.0, 1.0, life); // ease-out envelope
        float falloff = 1.0 - smoothstep(0.0, u_rippleRadiusCells, distCells);
        float ringCenter = u_rippleWaveSpeed * u_rippleTimes[i]; // cells
        float band = smoothstep(ringCenter - u_rippleFrequency, ringCenter, distCells)
                   * (1.0 - smoothstep(ringCenter, ringCenter + u_rippleFrequency, distCells));
        rippleAccumPx += u_rippleIntensityPx * env * falloff * band;
      }
      morphedRadius = max(0.0, morphedRadius + rippleAccumPx);
    }
    // Apply edge fade last so it overrides overlay/ripples
    morphedRadius *= edgeMask;
    float finalAlpha = (morphedRadius <= 0.0001)
      ? 0.0
      : 1.0 - smoothstep(morphedRadius - edgeWidth, morphedRadius + edgeWidth, distancePixels);
    vec3 colorAfterA = mix(baseColor, u_overlayColor, overlayProgress);
    float f = clamp(u_overlayBDarkenFactor, 0.0, 1.0);
    vec3 darkened = baseColor * (1.0 - f);
    vec3 bColor = (u_overlayBUseDarken == 1) ? darkened : u_overlayColorB;
    vec3 afterB = mix(colorAfterA, bColor, overlayProgressB);
    float fC = clamp(u_overlayTempDarkenFactor, 0.0, 1.0);
    vec3 cColor = baseColor * (1.0 - fC);
    // Do not override alt color where present
    // During exit, lighten C a bit to avoid a dark flash at start of decay
    float effC = overlayProgressC * (1.0 - overlayProgressB) * (1.0 - 0.6 * exitW);
    vec3 afterC = mix(afterB, cColor, effC);
    float fD = clamp(u_overlayTempDarkenFactorB, 0.0, 1.0);
    vec3 dColor = baseColor * (1.0 - fD);
    float effD = overlayProgressD * (1.0 - overlayProgressB);
    vec3 finalColor = mix(afterC, dColor, effD);

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;

const parseHexColor = (input: string): [number, number, number] => {
  const hex = input.trim();
  const expand = (h: string) =>
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const match = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(hex);
  if (!match) return [0, 0, 0];
  const full = expand(match[1]);
  const r = parseInt(full.substring(0, 2), 16) / 255;
  const g = parseInt(full.substring(2, 4), 16) / 255;
  const b = parseInt(full.substring(4, 6), 16) / 255;
  return [r, g, b];
};

const mapFill = (f: FillDefinition) => {
  const angle = ((f.angleDeg ?? 0) * Math.PI) / 180;
  const stops = (f.stops ?? []).slice(0, 8).map(parseHexColor);
  return { angle, stops } as const;
};

// CSS-like cubic-bezier easing
const createCubicBezier = (x1: number, y1: number, x2: number, y2: number) => {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  const solveT = (x: number, eps: number) => {
    let t = x;
    for (let i = 0; i < 6; i++) {
      const xEst = sampleX(t) - x;
      const dx = sampleDX(t);
      if (Math.abs(xEst) < eps) return t;
      if (Math.abs(dx) < 1e-6) break;
      t -= xEst / dx;
    }
    let t0 = 0;
    let t1 = 1;
    t = x;
    for (let i = 0; i < 10; i++) {
      const xEst = sampleX(t);
      if (Math.abs(xEst - x) < eps) return t;
      if (x > xEst) t0 = t;
      else t1 = t;
      t = 0.5 * (t0 + t1);
    }
    return t;
  };
  return (t: number) => {
    const clamped = Math.min(1, Math.max(0, t));
    const paramT = solveT(clamped, 1e-5);
    return sampleY(paramT);
  };
};

const DotHalftoneArt: React.FC<DotHalftoneArtProps> = ({
  src,
  rows,
  columns,
  cellSize,
  style,
  scaleFrom = 2,
  scaleTo = 1,
  panFrom = { x: 0, y: 0 },
  panTo = { x: 0, y: 0 },
  objectFit = 'contain',
  imageScale = 1.0,
  fill = { angleDeg: 0, stops: ['#808080'] },
  overlayCells = [],
  overlayCellsAlt = [],
  overlayColor = '#1e3a8a',
  overlayColorAlt: overlayColorAltProp,
  overlayAltDarkenBase = false,
  overlayAltDarkenFactor = 0.45,
  overlayCellsTemp = [],
  overlayTempDarkenFactor = 0.5,
  overlayTempFadeInMs = 350,
  overlayTempFadeOutMs = 350,
  overlayTempFadeDelayMs = 0,
  overlayCellsTempB = [],
  overlayTempDarkenFactorB = 0.15,
  dotScale = 1,
  minDotDiameterPx = 0,
  binaryThreshold = 0.4,
  hoverEnabled = false,
  mouseRadius = 0.12,
  mouseStrength = 0.6,
  mouseDecayTau = 0.5,
  mouseInfluenceMultiplier = 0.5,
  hoverDarkenStrength = 0,
  overlayCrossEnabled = false,
  overlayCrossCenterBase = { x: 0.62, y: 0.18 },
  overlayCrossArmWidth = 0.01,
  overlayCrossSize = 0.06,
  overlayFadeInMs = 350,
  overlayFadeOutMs = 350,
  overlayFadeDelayMs = 0,
  transformEaseScale,
  transformEasePan,
  transformEasePanX,
  transformEasePanY,
  transformBezierScale,
  transformBezierPan,
  transformBezierPanX,
  transformBezierPanY,
  transformDurationScaleMs,
  transformDelayScaleMs,
  transformDurationPanXMs,
  transformDelayPanXMs,
  transformDurationPanYMs,
  transformDelayPanYMs,
  revealEnabled = false,
  revealCenterUV,
  revealProgress,
  revealDurationMs,
  revealDelayMs,
  revealFeatherCells,
  revealFeatherCellsStart,
  revealFeatherCellsEnd,
  edgeFadeStrength,
  edgeFadeFeatherCells,
  edgeFadeFeatherCellsStart,
  edgeFadeFeatherCellsEnd,
  revealEase,
  revealBezier,
  // NEW
  overlayMinDotDiameterPx = 4,
  rippleEnabled = false,
  rippleCenterUV,
  rippleDurationMs = 900,
  rippleIntensity = 2.5,
  rippleFrequency = 0.5,
  rippleRadiusCells = 20,
  rippleWaveSpeed = 8,
  rippleStartSignal,
  onTransformsComplete,
  visualPivotUV,
  onCanvasClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);
  const overlayTextureRef = useRef<WebGLTexture | null>(null);
  const overlayTextureBRef = useRef<WebGLTexture | null>(null);
  const overlayTextureCRef = useRef<WebGLTexture | null>(null);
  const overlayTextureDRef = useRef<WebGLTexture | null>(null);
  const influenceTextureRef = useRef<WebGLTexture | null>(null);
  const renderRef = useRef<(scale: number, pan: { x: number; y: number }) => void>();
  const lastInfluenceUpdateRef = useRef<number>(typeof performance !== 'undefined' ? performance.now() : 0);
  const lastScaleRef = useRef<number>(1);
  const mouseInsideRef = useRef<boolean>(false);
  const activeRipplesRef = useRef<{ x: number; y: number; start: number; durationSec: number }[]>([]);
  const rippleRAFRef = useRef<number | null>(null);
  const lastRippleSignalRef = useRef<number | undefined>(undefined);
  const lastPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });

  const [imageAspect, setImageAspect] = useState<{ width: number; height: number }>({ width: 1, height: 1 });

  const pixelRatio = useMemo(() => {
    const base = typeof window !== 'undefined' ? Math.max(window.devicePixelRatio || 1, 2) : 2;
    const raw = base * 2;
    const maxPixels = 10_000_000;
    const s = Math.sqrt(maxPixels / Math.max(1, columns * cellSize * rows * cellSize));
    return Math.min(raw, s);
  }, [columns, rows, cellSize]);

  const canvasWidth = columns * cellSize;
  const canvasHeight = rows * cellSize;
  const overlayColumns = columns * 2;

  // Overlay alpha (per-cell) and targets
  const influenceDataRef = useRef<Float32Array>(new Float32Array(rows * overlayColumns));
  const overlayDataRef = useRef<Float32Array>(new Float32Array(rows * overlayColumns)); // stores alpha [0..1]
  const overlayTargetsRef = useRef<Uint8Array>(new Uint8Array(rows * overlayColumns)); // stores desired state (0/1)
  const overlayDataBRef = useRef<Float32Array>(new Float32Array(rows * overlayColumns));
  const overlayTargetsBRef = useRef<Uint8Array>(new Uint8Array(rows * overlayColumns));
  const overlayDataCRef = useRef<Float32Array>(new Float32Array(rows * overlayColumns)); // temp overlay C alpha
  const overlayTargetsCRef = useRef<Uint8Array>(new Uint8Array(rows * overlayColumns)); // temp overlay C targets
  const lastOverlayUpdateRef = useRef<number>(typeof performance !== 'undefined' ? performance.now() : 0);
  const overlayUploadRef = useRef<Float32Array>(new Float32Array(rows * overlayColumns)); // eased alpha for upload
  const overlayUploadBRef = useRef<Float32Array>(new Float32Array(rows * overlayColumns)); // eased alpha for B upload
  const overlayUploadCRef = useRef<Float32Array>(new Float32Array(rows * overlayColumns)); // eased alpha for temp C upload
  const overlayStartRef = useRef<number>(typeof performance !== 'undefined' ? performance.now() : 0);
  const overlayStartCRef = useRef<number>(typeof performance !== 'undefined' ? performance.now() : 0);
  const lastOverlayProcessRef = useRef<number>(typeof performance !== 'undefined' ? performance.now() : 0);
  const revealStartRef = useRef<number | null>(null);
  const transformStartRef = useRef<number | null>(null);

  const setupGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    canvas.width = canvasWidth * pixelRatio;
    canvas.height = canvasHeight * pixelRatio;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    const gl = canvas.getContext('webgl2', {
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    });
    if (!gl) return false;
    glRef.current = gl;

    const v = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(v, vertexShaderSource);
    gl.compileShader(v);
    if (!gl.getShaderParameter(v, gl.COMPILE_STATUS)) {
      // eslint-disable-next-line no-console
      console.error('DotHalftoneArt vertex shader error:', gl.getShaderInfoLog(v));
      return false;
    }

    const f = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(f, fragmentShaderSource);
    gl.compileShader(f);
    if (!gl.getShaderParameter(f, gl.COMPILE_STATUS)) {
      // eslint-disable-next-line no-console
      console.error('DotHalftoneArt fragment shader error:', gl.getShaderInfoLog(f));
      return false;
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, v);
    gl.attachShader(program, f);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      // eslint-disable-next-line no-console
      console.error('DotHalftoneArt program link error:', gl.getProgramInfoLog(program));
      return false;
    }
    programRef.current = program;
    gl.useProgram(program);

    // Quad
    const positions = new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8);

    // Overlay texture (R32F)
    overlayTextureRef.current = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, overlayTextureRef.current);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, overlayColumns, rows, 0, gl.RED, gl.FLOAT, overlayDataRef.current);

    // Secondary overlay texture (R32F)
    overlayTextureBRef.current = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, overlayTextureBRef.current);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.R32F,
      overlayColumns,
      rows,
      0,
      gl.RED,
      gl.FLOAT,
      new Float32Array(rows * overlayColumns)
    );

    // Influence texture (R32F) — 2x columns to support negative columns on left half
    influenceTextureRef.current = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, influenceTextureRef.current);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, overlayColumns, rows, 0, gl.RED, gl.FLOAT, influenceDataRef.current);

    gl.viewport(0, 0, canvasWidth * pixelRatio, canvasHeight * pixelRatio);
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    return true;
  }, [canvasWidth, canvasHeight, pixelRatio, rows, columns]);

  // Load image
  const loadImageTexture = useCallback((imageSrc: string) => {
    const gl = glRef.current;
    if (!gl) return;
    const img = new Image();
    img.onload = () => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      textureRef.current = texture;
      setImageAspect({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      // Fallback aspect to avoid division by zero and signal failure
      console.error('DotHalftoneArt: failed to load image', imageSrc);
      setImageAspect({ width: 1, height: 1 });
    };
    img.src = imageSrc;
  }, []);

  // Update overlay targets from cells; alpha is animated in RAF
  const syncOverlayTexture = useCallback(() => {
    overlayTargetsRef.current.fill(0);
    overlayTargetsBRef.current.fill(0);
    overlayTargetsCRef.current.fill(0);
    for (const c of overlayCells) {
      const cc = c.col + columns;
      if (c.row >= 0 && c.row < rows && cc >= 0 && cc < overlayColumns) {
        overlayTargetsRef.current[c.row * overlayColumns + cc] = 1;
      }
    }
    for (const c of overlayCellsAlt) {
      const cc = c.col + columns;
      if (c.row >= 0 && c.row < rows && cc >= 0 && cc < overlayColumns) {
        overlayTargetsBRef.current[c.row * overlayColumns + cc] = 1;
      }
    }
    for (const c of overlayCellsTemp) {
      const cc = c.col + columns;
      if (c.row >= 0 && c.row < rows && cc >= 0 && cc < overlayColumns) {
        overlayTargetsCRef.current[c.row * overlayColumns + cc] = 1;
      }
    }
    overlayStartCRef.current = typeof performance !== 'undefined' ? performance.now() : 0;
  }, [overlayCells, overlayCellsAlt, overlayCellsTemp, rows, columns]);

  // Render
  const render = useCallback(
    (scale: number, pan: { x: number; y: number }) => {
      const gl = glRef.current;
      const program = programRef.current;
      if (!gl || !program || !textureRef.current) return;

      const set1i = (name: string, v: number) => {
        const loc = gl.getUniformLocation(program, name);
        if (loc) gl.uniform1i(loc, v);
      };
      const set1f = (name: string, v: number) => {
        const loc = gl.getUniformLocation(program, name);
        if (loc) gl.uniform1f(loc, v);
      };
      const set2f = (name: string, x: number, y: number) => {
        const loc = gl.getUniformLocation(program, name);
        if (loc) gl.uniform2f(loc, x, y);
      };
      const set3f = (name: string, x: number, y: number, z: number) => {
        const loc = gl.getUniformLocation(program, name);
        if (loc) gl.uniform3f(loc, x, y, z);
      };

      gl.viewport(0, 0, canvasWidth * pixelRatio, canvasHeight * pixelRatio);
      gl.clear(gl.COLOR_BUFFER_BIT);

      set2f('u_resolution', canvasWidth * pixelRatio, canvasHeight * pixelRatio);
      set1f('u_rows', rows);
      set1f('u_columns', columns);
      set1f('u_overlayColumns', overlayColumns);
      const actualCellSizeX = (canvasWidth * pixelRatio) / columns;
      const actualCellSizeY = (canvasHeight * pixelRatio) / rows;
      set1f('u_cellSize', Math.min(actualCellSizeX, actualCellSizeY));
      set1f('u_pixelRatio', pixelRatio);
      set2f('u_imageAspect', imageAspect.width, imageAspect.height);
      set1i('u_objectFit', objectFit === 'cover' ? 0 : objectFit === 'contain' ? 1 : 2);
      set1f('u_imageScale', imageScale);
      set2f('u_visualPan', pan.x, pan.y);
      set1f('u_visualScale', scale);
      set1f('u_dotScale', dotScale);
      const vp = visualPivotUV ?? { x: 0.5, y: 0.5 };
      set2f('u_visualPivot', vp.x, vp.y);
      set1f('u_minDotRadiusPx', Math.max(0.0, minDotDiameterPx * 0.5));
      set1f('u_binaryThreshold', Math.min(Math.max(binaryThreshold, 0), 1));
      set1i('u_hoverEnabled', hoverEnabled ? 1 : 0);
      set2f('u_mousePos', mousePosRef.current.x, mousePosRef.current.y);
      set1f('u_mouseRadius', mouseRadius);
      set1f('u_mouseStrength', mouseStrength);
      set1f('u_mouseInfluenceMultiplier', mouseInfluenceMultiplier);
      set1f('u_hoverDarkenStrength', hoverDarkenStrength);
      set1f('u_time', (typeof performance !== 'undefined' ? performance.now() : 0) / 1000.0);
      set1f('u_decayTau', mouseDecayTau);

      // Radial reveal & edge fade uniforms
      const revealActive = revealEnabled || typeof revealProgress === 'number' || revealDurationMs !== undefined;
      set1i('u_revealEnabled', revealActive ? 1 : 0);
      const rc = revealCenterUV ?? { x: 0.5, y: 0.5 };
      set2f('u_revealCenter', rc.x, rc.y);
      let prog = 0;
      if (typeof revealProgress === 'number') {
        prog = Math.min(1, Math.max(0, revealProgress));
      } else if (revealDurationMs !== undefined) {
        const now = typeof performance !== 'undefined' ? performance.now() : 0;
        if (revealStartRef.current === null) revealStartRef.current = now;
        const elapsed = now - (revealStartRef.current ?? 0);
        const delay = revealDelayMs ?? 0;
        const p = Math.min(1, Math.max(0, (elapsed - delay) / Math.max(1, revealDurationMs)));
        const easeDefault = (t: number) => t * t * t; // strong ease-in by default
        const easeFn = revealBezier
          ? createCubicBezier(revealBezier[0], revealBezier[1], revealBezier[2], revealBezier[3])
          : revealEase ?? easeDefault;
        prog = easeFn(p);
      }
      set1f('u_revealProgress', prog);
      const revealFeatherStatic = Math.max(0.5, revealFeatherCells ?? 6);
      const revealFeatherStartVal =
        revealFeatherCellsStart !== undefined ? Math.max(0.5, revealFeatherCellsStart) : revealFeatherStatic;
      const revealFeatherEndVal =
        revealFeatherCellsEnd !== undefined ? Math.max(0.5, revealFeatherCellsEnd) : revealFeatherStatic;
      const revealFeatherLerp = revealFeatherStartVal + (revealFeatherEndVal - revealFeatherStartVal) * prog;
      set1f('u_revealFeatherCells', revealFeatherLerp);
      // Edge fade animates off smoothly near the end instead of flashing off
      // Root-cause fix: edge fade should be relative to inside-canvas distance only.
      // Keep the configured strength; do not force-disable at end.
      set1f('u_edgeFadeStrength', Math.min(1, Math.max(0, edgeFadeStrength ?? 0)));
      const featherStatic = Math.max(1.0, edgeFadeFeatherCells ?? 24);
      const featherStart =
        edgeFadeFeatherCellsStart !== undefined ? Math.max(1.0, edgeFadeFeatherCellsStart) : featherStatic;
      const featherEnd = edgeFadeFeatherCellsEnd !== undefined ? Math.max(1.0, edgeFadeFeatherCellsEnd) : featherStatic;
      const featherLerp = featherStart + (featherEnd - featherStart) * prog;
      set1f('u_edgeFadeFeatherCells', featherLerp);
      set1f('u_revealMinRadiusPx', 0.75);

      lastScaleRef.current = scale;
      lastPanRef.current = pan;

      const mf = mapFill(fill);
      set1f('u_fillAngle', mf.angle);
      // Multi-stop uniforms
      const stopsArr = (mf as any).stops as [number, number, number][] | undefined;
      const stopCount = Math.min(8, stopsArr ? stopsArr.length : 0);
      set1i('u_fillStopCount', stopCount);
      const get = (i: number): [number, number, number] =>
        stopsArr && i < stopCount ? stopsArr[i] : [0, 0, 0];
      const s0 = get(0); gl.uniform3f(gl.getUniformLocation(program!, 'u_fillStop0')!, s0[0], s0[1], s0[2]);
      const s1 = get(1); gl.uniform3f(gl.getUniformLocation(program!, 'u_fillStop1')!, s1[0], s1[1], s1[2]);
      const s2 = get(2); gl.uniform3f(gl.getUniformLocation(program!, 'u_fillStop2')!, s2[0], s2[1], s2[2]);
      const s3 = get(3); gl.uniform3f(gl.getUniformLocation(program!, 'u_fillStop3')!, s3[0], s3[1], s3[2]);
      const s4 = get(4); gl.uniform3f(gl.getUniformLocation(program!, 'u_fillStop4')!, s4[0], s4[1], s4[2]);
      const s5 = get(5); gl.uniform3f(gl.getUniformLocation(program!, 'u_fillStop5')!, s5[0], s5[1], s5[2]);
      const s6 = get(6); gl.uniform3f(gl.getUniformLocation(program!, 'u_fillStop6')!, s6[0], s6[1], s6[2]);
      const s7 = get(7); gl.uniform3f(gl.getUniformLocation(program!, 'u_fillStop7')!, s7[0], s7[1], s7[2]);

      const [or, og, ob] = parseHexColor(overlayColor);
      set3f('u_overlayColor', or, og, ob);
      const [br, bg, bb] = parseHexColor((typeof overlayColorAltProp !== 'undefined' ? overlayColorAltProp : overlayColor));
      set3f('u_overlayColorB', br, bg, bb);
      set1i('u_overlayBUseDarken', overlayAltDarkenBase ? 1 : 0);
      set1f('u_overlayBDarkenFactor', overlayAltDarkenFactor);
      set1f('u_overlayTempDarkenFactor', overlayTempDarkenFactor);
      set1i('u_overlayCrossEnabled', overlayCrossEnabled ? 1 : 0);
      set2f('u_overlayCrossCenter', overlayCrossCenterBase.x, overlayCrossCenterBase.y);
      set1f('u_overlayCrossArmWidthCells', Math.max(0.5, overlayCrossArmWidth * columns));
      set1f('u_overlayCrossSizeCells', overlayCrossSize * columns);
      set1f('u_overlayMinDotRadiusPx', Math.max(0.0, overlayMinDotDiameterPx * 0.5));

      // Ripple uniforms (multi)
      const nowSec = (typeof performance !== 'undefined' ? performance.now() : 0) / 1000.0;
      const ripples = rippleEnabled ? activeRipplesRef.current : [];
      const count = Math.min(8, ripples.length);
      const setArray2f = (base: string, arr: { x: number; y: number }[]) => {
        for (let i = 0; i < 8; i++) {
          const loc = gl.getUniformLocation(program!, `${base}[${i}]`);
          if (loc) {
            const v = i < arr.length ? arr[i] : { x: 0.5, y: 0.5 };
            gl.uniform2f(loc, v.x, v.y);
          }
        }
      };
      const setArray1f = (base: string, values: number[]) => {
        for (let i = 0; i < 8; i++) {
          const loc = gl.getUniformLocation(program!, `${base}[${i}]`);
          if (loc) {
            const v = i < values.length ? values[i] : 0;
            gl.uniform1f(loc, v);
          }
        }
      };
      set1i('u_rippleCount', count);
      setArray2f(
        'u_rippleCenters',
        ripples.slice(0, 8).map((r) => ({ x: r.x, y: r.y }))
      );
      setArray1f(
        'u_rippleTimes',
        ripples.slice(0, 8).map((r) => Math.max(0, nowSec - r.start / 1000))
      );
      setArray1f(
        'u_rippleDurations',
        ripples.slice(0, 8).map((r) => r.durationSec)
      );
      set1f('u_rippleIntensityPx', rippleIntensity);
      set1f('u_rippleFrequency', rippleFrequency);
      set1f('u_rippleRadiusCells', rippleRadiusCells);
      set1f('u_rippleWaveSpeed', rippleWaveSpeed);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
      set1i('u_image', 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, overlayTextureRef.current);
      set1i('u_overlayMap', 1);

      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, overlayTextureBRef.current);
      set1i('u_overlayMapB', 3);

      // Tertiary overlay map (temporary cities) at TEXTURE4 (with animated alpha)
      if (!overlayTextureCRef.current) {
        overlayTextureCRef.current = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, overlayTextureCRef.current);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.R32F,
          overlayColumns,
          rows,
          0,
          gl.RED,
          gl.FLOAT,
          new Float32Array(rows * overlayColumns)
        );
      }
      // Upload current temp overlay map from animated buffer
      {
        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, overlayTextureCRef.current);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, overlayColumns, rows, 0, gl.RED, gl.FLOAT, overlayUploadCRef.current);
        set1i('u_overlayMapC', 4);
      }

      // Quaternary overlay map (path temp) at TEXTURE5
      if (!overlayTextureDRef.current) {
        overlayTextureDRef.current = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, overlayTextureDRef.current);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.R32F,
          overlayColumns,
          rows,
          0,
          gl.RED,
          gl.FLOAT,
          new Float32Array(rows * overlayColumns)
        );
      }
      {
        const tempMapB = new Float32Array(rows * overlayColumns);
        for (const c of overlayCellsTempB) {
          const cc = c.col + columns;
          if (c.row >= 0 && c.row < rows && cc >= 0 && cc < overlayColumns) tempMapB[c.row * overlayColumns + cc] = 1;
        }
        gl.activeTexture(gl.TEXTURE5);
        gl.bindTexture(gl.TEXTURE_2D, overlayTextureDRef.current);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, overlayColumns, rows, 0, gl.RED, gl.FLOAT, tempMapB);
        set1i('u_overlayMapD', 5);
      }

      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, influenceTextureRef.current);
      set1i('u_influenceMap', 2);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    [
      canvasWidth,
      canvasHeight,
      pixelRatio,
      rows,
      columns,
      imageAspect,
      objectFit,
      fill,
      overlayColor,
      dotScale,
      minDotDiameterPx,
      binaryThreshold,
      hoverEnabled,
      mouseRadius,
      mouseStrength,
      mouseInfluenceMultiplier,
      // Ripple-related dependencies to capture latest center/params
      rippleEnabled,
      rippleCenterUV,
      rippleDurationMs,
      rippleIntensity,
      rippleFrequency,
      rippleRadiusCells,
      rippleWaveSpeed,
      overlayCellsTemp,
    ]
  );

  // Keep a stable ref to the latest render function to avoid restarting animations when props unrelated to transform change
  useEffect(() => {
    renderRef.current = render;
  }, [render]);

  // Re-render on viewport resize (e.g., when breakpoints toggle visibility)
  useEffect(() => {
    const onResize = () => {
      if (renderRef.current) renderRef.current(lastScaleRef.current, lastPanRef.current);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Ensure temp overlays (C/D) update immediately when their props change
  useEffect(() => {
    if (renderRef.current) {
      renderRef.current(lastScaleRef.current, lastPanRef.current);
    }
  }, [overlayCellsTemp, overlayCellsTempB]);

  // Animate transform once on mount (decoupled from render identity)
  useEffect(() => {
    let raf = 0;
    const easeDefault = (t: number) => 1 - Math.pow(1 - t, 3);
    const easeScaleFn = transformBezierScale
      ? createCubicBezier(
          transformBezierScale[0],
          transformBezierScale[1],
          transformBezierScale[2],
          transformBezierScale[3]
        )
      : transformEaseScale ?? easeDefault;
    const easePanBase = transformBezierPan
      ? createCubicBezier(transformBezierPan[0], transformBezierPan[1], transformBezierPan[2], transformBezierPan[3])
      : transformEasePan ?? easeDefault;
    const easePanXFn = transformBezierPanX
      ? createCubicBezier(
          transformBezierPanX[0],
          transformBezierPanX[1],
          transformBezierPanX[2],
          transformBezierPanX[3]
        )
      : transformEasePanX ?? easePanBase;
    const easePanYFn = transformBezierPanY
      ? createCubicBezier(
          transformBezierPanY[0],
          transformBezierPanY[1],
          transformBezierPanY[2],
          transformBezierPanY[3]
        )
      : transformEasePanY ?? easePanBase;
    const tick = (ts: number) => {
      // Anchor transform start to when GL + texture are ready to avoid jumps after long loads
      if (!glRef.current || !programRef.current || !textureRef.current) {
        raf = requestAnimationFrame(tick);
        return;
      }
      if (transformStartRef.current === null) transformStartRef.current = ts;
      const elapsed = ts - transformStartRef.current;
      const dS = transformDurationScaleMs ?? 2000;
      const deS = transformDelayScaleMs ?? 0;
      const dX = transformDurationPanXMs ?? 2000;
      const deX = transformDelayPanXMs ?? 0;
      const dY = transformDurationPanYMs ?? 2000;
      const deY = transformDelayPanYMs ?? 0;
      const pS = Math.min(1, Math.max(0, (elapsed - deS) / Math.max(1, dS)));

      // Single-stage pan X animation
      const pX = Math.min(1, Math.max(0, (elapsed - deX) / Math.max(1, dX)));
      const kx = pX <= 0 ? 0 : easePanXFn(pX);
      const panX = panFrom.x + (panTo.x - panFrom.x) * kx;

      // Single-stage pan Y animation
      const pY = Math.min(1, Math.max(0, (elapsed - deY) / Math.max(1, dY)));
      const ky = pY <= 0 ? 0 : easePanYFn(pY);
      const panY = panFrom.y + (panTo.y - panFrom.y) * ky;

      const ks = pS <= 0 ? 0 : easeScaleFn(pS);
      const scale = scaleFrom + (scaleTo - scaleFrom) * ks;
      const pan = { x: panX, y: panY };
      if (renderRef.current) renderRef.current(scale, pan);

      // Pan X completion (single-stage)
      const panXComplete = pX >= 1;

      // Pan Y completion (single-stage)
      const panYComplete = pY >= 1;

      const done = pS >= 1 && panXComplete && panYComplete;
      if (!done) raf = requestAnimationFrame(tick);
      else if (onTransformsComplete) onTransformsComplete();
    };
    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [
    scaleFrom,
    scaleTo,
    panFrom,
    panTo,
    transformEaseScale,
    transformEasePan,
    transformEasePanX,
    transformEasePanY,
    transformBezierScale,
    transformBezierPan,
    transformBezierPanX,
    transformBezierPanY,
  ]);

  useEffect(() => {
    setupGL();
    loadImageTexture(src);
  }, [setupGL, loadImageTexture, src]);

  // Handle WebGL context loss/restoration to recover after being hidden/suspended
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleLost = (e: Event) => {
      e.preventDefault();
      glRef.current = null;
      programRef.current = null;
      textureRef.current = null;
      overlayTextureRef.current = null;
      overlayTextureBRef.current = null;
      overlayTextureCRef.current = null;
      overlayTextureDRef.current = null;
      influenceTextureRef.current = null;
    };
    const handleRestored = () => {
      setupGL();
      loadImageTexture(src);
      if (renderRef.current) renderRef.current(lastScaleRef.current, lastPanRef.current);
    };
    canvas.addEventListener('webglcontextlost', handleLost as EventListener, false);
    canvas.addEventListener('webglcontextrestored', handleRestored as EventListener, false);
    return () => {
      canvas.removeEventListener('webglcontextlost', handleLost as EventListener);
      canvas.removeEventListener('webglcontextrestored', handleRestored as EventListener);
    };
  }, [setupGL, loadImageTexture, src]);

  useEffect(() => {
    syncOverlayTexture();
  }, [syncOverlayTexture]);

  // Background RAF to decay and upload influence at lower frequency
  useEffect(() => {
    if (!hoverEnabled) return;
    let raf = 0;
    let lastUpload = typeof performance !== 'undefined' ? performance.now() : 0;
    const step = () => {
      const now = typeof performance !== 'undefined' ? performance.now() : 0;
      const gl = glRef.current;
      const dtSec = Math.max(0, (now - lastInfluenceUpdateRef.current) / 1000);
      lastInfluenceUpdateRef.current = now;
      const decay = Math.exp(-dtSec / mouseDecayTau);
      const data = influenceDataRef.current;
      let maxVal = 0;
      for (let i = 0; i < data.length; i++) {
        data[i] *= decay;
        if (data[i] > maxVal) maxVal = data[i];
      }
      // Re-stamp at last mouse position while inside to preserve the hovered area without global freeze
      if (mouseInsideRef.current) {
        const sx = mousePosRef.current.x;
        const sy = mousePosRef.current.y;
        const rCellsR = mouseRadius * columns;
        const xUvRadiusR = rCellsR / columns;
        const yUvRadiusR = rCellsR / rows;
        const r0 = Math.max(0, Math.floor((1 - (sy + yUvRadiusR)) * rows));
        const r1 = Math.min(rows - 1, Math.ceil((1 - (sy - yUvRadiusR)) * rows));
        const c0 = Math.max(-columns, Math.floor((sx - xUvRadiusR) * columns));
        const c1 = Math.min(columns - 1, Math.ceil((sx + xUvRadiusR) * columns));
        for (let r = r0; r <= r1; r++) {
          for (let c = c0; c <= c1; c++) {
            const idx = r * overlayColumns + (c + columns);
            const cellX = (c + 0.5) / columns;
            const cellY = 1 - (r + 0.5) / rows;
            const dxC = (cellX - sx) * columns;
            const dyC = (cellY - sy) * rows;
            const distC = Math.hypot(dxC, dyC);
            // Bias to keep the currently hovered peak topped off
            const influence = Math.max(0, 1 - distC / rCellsR) * 0.9 + 0.1;
            data[idx] = Math.max(data[idx] * decay, influence);
          }
        }
      }
      if (gl && influenceTextureRef.current && now - lastUpload > 32) {
        // ~30Hz uploads
        lastUpload = now;
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, influenceTextureRef.current);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, overlayColumns, rows, 0, gl.RED, gl.FLOAT, data);
        render(lastScaleRef.current, lastPanRef.current);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [hoverEnabled, columns, overlayColumns, rows, mouseDecayTau, render]);

  // Overlay alpha fade-in/out RAF (always on; lightweight)
  useEffect(() => {
    let raf = 0;
    let lastUpload = typeof performance !== 'undefined' ? performance.now() : 0;
    const step = (now: DOMHighResTimeStamp) => {
      // Throttle heavy processing to ~30Hz (align with upload cadence)
      if (now - lastOverlayProcessRef.current <= 32) {
        raf = requestAnimationFrame(step);
        return;
      }
      lastOverlayProcessRef.current = now;

      // Compute deltas only when we process
      const dtMs = Math.max(0, now - lastOverlayUpdateRef.current);
      lastOverlayUpdateRef.current = now;

      const dataA = overlayDataRef.current;
      const targetsA = overlayTargetsRef.current;
      const dataB = overlayDataBRef.current;
      const targetsB = overlayTargetsBRef.current;
      const dataC = overlayDataCRef.current;
      const targetsC = overlayTargetsCRef.current;

      const elapsedSinceStart = now - (overlayStartRef.current || 0);
      const allowGrow = elapsedSinceStart >= overlayFadeDelayMs;
      const growRate = allowGrow && overlayFadeInMs > 0 ? dtMs / overlayFadeInMs : 0;
      const decayRate = overlayFadeOutMs > 0 ? dtMs / overlayFadeOutMs : 1;

      const elapsedSinceStartC = now - (overlayStartCRef.current || 0);
      const allowGrowC = elapsedSinceStartC >= overlayTempFadeDelayMs;
      const growRateC = allowGrowC && overlayTempFadeInMs > 0 ? dtMs / overlayTempFadeInMs : 0;
      const decayRateC = overlayTempFadeOutMs > 0 ? dtMs / overlayTempFadeOutMs : 1;

      let anyChange = false;
      const uploadA = overlayUploadRef.current;
      const uploadB = overlayUploadBRef.current;
      const uploadC = overlayUploadCRef.current;
      const n = dataA.length; // equal across buffers
      for (let i = 0; i < n; i++) {
        // A
        const tA = targetsA[i] ? 1 : 0;
        const a0A = dataA[i];
        let a1A = a0A;
        if (tA === 1 && a0A < 1) a1A = a0A + growRate;
        else if (tA === 0 && a0A > 0) a1A = a0A - decayRate;
        // clamp
        if (a1A > 1) a1A = 1;
        else if (a1A < 0) a1A = 0;
        if (a1A !== a0A) {
          dataA[i] = a1A;
          anyChange = true;
        }
        // easeOutCubic: 3x - 3x^2 + x^3
        const xA = a1A;
        uploadA[i] = xA * (3 - 3 * xA + xA * xA);

        // B
        const tB = targetsB[i] ? 1 : 0;
        const a0B = dataB[i];
        let a1B = a0B;
        if (tB === 1 && a0B < 1) a1B = a0B + growRate;
        else if (tB === 0 && a0B > 0) a1B = a0B - decayRate;
        if (a1B > 1) a1B = 1;
        else if (a1B < 0) a1B = 0;
        if (a1B !== a0B) {
          dataB[i] = a1B;
          anyChange = true;
        }
        const xB = a1B;
        uploadB[i] = xB * (3 - 3 * xB + xB * xB);

        // C (signed during decay to drive bounce in shader)
        const tC = targetsC[i] ? 1 : 0;
        const mag0 = Math.abs(dataC[i]);
        let mag1 = mag0;
        if (tC === 1 && mag0 < 1) mag1 = mag0 + growRateC;
        else if (tC === 0 && mag0 > 0) mag1 = mag0 - decayRateC;
        if (mag1 > 1) mag1 = 1;
        else if (mag1 < 0) mag1 = 0;
        const signed = tC === 1 ? mag1 : -mag1;
        if (signed !== dataC[i]) {
          dataC[i] = signed;
          anyChange = true;
        }
        // easeOutCubic with sign preserved
        const xC = signed;
        uploadC[i] = xC * (3 - 3 * xC + xC * xC);
      }
      const gl = glRef.current;
      if (gl && anyChange && now - lastUpload > 32) {
        lastUpload = now;
        if (overlayTextureRef.current) {
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, overlayTextureRef.current);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, overlayColumns, rows, 0, gl.RED, gl.FLOAT, uploadA);
        }
        if (overlayTextureBRef.current) {
          gl.activeTexture(gl.TEXTURE3);
          gl.bindTexture(gl.TEXTURE_2D, overlayTextureBRef.current);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, overlayColumns, rows, 0, gl.RED, gl.FLOAT, uploadB);
        }
        if (overlayTextureCRef.current) {
          gl.activeTexture(gl.TEXTURE4);
          gl.bindTexture(gl.TEXTURE_2D, overlayTextureCRef.current);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, overlayColumns, rows, 0, gl.RED, gl.FLOAT, uploadC);
        }
        // re-render to apply new alpha
        render(lastScaleRef.current, lastPanRef.current);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [columns, rows, overlayFadeInMs, overlayFadeOutMs, overlayFadeDelayMs, overlayTempFadeInMs, overlayTempFadeOutMs, overlayTempFadeDelayMs, render]);

  // When rippleStartSignal changes, arm a new ripple
  useEffect(() => {
    if (!rippleEnabled) {
      lastRippleSignalRef.current = rippleStartSignal;
      return;
    }
    if (lastRippleSignalRef.current === undefined) {
      lastRippleSignalRef.current = rippleStartSignal;
      return;
    }
    if (rippleStartSignal !== undefined && rippleStartSignal !== lastRippleSignalRef.current) {
      const start = typeof performance !== 'undefined' ? performance.now() : 0;
      const center = rippleCenterUV ?? { x: 0.5, y: 0.5 };
      activeRipplesRef.current.push({
        x: center.x,
        y: center.y,
        start,
        durationSec: Math.max(0.1, rippleDurationMs / 1000),
      });
      if (!rippleRAFRef.current) {
        const step = () => {
          const now = typeof performance !== 'undefined' ? performance.now() : 0;
          activeRipplesRef.current = activeRipplesRef.current.filter((r) => (now - r.start) / 1000 < r.durationSec);
          if (renderRef.current) renderRef.current(lastScaleRef.current, lastPanRef.current);
          if (activeRipplesRef.current.length > 0) {
            rippleRAFRef.current = requestAnimationFrame(step);
          } else {
            rippleRAFRef.current = null;
          }
        };
        rippleRAFRef.current = requestAnimationFrame(step);
      }
    }
    lastRippleSignalRef.current = rippleStartSignal;
  }, [rippleStartSignal, rippleEnabled, rippleCenterUV, rippleDurationMs]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const vx = (e.clientX - rect.left) / rect.width;
      const vyDom = (e.clientY - rect.top) / rect.height; // DOM Y down
      // Apply the same visual transform as the shader so hover aligns with the transformed grid
      const vPre = { x: vx, y: 1.0 - vyDom };
      const s = Math.max(0.00001, lastScaleRef.current);
      const pan = lastPanRef.current;
      const sx = (vPre.x - 0.5) / s + pan.x + 0.5;
      const sy = (vPre.y - 0.5) / s + pan.y + 0.5;
      // Clamp to grid bounds
      // Do not clamp for ripple centers; allow off-grid so transformed ripple aligns with view
      mousePosRef.current = { x: sx, y: sy };
      mouseInsideRef.current = true;

      // Write into influence map (brush stamp) without global decay; decay handled by RAF
      const data = influenceDataRef.current;
      const rCells = mouseRadius * columns;
      const xUvRadius = rCells / columns;
      const yUvRadius = rCells / rows;
      const r0 = Math.max(0, Math.floor((1 - (sy + yUvRadius)) * rows));
      const r1 = Math.min(rows - 1, Math.ceil((1 - (sy - yUvRadius)) * rows));
      const c0 = Math.max(-columns, Math.floor((sx - xUvRadius) * columns));
      const c1 = Math.min(columns - 1, Math.ceil((sx + xUvRadius) * columns));
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const idx = r * overlayColumns + (c + columns);
          const cellX = (c + 0.5) / columns;
          const cellY = 1 - (r + 0.5) / rows;
          const dxC = (cellX - sx) * columns;
          const dyC = (cellY - sy) * rows;
          const distC = Math.hypot(dxC, dyC);
          const influence = Math.max(0, 1 - distC / rCells);
          if (influence > data[idx]) data[idx] = influence;
        }
      }

      // Upload and re-render
      const gl = glRef.current;
      if (gl && influenceTextureRef.current) {
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, influenceTextureRef.current);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, overlayColumns, rows, 0, gl.RED, gl.FLOAT, data);
      }
      render(lastScaleRef.current, lastPanRef.current);
    },
    [render, columns, rows, mouseDecayTau, mouseRadius]
  );

  const handleMouseEnter = useCallback(() => {
    mouseInsideRef.current = true;
  }, []);
  const handleMouseLeave = useCallback(() => {
    mouseInsideRef.current = false;
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!hoverEnabled) return; // gate until load animation completes
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const vx = (e.clientX - rect.left) / rect.width;
      const vyDom = (e.clientY - rect.top) / rect.height; // DOM Y down
      // Use the same y-up UV convention as hover so click aligns with shader space
      const vPre = { x: vx, y: 1.0 - vyDom };
      const s = Math.max(0.00001, lastScaleRef.current);
      const pan = lastPanRef.current;
      const sx = (vPre.x - 0.5) / s + pan.x + 0.5;
      const sy = (vPre.y - 0.5) / s + pan.y + 0.5;
      const start = typeof performance !== 'undefined' ? performance.now() : 0;
      const syFlip = 1.0 - sy;
      activeRipplesRef.current.push({ x: sx, y: syFlip, start, durationSec: Math.max(0.1, rippleDurationMs / 1000) });
      // Notify parent for temp dot at nearest cell
      if (onCanvasClick) {
        const cellCol = Math.min(columns - 1, Math.floor(sx * columns));
        const cellRow = Math.max(0, Math.min(rows - 1, Math.floor((1.0 - syFlip) * rows)));
        onCanvasClick({ row: cellRow, col: cellCol });
      }
      if (!rippleRAFRef.current) {
        const step = () => {
          const now = typeof performance !== 'undefined' ? performance.now() : 0;
          activeRipplesRef.current = activeRipplesRef.current.filter((r) => (now - r.start) / 1000 < r.durationSec);
          if (renderRef.current) renderRef.current(lastScaleRef.current, lastPanRef.current);
          if (activeRipplesRef.current.length > 0) {
            rippleRAFRef.current = requestAnimationFrame(step);
          } else {
            rippleRAFRef.current = null;
          }
        };
        rippleRAFRef.current = requestAnimationFrame(step);
      }
    },
    [hoverEnabled, rippleDurationMs]
  );

  return (
    <canvas
      ref={canvasRef}
      onMouseEnter={hoverEnabled ? handleMouseEnter : undefined}
      onMouseMove={hoverEnabled ? handleMouseMove : undefined}
      onMouseLeave={hoverEnabled ? handleMouseLeave : undefined}
      onClick={handleClick}
      style={{ display: 'block', maxWidth: '100%', ...style }}
    />
  );
};

export default DotHalftoneArt;
