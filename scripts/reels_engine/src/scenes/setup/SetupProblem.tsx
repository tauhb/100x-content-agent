import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { SceneBg, AccentBar, TIMING, SPRING, SPACE, COLOR, TYPE, Z } from '../../foundation';

/**
 * SETUP_PROBLEM — Nêu vấn đề rõ ràng
 *
 * Archetype: SETUP_PROBLEM
 * Act: 2 — SETUP
 *
 * Design rules:
 *   - Nền dark
 *   - Tag nhỏ "VẤN ĐỀ" / label tuỳ chọn xuất hiện trước
 *   - Headline lớn với từ khoá đau màu accent/đỏ
 *   - Pain points list — mỗi cái bắt đầu bằng icon "✗" màu đỏ, slide vào từ trái
 *   - Optional solution_hint ở cuối (màu accent, kèm dấu →)
 *
 * Ví dụ Director JSON:
 * {
 *   "archetype": "SETUP_PROBLEM",
 *   "scene_rhythm": "medium",
 *   "voice_text": "Hầu hết mọi người tạo content mà không hiểu tại sao nó không work.",
 *   "props": {
 *     "tag": "VẤN ĐỀ",
 *     "headline": "Content của bạn\nkhông ai xem?",
 *     "pains": [
 *       "Đăng đều nhưng view không tăng",
 *       "Không biết content nào sẽ viral",
 *       "Mất hàng giờ mà kết quả zero"
 *     ],
 *     "solution_hint": "Có cách để fix điều này."
 *   }
 * }
 */

interface SetupProblemProps {
    tag?:             string;
    headline?:        string;
    pains?:           string[];
    solution_hint?:   string;
    pain_color?:      string;
    bg?:              'black' | 'dark';
    brandAccent?:     string;
}

