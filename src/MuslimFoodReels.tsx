import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Html5Audio,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {FONT, fitLines} from './fonts';
import {C, MenuItem, formatPrice, menu} from './menu';
import {H, SAFE, T, W} from './timing';
import {Burger, BURGER_VB} from './food/Burger';
import {Shawarma, SHAWARMA_FACE, SHAWARMA_VB, Steam} from './food/Shawarma';

const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const SWIPE_EASE = Easing.bezier(0.77, 0, 0.18, 1);
const ease = (f: number, a: number, b: number, e: (t: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(f, [a, b], [0, 1], {...CL, easing: e});
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const trackPos = (f: number) => T.swipes.reduce((s, [a, b]) => s + ease(f, a, b, SWIPE_EASE), 0);

const TEXT_W = W - SAFE.left - SAFE.right - 8; // 850 px — ширина текстового блока
const TITLE_TOP = 1112;
const TITLE_MAX = 104;

/* ---------- еда: фото или иллюстрация ---------- */
const Food: React.FC<{item: MenuItem; uid: string; w: number; h: number}> = ({item, uid, w, h}) => {
  if (item.photo)
    return <Img src={staticFile(item.photo)} style={{width: w, height: h, objectFit: 'contain'}} />;
  return item.illustration === 'burger' ? (
    <Burger uid={uid} style={{width: w, height: h}} />
  ) : (
    <Shawarma uid={uid} style={{width: w, height: h}} />
  );
};

const foodBox = (item: MenuItem) =>
  item.illustration === 'burger'
    ? {w: 1000, h: (1000 * BURGER_VB.h) / BURGER_VB.w, cx: 540, cy: 690}
    : {w: (1060 * SHAWARMA_VB.w) / SHAWARMA_VB.h, h: 1060, cx: 585, cy: 598};

/* ---------- цена ---------- */
const PriceTag: React.FC<{price: number; t: number; size?: number}> = ({price, t, size = 112}) => {
  const y = interpolate(t, [0, 1], [110, 0]);
  return (
    <div
      style={{
        display: 'inline-block',
        transform: `translateY(${y}px) scale(${lerp(0.9, 1, t)})`,
        transformOrigin: 'left bottom',
        opacity: Math.min(1, t * 3),
        background: C.accent,
        color: C.onAccent,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.1,
        padding: '12px 34px 14px',
        borderRadius: 30,
        whiteSpace: 'nowrap',
        boxShadow: '0 14px 30px rgba(140,30,10,0.25)',
      }}
    >
      {formatPrice(price)}
    </div>
  );
};

/* ---------- название (выезжает из-за продукта) ---------- */
const Title: React.FC<{text: string; start: number; frame: number; accentWord?: string}> = ({
  text,
  start,
  frame,
  accentWord,
}) => {
  const {size, lines} = fitLines(text, TEXT_W, TITLE_MAX, 60, 2);
  const t = ease(frame, start, start + 14, Easing.out(Easing.cubic));
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE.left,
        top: TITLE_TOP,
        width: TEXT_W,
        transform: `translateY(${lerp(-170, 0, t)}px)`,
        opacity: Math.min(1, t * 2.2),
      }}
    >
      {lines.map((l, i) => {
        return (
          <div
            key={i}
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: size,
              lineHeight: 1.02,
              color: C.text,
              whiteSpace: 'nowrap',
              letterSpacing: -1,
            }}
          >
            {l.split(' ').map((w, k) => (
              <span key={k} style={{color: accentWord && w.toLowerCase() === accentWord.toLowerCase() ? C.accent : undefined}}>
                {(k ? ' ' : '') + w}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
};
const titleHeight = (text: string) => {
  const {size, lines} = fitLines(text, TEXT_W, TITLE_MAX, 60, 2);
  return size * 1.02 * lines.length;
};

/* ---------- карточка меню ---------- */
const Card: React.FC<{i: number; item: MenuItem; frame: number; x: number; v: number}> = ({i, item, frame, x, v}) => {
  const box = foodBox(item);
  const isHookCard = i === 0;
  const isCombo = !!item.badge;
  const enterEnd = i === 0 ? T.pullback[1] : T.swipes[i - 1][1];
  const exitStart = T.swipes[i][0];
  const push = interpolate(frame, [enterEnd, exitStart + 12], [1, 1.05], CL);

  // вращение: шаурма слегка поворачивается на слове «сегодня?»
  let rot = item.illustration === 'burger' ? -2 : isCombo ? 9 : -16;
  let camS = 1;
  let camTx = 0;
  let camTy = 0;
  let originX = box.w / 2;
  let originY = box.h / 2;
  if (isHookCard) {
    rot = interpolate(frame, [T.hookWords[2], T.pullback[1]], [-5, -16], {...CL, easing: Easing.inOut(Easing.cubic)});
    const p = ease(frame, T.pullback[0], T.pullback[1], Easing.bezier(0.6, 0, 0.2, 1));
    camS = interpolate(frame, [0, T.pullback[0]], [2.4, 2.52], CL);
    camS = lerp(camS, 1, p);
    // точка среза в координатах блока
    const k = box.w / SHAWARMA_VB.w;
    const vx = (SHAWARMA_FACE.x - SHAWARMA_VB.w / 2) * k;
    const vy = (SHAWARMA_FACE.y - SHAWARMA_VB.h / 2) * k;
    const a = (rot * Math.PI) / 180;
    originX = box.w / 2 + vx * Math.cos(a) - vy * Math.sin(a);
    originY = box.h / 2 + vx * Math.sin(a) + vy * Math.cos(a);
    const fx = box.cx - box.w / 2 + originX;
    const fy = box.cy - box.h / 2 + originY;
    camTx = (540 - fx) * (1 - p);
    camTy = (1080 - fy) * (1 - p);
  }
  const comboShift = isCombo ? 30 : 0;
  const skew = Math.max(-7, Math.min(7, -v * 0.03));
  const priceT = ease(frame, T.price[i], T.price[i] + 10, Easing.out(Easing.back(2.2)));
  const tH = titleHeight(item.title);
  const stampT = ease(frame, T.comboStamp, T.comboStamp + 9, Easing.out(Easing.back(1.8)));

  return (
    <AbsoluteFill style={{transform: `translateX(${x}px)`}}>
      {/* номер позиции на фоне */}
      <div
        style={{
          position: 'absolute',
          right: 40,
          top: 190,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 430,
          lineHeight: 1,
          color: C.backgroundDeep,
          transform: `translateX(${x * 0.3}px)`,
          opacity: isHookCard ? ease(frame, 50, 66) : 1,
        }}
      >
        {String(i + 1).padStart(2, '0')}
      </div>
      {/* тень */}
      <div
        style={{
          position: 'absolute',
          left: box.cx - 330 + comboShift + x * 0.18,
          top: box.cy + box.h * (item.illustration === 'burger' ? 0.34 : 0.43),
          width: 660,
          height: 90,
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(90,50,20,0.35), rgba(90,50,20,0))',
          opacity: isHookCard ? ease(frame, 40, 64) : 1,
        }}
      />
      {/* название — позади продукта */}
      <Title text={item.title} start={T.title[i]} frame={frame} accentWord={item.badge} />
      {/* еда */}
      <div
        style={{
          position: 'absolute',
          left: box.cx - box.w / 2 + comboShift,
          top: box.cy - box.h / 2,
          width: box.w,
          height: box.h,
          transformOrigin: `${originX}px ${originY}px`,
          transform: `translate(${camTx + x * 0.18}px, ${camTy}px) scale(${camS * push}) skewX(${skew}deg)`,
        }}
      >
        <div style={{width: '100%', height: '100%', transform: `rotate(${rot}deg)`, position: 'relative'}}>
          <Food item={item} uid={`c${i}`} w={box.w} h={box.h} />
          {item.illustration === 'shawarma' && !item.photo ? <Steam frame={frame} opacity={0.9} /> : null}
        </div>
      </div>
      {/* цена */}
      <div style={{position: 'absolute', left: SAFE.left, top: TITLE_TOP + tH + 22}}>
        <PriceTag price={item.price} t={priceT} />
      </div>
      {/* акцент «КОМБО» */}
      {isCombo ? (
        <div
          style={{
            position: 'absolute',
            left: SAFE.left - 8,
            top: 370,
            transform: `rotate(-7deg) scale(${lerp(2.2, 1, stampT)})`,
            transformOrigin: 'left center',
            opacity: Math.min(1, stampT * 3),
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 150,
            lineHeight: 1,
            letterSpacing: 2,
            color: C.onAccent,
            background: C.accent,
            padding: '14px 36px 22px',
            borderRadius: 26,
            boxShadow: '0 18px 40px rgba(140,30,10,0.3)',
          }}
        >
          {item.badge}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- хук ---------- */
const Hook: React.FC<{frame: number}> = ({frame}) => {
  if (frame > T.hookOut[1] + 8) return null;
  return (
    <AbsoluteFill>
      {menu.hook.map((w, i) => {
        const {size} = fitLines(w, TEXT_W - 60, 150, 80, 1);
        const t = ease(frame, T.hookWords[i], T.hookWords[i] + 8, Easing.out(Easing.back(1.7)));
        const out = ease(frame, T.hookOut[0] + i * 3, T.hookOut[1] + i * 3, Easing.in(Easing.cubic));
        const last = i === menu.hook.length - 1;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: SAFE.left,
              top: 300 + i * 182,
              transform: `translate(${-out * 1100}px, ${lerp(60, 0, t)}px) scale(${lerp(0.8, 1, t)})`,
              transformOrigin: 'left center',
              opacity: Math.min(1, t * 2),
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: size,
              lineHeight: 1.1,
              padding: '2px 28px 8px',
              borderRadius: 24,
              background: last ? C.text : C.background,
              color: last ? C.onAccent : C.text,
              boxShadow: '0 12px 30px rgba(40,20,10,0.22)',
              whiteSpace: 'nowrap',
            }}
          >
            {w}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- индикатор «меню» ---------- */
const MenuDots: React.FC<{frame: number; pos: number}> = ({frame, pos}) => {
  const op = ease(frame, 58, 70) * (1 - ease(frame, T.swipes[2][0], T.swipes[2][0] + 8));
  if (op <= 0) return null;
  return (
    <div style={{position: 'absolute', left: SAFE.left, top: 250, opacity: op, display: 'flex', alignItems: 'center', gap: 14}}>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 34, letterSpacing: 5, color: C.text, marginRight: 10}}>
        МЕНЮ
      </div>
      {menu.items.map((_, i) => {
        const fill = Math.max(0, Math.min(1, pos + 1 - i));
        return (
          <div key={i} style={{width: 74, height: 12, borderRadius: 6, background: C.backgroundDeep, overflow: 'hidden'}}>
            <div style={{width: `${fill * 100}%`, height: '100%', background: C.text}} />
          </div>
        );
      })}
    </div>
  );
};

/* ---------- полосы скорости во время свайпа ---------- */
const SpeedLines: React.FC<{v: number}> = ({v}) => {
  const a = Math.min(1, Math.abs(v) / 160);
  if (a < 0.05) return null;
  return (
    <AbsoluteFill style={{opacity: a * 0.8}}>
      {[420, 610, 880, 1040, 1280].map((y, i) => (
        <div
          key={y}
          style={{
            position: 'absolute',
            top: y,
            left: 120 + ((i * 230) % 600),
            width: 260 + i * 40,
            height: 10,
            borderRadius: 5,
            background: C.backgroundDeep,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/* ---------- логотип ---------- */
const Logo: React.FC = () => {
  if (menu.brand.logo)
    return <Img src={staticFile(menu.brand.logo)} style={{width: 520, height: 360, objectFit: 'contain'}} />;
  const words = menu.brand.name.split(' ');
  return (
    <div
      style={{
        background: C.accent,
        borderRadius: 44,
        padding: '30px 50px 38px',
        boxShadow: `inset 0 0 0 6px ${C.accent}, inset 0 0 0 10px ${C.onAccent}, 0 24px 50px rgba(140,30,10,0.32)`,
        textAlign: 'center',
      }}
    >
      {words.map((w, i) => (
        <div
          key={i}
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: fitLines(w, 440, i === 0 ? 118 : 150, 60, 1).size,
            lineHeight: 0.98,
            color: C.onAccent,
            letterSpacing: i === 0 ? 1 : 6,
            textTransform: 'uppercase',
          }}
        >
          {w}
        </div>
      ))}
    </div>
  );
};

/* ---------- финал ---------- */
const Final: React.FC<{frame: number}> = ({frame}) => {
  if (frame < T.finalIn[0]) return null;
  const p = ease(frame, T.finalIn[0], T.finalIn[1], Easing.out(Easing.back(1.15)));
  const lg = ease(frame, T.logo[0], T.logo[1], Easing.out(Easing.back(1.8)));
  const sh = menu.items.find((i) => i.illustration === 'shawarma')!;
  const bg = menu.items.find((i) => i.illustration === 'burger')!;
  const sHh = 690;
  const sW = (sHh * SHAWARMA_VB.w) / SHAWARMA_VB.h;
  const bW = 610;
  const bH = (bW * BURGER_VB.h) / BURGER_VB.w;
  const cta = fitLines(menu.cta, 880, 120, 70, 2);
  return (
    <AbsoluteFill>
      {/* тени */}
      {[
        [250, 1170, p],
        [840, 1120, p],
      ].map(([x, y, o], i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: (i ? lerp(1700, x, o) : lerp(-700, x, o)) - 230,
            top: y,
            width: 460,
            height: 60,
            borderRadius: '50%',
            background: 'radial-gradient(closest-side, rgba(90,50,20,0.3), rgba(90,50,20,0))',
          }}
        />
      ))}
      {/* шаурма слева */}
      <div
        style={{
          position: 'absolute',
          left: lerp(-700, 255, p) - sW / 2,
          top: 880 - sHh / 2,
          width: sW,
          height: sHh,
          transform: `rotate(${lerp(-30, -12, p)}deg)`,
        }}
      >
        <Food item={sh} uid="fs" w={sW} h={sHh} />
      </div>
      {/* бургер справа */}
      <div
        style={{
          position: 'absolute',
          left: lerp(1700, 840, p) - bW / 2,
          top: 910 - bH / 2,
          width: bW,
          height: bH,
          transform: `rotate(${lerp(18, 5, p)}deg)`,
        }}
      >
        <Food item={bg} uid="fb" w={bW} h={bH} />
      </div>
      {/* логотип между ними */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: W,
          top: 340,
          display: 'flex',
          justifyContent: 'center',
          transform: `scale(${lg}) rotate(${lerp(-12, -3, lg)}deg)`,
          transformOrigin: '540px 160px',
          opacity: Math.min(1, lg * 3),
        }}
      >
        <Logo />
      </div>
      {/* призыв */}
      <div style={{position: 'absolute', left: 90, width: W - 180, top: 1222, textAlign: 'center'}}>
        {cta.lines.map((l, i) => {
          const t = ease(frame, T.cta[0] + i * 4, T.cta[0] + i * 4 + 12, Easing.out(Easing.back(1.5)));
          return (
            <div
              key={i}
              style={{
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: cta.size,
                lineHeight: 1.04,
                color: C.text,
                whiteSpace: 'nowrap',
                transform: `translateY(${lerp(70, 0, t)}px)`,
                opacity: Math.min(1, t * 2),
              }}
            >
              {l}
            </div>
          );
        })}
        {menu.brand.address ? (
          <div
            style={{
              marginTop: 18,
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 44,
              color: C.text,
              opacity: ease(frame, T.cta[0] + 10, T.cta[0] + 20),
            }}
          >
            {menu.brand.address}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- звук ---------- */
const Sfx: React.FC = () => {
  const swipe = staticFile('sfx/swipe.wav');
  const thump = staticFile('sfx/thump.wav');
  const cues: [string, number, number][] = [
    [swipe, T.pullback[0], 0.45],
    ...T.swipes.map(([a]) => [swipe, a - 2, 0.9] as [string, number, number]),
    [swipe, T.finalIn[0], 0.6],
    ...T.price.map((p) => [thump, p + 2, 0.85] as [string, number, number]),
    [thump, T.comboStamp + 1, 0.7],
    [thump, T.logo[0] + 3, 0.9],
  ];
  return (
    <>
      {cues.map(([src, from, vol], i) => (
        <Sequence key={i} from={from} durationInFrames={20} layout="none">
          <Html5Audio src={src} volume={vol} />
        </Sequence>
      ))}
    </>
  );
};

export const MuslimFoodReels: React.FC = () => {
  const frame = useCurrentFrame();
  const pos = trackPos(frame);
  const v = ((trackPos(frame + 1) - trackPos(frame - 1)) / 2) * W;
  return (
    <AbsoluteFill style={{background: C.background, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{background: `radial-gradient(60% 40% at 50% 38%, #FFF8EC 0%, ${C.background} 70%)`}}
      />
      <SpeedLines v={v} />
      {menu.items.slice(0, 3).map((item, i) => {
        const x = (i - pos) * W;
        if (Math.abs(x) > W * 1.2) return null;
        return <Card key={item.id} i={i} item={item} frame={frame} x={x} v={v} />;
      })}
      <Final frame={frame} />
      <Hook frame={frame} />
      <MenuDots frame={frame} pos={pos} />
      <Sfx />
    </AbsoluteFill>
  );
};

export {H};
