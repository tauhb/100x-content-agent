import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { SceneBg, AccentBar, TIMING, SPRING, SPACE, COLOR, TYPE, Z } from '../../foundation';

/**
 * SETUP_STAT_BURST — Nhiều con số nổ ra từ tâm
 *
 * Archetype: SETUP_STAT_BURST
 * Act: 2 — SETUP
 *
 * Design rules:
 *   - 3-4 stats trong grid 2×2
 *   - Mỗi stat card spring ra từ tâm màn hình đến vị trí đích
 *   - Scale + opacity animate cùng lúc
 *   - Nền card với border brandAccent nhẹ, glow drop-shadow
 *   - Value lớn brandAccent, label nhỏ textSecondary
 *
 * Ví dụ Director JSON:
 * {
 *   "archetype": "SETUP_STAT_BURST",
 *   "scene_rhythm": "medium",
 *   "voice_text": "Những con số nói lên tất cả về sự khác biệt.",
 *   "props": {
 *     "headline": "Sự Khác Biệt Rõ Ràng",
 *     "stats": [
 *       { "value": "97%", "label": "Người không đạt mục tiêu" },
 *       { "value": "3%", "label": "Làm điều khác biệt" },
 *       { "value": "10×", "label": "Kết quả vượt trội" },
 *       { "value": "90 ngày", "label": "Để thay đổi hoàn toàn" }
 *     ],
 *     "brandAccent": "#B6FF00"
 *   }
 * }
 */

interface BurstStat {
    value: string;
    label: string;
}

interface SetupStatBurstProps {
    headline?: string;
    stats?: BurstStat[];
    brandAccent?: string;
}

export const SetupStatBurst: React.FC<SetupStatBurstProps> = ({
    headline    = 'Sự Khác Biệt Rõ Ràng',
    stats       = [
        { value: '97%', label: 'Người không đạt mục tiêu' },
        { value: '3%', label: 'Làm điều khác biệt' },
        { value: '10×', label: 'Kết quả vượt trội' },
        { value: '90 ngày', label: 'Để thay đổi hoàn toàn' },
    ],
    brandAccent = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: sansFont } = loadInter();

    const safeStats = stats.slice(0, 4);

    // ── Headline ─────────────────────────────────────────────
    const hlSp = spring({ frame: Math.max(0, frame), fps, config: SPRING.snappy });
    const hlTy = interpolate(hlSp, [0, 1], [-40, 0]);
    const hlOp = interpolate(hlSp, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

    // Grid 2×2 offsets — final positions relative to grid center
    // Cards burst from 0,0 to their grid position
    // Approximate card size: ~380px wide, ~280px tall
    const cardW = 380;
    const cardH = 280;
    const gridGap = SPACE.gap;
    // finalX/Y are the horizontal/vertical distances from the grid center to each card center
    const halfW = (cardW + gridGap) / 2;
    const halfH = (cardH + gridGap) / 2;
    const offsets = [
        { finalX: -halfW, finalY: -halfH }, // top-left
        { finalX:  halfW, finalY: -halfH }, // top-right
        { finalX: -halfW, finalY:  halfH }, // bottom-left
        { finalX:  halfW, finalY:  halfH }, // bottom-right
    ];

    return (
        <AbsoluteFill>
            <SceneBg.Dark />

            {/* Ambient glow center */}
            <AbsoluteFill style={{
                background: `radial-gradient(ellipse at 50% 55%, ${brandAccent}0a 0%, transparent 65%)`,
                pointerEvents: 'none',
            }} />

            <AbsoluteFill style={{
                justifyContent: 'center',
                alignItems:     'center',
                paddingTop:     SPACE.safeTop,
                paddingBottom:  SPACE.safeBottom,
                paddingLeft:    SPACE.padH,
                paddingRight:   SPACE.padH,
                flexDirection:  'column',
                zIndex:         Z.content,
                gap:            `${SPACE.gapLg}px`,
            }}>

                {/* ── Headline ── */}
                <div style={{
                    transform:  `translateY(${hlTy}px)`,
                    opacity:    hlOp,
                    textAlign:  'center',
                    width:      '100%',
                }}>
                    <span style={{
                        fontFamily:    sansFont,
                        fontSize:      `${TYPE.title.size}px`,
                        fontWeight:    TYPE.title.weight,
                        letterSpacing: `${TYPE.title.tracking}px`,
                        lineHeight:    TYPE.title.lineHeight,
                        color:         COLOR.white,
                        display:       'block',
                        marginBottom:  `${SPACE.gap}px`,
                    }}>
                        {headline}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <AccentBar
                            direction="horizontal"
                            width="80px"
                            thickness={4}
                            color={brandAccent}
                            animate
                            delay={TIMING.snap}
                            duration={TIMING.fast}
                            glow
                            radius={2}
                        />
                    </div>
                </div>

                {/* ── Stats grid 2×2 ── */}
                <div style={{
                    display:             'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap:                 `${gridGap}px`,
                    width:               '100%',
                    position:            'relative',
                }}>
                    {safeStats.map((stat, i) => {
                        const delay = 8 + i * 6;
                        const spCard = spring({ frame: Math.max(0, frame - delay), fps, config: SPRING.bouncy });

                        const off = offsets[i] ?? { finalX: 0, finalY: 0 };
                        const tx = interpolate(spCard, [0, 1], [-off.finalX, 0]);
                        const ty = interpolate(spCard, [0, 1], [-off.finalY, 0]);
                        const sc = interpolate(spCard, [0, 1], [0.2, 1]);

                        // Opacity: 0→1 in first 5 frames after delay
                        const op = interpolate(
                            Math.max(0, frame - delay),
                            [0, 5],
                            [0, 1],
                            { extrapolateRight: 'clamp' },
                        );

                        return (
                            <div
                                key={i}
                                style={{
                                    transform:  `translate(${tx}px, ${ty}px) scale(${sc})`,
                                    opacity:    op,
                                    filter:     `drop-shadow(0 0 20px ${brandAccent}44)`,
                                    background: `${brandAccent}15`,
                                    border:     `2px solid ${brandAccent}44`,
                                    borderRadius: '20px',
                                    padding:    '40px 30px',
                                    display:    'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap:        `${SPACE.gapSm}px`,
                                    minHeight:  `${cardH}px`,
                                }}
                            >
                                <span style={{
                                    fontFamily:    sansFont,
                                    fontSize:      `${TYPE.hero.size}px`,
                                    fontWeight:    900,
                                    color:         brandAccent,
                                    letterSpacing: `${TYPE.hero.tracking}px`,
                                    lineHeight:    1,
                                    display:       'block',
                                    textAlign:     'center',
                                }}>
                                    {stat.value}
                                </span>
                                <span style={{
                                    fontFamily:    sansFont,
                                    fontSize:      `${TYPE.caption.size}px`,
                                    fontWeight:    400,
                                    color:         COLOR.textSecondary,
                                    letterSpacing: `${TYPE.caption.tracking}px`,
                                    lineHeight:    TYPE.caption.lineHeight,
                                    display:       'block',
                                    textAlign:     'center',
                                }}>
                                    {stat.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
