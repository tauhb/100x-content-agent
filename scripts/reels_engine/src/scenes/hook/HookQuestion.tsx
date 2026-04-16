import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadPlayfair } from '@remotion/google-fonts/PlayfairDisplay';
import { SceneBg, TIMING, SPRING, SPACE, COLOR, TYPE, Z } from '../../foundation';

/**
 * HOOK_QUESTION — Câu hỏi kích thích tò mò
 *
 * Archetype: HOOK_QUESTION
 * Act: 1 — HOOK
 *
 * Design rules:
 *   - Nền tối (dark gradient) hoặc đen tuỳ chọn
 *   - Dấu "?" khổng lồ màu accent xuất hiện trước với bounce
 *   - Câu hỏi chính xuất hiện từng line với stagger
 *   - Sub-question nhỏ hơn ở dưới (tuỳ chọn)
 *   - Không có ảnh/video nền
 *
 * Props:
 *   question:     Câu hỏi chính (có thể nhiều dòng, tách bằng \n)
 *   sub:          Dòng phụ nhỏ ở dưới
 *   show_mark:    Hiển thị dấu ? to (mặc định: true)
 *   mark_pos:     'top' | 'left' — vị trí dấu hỏi
 *   bg:           'dark' | 'black'
 *   brandAccent:  Màu accent
 *
 * Ví dụ Director JSON:
 * {
 *   "archetype": "HOOK_QUESTION",
 *   "scene_rhythm": "medium",
 *   "voice_text": "Bạn có biết tại sao 97% người không bao giờ giàu không?",
 *   "props": {
 *     "question": "Tại sao 97%\nkhông bao giờ\ngiàu?",
 *     "sub": "Câu trả lời sẽ thay đổi cách bạn nhìn về tiền.",
 *     "show_mark": true,
 *     "mark_pos": "top"
 *   }
 * }
 */

interface HookQuestionProps {
    question?:    string;
    sub?:         string;
    show_mark?:   boolean;
    mark_pos?:    'top' | 'left';
    bg?:          'dark' | 'black';
    brandAccent?: string;
}

