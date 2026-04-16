import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { SceneBg, SPRING, SPACE, COLOR, TYPE, Z } from '../../foundation';

/**
 * HOOK_GLITCH — Text xuất hiện với digital glitch effect
 *
 * Archetype: HOOK_GLITCH
 * Act: 1 — HOOK
 *
 * Design rules:
 *   - Nền đen tuyền
 *   - Phase GLITCH (frame 0-12): mỗi line rung ngang, opacity flicker, RGB split shadow
 *   - Phase SETTLE (12-20): spring snappy từ dưới lên, opacity 0→1
 *   - Phase STABLE (20+): text ổn định, accent line có subtle glow
 *   - Scanline overlay fade out sau frame 22
 *   - Stagger mỗi line thêm 6 frames
 *
 * Ví dụ Director JSON:
 * {
 *   "archetype": "HOOK_GLITCH",
 *   "scene_rhythm": "fast",
 *   "voice_text": "90% người không biết điều này.",
 *   "props": {
 *     "lines": [
 *       { "text": "90%",          "size": "display", "color": "accent" },
 *       { "text": "người không",  "size": "hero",    "color": "white"  },
 *       { "text": "biết điều này.", "size": "title", "color": "muted"  }
 *     ],
 *     "align": "left",
 *     "brandAccent": "#B6FF00"
 *   }
 * }
 */

interface GlitchLine {
    text:   string;
    size?:  'display' | 'hero' | 'title' | 'body';
    /** 'white' | 'accent' | 'muted' | hex */
    color?: 'white' | 'accent' | 'muted' | string;
}

interface HookGlitchProps {
    lines?:       GlitchLine[];
    align?:       'left' | 'center';
    brandAccent?: string;
}

export const HookGlitch: React.FC<HookGlitchProps> = ({
    lines = [
        { text: '90%',            size: 'display', color: 'accent' },
        { text: 'người không',    size: 'hero',    color: 'white'  },
        { text: 'biết điều này.', size: 'title',   color: 'muted'  },
    ],
    align = 'left',
    brandAccent = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: sansFont } = loadInter();

    // Scanline overlay — chỉ visible trong phase glitch toàn cục
    const scanlineOpacity = interpolate(frame, [0, 18, 22], [0.25, 0.25, 0], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill>
            <SceneBg.Black />

            {/* Content zone */}
            <AbsoluteFill style={{
                justifyContent: 'center',
                alignItems: align === 'center' ? 'center' : 'flex-start',
                paddingTop: SPACE.safeTop,
                paddingBottom: SPACE.safeBottom,
                paddingLeft: SPACE.padH,
                paddingRight: SPACE.padH,
                zIndex: Z.content,
            }}>
                <div style={{
                    width: '100%',
                    textAlign: align,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: align === 'center' ? 'center' : 'flex-start',
                    gap: '0px',
                }}>
                    {lines.map((line, i) => {
                        const size   = line.size || 'hero';
                        const tokens = TYPE[size];
                        const delay  = i * 6; // 6 frames stagger

                        const rawColor  = line.color || 'white';
                        const textColor =
                            rawColor === 'accent' ? brandAccent
                          : rawColor === 'white'  ? COLOR.white
                          : rawColor === 'muted'  ? COLOR.textSecondary
                          : rawColor;

                        // ── Phase GLITCH: frame 0 … delay+12 ──
                        const isGlitching = frame < delay + 12;

                        const glitchOffset = isGlitching
                            ? (frame % 3 === 0 ? -6 : frame % 5 === 0 ? 4 : frame % 7 === 0 ? -3 : 0)
                            : 0;

                        const glitchOpacity = isGlitching
                            ? (frame % 4 === 0 ? 0.3 : frame % 3 === 0 ? 0.8 : 1.0)
                            : 1.0;

                        // ── Phase SETTLE: spring après le glitch ──
                        const settleSp = spring({
                            frame: Math.max(0, frame - delay - 12),
                            fps,
                            config: SPRING.snappy,
                        });
                        const settleY       = interpolate(settleSp, [0, 1], [30, 0]);
                        const settleOpacity = interpolate(settleSp, [0, 0.2], [0, 1], { extrapolateRight: 'clamp' });

                        // Combine: pendant glitch la ligne est visible avec flicker
                        // après glitch elle spring-settle depuis y=30
                        const translateY = isGlitching ? 0 : settleY;
                        const opacity    = isGlitching ? glitchOpacity : settleOpacity;

                        // ── Color aberration (RGB split text-shadow) ──
                        const aberrationShadow = isGlitching
                            ? `-3px 0 ${brandAccent}88, 3px 0 rgba(255,0,0,0.4)`
                            : rawColor === 'accent'
                                ? `0 0 30px ${brandAccent}66`
                                : 'none';

                        return (
                            <div
                                key={i}
                                style={{
                                    transform: `translateX(${glitchOffset}px) translateY(${translateY}px)`,
                                    opacity,
                                    marginBottom: size === 'display' ? '-4px'
                                                : size === 'hero'    ? '-2px'
                                                : '4px',
                                }}
                            >
                                <span style={{
                                    fontFamily:    sansFont,
                                    fontSize:      `${tokens.size}px`,
                                    fontWeight:    tokens.weight,
                                    letterSpacing: `${tokens.tracking}px`,
                                    lineHeight:    tokens.lineHeight,
                                    color:         textColor,
                                    display:       'inline-block',
                                    textShadow:    aberrationShadow,
                                }}>
                                    {line.text}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </AbsoluteFill>

            {/* Scanline overlay — fade out sau frame 22 */}
            <AbsoluteFill style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)',
                opacity: scanlineOpacity,
                pointerEvents: 'none',
                zIndex: Z.overlay,
            }} />
        </AbsoluteFill>
    );
};
