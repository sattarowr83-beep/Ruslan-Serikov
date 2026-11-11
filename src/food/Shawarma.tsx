import React from 'react';
import {blob, rng} from '../rand';
import {C} from '../menu';

// Шаурма в разрезе. viewBox 600×900, срез сверху в точке FACE.
export const SHAWARMA_VB = {w: 600, h: 900};
export const SHAWARMA_FACE = {x: 300, y: 250};

type Piece = {t: 'chicken' | 'tomato' | 'cucumber' | 'lettuce' | 'onion'; x: number; y: number; r: number; s: number};

const PIECES: Piece[] = (() => {
  const list: Piece[] = [
    // задний ряд — зелень
    {t: 'lettuce', x: 215, y: 205, r: 70, s: 1},
    {t: 'lettuce', x: 330, y: 182, r: 80, s: 2},
    {t: 'lettuce', x: 405, y: 222, r: 60, s: 3},
    // курица (сзади вперёд)
    {t: 'chicken', x: 250, y: 190, r: 44, s: 11},
    {t: 'chicken', x: 345, y: 186, r: 46, s: 12},
    {t: 'chicken', x: 190, y: 238, r: 40, s: 13},
    {t: 'tomato', x: 298, y: 214, r: 32, s: 21},
    {t: 'chicken', x: 410, y: 245, r: 40, s: 14},
    {t: 'cucumber', x: 232, y: 262, r: 25, s: 31},
    {t: 'chicken', x: 300, y: 252, r: 46, s: 15},
    {t: 'onion', x: 375, y: 270, r: 26, s: 41},
    {t: 'tomato', x: 395, y: 210, r: 26, s: 22},
    {t: 'chicken', x: 205, y: 290, r: 36, s: 16},
    {t: 'cucumber', x: 352, y: 300, r: 24, s: 32},
    {t: 'chicken', x: 262, y: 300, r: 40, s: 17},
    {t: 'tomato', x: 175, y: 268, r: 22, s: 23},
    {t: 'chicken', x: 405, y: 302, r: 34, s: 18},
    {t: 'cucumber', x: 440, y: 270, r: 20, s: 33},
  ];
  return list;
})();

const Chicken: React.FC<{p: Piece; uid: string}> = ({p, uid}) => {
  const r = rng(p.s);
  const d = blob(p.x, p.y, p.r, p.r * 0.72, p.s, 8, 0.28, r() * 3);
  const sear = Array.from({length: 3}, (_, i) => {
    const ox = (r() - 0.5) * p.r;
    const oy = (r() - 0.5) * p.r * 0.5;
    return `M${p.x + ox - p.r * 0.35},${p.y + oy} q${p.r * 0.3},${-p.r * 0.18} ${p.r * 0.7},0`;
  });
  return (
    <g>
      <path d={d} fill={`url(#${uid}-chick)`} stroke="#8E4A1B" strokeWidth={2.5} />
      {sear.map((s, i) => (
        <path key={i} d={s} stroke="#7A3A12" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.55} />
      ))}
      <ellipse cx={p.x - p.r * 0.25} cy={p.y - p.r * 0.3} rx={p.r * 0.28} ry={p.r * 0.12} fill="#FFE7B8" opacity={0.55} />
    </g>
  );
};

const Tomato: React.FC<{p: Piece}> = ({p}) => {
  const r = rng(p.s);
  return (
    <g transform={`rotate(${(r() - 0.5) * 50} ${p.x} ${p.y})`}>
      <ellipse cx={p.x} cy={p.y} rx={p.r} ry={p.r * 0.78} fill="#C92A1B" />
      <ellipse cx={p.x} cy={p.y} rx={p.r * 0.8} ry={p.r * 0.6} fill="#EE5236" />
      {[-0.4, 0, 0.4].map((k, i) => (
        <ellipse key={i} cx={p.x + k * p.r} cy={p.y + 0.1 * p.r} rx={p.r * 0.12} ry={p.r * 0.2} fill="#FFD27A" />
      ))}
      <ellipse cx={p.x - p.r * 0.3} cy={p.y - p.r * 0.35} rx={p.r * 0.3} ry={p.r * 0.1} fill="#fff" opacity={0.45} />
    </g>
  );
};

const Cucumber: React.FC<{p: Piece}> = ({p}) => (
  <g>
    <ellipse cx={p.x} cy={p.y} rx={p.r} ry={p.r * 0.8} fill="#3C7A2B" />
    <ellipse cx={p.x} cy={p.y} rx={p.r * 0.84} ry={p.r * 0.66} fill="#BFE09A" />
    <ellipse cx={p.x} cy={p.y} rx={p.r * 0.5} ry={p.r * 0.38} fill="#E5F3C8" />
    {[0, 1, 2, 3].map((i) => (
      <ellipse
        key={i}
        cx={p.x + Math.cos(i * 1.57 + 0.6) * p.r * 0.3}
        cy={p.y + Math.sin(i * 1.57 + 0.6) * p.r * 0.22}
        rx={2.5}
        ry={4}
        fill="#A9C97E"
      />
    ))}
  </g>
);

