import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { TIMING, SPRING, SPACE, COLOR, TYPE, Z } from '../../foundation';

/**
 * HOOK_CONTRAST — Màn hình chia đôi đứng (Before / After)
 *
 * Archetype: HOOK_CONTRAST
 * Act: 1 — HOOK
 *
 * Design rules:
 *   - Màn hình chia đôi trái/phải: trái tối, phải sáng (accent)
 *   - Divider line trung tâm wipe từ trên xuống
 *   - Nhãn nhỏ "BEFORE" / "AFTER" xuất hiện ở góc mỗi panel
 *   - Text trái (pain/old) slide vào từ trái
 *   - Text phải (gain/new) slide vào từ phải
 *   - Tuỳ chọn: left_label / right_label thay thế BEFORE/AFTER
 *
 * Props:
 *   left_text:     Text bên trái (pain/before)
 *   right_text:    Text bên phải (gain/after)
 *   left_label:    Label góc trên trái (default: "TRƯỚC")
 *   right_label:   Label góc trên phải (default: "SAU")
 *   left_sub:      Dòng nhỏ dưới text trái
 *   right_sub:     Dòng nhỏ dưới text phải
 *   brandAccent:   Màu accent (dùng cho nền phải)
 *
 * Ví dụ Director JSON:
 * {
 *   "archetype": "HOOK_CONTRAST",
 *   "scene_rhythm": "medium",
 *   "voice_text": "Trước khi học content — sau khi học content.",
 *   "props": {
 *     "left_text": "0 khách hàng\nmỗi tháng",
 *     "right_text": "50 khách\nmỗi tuần",
 *     "left_label": "TRƯỚC",
 *     "right_label": "SAU",
 *     "left_sub": "Đăng mỗi ngày, không ai xem",
 *     "right_sub": "Content đúng hướng, khách tự tìm"
 *   }
 * }
 */

interface HookContrastProps {
    left_text?:   string;
    right_text?:  string;
    left_label?:  string;
    right_label?: string;
    left_sub?:    string;
    right_sub?:   string;
    brandAccent?: string;
}

