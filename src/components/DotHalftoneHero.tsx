import React, { useEffect, useMemo, useRef, useState } from 'react';
import DotHalftoneArt, { OverlayCell } from './DotHalftoneArt';

// Utility function to replace gatsby's withAssetPrefix
const withAssetPrefix = (path: string) => {
  // Remove 'url()' wrapper if present and extract path
  const cleanPath = path.replace(/^url\((['"]?)(.+)\1\)$/, '$2');
  return cleanPath;
};

export type DotHalftoneHeroProps = {
  style?: React.CSSProperties;
};

export const DotHalftoneHero: React.FC<DotHalftoneHeroProps> = ({ style }) => {
  // Temporary debug: set to false or delete to hide all city markers
  const SHOW_ALL_CITY_MARKERS = false;
  const rows = 150;
  const columns = 250;
  const cellSize = 8;
  const startScale = 2.0;
  const panFrom = useMemo(() => ({ x: -0.27, y: 0.09 }), []);
  const panTo = useMemo(() => ({ x: -0.33, y: 0.16 }), []);
  const pathDurationMs = 3000;
  const pathDelayMs = 2000;

  const bezierScale = useMemo(() => [0.8, 0, 0.01, 1] as const, []);
  const bezierPanX = useMemo(() => [0.8, 0, 0.01, 1] as const, []);
  const bezierPanY = useMemo(() => [0.8, 0, 0.01, 1] as const, []);

  const nycCellRow = Math.floor(rows * 0.71);
  const nycCellCol = Math.floor(columns * 0.245);
  const londonCellRow = Math.floor(rows * 0.77);
  const londonCellCol = Math.floor(columns * 0.46);

  const pathCellsFull: OverlayCell[] = useMemo(() => {
    const cells: OverlayCell[] = [];
    const r0 = nycCellRow;
    const c0 = nycCellCol;
    const r1 = londonCellRow;
    const c1 = londonCellCol;
    const dRow = Math.max(0, r1 - r0);
    const dCol = Math.max(0, c1 - c0);
    const extraEast = Math.max(0, dCol - dRow);
    const eastBefore = Math.floor(extraEast / 1.5);
    const eastAfter = extraEast - eastBefore;
    for (let i = 1; i <= eastBefore; i++) {
      const cc = c0 + i;
      if (r0 >= 0 && r0 < rows && cc >= 0 && cc < columns) cells.push({ row: r0, col: cc });
    }
    for (let i = 1; i <= dRow; i++) {
      const rr = r0 + i;
      const cc = c0 + eastBefore + i;
      if (rr >= 0 && rr < rows && cc >= 0 && cc < columns) cells.push({ row: rr, col: cc });
    }
    for (let i = 1; i <= eastAfter; i++) {
      const rr = r0 + dRow;
      const cc = c0 + eastBefore + dRow + i;
      if (rr >= 0 && rr < rows && cc >= 0 && cc < columns) cells.push({ row: rr, col: cc });
    }
    return cells;
  }, [rows, columns, nycCellRow, nycCellCol, londonCellRow, londonCellCol]);

  const [animatedPathCells, setAnimatedPathCells] = useState<OverlayCell[]>([]);
  const [rippleNonce, setRippleNonce] = useState(0);
  const [altOverlayCells, setAltOverlayCells] = useState<OverlayCell[]>([]);
  const [cityOverlayCells, setCityOverlayCells] = useState<OverlayCell[]>([]);
  const [pathDone, setPathDone] = useState(false);
  const [transformsDone, setTransformsDone] = useState(false);
  const nycUV = useMemo(
    () => ({ x: (nycCellCol + 0.5) / columns, y: 1 - (nycCellRow + 0.5) / rows }),
    [nycCellCol, nycCellRow, columns, rows]
  );
  const londonUV = useMemo(
    () => ({ x: (londonCellCol + 0.5) / columns, y: 1 - (londonCellRow + 0.5) / rows }),
    [londonCellCol, londonCellRow, columns, rows]
  );
  const [rippleCenterUV, setRippleCenterUV] = useState(londonUV);
  const pivotAdjust = useMemo(() => ({ x: 0.26, y: 0.21 }), []);
  const visualPivot = useMemo(
    () => ({
      x: Math.min(1, Math.max(0, londonUV.x + pivotAdjust.x)),
      y: Math.min(1, Math.max(0, londonUV.y + pivotAdjust.y)),
    }),
    [londonUV, pivotAdjust]
  );
  const rafRef = useRef<number | null>(null);
  const hoverTimerRef = useRef<number | null>(null);
  const [hoverActive, setHoverActive] = useState(false);
  const [hoverRamp, setHoverRamp] = useState(0);
  const hoverRampRafRef = useRef<number | null>(null);
  const clickDecayTimeoutsRef = useRef<number[]>([]);

  const handleTransformsComplete = useMemo(
    () => () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
      if (hoverRampRafRef.current) {
        cancelAnimationFrame(hoverRampRafRef.current);
        hoverRampRafRef.current = null;
      }
      setHoverRamp(0);
      setHoverActive(true);
      const start = performance.now();
      const duration = 3000;
      const step = () => {
        const p = Math.min(1, (performance.now() - start) / duration);
        setHoverRamp(p);
        if (p < 1) hoverRampRafRef.current = requestAnimationFrame(step);
        else hoverRampRafRef.current = null;
      };
      hoverRampRafRef.current = requestAnimationFrame(step);
      setTransformsDone(true);
    },
    []
  );

  useEffect(() => {
    if (pathCellsFull.length === 0) {
      setAnimatedPathCells([]);
      return;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setAnimatedPathCells([]);
    setHoverActive(false);
    const startTs = performance.now();
    const ease = (u: number) => 1 - Math.pow(1 - u, 3);
    const dotIntervalMs = Math.max(8, Math.ceil(pathDurationMs / Math.max(1, pathCellsFull.length)));
    const tick = () => {
      const now = performance.now();
      const elapsed = now - startTs;
      const tAdj = Math.max(0, elapsed - pathDelayMs);
      const p = Math.min(1, tAdj / pathDurationMs);
      const k = ease(p);
      const rawCount = Math.floor(k * pathCellsFull.length);
      const stepped = Math.floor(tAdj / dotIntervalMs);
      const total = pathCellsFull.length;
      const count = Math.min(rawCount, stepped, total);
      if (count > 0) setAnimatedPathCells(pathCellsFull.slice(0, count));
      if (count < total) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        setAnimatedPathCells(pathCellsFull);
        setTimeout(() => {
          setRippleCenterUV(nycUV);
          setRippleNonce((n) => n + 1);
        }, 80);
        setPathDone(true);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
    };
  }, [pathCellsFull, pathDurationMs, pathDelayMs, londonUV]);

  // Keep the NYC→London path persistent after intro

  // Seed only London as initial alt overlay once mounted
  useEffect(() => {
    setAltOverlayCells([
      { row: londonCellRow, col: londonCellCol },
    ]);
    // Trigger initial ripple at London after a short delay
    setTimeout(() => {
      setRippleCenterUV(londonUV);
      setRippleNonce((n) => n + 1);
    }, 500);
  }, [londonCellRow, londonCellCol, londonUV]);

  // Additional cities to progressively light up (rough approximations in grid space)
  const additionalCityCells = useMemo<OverlayCell[]>(() => {
    const frac = (
      r: number,
      c: number
    ): OverlayCell => ({ row: Math.max(0, Math.min(rows - 1, Math.floor(rows * r))), col: Math.max(0, Math.min(columns - 1, Math.floor(columns * c))) });
    const list: OverlayCell[] = [
      frac(0.69, 0.438),
      frac(0.49, 0.23),
      frac(0.73, 0.12),
      frac(0.74, 0.51),
      frac(0.4, 0.22),
      frac(0.68, 0.23),
      frac(0.45, 0.5),
      frac(0.725, 0.47),
      frac(0.65, 0.555),
      frac(0.7, 0.11),
    ];
    // Filter out NYC/London if any overlap by chance
    return list.filter((c) => !(c.row === nycCellRow && c.col === nycCellCol) && !(c.row === londonCellRow && c.col === londonCellCol));
  }, [rows, columns, nycCellRow, nycCellCol, londonCellRow, londonCellCol]);

  // After intro animations complete, light up a new city every 5s with ripple
  useEffect(() => {
    if (!pathDone || !transformsDone) return;
    let idx = 0;
    let loops = 0;
    const removalTimeouts: number[] = [];
    const isPinned = (r: number, c: number) =>
      (r === nycCellRow && c === nycCellCol) || (r === londonCellRow && c === londonCellCol);
    const id = window.setInterval(() => {
      const next = additionalCityCells[idx++];
      if (!next) {
        idx = 0;
        loops += 1;
        if (loops >= 3) {
          window.clearInterval(id);
        }
        return;
      }
      setCityOverlayCells((prev) => {
        const exists = prev.some((p) => p.row === next.row && p.col === next.col);
        return exists ? prev : [...prev, next];
      });
      const uv = { x: (next.col + 0.5) / columns, y: 1 - (next.row + 0.5) / rows };
      setRippleCenterUV(uv);
      setRippleNonce((n) => n + 1);
      const to = window.setTimeout(() => {
        setCityOverlayCells((prev) => prev.filter((p) => !(p.row === next.row && p.col === next.col)));
      }, 17500);
      removalTimeouts.push(to);
    }, 5000);
    return () => {
      window.clearInterval(id);
      removalTimeouts.forEach((t) => window.clearTimeout(t));
      clickDecayTimeoutsRef.current.forEach((t) => window.clearTimeout(t));
      clickDecayTimeoutsRef.current = [];
    };
  }, [pathDone, transformsDone, additionalCityCells, columns, rows, nycCellRow, nycCellCol, londonCellRow, londonCellCol]);

  return (
    <DotHalftoneArt
      src={withAssetPrefix('/vietnam.jpg')}
      rows={rows}
      columns={columns}
      cellSize={cellSize}
      scaleFrom={startScale}
      scaleTo={1.0}
      panFrom={panFrom}
      panTo={panTo}
      transformDurationScaleMs={5000}
      transformDelayScaleMs={260}
      transformDurationPanXMs={5000}
      transformDelayPanXMs={260}
      transformDurationPanYMs={5000}
      transformDelayPanYMs={260}
      transformBezierScale={bezierScale}
      transformBezierPanX={bezierPanX}
      transformBezierPanY={bezierPanY}
      revealEnabled
      revealCenterUV={{ x: (londonCellCol + 0.5) / columns, y: 1 - (londonCellRow + 0.5) / rows }}
      revealDurationMs={5000}
      revealDelayMs={260}
      revealFeatherCellsStart={0}
      revealFeatherCellsEnd={100}
      revealBezier={[1, 0, 0.8, 1]}
      edgeFadeStrength={1}
      edgeFadeFeatherCellsStart={6}
      edgeFadeFeatherCellsEnd={35}
      fill={useMemo(
        () => ({
          angleDeg: -75,
          stops: ['#d8faa1', '#a9f153', '#3fd564', '#3cb450'],
        }),
        []
      )}
      overlayCells={[]}
      overlayCellsAlt={[
        ...altOverlayCells,
        ...(SHOW_ALL_CITY_MARKERS ? additionalCityCells : []),
      ]}
      overlayCellsTemp={cityOverlayCells}
      overlayTempDarkenFactor={0.3}

      overlayFadeInMs={450}
      overlayFadeOutMs={200}
      overlayFadeDelayMs={250}
      overlayTempFadeInMs={350}
      overlayTempFadeOutMs={1000}
      overlayTempFadeDelayMs={0}
      overlayColor="#3fd564"
      overlayColorAlt="#3cb450"
      overlayMinDotDiameterPx={4}
      rippleEnabled
      rippleCenterUV={rippleCenterUV}
      rippleStartSignal={rippleNonce}
      rippleDurationMs={1600}
      rippleIntensity={1.6}
      rippleFrequency={1.0}
      rippleRadiusCells={28}
      rippleWaveSpeed={7.5}
      objectFit="cover"
      visualPivotUV={visualPivot}
      overlayCrossEnabled={false}
      dotScale={0.9}
      minDotDiameterPx={4}
      binaryThreshold={0.42}
      hoverEnabled={hoverActive}
      mouseRadius={0.03}
      mouseInfluenceMultiplier={0.75 * hoverRamp}
      hoverDarkenStrength={0.0}
      mouseDecayTau={1.3}
      onTransformsComplete={handleTransformsComplete}
      onCanvasClick={({ row, col }) => {
        // Add a transient dot at clicked cell; auto-remove after 17.5s
        const cell = { row, col };
        setCityOverlayCells((prev) => {
          const exists = prev.some((p) => p.row === cell.row && p.col === cell.col);
          return exists ? prev : [...prev, cell];
        });
        const to = window.setTimeout(() => {
          setCityOverlayCells((prev) => prev.filter((p) => !(p.row === cell.row && p.col === cell.col)));
        }, 5000);
        clickDecayTimeoutsRef.current.push(to);
      }}
      style={
        style ?? {
          position: 'relative',
          marginTop: '-130px',
          left: '50%',
          transform: 'translate(-50%, 0%)',
          maxWidth: 'none',
        }
      }
    />
  );
};

export default DotHalftoneHero;
