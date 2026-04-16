import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, spring, OffthreadVideo, staticFile, Img } from 'remotion';
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { SPRING, COLOR } from '../../foundation';
import { RichText } from '../../ui/RichText';

/**
 * MediaLowerThird — Full-screen media + lower-third text card
 *
 * Media (video/ảnh) chiếm toàn bộ màn hình làm nền.
 * Lower-third card: dark frosted glass overlay ở 35% dưới màn hình.
 * Card chứa: tag + headline + subtext/bullets.
 *
 * Dùng khi muốn media chiếm hết không gian — cinematic hơn MEDIA_TOP.
 * Archetype: MEDIA_LOWER_THIRD
 */

interface MediaLowerThirdProps {
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

export const MediaLowerThird: React.FC<MediaLowerThirdProps> = ({
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

    const hasBullets = bullets && bullets.length > 0;
    const hasSubtext = !!(subtext && subtext.trim().length > 0);

    // Lower-third card geometry
    // Starts at 62% of height, ends above safe bottom (400px from bottom)
    const CARD_TOP    = Math.round(height * 0.57);
    const CARD_BOTTOM = height - 420; // above karaoke zone
    const CARD_H      = CARD_BOTTOM - CARD_TOP;
    const PAD_H       = 72;
    const PAD_V       = 36;

    // ── Animations ──
    const mediaFade = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
    const cardSlide = spring({ frame: Math.max(0, frame - 8), fps, config: SPRING.normal });
    const tagFade   = spring({ frame: Math.max(0, frame - 4), fps, config: SPRING.snappy });
    const fadeIn    = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });

    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    };

    return (
        <AbsoluteFill style={{ background: '#080808' }}>

            {/* ════════════════════════════════
                MEDIA — Full screen background
            ════════════════════════════════ */}
            <AbsoluteFill style={{ opacity: mediaFade }}>
                {bg_video && (
                    <OffthreadVideo
                        src={bg_video.startsWith('http') ? bg_video : staticFile(bg_video)}
                        muted
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                    />
                )}
                {!bg_video && image_src && (
                    <Img
                        src={image_src}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                    />
                )}
            </AbsoluteFill>

            {/* ── Browser chrome overlay at top (khi là screenshot) ── */}
            {browser_chrome && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    background: 'rgba(36,37,41,0.95)',
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '14px 24px',
                    opacity: fadeIn,
                    zIndex: 6,
                }}>
                    {[['#ff5f57'], ['#febc2e'], ['#28c840']].map(([color], i) => (
                        <span key={i} style={{
                            width: 14, height: 14, borderRadius: '50%',
                            background: color, flexShrink: 0, display: 'block',
                        }} />
                    ))}
                    <div style={{
                        flex: 1, background: 'rgba(26,27,31,0.9)', borderRadius: 8,
                        padding: '7px 16px', fontSize: 20,
                        color: 'rgba(255,255,255,0.35)', fontFamily: primaryFont,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{url || tag || ''}</div>
                </div>
            )}

            {/* ── Gradient scrim — fade bottom of media into card ── */}
            <div style={{
                position: 'absolute',
                top: CARD_TOP - 180,
                left: 0, right: 0,
                height: 280,
                background: 'linear-gradient(to bottom, transparent, rgba(8,8,8,0.85) 60%, rgba(8,8,8,0.97) 100%)',
                pointerEvents: 'none',
            }} />

            {/* ════════════════════════════════
                LOWER-THIRD CARD
            ════════════════════════════════ */}
            <div style={{
                position: 'absolute',
                top: CARD_TOP,
                left: 0, right: 0,
                height: CARD_H,
                background: 'rgba(8,8,8,0.97)',
                opacity: interpolate(cardSlide, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(cardSlide, [0, 1], [40, 0])}px)`,
            }}>
                {/* Top accent line */}
                <div style={{
                    position: 'absolute', top: 0, left: PAD_H, right: PAD_H, height: 2,
                    background: `linear-gradient(to right, transparent, ${brandAccent} 20%, ${brandAccent} 80%, transparent)`,
                    boxShadow: `0 0 20px 4px ${hexToRgba(brandAccent, 0.5)}`,
                    opacity: fadeIn,
                }} />

                {/* Content */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    padding: `${PAD_V}px ${PAD_H}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: hasBullets ? 16 : 12,
                }}>
                    {/* Tag */}
                    {tag && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            opacity: interpolate(tagFade, [0, 1], [0, 1]),
                        }}>
                            <div style={{
                                width: 6, height: 28, borderRadius: 3,
                                background: brandAccent,
                                boxShadow: `0 0 12px ${hexToRgba(brandAccent, 0.7)}`,
                            }} />
                            <span style={{
                                fontFamily: primaryFont, fontSize: 24, fontWeight: 700,
                                letterSpacing: 3, color: brandAccent,
                            }}>{tag}</span>
                        </div>
                    )}

                    {/* Headline */}
                    <div style={{
                        fontFamily: accentFont,
                        fontSize: hasBullets ? 68 : hasSubtext ? 72 : 84,
                        fontWeight: 800, color: 'white', lineHeight: 1.1,
                    }}>
                        <RichText text={headline} brandAccent={brandAccent} themeType="headline" staggerDelay={3} />
                    </div>

                    {/* Subtext */}
                    {hasSubtext && (
                        <div style={{
                            fontSize: 36, fontFamily: primaryFont,
                            color: 'rgba(255,255,255,0.70)', lineHeight: 1.35, fontWeight: 400,
                        }}>{subtext}</div>
                    )}

                    {/* Bullets */}
                    {hasBullets && bullets.map((bullet, i) => {
                        const delay = 12 + i * 7;
                        const bPop = spring({ frame: Math.max(0, frame - delay), fps, config: SPRING.normal });
                        return (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'flex-start', gap: 16,
                                opacity: bPop,
                                transform: `translateX(${interpolate(bPop, [0, 1], [-20, 0])}px)`,
                            }}>
                                <div style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: brandAccent, flexShrink: 0, marginTop: 13,
                                    boxShadow: `0 0 8px ${brandAccent}`,
                                }} />
                                <span style={{
                                    fontSize: 36, fontFamily: primaryFont,
                                    color: 'rgba(255,255,255,0.88)', lineHeight: 1.3, fontWeight: 500,
                                }}>{bullet}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom ambient glow */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
                    background: `radial-gradient(ellipse at 30% 100%, ${hexToRgba(brandAccent, 0.08)} 0%, transparent 70%)`,
                    pointerEvents: 'none',
                }} />
            </div>
        </AbsoluteFill>
    );
};
