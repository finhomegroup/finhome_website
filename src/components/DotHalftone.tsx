import React, { useCallback, useEffect, useRef } from 'react';

type FillType = 'solid' | 'linear' | 'radial';
export interface FillDefinition {
  type: FillType;
  colorA: string;
  colorB?: string;
  angleDeg?: number;
  center?: { x: number; y: number };
  radius?: number; // normalized to [0,1] of min(canvasW, canvasH)
}

interface DotHalftoneProps {
  src: string;
  nextSrc?: string;
  rows: number;
  columns: number;
  cellSize?: number;
  transitionDuration?: number;
  style?: React.CSSProperties;
  onTransitionComplete?: () => void;
  rippleEffect?: boolean;
  rippleIntensity?: number;
  rippleFrequency?: number;
  objectFit?: 'cover' | 'contain' | 'fill';
  mouseRadius?: number;
  mouseInfluenceMultiplier?: number;
  mouseDecayTau?: number;
  mouseEnterDuration?: number;
  mouseExitDuration?: number;
  fill?: FillDefinition; // current fill
  nextFill?: FillDefinition; // target fill to animate to
  fillTransitionDuration?: number;
  className?: string;
  fillTrigger?: number; // external signal to start color fade immediately
  play?: boolean; // whether animations should run
}

