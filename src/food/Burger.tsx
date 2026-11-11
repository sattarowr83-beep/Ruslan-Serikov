import React from 'react';
import {blob, rng} from '../rand';

export const BURGER_VB = {w: 800, h: 720};

const cheesePath = (() => {
  const edge = 470;
  const drips: [number, number][] = [
    [648, 532],
    [560, 506],
    [468, 556],
    [356, 512],
    [252, 540],
    [150, 500],
  ];
  let d = 'M66,422 L734,422 C748,430 754,456 746,486 C736,478 716,468 694,470';
  for (const [x, depth] of drips) {
    d += ` L${x + 24},${edge}`;
    d += ` C${x + 22},${depth - 14} ${x + 16},${depth} ${x},${depth}`;
    d += ` C${x - 16},${depth} ${x - 22},${depth - 14} ${x - 24},${edge}`;
  }
  d += ` L108,${edge} C90,472 70,484 56,480 C52,454 56,432 66,422 Z`;
  return d;
})();

export const Burger: React.FC<{uid: string; style?: React.CSSProperties}> = ({uid, style}) => {
  const r = rng(7);
  const seeds = Array.from({length: 30}, () => {
    const x = 160 + r() * 480;
    const yTop = 120 + Math.pow((x - 400) / 300, 2) * 230;
    const y = yTop + 22 + r() * (330 - yTop - 22);
    return {x, y, a: (r() - 0.5) * 80};
  });
  const r2 = rng(17);
  const specks = Array.from({length: 60}, () => ({
    x: 100 + r2() * 600,
    y: 470 + r2() * 92,
    rx: 3 + r2() * 9,
    ry: 2 + r2() * 4,
    light: r2() > 0.55,
  }));
  const lettuce = (() => {
    let d = 'M72,372 L728,372';
    const n = 15;
    for (let i = n; i >= 0; i--) {
      const x = 72 + (i / n) * 656;
      const y = 404 + (i % 2 ? 16 : 0);
      d += ` Q${x + 22},${y + 18} ${x},${y}`;
    }
    return d + ' Z';
  })();
  return (
    <svg viewBox={`0 0 ${BURGER_VB.w} ${BURGER_VB.h}`} style={{overflow: 'visible', ...style}}>
      <defs>
        <radialGradient id={`${uid}-bun`} cx="0.36" cy="0.25" r="0.85">
          <stop offset="0" stopColor="#F9D08E" />
          <stop offset="0.35" stopColor="#E59C4B" />
          <stop offset="0.75" stopColor="#C46D29" />
          <stop offset="1" stopColor="#8E4B19" />
        </radialGradient>
        <linearGradient id={`${uid}-bunB`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E7A659" />
          <stop offset="1" stopColor="#A85C24" />
        </linearGradient>
        <linearGradient id={`${uid}-patty`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7A3C1C" />
          <stop offset="0.45" stopColor="#552610" />
          <stop offset="1" stopColor="#2C1206" />
        </linearGradient>
        <linearGradient id={`${uid}-cheese`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFDE63" />
          <stop offset="0.5" stopColor="#FBB82C" />
          <stop offset="1" stopColor="#EE9614" />
        </linearGradient>
        <linearGradient id={`${uid}-lettuce`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A9D85E" />
          <stop offset="1" stopColor="#5C9B2E" />
        </linearGradient>
        <filter id={`${uid}-rough`} x="-5%" y="-10%" width="110%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="12" />
        </filter>
        <filter id={`${uid}-soft`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <filter id={`${uid}-s3`}>
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* нижняя булка */}
      <path
        d="M110,556 L690,556 C702,556 708,566 708,582 C708,632 640,650 400,650 C160,650 92,632 92,582 C92,566 98,556 110,556 Z"
        fill={`url(#${uid}-bunB)`}
      />
      <path d="M120,560 L680,560 L684,574 L116,574 Z" fill="#F3D59F" opacity={0.8} />

      {/* котлета */}
      <g filter={`url(#${uid}-rough)`}>
        <path
          d="M82,474 C82,446 140,438 400,438 C660,438 718,446 718,474 L718,536 C718,566 660,576 400,576 C140,576 82,566 82,536 Z"
          fill={`url(#${uid}-patty)`}
        />
      </g>
      {specks.map((s, i) => (
        <ellipse key={i} cx={s.x} cy={s.y} rx={s.rx} ry={s.ry} fill={s.light ? '#A65A2A' : '#1E0B03'} opacity={s.light ? 0.7 : 0.6} />
      ))}
      {/* сочные блики */}
      {[
        [180, 528],
        [300, 548],
        [520, 538],
        [640, 520],
        [420, 556],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={14} ry={4} fill="#FFE2C4" opacity={0.55} />
      ))}
      {/* корочка от гриля */}
      <path d="M96,500 C300,490 500,494 704,502" stroke="#2A1004" strokeWidth={8} opacity={0.5} fill="none" filter={`url(#${uid}-s3)`} />

      {/* расплавленный сыр */}
      <path d={cheesePath} fill={`url(#${uid}-cheese)`} stroke="#E08A10" strokeWidth={2} />
      <path d="M78,430 L722,430" stroke="#FFF2AE" strokeWidth={7} strokeLinecap="round" opacity={0.8} />
      {[
        [468, 536],
        [252, 522],
        [648, 516],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x - 6} cy={y} rx={4} ry={9} fill="#FFF6C8" opacity={0.9} />
      ))}

      {/* томат */}
      <path d="M96,398 C96,388 110,384 140,384 L660,384 C690,384 704,388 704,398 L704,418 C704,428 690,432 660,432 L140,432 C110,432 96,428 96,418 Z" fill="#D2321F" />
      <path d="M120,394 L680,394 L680,410 L120,410 Z" fill="#F0613F" opacity={0.85} />

      {/* салат */}
      <path d={lettuce} fill={`url(#${uid}-lettuce)`} stroke="#4C8A26" strokeWidth={3} />
      {[150, 300, 460, 610].map((x) => (
        <path key={x} d={`M${x},378 q20,14 40,34`} stroke="#D3EFA3" strokeWidth={4} fill="none" opacity={0.8} />
      ))}

      {/* верхняя булка */}
      <path d="M96,372 C92,206 230,116 400,114 C570,116 708,206 704,372 C600,394 200,394 96,372 Z" fill={`url(#${uid}-bun)`} />
      <path d="M100,362 C220,388 580,388 700,362 L702,376 C580,402 220,402 98,376 Z" fill="#F3D49C" />
      <ellipse
        cx={300}
        cy={196}
        rx={130}
        ry={42}
        fill="#FFF6E2"
        opacity={0.42}
        transform="rotate(-18 300 196)"
        filter={`url(#${uid}-soft)`}
      />
      {seeds.map((s, i) => (
        <g key={i} transform={`rotate(${s.a} ${s.x} ${s.y})`}>
          <ellipse cx={s.x} cy={s.y + 1.5} rx={10} ry={5} fill="#9A5420" opacity={0.35} />
          <ellipse cx={s.x} cy={s.y} rx={9.5} ry={4.8} fill="#FFF3D6" />
        </g>
      ))}
      {/* лёгкие поджаристые пятна */}
      {[0, 1, 2].map((i) => (
        <path key={i} d={blob(470 + i * 60, 300 - i * 30, 40, 16, 300 + i)} fill="#8E4B19" opacity={0.18} filter={`url(#${uid}-s3)`} />
      ))}
    </svg>
  );
};
