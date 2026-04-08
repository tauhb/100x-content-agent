import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, spring, OffthreadVideo, staticFile, Img } from 'remotion';
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { RichText } from '../components/RichText';

/**
 * MediaCaption — Layout chia đôi màn hình
 *
 * Nửa trên: Video/Ảnh bọc trong card có viền neon, padding, bo góc, glow shadow
 * Nửa dưới: Tiêu đề + subtext + bullets trên nền tối
 *
 * Archetype: MEDIA_TOP
 */

interface MediaCaptionProps {
    bg_video?: string;
    image_src?: string;
    /** Tỷ lệ vùng nửa trên (0.0–1.0), mặc định 0.52 */
    split_ratio?: number;
    headline: string;
    subtext?: string;
    bullets?: string[];
    /** Badge label góc card, vd: "ChatGPT", "Canva" */
    tag?: string;
    brandAccent?: string;
}

export const MediaCaption: React.FC<MediaCaptionProps> = ({
    bg_video,
    image_src,
    split_ratio = 0.52,
    headline = '',
    subtext = '',
    bullets = [],
    tag = '',
    brandAccent = '#B6FF00',
}) => {
    const frame = useCurrentFrame();
    const { fps, height, width } = useVideoConfig();
    const { fontFamily: primaryFont } = loadInter();
    const { fontFamily: accentFont } = loadPlayfair();

    // ── Kích thước layout ──
    const CARD_PAD_H = 48;         // padding trái/phải của card so với viền video
    const CARD_PAD_TOP = 60;       // padding card so với mép trên
    const CARD_PAD_BOTTOM = 28;    // padding card so với đường phân chia
    const BORDER_W = 2;
    const CORNER_R = 24;

    const zoneH = height * split_ratio;          // chiều cao vùng trên (nơi đặt card)
    const cardH = zoneH - CARD_PAD_TOP - CARD_PAD_BOTTOM;
    const cardW = width - CARD_PAD_H * 2;
    const captionH = height * (1 - split_ratio);

    // ── Animations ──
    const cardPop  = spring({ frame, fps, config: { damping: 16, stiffness: 130 } });
    const slideUp  = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 14, stiffness: 110 } });
    const fadeIn   = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });

    // Scan-line hiệu ứng (đường sáng quét từ trên xuống trong card)
    const scanY = interpolate(frame, [0, 40], [-cardH * 0.1, cardH * 1.1], { extrapolateRight: 'clamp' });

    const hasBullets = bullets && bullets.length > 0;

    // Hex → rgba helper
    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    };

    return (
        <AbsoluteFill style={{ background: '#080808' }}>

            {/* ════════════════════════════════
                VÙNG TRÊN — Media Card
            ════════════════════════════════ */}
            <div style={{
                position: 'absolute',
                top: CARD_PAD_TOP,
                left: CARD_PAD_H,
                width: cardW,
                height: cardH,
                opacity: cardPop,
                transform: `scale(${interpolate(cardPop, [0, 1], [0.92, 1])})`,
            }}>
                {/* ── Outer glow (hào quang bên ngoài card) ── */}
                <div style={{
                    position: 'absolute',
                    inset: -8,
                    borderRadius: CORNER_R + 8,
                    background: 'transparent',
                    boxShadow: `0 0 40px 8px ${hexToRgba(brandAccent, 0.25)}, 0 0 80px 20px ${hexToRgba(brandAccent, 0.10)}`,
                    pointerEvents: 'none',
                }} />

                {/* ── Card frame (viền + bo góc) ── */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: CORNER_R,
                    border: `${BORDER_W}px solid ${hexToRgba(brandAccent, 0.7)}`,
                    // Hai góc trên sáng hơn, hai góc dưới mờ hơn
                    boxShadow: `inset 0 0 0 1px ${hexToRgba(brandAccent, 0.15)}, 0 8px 40px rgba(0,0,0,0.7)`,
                    pointerEvents: 'none',
                    zIndex: 5,
                }} />

                {/* ── Media bên trong card (clip theo bo góc) ── */}
                <div style={{
                    position: 'absolute',
                    inset: BORDER_W,
                    borderRadius: CORNER_R - BORDER_W,
                    overflow: 'hidden',
                }}>
                    {bg_video && (
                        <OffthreadVideo
                            src={bg_video.startsWith('http') ? bg_video : staticFile(bg_video)}
                            muted
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    )}
                    {!bg_video && image_src && (
                        <Img
                            src={image_src}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    )}

                    {/* Vignette nhẹ bên trong để media không cứng ở mép */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)',
                        pointerEvents: 'none',
                    }} />

                    {/* Scan-line hiệu ứng — thanh sáng quét 1 lần khi card xuất hiện */}
                    <div style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: scanY,
                        height: cardH * 0.15,
                        background: `linear-gradient(to bottom, transparent, ${hexToRgba(brandAccent, 0.12)}, transparent)`,
                        opacity: interpolate(frame, [0, 30, 40], [0, 1, 0], { extrapolateRight: 'clamp' }),
                        pointerEvents: 'none',
                    }} />
                </div>

                {/* ── Tag badge — đè lên góc trên trái card ── */}
                {tag && (
                    <div style={{
                        position: 'absolute',
                        top: -1,
                        left: 32,
                        background: brandAccent,
                        color: '#000',
                        fontSize: '20px',
                        fontWeight: '800',
                        fontFamily: primaryFont,
                        padding: '6px 22px',
                        borderRadius: `0 0 ${CORNER_R / 2}px ${CORNER_R / 2}px`,
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        opacity: fadeIn,
                        zIndex: 10,
                        boxShadow: `0 4px 16px ${hexToRgba(brandAccent, 0.5)}`,
                    }}>
                        {tag}
                    </div>
                )}

                {/* ── Corner accents — 4 góc sáng kiểu UI tech ── */}
                {[
                    { top: -2, left: -2, borderTop: `3px solid ${brandAccent}`, borderLeft: `3px solid ${brandAccent}`, borderRadius: `${CORNER_R}px 0 0 0` },
                    { top: -2, right: -2, borderTop: `3px solid ${brandAccent}`, borderRight: `3px solid ${brandAccent}`, borderRadius: `0 ${CORNER_R}px 0 0` },
                    { bottom: -2, left: -2, borderBottom: `3px solid ${brandAccent}`, borderLeft: `3px solid ${brandAccent}`, borderRadius: `0 0 0 ${CORNER_R}px` },
                    { bottom: -2, right: -2, borderBottom: `3px solid ${brandAccent}`, borderRight: `3px solid ${brandAccent}`, borderRadius: `0 0 ${CORNER_R}px 0` },
                ].map((style, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        width: 28,
                        height: 28,
                        opacity: fadeIn,
                        zIndex: 6,
                        ...style,
                    }} />
                ))}
            </div>

            {/* ════════════════════════════════
                ĐƯỜNG PHÂN CÁCH — Accent line
            ════════════════════════════════ */}
            <div style={{
                position: 'absolute',
                top: zoneH,
                left: CARD_PAD_H,
                right: CARD_PAD_H,
                height: '2px',
                background: `linear-gradient(to right, transparent, ${brandAccent} 30%, ${brandAccent} 70%, transparent)`,
                boxShadow: `0 0 16px 3px ${hexToRgba(brandAccent, 0.5)}`,
                opacity: fadeIn,
                zIndex: 10,
            }} />

            {/* ════════════════════════════════
                VÙNG DƯỚI — Nội dung
            ════════════════════════════════ */}
            <div style={{
                position: 'absolute',
                top: zoneH + 2,
                left: 0,
                right: 0,
                height: captionH,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: `32px ${CARD_PAD_H}px`,
                gap: hasBullets ? '18px' : '14px',
                transform: `translateY(${interpolate(slideUp, [0, 1], [36, 0])}px)`,
                opacity: slideUp,
            }}>
                {/* Headline */}
                <div style={{
                    fontSize: hasBullets ? '46px' : '56px',
                    fontFamily: accentFont,
                    fontWeight: '800',
                    color: 'white',
                    lineHeight: 1.2,
                }}>
                    <RichText text={headline} brandAccent={brandAccent} themeType="headline" staggerDelay={3} />
                </div>

                {/* Subtext */}
                {subtext && !hasBullets && (
                    <div style={{
                        fontSize: '32px',
                        fontFamily: primaryFont,
                        color: 'rgba(255,255,255,0.6)',
                        lineHeight: 1.4,
                    }}>
                        {subtext}
                    </div>
                )}

                {/* Bullets */}
                {hasBullets && bullets.map((bullet, i) => {
                    const delay = 10 + i * 10;
                    const bPop = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 14, stiffness: 140 } });
                    return (
                        <div key={i} style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '16px',
                            opacity: bPop,
                            transform: `translateX(${interpolate(bPop, [0, 1], [-24, 0])}px)`,
                        }}>
                            {/* Bullet dot */}
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: brandAccent,
                                flexShrink: 0,
                                marginTop: '13px',
                                boxShadow: `0 0 8px ${brandAccent}`,
                            }} />
                            <span style={{
                                fontSize: '32px',
                                fontFamily: primaryFont,
                                color: 'rgba(255,255,255,0.85)',
                                lineHeight: 1.3,
                                fontWeight: '500',
                            }}>
                                {bullet}
                            </span>
                        </div>
                    );
                })}
            </div>
        </AbsoluteFill>
    );
};
