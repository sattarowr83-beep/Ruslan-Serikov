import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Html5Audio,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {Logo3D, LogoFlat} from './Logo';
import {rng} from '../rand';

export const GL_FPS = 30;
export const GL_W = 1080;
export const GL_H = 1920;
export const GL_DURATION = 36 * GL_FPS;

const F = 'Montserrat, Arial, sans-serif';
const fontHandle = delayRender('Шрифт Montserrat (G-Launcher)');
const SAMPLE = 'Знакомо? Полдня готовишь заявку ИтогиБИН №₸«»… 0123456789';
Promise.all([600, 700, 800, 900].map((w) => document.fonts.load(`${w} 60px Montserrat`, SAMPLE)))
  .then(() => continueRender(fontHandle))
  .catch(() => continueRender(fontHandle));

/* ---------- время (в секундах, по паузам в озвучке) ---------- */
const S = (sec: number) => Math.round(sec * GL_FPS);
const T = {
  q: 0, // «Знакомо?»
  prep: 1.15, // «Полдня готовишь заявку»
  results: 2.8, // «а потом открываешь итоги…»
  worse: 4.4, // «…у конкурента больше баллов за опыт»
  think: 7.3, // «И думаешь:»
  quote: 8.7, // «Знал бы заранее…»
  logo: 10.35, // «Вот за что мне нравится G-Launcher»
  myBin: 12.55, // «Вводишь свой БИН»
  myScore: 13.65, // «и видишь, сколько у тебя баллов…»
  category: 15.5, // «по нужной категории»
  rivalBin: 16.7, // «Потом вводишь БИН конкурента и сравниваешь»
  wins: 19.3, // «Заодно видно, какие тендеры он уже выигрывал»
  useful: 21.85, // «По-моему, это реально полезно»
  before: 23.7, // «Ещё до подготовки заявки»
  edge: 25.75, // «понимаешь, у кого преимущество по опыту»
  cta: 27.55, // «Попробуйте сами»
  compare: 28.7, // «Возьмите конкурента… сравните свои баллы»
  link: 33.15, // «Ссылка на платформу в шапке профиля»
  end: 36,
};

const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = (f: number, a: number, b: number, e: (t: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(f, [a, b], [0, 1], {...CL, easing: e});
const back = Easing.out(Easing.back(1.6));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const BLUE = '#3d8bff';
const LIGHT_BLUE = '#5aa2ff';
const GREEN = '#22c55e';
const RED = '#ff5a6a';
const NAVY = '#0f1d4a';

/* ---------- фон: космос + неоновая сетка ---------- */
const STARS = (() => {
  const r = rng(11);
  return Array.from({length: 70}, () => ({x: r() * GL_W, y: r() * 1300, s: 2 + r() * 4, p: r() * 6.28}));
})();

const Background: React.FC = () => {
  const f = useCurrentFrame();
  const horizon = 1230;
  const scroll = (f * 2.2) % 90;
  const vLines = Array.from({length: 31}, (_, i) => i - 15);
  const hLines = Array.from({length: 14}, (_, i) => i);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#020615 0%,#06123a 45%,#0a1d5c 62%,#061238 100%)'}}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 60% 35% at 50% 52%, rgba(40,110,255,0.45), transparent 70%), radial-gradient(circle at 12% 30%, rgba(30,90,220,0.35), transparent 30%), radial-gradient(circle at 88% 80%, rgba(80,60,220,0.3), transparent 30%)',
        }}
      />
      {STARS.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: s.x,
            top: s.y,
            width: s.s,
            height: s.s,
            borderRadius: '50%',
            background: '#9cc4ff',
            opacity: 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(f / 14 + s.p)),
          }}
        />
      ))}
      <svg width={GL_W} height={GL_H} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="gridFade" x1="0" y1={horizon} x2="0" y2={GL_H} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#4d7dff" stopOpacity="0.15" />
            <stop offset="0.25" stopColor="#4d7dff" stopOpacity="0.8" />
            <stop offset="1" stopColor="#5b8cff" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <g stroke="url(#gridFade)" strokeWidth={2} fill="none">
          {vLines.map((v) => (
            <line key={v} x1={540 + v * 18} y1={horizon} x2={540 + v * 160} y2={GL_H} />
          ))}
          {hLines.map((i) => {
            // перспектива: z от 1 до 14, линии «едут» на зрителя
            const z = 14 - i - scroll / 90;
            const y = horizon + (GL_H - horizon) * (1 / Math.max(z, 0.35)) * 0.95;
            return y < GL_H ? <line key={i} x1={0} y1={y} x2={GL_W} y2={y} /> : null;
          })}
        </g>
        <rect x={0} y={horizon - 4} width={GL_W} height={8} fill="#6f9bff" opacity={0.35} />
      </svg>
    </AbsoluteFill>
  );
};