const Onion: React.FC<{p: Piece}> = ({p}) => (
  <g fill="none" stroke="#C995C9" strokeWidth={4} opacity={0.9}>
    <path d={`M${p.x - p.r},${p.y} a${p.r},${p.r * 0.6} 0 0 1 ${p.r * 2},0`} />
    <path d={`M${p.x - p.r * 0.6},${p.y + 4} a${p.r * 0.6},${p.r * 0.35} 0 0 1 ${p.r * 1.2},0`} stroke="#F3E3F3" />
  </g>
);

const Lettuce: React.FC<{p: Piece}> = ({p}) => {
  const r = rng(p.s);
  let d = `M${p.x - p.r},${p.y + 20}`;
  const n = 7;
  for (let i = 0; i <= n; i++) {
    const x = p.x - p.r + (i / n) * p.r * 2;
    const y = p.y - 20 - r() * 26;
    d += ` Q${x - p.r / n},${y - 18} ${x},${y}`;
  }
  d += ` L${p.x + p.r},${p.y + 30} Z`;
  return (
    <g>
      <path d={d} fill="#7DB842" stroke="#4F8A2A" strokeWidth={3} />
      <path d={`M${p.x - p.r * 0.7},${p.y + 10} Q${p.x},${p.y - 20} ${p.x + p.r * 0.7},${p.y + 4}`} stroke="#C8E89A" strokeWidth={4} fill="none" />
    </g>
  );
};