// WebGL shader source
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
  uniform sampler2D u_nextImage;
  uniform sampler2D u_influenceMap;
  uniform vec2 u_resolution;
  uniform float u_rows;
  uniform float u_columns;
  uniform float u_cellSize;
  uniform float u_transitionProgress;
  uniform float u_pixelRatio;
  uniform vec2 u_imageAspect;
  uniform vec2 u_nextImageAspect;
  uniform int u_objectFit;
  uniform float u_mouseInfluenceMultiplier;

  uniform bool u_hasNextImage;
  uniform bool u_rippleEffect;
  uniform float u_rippleIntensity;
  uniform float u_rippleFrequency;
  uniform float u_time;
  uniform float u_influenceDamping; // [0..1], slows image mix where influence is high

  // Fill/gradient uniforms (current)
  uniform int u_fillType;           // 0 solid, 1 linear, 2 radial
  uniform vec3 u_fillColorA;
  uniform vec3 u_fillColorB;
  uniform bool u_fillHasB;
  uniform float u_fillAngle;        // radians
  uniform vec2 u_fillCenter;        // [0..1]
  uniform float u_fillRadius;       // normalized [0..1]

  // Fill/gradient uniforms (next) for animated blending
  uniform bool u_hasNextFill;
  uniform int u_nextFillType;
  uniform vec3 u_nextFillColorA;
  uniform vec3 u_nextFillColorB;
  uniform bool u_nextFillHasB;
  uniform float u_nextFillAngle;
  uniform vec2 u_nextFillCenter;
  uniform float u_nextFillRadius;
  uniform float u_fillTransitionProgress;

  varying vec2 v_texCoord;

  float getGrayscale(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
  }

  vec2 getAspectCorrectedCoord(vec2 coord, vec2 imageAspect, int objectFit) {
    if (objectFit == 2) { // fill - stretch to fit exactly
      return coord;
    }

    float canvasAspectRatio = u_resolution.x / u_resolution.y;
    float imageAspectRatio = imageAspect.x / imageAspect.y;

    if (objectFit == 0) { // cover - crop from center to fill completely
      if (canvasAspectRatio > imageAspectRatio) {
        float scale = imageAspectRatio / canvasAspectRatio;
        float cropStart = (1.0 - scale) * 0.5;
        return vec2(coord.x, cropStart + coord.y * scale);
      } else {
        float scale = canvasAspectRatio / imageAspectRatio;
        float cropStart = (1.0 - scale) * 0.5;
        return vec2(cropStart + coord.x * scale, coord.y);
      }

    } else { // contain - fit entirely with letterboxing
      if (canvasAspectRatio > imageAspectRatio) {
        float imageWidth = imageAspectRatio / canvasAspectRatio;
        float letterboxWidth = (1.0 - imageWidth) * 0.5;
        float mappedX = (coord.x - letterboxWidth) / imageWidth;
        return vec2(mappedX, coord.y);
      } else {
        float imageHeight = canvasAspectRatio / imageAspectRatio;
        float letterboxHeight = (1.0 - imageHeight) * 0.5;
        float mappedY = (coord.y - letterboxHeight) / imageHeight;
        return vec2(coord.x, mappedY);
      }
    }
  }

  vec3 getFillColor(int fType, vec3 cA, vec3 cB, bool hasB, float angle, vec2 center, float radius, vec2 uv) {
    if (fType == 0) {
      return cA; // solid
    } else if (fType == 1) {
      // linear
      vec2 d = vec2(cos(angle), sin(angle));
      float t = dot(uv - vec2(0.5), d) + 0.5; // center at 0.5
      t = clamp(t, 0.0, 1.0);
      return mix(cA, hasB ? cB : cA, t);
    } else {
      // radial
      float distNorm = distance(uv, center) / max(radius, 0.00001);
      float t = clamp(1.0 - distNorm, 0.0, 1.0);
      return mix(cA, hasB ? cB : cA, t);
    }
  }

  void main() {
    vec2 pixelCoord = v_texCoord * u_resolution;
    vec2 cellIndex = floor(pixelCoord / u_cellSize);
    vec2 cellPixelPos = mod(pixelCoord, u_cellSize);
    vec2 cellCenter = vec2(u_cellSize * 0.5);
    float distancePixels = distance(cellPixelPos, cellCenter);
    vec2 sampleCoord = (cellIndex + 0.5) / vec2(u_columns, u_rows);
    sampleCoord.y = 1.0 - sampleCoord.y;
    vec2 correctedCoord = getAspectCorrectedCoord(sampleCoord, u_imageAspect, u_objectFit);
    bool isOutsideBounds = correctedCoord.x < 0.0 || correctedCoord.x > 1.0 ||
                          correctedCoord.y < 0.0 || correctedCoord.y > 1.0;

    float brightness;
    if (isOutsideBounds && u_objectFit == 1) {
      brightness = 1.0;
    } else {
      vec4 texColor = texture2D(u_image, correctedCoord);
      brightness = getGrayscale(texColor.rgb);
    }

    float maxRadiusPixels = u_cellSize * 0.45;
    float extraRaw = texture2D(u_influenceMap, sampleCoord).r;
    float extraScale = extraRaw * maxRadiusPixels * u_mouseInfluenceMultiplier;
    float dotRadiusPixels = (1.0 - brightness) * maxRadiusPixels + extraScale;

    if (u_hasNextImage) {
      vec2 nextCorrectedCoord = getAspectCorrectedCoord(sampleCoord, u_nextImageAspect, u_objectFit);
      bool nextIsOutsideBounds = nextCorrectedCoord.x < 0.0 || nextCorrectedCoord.x > 1.0 ||
                                nextCorrectedCoord.y < 0.0 || nextCorrectedCoord.y > 1.0;
      float nextBrightness;
      if (nextIsOutsideBounds && u_objectFit == 1) {
        nextBrightness = 1.0;
      } else {
        vec4 nextTexColor = texture2D(u_nextImage, nextCorrectedCoord);
        nextBrightness = getGrayscale(nextTexColor.rgb);
      }
      float nextDotRadiusPixels = (1.0 - nextBrightness) * maxRadiusPixels + extraScale;
      float transitionAmount = u_transitionProgress;
      if (u_rippleEffect) {
        vec2 center = vec2(0.5, 0.5);
        float distanceFromCenter = distance(v_texCoord, center);
        float ripplePhase = distanceFromCenter * u_rippleFrequency - u_transitionProgress * 8.0;
        float rippleWave = sin(ripplePhase) * u_rippleIntensity;
        float rippleOffset = distanceFromCenter * 2.0 + rippleWave;
        transitionAmount = clamp(u_transitionProgress * 2.5 - rippleOffset, 0.0, 1.0);
      }
      // Influence-aware damping: slow the image mix where influence is currently high
      float influenceScaledForDamping = clamp(extraRaw * u_mouseInfluenceMultiplier, 0.0, 1.0);
      float effectiveTransition = mix(transitionAmount, transitionAmount * (1.0 - u_influenceDamping), influenceScaledForDamping);
      dotRadiusPixels = mix(dotRadiusPixels, nextDotRadiusPixels, effectiveTransition);
    }

    float edgeWidth = u_pixelRatio * 0.5;
    float halfSize = u_cellSize * 0.5;
    float influenceAmount = clamp(extraRaw * u_mouseInfluenceMultiplier, 0.0, 1.0);
    float interactiveMax = halfSize * 0.9; // keep some margin, never full cell
    float radiusAfterCap = mix(dotRadiusPixels, min(dotRadiusPixels, interactiveMax), influenceAmount);

    // Circle alpha always available (no influence => only circles)
    float circleAlpha = 1.0 - smoothstep(radiusAfterCap - edgeWidth, radiusAfterCap + edgeWidth, distancePixels);

    // Superellipse for interactive enlargement near cap; blend in only with influence
    vec2 local = (cellPixelPos - cellCenter) / halfSize; // [-1,1]
    float radiusNorm = clamp(radiusAfterCap / halfSize, 0.0, 1.0);
    float pInfluence = smoothstep(0.6, 1.0, radiusNorm) * influenceAmount;
    float p = mix(2.0, 12.0, pInfluence); // 2=circle, 12=rounded-square
    float dNorm = pow(pow(abs(local.x), p) + pow(abs(local.y), p), 1.0 / p);
    float dPixels = dNorm * halfSize;
    float superAlpha = 1.0 - smoothstep(radiusAfterCap - edgeWidth, radiusAfterCap + edgeWidth, dPixels);
    // Prefer circles until strongly influenced near cap, then switch to rounded-square
    float selector = smoothstep(0.7, 0.95, pInfluence);
    float finalAlpha = mix(circleAlpha, superAlpha, selector);
    // Clamp any antialiased fringe at cell edges to avoid glow/clipping
    float cellEdgeAA = edgeWidth / halfSize;
    float cellMask = 1.0 - smoothstep(1.0 - cellEdgeAA, 1.0, max(abs(local.x), abs(local.y)));
    finalAlpha *= cellMask;
    // Compute dynamic fill color (current and optionally next) and blend by fill transition progress
    vec3 fillCurrent = getFillColor(u_fillType, u_fillColorA, u_fillColorB, u_fillHasB, u_fillAngle, u_fillCenter, u_fillRadius, v_texCoord);
    vec3 dotColor = fillCurrent;
    if (u_hasNextFill) {
      vec3 fillNext = getFillColor(u_nextFillType, u_nextFillColorA, u_nextFillColorB, u_nextFillHasB, u_nextFillAngle, u_nextFillCenter, u_nextFillRadius, v_texCoord);
      dotColor = mix(fillCurrent, fillNext, clamp(u_fillTransitionProgress, 0.0, 1.0));
    }
    gl_FragColor = vec4(dotColor, finalAlpha);
  }