/* ---------- общие элементы ---------- */
const Title: React.FC<{
  lines: [string, string?];
  at: number;
  top?: number;
  size?: number;
  color2?: string;
}> = ({lines, at, top = 230, size = 78, color2 = LIGHT_BLUE}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', top, left: 60, right: 60, textAlign: 'center', fontFamily: F}}>
      {lines.map((l, i) => {
        if (!l) return null;
        const t = ease(f, S(at) + i * 5, S(at) + i * 5 + 12, back);
        return (
          <div
            key={i}
            style={{
              fontWeight: 900,
              fontSize: size,
              lineHeight: 1.12,
              color: i === 0 ? '#fff' : color2,
              textShadow: '0 6px 24px rgba(0,0,0,0.55)',
              opacity: Math.min(1, t * 2),
              transform: `translateY(${lerp(40, 0, t)}px) scale(${lerp(0.85, 1, t)})`,
            }}
          >
            {l}
          </div>
        );
      })}
    </div>
  );
};

/** Сцена: появляется с подъёмом, уходит с затуханием. */
const Scene: React.FC<{from: number; to: number; children: React.ReactNode}> = ({from, to, children}) => {
  const f = useCurrentFrame();
  const a = S(from);
  const b = S(to);
  if (f < a - 1 || f > b + 1) return null;
  const tin = ease(f, a, a + 9);
  const tout = ease(f, b - 7, b, Easing.in(Easing.cubic));
  return (
    <AbsoluteFill
      style={{
        opacity: tin * (1 - tout),
        transform: `translateY(${lerp(50, 0, tin) - tout * 40}px) scale(${lerp(0.96, 1, tin) + tout * 0.04})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const Window: React.FC<{
  x: number;
  y: number;
  w: number;
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({x, y, w, title, children, style}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      background: '#f4f6fb',
      borderRadius: 28,
      boxShadow: '0 30px 80px rgba(0,0,20,0.55), 0 0 0 2px rgba(255,255,255,0.6)',
      overflow: 'hidden',
      fontFamily: F,
      color: NAVY,
      ...style,
    }}
  >
    <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '20px 28px', background: '#e6eaf3'}}>
      {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
        <div key={c} style={{width: 18, height: 18, borderRadius: 9, background: c}} />
      ))}
      <div style={{marginLeft: 16, fontSize: 24, fontWeight: 600, color: '#7a86a3'}}>{title}</div>
    </div>
    <div style={{padding: 36}}>{children}</div>
  </div>
);

const Clock: React.FC<{x: number; y: number; size: number; speed: number}> = ({x, y, size, speed}) => {
  const f = useCurrentFrame();
  const a = f * speed;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{position: 'absolute', left: x, top: y}}>
      <circle cx="50" cy="50" r="46" fill="#fff" stroke="#ff5a6a" strokeWidth="7" />
      {Array.from({length: 12}, (_, i) => (
        <line
          key={i}
          x1="50"
          y1="10"
          x2="50"
          y2="16"
          stroke="#0f1d4a"
          strokeWidth="3"
          transform={`rotate(${i * 30} 50 50)`}
        />
      ))}
      <line x1="50" y1="50" x2="50" y2="26" stroke={NAVY} strokeWidth="5" strokeLinecap="round" transform={`rotate(${a / 12} 50 50)`} />
      <line x1="50" y1="50" x2="50" y2="18" stroke={RED} strokeWidth="3" strokeLinecap="round" transform={`rotate(${a} 50 50)`} />
      <circle cx="50" cy="50" r="4" fill={NAVY} />
    </svg>
  );
};

const Typing: React.FC<{text: string; at: number; cps?: number}> = ({text, at, cps = 14}) => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.min(text.length, Math.floor(((f - S(at)) / GL_FPS) * cps)));
  const caret = n < text.length || Math.floor(f / 10) % 2 === 0;
  return (
    <span>
      {text.slice(0, n)}
      <span style={{opacity: caret ? 1 : 0, color: BLUE}}>|</span>
    </span>
  );
};

const Count: React.FC<{to: number; at: number; dur?: number}> = ({to, at, dur = 0.8}) => {
  const f = useCurrentFrame();
  return <>{Math.round(to * ease(f, S(at), S(at + dur)))}</>;
};

/* ---------- сцены ---------- */
const SceneQuestion: React.FC = () => {
  const f = useCurrentFrame();
  const t = ease(f, 0, 14, back);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', fontFamily: F}}>
      <div
        style={{
          position: 'absolute',
          top: 520,
          fontSize: 720,
          fontWeight: 900,
          color: '#2a6cf0',
          textShadow: '-18px 22px 0 #163b9a, 0 0 80px rgba(60,130,255,0.6)',
          transform: `rotate(${lerp(-25, 8, t) + Math.sin(f / 8) * 3}deg) scale(${lerp(0.4, 1, t)})`,
          opacity: 0.9,
        }}
      >
        ?
      </div>
      <div
        style={{
          fontSize: 130,
          fontWeight: 900,
          color: '#fff',
          textShadow: '0 10px 40px rgba(0,0,0,0.6)',
          transform: `scale(${lerp(0.6, 1, ease(f, 3, 16, back))})`,
          opacity: ease(f, 3, 10),
        }}
      >
        Знакомо?
      </div>
    </AbsoluteFill>
  );
};

const CHECKS = ['Техническая спецификация', 'Документы о квалификации', 'Подтверждение опыта', 'Ценовое предложение'];

const ScenePrep: React.FC = () => {
  const f = useCurrentFrame();
  const a = S(T.prep);
  return (
    <AbsoluteFill>
      <Title lines={['Полдня готовишь', 'заявку']} at={T.prep} />
      <Window x={110} y={620} w={860} title="portal-zakupok … / заявка">
        <div style={{fontSize: 40, fontWeight: 800, marginBottom: 26}}>Заявка на участие</div>
        {CHECKS.map((c, i) => {
          const ti = ease(f, a + 6 + i * 9, a + 14 + i * 9);
          return (
            <div key={c} style={{display: 'flex', alignItems: 'center', gap: 22, margin: '20px 0', fontSize: 31, fontWeight: 600}}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: ti > 0.5 ? GREEN : '#dfe4ef',
                  color: '#fff',
                  fontSize: 30,
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${lerp(0.7, 1, ti)})`,
                }}
              >
                {ti > 0.5 ? '✓' : ''}
              </div>
              <span style={{opacity: lerp(0.45, 1, ti)}}>{c}</span>
            </div>
          );
        })}
        <div style={{height: 14, borderRadius: 7, background: '#dfe4ef', marginTop: 30, overflow: 'hidden'}}>
          <div style={{height: '100%', width: `${ease(f, a, a + 48, Easing.linear) * 100}%`, background: BLUE}} />
        </div>
      </Window>
      <Clock x={780} y={510} size={210} speed={36} />
    </AbsoluteFill>
  );
};

