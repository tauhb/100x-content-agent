import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, spring, OffthreadVideo, staticFile, Img } from 'remotion';
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { SPRING, COLOR } from '../../foundation';
import { RichText } from '../../ui/RichText';

/**
 * MediaBottom — Layout 3 vùng dọc: Tiêu đề | Nội dung | Media
 *
 * Vùng trên (~22%): Tag + Headline
 * Vùng giữa (~22%): Subtext + bullets
 * Vùng dưới (~56%): Media card lớn (chiếm phần lớn màn hình)
 *
 * Archetype: MEDIA_BOTTOM
 */

interface MediaBottomProps {
    bg_video?: string;
    image_src?: string;
    headline: string;
    subtext?: string;
    bullets?: string[];
    tag?: string;
    brandAccent?: string;
    browser_chrome?: boolean;
    url?: string;
}

export const MediaBottom: React.FC<MediaBottomProps> = ({
    bg_video,
    image_src,
    headline = '',
    subtext = '',
    bullets = [],
    tag = '',
    brandAccent = COLOR.accentDefault,
    browser_chrome = false,
    url = '',
}) => {
    const frame = useCurrentFrame();
    const { fps, height, width } = useVideoConfig();
    const { fontFamily: primaryFont } = loadInter();
    const { fontFamily: accentFont } = loadPlayfair();

    // ── Layout zones ──
    const SAFE_TOP    = 100;
    const SAFE_BOTTOM = 400;
    const PAD_H       = 72;
    const BORDER_W    = 2;
    const CORNER_R    = 24;
    const USABLE_H    = height - SAFE_TOP - SAFE_BOTTOM; // 1420px

    const hasBullets = bullets && bullets.length > 0;
    const hasSubtext = !!(subtext && subtext.trim().length > 0);
    const hasContent = hasBullets || hasSubtext;

    const HEADER_H  = hasContent ? Math.round(USABLE_H * 0.22) : Math.round(USABLE_H * 0.28);
    const CONTENT_H = hasContent ? Math.round(USABLE_H * 0.20) : 0;
    const GAP       = 16;
    const CARD_H    = USABLE_H - HEADER_H - CONTENT_H - GAP * 2;

    const HEADER_TOP  = SAFE_TOP;
    const CONTENT_TOP = HEADER_TOP + HEADER_H + GAP;
    const CARD_TOP    = CONTENT_TOP + CONTENT_H + GAP;

    const cardW = width - PAD_H * 2;

    // ── Animations ──
    const headerIn = spring({ frame, fps, config: SPRING.snappy });
    const contentIn = spring({ frame: Math.max(0, frame - 6), fps, config: SPRING.normal });
    const cardPop   = spring({ frame: Math.max(0, frame - 10), fps, config: SPRING.gentle });
    const fadeIn    = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
    const scanY     = interpolate(frame, [0, 40], [-CARD_H * 0.1, CARD_H * 1.1], { extrapolateRight: 'clamp' });

    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    };

    return (
        <AbsoluteFill style={{ background: '#080808' }}>

            {/* ════════════════════════════════
                VÙNG TRÊN — Tag + Headline
            ════════════════════════════════ */}
            <div style={{
                position: 'absolute',
                top: HEADER_TOP,
                left: PAD_H, right: PAD_H,
                height: HEADER_H,
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', gap: 10,
                opacity: headerIn,
                transform: `translateY(${interpolate(headerIn, [0, 1], [-20, 0])}px)`,
            }}>
                {tag && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 28, height: 2, background: `${brandAccent}88`, borderRadius: 1 }} />
                        <span style={{
                            fontFamily: primaryFont, fontSize: 26, fontWeight: 700,
                            letterSpacing: 3, color: `${brandAccent}cc`,
                        }}>{tag}</span>
                        <div style={{ width: 28, height: 2, background: `${brandAccent}88`, borderRadius: 1 }} />
                    </div>
                )}
                <div style={{
                    fontFamily: accentFont,
                    fontSize: hasContent ? 80 : 96,
                    fontWeight: 800, color: 'white', lineHeight: 1.1,
                }}>
                    <RichText text={headline} brandAccent={brandAccent} themeType="headline" staggerDelay={3} />
                </div>
            </div>

            {/* ════════════════════════════════
                VÙNG GIỮA — Subtext + Bullets
            ════════════════════════════════ */}
            {hasContent && (
                <>
                    {/* Accent divider */}
                    <div style={{
                        position: 'absolute',
                        top: CONTENT_TOP - 6,
                        left: PAD_H, right: PAD_H, height: 2,
                        background: `linear-gradient(to right, ${brandAccent} 0%, ${brandAccent} 40%, transparent)`,
                        boxShadow: `0 0 12px 2px ${hexToRgba(brandAccent, 0.4)}`,
                        opacity: fadeIn,
                    }} />

                    <div style={{
                        position: 'absolute',
                        top: CONTENT_TOP,
                        left: PAD_H, right: PAD_H,
                        height: CONTENT_H,
                        display: 'flex', flexDirection: 'column',
                        justifyContent: 'center', gap: 14,
                        opacity: contentIn,
                        transform: `translateX(${interpolate(contentIn, [0, 1], [-20, 0])}px)`,
                    }}>
                        {hasSubtext && (
                            <div style={{
                                fontSize: 38, fontFamily: primaryFont,
                                color: 'rgba(255,255,255,0.75)', lineHeight: 1.35, fontWeight: 400,
                            }}>{subtext}</div>
                        )}
                        {hasBullets && bullets.map((bullet, i) => {
                            const delay = 8 + i * 7;
                            const bPop = spring({ frame: Math.max(0, frame - delay), fps, config: SPRING.normal });
                            return (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 16,
                                    opacity: bPop,
                                    transform: `translateX(${interpolate(bPop, [0, 1], [-20, 0])}px)`,
                                }}>
                                    <div style={{
                                        width: 10, height: 10, borderRadius: '50%',
                                        background: brandAccent, flexShrink: 0, marginTop: 12,
                                        boxShadow: `0 0 10px ${brandAccent}`,
                                    }} />
                                    <span style={{
                                        fontSize: 38, fontFamily: primaryFont,
                                        color: 'rgba(255,255,255,0.90)', lineHeight: 1.3, fontWeight: 500,
                                    }}>{bullet}</span>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* ════════════════════════════════
                VÙNG DƯỚI — Media Card
            ════════════════════════════════ */}
            <div style={{
                position: 'absolute',
                top: CARD_TOP,
                left: PAD_H,
                width: cardW,
                height: CARD_H,
                opacity: cardPop,
                transform: `scale(${interpolate(cardPop, [0, 1], [0.93, 1])})`,
            }}>
                {/* Outer glow */}
                <div style={{
                    position: 'absolute', inset: -8, borderRadius: CORNER_R + 8,
                    boxShadow: `0 0 40px 8px ${hexToRgba(brandAccent, 0.22)}, 0 0 80px 20px ${hexToRgba(brandAccent, 0.08)}`,
                    pointerEvents: 'none',
                }} />

                {/* Card frame */}
                <div style={{
                    position: 'absolute', inset: 0, borderRadius: CORNER_R,
                    border: `${BORDER_W}px solid ${hexToRgba(brandAccent, 0.65)}`,
                    boxShadow: `inset 0 0 0 1px ${hexToRgba(brandAccent, 0.12)}, 0 8px 40px rgba(0,0,0,0.7)`,
                    pointerEvents: 'none', zIndex: 5,
                }} />

                {/* Media interior */}
                <div style={{
                    position: 'absolute', inset: BORDER_W,
                    borderRadius: CORNER_R - BORDER_W,
                    overflow: 'hidden',
                    display: 'flex', flexDirection: 'column',
                }}>
                    {/* Browser chrome */}
                    {browser_chrome && (
                        <div style={{
                            flexShrink: 0, background: '#242529',
                            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px',
                        }}>
                            {[['#ff5f57'], ['#febc2e'], ['#28c840']].map(([color], i) => (
                                <span key={i} style={{
                                    width: 14, height: 14, borderRadius: '50%',
                                    background: color, flexShrink: 0, display: 'block',
                                }} />
                            ))}
                            <div style={{
                                flex: 1, background: '#1a1b1f', borderRadius: 8,
                                padding: '7px 16px', fontSize: 20,
                                color: 'rgba(255,255,255,0.35)', fontFamily: primaryFont,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>{url || tag || ''}</div>
                        </div>
                    )}

                    {/* Media area */}
                    <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
                        {bg_video && (
                            <OffthreadVideo
                                src={bg_video.startsWith('http') ? bg_video : staticFile(bg_video)}
                                muted
                                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                            />
                        )}
                        {!bg_video && image_src && (
                            <Img
                                src={image_src}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                            />
                        )}
                        {/* Vignette */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.35) 100%)',
                            pointerEvents: 'none',
                        }} />
                        {/* Scanline */}
                        <div style={{
                            position: 'absolute', left: 0, right: 0, top: scanY, height: CARD_H * 0.15,
                            background: `linear-gradient(to bottom, transparent, ${hexToRgba(brandAccent, 0.10)}, transparent)`,
                            opacity: interpolate(frame, [0, 30, 40], [0, 1, 0], { extrapolateRight: 'clamp' }),
                            pointerEvents: 'none',
                        }} />
                    </div>
                </div>

                {/* Corner accents */}
                {[
                    { top: -2, left: -2, borderTop: `3px solid ${brandAccent}`, borderLeft: `3px solid ${brandAccent}`, borderRadius: `${CORNER_R}px 0 0 0` },
                    { top: -2, right: -2, borderTop: `3px solid ${brandAccent}`, borderRight: `3px solid ${brandAccent}`, borderRadius: `0 ${CORNER_R}px 0 0` },
                    { bottom: -2, left: -2, borderBottom: `3px solid ${brandAccent}`, borderLeft: `3px solid ${brandAccent}`, borderRadius: `0 0 0 ${CORNER_R}px` },
                    { bottom: -2, right: -2, borderBottom: `3px solid ${brandAccent}`, borderRight: `3px solid ${brandAccent}`, borderRadius: `0 0 ${CORNER_R}px 0` },
                ].map((style, i) => (
                    <div key={i} style={{ position: 'absolute', width: 28, height: 28, opacity: fadeIn, zIndex: 6, ...style }} />
                ))}
            </div>
        </AbsoluteFill>
    );
};
