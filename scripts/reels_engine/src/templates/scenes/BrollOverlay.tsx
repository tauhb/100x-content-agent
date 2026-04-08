import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, spring, OffthreadVideo, staticFile } from 'remotion';
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { RichText } from '../components/RichText';

interface BrollOverlayProps {
    type: 'quote' | 'stat' | 'bullet' | 'hook';
    bg_video?: string;
    headline?: string;
    subtext?: string;
    stat?: string;
    stat_label?: string;
    bullets?: string[];
    brandAccent?: string;
}

export const BrollOverlay: React.FC<BrollOverlayProps> = ({
    type,
    bg_video,
    headline = '',
    subtext = '',
    stat = '',
    stat_label = '',
    bullets = [],
    brandAccent = '#B6FF00',
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: primaryFont } = loadInter();
    const { fontFamily: accentFont } = loadPlayfair();

    const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
    const slideUp = interpolate(frame, [0, 18], [40, 0], { extrapolateRight: 'clamp' });

    const pop = spring({ frame, fps, config: { damping: 14, stiffness: 180 } });

    return (
        <AbsoluteFill>
            {/* Video background layer */}
            {bg_video && (
                <AbsoluteFill>
                    <OffthreadVideo
                        src={bg_video.startsWith('http') ? bg_video : staticFile(bg_video)}
                        muted
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                </AbsoluteFill>
            )}

            {/* Dark gradient overlay — denser for readability */}
            <AbsoluteFill style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.92) 40%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.2) 100%)',
            }} />

            {/* Content layer */}
            <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '160px', paddingLeft: '60px', paddingRight: '60px' }}>

                {/* BROLL_HOOK — full-screen cinematic headline */}
                {type === 'hook' && (
                    <div style={{
                        textAlign: 'center',
                        opacity: fadeIn,
                        transform: `translateY(${slideUp}px)`,
                    }}>
                        <h1 style={{
                            fontSize: '80px',
                            fontFamily: accentFont,
                            fontWeight: '900',
                            color: 'white',
                            lineHeight: '1.1',
                            textShadow: `0 0 40px ${brandAccent}88`,
                            margin: 0,
                        }}>
                            <RichText text={headline} brandAccent={brandAccent} themeType="headline" staggerDelay={4} />
                        </h1>
                        {subtext && (
                            <p style={{
                                fontSize: '36px',
                                fontFamily: primaryFont,
                                color: 'rgba(255,255,255,0.7)',
                                marginTop: '20px',
                            }}>
                                {subtext}
                            </p>
                        )}
                    </div>
                )}

                {/* BROLL_QUOTE — accent bar + italic quote */}
                {type === 'quote' && (
                    <div style={{
                        opacity: fadeIn,
                        transform: `translateY(${slideUp}px)`,
                        borderLeft: `6px solid ${brandAccent}`,
                        paddingLeft: '40px',
                        width: '100%',
                    }}>
                        <p style={{
                            fontSize: '52px',
                            fontFamily: accentFont,
                            fontStyle: 'italic',
                            color: 'white',
                            lineHeight: '1.3',
                            margin: 0,
                        }}>
                            <RichText text={`"${headline}"`} brandAccent={brandAccent} themeType="body" staggerDelay={3} />
                        </p>
                        {subtext && (
                            <p style={{
                                fontSize: '30px',
                                fontFamily: primaryFont,
                                color: brandAccent,
                                marginTop: '16px',
                                fontWeight: '600',
                                letterSpacing: '2px',
                                textTransform: 'uppercase',
                            }}>
                                — {subtext}
                            </p>
                        )}
                    </div>
                )}

                {/* BROLL_STAT — giant number + label */}
                {type === 'stat' && (
                    <div style={{
                        textAlign: 'center',
                        width: '100%',
                        opacity: fadeIn,
                    }}>
                        <div style={{
                            fontSize: '160px',
                            fontFamily: accentFont,
                            fontWeight: '900',
                            color: brandAccent,
                            lineHeight: 1,
                            transform: `scale(${pop})`,
                            textShadow: `0 0 80px ${brandAccent}66`,
                        }}>
                            {stat}
                        </div>
                        <p style={{
                            fontSize: '42px',
                            fontFamily: primaryFont,
                            color: 'rgba(255,255,255,0.85)',
                            marginTop: '10px',
                            fontWeight: '600',
                            letterSpacing: '3px',
                            textTransform: 'uppercase',
                        }}>
                            {stat_label}
                        </p>
                        {headline && (
                            <p style={{
                                fontSize: '32px',
                                fontFamily: primaryFont,
                                color: 'rgba(255,255,255,0.55)',
                                marginTop: '10px',
                            }}>
                                {headline}
                            </p>
                        )}
                    </div>
                )}

                {/* BROLL_BULLET — video bg + floating bullet list */}
                {type === 'bullet' && (
                    <div style={{
                        width: '100%',
                        opacity: fadeIn,
                        transform: `translateY(${slideUp}px)`,
                    }}>
                        {headline && (
                            <h2 style={{
                                fontSize: '50px',
                                fontFamily: accentFont,
                                color: 'white',
                                marginBottom: '30px',
                                fontWeight: '800',
                            }}>
                                <RichText text={headline} brandAccent={brandAccent} themeType="headline" staggerDelay={3} />
                            </h2>
                        )}
                        {bullets.map((bullet, i) => {
                            const delay = i * 10;
                            const itemPop = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 14, stiffness: 160 } });
                            return (
                                <div key={i} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px',
                                    marginBottom: '18px',
                                    opacity: itemPop,
                                    transform: `translateX(${interpolate(itemPop, [0, 1], [-30, 0])}px)`,
                                }}>
                                    <div style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        background: brandAccent,
                                        flexShrink: 0,
                                        boxShadow: `0 0 10px ${brandAccent}`,
                                    }} />
                                    <span style={{
                                        fontSize: '36px',
                                        fontFamily: primaryFont,
                                        color: 'white',
                                        fontWeight: '500',
                                    }}>
                                        {bullet}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