const Row: React.FC<{
  name: string;
  score: React.ReactNode;
  color: string;
  badge?: string;
  badgeColor?: string;
  highlight?: number;
}> = ({name, score, color, badge, badgeColor, highlight = 0}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '26px 28px',
      borderRadius: 20,
      margin: '18px 0',
      background: '#fff',
      boxShadow: `0 0 0 ${highlight * 5}px ${color}`,
      fontSize: 32,
      fontWeight: 700,
    }}
  >
    <div>
      <div>{name}</div>
      {badge ? (
        <div
          style={{
            display: 'inline-block',
            marginTop: 10,
            padding: '6px 16px',
            borderRadius: 10,
            background: badgeColor,
            color: '#fff',
            fontSize: 22,
            fontWeight: 800,
          }}
        >
          {badge}
        </div>
      ) : null}
    </div>
    <div style={{textAlign: 'right'}}>
      <div style={{fontSize: 20, color: '#7a86a3', fontWeight: 600}}>опыт, баллы</div>
      <div style={{fontSize: 64, fontWeight: 900, color}}>{score}</div>
    </div>
  </div>
);

const SceneResults: React.FC = () => {
  const f = useCurrentFrame();
  const w = ease(f, S(T.worse), S(T.worse) + 12);
  return (
    <AbsoluteFill>
      <Title lines={['Открываешь итоги…']} at={T.results} size={70} />
      <div style={{opacity: w}}>
        <Title lines={['', 'у конкурента больше баллов за опыт']} at={T.worse} top={325} size={60} color2={RED} />
      </div>
      <Window x={90} y={620} w={900} title="portal-zakupok … / итоги">
        <div style={{fontSize: 38, fontWeight: 800}}>Протокол итогов</div>
        <div style={{fontSize: 24, color: '#7a86a3', fontWeight: 600, marginTop: 6}}>Закупка № 15342871-ОК1</div>
        <Row name="Конкурент" score={<Count to={20} at={T.worse} />} color={RED} badge="Победитель" badgeColor={RED} highlight={w} />
        <Row name="Ваша компания" score={<Count to={12} at={T.worse} />} color={BLUE} />
      </Window>
    </AbsoluteFill>
  );
};

