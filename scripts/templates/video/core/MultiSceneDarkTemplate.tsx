import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, staticFile, OffthreadVideo, Audio } from 'remotion';
import { SubtleCTA } from '../components/SubtleCTA';
import { SingleTitleHook } from '../layouts/single_scene/SingleTitleHook';
import { SingleListCascade } from '../layouts/single_scene/SingleListCascade';
import { SingleQuoteBox } from '../layouts/single_scene/SingleQuoteBox';
import { SingleTweetOverlay } from '../layouts/single_scene/SingleTweetOverlay';
import { SingleStatisticPop } from '../layouts/single_scene/SingleStatisticPop';
import { SingleMinimalWarning } from '../layouts/single_scene/SingleMinimalWarning';
import { KaraokeDynamic } from '../components/KaraokeDynamic';

export const MultiSceneDarkTemplate: React.FC<{ scene: any }> = ({ scene }) => {
    const { fps } = useVideoConfig();
    const frame = useCurrentFrame();

    // Màn trập đen
    const fadeOverlay = interpolate(frame, [0, 15], [0, 0.7], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const layoutSkin = scene.layout_skin || 'title_hook';

    return (
        <AbsoluteFill style={{ backgroundColor: '#000', color: 'white', fontFamily: '"Inter", sans-serif' }}>
            {/* Lớp Nền Động B-Roll */}
            {scene.bg_video && (
                <AbsoluteFill>
                    <OffthreadVideo src={staticFile(scene.bg_video)} style={{ objectFit: 'cover', width: '100%', height: '100%' }} muted={true} />
                </AbsoluteFill>
            )}
            <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${fadeOverlay})`, zIndex: 0 }} />
            
            {/* Lớp Âm Thanh: Giọng đọc AI to */}
            {scene.voice_audio && <Audio src={staticFile(scene.voice_audio)} volume={1.0} />}

            {/* Bộ định tuyến Da (Layout Skin Router) */}
            {layoutSkin === 'title_hook' && <SingleTitleHook content={scene.visual_content} />}
            {(layoutSkin === 'list_cascade' || layoutSkin === 'headline_list') && <SingleListCascade content={scene.visual_content} />}
            {layoutSkin === 'quote_box' && <SingleQuoteBox content={scene.visual_content} />}
            {layoutSkin === 'tweet_overlay' && <SingleTweetOverlay scene={scene} />}
            {layoutSkin === 'statistic_pop' && <SingleStatisticPop content={scene.visual_content} />}
            {layoutSkin === 'minimal_warning' && <SingleMinimalWarning content={scene.visual_content} />}

            {/* Lớp Subtitle Đập Nhịp Karaoke (Nằm chìm xuống 1/3 dưới cùng) */}
            {scene.karaoke_file && <KaraokeDynamic karaokeFile={scene.karaoke_file} />}

            {/* Chỉ bồi CTA Nhắc nhở ở Cảnh Cuối (Phase = cta) */}
            {scene.phase === 'cta' && (
                <SubtleCTA text={scene.visual_content.cta_text || "Lưu video này lại 👇"} delaySeconds={1} />
            )}
        </AbsoluteFill>
    );
};
