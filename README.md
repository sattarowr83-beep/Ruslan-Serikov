# Muslim Food — рекламный ролик для Reels «Что берём сегодня?»

Готовое видео: **`out/Muslim_Food_Reels.mp4`** (1080×1920, 9:16, 30 fps, 15 с, H.264 High + AAC).

## Как обновить меню
Все названия, цены, пути к фото, цвета и тексты лежат в **`menu.json`**.
- `price` — число (1990 → «1 990 ₸»).
- `photo` — путь внутри `public/`, например `"photos/shawarma.png"` (лучше PNG без фона). `null` — рисуется иллюстрация.
- `brand.logo` — путь к логотипу в `public/`; `null` — логотип набран текстом.
- `brand.address` — подтверждённый адрес: появится под «Заходи за своим!».

## Рендер (Windows, 8 ГБ ОЗУ)
```bash
npm install
npm run studio   # предпросмотр в браузере
npm run draft    # черновик 540×960 → out/draft_540x960.mp4
npm run final    # финал 1080×1920, concurrency=1 → out/Muslim_Food_Reels.mp4
```
Шаг `final` после Remotion прогоняет файл через FFmpeg (`npx remotion ffmpeg`): yuv420p, ТВ-диапазон, ровно 15 с, faststart.
Звуки свайпа и удара лежат в `public/sfx`; пересоздать их можно командой `npm run sfx` (нужен Python + numpy).

## Структура
- `src/MuslimFoodReels.tsx` — сцены, камера, свайпы, звук
- `src/timing.ts` — тайминги в кадрах и безопасные зоны под интерфейс Reels
- `src/food/` — SVG-иллюстрации шаурмы и чизбургера
