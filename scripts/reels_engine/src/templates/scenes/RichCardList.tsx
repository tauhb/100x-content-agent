import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, spring } from 'remotion';
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { RichText } from '../components/RichText';

/**
 * RichCardList — Layout danh sách card chuyên nghiệp
 *
 * Hỗ trợ 4 style:
 *   "numbered" — số thứ tự to + card có gradient border
 *   "icon"     — emoji icon badge + card glassmorphism
 *   "glass"    — card kính blur full, không số/icon rời
 *   "grid"     — 2x2 grid với icon + title + text
 *
 * Archetype: ARCH_CARDS
 */

export interface CardItem {
    icon?: string;   // emoji, vd: "⚡", "🎯", "💡"
    title?: string;
    text: string;
}

interface RichCardListProps {
    style?: 'numbered' | 'icon' | 'glass' | 'grid';
    headline?: string;
    items: CardItem[];
    brandAccent?: string;
}

// Hex → rgba helper
const rgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
};

// ─────────────────────────────────────────
// STYLE 1: NUMBERED — card ngang, số to góc trái
// ─────────────────────────────────────────
const NumberedCards: React.FC<{ items: CardItem[]; brandAccent: string; frame: number; fps: number; primaryFont: string; accentFont: string }> = ({
    items, brandAccent, frame, fps, primaryFont, accentFont
}) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', width: '100%' }}>
        {items.map((item, i) => {
            const delay = i * 14;
            const pop = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 15, stiffness: 130 } });

            return (
                <div key={i} style={{
                    display: 'flex',
                    alignItems: 'stretch',
                    gap: '0',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    opacity: pop,
                    transform: `translateX(${interpolate(pop, [0, 1], [-60, 0])}px)`,
                    // Gradient border via outline + background trick
                    background: `linear-gradient(135deg, ${rgba(brandAccent, 0.12)}, rgba(255,255,255,0.04))`,
                    border: `1.5px solid ${rgba(brandAccent, 0.35)}`,
                    boxShadow: `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 ${rgba(brandAccent, 0.1)}`,
                }}>
                    {/* Number badge */}
                    <div style={{
                        minWidth: '80px',
                        background: `linear-gradient(180deg, ${brandAccent}, ${rgba(brandAccent, 0.6)})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <span style={{
                            fontSize: '40px',
                            fontWeight: '900',
                            fontFamily: accentFont,
                            color: '#000',
                            lineHeight: 1,
                        }}>
                            {String(i + 1).padStart(2, '0')}
                        </span>
                    </div>

                    {/* Content */}
                    <div style={{
                        padding: '28px 36px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '8px',
                        flex: 1,
                    }}>
                        {item.title && (
                            <div style={{
                                fontSize: '32px',
                                fontWeight: '700',
                                fontFamily: accentFont,
                                color: brandAccent,
                                letterSpacing: '0.5px',
                            }}>
                                {item.title}
                            </div>
                        )}
                        <div style={{
                            fontSize: item.title ? '28px' : '34px',
                            fontFamily: primaryFont,
                            color: 'rgba(255,255,255,0.85)',
                            lineHeight: 1.4,
                            fontWeight: '400',
                        }}>
                            <RichText text={item.text} brandAccent={brandAccent} themeType="body" staggerDelay={2} />
                        </div>
                    </div>
                </div>
            );
        })}
    </div>
);

// ─────────────────────────────────────────
// STYLE 2: ICON — emoji badge nổi + card kính
// ─────────────────────────────────────────
const IconCards: React.FC<{ items: CardItem[]; brandAccent: string; frame: number; fps: number; primaryFont: string; accentFont: string }> = ({
    items, brandAccent, frame, fps, primaryFont, accentFont
}) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', width: '100%' }}>
        {items.map((item, i) => {
            const delay = i * 12;
            const pop = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 14, stiffness: 140 } });
            const iconPop = spring({ frame: Math.max(0, frame - delay - 4), fps, config: { damping: 10, stiffness: 220 } });

            return (
                <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '28px',
                    padding: '24px 36px',
                    borderRadius: '22px',
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    border: `1.5px solid rgba(255,255,255,0.1)`,
                    borderTop: `1.5px solid ${rgba(brandAccent, 0.4)}`,
                    boxShadow: `0 8px 32px rgba(0,0,0,0.35), 0 1px 0 ${rgba(brandAccent, 0.15)} inset`,
                    opacity: pop,
                    transform: `translateY(${interpolate(pop, [0, 1], [30, 0])}px)`,
                }}>
                    {/* Icon badge */}
                    {item.icon && (
                        <div style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: '18px',
                            background: `linear-gradient(135deg, ${rgba(brandAccent, 0.25)}, ${rgba(brandAccent, 0.08)})`,
                            border: `1.5px solid ${rgba(brandAccent, 0.5)}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '36px',
                            flexShrink: 0,
                            transform: `scale(${iconPop})`,
                            boxShadow: `0 0 20px ${rgba(brandAccent, 0.3)}`,
                        }}>
                            {item.icon}
                        </div>
                    )}

                    {/* Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                        {item.title && (
                            <div style={{
                                fontSize: '30px',
                                fontWeight: '700',
                                fontFamily: accentFont,
                                color: 'white',
                            }}>
                                {item.title}
                            </div>
                        )}
                        <div style={{
                            fontSize: item.title ? '26px' : '32px',
                            fontFamily: primaryFont,
                            color: 'rgba(255,255,255,0.7)',
                            lineHeight: 1.35,
                        }}>
                            <RichText text={item.text} brandAccent={brandAccent} themeType="body" staggerDelay={2} />
                        </div>
                    </div>

                    {/* Right arrow indicator */}
                    <div style={{
                        color: rgba(brandAccent, 0.6),
                        fontSize: '28px',
                        flexShrink: 0,
                        opacity: pop,
                    }}>›</div>
                </div>
            );
        })}
    </div>
);

