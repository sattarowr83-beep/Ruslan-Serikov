// Все тайминги в кадрах (30 fps). 15 с = 450 кадров.
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const DURATION = 450;

export const T = {
  hookWords: [4, 14, 26], // «Что» «берём» «сегодня?»
  pullback: [28, 64] as const, // поворот шаурмы + отъезд камеры
  hookOut: [48, 62] as const,
  // появление названия / цены на каждой карточке
  title: [62, 162, 262],
  price: [80, 176, 276],
  comboStamp: 252,
  // свайпы меню (начало, конец)
  swipes: [
    [148, 160],
    [238, 250],
    [345, 356],
  ] as const,
  finalIn: [347, 376] as const,
  logo: [360, 378] as const,
  cta: [374, 392] as const,
  staticFrom: 405, // последние 1,5 с — неподвижный кадр
};

// Безопасная зона под интерфейс Reels
export const SAFE = {
  left: 72,
  right: 150, // справа — кнопки лайк/коммент
  top: 230,
  bottom: 420, // снизу — подпись и аудио
};
