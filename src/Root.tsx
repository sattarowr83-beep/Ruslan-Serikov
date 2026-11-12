import React from 'react';
import {Composition} from 'remotion';
import {MuslimFoodReels} from './MuslimFoodReels';
import {DURATION, FPS, H, W} from './timing';
import {GL_DURATION, GL_FPS, GL_H, GL_W, GLauncherReels} from './glauncher/GLauncherReels';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="MuslimFoodReels"
      component={MuslimFoodReels}
      durationInFrames={DURATION}
      fps={FPS}
      width={W}
      height={H}
    />
    <Composition
      id="GLauncherBIN"
      component={GLauncherReels}
      durationInFrames={GL_DURATION}
      fps={GL_FPS}
      width={GL_W}
      height={GL_H}
    />
  </>
);
