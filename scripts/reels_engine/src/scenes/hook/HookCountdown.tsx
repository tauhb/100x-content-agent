import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { SceneBg, TIMING, SPRING, SPACE, COLOR, TYPE, Z } from '../../foundation';

/**
 * HOOK_COUNTDOWN — Đếm ngược 3→2→1 với particle burst, sau đó reveal text hook
 *
 * Archetype: HOOK_COUNTDOWN
 * Act: 1 — HOOK
 *
 * Animation structure (30fps):
 *   Frame  0-14:  "3" scale spring 2→1, fade out ở frame 12-14
 *   Frame 15-29:  "2" tương tự
 *   Frame 30-44:  "1" scale spring in, glow mạnh hơn
 *   Frame 45-50:  Particle burst — "1" scale to 0, 8 particles bay ra
 *   Frame 50+:    Main text lines spring lên từ dưới (stagger)
 *
 * Ví dụ Director JSON:
 * {
 *   "archetype": "HOOK_COUNTDOWN",
 *   "scene_rhythm": "medium",
 *   "voice_text": "Sự thật là 97% sẽ thất bại.",
 *   "props": {
 *     "lines": [
 *       { "text": "Sự thật là",      "size": "title", "color": "muted" },
 *       { "text": "97% sẽ thất bại.", "size": "hero",  "color": "white" }
 *     ],
 *     "align": "center",
 *     "brandAccent": "#B6FF00"
 *   }
 * }
 */

interface HookCountdownProps {
    lines?:       Array<{ text: string; size?: 'display' | 'hero' | 'title'; color?: 'white' | 'accent' | 'muted' | string }>;
    align?:       'left' | 'center';
    brandAccent?: string;
}

const PARTICLE_COUNT = 8;

export const HookCountdown: React.FC<HookCountdownProps> = ({
    lines = [
        { text: 'Sự thật là',       size: 'title', color: 'muted'  },
        { text: '97% sẽ thất bại.', size: 'hero',  color: 'white'  },
    ],
    align = 'center',
    brandAccent = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: sansFont } = loadInter();

    // ── Countdown phase: frame 0-44 ──
    const countdownActive = frame < 50;
    const currentNum: number | null = frame < 15 ? 3 : frame < 30 ? 2 : frame < 45 ? 1 : null;
    const numLocalFrame = frame % 15;

    // Scale: spring in nhanh (dùng bouncy cho "1" để có glow pop feel)
    const numSp = spring({ frame: numLocalFrame, fps, config: SPRING.bouncy });
    const numScale = interpolate(numSp, [0, 1], [2.0, 1.0]);

    // Fade in nhanh, hold, fade out cuối phase
    const numOpacity = interpolate(
        numLocalFrame,
        [0, 3, 11, 15],
        [0, 1, 1, 0],
        { extrapolateRight: 'clamp' },
    );

    // Glow mạnh hơn cho "1"
    const numGlow = currentNum === 1
        ? `0 0 40px ${brandAccent}99, 0 0 80px ${brandAccent}55`
        : `0 0 20px ${brandAccent}55`;

    // ── Particle burst: frame 45-65 ──
    const particleProgress = interpolate(frame, [45, 65], [0, 1], { extrapolateRight: 'clamp' });
    const particleOpacity  = interpolate(frame, [45, 55, 65], [1, 0.6, 0], { extrapolateRight: 'clamp' });
    const burstActive = frame >= 45 && frame < 70;

    // ── Main lines: frame 50+ ──
    const mainLinesDelay = 50;

    return (
        <AbsoluteFill>
            <SceneBg.Black />

            {/* ── Countdown Number ── */}
            {countdownActive && currentNum !== null && (
                <AbsoluteFill style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: Z.content,
                }}>
                    <span style={{
                        fontFamily:    sansFont,
                        fontSize:      `${TYPE.display.size}px`,
                        fontWeight:    TYPE.display.weight,
                        letterSpacing: `${TYPE.display.tracking}px`,
                        lineHeight:    1,
                        color:         brandAccent,
                        display:       'inline-block',
                        transform:     `scale(${numScale})`,
                        opacity:       numOpacity,
                        textShadow:    numGlow,
                    }}>
                        {currentNum}
                    </span>
                </AbsoluteFill>
            )}

            {/* ── Particle Burst ── */}
            {burstActive && (
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', zIndex: Z.content }}>
                    <div style={{ position: 'relative', width: 0, height: 0 }}>
                        {Array.from({ length: PARTICLE_COUNT }).map((_, idx) => {
                            const angle = (idx / PARTICLE_COUNT) * Math.PI * 2;
                            const dx = Math.cos(angle) * 200 * particleProgress;
                            const dy = Math.sin(angle) * 200 * particleProgress;
                            return (
                                <div
                                    key={idx}
                                    style={{
                                        position: 'absolute',
                                        width: 16,
                                        height: 16,
                                        borderRadius: '50%',
                                        backgroundColor: brandAccent,
                                        transform: `translate(${dx - 8}px, ${dy - 8}px)`,
                                        opacity: particleOpacity,
                                        boxShadow: `0 0 10px ${brandAccent}88`,
                                    }}
                                />
                            );
                        })}
                    </div>
                </AbsoluteFill>
            )}

            {/* ── Main Text Lines ── */}
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

                        const rawColor  = line.color || 'white';
                        const textColor =
                            rawColor === 'accent' ? brandAccent
                          : rawColor === 'white'  ? COLOR.white
                          : rawColor === 'muted'  ? COLOR.textSecondary
                          : rawColor;

                        const lineDelay = mainLinesDelay + i * TIMING.fast;
                        const sp = spring({
                            frame: Math.max(0, frame - lineDelay),
                            fps,
                            config: SPRING.snappy,
                        });
                        const ty      = interpolate(sp, [0, 1], [60, 0]);
                        const opacity = interpolate(sp, [0, 0.25], [0, 1], { extrapolateRight: 'clamp' });
                        const scaleX  = interpolate(sp, [0, 1], [0.92, 1]);

                        const glowStyle: React.CSSProperties = rawColor === 'accent'
                            ? { textShadow: `0 0 40px ${brandAccent}66, 0 0 80px ${brandAccent}33` }
                            : {};

                        return (
                            <div
                                key={i}
                                style={{
                                    transform: `translateY(${ty}px) scaleX(${scaleX})`,
                                    opacity,
                                    transformOrigin: align === 'center' ? 'center bottom' : 'left bottom',
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
                                    ...glowStyle,
                                }}>
                                    {line.text}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