// ─────────────────────────────────────────
// STYLE 3: GLASS — card kính đầy, viền gradient
// ─────────────────────────────────────────
const GlassCards: React.FC<{ items: CardItem[]; brandAccent: string; frame: number; fps: number; primaryFont: string; accentFont: string }> = ({
    items, brandAccent, frame, fps, primaryFont, accentFont
}) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        {items.map((item, i) => {
            const delay = i * 14;
            const pop = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 16, stiffness: 120 } });

            // Alternating accent: odd items get more glow
            const isAccented = i % 2 === 0;

            return (
                <div key={i} style={{
                    padding: '32px 40px',
                    borderRadius: '24px',
                    background: isAccented
                        ? `linear-gradient(135deg, ${rgba(brandAccent, 0.14)}, rgba(255,255,255,0.03))`
                        : 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(30px)',
                    border: `1.5px solid ${isAccented ? rgba(brandAccent, 0.45) : 'rgba(255,255,255,0.1)'}`,
                    boxShadow: isAccented
                        ? `0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px ${rgba(brandAccent, 0.08)}, inset 0 1px 0 ${rgba(brandAccent, 0.2)}`
                        : '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
                    opacity: pop,
                    transform: `scale(${interpolate(pop, [0, 1], [0.95, 1])})`,
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Top shimmer line */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '20%',
                        right: '20%',
                        height: '1px',
                        background: `linear-gradient(to right, transparent, ${rgba(brandAccent, isAccented ? 0.8 : 0.3)}, transparent)`,
                    }} />

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                        {/* Icon hoặc accent dot */}
                        <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: isAccented ? brandAccent : rgba(brandAccent, 0.5),
                            flexShrink: 0,
                            marginTop: '14px',
                            boxShadow: isAccented ? `0 0 12px ${brandAccent}` : 'none',
                        }} />

                        <div style={{ flex: 1 }}>
                            {item.icon && (
                                <span style={{ fontSize: '36px', marginRight: '12px' }}>{item.icon}</span>
                            )}
                            {item.title && (
                                <div style={{
                                    fontSize: '32px',
                                    fontWeight: '700',
                                    fontFamily: accentFont,
                                    color: isAccented ? brandAccent : 'white',
                                    marginBottom: '8px',
                                }}>
                                    {item.title}
                                </div>
                            )}
                            <div style={{
                                fontSize: '30px',
                                fontFamily: primaryFont,
                                color: 'rgba(255,255,255,0.8)',
                                lineHeight: 1.4,
                            }}>
                                <RichText text={item.text} brandAccent={brandAccent} themeType="body" staggerDelay={2} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        })}
    </div>
);

