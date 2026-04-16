import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { SceneBg, SPACE, COLOR, TYPE, Z } from '../../foundation';

/**
 * HOOK_ZOOM_CRASH — Text zoom từ rất xa đập vào viewer, bounce nhẹ
 *
 * Archetype: HOOK_ZOOM_CRASH
 * Act: 1 — HOOK
 *
 * Design rules:
 *   - Nền đen tuyền
 *   - Mỗi line bắt đầu ở scale 7× (rất to, mờ), thu về scale 1 với damping thấp → overshoot nhỏ tạo bounce
 *   - Motion blur giả lập bằng text-shadow blur giảm dần
 *   - Stagger mỗi line thêm 10 frames để tránh collision
 *   - Accent line có glow sau khi settle
 *
 * Ví dụ Director JSON:
 * {
 *   "archetype": "HOOK_ZOOM_CRASH",
 *   "scene_rhythm": "fast",
 *   "voice_text": "DỪNG LẠI. Bạn cần đọc điều này.",
 *   "props": {
 *     "lines": [
 *       { "text": "DỪNG LẠI.",              "size": "display", "color": "accent" },
 *       { "text": "Bạn cần đọc điều này.", "size": "hero",    "color": "white"  }
 *     ],
 *     "align": "center",
 *     "brandAccent": "#B6FF00"
 *   }
 * }
 */

interface HookZoomCrashProps {
    lines?:       Array<{ text: string; size?: 'display' | 'hero' | 'title'; color?: 'white' | 'accent' | 'muted' | string }>;
    align?:       'left' | 'center';
    brandAccent?: string;
}

export const HookZoomCrash: React.FC<HookZoomCrashProps> = ({
    lines = [
        { text: 'DỪNG LẠI.',             size: 'display', color: 'accent' },
        { text: 'Bạn cần đọc điều này.', size: 'hero',    color: 'white'  },
    ],
    align = 'center',
    brandAccent = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: sansFont } = loadInter();

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
                        const size      = line.size || 'hero';
                        const tokens    = TYPE[size];
                        const crashDelay = i * 10; // 10 frames stagger per line

                        const rawColor  = line.color || 'white';
                        const textColor =
                            rawColor === 'accent' ? brandAccent
                          : rawColor === 'white'  ? COLOR.white
                          : rawColor === 'muted'  ? COLOR.textSecondary
                          : rawColor;

                        // Spring avec damping bas → overshoot naturel (bounce)
                        const sp = spring({
                            frame: Math.max(0, frame - crashDelay),
                            fps,
                            config: { damping: 8, stiffness: 380, mass: 0.7 },
                        });

                        // Scale: 7× → 1× (spring gère le bounce via damping bas)
                        const scale = interpolate(sp, [0, 1], [7.0, 1.0]);

                        // Opacity: apparaît vite au début du crash
                        const opacity = interpolate(
                            Math.max(0, frame - crashDelay),
                            [0, 5],
                            [0, 1],
                            { extrapolateRight: 'clamp' },
                        );

                        // Motion blur simulé: blur fort au début, disparaît en settling
                        // sp proche de 0 = scale grand = blur fort; sp → 1 = blur 0
                        const blurAmount = interpolate(sp, [0, 0.8, 1], [20, 4, 0]);
                        const baseTextShadow = `0 0 ${blurAmount}px rgba(255,255,255,0.6)`;

                        // Glow accent après settle
                        const accentGlow = rawColor === 'accent'
                            ? `, 0 0 40px ${brandAccent}66, 0 0 80px ${brandAccent}33`
                            : '';
                        const textShadow = `${baseTextShadow}${accentGlow}`;

                        return (
                            <div
                                key={i}
                                style={{
                                    transform: `scale(${scale})`,
                                    transformOrigin: align === 'center' ? 'center center' : 'left center',
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
                                    textShadow,
                                }}>
                                    {line.text}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </AbsoluteFill>

            {/* Subtle radial glow at bottom — tăng depth */}
            <AbsoluteFill style={{
                background: 'radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.02) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
        </AbsoluteFill>
    );
};