export const HookQuestion: React.FC<HookQuestionProps> = ({
    question = 'Tại sao 97%\nkhông bao giờ\ngiàu?',
    sub = '',
    show_mark = true,
    mark_pos = 'top',
    bg = 'dark',
    brandAccent = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: sansFont }  = loadInter();
    const { fontFamily: serifFont } = loadPlayfair();

    const lines = question.split('\n').filter(Boolean);

    // ── Dấu ? bounce entrance ─────────────────────────────────
    const markSp = spring({
        frame: Math.max(0, frame),
        fps,
        config: SPRING.bouncy,
    });
    const markScale   = interpolate(markSp, [0, 1], [0.3, 1]);
    const markOpacity = interpolate(markSp, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

    // Dấu ? xong rồi mới hiện chữ — delay bằng TIMING.medium
    const textStartFrame = TIMING.medium;

    // ── Layout: mark_pos = 'top' ──────────────────────────────
    // Dấu ? ở trên, chữ dưới (căn giữa toàn bộ)
    const isTop = mark_pos === 'top';

    return (
        <AbsoluteFill>
            {bg === 'dark' ? <SceneBg.Dark /> : <SceneBg.Black />}

            <AbsoluteFill style={{
                justifyContent: 'center',
                alignItems: isTop ? 'center' : 'flex-start',
                paddingTop: SPACE.safeTop,
                paddingBottom: SPACE.safeBottom,
                zIndex: Z.content,
                paddingLeft: SPACE.padH,
                paddingRight: SPACE.padH,
                flexDirection: isTop ? 'column' : 'row',
                gap: isTop ? '0' : `${SPACE.gapLg}px`,
            }}>

                {/* ── Dấu chấm hỏi ── */}
                {show_mark && isTop && (
                    <div style={{
                        transform: `scale(${markScale})`,
                        opacity: markOpacity,
                        textAlign: 'center',
                        marginBottom: '8px',
                        lineHeight: 1,
                    }}>
                        <span style={{
                            fontFamily:  serifFont,
                            fontSize:    '240px',
                            fontWeight:  700,
                            color:       brandAccent,
                            display:     'block',
                            lineHeight:  1,
                            textShadow:  `0 0 60px ${brandAccent}55, 0 0 120px ${brandAccent}22`,
                            fontStyle:   'italic',
                        }}>
                            ?
                        </span>
                    </div>
                )}

                {/* ── Dấu ? bên trái ── */}
                {show_mark && !isTop && (
                    <div style={{
                        transform: `scale(${markScale})`,
                        opacity: markOpacity,
                        flexShrink: 0,
                        alignSelf: 'center',
                    }}>
                        <span style={{
                            fontFamily:  serifFont,
                            fontSize:    '180px',
                            fontWeight:  700,
                            color:       brandAccent,
                            display:     'block',
                            lineHeight:  1,
                            textShadow:  `0 0 50px ${brandAccent}55, 0 0 100px ${brandAccent}22`,
                            fontStyle:   'italic',
                        }}>
                            ?
                        </span>
                    </div>
                )}

                {/* ── Lines câu hỏi ── */}
                <div style={{
                    display:       'flex',
                    flexDirection: 'column',
                    alignItems:    isTop ? 'center' : 'flex-start',
                    textAlign:     isTop ? 'center' : 'left',
                    gap:           '0',
                }}>
                    {lines.map((line, i) => {
                        const lineDelay = textStartFrame + i * TIMING.fast;
                        const sp = spring({
                            frame: Math.max(0, frame - lineDelay),
                            fps,
                            config: SPRING.snappy,
                        });

                        const ty      = interpolate(sp, [0, 1], [55, 0]);
                        const opacity = interpolate(sp, [0, 0.25], [0, 1], { extrapolateRight: 'clamp' });
                        const scaleX  = interpolate(sp, [0, 1], [0.94, 1]);

                        // Line cuối cùng → màu accent nếu kết thúc bằng dấu hỏi
                        const isLastLine = i === lines.length - 1;
                        const textColor  = isLastLine ? brandAccent : COLOR.white;
                        const glowStyle  = isLastLine
                            ? { textShadow: `0 0 40px ${brandAccent}66, 0 0 80px ${brandAccent}33` }
                            : {};

                        // Size: dòng 1 lớn hơn, dòng cuối trung bình
                        const sizeLevel = i === 0 ? TYPE.hero : TYPE.title;

                        return (
                            <div
                                key={i}
                                style={{
                                    transform: `translateY(${ty}px) scaleX(${scaleX})`,
                                    opacity,
                                    transformOrigin: isTop ? 'center bottom' : 'left bottom',
                                    marginBottom: i < lines.length - 1 ? '-4px' : '0',
                                }}
                            >
                                <span style={{
                                    fontFamily:    sansFont,
                                    fontSize:      `${sizeLevel.size}px`,
                                    fontWeight:    sizeLevel.weight,
                                    letterSpacing: `${sizeLevel.tracking}px`,
                                    lineHeight:    sizeLevel.lineHeight,
                                    color:         textColor,
                                    display:       'inline-block',
                                    ...glowStyle,
                                }}>
                                    {line}
                                </span>
                            </div>
                        );
                    })}

                    {/* Sub-question */}
                    {sub && (() => {
                        const subDelay = textStartFrame + lines.length * TIMING.fast + TIMING.snap;
                        const subSp = spring({
                            frame: Math.max(0, frame - subDelay),
                            fps,
                            config: SPRING.gentle,
                        });
                        const subOpacity = interpolate(subSp, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
                        const subTy      = interpolate(subSp, [0, 1], [20, 0]);

                        return (
                            <div style={{
                                marginTop:  `${SPACE.gap}px`,
                                transform:  `translateY(${subTy}px)`,
                                opacity:    subOpacity,
                            }}>
                                <span style={{
                                    fontFamily:    sansFont,
                                    fontSize:      `${TYPE.body.size}px`,
                                    fontWeight:    400,
                                    letterSpacing: `${TYPE.body.tracking}px`,
                                    lineHeight:    TYPE.body.lineHeight,
                                    color:         COLOR.textSecondary,
                                    display:       'block',
                                    maxWidth:      isTop ? '100%' : '560px',
                                }}>
                                    {sub}
                                </span>
                            </div>
                        );
                    })()}
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
