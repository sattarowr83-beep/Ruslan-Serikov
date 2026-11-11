import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import {continueRender, delayRender} from 'remotion';
import {allText} from './menu';

export const FONT = 'Montserrat, "Arial Black", sans-serif';

// Ждём загрузки нужных подмножеств шрифта (кириллица + знак ₸ в latin-ext)
const handle = delayRender('Загрузка шрифта Montserrat');
const sample = allText();
Promise.all([
  document.fonts.load(`900 100px Montserrat`, sample),
  document.fonts.load(`800 100px Montserrat`, sample),
])
  .then(() => continueRender(handle))
  .catch((e) => {
    console.error(e);
    continueRender(handle);
  });

let ctx: CanvasRenderingContext2D | null = null;
export const measure = (text: string, size: number, weight = 900) => {
  if (!ctx) ctx = document.createElement('canvas').getContext('2d');
  ctx!.font = `${weight} ${size}px Montserrat`;
  return ctx!.measureText(text).width;
};

// Подбирает максимальный кегль, при котором текст влезает в maxLines строк шириной maxWidth.
export const fitLines = (
  text: string,
  maxWidth: number,
  maxSize: number,
  minSize: number,
  maxLines: number,
  weight = 900,
): {size: number; lines: string[]} => {
  const words = text.split(/\s+/);
  for (let size = maxSize; size >= minSize; size -= 2) {
    const lines: string[] = [];
    let cur = '';
    let ok = true;
    for (const w of words) {
      const next = cur ? `${cur} ${w}` : w;
      if (measure(next, size, weight) <= maxWidth) cur = next;
      else {
        if (!cur) {
          ok = false;
          break;
        }
        lines.push(cur);
        cur = w;
      }
    }
    if (cur) lines.push(cur);
    // не оставляем висячий предлог «с» в конце строки
    for (let i = 0; i < lines.length - 1; i++) {
      const m = lines[i].match(/^(.*)\s(\S{1,2})$/);
      if (m) {
        const moved = `${m[2]} ${lines[i + 1]}`;
        if (measure(moved, size, weight) <= maxWidth) {
          lines[i] = m[1];
          lines[i + 1] = moved;
        }
      }
    }
    if (ok && lines.length <= maxLines && lines.every((l) => measure(l, size, weight) <= maxWidth))
      return {size, lines};
  }
  return {size: minSize, lines: [text]};
};
