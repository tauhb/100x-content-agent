import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { SceneBg, AccentBar, TIMING, SPRING, SPACE, COLOR, TYPE, Z } from '../../foundation';

/**
 * LANDING_SUMMARY — Tóm tắt / kết luận dramatic
 *
 * Archetype: LANDING_SUMMARY
 * Act: 4 — LANDING
 *
 * Design rules:
 *   - Nền đen + radial glow accent lớn ở trung tâm
 *   - Label nhỏ "KẾT LUẬN" / "TÓM LẠI" ở trên
 *   - Headline lớn căn giữa, chữ to nhất scene — là TÓM TẮT cả video
 *   - Từ khoá accent highlight với glow mạnh
 *   - Sub-text nhỏ bên dưới xác nhận lại
 *   - AccentBar wipe dưới headline
 *
 * Ví dụ Director JSON:
 * {
 *   "archetype": "LANDING_SUMMARY",
 *   "scene_rhythm": "medium",
 *   "voice_text": "Tóm lại — kỷ luật không cần cảm hứng. Nó cần hệ thống.",
 *   "props": {
 *     "tag": "TÓM LẠI",
 *     "headline": "Kỷ luật không cần *cảm hứng* —\ncần *hệ thống*.",
 *     "sub": "Bắt đầu nhỏ. Lặp lại đủ lâu. Kết quả tự đến."
 *   }
 * }
 */

interface LandingSummaryProps {
    tag?:         string;
    headline?:    string;
    sub?:         string;
    align?:       'left' | 'center';
    bg?:          'black' | 'dark';
    brandAccent?: string;
}

