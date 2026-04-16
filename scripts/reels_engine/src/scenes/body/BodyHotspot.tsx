import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { SceneBg, SPRING, SPACE, COLOR, TYPE, Z } from '../../foundation';

/**
 * BODY_HOTSPOT — Ảnh/video nền với animated callout circles
 *
 * Archetype: BODY_HOTSPOT
 * Act: 3 — BODY
 *
 * Design rules:
 *   - Video hoặc dark background
 *   - Dark overlay 50% để text đọc được
 *   - Headline ở trên cùng
 *   - Mỗi hotspot có ripple pulse + dot + label card
 *   - Ripple loop mỗi 30 frames
 *   - Label card xuất hiện từ bên cạnh tùy x position
 *
 * Ví dụ Director JSON:
 * {
 *   "archetype": "BODY_HOTSPOT",
 *   "scene_rhythm": "slow",
 *   "voice_text": "Ba điểm mấu chốt bạn cần chú ý.",
 *   "props": {
 *     "headline": "Điểm Mấu Chốt",
 *     "hotspots": [
 *       { "x": 25, "y": 35, "label": "Điểm khởi đầu", "sub": "Nơi mọi thứ bắt đầu" },
 *       { "x": 60, "y": 55, "label": "Bước ngoặt", "sub": "Quyết định quan trọng nhất" },
 *       { "x": 40, "y": 75, "label": "Kết quả", "sub": "Sau 90 ngày" }
 *     ],
 *     "brandAccent": "#B6FF00"
 *   }
 * }
 */

interface Hotspot {
    x: number;
    y: number;
    label: string;
    sub?: string;
    delay?: number;
}

interface BodyHotspotProps {
    bg_video?: string;
    hotspots?: Hotspot[];
    headline?: string;
    brandAccent?: string;
}