export const Shawarma: React.FC<{uid: string; style?: React.CSSProperties}> = ({uid, style}) => {
  const body =
    'M118,250 A182,92 0 0 0 482,250 L486,790 C486,862 404,884 300,884 C196,884 114,862 114,790 Z';
  const wrapTop = (() => {
    let d = 'M104,628';
    for (let x = 104, i = 0; x <= 496; x += 28, i++) d += ` L${x},${i % 2 ? 610 : 632}`;
    return d;
  })();
  const r = rng(99);
  const spots = Array.from({length: 14}, (_, i) => ({
    x: 140 + r() * 320,
    y: 330 + r() * 290,
    rx: 8 + r() * 22,
    ry: 5 + r() * 10,
    s: 200 + i,
  }));
  return (
    <svg viewBox={`0 0 ${SHAWARMA_VB.w} ${SHAWARMA_VB.h}`} style={{overflow: 'visible', ...style}}>
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" x2="1">
          <stop offset="0" stopColor="#7E4213" />
          <stop offset="0.16" stopColor="#BF7A33" />
          <stop offset="0.36" stopColor="#E9B567" />
          <stop offset="0.47" stopColor="#F7D493" />
          <stop offset="0.6" stopColor="#DDA052" />
          <stop offset="0.84" stopColor="#A35E1F" />
          <stop offset="1" stopColor="#6E3810" />
        </linearGradient>
        <radialGradient id={`${uid}-chick`} cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#FAD08E" />
          <stop offset="0.55" stopColor="#E09A48" />
          <stop offset="1" stopColor="#A85A22" />
        </radialGradient>
        <linearGradient id={`${uid}-kraft`} x1="0" x2="1">
          <stop offset="0" stopColor="#B8925E" />
          <stop offset="0.4" stopColor="#EAD3A7" />
          <stop offset="0.55" stopColor="#F2E0BC" />
          <stop offset="1" stopColor="#A9824F" />
        </linearGradient>
        <radialGradient id={`${uid}-face`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.82" stopColor="#F7E6C1" />
          <stop offset="1" stopColor="#D9A865" />
        </radialGradient>
        <clipPath id={`${uid}-bodyClip`}>
          <path d={body} />
        </clipPath>
        <clipPath id={`${uid}-fillClip`}>
          <ellipse cx={300} cy={250} rx={156} ry={76} />
          <rect x={120} y={60} width={360} height={190} />
        </clipPath>
        <filter id={`${uid}-blur4`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id={`${uid}-blur2`}>
          <feGaussianBlur stdDeviation="2" />
        </filter>
        <filter id={`${uid}-toast`} filterUnits="userSpaceOnUse" x="100" y="150" width="400" height="760">
          <feTurbulence type="fractalNoise" baseFrequency="0.025 0.07" numOctaves="3" seed="4" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.33  0 0 0 0 0.15  0 0 0 0 0.04  0 0 0 1.7 -0.8" />
        </filter>
      </defs>

      {/* тело лаваша */}
      <path d={body} fill={`url(#${uid}-body)`} />
      <g clipPath={`url(#${uid}-bodyClip)`}>
        <rect x={100} y={150} width={400} height={760} filter={`url(#${uid}-toast)`} opacity={0.75} />
        {/* полосы гриля */}
        <g filter={`url(#${uid}-blur4)`}>
          {[300, 385, 470, 555, 640].map((y) => (
            <g key={y}>
              <path d={`M80,${y + 120} L520,${y - 40}`} stroke="#5A2A0C" strokeWidth={24} strokeLinecap="round" opacity={0.55} />
              <path d={`M80,${y + 146} L520,${y - 14}`} stroke="#FBD996" strokeWidth={7} opacity={0.4} />
            </g>
          ))}
        </g>
        {spots.map((s) => (
          <path key={s.s} d={blob(s.x, s.y, s.rx, s.ry, s.s, 7, 0.35)} fill="#5E2D0E" opacity={0.35} filter={`url(#${uid}-blur2)`} />
        ))}
        {/* складка лаваша */}
        <path d="M150,330 C200,420 190,520 240,610" stroke="#8A4A18" strokeWidth={5} fill="none" opacity={0.45} />
        <path d="M156,330 C206,420 196,520 246,610" stroke="#FFE2A6" strokeWidth={3} fill="none" opacity={0.45} />
        {/* блик */}
        <rect x={250} y={200} width={34} height={700} fill="#FFF3D6" opacity={0.18} filter={`url(#${uid}-blur4)`} />
      </g>

      {/* срез: край лаваша */}
      <ellipse cx={300} cy={250} rx={182} ry={92} fill={`url(#${uid}-face)`} stroke="#B9783A" strokeWidth={4} />
      <ellipse cx={300} cy={250} rx={170} ry={85} fill="none" stroke="#D7A766" strokeWidth={3} />
      <ellipse cx={300} cy={250} rx={162} ry={80} fill="#FFF7E8" />

      {/* начинка */}
      <g clipPath={`url(#${uid}-fillClip)`}>
        {PIECES.map((p, i) => {
          if (p.t === 'chicken') return <Chicken key={i} p={p} uid={uid} />;
          if (p.t === 'tomato') return <Tomato key={i} p={p} />;
          if (p.t === 'cucumber') return <Cucumber key={i} p={p} />;
          if (p.t === 'onion') return <Onion key={i} p={p} />;
          return <Lettuce key={i} p={p} />;
        })}
        {/* чесночный соус */}
        <path
          d="M170,232 C200,205 230,262 262,226 C292,196 318,258 350,222 C380,192 404,248 438,226"
          stroke="#FFF8EC"
          strokeWidth={13}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M172,228 C200,201 230,258 262,222 C292,192 318,254 350,218 C380,188 404,244 436,222"
          stroke="#fff"
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
          opacity={0.9}
        />
      </g>
      {/* капли соуса по краю */}
      <path d="M196,318 C196,340 190,356 198,372 C206,384 216,372 212,356 C208,340 214,328 214,318 Z" fill="#FFF8EC" />
      <path d="M372,322 C372,338 368,352 374,362 C380,370 388,362 386,350 C384,338 388,330 388,322 Z" fill="#FFF8EC" />
      <ellipse cx={201} cy={352} rx={3} ry={7} fill="#fff" />

      {/* крафтовая обёртка */}
      <path
        d={`${wrapTop} L496,632 L498,798 C498,868 410,894 300,894 C190,894 102,868 102,798 Z`}
        fill={`url(#${uid}-kraft)`}
        stroke="#9C7645"
        strokeWidth={2}
      />
      <rect x={102} y={686} width={396} height={22} fill={C.accent} />
      <text
        x={300}
        y={790}
        textAnchor="middle"
        fontFamily="Montserrat"
        fontWeight={900}
        fontSize={44}
        fill={C.accent}
        letterSpacing={3}
      >
        MUSLIM FOOD
      </text>
    </svg>
  );
};

// Пар над начинкой (в координатах viewBox шаурмы)
export const Steam: React.FC<{frame: number; opacity?: number}> = ({frame, opacity = 1}) => (
  <svg viewBox={`0 0 ${SHAWARMA_VB.w} ${SHAWARMA_VB.h}`} style={{position: 'absolute', inset: 0, overflow: 'visible', opacity}}>
    {[0, 1, 2].map((i) => {
      const t = ((frame + i * 22) % 66) / 66;
      const x = 230 + i * 70;
      const y = 150 - t * 150;
      const w = Math.sin(frame / 9 + i) * 14;
      return (
        <path
          key={i}
          d={`M${x},${y + 90} C${x + 26 + w},${y + 60} ${x - 26 - w},${y + 30} ${x},${y}`}
          stroke="#FFFFFF"
          strokeWidth={12}
          strokeLinecap="round"
          fill="none"
          opacity={Math.sin(t * Math.PI) * 0.45}
          style={{filter: 'blur(5px)'}}
        />
      );
    })}
  </svg>
);
