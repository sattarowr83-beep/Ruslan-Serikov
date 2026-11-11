export const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Неровная «органическая» форма (кусочек курицы, пятно и т.п.)
export const blob = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
  points = 9,
  irr = 0.25,
  rot = 0,
) => {
  const r = rng(seed);
  const pts: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2 + rot;
    const k = 1 + (r() - 0.5) * 2 * irr;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  const mid = (p: [number, number], q: [number, number]) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const m0 = mid(pts[pts.length - 1], pts[0]);
  let d = `M${m0[0].toFixed(1)},${m0[1].toFixed(1)}`;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const m = mid(p, pts[(i + 1) % pts.length]);
    d += ` Q${p[0].toFixed(1)},${p[1].toFixed(1)} ${m[0].toFixed(1)},${m[1].toFixed(1)}`;
  }
  return d + 'Z';
};
