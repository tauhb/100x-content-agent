import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { SceneBg, CountUp, AccentBar, TIMING, SPRING, SPACE, COLOR, TYPE, Z } from '../../foundation';

/**
 * SETUP_STAT — Số liệu gây chấn động
 *
 * Archetype: SETUP_STAT
 * Act: 2 — SETUP
 *
 * Design rules:
 *   - Nền đen, số to animate CountUp ở trung tâm
 *   - Prefix/suffix scale nhỏ hơn để số hero nổi bật
 *   - Context text xuất hiện sau khi số đếm xong
 *   - Optional: 2–3 stat nhỏ phụ dạng row ở dưới
 *   - AccentBar wipe dưới số chính
 *
 * Ví dụ Director JSON:
 * {
 *   "archetype": "SETUP_STAT",
 *   "scene_rhythm": "slow",
 *   "voice_text": "97% người bắt đầu kinh doanh online thất bại trong năm đầu.",
 *   "props": {
 *     "stat": 97,
 *     "suffix": "%",
 *     "label": "người thất bại\ntrong năm đầu",
 *     "context": "Không phải vì thiếu vốn — mà vì thiếu hướng đi đúng.",
 *     "sub_stats": [
 *       { "value": "3x", "label": "chi phí tăng" },
 *       { "value": "6th", "label": "thường bỏ cuộc" }
 *     ]
 *   }
 * }
 */

interface SubStat {
    value: string;
    label: string;
}

interface SetupStatProps {
    stat?:        number;
    suffix?:      string;
    prefix?:      string;
    label?:       string;
    context?:     string;
    sub_stats?:   SubStat[];
    bg?:          'black' | 'dark';
    brandAccent?: string;
}

