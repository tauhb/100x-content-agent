import { AbsoluteFill, Sequence, useVideoConfig, Img, Audio, OffthreadVideo, staticFile } from 'remotion';

// Import Các Lõi Template Nội Bộ
import { SingleSceneTemplate } from './templates/core/SingleSceneTemplate';
import { MultiSceneDarkTemplate } from './templates/core/MultiSceneDarkTemplate';

// Import Archetype Scenes — Original
import { LogicDiagram } from './templates/scenes/LogicDiagram';
import { MetricChart } from './templates/scenes/MetricChart';
import { CodeTerminal } from './templates/scenes/CodeTerminal';
import { SplitCompare } from './templates/scenes/SplitCompare';

// Import Archetype Scenes — New Layout Matrix
import { BrollOverlay } from './templates/scenes/BrollOverlay';
import { KineticText } from './templates/scenes/KineticText';
import { DataProgress } from './templates/scenes/DataProgress';
import { MediaCaption } from './templates/scenes/MediaCaption';
import { RichCardList } from './templates/scenes/RichCardList';

export const MainComposition = ({ timeline }: { timeline: any[] }) => {
    const { fps } = useVideoConfig();

    let currentFrame = 0;
    const scenesWithFrames = timeline.map((scene) => {
        const durationInFrames = Math.round((scene.duration_sec || 4) * fps);
        const startFrame = currentFrame;
        currentFrame += durationInFrames;
        return { ...scene, startFrame, durationInFrames };
    });

    // White-label: watermark config comes from scene brand props (injected by engine)
    const watermark = timeline[0]?.brand_watermark;

    return (
        <AbsoluteFill style={{ backgroundColor: '#000000', color: 'white' }}>
            {/* NHẠC NỀN XUYÊN SUỐT TOÀN VIDEO */}
            {timeline[0]?.bg_music && (
                <Audio
                    src={timeline[0].bg_music.startsWith('http') ? timeline[0].bg_music : staticFile(timeline[0].bg_music)}
                    volume={0.35}
                />
            )}

            {scenesWithFrames.map((scene, i) => {
                const brandAccent = scene.brand_accent || '#B6FF00';
                const isBrollType = scene.archetype === 'ARCH_BROLL' || (scene.archetype && scene.archetype.startsWith('BROLL_'));

                return (
                    <Sequence key={i} from={scene.startFrame} durationInFrames={scene.durationInFrames}>

                        {/* ── LEGACY TEMPLATES ── */}
                        {scene.template_core === 'single_scene_dark' && (
                            <SingleSceneTemplate scene={scene} />
                        )}
                        {scene.template_core === 'multi_scene_dark' && (
                            <MultiSceneDarkTemplate scene={scene} />
                        )}

                        {/* ── ARCHETYPE DIRECTOR ── */}
                        {scene.template_core === 'archetype_director' && (
                            <AbsoluteFill style={{ background: '#000' }}>
                                {/* Voice Audio */}
                                {scene.voice_audio && (
                                    <Audio
                                        src={scene.voice_audio.match(/^(http|file):\/\//) ? scene.voice_audio : staticFile(scene.voice_audio)}
                                        volume={1}
                                    />
                                )}

                                {/* B-Roll Video Background — only for BROLL archetypes */}
                                {scene.bg_video && isBrollType && (
                                    <AbsoluteFill>
                                        <OffthreadVideo
                                            src={scene.bg_video.startsWith('http') ? scene.bg_video : staticFile(scene.bg_video)}
                                            muted
                                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                        />
                                    </AbsoluteFill>
                                )}

                                {/* Ambient B-Roll mờ cho các layout chữ/biểu đồ (nếu có bg_video + ambient_broll=true) */}
                                {scene.bg_video && scene.ambient_broll && !isBrollType && (
                                    <AbsoluteFill>
                                        <OffthreadVideo
                                            src={scene.bg_video.startsWith('http') ? scene.bg_video : staticFile(scene.bg_video)}
                                            muted
                                            style={{ objectFit: 'cover', width: '100%', height: '100%', opacity: 0.12 }}
                                        />
                                    </AbsoluteFill>
                                )}

                                {/* ── ORIGINAL ARCHETYPES ── */}

                                {scene.archetype === 'ARCH_DIAGRAM' && (
                                    <LogicDiagram
                                        type={scene.props?.type || 'loop'}
                                        nodes={scene.props?.nodes || []}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'ARCH_DATA' && (
                                    <MetricChart
                                        type={scene.props?.type || 'bar'}
                                        title={scene.props?.title}
                                        data={scene.props?.data || []}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'ARCH_TERMINAL' && (
                                    <CodeTerminal
                                        lines={scene.props?.lines || []}
                                        title={scene.props?.title}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'ARCH_SPLIT' && (
                                    <SplitCompare
                                        left={scene.props?.left || { text: '' }}
                                        right={scene.props?.right || { text: '' }}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {/* ARCH_BROLL: B-Roll with text overlay via SingleSceneTemplate */}
                                {scene.archetype === 'ARCH_BROLL' && (
                                    <SingleSceneTemplate scene={{ ...scene, template_core: 'single_scene_dark' }} />
                                )}

                                {/* ── NEW BROLL OVERLAY ARCHETYPES ── */}

                                {scene.archetype === 'BROLL_HOOK' && (
                                    <BrollOverlay
                                        type="hook"
                                        bg_video={scene.bg_video}
                                        headline={scene.props?.headline || scene.visual_content?.headline || ''}
                                        subtext={scene.props?.subtext}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'BROLL_QUOTE' && (
                                    <BrollOverlay
                                        type="quote"
                                        bg_video={scene.bg_video}
                                        headline={scene.props?.text || scene.props?.headline || ''}
                                        subtext={scene.props?.author || scene.props?.subtext}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'BROLL_STAT' && (
                                    <BrollOverlay
                                        type="stat"
                                        bg_video={scene.bg_video}
                                        stat={scene.props?.stat || ''}
                                        stat_label={scene.props?.label || ''}
                                        headline={scene.props?.context}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'BROLL_BULLET' && (
                                    <BrollOverlay
                                        type="bullet"
                                        bg_video={scene.bg_video}
                                        headline={scene.props?.headline}
                                        bullets={scene.props?.bullets || []}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {/* ── KINETIC TEXT ARCHETYPES ── */}

                                {scene.archetype === 'KINETIC_WORD' && (
                                    <KineticText
                                        type="word"
                                        text={scene.props?.text || ''}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'KINETIC_REVEAL' && (
                                    <KineticText
                                        type="reveal"
                                        text={scene.props?.text || ''}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'KINETIC_COUNT' && (
                                    <KineticText
                                        type="count"
                                        count_from={scene.props?.from ?? 0}
                                        count_to={scene.props?.to ?? 100}
                                        count_suffix={scene.props?.suffix || ''}
                                        count_label={scene.props?.label || ''}
                                        text={scene.props?.context || ''}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {/* ── RICH CARD LIST ── */}

                                {scene.archetype === 'ARCH_CARDS' && (
                                    <RichCardList
                                        style={scene.props?.style || 'icon'}
                                        headline={scene.props?.headline}
                                        items={scene.props?.items || []}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {/* ── MEDIA CAPTION LAYOUT ── */}

                                {scene.archetype === 'MEDIA_TOP' && (
                                    <MediaCaption
                                        bg_video={scene.bg_video}
                                        image_src={scene.props?.image_src || scene.avatarUrl}
                                        split_ratio={scene.props?.split_ratio ?? 0.50}
                                        headline={scene.props?.headline || ''}
                                        subtext={scene.props?.subtext}
                                        bullets={scene.props?.bullets}
                                        tag={scene.props?.tag}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {/* ── DATA ARCHETYPES ── */}

                                {scene.archetype === 'DATA_PROGRESS' && (
                                    <DataProgress
                                        title={scene.props?.title}
                                        items={scene.props?.items || scene.props?.data || []}
                                        brandAccent={brandAccent}
                                    />
                                )}
                            </AbsoluteFill>
                        )}

                        {/* Backwards compatibility: layout field */}
                        {(!scene.template_core && scene.layout === 'text_overlay') && (
                            <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #111, #000)', zIndex: 0 }} />
                                <h1 style={{ fontSize: 100, color: brandAccent, fontWeight: 'bold', textAlign: 'center', zIndex: 1 }}>
                                    {scene.visual_content?.headline}
                                </h1>
                            </AbsoluteFill>
                        )}
                    </Sequence>
                );
            })}

            {/* GLOBAL BRAND WATERMARK */}
            {watermark?.enabled && (
                <AbsoluteFill style={{
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    paddingBottom: watermark.bottom_margin || '80px',
                    zIndex: 9999,
                    pointerEvents: 'none',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', opacity: watermark.opacity || 0.6 }}>
                        <Img
                            src={timeline[0]?.brand_logo || staticFile('assets/brand_logo.png')}
                            style={{ width: 60, height: 60, objectFit: 'contain' }}
                        />
                        <span style={{ fontSize: 35, color: '#FFF', fontWeight: 'bold', letterSpacing: '4px' }}>
                            {watermark.text}
                        </span>
                    </div>
                </AbsoluteFill>
            )}
        </AbsoluteFill>
    );
};
