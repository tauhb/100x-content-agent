import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { SPRING, COLOR } from '../../foundation';
import { RichText } from '../../ui/RichText';

/**
 * SpeechBubble — Bong bóng hội thoại trên nền màu sắc
 *
 * Archetype: SPEECH_BUBBLE
 * Style: Nền màu sáng (lime/yellow/blue), bong bóng đen pop vào từ trên,
 *        text trắng bold bên trong. Optional: subcard ở dưới.
 *
 * Motion: Bubble scale-bounce in (spring), subcard slide up từ dưới.
 *
 * Props: text, bg_color, bubble_color, subcard{label, value}
 */

interface SubCard {
    label?: string;
    value?: string;
}

interface SpeechBubbleProps {
    text?: string;
    bg_color?: string;
    bubble_color?: string;
    subcard?: SubCard;
    brandAccent?: string;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
    text = 'Bạn đang làm điều này *sai* rồi.',
    bg_color,
    bubble_color = '#111111',
    subcard,
    brandAccent = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily } = loadInter();

    const effectiveBg = bg_color || brandAccent;

    // Bubble entrance: scale + bounce
    const bubblePop = spring({
        frame,
        fps,
        config: { ...SPRING.snappy, mass: 0.85 },
    });
    const bubbleScale = interpolate(bubblePop, [0, 1], [0.6, 1]);
    const bubbleOpacity = interpolate(bubblePop, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

    // Subcard slide up from bottom
    const cardDelay = 14;
    const cardSlide = spring({
        frame: Math.max(0, frame - cardDelay),
        fps,
        config: SPRING.bouncy,
    });
    const cardY = interpolate(cardSlide, [0, 1], [120, 0]);
    const cardOpacity = interpolate(cardSlide, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill style={{
            background: effectiveBg,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: '100px',
            paddingBottom: '400px',
            flexDirection: 'column',
            gap: '48px',
        }}>

            {/* Speech Bubble */}
            <div style={{
                transform: `scale(${bubbleScale})`,
                opacity: bubbleOpacity,
                width: '82%',
                position: 'relative',
            }}>
                {/* Bubble body */}
                <div style={{
                    background: bubble_color,
                    borderRadius: '32px',
                    padding: '52px 56px',
                    position: 'relative',
                }}>
                    <div style={{
                        fontFamily,
                        fontSize: '62px',
                        fontWeight: '800',
                        color: '#FFFFFF',
                        lineHeight: 1.2,
                    }}>
                        <RichText text={text} brandAccent={brandAccent} themeType="headline" staggerDelay={3} />
                    </div>
                </div>

                {/* Bubble tail (pointing down) */}
                <div style={{
                    position: 'absolute',
                    bottom: '-38px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '28px solid transparent',
                    borderRight: '28px solid transparent',
                    borderTop: `40px solid ${bubble_color}`,
                }} />
            </div>

            {/* SubCard (optional) — like "Project: 0% complete" */}
            {subcard && (
                <div style={{
                    opacity: cardOpacity,
                    transform: `translateY(${cardY}px)`,
                    width: '82%',
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: '24px',
                    padding: '28px 40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                }}>
                    <div>
                        <div style={{
                            fontFamily,
                            fontSize: '36px',
                            fontWeight: '800',
                            color: '#111',
                        }}>
                            {subcard.label}
                        </div>
                        {subcard.value && (
                            <div style={{
                                fontFamily,
                                fontSize: '26px',
                                color: '#666',
                                marginTop: '4px',
                            }}>
                                {subcard.value}
                            </div>
                        )}
                    </div>
                    {/* Cursor icon */}
                    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                        <polygon points="8,4 8,44 20,32 28,48 34,45 26,29 42,29" fill="#111" />
                    </svg>
                </div>
            )}
        </AbsoluteFill>
    );
};