export const SetupStat: React.FC<SetupStatProps> = ({
    stat        = 97,
    suffix      = '%',
    prefix      = '',
    label       = 'người thất bại\ntrong năm đầu',
    context     = '',
    sub_stats   = [],
    bg          = 'black',
    brandAccent = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: sansFont } = loadInter();

    const labelLines = label.split('\n').filter(Boolean);

    // Số đếm kéo dài TIMING.slow * 2 frames (~1.6s)
    const countDuration = TIMING.slow * 2;

    // Context xuất hiện sau khi số đếm xong
    const contextDelay = countDuration + TIMING.fast;

    // Sub-stats xuất hiện sau context
    const subDelay = contextDelay + TIMING.medium;

    // ── Label animation (stagger từng dòng) ──────────────────
    const AnimatedLabel: React.FC<{ line: string; i: number }> = ({ line, i }) => {
        const delay = TIMING.snap + i * TIMING.stagger;
        const sp = spring({ frame: Math.max(0, frame - delay), fps, config: SPRING.snappy });
        const ty      = interpolate(sp, [0, 1], [30, 0]);
        const opacity = interpolate(sp, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });
        return (
            <div style={{ transform: `translateY(${ty}px)`, opacity }}>
                <span style={{
                    fontFamily:    sansFont,
                    fontSize:      `${TYPE.title.size}px`,
                    fontWeight:    TYPE.title.weight,
                    letterSpacing: `${TYPE.title.tracking}px`,
                    lineHeight:    TYPE.title.lineHeight,
                    color:         COLOR.textSecondary,
                    display:       'block',
                    textAlign:     'center',
                }}>
                    {line}
                </span>
            </div>
        );
    };

    // ── Context text ──────────────────────────────────────────
    const contextSp = spring({ frame: Math.max(0, frame - contextDelay), fps, config: SPRING.gentle });
    const contextOpacity = interpolate(contextSp, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
    const contextTy      = interpolate(contextSp, [0, 1], [20, 0]);

    return (
        <AbsoluteFill>
            {bg === 'dark' ? <SceneBg.Dark /> : <SceneBg.Black />}

            <AbsoluteFill style={{
                justifyContent: 'center',
                alignItems:     'center',
                paddingTop:     SPACE.safeTop,
                paddingBottom:  SPACE.safeBottom,
                zIndex:         Z.content,
                paddingLeft:    SPACE.padH,
                paddingRight:   SPACE.padH,
                flexDirection:  'column',
                gap:            '0',
            }}>

                {/* ── Số hero ── */}
                <div style={{ textAlign: 'center', lineHeight: 1 }}>
                    <CountUp
                        from={0}
                        to={stat}
                        prefix={prefix}
                        suffix={suffix}
                        level="display"
                        color={brandAccent}
                        duration={countDuration}
                        delay={0}
                        easing="spring-snap"
                        glow
                        style={{ justifyContent: 'center' }}
                    />
                </div>

                {/* ── AccentBar dưới số ── */}
                <div style={{ width: '200px', marginTop: '8px', marginBottom: `${SPACE.gap}px` }}>
                    <AccentBar
                        direction="horizontal"
                        width="100%"
                        thickness={4}
                        color={brandAccent}
                        animate
                        delay={TIMING.snap}
                        duration={TIMING.medium}
                        glow
                        radius={2}
                    />
                </div>

                {/* ── Label dòng ── */}
                <div style={{ textAlign: 'center', marginBottom: `${SPACE.gapLg}px` }}>
                    {labelLines.map((line, i) => (
                        <AnimatedLabel key={i} line={line} i={i} />
                    ))}
                </div>

                {/* ── Context text ── */}
                {context && (
                    <div style={{
                        transform:   `translateY(${contextTy}px)`,
                        opacity:     contextOpacity,
                        maxWidth:    '820px',
                        textAlign:   'center',
                        marginBottom: sub_stats.length > 0 ? `${SPACE.gapLg}px` : '0',
                    }}>
                        <span style={{
                            fontFamily:    sansFont,
                            fontSize:      `${TYPE.body.size}px`,
                            fontWeight:    400,
                            letterSpacing: `${TYPE.body.tracking}px`,
                            lineHeight:    TYPE.body.lineHeight,
                            color:         COLOR.textSecondary,
                        }}>
                            {context}
                        </span>
                    </div>
                )}

                {/* ── Sub-stats row ── */}
                {sub_stats.length > 0 && (
                    <div style={{
                        display:        'flex',
                        flexDirection:  'row',
                        gap:            `${SPACE.gapLg}px`,
                        justifyContent: 'center',
                    }}>
                        {sub_stats.map((s, i) => {
                            const delay = subDelay + i * TIMING.stagger;
                            const sp = spring({ frame: Math.max(0, frame - delay), fps, config: SPRING.normal });
                            const opacity = interpolate(sp, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
                            const ty      = interpolate(sp, [0, 1], [20, 0]);

                            return (
                                <div
                                    key={i}
                                    style={{
                                        transform:  `translateY(${ty}px)`,
                                        opacity,
                                        textAlign:  'center',
                                        padding:    `${SPACE.gap}px ${SPACE.gapLg}px`,
                                        border:     `1px solid ${brandAccent}33`,
                                        borderRadius: '12px',
                                        background:   `${brandAccent}08`,
                                    }}
                                >
                                    <span style={{
                                        fontFamily:    sansFont,
                                        fontSize:      `${TYPE.hero.size * 0.6}px`,
                                        fontWeight:    900,
                                        color:         brandAccent,
                                        display:       'block',
                                        lineHeight:    1,
                                        letterSpacing: '-1px',
                                    }}>
                                        {s.value}
                                    </span>
                                    <span style={{
                                        fontFamily: sansFont,
                                        fontSize:   `${TYPE.caption.size}px`,
                                        fontWeight: 400,
                                        color:      COLOR.textMuted,
                                        display:    'block',
                                        marginTop:  `${SPACE.gapSm}px`,
                                    }}>
                                        {s.label}
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
