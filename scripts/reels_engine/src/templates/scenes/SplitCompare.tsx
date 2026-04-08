import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { RichText } from '../components/RichText';

interface SplitSide {
    label?: string;
    text: string;
    emoji?: string;
}

interface SplitCompareProps {
    left: SplitSide;
    right: SplitSide;
    brandAccent?: string;
}

export const SplitCompare: React.FC<SplitCompareProps> = ({
    left,
    right,
    brandAccent = '#B6FF00',
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: primaryFont } = loadInter();
    const { fontFamily: accentFont } = loadPlayfair();

    const slideLeft = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
    const slideRight = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 14, stiffness: 120 } });
    const dividerScale = spring({ frame: Math.max(0, frame - 5), fps, config: { damping: 12, stiffness: 180 } });

    const translateLeft = interpolate(slideLeft, [0, 1], [-80, 0]);
    const translateRight = interpolate(slideRight, [0, 1], [80, 0]);

    const RED = '#FF4B4B';
    const GREEN = brandAccent;

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '80px 60px', gap: '0' }}>
            {/* Panel Trái */}
            <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '48%',
                height: '100%',
                background: 'rgba(255,75,75,0.08)',
                border: `2px solid ${RED}33`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '80px 50px',
                gap: '40px',
                opacity: slideLeft,
                transform: `translateX(${translateLeft}px)`,
            }}>
                {left.label && (
                    <div style={{
                        fontSize: '28px',
                        fontWeight: 'bold',
                        color: RED,
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        opacity: 0.8,
                    }}>
                        {left.label}
                    </div>
                )}
                {left.emoji && (
                    <div style={{ fontSize: '100px', lineHeight: 1 }}>{left.emoji}</div>
                )}
                <div style={{
                    fontSize: '44px',
                    fontWeight: 'bold',
                    color: 'white',
                    textAlign: 'center',
                    lineHeight: 1.4,
                    fontFamily: primaryFont,
                }}>
                    <RichText text={left.text} brandAccent={brandAccent} themeType="body" staggerDelay={3} />
                </div>
            </div>

            {/* Đường kẻ giữa */}
            <div style={{
                position: 'absolute',
                left: '50%',
                top: '10%',
                width: '3px',
                height: '80%',
                background: `linear-gradient(to bottom, transparent, ${brandAccent}, transparent)`,
                transform: `scaleY(${dividerScale}) translateX(-50%)`,
                transformOrigin: 'center center',
                boxShadow: `0 0 20px ${brandAccent}88`,
            }} />

            {/* Panel Phải */}
            <div style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: '48%',
                height: '100%',
                background: `rgba(${parseInt(GREEN.slice(1,3),16)},${parseInt(GREEN.slice(3,5),16)},${parseInt(GREEN.slice(5,7),16)},0.08)`,
                border: `2px solid ${GREEN}33`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '80px 50px',
                gap: '40px',
                opacity: slideRight,
                transform: `translateX(${translateRight}px)`,
            }}>
                {right.label && (
                    <div style={{
                        fontSize: '28px',
                        fontWeight: 'bold',
                        color: GREEN,
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        opacity: 0.8,
                    }}>
                        {right.label}
                    </div>
                )}
                {right.emoji && (
                    <div style={{ fontSize: '100px', lineHeight: 1 }}>{right.emoji}</div>
                )}
                <div style={{
                    fontSize: '44px',
                    fontWeight: 'bold',
                    color: 'white',
                    textAlign: 'center',
                    lineHeight: 1.4,
                    fontFamily: primaryFont,
                }}>
                    <RichText text={right.text} brandAccent={brandAccent} themeType="body" staggerDelay={3} />
                </div>
            </div>
        </AbsoluteFill>
    );
};
