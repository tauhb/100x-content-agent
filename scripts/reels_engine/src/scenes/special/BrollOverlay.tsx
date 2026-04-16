import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, spring } from 'remotion';
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { RichText } from '../../ui/RichText';
import {
    TYPE, SPRING, TIMING, SPACE, COLOR, SceneBg, Z,
} from '../../foundation';

interface BrollOverlayProps {
    type: 'quote' | 'stat' | 'bullet' | 'hook';
    bg_video?: string;
    headline?: string;
    subtext?: string;
    stat?: string;
    stat_label?: string;
    bullets?: string[];
    brandAccent?: string;
}

export const BrollOverlay: React.FC<BrollOverlayProps> = ({
    type,
    bg_video,
    headline = '',
    subtext = '',
    stat = '',
    stat_label = '',
    bullets = [],
    brandAccent = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    const { fontFamily: serifFont } = loadPlayfair();

    // ── Entrance helpers ──────────────────────────────────────────────────
    const makeSpring = (delay: number) => spring({
        frame: Math.max(0, frame - delay),
        fps,
        config: SPRING.snappy,
    });

    const makeSlide = (delay: number, distance = 48) => {
        const sp = makeSpring(delay);
        return {
            opacity:   interpolate(sp, [0, 0.25], [0, 1], { extrapolateRight: 'clamp' }),
            translateY: interpolate(sp, [0, 1], [distance, 0]),
        };
    };

    // ── Exit — fade out trong 8 frames cuối ──────────────────────────────
    const EXIT_FRAMES = 8;
    const exitOpacity = interpolate(
        frame,
        [durationInFrames - EXIT_FRAMES, durationInFrames],
        [1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
    );

    const pop = spring({ frame, fps, config: SPRING.normal });

    const safeArea: React.CSSProperties = {
        paddingTop:    `${SPACE.safeTop}px`,
        paddingBottom: `${SPACE.safeBottom}px`,
        paddingLeft:   `${SPACE.padH}px`,
        paddingRight:  `${SPACE.padH}px`,
    };

    return (
        <AbsoluteFill>
            {/* Background */}
            {bg_video
                ? <SceneBg.Video src={bg_video} />
                : <SceneBg.Dark />
            }

            {/* Vignette — dense bottom for readability */}
            <SceneBg.Vignette strength="heavy" />

            {/* Content layer */}
            <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', ...safeArea, zIndex: Z.content }}>
                {/* Exit wrapper — toàn bộ content fade out cùng lúc */}
                <div style={{ width: '100%', opacity: exitOpacity }}>

                    {/* BROLL_HOOK — headline + subtext stagger riêng */}
                    {type === 'hook' && (() => {
                        const h = makeSlide(0);
                        const s = makeSlide(TIMING.fast);
                        return (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ opacity: h.opacity, transform: `translateY(${h.translateY}px)` }}>
                                    <h1 style={{
                                        fontSize: `${TYPE.title.size}px`,
                                        fontFamily: serifFont,
                                        fontWeight: TYPE.title.weight,
                                        color: COLOR.white,
                                        lineHeight: TYPE.title.lineHeight,
                                        letterSpacing: `${TYPE.title.tracking}px`,
                                        textShadow: `0 0 40px ${brandAccent}88`,
                                        margin: 0,
                                    }}>
                                        <RichText text={headline} brandAccent={brandAccent} themeType="headline" staggerDelay={4} />
                                    </h1>
                                </div>
                                {subtext && (
                                    <div style={{ opacity: s.opacity, transform: `translateY(${s.translateY}px)`, marginTop: `${SPACE.gap}px` }}>
                                        <p style={{
                                            fontSize: `${TYPE.body.size}px`,
                                            color: COLOR.textSecondary,
                                            fontWeight: TYPE.body.weight,
                                            margin: 0,
                                        }}>
                                            {subtext}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    {/* BROLL_QUOTE — accent bar + italic quote */}
                    {type === 'quote' && (() => {
                        const q = makeSlide(0, 40);
                        const a = makeSlide(TIMING.fast, 20);
                        return (
                            <div style={{
                                borderLeft: `6px solid ${brandAccent}`,
                                paddingLeft: `${SPACE.padH}px`,
                                width: '100%',
                            }}>
                                <div style={{ opacity: q.opacity, transform: `translateY(${q.translateY}px)` }}>
                                    <p style={{
                                        fontSize: '52px',
                                        fontFamily: serifFont,
                                        fontStyle: 'italic',
                                        color: COLOR.white,
                                        lineHeight: 1.3,
                                        margin: 0,
                                    }}>
                                        <RichText text={`"${headline}"`} brandAccent={brandAccent} themeType="body" staggerDelay={3} />
                                    </p>
                                </div>
                                {subtext && (
                                    <div style={{ opacity: a.opacity, transform: `translateY(${a.translateY}px)`, marginTop: `${SPACE.gapSm}px` }}>
                                        <p style={{
                                            fontSize: `${TYPE.caption.size}px`,
                                            color: brandAccent,
                                            fontWeight: '600',
                                            letterSpacing: '2px',
                                            textTransform: 'none',
                                            margin: 0,
                                        }}>
                                            — {subtext}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    {/* BROLL_STAT — giant number + label */}
                    {type === 'stat' && (() => {
                        const fadeIn = interpolate(frame, [0, TIMING.fast], [0, 1], { extrapolateRight: 'clamp' });
                        const labelSlide = makeSlide(TIMING.fast, 24);
                        return (
                            <div style={{ textAlign: 'center', width: '100%' }}>
                                <div style={{
                                    fontSize: `${TYPE.display.size}px`,
                                    fontFamily: serifFont,
                                    fontWeight: TYPE.display.weight,
                                    color: brandAccent,
                                    lineHeight: TYPE.display.lineHeight,
                                    transform: `scale(${pop})`,
                                    opacity: fadeIn,
                                    textShadow: `0 0 80px ${brandAccent}66`,
                                }}>
                                    {stat}
                                </div>
                                <div style={{ opacity: labelSlide.opacity, transform: `translateY(${labelSlide.translateY}px)` }}>
                                    <p style={{
                                        fontSize: `${TYPE.body.size}px`,
                                        color: 'rgba(255,255,255,0.85)',
                                        marginTop: `${SPACE.gapSm}px`,
                                        fontWeight: '600',
                                        letterSpacing: '3px',
                                        textTransform: 'none',
                                    }}>
                                        {stat_label}
                                    </p>
                                    {headline && (
                                        <p style={{
                                            fontSize: `${TYPE.caption.size + 4}px`,
                                            color: COLOR.textMuted,
                                            marginTop: `${SPACE.gapSm}px`,
                                        }}>
                                            {headline}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })()}

                    {/* BROLL_BULLET — headline + staggered bullets */}
                    {type === 'bullet' && (() => {
                        const h = makeSlide(0);
                        return (
                            <div style={{ width: '100%' }}>
                                {headline && (
                                    <div style={{ opacity: h.opacity, transform: `translateY(${h.translateY}px)`, marginBottom: `${SPACE.gapLg}px` }}>
                                        <h2 style={{
                                            fontSize: '50px',
                                            fontFamily: serifFont,
                                            color: COLOR.white,
                                            fontWeight: TYPE.title.weight,
                                            margin: 0,
                                        }}>
                                            <RichText text={headline} brandAccent={brandAccent} themeType="headline" staggerDelay={3} />
                                        </h2>
                                    </div>
                                )}
                                {bullets.map((bullet, i) => {
                                    // Bullet stagger bắt đầu sau headline (TIMING.fast), mỗi item lệch thêm TIMING.stagger*2
                                    const bulletDelay = TIMING.fast + i * TIMING.stagger * 2;
                                    const itemSp = makeSpring(bulletDelay);
                                    const itemOpacity = interpolate(itemSp, [0, 0.25], [0, 1], { extrapolateRight: 'clamp' });
                                    const itemX = interpolate(itemSp, [0, 1], [-36, 0]);
                                    return (
                                        <div key={i} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: `${SPACE.gap}px`,
                                            marginBottom: '18px',
                                            opacity: itemOpacity,
                                            transform: `translateX(${itemX}px)`,
                                        }}>
                                            <div style={{
                                                width: '10px',
                                                height: '10px',
                                                borderRadius: '50%',
                                                background: brandAccent,
                                                flexShrink: 0,
                                                boxShadow: `0 0 10px ${brandAccent}`,
                                            }} />
                                            <span style={{
                                                fontSize: `${TYPE.body.size - 4}px`,
                                                color: COLOR.white,
                                                fontWeight: TYPE.body.weight,
                                            }}>
                                                {bullet}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()}

                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
