import React from 'react';
import {
    AbsoluteFill, useCurrentFrame, useVideoConfig,
    interpolate, spring, OffthreadVideo, staticFile, Img,
} from 'remotion';
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { TYPE, SPRING, TIMING, SPACE, COLOR, Z } from '../../foundation';

/**
 * CtaWave — Action Card CTA
 *
 * Archetype: CTA_BOLD
 *
 * Design:
 *   - Video background at ~40% opacity
 *   - Dark cinematic gradients
 *   - Big icon (💬 comment / 🔁 share) with glow ring
 *   - Bold action verb (e.g. "BÌNH LUẬN NGAY")
 *   - Accent pill badge with keyword
 *   - Thin divider + reason text
 *   - Optional brand handle
 *
 * Props:
 *   variant?:       'comment' | 'share'   (default: 'comment')
 *   action?:        Override action verb text
 *   keyword?:       Keyword shown in accent badge
 *   reason?:        Reason text below divider
 *   brand_handle?:  e.g. "@yourpage"
 *   bg_video?:      Video URL (served via micro-server)
 *   brandAccent?:   Brand accent color
 */

interface CtaWaveProps {
    variant?:       'comment' | 'share';
    action?:        string;
    keyword?:       string;
    reason?:        string;
    brand_handle?:  string;
    bg_video?:      string;
    brandAccent?:   string;
}

const ICON_MAP = { comment: '💬', share: '🔁' };

