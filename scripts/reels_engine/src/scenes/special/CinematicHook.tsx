import React from 'react';
import {
    AbsoluteFill, useCurrentFrame, useVideoConfig,
    interpolate, spring, OffthreadVideo, staticFile, Img,
} from 'remotion';
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { SPRING, COLOR } from '../../foundation';

/**
 * CinematicHook — Mixed typography hook đè trực tiếp lên B-roll
 *
 * Archetype: CINEMATIC_HOOK
 *
 * Props:
 *   lines[]: { text, size, color, style, centered?, highlight? }
 *   show_swoosh?: boolean
 *   badge?: string
 *   position?: 'bottom' | 'center'
 *
 * LINE highlight modes:
 *   highlight: 'bar'    — solid accent-colored rectangle behind text (CONTRAST EFFECT style)
 *   highlight: 'border' — accent-colored outline border around text block
 *   centered: true      — center-align this line (default: left)
 */

type LineSize  = 'hero' | 'large' | 'medium' | 'small';
type LineColor = 'white' | 'accent' | string;
type LineStyle = 'normal' | 'italic' | 'serif' | 'script' | 'caps';

interface LineConfig {
    text:        string;
    size?:       LineSize;
    color?:      LineColor;
    style?:      LineStyle;
    centered?:   boolean;                    // center on screen
    highlight?:  'bar' | 'border' | 'none'; // accent highlight type
}

interface CinematicHookProps {
    bg_video?:    string;
    image_src?:   string;
    lines?:       LineConfig[];
    show_swoosh?: boolean;
    badge?:       string;
    position?:    'bottom' | 'center';
    brandAccent?: string;
}

// Font size map (base sizes)
const SIZE_PX: Record<LineSize, number> = {
    hero:   175,
    large:  115,
    medium: 76,
    small:  50,
};

// Auto-scale font size to prevent single-word-per-line at large sizes
function autoScaleFont(text: string, baseSize: number): number {
    const len = text.trim().length;
    if (baseSize >= 115) {
        // hero / large — scale down for short text that wraps badly
        if (len <= 5)  return baseSize;          // 1 short word — keep original
        if (len <= 10) return Math.round(baseSize * 0.88); // 1-2 words
        if (len <= 18) return Math.round(baseSize * 0.75); // 2-3 words
        return Math.round(baseSize * 0.62);               // longer text → reduce significantly
    }
    return baseSize;
}

// Line height map
const LINE_HEIGHT: Record<LineSize, number> = {
    hero:   0.90,
    large:  0.96,
    medium: 1.05,
    small:  1.15,
};

