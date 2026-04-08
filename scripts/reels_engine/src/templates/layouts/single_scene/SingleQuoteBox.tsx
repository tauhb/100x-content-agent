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

export const SingleQuoteBox: React.FC<{ content: any }> = ({ content }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: primaryFont } = loadInter();
    const { fontFamily: accentFont } = loadPlayfair();

    const brandAccent = content.brand_accent || '#B6FF00';

    const cardPop  = spring({ frame, fps, config: { damping: 16, stiffness: 110 } });
    const textPop  = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 14, stiffness: 120 } });
    const authorPop = spring({ frame: Math.max(0, frame - 18), fps, config: { damping: 14, stiffness: 100 } });

    const quoteText = content.headline || content.quote || 'Nội dung trích dẫn';
    const author = content.author || '';

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '70px 56px' }}>
            <div style={{
                width: '100%',
                position: 'relative',
                opacity: cardPop,
                transform: `scale(${interpolate(cardPop, [0, 1], [0.92, 1])})`,
            }}>
                {/* Outer glow */}
                <div style={{
                    position: 'absolute',
                    inset: -12,
                    borderRadius: 40,
                    background: 'transparent',
                    boxShadow: `0 0 60px 8px ${rgba(brandAccent, 0.15)}`,
                    pointerEvents: 'none',
                }} />

                {/* Card */}
                <div style={{
                    background: `linear-gradient(145deg, ${rgba(brandAccent, 0.1)}, rgba(255,255,255,0.03))`,
                    backdropFilter: 'blur(30px)',
                    borderRadius: 32,
                    padding: '64px 60px 52px',
                    border: `1.5px solid ${rgba(brandAccent, 0.4)}`,
                    boxShadow: `0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 ${rgba(brandAccent, 0.2)}`,
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Shimmer top edge */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '15%',
                        right: '15%',
                        height: '1px',
                        background: `linear-gradient(to right, transparent, ${brandAccent}, transparent)`,
                        boxShadow: `0 0 12px ${brandAccent}`,
                    }} />

                    {/* Opening quote mark */}
                    <div style={{
                        fontSize: 160,
                        fontFamily: accentFont,
                        fontWeight: '900',
                        color: brandAccent,
                        lineHeight: 0.7,
                        marginBottom: '32px',
                        opacity: 0.9,
                        textShadow: `0 0 40px ${rgba(brandAccent, 0.5)}`,
                    }}>
                        "
                    </div>

                    {/* Quote text */}
                    <div style={{
                        fontSize: 46,
                        fontFamily: accentFont,
                        fontStyle: 'italic',
                        fontWeight: '600',
                        color: '#FFFFFF',
                        lineHeight: 1.5,
                        textAlign: 'left',
                        opacity: textPop,
                        transform: `translateY(${interpolate(textPop, [0, 1], [20, 0])}px)`,
                    }}>
                        <RichText
                            text={quoteText}
                            brandAccent={brandAccent}
                            themeType="headline"
                            staggerDelay={3}
                        />
                    </div>

                    {/* Author */}
                    {author && (
                        <div style={{
                            marginTop: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            opacity: authorPop,
                            transform: `translateX(${interpolate(authorPop, [0, 1], [20, 0])}px)`,
                        }}>
                            {/* Author line */}
                            <div style={{
                                width: '40px',
                                height: '2px',
                                background: brandAccent,
                                borderRadius: '1px',
                                boxShadow: `0 0 8px ${brandAccent}`,
                            }} />
                            <span style={{
                                fontSize: '32px',
                                fontFamily: primaryFont,
                                color: brandAccent,
                                fontWeight: '600',
                                letterSpacing: '1px',
                            }}>
                                {author}
                            </span>
                        </div>
                    )}

                    {/* Closing quote watermark (bottom right) */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-30px',
                        right: '30px',
                        fontSize: 200,
                        fontFamily: accentFont,
                        fontWeight: '900',
                        color: rgba(brandAccent, 0.06),
                        lineHeight: 1,
                        userSelect: 'none',
                        pointerEvents: 'none',
                    }}>
                        "
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );
};