const SceneQuote: React.FC = () => {
  const f = useCurrentFrame();
  const tq = ease(f, S(T.quote), S(T.quote) + 14, back);
  return (
    <AbsoluteFill style={{fontFamily: F, alignItems: 'center', justifyContent: 'center'}}>
      <AbsoluteFill style={{background: 'rgba(2,6,20,0.45)'}} />
      <div
        style={{
          position: 'absolute',
          top: 640,
          fontSize: 64,
          fontWeight: 700,
          color: '#9db6e8',
          opacity: ease(f, S(T.think), S(T.think) + 10),
        }}
      >
        И думаешь:
      </div>
      <div
        style={{
          fontSize: 104,
          fontWeight: 900,
          color: '#fff',
          textAlign: 'center',
          lineHeight: 1.1,
          textShadow: '0 10px 40px rgba(0,0,0,0.7)',
          opacity: Math.min(1, tq * 2),
          transform: `scale(${lerp(0.7, 1, tq)}) rotate(${lerp(-4, -2, tq)}deg)`,
        }}
      >
        «Знал бы
        <br />
        <span style={{color: LIGHT_BLUE}}>заранее…»</span>
      </div>
    </AbsoluteFill>
  );
};

const SceneLogo: React.FC = () => {
  const f = useCurrentFrame();
  const a = S(T.logo);
  const t = ease(f, a + 4, a + 22, back);
  return (
    <AbsoluteFill style={{alignItems: 'center', fontFamily: F}}>
      <div
        style={{
          position: 'absolute',
          top: 300,
          fontSize: 62,
          fontWeight: 800,
          color: '#fff',
          opacity: ease(f, a, a + 10),
          textShadow: '0 6px 24px rgba(0,0,0,0.5)',
        }}
      >
        Вот за что мне нравится
      </div>
      <div
        style={{
          position: 'absolute',
          top: 560,
          transform: `scale(${lerp(0.3, 1, t)}) rotateY(${lerp(70, 0, t)}deg)`,
          opacity: Math.min(1, t * 2),
          filter: 'drop-shadow(0 0 40px rgba(60,140,255,0.6))',
        }}
      >
        <Logo3D size={560} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1060,
          fontSize: 120,
          fontWeight: 900,
          color: '#fff',
          letterSpacing: -2,
          textShadow: '0 8px 30px rgba(0,0,0,0.6)',
          opacity: ease(f, a + 14, a + 24),
          transform: `translateY(${lerp(30, 0, ease(f, a + 14, a + 26))}px)`,
        }}
      >
        G-Launcher
      </div>
    </AbsoluteFill>
  );
};

/** Окно платформы (как «ноутбук» в референсе). */
const AppFrame: React.FC<{children: React.ReactNode; top?: number}> = ({children, top = 560}) => (
  <div
    style={{
      position: 'absolute',
      left: 70,
      top,
      width: 940,
      borderRadius: 34,
      background: '#11163a',
      padding: 16,
      boxShadow: '0 40px 90px rgba(0,0,20,0.6)',
      fontFamily: F,
    }}
  >
    <div style={{display: 'flex', borderRadius: 22, overflow: 'hidden', background: '#f4f6fb', minHeight: 690}}>
      <div style={{width: 110, background: '#0f1d4a', padding: '28px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
        <LogoFlatOnDark />
        {[BLUE, '#2a3a74', '#2a3a74', '#2a3a74'].map((c, i) => (
          <div key={i} style={{width: 52, height: 16, borderRadius: 8, background: c}} />
        ))}
      </div>
      <div style={{flex: 1, padding: 34, color: NAVY}}>{children}</div>
    </div>
  </div>
);

const LogoFlatOnDark: React.FC = () => (
  <div style={{width: 70, height: 70, borderRadius: 18, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14}}>
    <LogoFlat size={52} />
  </div>
);

const Input: React.FC<{label: string; value: React.ReactNode; active: number}> = ({label, value, active}) => (
  <div style={{margin: '0 0 22px'}}>
    <div style={{fontSize: 22, fontWeight: 700, color: '#7a86a3', marginBottom: 10}}>{label}</div>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: '#fff',
        borderRadius: 16,
        padding: '20px 24px',
        fontSize: 40,
        fontWeight: 800,
        letterSpacing: 3,
        boxShadow: `0 0 0 ${2 + active * 3}px ${active > 0.5 ? BLUE : '#dfe4ef'}`,
      }}
    >
      {value}
    </div>
  </div>
);