`;

const DotHalftone: React.FC<DotHalftoneProps> = React.memo(
  ({
    src,
    nextSrc,
    rows,
    columns,
    cellSize = 8,
    transitionDuration = 500,
    style,
    onTransitionComplete,
    rippleEffect = true,
    rippleIntensity = 0.15,
    rippleFrequency = 12.0,
    objectFit = 'cover',
    mouseRadius = 0.15,
    mouseInfluenceMultiplier = 0.6,
    mouseDecayTau = 0.5,
    mouseEnterDuration = 500,
    mouseExitDuration = 1000,
    fill = ((): FillDefinition => ({ type: 'solid' as const, colorA: '#000000' }))(),
    nextFill,
    fillTransitionDuration = 500,
    className,
    fillTrigger,
    play = true,
  }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGL2RenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    const textureRef = useRef<WebGLTexture | null>(null);
    const nextTextureRef = useRef<WebGLTexture | null>(null);
    const fallbackTextureRef = useRef<WebGLTexture | null>(null);
    const influenceTextureRef = useRef<WebGLTexture | null>(null);
    const animationFrameRef = useRef<number>();
    const mouseInfluenceAnimationRef = useRef<number>(0);
    const [error, setError] = React.useState<string | null>(null);

    const [isTransitioning, setIsTransitioning] = React.useState(false);
    const isTransitioningRef = useRef(false);
    const [transitionProgress, setTransitionProgress] = React.useState(0);
    const [webglWorking, setWebglWorking] = React.useState<boolean | null>(null);
    const transitionStartTime = useRef<number>(0);
    const transitionProgressRef = useRef<number>(0);
    const transitionCompletionHandledRef = useRef<boolean>(false);
    const [imageAspect, setImageAspect] = React.useState({ width: 1, height: 1 });
    const [nextImageAspect, setNextImageAspect] = React.useState({ width: 1, height: 1 });
    const imageAspectRef = useRef({ width: 1, height: 1 });
    const nextImageAspectRef = useRef({ width: 1, height: 1 });
    const loadingVersionRef = useRef(0);
    // Buffer a single follow-up image request
    const bufferedNextSrcRef = useRef<string | null>(null);
    const [isMouseOver, setIsMouseOver] = React.useState(false);
    const mouseInfluenceStrengthRef = useRef(0);
    const mousePosRef = useRef({ x: -1, y: -1 });
    const lastAnimationTimeRef = useRef(typeof performance !== 'undefined' ? performance.now() : 0);
    const influenceDataRef = useRef<Float32Array>(new Float32Array(rows * columns));
    const isAnimatingRef = useRef(false);
    // Fill transition state
    const isFillTransitioningRef = useRef(false);
    const fillTransitionStartTimeRef = useRef(0);
    const fillTransitionProgressRef = useRef(0);
    const fillCurrentRef = useRef({
      type: 0,
      colorA: [0, 0, 0] as [number, number, number],
      colorB: [0, 0, 0] as [number, number, number],
      hasB: false,
      angle: 0,
      center: { x: 0.5, y: 0.5 },
      radius: 0.7071,
    });
    const fillNextRef = useRef({
      type: 0,
      colorA: [0, 0, 0] as [number, number, number],
      colorB: [0, 0, 0] as [number, number, number],
      hasB: false,
      angle: 0,
      center: { x: 0.5, y: 0.5 },
      radius: 0.7071,
    });

    const canvasWidth = columns * cellSize;
    const canvasHeight = rows * cellSize;
    // Note: aspect handling occurs in-shader via u_resolution
    const basePixelRatio = typeof window !== 'undefined' ? Math.max(window.devicePixelRatio || 1, 2) : 2;
    const resolutionMultiplier = 2;
    const pixelRatio = basePixelRatio * resolutionMultiplier;

    const parseColor = useCallback((input: string): [number, number, number] => {
      const s = input.trim();
      const expand = (h: string) =>
        h.length === 3
          ? h
              .split('')
              .map((c) => c + c)
              .join('')
          : h;
      const hexMatch = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(s);
      if (hexMatch) {
        const full = expand(hexMatch[1]);
        return [
          parseInt(full.substring(0, 2), 16) / 255,
          parseInt(full.substring(2, 4), 16) / 255,
          parseInt(full.substring(4, 6), 16) / 255,
        ];
      }
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const el = document.createElement('span');
        el.style.color = s;
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        const computed = getComputedStyle(el).color;
        document.body.removeChild(el);
        const rgbMatch = computed.match(/^rgba?\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)(?:\s*,\s*[0-9.]+)?\s*\)$/i);
        if (rgbMatch) {
          return [parseInt(rgbMatch[1], 10) / 255, parseInt(rgbMatch[2], 10) / 255, parseInt(rgbMatch[3], 10) / 255];
        }
        const varMatch = s.match(/var\(\s*(--[a-zA-Z0-9-_]+)\s*\)/);
        if (varMatch) {
          const root = getComputedStyle(document.documentElement);
          const val = root.getPropertyValue(varMatch[1]).trim();
          const parts = val.split(',').map((n) => parseFloat(n));
          if (parts.length >= 3 && parts.every((x) => Number.isFinite(x))) {
            return [parts[0] / 255, parts[1] / 255, parts[2] / 255];
          }
        }
      }
      return [0, 0, 0];
    }, []);

    const mapFillToInternal = useCallback(
      (
        f: FillDefinition
      ): {
        type: number;
        colorA: [number, number, number];
        colorB: [number, number, number];
        hasB: boolean;
        angle: number;
        center: { x: number; y: number };
        radius: number;
      } => {
        const type = f.type === 'solid' ? 0 : f.type === 'linear' ? 1 : 2;
        const colorA = parseColor(f.colorA);
        const colorB = parseColor(f.colorB ?? f.colorA);
        const hasB = Boolean(f.colorB);
        const angle = ((f.angleDeg ?? 0) * Math.PI) / 180;
        const center = f.center ?? { x: 0.5, y: 0.5 };
        const radius = f.radius ?? 0.7071; // default to cover half-diagonal
        return { type, colorA, colorB, hasB, angle, center, radius };
      },
      [parseColor]
    );

    // Create a fallback 1x1 white texture
    const createFallbackTexture = useCallback((gl: WebGL2RenderingContext) => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      const pixel = new Uint8Array([255, 255, 255, 255]); // White pixel
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      return texture;
    }, []);

    // Initialize WebGL
    const initWebGL = useCallback(() => {
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
      if (!gl) {
        setWebglWorking(false);
        return false;
      }
      glRef.current = gl;

      gl.viewport(0, 0, canvasWidth * pixelRatio, canvasHeight * pixelRatio);

      const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
      gl.shaderSource(vertexShader, vertexShaderSource);
      gl.compileShader(vertexShader);

      if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('Vertex shader error:', gl.getShaderInfoLog(vertexShader));
        setWebglWorking(false);
        return false;
      }

      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
      gl.shaderSource(fragmentShader, fragmentShaderSource);
      gl.compileShader(fragmentShader);

      if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('Fragment shader error:', gl.getShaderInfoLog(fragmentShader));
        setWebglWorking(false);
        return false;
      }

      const program = gl.createProgram()!;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        setWebglWorking(false);
        return false;
      }
      setWebglWorking(true);
      programRef.current = program;
      gl.useProgram(program);

      // Transparent background and blending
      gl.clearColor(0, 0, 0, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

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

      // Create fallback texture
      fallbackTextureRef.current = createFallbackTexture(gl);

      // Create influence map texture
      influenceTextureRef.current = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, influenceTextureRef.current);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, columns, rows, 0, gl.RED, gl.FLOAT, null);

      influenceDataRef.current.fill(0);

      return true;
    }, [canvasWidth, canvasHeight, pixelRatio, createFallbackTexture, columns, rows]);

    // Animation loop
    const animate = useCallback(
      (timestamp: number) => {
        const dt = timestamp - lastAnimationTimeRef.current;
        lastAnimationTimeRef.current = timestamp;

        let shouldContinue = false;

        if (isTransitioningRef.current) {
          const elapsed = timestamp - transitionStartTime.current;
          const progress = Math.min(elapsed / transitionDuration, 1);
          // Use ref to avoid state update interruptions
          transitionProgressRef.current = progress;
          setTransitionProgress(progress);

          if (progress >= 1 && !transitionCompletionHandledRef.current) {
            transitionCompletionHandledRef.current = true;
            // Move current next to main
            imageAspectRef.current = nextImageAspectRef.current;
            textureRef.current = nextTextureRef.current || fallbackTextureRef.current;
            // Immediately finalize to avoid any one-frame mismatch
            setIsTransitioning(false);
            isTransitioningRef.current = false;
            // Reset progress to 0 to match stable behavior
            transitionProgressRef.current = 0;
            setTransitionProgress(0);
            setImageAspect(nextImageAspectRef.current);
            onTransitionComplete?.();
            // Clear next immediately and process any buffered nextSrc right away
            nextTextureRef.current = null;
            if (bufferedNextSrcRef.current) {
              const srcToLoad = bufferedNextSrcRef.current;
              bufferedNextSrcRef.current = null;
              loadTexture(srcToLoad, 'next');
            }
          } else {
            shouldContinue = true;
          }
        }

        // Fill transition update (independent)
        if (isFillTransitioningRef.current) {
          const tElapsed = timestamp - fillTransitionStartTimeRef.current;
          const p = Math.min(tElapsed / Math.max(1, fillTransitionDuration), 1);
          fillTransitionProgressRef.current = p;
          if (p >= 1) {
            // promote next -> current
            fillCurrentRef.current = { ...fillNextRef.current };
            isFillTransitioningRef.current = false;
            fillTransitionProgressRef.current = 0;
          } else {
            shouldContinue = true;
          }
        }

        // Update influence map regardless of transition state
        const influenceData = influenceDataRef.current;
        const dt_sec = dt / 1000;
        const decayFactor = Math.exp(-dt_sec / mouseDecayTau);
        const mouse = mousePosRef.current;
        const influenceStrength = mouseInfluenceStrengthRef.current;

        for (let row = 0; row < rows; row++) {
          // row=0 top
          for (let col = 0; col < columns; col++) {
            const idx = row * columns + col;
            influenceData[idx] *= decayFactor;

            if (mouse.x >= 0 && influenceStrength > 0) {
              const cellX = (col + 0.5) / columns;
              const cellY = 1 - (row + 0.5) / rows;
              const dist = Math.hypot(cellX - mouse.x, cellY - mouse.y);
              const spatial = Math.max(0, 1 - dist / mouseRadius);
              influenceData[idx] = Math.max(influenceData[idx], spatial * influenceStrength);
            }
          }
        }

        if (webglWorking) {
          const gl = glRef.current!;
          const program = programRef.current;
          if (gl && program && textureRef.current) {
            // Helpers with null-checks for uniform locations
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

            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, influenceTextureRef.current);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, columns, rows, 0, gl.RED, gl.FLOAT, influenceData);

            // Inline render logic
            gl.viewport(0, 0, canvasWidth * pixelRatio, canvasHeight * pixelRatio);
            gl.clear(gl.COLOR_BUFFER_BIT);

            const actualCellSizeX = (canvasWidth * pixelRatio) / columns;
            const actualCellSizeY = (canvasHeight * pixelRatio) / rows;

            set2f('u_resolution', canvasWidth * pixelRatio, canvasHeight * pixelRatio);
            set1f('u_rows', rows);
            set1f('u_columns', columns);
            set1f('u_cellSize', Math.min(actualCellSizeX, actualCellSizeY));
            set1f('u_transitionProgress', transitionProgressRef.current);
            set1f('u_pixelRatio', pixelRatio);
            set2f('u_imageAspect', imageAspectRef.current.width, imageAspectRef.current.height);
            set2f('u_nextImageAspect', nextImageAspectRef.current.width, nextImageAspectRef.current.height);
            set1i('u_objectFit', objectFit === 'cover' ? 0 : objectFit === 'contain' ? 1 : 2);
            set1i('u_rippleEffect', rippleEffect ? 1 : 0);
            set1f('u_rippleIntensity', rippleIntensity);
            set1f('u_rippleFrequency', rippleFrequency);
            set1f('u_mouseInfluenceMultiplier', mouseInfluenceMultiplier);
            set1f('u_influenceDamping', 0.75);
            set1f('u_time', (typeof performance !== 'undefined' ? performance.now() : 0) / 1000.0);

            // Fill uniforms (current)
            set1i('u_fillType', fillCurrentRef.current.type);
            set3f(
              'u_fillColorA',
              fillCurrentRef.current.colorA[0],
              fillCurrentRef.current.colorA[1],
              fillCurrentRef.current.colorA[2]
            );
            set3f(
              'u_fillColorB',
              fillCurrentRef.current.colorB[0],
              fillCurrentRef.current.colorB[1],
              fillCurrentRef.current.colorB[2]
            );
            set1i('u_fillHasB', fillCurrentRef.current.hasB ? 1 : 0);
            set1f('u_fillAngle', fillCurrentRef.current.angle);
            set2f('u_fillCenter', fillCurrentRef.current.center.x, fillCurrentRef.current.center.y);
            set1f('u_fillRadius', fillCurrentRef.current.radius);

            // Fill uniforms (next)
            const hasNextFill = isFillTransitioningRef.current;
            set1i('u_hasNextFill', hasNextFill ? 1 : 0);
            if (hasNextFill) {
              set1i('u_nextFillType', fillNextRef.current.type);
              set3f(
                'u_nextFillColorA',
                fillNextRef.current.colorA[0],
                fillNextRef.current.colorA[1],
                fillNextRef.current.colorA[2]
              );
              set3f(
                'u_nextFillColorB',
                fillNextRef.current.colorB[0],
                fillNextRef.current.colorB[1],
                fillNextRef.current.colorB[2]
              );
              set1i('u_nextFillHasB', fillNextRef.current.hasB ? 1 : 0);
              set1f('u_nextFillAngle', fillNextRef.current.angle);
              set2f('u_nextFillCenter', fillNextRef.current.center.x, fillNextRef.current.center.y);
              set1f('u_nextFillRadius', fillNextRef.current.radius);
            }
            // Decouple fill transition from image transition for smooth color fades
            set1f('u_fillTransitionProgress', fillTransitionProgressRef.current);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
            set1i('u_image', 0);

            const hasNextImage = nextTextureRef.current !== null && isTransitioning;
            set1i('u_hasNextImage', hasNextImage ? 1 : 0);

            if (hasNextImage) {
              gl.activeTexture(gl.TEXTURE1);
              gl.bindTexture(gl.TEXTURE_2D, nextTextureRef.current);
              set1i('u_nextImage', 1);
            }

            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, influenceTextureRef.current);
            set1i('u_influenceMap', 2);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          }
        }

        // Always continue animation to prevent interruptions, but only if play is true
        if (
          play &&
          (isTransitioningRef.current ||
            isMouseOver ||
            mouseInfluenceStrengthRef.current > 0 ||
            isFillTransitioningRef.current)
        ) {
          shouldContinue = true;
        }

        if (shouldContinue) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          isAnimatingRef.current = false;
          animationFrameRef.current = undefined;
        }
      },
      [
        isTransitioning,
        transitionDuration,
        onTransitionComplete,
        isMouseOver,
        webglWorking,
        mouseDecayTau,
        mouseRadius,
        rows,
        columns,
        transitionProgress,
      ]
    ) as (timestamp: number) => void;

    // Load image as texture with aspect ratio tracking and versioning
    const loadTexture = useCallback(
      (imageSrc: string, slot: 'main' | 'next' = 'main') => {
        const gl = glRef.current;
        if (!gl) return;

        const loadingVersion = ++loadingVersionRef.current;
        const img = new Image();

        img.onload = () => {
          if (loadingVersion !== loadingVersionRef.current) return;

          const texture = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

          const aspect = { width: img.width, height: img.height };

          if (slot === 'next') {
            // Always set as next texture and start transition if not already transitioning
            nextTextureRef.current = texture;
            nextImageAspectRef.current = aspect;
            setNextImageAspect(aspect);
            if (!isTransitioningRef.current) {
              setIsTransitioning(true);
              isTransitioningRef.current = true;
              transitionStartTime.current = typeof performance !== 'undefined' ? performance.now() : 0;
              transitionProgressRef.current = 0;
              transitionCompletionHandledRef.current = false;
              if (!isAnimatingRef.current) {
                const startAnimation = () => {
                  if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                  }
                  lastAnimationTimeRef.current = typeof performance !== 'undefined' ? performance.now() : 0;
                  animationFrameRef.current = requestAnimationFrame(animate);
                  isAnimatingRef.current = true;
                };
                startAnimation();
              }
            }
          } else {
            textureRef.current = texture;
            imageAspectRef.current = aspect;
            setImageAspect(aspect);
            // Draw an initial frame immediately after the first image loads
            if (webglWorking && !animationFrameRef.current) {
              const startAnimation = () => {
                lastAnimationTimeRef.current = typeof performance !== 'undefined' ? performance.now() : 0;
                animationFrameRef.current = requestAnimationFrame(animate);
                isAnimatingRef.current = true;
              };
              startAnimation();
            }
          }
          setError(null);
        };

        img.onerror = () => {
          console.error('Failed to load image:', imageSrc);
          setError('Failed to load image');
          if (slot === 'next') {
            nextTextureRef.current = fallbackTextureRef.current;
            nextImageAspectRef.current = { width: 1, height: 1 };
            setNextImageAspect({ width: 1, height: 1 });
            setIsTransitioning(true);
            isTransitioningRef.current = true;
            transitionStartTime.current = typeof performance !== 'undefined' ? performance.now() : 0;
            transitionProgressRef.current = 0;
            transitionCompletionHandledRef.current = false;
          } else {
            textureRef.current = fallbackTextureRef.current;
            imageAspectRef.current = { width: 1, height: 1 };
            setImageAspect({ width: 1, height: 1 });
          }
        };
        img.src = imageSrc;
      },
      [isTransitioning, nextFill, mapFillToInternal, animate]
    ) as (imageSrc: string, slot?: 'main' | 'next') => void;

    // Removed internal queue; parent controls sequencing

    // Initialize WebGL on mount
    useEffect(() => {
      initWebGL();
    }, [initWebGL]);

    // Load initial image
    useEffect(() => {
      if (src && glRef.current) {
        loadTexture(src, 'main');
      }
    }, [src, loadTexture]);

    // Initialize or update current fill from prop only when not fading to a nextFill
    useEffect(() => {
      if (!isFillTransitioningRef.current && !nextFill) {
        fillCurrentRef.current = mapFillToInternal(fill);
      }
    }, [fill, nextFill, mapFillToInternal]);

    // Handle next fill transition with smooth retargeting
    useEffect(() => {
      if (nextFill) {
        const now = performance.now();
        // If already transitioning, promote current blended state to new base
        if (isFillTransitioningRef.current) {
          const p = Math.min(Math.max(fillTransitionProgressRef.current, 0), 1);
          const cur = fillCurrentRef.current;
          const nxt = fillNextRef.current;
          const mix = (
            a: [number, number, number],
            b: [number, number, number],
            t: number
          ): [number, number, number] => [
            a[0] * (1 - t) + b[0] * t,
            a[1] * (1 - t) + b[1] * t,
            a[2] * (1 - t) + b[2] * t,
          ];
          fillCurrentRef.current = {
            ...cur,
            colorA: mix(cur.colorA, nxt.colorA, p),
            colorB: mix(cur.colorB, nxt.colorB, p),
            hasB: cur.hasB || nxt.hasB,
          };
        } else {
          isFillTransitioningRef.current = true;
        }
        fillNextRef.current = mapFillToInternal(nextFill);
        fillTransitionStartTimeRef.current = now;
        fillTransitionProgressRef.current = 0;
        if (!animationFrameRef.current) {
          lastAnimationTimeRef.current = now;
          animationFrameRef.current = requestAnimationFrame(animate);
          isAnimatingRef.current = true;
        }
      }
    }, [nextFill, fillTrigger, animate, mapFillToInternal]);

    // Handle next image with single-buffer queuing
    useEffect(() => {
      if (!nextSrc || !textureRef.current) return;
      if (!isTransitioningRef.current) {
        loadTexture(nextSrc, 'next');
      } else {
        // Buffer one follow-up; latest wins
        bufferedNextSrcRef.current = nextSrc;
      }
    }, [nextSrc, loadTexture]);

    // Start animation loop when needed
    useEffect(() => {
      if (
        play &&
        (isTransitioningRef.current || isMouseOver || mouseInfluenceStrengthRef.current > 0) &&
        !animationFrameRef.current
      ) {
        lastAnimationTimeRef.current = performance.now();
        animationFrameRef.current = requestAnimationFrame(animate);
        isAnimatingRef.current = true;
      }

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = undefined;
          isAnimatingRef.current = false;
        }
      };
    }, [play, isTransitioning, isMouseOver, animate]);

    // Removed duplicate WebGL render path in favor of a single animate tick

    // Fallback Canvas 2D rendering with basic mouse interaction
    const renderCanvas2D = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      if (error) {
        ctx.fillStyle = '#ff0000';
        ctx.font = '16px Arial';
        ctx.fillText('Image load failed', 10, 20);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCanvas.width = columns;
        tempCanvas.height = rows;
        tempCtx.drawImage(img, 0, 0, columns, rows);

        const imageData = tempCtx.getImageData(0, 0, columns, rows);
        const data = imageData.data;

        ctx.fillStyle = '#000000';

        const maxRadius = cellSize * 0.45;
        const influenceData = influenceDataRef.current;

        for (let row = 0; row < rows; row++) {
          // row=0 top
          for (let col = 0; col < columns; col++) {
            const index = (row * columns + col) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const brightness = (r + g + b) / 3 / 255;
            let dotRadius = (1 - brightness) * maxRadius;

            const idx = row * columns + col;
            dotRadius += influenceData[idx] * maxRadius * mouseInfluenceMultiplier;

            if (dotRadius > 0.25) {
              const x = col * cellSize + cellSize / 2;
              const y = row * cellSize + cellSize / 2;

              ctx.beginPath();
              ctx.arc(x, y, dotRadius, 0, 2 * Math.PI);
              ctx.fill();
            }
          }
        }
      };

      img.onerror = () => {
        setError('Failed to load image');
        ctx.fillStyle = '#ff0000';
        ctx.font = '16px Arial';
        ctx.fillText('Image load failed', 10, 20);
      };

      if (src) {
        img.src = src;
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
    }, [src, canvasWidth, canvasHeight, rows, columns, cellSize, error, mouseInfluenceMultiplier]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      mousePosRef.current = { x, y };
    }, []);

    const handleMouseEnter = useCallback(() => {
      setIsMouseOver(true);
      if (mouseInfluenceAnimationRef.current) {
        cancelAnimationFrame(mouseInfluenceAnimationRef.current);
      }
      const startTime = performance.now();
      const duration = mouseEnterDuration;
      const animateInfluence = (ts: number) => {
        const elapsed = ts - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        mouseInfluenceStrengthRef.current = easeOut;
        if (progress < 1) {
          mouseInfluenceAnimationRef.current = requestAnimationFrame(animateInfluence);
        }
      };
      mouseInfluenceAnimationRef.current = requestAnimationFrame(animateInfluence);
    }, [mouseEnterDuration]);

    const handleMouseLeave = useCallback(() => {
      setIsMouseOver(false);
      if (mouseInfluenceAnimationRef.current) {
        cancelAnimationFrame(mouseInfluenceAnimationRef.current);
      }
      const startTime = performance.now();
      const startValue = mouseInfluenceStrengthRef.current;
      const duration = mouseExitDuration;
      const animateInfluence = (ts: number) => {
        const elapsed = ts - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 2);
        mouseInfluenceStrengthRef.current = startValue * (1 - easeOut);
        if (progress < 1) {
          mouseInfluenceAnimationRef.current = requestAnimationFrame(animateInfluence);
        } else {
          mousePosRef.current = { x: -1, y: -1 };
          mouseInfluenceStrengthRef.current = 0;
          influenceDataRef.current.fill(0);
        }
      };
      mouseInfluenceAnimationRef.current = requestAnimationFrame(animateInfluence);
    }, [mouseExitDuration]);

    // Cleanup animation on unmount
    useEffect(() => {
      return () => {
        if (mouseInfluenceAnimationRef.current) {
          cancelAnimationFrame(mouseInfluenceAnimationRef.current);
        }
      };
    }, []);

    return (
      <div style={{ position: 'relative' }} className={className}>
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            maxWidth: '100%',
            display: 'block',
            ...style,
          }}
        />
        {error && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              color: 'red',
              fontFamily: 'Arial, sans-serif',
              fontSize: '16px',
            }}
          >
            {error}
          </div>
        )}
      </div>
    );
  }
);

export default DotHalftone;
