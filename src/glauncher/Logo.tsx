import React from 'react';

// Знак G-Launcher, перерисованный по кадрам исходного ролика.
// viewBox подогнан под знак: синяя «<»-образная полоса, нижняя планка и правый параллелограмм.
export const LOGO_VB = {x: 220, y: 640, w: 650, h: 520};

const BLUE = 'M515,655 L678,655 L372,1000 Q345,1032 345,1062 L345,1145 Q298,1142 268,1102 Q228,1046 262,988 Z';
const BOTTOM = 'M345,1058 L598,1058 L645,1145 L372,1145 Q345,1145 345,1118 Z';
const RIGHT = 'M497,900 L640,900 L855,1150 L705,1150 Z';

/** 3D-вариант (на тёмном фоне): синий + белый с тёмно-синей «толщиной». */
export const Logo3D: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => {
  const h = (size * LOGO_VB.h) / LOGO_VB.w;
  return (
    <svg
      width={size}
      height={h}
      viewBox={`${LOGO_VB.x} ${LOGO_VB.y} ${LOGO_VB.w} ${LOGO_VB.h + 30}`}
      style={{overflow: 'visible', ...style}}
    >
      <defs>
        <linearGradient id="lg-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3d8bff" />
          <stop offset="1" stopColor="#1f5fe0" />
        </linearGradient>
      </defs>
      {/* толщина */}
      <g transform="translate(-14,22)" fill="#1a3a9a">
        <path d={BLUE} />
        <path d={BOTTOM} />
        <path d={RIGHT} />
      </g>
      <path d={BLUE} fill="url(#lg-blue)" />
      <path d={BOTTOM} fill="#ffffff" />
      <path d={RIGHT} fill="#ffffff" />
    </svg>
  );
};

/** Плоский вариант (на белом круге). */
export const LogoFlat: React.FC<{size: number}> = ({size}) => {
  const h = (size * LOGO_VB.h) / LOGO_VB.w;
  return (
    <svg width={size} height={h} viewBox={`${LOGO_VB.x} ${LOGO_VB.y} ${LOGO_VB.w} ${LOGO_VB.h}`}>
      <path d={BLUE} fill="#2f7bff" />
      <path d={BOTTOM} fill="#0f1d4a" />
      <path d={RIGHT} fill="#0f1d4a" />
    </svg>
  );
};
