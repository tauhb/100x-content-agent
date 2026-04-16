import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { SceneBg, TIMING, SPRING, SPACE, COLOR, TYPE, Z } from '../../foundation';

/**
 * BODY_BEFORE_AFTER — Màn hình chia đôi Trước / Sau (Boxed version)
 *
 * Design rules:
 *   - Nền đen mờ toàn màn hình (ambient broll thấy qua)
 *   - Box trung tâm bọc cả 2 panel, có border mờ
 *   - Divider line dọc chia đôi box
 *   - Font nhỏ hơn — caption/small size
 */

interface BeforeAfterSide {
    label?: string;
    headline: string;
    items?: string[];
    accent?: boolean;
}

interface BodyBeforeAfterProps {
    before?: BeforeAfterSide;
    after?: BeforeAfterSide;
    brandAccent?: string;
}

const PAIN_COLOR = '#FF4444';

// Box dimensions — để lộ nền qua padding
const BOX_PAD_H   = SPACE.padH;
const BOX_PAD_TOP = SPACE.safeTop + 60;
const BOX_PAD_BOT = SPACE.safeBottom + 60;

export const BodyBeforeAfter: React.FC<BodyBeforeAfterProps> = ({
    before = {
        label:    'TRƯỚC',
        headline: 'Làm việc cực nhọc',
        items:    ['Không có hệ thống', 'Mất 10 tiếng/ngày', 'Thu nhập giậm chân'],
    },
    after = {
        label:    'SAU',
        headline: 'Làm việc thông minh',
        items:    ['Hệ thống tự động', 'Chỉ 4 tiếng/ngày', 'Thu nhập ×3'],
        accent:   true,
    },
    brandAccent = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: sansFont } = loadInter();

    // Font sizes — nhỏ hơn để khớp với box compact
    const FS_LABEL    = TYPE.caption.size * 0.82;  // ~23px
    const FS_HEADLINE = TYPE.body.size * 0.88;     // ~35px
    const FS_ITEM     = TYPE.caption.size * 0.92;  // ~26px

    // Badge entrance
    const badgeSp = spring({ frame: Math.max(0, frame - TIMING.snap), fps, config: SPRING.bouncy });
    const badgeTy = interpolate(badgeSp, [0, 1], [-24, 0]);
    const badgeOp = interpolate(badgeSp, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });

    const itemStart   = TIMING.fast + TIMING.medium;
    const itemStagger = TIMING.stagger;

    const renderSide = (side: BeforeAfterSide, isAfter: boolean) => {
        const labelColor = isAfter ? brandAccent : PAIN_COLOR;
        const prefix     = isAfter ? '✓' : '×';

        return (
            <div style={{
                flex:          1,
                display:       'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding:       `${SPACE.gapLg}px ${SPACE.gap}px`,
            }}>
                {/* Label badge */}
                {side.label && (
                    <div style={{ transform: `translateY(${badgeTy}px)`, opacity: badgeOp, marginBottom: SPACE.gapSm }}>
                        <span style={{
                            display:       'inline-block',
                            fontFamily:    sansFont,
                            fontSize:      `${FS_LABEL}px`,
                            fontWeight:    800,
                            letterSpacing: '3px',
                            textTransform: 'uppercase',
                            color:         labelColor,
                        }}>
                            {side.label}
                        </span>
                    </div>
                )}

                {/* Headline */}
                {(() => {
                    const sp = spring({ frame: Math.max(0, frame - TIMING.snap), fps, config: SPRING.normal });
                    const ty = interpolate(sp, [0, 1], [16, 0]);
                    const op = interpolate(sp, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });
                    return (
                        <div style={{ transform: `translateY(${ty}px)`, opacity: op, marginBottom: SPACE.gap }}>
                            <span style={{
                                fontFamily: sansFont,
                                fontSize:   `${FS_HEADLINE}px`,
                                fontWeight: 700,
                                color:      isAfter ? COLOR.white : COLOR.textSecondary,
                                lineHeight: 1.25,
                                display:    'block',
                            }}>
                                {side.headline}
                            </span>
                        </div>
                    );
                })()}

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(side.items ?? []).map((item, i) => {
                        const delay = itemStart + i * itemStagger;
                        const sp    = spring({ frame: Math.max(0, frame - delay), fps, config: SPRING.normal });
                        const ty    = interpolate(sp, [0, 1], [14, 0]);
                        const op    = interpolate(sp, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });
                        return (
                            <div key={i} style={{
                                transform:  `translateY(${ty}px)`,
                                opacity:    op,
                                display:    'flex',
                                alignItems: 'flex-start',
                                gap:        '8px',
                            }}>
                                <span style={{
                                    fontFamily: sansFont,
                                    fontSize:   `${FS_ITEM * 0.88}px`,
                                    fontWeight: 700,
                                    color:      labelColor,
                                    lineHeight: 1.4,
                                    flexShrink: 0,
                                    marginTop:  '1px',
                                    ...(isAfter ? { textShadow: `0 0 6px ${brandAccent}88` } : {}),
                                }}>{prefix}</span>
                                <span style={{
                                    fontFamily: sansFont,
                                    fontSize:   `${FS_ITEM}px`,
                                    fontWeight: 400,
                                    color:      isAfter ? 'rgba(255,255,255,0.88)' : COLOR.textMuted,
                                    lineHeight: 1.4,
                                }}>
                                    {item}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <AbsoluteFill>
            <SceneBg.Dark />

            {/* Dark overlay — để ambient broll thấy qua mờ bên ngoài box */}
            <AbsoluteFill style={{ background: 'rgba(0,0,0,0.55)' }} />

            {/* Box container — để hở nền 4 phía */}
            <AbsoluteFill style={{
                padding:       `${BOX_PAD_TOP}px ${BOX_PAD_H}px ${BOX_PAD_BOT}px`,
                zIndex:        Z.content,
                justifyContent: 'center',
                alignItems:    'center',
            }}>
                <div style={{
                    width:           '100%',
                    height:          '100%',
                    display:         'flex',
                    flexDirection:   'row',
                    borderRadius:    '20px',
                    overflow:        'hidden',
                    border:          `1px solid rgba(255,255,255,0.08)`,
                    backdropFilter:  'blur(2px)',
                }}>
                    {/* BEFORE half */}
                    <div style={{
                        flex:       1,
                        background: 'rgba(10,10,10,0.85)',
                        display:    'flex',
                    }}>
                        {renderSide(before, false)}
                    </div>

                    {/* Divider */}
                    <div style={{
                        width:      '3px',
                        flexShrink: 0,
                        background: `linear-gradient(to bottom, transparent, ${brandAccent}, transparent)`,
                        boxShadow:  `0 0 16px ${brandAccent}88`,
                    }} />

                    {/* AFTER half */}
                    <div style={{
                        flex:       1,
                        background: `rgba(8,12,6,0.85)`,
                        display:    'flex',
                        position:   'relative',
                    }}>
                        {/* Accent tint */}
                        <div style={{
                            position:   'absolute',
                            inset:      0,
                            background: `${brandAccent}14`,
                            pointerEvents: 'none',
                        }} />
                        {renderSide(after, true)}
                    </div>
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
