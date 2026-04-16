import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadPlayfair } from '@remotion/google-fonts/PlayfairDisplay';
import { SceneBg, AccentBar, TIMING, SPRING, SPACE, COLOR, TYPE, Z } from '../../foundation';

/**
 * BODY_STORY — Narrative / Storytelling
 *
 * Archetype: BODY_STORY
 * Act: 3 — BODY
 *
 * Design rules:
 *   - Có thể có b-roll ambient mờ (opacity 0.15) hoặc nền tối
 *   - Chương/chapter tag nhỏ ở trên trái
 *   - Đoạn text serif italic dạng kể chuyện
 *   - Pull quote — 1 câu được enlarge và highlight
 *   - Phần còn lại là body text nhỏ hơn
 *   - Mood: slow, contemplative
 *
 * Ví dụ Director JSON:
 * {
 *   "archetype": "BODY_STORY",
 *   "scene_rhythm": "slow",
 *   "voice_text": "Năm 2018, tôi mất tất cả. Công ty phá sản. Tài khoản về 0.",
 *   "props": {
 *     "chapter": "Câu chuyện của tôi",
 *     "pull_quote": "Năm 2018, tôi mất tất cả.",
 *     "body": "Công ty phá sản sau 3 năm xây dựng. Tài khoản về 0. Nhưng đó là lúc tôi học được điều quan trọng nhất.",
 *     "b_roll_keywords": ["empty office", "person thinking"]
 *   }
 * }
 */

interface BodyStoryProps {
    chapter?:     string;
    pull_quote?:  string;
    body?:        string;
    bg?:          'black' | 'dark' | 'dark-cool';
    src?:         string;
    font?:        'sans' | 'serif';
    brandAccent?: string;
}

export const BodyStory: React.FC<BodyStoryProps> = ({
    chapter    = '',
    pull_quote = 'Năm 2018, tôi mất tất cả.',
    body       = 'Công ty phá sản sau 3 năm xây dựng. Tài khoản về 0. Nhưng đó là lúc tôi học được điều quan trọng nhất.',
    bg         = 'dark',
    src        = '',
    font       = 'serif',
    brandAccent = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: sansFont }  = loadInter();
    const { fontFamily: serifFont } = loadPlayfair();

    const fontFamily = font === 'serif' ? serifFont : sansFont;

    // ── Timing ────────────────────────────────────────────────
    const chapterDelay   = 0;
    const barDelay       = TIMING.snap;
    const pullDelay      = TIMING.fast;
    const bodyTextDelay  = TIMING.slow;

    // ── Chapter ───────────────────────────────────────────────
    const chSp = spring({ frame: Math.max(0, frame - chapterDelay), fps, config: SPRING.snappy });
    const chOp = interpolate(chSp, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
    const chTy = interpolate(chSp, [0, 1], [-16, 0]);

    // ── Pull quote ────────────────────────────────────────────
    const pullSp = spring({ frame: Math.max(0, frame - pullDelay), fps, config: SPRING.gentle });
    const pullOp = interpolate(pullSp, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
    const pullTy = interpolate(pullSp, [0, 1], [40, 0]);

    // ── Body text ─────────────────────────────────────────────
    const bodySp = spring({ frame: Math.max(0, frame - bodyTextDelay), fps, config: SPRING.gentle });
    const bodyOp = interpolate(bodySp, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
    const bodyTy = interpolate(bodySp, [0, 1], [24, 0]);

    const Background = bg === 'dark-cool' ? SceneBg.DarkCool : bg === 'dark' ? SceneBg.Dark : SceneBg.Black;

    return (
        <AbsoluteFill>
            <Background />

            {/* Ambient b-roll nếu có src */}
            {src && <SceneBg.VideoAmbient src={src} opacity={0.14} />}

            {/* Vignette nhẹ */}
            {src && <SceneBg.Vignette strength="light" />}

            {/* Warm glow bottom-left — narrative mood */}
            <AbsoluteFill style={{
                background: `radial-gradient(ellipse at 0% 100%, ${brandAccent}08 0%, transparent 55%)`,
                pointerEvents: 'none',
            }} />

            <AbsoluteFill style={{
                justifyContent: 'center',
                alignItems:     'flex-start',
                paddingTop:     SPACE.safeTop,
                paddingBottom:  SPACE.safeBottom,
                paddingLeft:    SPACE.padH,
                paddingRight:   SPACE.padH,
                flexDirection:  'column',
                zIndex:         Z.content,
            }}>

                {/* ── Chapter tag ── */}
                {chapter && (
                    <div style={{
                        transform:    `translateY(${chTy}px)`,
                        opacity:      chOp,
                        marginBottom: `${SPACE.gapLg}px`,
                        display:      'flex',
                        alignItems:   'center',
                        gap:          '12px',
                    }}>
                        <div style={{
                            width:        '28px',
                            height:       '1px',
                            background:   `${brandAccent}88`,
                        }} />
                        <span style={{
                            fontFamily:    sansFont,
                            fontSize:      `${TYPE.caption.size}px`,
                            fontWeight:    400,
                            letterSpacing: '2.5px',
                            color:         COLOR.textSecondary,
                            textTransform: 'none',
                            fontStyle:     'italic',
                        }}>
                            {chapter}
                        </span>
                    </div>
                )}

                {/* ── AccentBar dọc + Pull quote ── */}
                <div style={{
                    display:      'flex',
                    flexDirection: 'row',
                    gap:          `${SPACE.gapLg}px`,
                    alignItems:   'stretch',
                    marginBottom: `${SPACE.gapLg}px`,
                    width:        '100%',
                }}>
                    {/* Bar dọc */}
                    <AccentBar
                        direction="vertical"
                        height="100%"
                        thickness={5}
                        color={brandAccent}
                        animate
                        delay={barDelay}
                        duration={TIMING.medium}
                        glow
                        radius={2}
                        style={{ alignSelf: 'stretch', flexShrink: 0 }}
                    />

                    {/* Pull quote */}
                    <div style={{
                        transform:  `translateY(${pullTy}px)`,
                        opacity:    pullOp,
                        flex:       1,
                    }}>
                        <span style={{
                            fontFamily,
                            fontSize:      `${TYPE.title.size}px`,
                            fontWeight:    font === 'serif' ? 700 : TYPE.title.weight,
                            letterSpacing: font === 'serif' ? '0' : `${TYPE.title.tracking}px`,
                            lineHeight:    1.2,
                            color:         COLOR.white,
                            display:       'block',
                            fontStyle:     font === 'serif' ? 'italic' : 'normal',
                        }}>
                            {pull_quote}
                        </span>
                    </div>
                </div>

                {/* ── Body text ── */}
                {body && (
                    <div style={{
                        transform: `translateY(${bodyTy}px)`,
                        opacity:   bodyOp,
                        width:     '100%',
                    }}>
                        <span style={{
                            fontFamily:    sansFont,
                            fontSize:      `${TYPE.body.size}px`,
                            fontWeight:    400,
                            letterSpacing: `${TYPE.body.tracking}px`,
                            lineHeight:    TYPE.body.lineHeight,
                            color:         COLOR.textSecondary,
                            display:       'block',
                        }}>
                            {body}
                        </span>
                    </div>
                )}
            </AbsoluteFill>
        </AbsoluteFill>
    );
};