export const HookContrast: React.FC<HookContrastProps> = ({
    left_text  = '0 khách hàng\nmỗi tháng',
    right_text = '50 khách\nmỗi tuần',
    left_label  = 'TRƯỚC',
    right_label = 'SAU',
    left_sub    = '',
    right_sub   = '',
    brandAccent = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: sansFont } = loadInter();

    const leftLines  = left_text.split('\n').filter(Boolean);
    const rightLines = right_text.split('\n').filter(Boolean);

    // ── Divider wipe top → bottom ─────────────────────────────
    const dividerSp = spring({
        frame: Math.max(0, frame),
        fps,
        config: SPRING.snappy,
    });
    const dividerHeight = interpolate(dividerSp, [0, 1], [0, 100]);

    // ── Label & text delays ───────────────────────────────────
    const labelDelay = TIMING.snap;
    const textDelay  = TIMING.fast + TIMING.snap;

    // ── Label animation ───────────────────────────────────────
    const labelSp = spring({
        frame: Math.max(0, frame - labelDelay),
        fps,
        config: SPRING.normal,
    });
    const labelOpacity = interpolate(labelSp, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
    const badgeTy      = interpolate(labelSp, [0, 1], [-20, 0]);

    // ── Helper: animated text block ───────────────────────────
    const AnimatedLines: React.FC<{
        lines: string[];
        direction: 'left' | 'right';
        color: string;
        sub?: string;
        subColor?: string;
    }> = ({ lines, direction, color, sub, subColor }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {lines.map((line, i) => {
                const delay = textDelay + i * TIMING.fast;
                const sp = spring({
                    frame: Math.max(0, frame - delay),
                    fps,
                    config: SPRING.snappy,
                });

                const sc      = interpolate(sp, [0, 1], [0.88, 1]);
                const opacity = interpolate(sp, [0, 0.25], [0, 1], { extrapolateRight: 'clamp' });

                const sizeTokens = i === 0 ? TYPE.hero : TYPE.title;

                return (
                    <div
                        key={i}
                        style={{
                            transform:  `scale(${sc})`,
                            opacity,
                            marginBottom: i < lines.length - 1 ? '-4px' : '0',
                            transformOrigin: direction === 'left' ? 'left center' : 'right center',
                        }}
                    >
                        <span style={{
                            fontFamily:    sansFont,
                            fontSize:      `${sizeTokens.size}px`,
                            fontWeight:    sizeTokens.weight,
                            letterSpacing: `${sizeTokens.tracking}px`,
                            lineHeight:    sizeTokens.lineHeight,
                            color,
                            display:       'inline-block',
                        }}>
                            {line}
                        </span>
                    </div>
                );
            })}

            {sub && (() => {
                const subDelay = textDelay + lines.length * TIMING.fast;
                const subSp = spring({
                    frame: Math.max(0, frame - subDelay),
                    fps,
                    config: SPRING.gentle,
                });
                const subOpacity = interpolate(subSp, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
                const subSc      = interpolate(subSp, [0, 1], [0.92, 1]);

                return (
                    <div style={{
                        marginTop:       `${SPACE.gap}px`,
                        transform:       `scale(${subSc})`,
                        opacity:         subOpacity,
                        transformOrigin: direction === 'left' ? 'left center' : 'right center',
                    }}>
                        <span style={{
                            fontFamily:    sansFont,
                            fontSize:      `${TYPE.body.size}px`,
                            fontWeight:    400,
                            letterSpacing: `${TYPE.body.tracking}px`,
                            lineHeight:    TYPE.body.lineHeight,
                            color:         subColor ?? `${color}88`,
                            display:       'block',
                        }}>
                            {sub}
                        </span>
                    </div>
                );
            })()}
        </div>
    );

    // Box padding — để lộ nền ambient 4 phía
    const BOX_PAD_H   = SPACE.padH;
    const BOX_PAD_TOP = SPACE.safeTop + 40;
    const BOX_PAD_BOT = SPACE.safeBottom + 40;

    return (
        <AbsoluteFill>
            {/* Overlay mờ toàn màn hình — để ambient broll thấy qua bên ngoài box */}
            <AbsoluteFill style={{ background: 'rgba(0,0,0,0.45)' }} />

            {/* Box container — có padding 4 phía để lộ nền */}
            <AbsoluteFill style={{
                padding:        `${BOX_PAD_TOP}px ${BOX_PAD_H}px ${BOX_PAD_BOT}px`,
                zIndex:         Z.content,
                justifyContent: 'center',
                alignItems:     'center',
            }}>
                <div style={{
                    width:         '100%',
                    height:        '100%',
                    display:       'flex',
                    flexDirection: 'row',
                    borderRadius:  '24px',
                    overflow:      'hidden',
                    border:        `1px solid rgba(255,255,255,0.06)`,
                    backdropFilter: 'blur(4px)',
                    position:      'relative',
                }}>
                    {/* Panel trái */}
                    <div style={{
                        flex:       1,
                        background: 'rgba(8,8,8,0.88)',
                        display:    'flex',
                        flexDirection: 'column',
                        position:   'relative',
                    }}>
                        {/* Label trái */}
                        <div style={{
                            padding:    `${SPACE.gapLg}px ${SPACE.gap}px ${SPACE.gap}px ${SPACE.gapLg}px`,
                            transform:  `translateY(${badgeTy}px)`,
                            opacity:    labelOpacity,
                        }}>
                            <span style={{
                                fontFamily:    sansFont,
                                fontSize:      `${TYPE.caption.size}px`,
                                fontWeight:    700,
                                letterSpacing: '3px',
                                color:         COLOR.textMuted,
                                display:       'block',
                            }}>
                                {left_label}
                            </span>
                            <div style={{
                                marginTop: '6px',
                                width: '36px',
                                height: '2px',
                                background: COLOR.textMuted,
                                borderRadius: '1px',
                            }} />
                        </div>

                        {/* Content trái */}
                        <div style={{
                            flex:        1,
                            display:     'flex',
                            alignItems:  'center',
                            paddingLeft:  `${SPACE.gapLg}px`,
                            paddingRight: `${SPACE.gap}px`,
                            paddingBottom: `${SPACE.gapLg}px`,
                        }}>
                            <AnimatedLines
                                lines={leftLines}
                                direction="left"
                                color={COLOR.white}
                                sub={left_sub}
                                subColor={COLOR.textSecondary}
                            />
                        </div>
                    </div>

                    {/* Divider — wipe từ trên xuống */}
                    <div style={{ width: '3px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                            position:   'absolute',
                            top:        0,
                            left:       0,
                            width:      '100%',
                            height:     `${dividerHeight}%`,
                            background: `linear-gradient(to bottom, ${brandAccent}, ${brandAccent}55)`,
                            boxShadow:  `0 0 12px ${brandAccent}99`,
                        }} />
                        {/* Glow dot at tip */}
                        {dividerHeight > 5 && (
                            <div style={{
                                position:     'absolute',
                                left:         '50%',
                                top:          `${dividerHeight}%`,
                                width:        '12px',
                                height:       '12px',
                                borderRadius: '50%',
                                background:   brandAccent,
                                transform:    'translate(-50%, -50%)',
                                boxShadow:    `0 0 18px ${brandAccent}`,
                            }} />
                        )}
                    </div>

                    {/* Panel phải */}
                    <div style={{
                        flex:       1,
                        background: 'rgba(6,10,4,0.88)',
                        display:    'flex',
                        flexDirection: 'column',
                        position:   'relative',
                    }}>
                        {/* Accent tint overlay */}
                        <div style={{
                            position: 'absolute',
                            inset:    0,
                            background: `${brandAccent}12`,
                            pointerEvents: 'none',
                        }} />

                        {/* Label phải */}
                        <div style={{
                            padding:   `${SPACE.gapLg}px ${SPACE.gapLg}px ${SPACE.gap}px ${SPACE.gap}px`,
                            transform: `translateY(${badgeTy}px)`,
                            opacity:   labelOpacity,
                            textAlign: 'right',
                        }}>
                            <span style={{
                                fontFamily:    sansFont,
                                fontSize:      `${TYPE.caption.size}px`,
                                fontWeight:    700,
                                letterSpacing: '3px',
                                color:         brandAccent,
                                display:       'block',
                            }}>
                                {right_label}
                            </span>
                            <div style={{
                                marginTop:  '6px',
                                width:      '36px',
                                height:     '2px',
                                background: brandAccent,
                                borderRadius: '1px',
                                marginLeft: 'auto',
                            }} />
                        </div>

                        {/* Content phải */}
                        <div style={{
                            flex:        1,
                            display:     'flex',
                            alignItems:  'center',
                            paddingLeft:  `${SPACE.gap}px`,
                            paddingRight: `${SPACE.gapLg}px`,
                            paddingBottom: `${SPACE.gapLg}px`,
                            position:    'relative',
                        }}>
                            <AnimatedLines
                                lines={rightLines}
                                direction="right"
                                color={brandAccent}
                                sub={right_sub}
                                subColor={`${brandAccent}aa`}
                            />
                        </div>
                    </div>
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