export const CtaWave: React.FC<CtaWaveProps> = ({
    variant      = 'comment',
    action,
    keyword,
    reason,
    brand_handle,
    bg_video,
    brandAccent  = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    const { fontFamily } = loadInter();

    const icon          = ICON_MAP[variant] || ICON_MAP.comment;
    const defaultAction = variant === 'share' ? 'CHIA SẺ NGAY' : 'BÌNH LUẬN NGAY';
    const displayAction = action || defaultAction;
    const defaultReason = variant === 'share' ? 'Nếu bạn thấy giá trị' : 'Để nhận thêm';
    const displayReason = reason || defaultReason;

    // ── Exit fade ─────────────────────────────────────────────────────────
    const exitFade = interpolate(
        frame,
        [durationInFrames - 10, durationInFrames - 2],
        [1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    // ── Icon entrance — bouncy drop ───────────────────────────────────────
    const iconSp    = spring({ frame, fps, config: SPRING.bouncy });
    const iconScale = interpolate(iconSp, [0, 1], [0.2, 1]);
    const iconOp    = interpolate(iconSp, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });

    // ── Action verb — slide up ────────────────────────────────────────────
    const actionDelay  = TIMING.fast;
    const actionSp     = spring({ frame: Math.max(0, frame - actionDelay), fps, config: SPRING.snappy });
    const actionTy     = interpolate(actionSp, [0, 1], [50, 0]);
    const actionOp     = interpolate(actionSp, [0, 0.35], [0, 1], { extrapolateRight: 'clamp' });

    // ── Keyword badge — scale in ──────────────────────────────────────────
    const kwDelay  = actionDelay + TIMING.fast;
    const kwSp     = spring({ frame: Math.max(0, frame - kwDelay), fps, config: SPRING.bouncy });
    const kwScale  = interpolate(kwSp, [0, 1], [0.5, 1]);
    const kwOp     = interpolate(kwSp, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });

    // ── Divider + reason + handle — fade ──────────────────────────────────
    const reasonDelay = kwDelay + TIMING.medium;
    const reasonOp    = interpolate(
        frame,
        [reasonDelay, reasonDelay + TIMING.medium],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    const handleDelay = reasonDelay + TIMING.fast;
    const handleOp    = interpolate(
        frame,
        [handleDelay, handleDelay + TIMING.medium],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return (
        <AbsoluteFill style={{ opacity: exitFade }}>

            {/* ── Video background at 40% opacity ── */}
            {bg_video ? (
                <AbsoluteFill style={{ opacity: 0.40 }}>
                    <OffthreadVideo
                        src={bg_video.startsWith('http') ? bg_video : staticFile(bg_video)}
                        muted
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                </AbsoluteFill>
            ) : (
                <AbsoluteFill style={{ background: '#060608' }} />
            )}

            {/* ── Dark cinematic overlays ── */}
            <AbsoluteFill style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.60) 45%, rgba(0,0,0,0.80) 100%)',
            }} />

            {/* ── Accent glow blob ── */}
            <AbsoluteFill style={{
                background: `radial-gradient(ellipse 70% 45% at 50% 50%, ${brandAccent}16 0%, transparent 70%)`,
                pointerEvents: 'none',
            }} />

            {/* ── Content card ── */}
            <AbsoluteFill style={{
                justifyContent: 'center',
                alignItems:     'center',
                paddingTop:     `${SPACE.safeTop}px`,
                paddingBottom:  `${SPACE.safeBottom}px`,
                zIndex:         Z.content,
            }}>
                <div style={{
                    display:       'flex',
                    flexDirection: 'column',
                    alignItems:    'center',
                    width:         '100%',
                    paddingLeft:   `${SPACE.padH}px`,
                    paddingRight:  `${SPACE.padH}px`,
                }}>

                    {/* ── ICON with glow ring ── */}
                    <div style={{
                        transform:      `scale(${iconScale})`,
                        opacity:        iconOp,
                        marginBottom:   '48px',
                        position:       'relative',
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                    }}>
                        {/* Glow halo */}
                        <div style={{
                            position:     'absolute',
                            width:        '140px',
                            height:       '140px',
                            borderRadius: '50%',
                            background:   `${brandAccent}1A`,
                            boxShadow:    `0 0 50px ${brandAccent}44, 0 0 100px ${brandAccent}1A`,
                            border:       `2px solid ${brandAccent}40`,
                        }} />
                        <span style={{
                            fontSize:   '88px',
                            lineHeight: 1,
                            position:   'relative',
                            zIndex:     1,
                            filter:     'drop-shadow(0 0 16px rgba(0,0,0,0.9))',
                        }}>
                            {icon}
                        </span>
                    </div>

                    {/* ── ACTION VERB ── */}
                    <div style={{
                        transform:    `translateY(${actionTy}px)`,
                        opacity:      actionOp,
                        marginBottom: '36px',
                        textAlign:    'center',
                    }}>
                        <span style={{
                            fontFamily,
                            fontSize:      `${TYPE.hero.size}px`,
                            fontWeight:    900,
                            color:         COLOR.white,
                            letterSpacing: '4px',
                            textTransform: 'uppercase',
                            textShadow:    '0 2px 40px rgba(0,0,0,0.9)',
                            display:       'block',
                        }}>
                            {displayAction}
                        </span>
                    </div>

                    {/* ── KEYWORD BADGE ── */}
                    {keyword && (
                        <div style={{
                            transform:    `scale(${kwScale})`,
                            opacity:      kwOp,
                            marginBottom: '48px',
                        }}>
                            <div style={{
                                background:    brandAccent,
                                borderRadius:  '100px',
                                paddingTop:    '16px',
                                paddingBottom: '16px',
                                paddingLeft:   '48px',
                                paddingRight:  '48px',
                                display:       'inline-block',
                                boxShadow:     `0 0 32px ${brandAccent}55`,
                            }}>
                                <span style={{
                                    fontFamily,
                                    fontSize:      `${TYPE.body.size * 0.80}px`,
                                    fontWeight:    800,
                                    color:         '#000',
                                    letterSpacing: '2px',
                                    textTransform: 'uppercase',
                                }}>
                                    {keyword}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* ── DIVIDER LINE ── */}
                    <div style={{
                        width:        '96px',
                        height:       '2px',
                        background:   `linear-gradient(to right, transparent, ${brandAccent}, transparent)`,
                        marginBottom: '32px',
                        opacity:      reasonOp,
                    }} />

                    {/* ── REASON TEXT ── */}
                    <div style={{
                        opacity:      reasonOp,
                        textAlign:    'center',
                        marginBottom: brand_handle ? '36px' : 0,
                    }}>
                        <span style={{
                            fontFamily,
                            fontSize:      `${TYPE.caption.size}px`,
                            fontWeight:    500,
                            color:         'rgba(255,255,255,0.70)',
                            letterSpacing: '1px',
                        }}>
                            {displayReason}
                        </span>
                    </div>

                    {/* ── BRAND HANDLE ── */}
                    {brand_handle && (
                        <div style={{ opacity: handleOp, textAlign: 'center' }}>
                            <span style={{
                                fontFamily,
                                fontSize:      `${TYPE.caption.size * 0.82}px`,
                                fontWeight:    700,
                                color:         brandAccent,
                                letterSpacing: '3px',
                                opacity:       0.90,
                            }}>
                                {brand_handle}
                            </span>
                        </div>
                    )}

                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
