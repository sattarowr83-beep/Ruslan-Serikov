import React from 'react';
import {Composition} from 'remotion';
import {MuslimFoodReels} from './MuslimFoodReels';
import {DURATION, FPS, H, W} from './timing';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MuslimFoodReels"
    component={MuslimFoodReels}
    durationInFrames={DURATION}
    fps={FPS}
    width={W}
    height={H}
  />
);
