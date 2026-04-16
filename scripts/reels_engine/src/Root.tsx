import { Composition, AbsoluteFill } from 'remotion';
import { MainComposition } from './Composition';
import React from 'react';
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";


// @ts-ignore
import brandConfig from './brand_config.json';

// Require the current timeline JSON that the node wrapper saves
let currentTimeline: any[] = [];
try {
  currentTimeline = require('../public/current_timeline.json');
} catch (e) {
  currentTimeline = [
    {
        "scene_number": 1,
        "duration_sec": 5,
        "layout": "text_overlay",
        "visual_content": { "headline": "REMOTION STARTING..." }
    }
  ];
}

type MainCompositionProps = { timeline: any[] };

export const RemotionRoot: React.FC = () => {
    const totalDurationSec = currentTimeline.reduce((acc, scene) => acc + (scene.duration_sec || 5), 0);
    const fps = 30; // Chuẩn Reels

    // Tối ưu v5.5: Load Font chuẩn Remotion cho cả thương hiệu
    const { fontFamily: interFont } = loadInter();
    loadPlayfair(); // Trigger loading for accent font

    return (
        <AbsoluteFill style={{ backgroundColor: '#000', fontFamily: interFont }}>

            <Composition<MainCompositionProps>
                id="MainComposition"
                component={MainComposition}
                durationInFrames={Math.max(1, Math.round(totalDurationSec * fps))}
                fps={fps}
                width={1080}
                height={1920}
                defaultProps={{
                    timeline: currentTimeline
                }}
            />
</AbsoluteFill>
    );
};