const Bar: React.FC<{label: string; value: number; max: number; color: string; t: number}> = ({label, value, max, color, t}) => (
  <div style={{margin: '22px 0'}}>
    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 30, fontWeight: 800, marginBottom: 10}}>
      <span>{label}</span>
      <span style={{color}}>{Math.round(value * t)}</span>
    </div>
    <div style={{height: 34, borderRadius: 17, background: '#dfe4ef', overflow: 'hidden'}}>
      <div style={{height: '100%', width: `${(value / max) * 100 * t}%`, background: color, borderRadius: 17}} />
    </div>
  </div>
);

const MY_BIN = '123456789012';
const RIVAL_BIN = '987654321098';

const SceneMyBin: React.FC = () => {
  const f = useCurrentFrame();
  const s = ease(f, S(T.myScore), S(T.myScore) + 14, back);
  const cat = ease(f, S(T.category), S(T.category) + 12, back);
  return (
    <AbsoluteFill>
      <Title lines={['Вводишь свой БИН']} at={T.myBin} />
      <div style={{opacity: ease(f, S(T.myScore), S(T.myScore) + 10)}}>
        <Title lines={['', 'и видишь баллы за опыт']} at={T.myScore} top={330} size={64} />
      </div>
      <AppFrame>
        <div style={{fontSize: 36, fontWeight: 800, marginBottom: 26}}>Анализ опыта</div>
        <Input label="Ваш БИН" value={<Typing text={MY_BIN} at={T.myBin + 0.25} />} active={1} />
        <div
          style={{
            marginTop: 26,
            borderRadius: 22,
            background: '#fff',
            padding: 30,
            opacity: Math.min(1, s * 2),
            transform: `translateY(${lerp(40, 0, s)}px)`,
            boxShadow: '0 10px 30px rgba(15,29,74,0.12)',
          }}
        >
          <div style={{fontSize: 26, fontWeight: 700, color: '#7a86a3'}}>Ваши баллы за опыт</div>
          <div style={{fontSize: 150, fontWeight: 900, color: BLUE, lineHeight: 1.05}}>
            <Count to={12} at={T.myScore + 0.2} dur={1} />
          </div>
          <div
            style={{
              display: 'inline-block',
              marginTop: 10,
              padding: '12px 22px',
              borderRadius: 14,
              background: '#e3edff',
              color: '#1f5fe0',
              fontSize: 26,
              fontWeight: 800,
              opacity: cat,
              transform: `scale(${lerp(0.7, 1, cat)})`,
              transformOrigin: 'left center',
            }}
          >
            Категория: поставка оборудования
          </div>
        </div>
      </AppFrame>
    </AbsoluteFill>
  );
};

const SceneRival: React.FC = () => {
  const f = useCurrentFrame();
  const a = S(T.rivalBin);
  const bars = ease(f, a + 30, a + 52);
  return (
    <AbsoluteFill>
      <Title lines={['Вводишь БИН конкурента', 'и сравниваешь']} at={T.rivalBin} size={66} />
      <AppFrame>
        <div style={{fontSize: 36, fontWeight: 800, marginBottom: 26}}>Сравнение опыта</div>
        <Input label="Ваш БИН" value={MY_BIN} active={0} />
        <Input label="БИН конкурента" value={<Typing text={RIVAL_BIN} at={T.rivalBin + 0.2} cps={16} />} active={1} />
        <div style={{opacity: Math.min(1, bars * 3)}}>
          <Bar label="Вы" value={12} max={22} color={BLUE} t={bars} />
          <Bar label="Конкурент" value={20} max={22} color={RED} t={bars} />
        </div>
      </AppFrame>
    </AbsoluteFill>
  );
};

