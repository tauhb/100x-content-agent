import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { RichText } from '../../components/RichText';

const rgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
};

export const SingleListCascade: React.FC<{ content: any }> = ({ content }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: primaryFont } = loadInter();
    const { fontFamily: accentFont } = loadPlayfair();

    const brandAccent = content.brand_accent || '#B6FF00';
    const items: string[] = content.bullets || content.list || [];

    const headlinePop = spring({ frame, fps, config: { damping: 14, stiffness: 110 } });

    return (
        <AbsoluteFill style={{
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '60px 56px',
            flexDirection: 'column',
            gap: '28px',
        }}>
            {/* Headline */}
            {content.headline && (
                <div style={{
                    width: '100%',
                    opacity: headlinePop,
                    transform: `translateY(${interpolate(headlinePop, [0, 1], [-18, 0])}px)`,
                }}>
                    {/* Accent bar */}
                    <div style={{
                        width: '44px',
                        height: '4px',
                        borderRadius: '2px',
                        background: brandAccent,
                        marginBottom: '14px',
                        boxShadow: `0 0 12px ${brandAccent}`,
                    }} />
                    <h2 style={{
                        fontSize: 54,
                        fontFamily: accentFont,
                        fontWeight: '800',
                        color: '#FFFFFF',
                        margin: 0,
                        lineHeight: 1.15,
                    }}>
                        <RichText text={content.headline} staggerDelay={3} brandAccent={brandAccent} themeType="headline" />
                    </h2>
                </div>
            )}

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
                {items.map((item: string, idx: number) => {
                    const delay = idx * 14;
                    const itemPop = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 14, stiffness: 130 } });

                    // Spotlight: item hiện tại sáng, items trước mờ dần
                    let opacity = itemPop;
                    const SPOTLIGHT_DELAY = 60;
                    if (frame > delay + SPOTLIGHT_DELAY) {
                        opacity = interpolate(
                            frame,
                            [delay + SPOTLIGHT_DELAY, delay + SPOTLIGHT_DELAY + 20],
                            [1, 0.38],
                            { extrapolateRight: 'clamp' }
                        );
                    }

                    const isActive = frame >= delay && frame <= delay + SPOTLIGHT_DELAY + 20;

                    return (
                        <div key={idx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0',
                            borderRadius: '18px',
                            overflow: 'hidden',
                            opacity,
                            transform: `translateX(${interpolate(itemPop, [0, 1], [-50, 0])}px)`,
                            background: isActive
                                ? `linear-gradient(135deg, ${rgba(brandAccent, 0.13)}, rgba(255,255,255,0.03))`
                                : 'rgba(255,255,255,0.04)',
                            border: `1.5px solid ${isActive ? rgba(brandAccent, 0.4) : 'rgba(255,255,255,0.08)'}`,
                            boxShadow: isActive
                                ? `0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 ${rgba(brandAccent, 0.15)}`
                                : '0 2px 10px rgba(0,0,0,0.2)',
                        }}>
                            {/* Accent left bar */}
                            <div style={{
                                width: '5px',
                                alignSelf: 'stretch',
                                background: isActive
                                    ? `linear-gradient(to bottom, ${brandAccent}, ${rgba(brandAccent, 0.5)})`
                                    : rgba(brandAccent, 0.2),
                                flexShrink: 0,
                            }} />

                            {/* Number badge */}
                            <div style={{
                                width: '52px',
                                height: '52px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                margin: '0 4px 0 16px',
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: isActive ? brandAccent : rgba(brandAccent, 0.15),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: isActive ? `0 0 14px ${rgba(brandAccent, 0.7)}` : 'none',
                                }}>
                                    <span style={{
                                        fontSize: '20px',
                                        fontWeight: '800',
                                        fontFamily: accentFont,
                                        color: isActive ? '#000' : rgba(brandAccent, 0.8),
                                        lineHeight: 1,
                                    }}>
                                        {idx + 1}
                                    </span>
                                </div>
                            </div>

                            {/* Text */}
                            <div style={{
                                padding: '22px 24px 22px 8px',
                                fontSize: 34,
                                fontFamily: primaryFont,
                                color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
                                lineHeight: 1.35,
                                fontWeight: isActive ? '500' : '400',
                                flex: 1,
                            }}>
                                <RichText text={item} staggerDelay={2} brandAccent={brandAccent} themeType="body" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </AbsoluteFill>
    );
};
