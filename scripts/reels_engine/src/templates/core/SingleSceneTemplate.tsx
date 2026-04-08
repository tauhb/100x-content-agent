import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, staticFile, OffthreadVideo, Audio } from 'remotion';
import { SubtleCTA } from '../components/SubtleCTA';
import { SingleTitleHook } from '../layouts/single_scene/SingleTitleHook';
import { SingleListCascade } from '../layouts/single_scene/SingleListCascade';
import { SingleQuoteBox } from '../layouts/single_scene/SingleQuoteBox';
import { SingleMinimalWarning } from '../layouts/single_scene/SingleMinimalWarning';
import { SingleStatisticPop } from '../layouts/single_scene/SingleStatisticPop';
import { SingleTweetOverlay } from '../layouts/single_scene/SingleTweetOverlay';
import { SinglePodcastWave } from '../layouts/single_scene/SinglePodcastWave';
import { SingleSplitCompare } from '../layouts/single_scene/SingleSplitCompare';

export const SingleSceneTemplate: React.FC<{ scene: any }> = ({ scene }) => {
    const frame = useCurrentFrame();

    // Overlay mờ phía trên video — giảm xuống 0.45 để video nền thấy rõ hơn
    const fadeOverlay = interpolate(frame, [0, 15], [0, 0.45], { extrapolateRight: 'clamp' });
    // Đọc trường Layout Skin
    const layoutSkin = scene.layout_skin || 'title_hook';

    return (
        <AbsoluteFill style={{ backgroundColor: '#000', color: 'white', fontFamily: 'sans-serif' }}>
            {/* 0. LAYER NHẠC NỀN (Global) */}
            {scene.bg_music && (
                <Audio src={scene.bg_music.startsWith('http') ? scene.bg_music : staticFile(scene.bg_music)} volume={0.4} loop />
            )}

            {/* 0.1 LAYER LỜI THOẠI (Voiceover) */}
            {scene.voice_audio && (
                <Audio src={scene.voice_audio.match(/^(http|file):\/\//) ? scene.voice_audio : staticFile(scene.voice_audio)} volume={1} />
            )}

            {/* 1. LAYER ĐÁY: BACKGROUND VIDEO (Sử dụng OffthreadVideo v5.4 cho ĐỘ MƯỢT TUYỆT ĐỐI) */}
            {scene.bg_video && (
                <AbsoluteFill>
                    <OffthreadVideo
                        src={scene.bg_video.match(/^(http|file):\/\//) ? scene.bg_video : staticFile(scene.bg_video)}
                        muted
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                </AbsoluteFill>
            )}

            <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${fadeOverlay})`, zIndex: 0 }} />

            {/* 2. LAYER GIỮA: DYNAMIC ROUTER CHO CÁC LAYOUT SKINS */}
            {layoutSkin === 'title_hook' && <SingleTitleHook content={{ ...scene.visual_content, brand_accent: scene.brand_accent }} />}
            {(layoutSkin === 'list_cascade' || layoutSkin === 'headline_list') && <SingleListCascade content={{ ...scene.visual_content, brand_accent: scene.brand_accent }} />}
            {layoutSkin === 'quote_box' && <SingleQuoteBox content={{ ...scene.visual_content, brand_accent: scene.brand_accent }} />}
            {layoutSkin === 'minimal_warning' && <SingleMinimalWarning content={{ ...scene.visual_content, brand_accent: scene.brand_accent }} />}
            {layoutSkin === 'statistic_pop' && <SingleStatisticPop content={{ ...scene.visual_content, brand_accent: scene.brand_accent }} />}
            {layoutSkin === 'tweet_overlay' && <SingleTweetOverlay scene={{ ...scene, visual_content: { ...scene.visual_content, brand_accent: scene.brand_accent } }} />}
            {layoutSkin === 'podcast_wave' && <SinglePodcastWave content={{ ...scene.visual_content, brand_accent: scene.brand_accent }} scene={scene} />}
            {layoutSkin === 'split_compare' && <SingleSplitCompare content={{ ...scene.visual_content, brand_accent: scene.brand_accent }} />}

            {/* 3. LAYER ĐỈNH: SUBTLE CTA (Minimalized per v7.4) */}
            <SubtleCTA
                text={scene.cta_text || "Đọc caption 👇"}
                delaySeconds={scene.cta_delay || 3}
            />
        </AbsoluteFill>
    );
};