const WINS = [
  ['№ 15342871-ОК1', 'Поставка оборудования'],
  ['№ 15298104-ОК1', 'Поставка оборудования'],
  ['№ 15177362-ЗЦП1', 'Монтаж и пусконаладка'],
  ['№ 15051947-ОК2', 'Поставка оборудования'],
];

const SceneWins: React.FC = () => {
  const f = useCurrentFrame();
  const a = S(T.wins);
  return (
    <AbsoluteFill>
      <Title lines={['Заодно видно, какие тендеры', 'он уже выигрывал']} at={T.wins} size={58} />
      <AppFrame>
        <div style={{fontSize: 36, fontWeight: 800, marginBottom: 6}}>Победы конкурента</div>
        <div style={{fontSize: 22, fontWeight: 600, color: '#7a86a3', marginBottom: 18}}>БИН {RIVAL_BIN}</div>
        {WINS.map(([n, d], i) => {
          const t = ease(f, a + 8 + i * 7, a + 20 + i * 7, back);
          return (
            <div
              key={n}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#fff',
                borderRadius: 18,
                padding: '22px 24px',
                margin: '16px 0',
                boxShadow: '0 6px 20px rgba(15,29,74,0.1)',
                opacity: Math.min(1, t * 2),
                transform: `translateX(${lerp(260, 0, t)}px)`,
              }}
            >
              <div>
                <div style={{fontSize: 28, fontWeight: 800}}>{n}</div>
                <div style={{fontSize: 22, fontWeight: 600, color: '#7a86a3', marginTop: 4}}>{d}</div>
              </div>
              <div style={{padding: '10px 18px', borderRadius: 12, background: GREEN, color: '#fff', fontSize: 24, fontWeight: 800}}>
                Победа
              </div>
            </div>
          );
        })}
      </AppFrame>
    </AbsoluteFill>
  );
};

