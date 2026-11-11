import {Config} from '@remotion/cli/config';

// Настройки для слабого ПК (Windows, 8 ГБ ОЗУ): один поток рендера, JPEG-кадры.
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setConcurrency(1);
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);
// Необязательно: путь к своему Chrome (если Remotion не может скачать свой)
if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