// ─────────────────────────────────────────
// STYLE 4: GRID — 2×2 (hoặc 2×N), mỗi ô có icon lớn
// ─────────────────────────────────────────
const GridCards: React.FC<{ items: CardItem[]; brandAccent: string; frame: number; fps: number; primaryFont: string; accentFont: string }> = ({
    items, brandAccent, frame, fps, primaryFont, accentFont
}) => {
    const limited = items.slice(0, 4); // Max 4 items cho 2×2

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            width: '100%',
        }}>
            {limited.map((item, i) => {
                const delay = i * 12;
                const pop = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 14, stiffness: 150 } });

                return (
                    <div key={i} style={{
                        padding: '36px 28px',
                        borderRadius: '24px',
                        background: `linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`,
                        border: `1.5px solid rgba(255,255,255,0.08)`,
                        borderTop: `2px solid ${rgba(brandAccent, 0.5)}`,
                        boxShadow: `0 8px 30px rgba(0,0,0,0.4), inset 0 1px 0 ${rgba(brandAccent, 0.1)}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '14px',
                        opacity: pop,
                        transform: `scale(${interpolate(pop, [0, 1], [0.88, 1])})`,
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        {/* BG number watermark */}
                        <div style={{
                            position: 'absolute',
                            bottom: '-20px',
                            right: '16px',
                            fontSize: '120px',
                            fontWeight: '900',
                            fontFamily: accentFont,
                            color: rgba(brandAccent, 0.06),
                            lineHeight: 1,
                            userSelect: 'none',
                        }}>
                            {i + 1}
                        </div>

                        {/* Icon */}
                        {item.icon && (
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '14px',
                                background: rgba(brandAccent, 0.15),
                                border: `1px solid ${rgba(brandAccent, 0.4)}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '28px',
                            }}>
                                {item.icon}
                            </div>
                        )}

                        {/* Title */}
                        {item.title && (
                            <div style={{
                                fontSize: '28px',
                                fontWeight: '700',
                                fontFamily: accentFont,
                                color: 'white',
                                lineHeight: 1.2,
                            }}>
                                {item.title}
                            </div>
                        )}

                        {/* Text */}
                        <div style={{
                            fontSize: '24px',
                            fontFamily: primaryFont,
                            color: 'rgba(255,255,255,0.65)',
                            lineHeight: 1.4,
                        }}>
                            <RichText text={item.text} brandAccent={brandAccent} themeType="body" staggerDelay={2} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ─────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────
export const RichCardList: React.FC<RichCardListProps> = ({
    style = 'icon',
    headline = '',
    items = [],
    brandAccent = '#B6FF00',
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: primaryFont } = loadInter();
    const { fontFamily: accentFont } = loadPlayfair();

    const headlinePop = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });

    const isGrid = style === 'grid';

    return (
        <AbsoluteFill style={{
            justifyContent: 'center',
            alignItems: 'center',
            padding: isGrid ? '60px 50px' : '50px 50px',
            flexDirection: 'column',
            gap: '32px',
        }}>
            {/* Headline */}
            {headline && (
                <div style={{
                    width: '100%',
                    opacity: headlinePop,
                    transform: `translateY(${interpolate(headlinePop, [0, 1], [-20, 0])}px)`,
                }}>
                    {/* Accent line trước headline */}
                    <div style={{
                        width: '48px',
                        height: '4px',
                        borderRadius: '2px',
                        background: brandAccent,
                        marginBottom: '16px',
                        boxShadow: `0 0 12px ${brandAccent}88`,
                    }} />
                    <div style={{
                        fontSize: isGrid ? '46px' : '52px',
                        fontFamily: accentFont,
                        fontWeight: '800',
                        color: 'white',
                        lineHeight: 1.15,
                    }}>
                        <RichText text={headline} brandAccent={brandAccent} themeType="headline" staggerDelay={4} />
                    </div>
                </div>
            )}

            {/* Cards */}
            <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center' }}>
                {style === 'numbered' && (
                    <NumberedCards items={items} brandAccent={brandAccent} frame={frame} fps={fps} primaryFont={primaryFont} accentFont={accentFont} />
                )}
                {style === 'icon' && (
                    <IconCards items={items} brandAccent={brandAccent} frame={frame} fps={fps} primaryFont={primaryFont} accentFont={accentFont} />
                )}
                {style === 'glass' && (
                    <GlassCards items={items} brandAccent={brandAccent} frame={frame} fps={fps} primaryFont={primaryFont} accentFont={accentFont} />
                )}
                {style === 'grid' && (
                    <GridCards items={items} brandAccent={brandAccent} frame={frame} fps={fps} primaryFont={primaryFont} accentFont={accentFont} />
                )}
            </div>
        </AbsoluteFill>
    );
};