const SceneUseful: React.FC = () => {
  const f = useCurrentFrame();
  const a = S(T.useful);
  const c = ease(f, a + 2, a + 18, back);
  const rays = ease(f, a + 6, a + 22);
  const e = ease(f, S(T.edge), S(T.edge) + 14, back);
  return (
    <AbsoluteFill style={{fontFamily: F}}>
      <Title lines={['По-моему, это', 'реально полезно']} at={T.useful} color2={GREEN} />
      {/* значок-галочка с лучами */}
      <div style={{position: 'absolute', left: 540 - 170, top: 560, width: 340, height: 340}}>
        <svg width={340} height={340} viewBox="-170 -170 340 340" style={{position: 'absolute', inset: 0}}>
          {Array.from({length: 12}, (_, i) => (
            <line
              key={i}
              x1={0}
              y1={-110 - rays * 10}
              x2={0}
              y2={-110 - rays * 50}
              stroke={GREEN}
              strokeWidth={8}
              strokeLinecap="round"
              opacity={rays * (1 - ease(f, a + 26, a + 40))}
              transform={`rotate(${i * 30})`}
            />
          ))}
          <circle r={100 * c} fill={GREEN} />
          <path d="M-45,0 L-12,34 L50,-34" fill="none" stroke="#fff" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" opacity={c} />
        </svg>
      </div>
      <div style={{position: 'absolute', top: 960, left: 60, right: 60, textAlign: 'center', opacity: ease(f, S(T.before), S(T.before) + 10)}}>
        <div style={{fontSize: 60, fontWeight: 900, color: '#fff', textShadow: '0 6px 24px rgba(0,0,0,0.5)'}}>
          Ещё до подготовки заявки
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 110,
          right: 110,
          top: 1110,
          borderRadius: 28,
          background: '#f4f6fb',
          padding: '30px 36px',
          color: NAVY,
          opacity: Math.min(1, e * 2),
          transform: `translateY(${lerp(60, 0, e)}px) scale(${lerp(0.9, 1, e)})`,
          boxShadow: '0 30px 80px rgba(0,0,20,0.55)',
        }}
      >
        <div style={{fontSize: 30, fontWeight: 800, color: '#7a86a3'}}>Преимущество по опыту</div>
        <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 8}}>
          <div style={{fontSize: 52, fontWeight: 900}}>У конкурента</div>
          <div style={{fontSize: 60, fontWeight: 900, color: RED}}>+8</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SceneEnd: React.FC = () => {
  const f = useCurrentFrame();
  const a = S(T.cta);
  const badge = ease(f, a, a + 18, back);
  const ring = f / 30;
  const btn = ease(f, a + 10, a + 24, back);
  const sub = ease(f, S(T.compare), S(T.compare) + 12);
  const link = ease(f, S(T.link), S(T.link) + 12, back);
  const pulse = 1 + 0.035 * Math.sin((f - a) / 6) * ease(f, a + 24, a + 30);
  return (
    <AbsoluteFill style={{alignItems: 'center', fontFamily: F}}>
      <div style={{position: 'absolute', top: 260, width: 560, height: 560, transform: `scale(${lerp(0.4, 1, badge)})`, opacity: Math.min(1, badge * 2)}}>
        <svg width={560} height={560} viewBox="-280 -280 560 560" style={{position: 'absolute', inset: 0}}>
          <g transform={`rotate(${ring * 40})`} stroke={BLUE} strokeWidth={10} fill="none" strokeLinecap="round">
            <path d="M -262 0 A 262 262 0 0 1 -80 -249" />
            <path d="M 262 0 A 262 262 0 0 1 80 249" />
          </g>
          <circle r={225} fill="#fff" />
        </svg>
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <LogoFlat size={270} />
          <div style={{fontSize: 52, fontWeight: 800, color: NAVY, marginTop: 14, letterSpacing: -1}}>G-Launcher</div>
        </div>
      </div>
      <div style={{position: 'absolute', top: 860, fontSize: 96, fontWeight: 900, color: '#fff', textShadow: '0 8px 30px rgba(0,0,0,0.5)', opacity: badge}}>
        G-Launcher
      </div>
      <div style={{position: 'absolute', top: 975, fontSize: 44, fontWeight: 800, color: LIGHT_BLUE, opacity: badge}}>Госзакупки РК</div>
      <div
        style={{
          position: 'absolute',
          top: 1090,
          padding: '28px 64px',
          borderRadius: 60,
          background: 'linear-gradient(180deg,#3d8bff,#1f5fe0)',
          color: '#fff',
          fontSize: 60,
          fontWeight: 900,
          boxShadow: '0 16px 50px rgba(40,110,255,0.6)',
          transform: `scale(${lerp(0.5, 1, btn) * pulse})`,
          opacity: Math.min(1, btn * 2),
        }}
      >
        Попробуйте сами!
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1265,
          left: 80,
          right: 80,
          textAlign: 'center',
          fontSize: 44,
          fontWeight: 800,
          color: '#fff',
          lineHeight: 1.25,
          opacity: sub,
          transform: `translateY(${lerp(30, 0, sub)}px)`,
          textShadow: '0 6px 20px rgba(0,0,0,0.6)',
        }}
      >
        Сравните свои баллы
        <br />
        <span style={{color: LIGHT_BLUE}}>с частым конкурентом</span>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1430,
          textAlign: 'center',
          opacity: Math.min(1, link * 2),
          transform: `scale(${lerp(0.7, 1, link)})`,
        }}
      >
        <div style={{fontSize: 38, fontWeight: 800, color: '#fff', textShadow: '0 6px 20px rgba(0,0,0,0.6)'}}>
          Ссылка на платформу
          <br />в шапке профиля
        </div>
        <div
          style={{
            display: 'inline-block',
            marginTop: 22,
            padding: '12px 36px',
            borderRadius: 30,
            border: '3px solid rgba(255,255,255,0.7)',
            background: 'rgba(10,20,60,0.6)',
            color: '#fff',
            fontSize: 36,
            fontWeight: 700,
          }}
        >
          glauncher.kz
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- звук ---------- */
// Каждое событие: [кадр, файл из public/glauncher/sfx, громкость]. Кадры совпадают с анимацией элементов.
type Sfx = [number, string, number];
const SFX: Sfx[] = (() => {
  const ev: Sfx[] = [];
  const add = (frame: number, name: string, vol: number) => ev.push([Math.max(0, Math.round(frame)), name, vol]);
  const W = 0.07; // переходы
  const UI = 0.11; // появление элементов
  const typing = (at: number, cps: number, len: number) => {
    for (let k = 1; k <= len; k++) add(S(at) + (k * GL_FPS) / cps, `key${k % 4}`, 0.07);
  };
  const ticks = (from: number, frames: number, every: number, vol: number, name = 'count_tick') => {
    for (let x = 0; x < frames; x += every) add(from + x, name, vol);
  };

  // «Знакомо?»
  add(0, 'bubble', UI);
  add(4, 'pop', UI);
  // Заявка: переход, галочки по возрастающей, тикание часов
  add(S(T.prep) - 4, 'whoosh_a', W);
  CHECKS.forEach((_, i) => add(S(T.prep) + 8 + i * 9, `check${i}`, UI));
  ticks(S(T.prep) + 6, S(T.results) - S(T.prep) - 10, 6, 0.045, 'clock_tick');
  // Итоги: переход, счётчики, «минус»
  add(S(T.results) - 4, 'whoosh_b', W);
  add(S(T.worse) + 2, 'pop_low', UI);
  ticks(S(T.worse), 24, 3, 0.05);
  add(S(T.worse) + 26, 'tone_down', UI);
  // «Знал бы заранее…»
  add(S(T.think) - 4, 'whoosh_c', W);
  add(S(T.quote) - 2, 'sigh', 0.12);
  // Логотип
  add(S(T.logo) - 4, 'whoosh_a', W);
  add(S(T.logo) + 4, 'shimmer', UI);
  add(S(T.logo) + 15, 'pop_low', 0.09);
  // Свой БИН: набор, карточка, счётчик, чип категории
  add(S(T.myBin) - 4, 'whoosh_b', W);
  typing(T.myBin + 0.25, 14, MY_BIN.length);
  add(S(T.myScore), 'pop', UI);
  ticks(S(T.myScore + 0.2), 30, 3, 0.05);
  add(S(T.category) + 2, 'blip1', UI);
  // БИН конкурента: набор, рост полосок
  add(S(T.rivalBin) - 4, 'whoosh_c', W);
  typing(T.rivalBin + 0.2, 16, RIVAL_BIN.length);
  add(S(T.rivalBin) + 30, 'sweep_up', UI);
  // Победы конкурента: строки по очереди
  add(S(T.wins) - 4, 'whoosh_a', W);
  WINS.forEach((_, i) => add(S(T.wins) + 10 + i * 7, `blip${i}`, UI));
  // «Реально полезно»: галочка, текст, карточка преимущества
  add(S(T.useful) - 4, 'whoosh_b', W);
  add(S(T.useful) + 3, 'chime_up', UI);
  add(S(T.before) + 1, 'pop_low', 0.08);
  add(S(T.edge) + 2, 'pop', UI);
  // Финал: значок, кнопка, подпись, ссылка
  add(S(T.cta) - 4, 'whoosh_c', W);
  add(S(T.cta) + 2, 'shimmer', 0.09);
  add(S(T.cta) + 12, 'button', UI);
  add(S(T.compare) + 1, 'blip2', 0.09);
  add(S(T.link) + 2, 'pop', UI);
  add(S(T.link) + 8, 'blip3', 0.08);
  return ev;
})();