export const LandingSummary: React.FC<LandingSummaryProps> = ({
    tag         = 'TÓM LẠI',
    headline    = '',
    sub,
    align       = 'center',
    bg          = 'black',
    brandAccent = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: sansFont } = loadInter();

    const isCenter = align === 'center';

    // ── Parse *highlight* syntax ──────────────────────────────
    const segments = parseHighlight(headline);
    const allWords: Array<{ word: string; accent: boolean; lineBreak?: boolean }> = [];
    segments.forEach(seg => {
        seg.text.split('\n').forEach((line, li, arr) => {
            line.split(' ').filter(Boolean).forEach(w => {
                allWords.push({ word: w, accent: seg.accent });
            });
            if (li < arr.length - 1) {
                allWords.push({ word: '\n', accent: false, lineBreak: true });
            }
        });
    });

    // ── Timing ────────────────────────────────────────────────
    const tagDelay  = 0;
    const textDelay = TIMING.fast;
    const barDelay  = TIMING.slow;
    const subDelay  = TIMING.slow + TIMING.fast;

    // ── Tag ───────────────────────────────────────────────────
    const tagSp = spring({ frame: Math.max(0, frame - tagDelay), fps, config: SPRING.snappy });
    const tagOp = interpolate(tagSp, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
    const tagTy = interpolate(tagSp, [0, 1], [-20, 0]);

    // ── Sub ───────────────────────────────────────────────────
    const subSp = spring({ frame: Math.max(0, frame - subDelay), fps, config: SPRING.gentle });
    const subOp = interpolate(subSp, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
    const subTy = interpolate(subSp, [0, 1], [24, 0]);

    return (
        <AbsoluteFill>
            {bg === 'dark' ? <SceneBg.Dark /> : <SceneBg.Black />}

            {/* Large center glow */}
            <AbsoluteFill style={{
                background: `radial-gradient(ellipse at 50% 50%, ${brandAccent}14 0%, transparent 65%)`,
                pointerEvents: 'none',
            }} />

            <AbsoluteFill style={{
                justifyContent: 'center',
                alignItems:     isCenter ? 'center' : 'flex-start',
                paddingTop:     SPACE.safeTop,
                paddingBottom:  SPACE.safeBottom,
                zIndex:         Z.content,
                paddingLeft:    SPACE.padH,
                paddingRight:   SPACE.padH,
                flexDirection:  'column',
            }}>

                {/* ── Tag ── */}
                {tag && (
                    <div style={{
                        transform:    `translateY(${tagTy}px)`,
                        opacity:      tagOp,
                        marginBottom: `${SPACE.gap}px`,
                        display:      'flex',
                        alignItems:   'center',
                        justifyContent: isCenter ? 'center' : 'flex-start',
                        gap:          `${SPACE.gapSm}px`,
                        width:        '100%',
                    }}>
                        <div style={{ width: '28px', height: '2px', background: `${brandAccent}88`, borderRadius: '1px' }} />
                        <span style={{
                            fontFamily:    sansFont,
                            fontSize:      `${TYPE.caption.size}px`,
                            fontWeight:    700,
                            letterSpacing: '3px',
                            color:         `${brandAccent}cc`,
                            textTransform: 'none',
                        }}>
                            {tag}
                        </span>
                        <div style={{ width: '28px', height: '2px', background: `${brandAccent}88`, borderRadius: '1px' }} />
                    </div>
                )}

                {/* ── Headline — word-by-word ── */}
                <div style={{
                    textAlign:    align,
                    width:        '100%',
                    marginBottom: `${SPACE.gap}px`,
                }}>
                    <span style={{
                        fontFamily:    sansFont,
                        fontSize:      `${TYPE.hero.size}px`,
                        fontWeight:    TYPE.hero.weight,
                        letterSpacing: `${TYPE.hero.tracking}px`,
                        lineHeight:    1.1,
                        display:       'block',
                    }}>
                        {allWords.map((w, wi) => {
                            if (w.lineBreak) return <br key={wi} />;

                            const wordDelay = textDelay + wi * TIMING.stagger;
                            const wSp = spring({ frame: Math.max(0, frame - wordDelay), fps, config: SPRING.snappy });
                            const wTy = interpolate(wSp, [0, 1], [50, 0]);
                            const wOp = interpolate(wSp, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

                            const glowStyle: React.CSSProperties = w.accent
                                ? { textShadow: `0 0 40px ${brandAccent}99, 0 0 80px ${brandAccent}44` }
                                : {};

                            return (
                                <span key={wi} style={{
                                    display:         'inline-block',
                                    transform:       `translateY(${wTy}px)`,
                                    opacity:         wOp,
                                    color:           w.accent ? brandAccent : COLOR.white,
                                    marginRight:     '0.26em',
                                    transformOrigin: 'center bottom',
                                    ...glowStyle,
                                }}>
                                    {w.word}
                                </span>
                            );
                        })}
                    </span>
                </div>

                {/* ── AccentBar ── */}
                <div style={{
                    width:        '100%',
                    display:      'flex',
                    justifyContent: isCenter ? 'center' : 'flex-start',
                    marginBottom: `${SPACE.gapLg}px`,
                }}>
                    <AccentBar
                        direction="horizontal"
                        width="160px"
                        thickness={4}
                        color={brandAccent}
                        animate
                        delay={barDelay}
                        duration={TIMING.medium}
                        glow
                        radius={2}
                    />
                </div>

                {/* ── Sub ── */}
                {sub && (
                    <div style={{
                        transform:  `translateY(${subTy}px)`,
                        opacity:    subOp,
                        width:      '100%',
                        textAlign:  align,
                    }}>
                        <span style={{
                            fontFamily:    sansFont,
                            fontSize:      `${TYPE.body.size}px`,
                            fontWeight:    400,
                            letterSpacing: `${TYPE.body.tracking}px`,
                            lineHeight:    TYPE.body.lineHeight,
                            color:         COLOR.textSecondary,
                        }}>
                            {sub}
                        </span>
                    </div>
                )}
            </AbsoluteFill>
        </AbsoluteFill>
    );
};

function parseHighlight(text: string): Array<{ text: string; accent: boolean }> {
    const result: Array<{ text: string; accent: boolean }> = [];
    const regex = /\*([^*]+)\*/g;
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
        if (match.index > last) result.push({ text: text.slice(last, match.index), accent: false });
        result.push({ text: match[1], accent: true });
        last = match.index + match[0].length;
    }
    if (last < text.length) result.push({ text: text.slice(last), accent: false });
    return result;
}
