import { AbsoluteFill, Sequence, useVideoConfig, Img, Audio, OffthreadVideo, staticFile } from 'remotion';

// Import UI Components
import { KaraokeDynamic } from './ui/KaraokeDynamic';

// Import Archetype Scenes — Special
import { LogicDiagram } from './scenes/special/LogicDiagram';
import { BrollOverlay } from './scenes/special/BrollOverlay';
import { MediaCaption } from './scenes/special/MediaCaption';
import { MediaMiddle } from './scenes/special/MediaMiddle';
import { MediaBottom } from './scenes/special/MediaBottom';
import { MediaLowerThird } from './scenes/special/MediaLowerThird';

// Import Phase 1–4 Layouts (Foundation Architecture)
import {
    HookBrollText, HookContrast, HookCountdown, HookGlitch, HookQuestion, HookStat, HookZoomCrash,
    SetupStat, SetupQuote, SetupProblem, SetupTimeline, SetupPyramid, SetupStatBurst,
    BodyInsight, BodyCompare, BodyStory, BodyBeforeAfter, BodyChecklist, BodyHotspot,
    LandingSummary, LandingOffer, LandingTicker, LandingTransform,
} from './scenes';

// Import Archetype Scenes — Motion Graphics Pack
import { CinematicHook } from './scenes/special/CinematicHook';
import { CtaWave } from './scenes/cta/CtaWave';
import { CtaUrgency } from './scenes/cta/CtaUrgency';
import { NeonChart } from './scenes/special/NeonChart';
import { DualPath } from './scenes/special/DualPath';
import { WordScroll } from './scenes/special/WordScroll';
import { SpeechBubble } from './scenes/special/SpeechBubble';

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

                // Archetypes tự quản lý bg_video nội bộ — KHÔNG dùng ambient wrapper
                const ARCHETYPES_WITH_OWN_BG = new Set([
                    'ARCH_BROLL', 'HOOK_BROLL_TEXT', 'BODY_STORY',
                    'CINEMATIC_HOOK', 'MEDIA_TOP', 'MEDIA_MIDDLE', 'MEDIA_BOTTOM', 'MEDIA_LOWER_THIRD',
                    'BROLL_QUOTE', 'BROLL_BULLET', 'CTA_BOLD',
                ]);
                const isBrollType = ARCHETYPES_WITH_OWN_BG.has(scene.archetype)
                    || (scene.archetype && scene.archetype.startsWith('BROLL_'));

                // Ambient b-roll: áp dụng cho Foundation archetypes (nền đen) khi có bg_video + ambient_broll
                const showAmbientBroll = !!scene.bg_video && !!scene.ambient_broll && !isBrollType;

                return (
                    <Sequence key={i} from={scene.startFrame} durationInFrames={scene.durationInFrames} premountFor={fps}>

                        {/* ── LEGACY TEMPLATES — no longer supported ── */}
                        {/* scene.template_core === 'single_scene_dark' — legacy, removed */}
                        {/* scene.template_core === 'multi_scene_dark'  — legacy, removed */}

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
                                {/* CTA_BOLD excluded: it renders its own video at 40% opacity internally */}
                                {scene.bg_video && isBrollType && scene.archetype !== 'CTA_BOLD' && (
                                    <AbsoluteFill>
                                        <OffthreadVideo
                                            src={scene.bg_video.startsWith('http') ? scene.bg_video : staticFile(scene.bg_video)}
                                            muted
                                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                        />
                                    </AbsoluteFill>
                                )}

                                {/* ── Ambient B-Roll Layer ───────────────────────────────────────
                                    Áp dụng cho Foundation archetypes (HOOK_KINETIC, HOOK_QUESTION,
                                    SETUP_STAT, BODY_INSIGHT, LANDING_SUMMARY, v.v.) khi có:
                                      scene.ambient_broll = true
                                      scene.bg_video      = URL video Pexels/local
                                    Tạo depth cinematic mà KHÔNG che nội dung chữ phía trên.
                                ─────────────────────────────────────────────────────────────── */}
                                {showAmbientBroll && (
                                    <>
                                        {/* Video layer — mờ 22% để thấy texture mà không loé
                                            zIndex: 5 đảm bảo hiển thị trên SceneBg.Dark (z=0)
                                            nhưng dưới content (z=10) */}
                                        <AbsoluteFill style={{ opacity: 0.22, zIndex: 5 }}>
                                            <OffthreadVideo
                                                src={scene.bg_video!.startsWith('http') ? scene.bg_video! : staticFile(scene.bg_video!)}
                                                muted
                                                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                            />
                                        </AbsoluteFill>

                                        {/* Radial vignette — tối 4 góc, sáng giữa */}
                                        <AbsoluteFill style={{
                                            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, rgba(0,0,0,0.55) 100%)',
                                            zIndex: 5,
                                        }} />

                                        {/* Bottom gradient — bảo vệ karaoke zone */}
                                        <AbsoluteFill style={{
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 25%, transparent 55%)',
                                            zIndex: 5,
                                        }} />

                                        {/* Top gradient — bảo vệ safe area trên */}
                                        <AbsoluteFill style={{
                                            background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 20%)',
                                            zIndex: 5,
                                        }} />
                                    </>
                                )}

                                {/* ── ARCH_DIAGRAM ── */}

                                {scene.archetype === 'ARCH_DIAGRAM' && (
                                    <LogicDiagram
                                        type={scene.props?.type || 'loop'}
                                        nodes={scene.props?.nodes || []}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {/* ── BROLL OVERLAY ARCHETYPES ── */}

                                {scene.archetype === 'BROLL_QUOTE' && (
                                    <BrollOverlay
                                        type="quote"
                                        bg_video={scene.bg_video}
                                        headline={scene.props?.quote || scene.props?.text || scene.props?.headline || ''}
                                        subtext={scene.props?.author || scene.props?.subtext}
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
                                        browser_chrome={scene.props?.browser_chrome ?? (!!scene.url_screenshot)}
                                        url={scene.props?.url || scene.url_screenshot || ''}
                                    />
                                )}

                                {scene.archetype === 'MEDIA_MIDDLE' && (
                                    <MediaMiddle
                                        bg_video={scene.bg_video}
                                        image_src={scene.props?.image_src}
                                        headline={scene.props?.headline || ''}
                                        subtext={scene.props?.subtext}
                                        bullets={scene.props?.bullets}
                                        tag={scene.props?.tag}
                                        brandAccent={brandAccent}
                                        browser_chrome={scene.props?.browser_chrome ?? (!!scene.url_screenshot)}
                                        url={scene.props?.url || scene.url_screenshot || ''}
                                    />
                                )}

                                {scene.archetype === 'MEDIA_BOTTOM' && (
                                    <MediaBottom
                                        bg_video={scene.bg_video}
                                        image_src={scene.props?.image_src}
                                        headline={scene.props?.headline || ''}
                                        subtext={scene.props?.subtext}
                                        bullets={scene.props?.bullets}
                                        tag={scene.props?.tag}
                                        brandAccent={brandAccent}
                                        browser_chrome={scene.props?.browser_chrome ?? (!!scene.url_screenshot)}
                                        url={scene.props?.url || scene.url_screenshot || ''}
                                    />
                                )}

                                {scene.archetype === 'MEDIA_LOWER_THIRD' && (
                                    <MediaLowerThird
                                        bg_video={scene.bg_video}
                                        image_src={scene.props?.image_src}
                                        headline={scene.props?.headline || ''}
                                        subtext={scene.props?.subtext}
                                        bullets={scene.props?.bullets}
                                        tag={scene.props?.tag}
                                        brandAccent={brandAccent}
                                        browser_chrome={scene.props?.browser_chrome ?? (!!scene.url_screenshot)}
                                        url={scene.props?.url || scene.url_screenshot || ''}
                                    />
                                )}

                                {/* ── MOTION GRAPHICS PACK ── */}

                                {scene.archetype === 'CINEMATIC_HOOK' && (
                                    <CinematicHook
                                        bg_video={scene.bg_video}
                                        image_src={scene.props?.image_src}
                                        lines={scene.props?.lines || []}
                                        show_swoosh={scene.props?.show_swoosh ?? false}
                                        badge={scene.props?.badge}
                                        position={scene.props?.position || 'bottom'}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'NEON_CHART' && (
                                    <NeonChart
                                        title={scene.props?.title}
                                        mode={scene.props?.mode || 'single'}
                                        lines={scene.props?.lines || []}
                                        show_grid={scene.props?.show_grid ?? true}
                                        show_reflection={scene.props?.show_reflection ?? true}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'DUAL_PATH' && (
                                    <DualPath
                                        title={scene.props?.title}
                                        path_a={scene.props?.path_a}
                                        path_b={scene.props?.path_b}
                                        show_figure={scene.props?.show_figure ?? true}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'WORD_SCROLL' && (
                                    <WordScroll
                                        words={scene.props?.words || []}
                                        focus_index={scene.props?.focus_index}
                                        indicator={scene.props?.indicator || 'arrow'}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'SPEECH_BUBBLE' && (
                                    <SpeechBubble
                                        text={scene.props?.text || scene.props?.headline || ''}
                                        bg_color={scene.props?.bg_color}
                                        bubble_color={scene.props?.bubble_color}
                                        subcard={scene.props?.subcard}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {/* STICKY_NOTE removed — archetype deprecated */}

                                {/* ── PHASE 4 LANDING LAYOUTS ── */}

                                {scene.archetype === 'LANDING_SUMMARY' && (
                                    <LandingSummary
                                        tag={scene.props?.tag}
                                        headline={scene.props?.headline}
                                        sub={scene.props?.sub}
                                        align={scene.props?.align}
                                        bg={scene.props?.bg}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {/* LANDING_PROOF removed — archetype deprecated */}

                                {scene.archetype === 'LANDING_OFFER' && (
                                    <LandingOffer
                                        label={scene.props?.label}
                                        headline={scene.props?.headline}
                                        benefits={scene.props?.benefits}
                                        value_tag={scene.props?.value_tag}
                                        urgency={scene.props?.urgency}
                                        bg={scene.props?.bg}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'LANDING_TICKER' && (
                                    <LandingTicker
                                        headline={scene.props?.headline}
                                        stats={scene.props?.stats}
                                        ticker_items={scene.props?.ticker_items}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'LANDING_TRANSFORM' && (
                                    <LandingTransform
                                        before_text={scene.props?.before_text}
                                        after_text={scene.props?.after_text}
                                        before_sub={scene.props?.before_sub}
                                        after_sub={scene.props?.after_sub}
                                        transform_frame={scene.props?.transform_frame}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {/* ── PHASE 3 BODY LAYOUTS ── */}

                                {/* BODY_LIST removed — archetype deprecated */}

                                {scene.archetype === 'BODY_INSIGHT' && (
                                    <BodyInsight
                                        tag={scene.props?.tag}
                                        headline={scene.props?.headline}
                                        sub={scene.props?.sub}
                                        index={scene.props?.index}
                                        font={scene.props?.font}
                                        align={scene.props?.align}
                                        bg={scene.props?.bg}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'BODY_COMPARE' && (
                                    <BodyCompare
                                        headline={scene.props?.headline}
                                        left_label={scene.props?.left_label}
                                        right_label={scene.props?.right_label}
                                        left_color={scene.props?.left_color}
                                        rows={scene.props?.rows}
                                        bg={scene.props?.bg}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'BODY_STORY' && (
                                    <BodyStory
                                        chapter={scene.props?.chapter}
                                        pull_quote={scene.props?.pull_quote}
                                        body={scene.props?.body}
                                        src={scene.bg_video || scene.props?.src}
                                        font={scene.props?.font}
                                        bg={scene.props?.bg}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'BODY_BEFORE_AFTER' && (
                                    <BodyBeforeAfter
                                        before={scene.props?.before}
                                        after={scene.props?.after}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'BODY_CHECKLIST' && (
                                    <BodyChecklist
                                        headline={scene.props?.headline}
                                        items={scene.props?.items}
                                        style={scene.props?.style}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'BODY_HOTSPOT' && (
                                    <BodyHotspot
                                        bg_video={scene.bg_video || scene.props?.bg_video}
                                        hotspots={scene.props?.hotspots}
                                        headline={scene.props?.headline}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {/* ── PHASE 2 SETUP LAYOUTS ── */}

                                {scene.archetype === 'SETUP_STAT' && (
                                    <SetupStat
                                        stat={scene.props?.stat}
                                        suffix={scene.props?.suffix}
                                        prefix={scene.props?.prefix}
                                        label={scene.props?.label}
                                        context={scene.props?.context}
                                        sub_stats={scene.props?.sub_stats}
                                        bg={scene.props?.bg}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'SETUP_QUOTE' && (
                                    <SetupQuote
                                        quote={scene.props?.quote}
                                        author={scene.props?.author}
                                        role={scene.props?.role}
                                        source={scene.props?.source}
                                        style={scene.props?.style}
                                        bg={scene.props?.bg}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'SETUP_TIMELINE' && (
                                    <SetupTimeline
                                        headline={scene.props?.headline}
                                        events={scene.props?.events}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'SETUP_PYRAMID' && (
                                    <SetupPyramid
                                        headline={scene.props?.headline}
                                        layers={scene.props?.layers}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'SETUP_STAT_BURST' && (
                                    <SetupStatBurst
                                        headline={scene.props?.headline}
                                        stats={scene.props?.stats}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {/* SETUP_STEPS removed — archetype deprecated */}

                                {scene.archetype === 'SETUP_PROBLEM' && (
                                    <SetupProblem
                                        tag={scene.props?.tag}
                                        headline={scene.props?.headline}
                                        pains={scene.props?.pains}
                                        solution_hint={scene.props?.solution_hint}
                                        pain_color={scene.props?.pain_color}
                                        bg={scene.props?.bg}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {/* ── PHASE 1 HOOK LAYOUTS (Foundation Architecture) ── */}

                                {/* HOOK_KINETIC removed — replaced by HOOK_GLITCH */}

                                {scene.archetype === 'HOOK_GLITCH' && (
                                    <HookGlitch
                                        lines={scene.props?.lines}
                                        align={scene.props?.align}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'HOOK_COUNTDOWN' && (
                                    <HookCountdown
                                        lines={scene.props?.lines}
                                        align={scene.props?.align}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'HOOK_ZOOM_CRASH' && (
                                    <HookZoomCrash
                                        lines={scene.props?.lines}
                                        align={scene.props?.align}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'HOOK_BROLL_TEXT' && (
                                    <HookBrollText
                                        src={scene.bg_video || scene.props?.src}
                                        image_src={scene.props?.image_src}
                                        lines={scene.props?.lines}
                                        position={scene.props?.position}
                                        align={scene.props?.align}
                                        vignette={scene.props?.vignette}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'HOOK_QUESTION' && (
                                    <HookQuestion
                                        question={scene.props?.question}
                                        sub={scene.props?.sub}
                                        show_mark={scene.props?.show_mark}
                                        mark_pos={scene.props?.mark_pos}
                                        bg={scene.props?.bg}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'HOOK_CONTRAST' && (
                                    <HookContrast
                                        left_text={scene.props?.left_text}
                                        right_text={scene.props?.right_text}
                                        left_label={scene.props?.left_label}
                                        right_label={scene.props?.right_label}
                                        left_sub={scene.props?.left_sub}
                                        right_sub={scene.props?.right_sub}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {scene.archetype === 'HOOK_STAT' && (
                                    <HookStat
                                        variant={scene.props?.variant}
                                        stat={scene.props?.stat}
                                        from={scene.props?.from}
                                        to={scene.props?.to}
                                        suffix={scene.props?.suffix}
                                        prefix={scene.props?.prefix}
                                        format={scene.props?.format}
                                        easing={scene.props?.easing}
                                        items={scene.props?.items}
                                        label={scene.props?.label}
                                        context={scene.props?.context}
                                        show_bar={scene.props?.show_bar}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {/* ── CTA BOLD ── */}

                                {scene.archetype === 'CTA_BOLD' && (
                                    <CtaWave
                                        variant={scene.props?.variant || 'comment'}
                                        action={scene.props?.action}
                                        keyword={scene.props?.keyword}
                                        reason={scene.props?.reason}
                                        brand_handle={scene.props?.brand_handle}
                                        bg_video={scene.bg_video}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {/* ── CTA URGENCY ── */}

                                {scene.archetype === 'CTA_URGENCY' && (
                                    <CtaUrgency
                                        lines={scene.props?.lines}
                                        timer_label={scene.props?.timer_label}
                                        timer_display={scene.props?.timer_display}
                                        urgency_text={scene.props?.urgency_text}
                                        brandAccent={brandAccent}
                                    />
                                )}

                                {/* ── KARAOKE SUBTITLE — hiển thị trên tất cả archetype ── */}
                                {scene.karaoke_file && (
                                    <KaraokeDynamic karaokeFile={scene.karaoke_file} brandAccent={brandAccent} />
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
                        {timeline[0]?.brand_logo && (
                            <Img
                                src={timeline[0].brand_logo}
                                style={{ width: 60, height: 60, objectFit: 'contain' }}
                            />
                        )}
                        <span style={{ fontSize: 35, color: '#FFF', fontWeight: 'bold', letterSpacing: '4px' }}>
                            {watermark.text}
                        </span>
                    </div>
                </AbsoluteFill>
            )}
        </AbsoluteFill>
    );
};
