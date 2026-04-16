import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SPRING, COLOR } from '../../foundation';

/**
 * WordScroll — Carousel từ khoá theo chiều dọc với depth-of-field blur
 *
 * Archetype: WORD_SCROLL
 * Effect: Từ tập trung ở giữa — to nhất, sáng nhất, không blur.
 *         Các từ trên/dưới nhỏ dần, mờ dần, blur tăng dần.
 *         Mũi tên → hoặc glow accent trỏ vào từ trung tâm.
 *
 * Animation: Toàn bộ stack scroll lên, dừng lại khi focus_word ở trung tâm.
 *
 * Props: words[], focus_index (default: giữa), indicator ('arrow'|'none')
 */

interface WordScrollProps {
    words?: string[];
    focus_index?: number;
    indicator?: 'arrow' | 'line' | 'none';
    brandAccent?: string;
}

export const WordScroll: React.FC<WordScrollProps> = ({
    words = ['Profit', 'Journey', 'Website', 'Brand', 'Design'],
    focus_index,
    indicator = 'arrow',
    brandAccent = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily } = loadInter();

    const focusIdx = focus_index ?? Math.floor(words.length / 2);
    const ITEM_H = 130; // px per word slot in the virtual stack

    // Scroll animation: slides up into final position
    const scrollIn = spring({
        frame,
        fps,
        config: { ...SPRING.gentle, mass: 1.2 },
    });

    // Final offset: center the focusIdx word at Y=0 (relative center)
    const finalOffset = -focusIdx * ITEM_H;
    const currentOffset = interpolate(scrollIn, [0, 1], [finalOffset - 400, finalOffset]);

    // Arrow indicator pulse
    const arrowPulse = 1 + 0.06 * Math.sin((frame / fps) * 2 * Math.PI * 1.5);
    const arrowOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill style={{
            background: '#000',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: '100px',
            paddingBottom: '400px',
            overflow: 'hidden',
        }}>
            {/* Top & bottom fade-out gradient to create DOF edge bleed */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(to bottom, #000 0%, transparent 22%, transparent 78%, #000 100%)',
                zIndex: 10,
                pointerEvents: 'none',
            }} />

            {/* Word stack */}
            <div style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end', // right-align to leave room for arrow on left
                transform: `translateY(${currentOffset}px)`,
                paddingRight: '80px',
                paddingLeft: '160px',
            }}>
                {words.map((word, i) => {
                    const dist = Math.abs(i - focusIdx);
                    const isFocus = i === focusIdx;

                    // Size: focus=100%, ±1=70%, ±2=50%, further=35%
                    const sizeFactor = isFocus ? 1 : dist === 1 ? 0.72 : dist === 2 ? 0.52 : 0.38;
                    const fontSize = 110 * sizeFactor;

                    // Opacity: focus=1, ±1=0.55, ±2=0.3, further=0.15
                    const opacity = isFocus ? 1 : dist === 1 ? 0.52 : dist === 2 ? 0.28 : 0.14;

                    // Blur: focus=0, ±1=2px, ±2=5px, further=9px
                    const blur = isFocus ? 0 : dist === 1 ? 2 : dist === 2 ? 5 : 9;

                    // Color: focus=white, others=gray
                    const color = isFocus ? '#FFFFFF' : '#AAAAAA';

                    return (
                        <div
                            key={i}
                            style={{
                                height: `${ITEM_H}px`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                fontSize: `${fontSize}px`,
                                fontFamily,
                                fontWeight: isFocus ? '800' : '600',
                                color,
                                opacity,
                                filter: blur > 0 ? `blur(${blur}px)` : 'none',
                                letterSpacing: isFocus ? '-2px' : '0px',
                                transition: 'none',
                                lineHeight: 1,
                                userSelect: 'none',
                                textShadow: isFocus ? `0 0 60px ${brandAccent}66` : 'none',
                            }}
                        >
                            {word}
                        </div>
                    );
                })}
            </div>

            {/* Arrow indicator — left of the focus word */}
            {indicator === 'arrow' && (
                <div style={{
                    position: 'absolute',
                    left: '60px',
                    top: '50%',
                    transform: `translateY(-50%) scale(${arrowPulse})`,
                    opacity: arrowOpacity,
                    zIndex: 20,
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    {/* Arrow head SVG */}
                    <svg width="80" height="50" viewBox="0 0 80 50">
                        <line x1="0" y1="25" x2="60" y2="25" stroke="white" strokeWidth="5" strokeLinecap="round" />
                        <polyline points="42,8 68,25 42,42" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            )}

            {/* Accent line indicator */}
            {indicator === 'line' && (
                <div style={{
                    position: 'absolute',
                    left: '50px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '6px',
                    height: '100px',
                    background: brandAccent,
                    borderRadius: '3px',
                    opacity: arrowOpacity,
                    boxShadow: `0 0 20px ${brandAccent}`,
                    zIndex: 20,
                }} />
            )}
        </AbsoluteFill>
    );
};