export const BodyHotspot: React.FC<BodyHotspotProps> = ({
    bg_video,
    hotspots    = [
        { x: 25, y: 35, label: 'Điểm khởi đầu', sub: 'Nơi mọi thứ bắt đầu' },
        { x: 60, y: 55, label: 'Bước ngoặt', sub: 'Quyết định quan trọng nhất' },
        { x: 40, y: 75, label: 'Kết quả', sub: 'Sau 90 ngày' },
    ],
    headline    = 'Điểm Mấu Chốt',
    brandAccent = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: sansFont } = loadInter();

    // ── Headline ─────────────────────────────────────────────
    const hlSp = spring({ frame: Math.max(0, frame), fps, config: SPRING.snappy });
    const hlTy = interpolate(hlSp, [0, 1], [-40, 0]);
    const hlOp = interpolate(hlSp, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill>
            {/* Background */}
            {bg_video
                ? <SceneBg.Video src={bg_video} />
                : <SceneBg.Dark />
            }

            {/* Dark overlay for readability */}
            <AbsoluteFill style={{
                background:    `rgba(0,0,0,0.5)`,
                pointerEvents: 'none',
                zIndex:        Z.bgOverlay,
            }} />

            {/* Vignette */}
            <SceneBg.Vignette strength="medium" />

            {/* ── Headline ── */}
            <div style={{
                position:   'absolute',
                top:        SPACE.safeTop,
                left:       SPACE.padH,
                right:      SPACE.padH,
                zIndex:     Z.content,
                transform:  `translateY(${hlTy}px)`,
                opacity:    hlOp,
            }}>
                <span style={{
                    fontFamily:    sansFont,
                    fontSize:      `${TYPE.title.size}px`,
                    fontWeight:    TYPE.title.weight,
                    letterSpacing: `${TYPE.title.tracking}px`,
                    lineHeight:    TYPE.title.lineHeight,
                    color:         COLOR.white,
                    display:       'block',
                    textShadow:    `0 2px 20px rgba(0,0,0,0.8)`,
                }}>
                    {headline}
                </span>
                {/* Underline */}
                <div style={{
                    marginTop:    '12px',
                    width:        '72px',
                    height:       '4px',
                    borderRadius: '2px',
                    background:   brandAccent,
                    boxShadow:    `0 0 12px ${brandAccent}`,
                }} />
            </div>

            {/* ── Hotspots ── */}
            {hotspots.map((hs, i) => {
                const hotspotDelay = 10 + i * 15 + (hs.delay ?? 0);
                const localFrame = Math.max(0, frame - hotspotDelay);

                // Dot spring (scale 0→1)
                const dotSp = spring({ frame: localFrame, fps, config: SPRING.bouncy });
                const dotSc = dotSp;
                const dotOp = interpolate(dotSp, [0, 0.4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

                // Ripple: pulse loop every 30 frames, starts after dot appears
                const rippleLocalFrame = Math.max(0, localFrame - 6);
                const rippleCycle = rippleLocalFrame % 30;
                const rippleScale = interpolate(rippleCycle, [0, 30], [1, 1.8], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                const rippleOpacity = interpolate(rippleCycle, [0, 20, 30], [0.7, 0.3, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                // Only show ripple once dot has appeared
                const showRipple = localFrame > 6;

                // Label card slide: from right if x>50, from left if x<=50
                const labelDelay = hotspotDelay + 8;
                const labelSp = spring({ frame: Math.max(0, frame - labelDelay), fps, config: SPRING.normal });
                const labelSlide = interpolate(labelSp, [0, 1], [hs.x > 50 ? 40 : -40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                const labelOp = interpolate(labelSp, [0, 0.4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

                // Label positioning: if x>50 → label to the left of dot, else to the right
                const labelLeft = hs.x > 50;
                // Combined transform: vertical center + horizontal slide animation
                const labelTransform = `translateY(-50%) translateX(${labelSlide}px)`;
                const labelStyle: React.CSSProperties = labelLeft
                    ? { right: `${100 - hs.x}%` }
                    : { left: `${hs.x}%` };

                return (
                    <React.Fragment key={i}>
                        {/* Hotspot circle group */}
                        <div style={{
                            position:  'absolute',
                            left:      `${hs.x}%`,
                            top:       `${hs.y}%`,
                            transform: 'translate(-50%, -50%)',
                            zIndex:    Z.content,
                        }}>
                            {/* Ripple ring */}
                            {showRipple && (
                                <div style={{
                                    position:     'absolute',
                                    top:          '50%',
                                    left:         '50%',
                                    width:        '48px',
                                    height:       '48px',
                                    marginLeft:   '-24px',
                                    marginTop:    '-24px',
                                    borderRadius: '50%',
                                    border:       `2px solid ${brandAccent}`,
                                    transform:    `scale(${rippleScale})`,
                                    opacity:      rippleOpacity * dotOp,
                                    pointerEvents: 'none',
                                }} />
                            )}

                            {/* Inner dot */}
                            <div style={{
                                width:        '16px',
                                height:       '16px',
                                borderRadius: '50%',
                                background:   brandAccent,
                                boxShadow:    `0 0 16px ${brandAccent}, 0 0 32px ${brandAccent}88`,
                                transform:    `scale(${dotSc})`,
                                opacity:      dotOp,
                            }} />
                        </div>

                        {/* Label card */}
                        <div style={{
                            position:   'absolute',
                            top:        `${hs.y}%`,
                            ...labelStyle,
                            transform:  labelTransform,
                            opacity:    labelOp,
                            zIndex:     Z.content,
                            background: 'rgba(0,0,0,0.85)',
                            border:     `1px solid ${brandAccent}44`,
                            borderRadius: '12px',
                            padding:    '16px 24px',
                            minWidth:   '200px',
                            maxWidth:   '280px',
                            // Offset so it doesn't overlap the dot
                            marginLeft:  labelLeft ? undefined : '20px',
                            marginRight: labelLeft ? '20px' : undefined,
                        }}>
                            {/* Arrow connector */}
                            {!labelLeft && (
                                <div style={{
                                    position:    'absolute',
                                    left:        '-8px',
                                    top:         '50%',
                                    marginTop:   '-8px',
                                    width:       '0',
                                    height:      '0',
                                    borderTop:   '8px solid transparent',
                                    borderBottom: '8px solid transparent',
                                    borderRight: `8px solid ${brandAccent}44`,
                                }} />
                            )}
                            {labelLeft && (
                                <div style={{
                                    position:    'absolute',
                                    right:       '-8px',
                                    top:         '50%',
                                    marginTop:   '-8px',
                                    width:       '0',
                                    height:      '0',
                                    borderTop:   '8px solid transparent',
                                    borderBottom: '8px solid transparent',
                                    borderLeft:  `8px solid ${brandAccent}44`,
                                }} />
                            )}

                            <span style={{
                                fontFamily:  sansFont,
                                fontSize:    `${TYPE.body.size * 0.85}px`,
                                fontWeight:  700,
                                color:       COLOR.white,
                                lineHeight:  1.2,
                                display:     'block',
                            }}>
                                {hs.label}
                            </span>
                            {hs.sub && (
                                <span style={{
                                    fontFamily:  sansFont,
                                    fontSize:    `${TYPE.caption.size}px`,
                                    fontWeight:  400,
                                    color:       COLOR.textMuted,
                                    lineHeight:  1.4,
                                    display:     'block',
                                    marginTop:   '6px',
                                }}>
                                    {hs.sub}
                                </span>
                            )}
                        </div>
                    </React.Fragment>
                );
            })}
        </AbsoluteFill>
    );
};
