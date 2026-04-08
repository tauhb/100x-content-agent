import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, spring } from 'remotion';
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";

interface KineticTextProps {
    type: 'word' | 'reveal' | 'count';
    text?: string;
    count_from?: number;
    count_to?: number;
    count_suffix?: string;
    count_label?: string;
    brandAccent?: string;
}

export const KineticText: React.FC<KineticTextProps> = ({
    type,
    text = '',
    count_from = 0,
    count_to = 100,
    count_suffix = '',
    count_label = '',
    brandAccent = '#B6FF00',
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    const { fontFamily: primaryFont } = loadInter();
    const { fontFamily: accentFont } = loadPlayfair();

    // KINETIC_WORD: words explode in one-by-one, massive text
    const renderWord = () => {
        const rawWords = text.split(/(\*[^*]+\*|\s+)/g).filter(Boolean);
        const words: { text: string; isAccent: boolean }[] = [];

        for (const w of rawWords) {
            if (!w.trim()) continue;
            if (w.startsWith('*') && w.endsWith('*')) {
                words.push({ text: w.slice(1, -1), isAccent: true });
            } else {
                words.push({ text: w, isAccent: false });
            }
        }

        return (
            <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '80px', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', textAlign: 'center' }}>
                    {words.map((word, i) => {
                        const delay = i * 8;
                        const pop = spring({
                            frame: Math.max(0, frame - delay),
                            fps,
                            config: { damping: 10, stiffness: 200 },
                        });
                        const scaleVal = interpolate(pop, [0, 1], [0.3, 1]);

                        return (
                            <span
                                key={i}
                                style={{
                                    display: 'inline-block',
                                    fontSize: '96px',
                                    fontWeight: '900',
                                    fontFamily: word.isAccent ? accentFont : primaryFont,
                                    color: word.isAccent ? brandAccent : 'white',
                                    fontStyle: word.isAccent ? 'italic' : 'normal',
                                    lineHeight: 1.1,
                                    opacity: pop,
                                    transform: `scale(${scaleVal})`,
                                    textShadow: word.isAccent ? `0 0 40px ${brandAccent}66` : 'none',
                                }}
                            >
                                {word.text}
                            </span>
                        );
                    })}
                </div>
            </AbsoluteFill>
        );
    };

    // KINETIC_REVEAL: text slides in from left, line by line
    const renderReveal = () => {
        const lines = text.split('\n').filter(Boolean);

        return (
            <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'flex-start', padding: '100px 80px' }}>
                {lines.map((line, i) => {
                    const delay = i * 16;
                    const slide = interpolate(frame - delay, [0, 20], [-120, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                    const fade = interpolate(frame - delay, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

                    const isAccent = line.startsWith('*') && line.endsWith('*');
                    const displayLine = isAccent ? line.slice(1, -1) : line;

                    return (
                        <div
                            key={i}
                            style={{
                                overflow: 'hidden',
                                marginBottom: '20px',
                            }}
                        >
                            <div style={{
                                transform: `translateX(${slide}px)`,
                                opacity: fade,
                                fontSize: isAccent ? '72px' : '56px',
                                fontFamily: isAccent ? accentFont : primaryFont,
                                fontWeight: '800',
                                fontStyle: isAccent ? 'italic' : 'normal',
                                color: isAccent ? brandAccent : 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px',
                            }}>
                                {i === 0 && (
                                    <div style={{ width: '8px', height: '64px', background: brandAccent, borderRadius: '4px', flexShrink: 0 }} />
                                )}
                                {displayLine}
                            </div>
                        </div>
                    );
                })}
            </AbsoluteFill>
        );
    };

    // KINETIC_COUNT: animated number counter — big and bold
    const renderCount = () => {
        const progress = spring({
            frame,
            fps,
            config: { damping: 18, stiffness: 60 },
        });

        const currentValue = Math.round(interpolate(progress, [0, 1], [count_from, count_to]));

        const ringProgress = interpolate(progress, [0, 1], [0, 1]);
        const circumference = 2 * Math.PI * 160;
        const dashOffset = circumference * (1 - ringProgress);

        return (
            <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                {/* Ring background */}
                <svg width="400" height="400" viewBox="0 0 400 400" style={{ position: 'absolute' }}>
                    <circle cx="200" cy="200" r="160" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
                    <circle
                        cx="200"
                        cy="200"
                        r="160"
                        fill="none"
                        stroke={brandAccent}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        transform="rotate(-90 200 200)"
                        style={{ filter: `drop-shadow(0 0 16px ${brandAccent}88)` }}
                    />
                </svg>

                {/* Center number */}
                <div style={{ textAlign: 'center', zIndex: 1 }}>
                    <div style={{
                        fontSize: '120px',
                        fontFamily: accentFont,
                        fontWeight: '900',
                        color: brandAccent,
                        lineHeight: 1,
                    }}>
                        {currentValue}{count_suffix}
                    </div>
                    {count_label && (
                        <div style={{
                            fontSize: '32px',
                            fontFamily: primaryFont,
                            color: 'rgba(255,255,255,0.7)',
                            marginTop: '10px',
                            letterSpacing: '3px',
                            textTransform: 'uppercase',
                        }}>
                            {count_label}
                        </div>
                    )}
                </div>

                {/* Context text */}
                {text && (
                    <div style={{
                        position: 'absolute',
                        bottom: '160px',
                        fontSize: '38px',
                        fontFamily: primaryFont,
                        color: 'rgba(255,255,255,0.65)',
                        textAlign: 'center',
                        padding: '0 80px',
                    }}>
                        {text}
                    </div>
                )}
            </AbsoluteFill>
        );
    };

    return (
        <AbsoluteFill>
            {type === 'word' && renderWord()}
            {type === 'reveal' && renderReveal()}
            {type === 'count' && renderCount()}
        </AbsoluteFill>
    );
};