export const SetupProblem: React.FC<SetupProblemProps> = ({
    tag           = 'VẤN ĐỀ',
    headline      = 'Content của bạn\nkhông ai xem?',
    pains         = [
        'Đăng đều nhưng view không tăng',
        'Không biết content nào sẽ viral',
        'Mất hàng giờ mà kết quả zero',
    ],
    solution_hint = '',
    pain_color    = '#FF4444',
    bg            = 'dark',
    brandAccent   = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: sansFont } = loadInter();

    const headlineLines = headline.split('\n').filter(Boolean);

    // ── Timing ────────────────────────────────────────────────
    const tagDelay      = 0;
    const headlineDelay = TIMING.snap;
    const painsStart    = TIMING.fast + TIMING.snap;
    const painStagger   = TIMING.fast;
    const hintDelay     = painsStart + pains.length * painStagger + TIMING.medium;

    // ── Tag ───────────────────────────────────────────────────
    const tagSp = spring({ frame: Math.max(0, frame - tagDelay), fps, config: SPRING.snappy });
    const tagOpacity = interpolate(tagSp, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
    const tagTy      = interpolate(tagSp, [0, 1], [-20, 0]);

    // ── Solution hint ─────────────────────────────────────────
    const hintSp = spring({ frame: Math.max(0, frame - hintDelay), fps, config: SPRING.normal });
    const hintOpacity = interpolate(hintSp, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
    const hintTy      = interpolate(hintSp, [0, 1], [20, 0]);

    return (
        <AbsoluteFill>
            {bg === 'dark' ? <SceneBg.Dark warm /> : <SceneBg.Black />}

            {/* Red glow top-left — psychological tension */}
            <AbsoluteFill style={{
                background: `radial-gradient(ellipse at 20% 20%, ${pain_color}10 0%, transparent 55%)`,
                pointerEvents: 'none',
            }} />

            <AbsoluteFill style={{
                justifyContent: 'center',
                alignItems:     'flex-start',
                paddingTop:     SPACE.safeTop,
                paddingBottom:  SPACE.safeBottom,
                zIndex:         Z.content,
                paddingLeft:    SPACE.padH,
                paddingRight:   SPACE.padH,
                flexDirection:  'column',
            }}>

                {/* ── Tag label ── */}
                {tag && (
                    <div style={{
                        transform:     `translateY(${tagTy}px)`,
                        opacity:       tagOpacity,
                        marginBottom:  `${SPACE.gap}px`,
                        display:       'flex',
                        alignItems:    'center',
                        gap:           `${SPACE.gapSm}px`,
                    }}>
                        {/* Dot indicator */}
                        <div style={{
                            width:        '10px',
                            height:       '10px',
                            borderRadius: '50%',
                            background:   pain_color,
                            boxShadow:    `0 0 10px ${pain_color}`,
                            flexShrink:   0,
                        }} />
                        <span style={{
                            fontFamily:    sansFont,
                            fontSize:      `${TYPE.caption.size}px`,
                            fontWeight:    700,
                            letterSpacing: '3px',
                            color:         pain_color,
                            textTransform: 'none',
                        }}>
                            {tag}
                        </span>
                    </div>
                )}

                {/* ── Headline ── */}
                <div style={{ marginBottom: `${SPACE.gapLg}px` }}>
                    {headlineLines.map((line, i) => {
                        const delay = headlineDelay + i * TIMING.stagger;
                        const sp = spring({ frame: Math.max(0, frame - delay), fps, config: SPRING.snappy });
                        const ty      = interpolate(sp, [0, 1], [50, 0]);
                        const opacity = interpolate(sp, [0, 0.25], [0, 1], { extrapolateRight: 'clamp' });

                        return (
                            <div key={i} style={{ transform: `translateY(${ty}px)`, opacity }}>
                                <span style={{
                                    fontFamily:    sansFont,
                                    fontSize:      `${TYPE.hero.size}px`,
                                    fontWeight:    TYPE.hero.weight,
                                    letterSpacing: `${TYPE.hero.tracking}px`,
                                    lineHeight:    TYPE.hero.lineHeight,
                                    color:         COLOR.white,
                                    display:       'block',
                                }}>
                                    {line}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* ── Pain points ── */}
                <div style={{
                    width:         '100%',
                    display:       'flex',
                    flexDirection: 'column',
                    gap:           `${SPACE.gap}px`,
                    marginBottom:  `${SPACE.gapLg}px`,
                }}>
                    {pains.map((pain, i) => {
                        const delay = painsStart + i * painStagger;
                        const sp = spring({ frame: Math.max(0, frame - delay), fps, config: SPRING.normal });
                        const tx      = interpolate(sp, [0, 1], [-50, 0]);
                        const opacity = interpolate(sp, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

                        return (
                            <div
                                key={i}
                                style={{
                                    transform:      `translateX(${tx}px)`,
                                    opacity,
                                    display:        'flex',
                                    flexDirection:  'row',
                                    alignItems:     'flex-start',
                                    gap:            `${SPACE.gap}px`,
                                    padding:        `${SPACE.gap}px ${SPACE.gap}px`,
                                    background:     `${pain_color}0d`,
                                    border:         `1px solid ${pain_color}22`,
                                    borderLeft:     `3px solid ${pain_color}`,
                                    borderRadius:   '8px',
                                }}
                            >
                                {/* ✗ icon */}
                                <span style={{
                                    fontFamily:  sansFont,
                                    fontSize:    `${TYPE.body.size}px`,
                                    fontWeight:  700,
                                    color:       pain_color,
                                    lineHeight:  1.35,
                                    flexShrink:  0,
                                }}>
                                    ✗
                                </span>
                                <span style={{
                                    fontFamily:    sansFont,
                                    fontSize:      `${TYPE.body.size}px`,
                                    fontWeight:    500,
                                    letterSpacing: `${TYPE.body.tracking}px`,
                                    lineHeight:    TYPE.body.lineHeight,
                                    color:         COLOR.textSecondary,
                                }}>
                                    {pain}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* ── AccentBar divider ── */}
                {solution_hint && (
                    <div style={{ marginBottom: `${SPACE.gap}px`, width: '100%' }}>
                        <AccentBar
                            direction="horizontal"
                            width="100%"
                            thickness={1}
                            color={`${COLOR.white}22`}
                            animate
                            delay={hintDelay - TIMING.snap}
                            duration={TIMING.fast}
                            radius={1}
                        />
                    </div>
                )}

                {/* ── Solution hint ── */}
                {solution_hint && (
                    <div style={{
                        transform:    `translateY(${hintTy}px)`,
                        opacity:      hintOpacity,
                        display:      'flex',
                        alignItems:   'center',
                        gap:          `${SPACE.gapSm}px`,
                    }}>
                        <span style={{
                            fontFamily:    sansFont,
                            fontSize:      `${TYPE.body.size}px`,
                            fontWeight:    600,
                            letterSpacing: '0px',
                            color:         brandAccent,
                        }}>
                            {solution_hint}
                        </span>
                        <span style={{
                            fontFamily:  sansFont,
                            fontSize:    `${TYPE.body.size}px`,
                            fontWeight:  700,
                            color:       brandAccent,
                        }}>
                            →
                        </span>
                    </div>
                )}
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