export const GLauncherReels: React.FC = () => (
  <AbsoluteFill style={{background: '#020615'}}>
    <Background />
    <Scene from={T.q} to={T.prep}>
      <SceneQuestion />
    </Scene>
    <Scene from={T.prep} to={T.results}>
      <ScenePrep />
    </Scene>
    <Scene from={T.results} to={T.think}>
      <SceneResults />
    </Scene>
    <Scene from={T.think} to={T.logo}>
      <SceneQuote />
    </Scene>
    <Scene from={T.logo} to={T.myBin}>
      <SceneLogo />
    </Scene>
    <Scene from={T.myBin} to={T.rivalBin}>
      <SceneMyBin />
    </Scene>
    <Scene from={T.rivalBin} to={T.wins}>
      <SceneRival />
    </Scene>
    <Scene from={T.wins} to={T.useful}>
      <SceneWins />
    </Scene>
    <Scene from={T.useful} to={T.cta}>
      <SceneUseful />
    </Scene>
    <Scene from={T.cta} to={T.end + 1}>
      <SceneEnd />
    </Scene>

    <Html5Audio src={staticFile('glauncher/vo.mp3')} volume={1} />
    <Html5Audio
      src={staticFile('glauncher/music.wav')}
      volume={(f) => interpolate(f, [0, S(T.cta), S(T.cta) + 10, GL_DURATION - 20, GL_DURATION], [0.16, 0.16, 0.22, 0.22, 0], CL)}
    />
    {SFX.map(([frame, name, vol], i) => (
      <Sequence key={i} from={frame} durationInFrames={45}>
        <Html5Audio src={staticFile(`glauncher/sfx/${name}.wav`)} volume={vol} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