export const CinematicHook: React.FC<CinematicHookProps> = ({
    bg_video,
    image_src,
    lines = [],
    show_swoosh = false,
    badge,
    position = 'bottom',
    brandAccent = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    const kenBurnsScale = interpolate(frame, [0, durationInFrames], [1.0, 1.10], { extrapolateRight: 'clamp' });
    const { fontFamily: sansFont }  = loadInter();
    const { fontFamily: serifFont } = loadPlayfair();

    // Swoosh animation
    const swooshProgress = interpolate(
        frame,
        [lines.length * 8 + 5, lines.length * 8 + 30],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    const SWOOSH_LEN = 560;

    // Badge entrance
    const badgeDelay = lines.length * 9 + 12;
    const badgeSpring = spring({
        frame: Math.max(0, frame - badgeDelay),
        fps,
        config: SPRING.snappy,
    });
    const badgeScale = interpolate(badgeSpring, [0, 1], [0.7, 1]);
    const badgeOpacity = interpolate(badgeSpring, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

    const containerStyle: React.CSSProperties = position === 'bottom'
        ? { position: 'absolute', bottom: '420px', left: '64px', right: '64px' }
        : { position: 'absolute', top: '50%', left: '64px', right: '64px', transform: 'translateY(-50%)' };

    return (
        <AbsoluteFill style={{ background: '#000' }}>

            {/* B-roll video background */}
            {bg_video && (
                <AbsoluteFill>
                    <OffthreadVideo
                        src={bg_video.startsWith('http') ? bg_video : staticFile(bg_video)}
                        muted
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                </AbsoluteFill>
            )}

            {/* Ken Burns image fallback khi không có video */}
            {!bg_video && image_src && (
                <AbsoluteFill style={{ overflow: 'hidden' }}>
                    <Img
                        src={image_src}
                        style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            transform: `scale(${kenBurnsScale})`,
                            transformOrigin: '55% 45%',
                        }}
                    />
                </AbsoluteFill>
            )}

            {/* Ambient gradient — depth khi không có b-roll và không có ảnh */}
            {!bg_video && !image_src && (
                <AbsoluteFill style={{
                    background: `radial-gradient(ellipse at 50% 80%, ${brandAccent}0D 0%, #000000 60%)`,
                }} />
            )}

            {/* Vignette overlay */}
            <AbsoluteFill style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.05) 100%)',
            }} />

            {/* Text block */}
            <div style={containerStyle}>

                {lines.map((line, i) => {
                    const size      = line.size      || 'large';
                    const style     = line.style     || 'normal';
                    const highlight = line.highlight || 'none';
                    const isCentered = line.centered ?? false;
                    const baseFontSize = SIZE_PX[size];
                    const fontSize = autoScaleFont(line.text, baseFontSize);

                    const rawColor = line.color || 'white';
                    const color = rawColor === 'accent' ? brandAccent
                                : rawColor === 'white'  ? '#FFFFFF'
                                : rawColor;

                    // For bar highlight, text is black (dark bg), else use specified color
                    const textColor = highlight === 'bar' ? '#000000' : color;

                    const isSerif  = style === 'serif' || style === 'script';
                    const fontFamily = isSerif ? serifFont : sansFont;
                    const fontStyle  = (style === 'italic' || style === 'script') ? 'italic' : 'normal';
                    const fontWeight = (style === 'normal' || style === 'caps') ? '900' : '700';
                    const textTransform: React.CSSProperties['textTransform'] = 'none';

                    // Stagger spring per line
                    const lineDelay = i * 9;
                    const lineSpring = spring({
                        frame: Math.max(0, frame - lineDelay),
                        fps,
                        config: { ...SPRING.normal, mass: 0.9 },
                    });
                    const ty      = interpolate(lineSpring, [0, 1], [55, 0]);
                    const opacity = interpolate(lineSpring, [0, 0.35], [0, 1], { extrapolateRight: 'clamp' });
                    const scale   = interpolate(lineSpring, [0, 1], [0.88, 1]);

                    // Highlight bar wipe (left → right), starts slightly after text spring
                    const barDelay = lineDelay + 2;
                    const barWipe = interpolate(
                        frame - barDelay,
                        [0, 18],
                        [0, 1],
                        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                    );

                    // Extra margin: highlighted lines get negative vertical margin to "overlap" neighbors
                    const overlapMargin = (highlight !== 'none') ? '-6px' : '0px';

                    return (
                        <div
                            key={i}
                            style={{
                                transform: `translateY(${ty}px) scale(${scale})`,
                                opacity,
                                transformOrigin: isCentered ? 'center center' : 'left center',
                                display: 'block',
                                textAlign: isCentered ? 'center' : 'left',
                                marginTop: overlapMargin,
                                marginBottom: (highlight !== 'none') ? overlapMargin : (size === 'hero' ? '-8px' : size === 'large' ? '-4px' : '2px'),
                                position: 'relative',
                            }}
                        >
                            {/* Highlight bar (renders behind text) */}
                            {highlight === 'bar' && (
                                <div style={{
                                    position: 'absolute',
                                    top: '4px',
                                    bottom: '4px',
                                    left: isCentered ? '50%' : '-8px',
                                    width: `${barWipe * (isCentered ? 100 : 102)}%`,
                                    transform: isCentered ? `translateX(-${barWipe * 50}%)` : 'none',
                                    background: brandAccent,
                                    zIndex: 0,
                                    borderRadius: '4px',
                                }} />
                            )}

                            {/* Highlight border */}
                            {highlight === 'border' && (
                                <div style={{
                                    position: 'absolute',
                                    inset: '-16px -20px',
                                    border: `4px solid ${brandAccent}`,
                                    borderRadius: '10px',
                                    boxShadow: `0 0 24px ${brandAccent}88, inset 0 0 12px ${brandAccent}22`,
                                    background: `${brandAccent}08`,
                                    opacity: barWipe,
                                    zIndex: 0,
                                }} />
                            )}

                            <span style={{
                                fontFamily,
                                fontSize:      `${fontSize}px`,
                                fontWeight,
                                fontStyle,
                                textTransform,
                                color:         textColor,
                                lineHeight:    LINE_HEIGHT[size],
                                display:       'inline-block',
                                position:      'relative',
                                zIndex:        1,
                                textShadow: highlight !== 'none' ? 'none'
                                    : textColor === '#FFFFFF'
                                        ? '0 2px 24px rgba(0,0,0,0.85), 0 0 60px rgba(0,0,0,0.5)'
                                        : `0 0 30px ${textColor}66, 0 2px 20px rgba(0,0,0,0.7)`,
                                letterSpacing: size === 'hero'  ? '-3px'
                                             : size === 'large' ? '-1px'
                                             : '0px',
                            }}>
                                {line.text}
                            </span>
                        </div>
                    );
                })}

                {/* Swoosh underline */}
                {show_swoosh && (
                    <div style={{ marginTop: '4px', height: '32px', overflow: 'visible' }}>
                        <svg width="580" height="32" viewBox="0 0 580 32" style={{ overflow: 'visible' }}>
                            <defs>
                                <filter id="swooshGlow" x="-20%" y="-100%" width="140%" height="300%">
                                    <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor={brandAccent} floodOpacity="0.8" />
                                </filter>
                            </defs>
                            <path
                                d="M 0 20 C 100 8, 280 26, 560 10"
                                fill="none"
                                stroke={brandAccent}
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray={SWOOSH_LEN}
                                strokeDashoffset={SWOOSH_LEN * (1 - swooshProgress)}
                                filter="url(#swooshGlow)"
                            />
                            {swooshProgress > 0.9 && (
                                <g
                                    transform="translate(556, 11) rotate(-5)"
                                    opacity={interpolate(swooshProgress, [0.9, 1], [0, 1], { extrapolateRight: 'clamp' })}
                                    filter="url(#swooshGlow)"
                                >
                                    <polygon points="0,0 -14,-6 -14,6" fill={brandAccent} />
                                </g>
                            )}
                        </svg>
                    </div>
                )}

                {/* Pill badge */}
                {badge && (
                    <div style={{
                        display:    'inline-flex',
                        alignItems: 'center',
                        marginTop:  '20px',
                        transform:  `scale(${badgeScale})`,
                        opacity:    badgeOpacity,
                        transformOrigin: 'left center',
                    }}>
                        <div style={{
                            background:   brandAccent,
                            borderRadius: '100px',
                            padding:      '10px 32px',
                        }}>
                            <span style={{
                                fontFamily: sansFont,
                                fontSize:   '36px',
                                fontWeight: '700',
                                color:      '#000',
                                letterSpacing: '0.5px',
                            }}>
                                {badge}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </AbsoluteFill>
    );
};
