import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadPlayfair } from '@remotion/google-fonts/PlayfairDisplay';
import { SceneBg, AccentBar, TIMING, SPRING, SPACE, COLOR, TYPE, Z } from '../../foundation';

/**
 * BODY_INSIGHT — Key insight / takeaway lớn
 *
 * Archetype: BODY_INSIGHT
 * Act: 3 — BODY
 *
 * Design rules:
 *   - Một insight duy nhất chiếm trọng tâm màn hình
 *   - Dòng context nhỏ ở trên (tag/category)
 *   - Headline lớn, word-by-word reveal từ dưới lên
 *   - Từ được đánh dấu *bằng dấu sao* sẽ đổi màu accent + glow
 *   - Sub-text giải thích nhỏ ở dưới, fade in sau
 *   - Optional: số thứ tự ở góc trái trên (dùng trong series)
 *
 * Ví dụ Director JSON:
 * {
 *   "archetype": "BODY_INSIGHT",
 *   "scene_rhythm": "medium",
 *   "voice_text": "Điều quan trọng không phải là bạn bắt đầu từ đâu, mà là bạn không bao giờ dừng lại.",
 *   "props": {
 *     "tag": "NGUYÊN TẮC #2",
 *     "headline": "Không quan trọng *bắt đầu từ đâu* — quan trọng là không dừng lại.",
 *     "sub": "Mọi người thành công đều từng là người mới.",
 *     "index": 2
 *   }
 * }
 */

interface BodyInsightProps {
    tag?:         string;
    headline?:    string;
    sub?:         string;
    index?:       number;
    font?:        'sans' | 'serif';
    align?:       'left' | 'center';
    bg?:          'black' | 'dark' | 'dark-cool';
    brandAccent?: string;
}

export const BodyInsight: React.FC<BodyInsightProps> = ({
    tag         = '',
    headline    = 'Không quan trọng *bắt đầu từ đâu* — quan trọng là không dừng lại.',
    sub         = '',
    index,
    font        = 'sans',
    align       = 'left',
    bg          = 'dark',
    brandAccent = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: sansFont }  = loadInter();
    const { fontFamily: serifFont } = loadPlayfair();

    const fontFamily = font === 'serif' ? serifFont : sansFont;

    // ── Parse *highlighted* words ─────────────────────────────
    // Split headline into segments: normal | accent
    const segments = parseHighlight(headline);

    // ── Timing ────────────────────────────────────────────────
    const tagDelay   = 0;
    const textDelay  = TIMING.snap;
    const subDelay   = TIMING.slow + TIMING.fast;

    // ── Tag ───────────────────────────────────────────────────
    const tagSp = spring({ frame: Math.max(0, frame - tagDelay), fps, config: SPRING.snappy });
    const tagOpacity = interpolate(tagSp, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
    const tagTy      = interpolate(tagSp, [0, 1], [-16, 0]);

    // ── Text reveal: each word staggered ─────────────────────
    // Flatten all words across all segments for stagger indexing
    const allWords: Array<{ word: string; accent: boolean }> = [];
    segments.forEach(seg => {
        seg.text.split(' ').filter(Boolean).forEach(w => {
            allWords.push({ word: w, accent: seg.accent });
        });
    });

    // ── Sub ───────────────────────────────────────────────────
    const subSp = spring({ frame: Math.max(0, frame - subDelay), fps, config: SPRING.gentle });
    const subOpacity = interpolate(subSp, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
    const subTy      = interpolate(subSp, [0, 1], [20, 0]);

    const Background = bg === 'dark-cool' ? SceneBg.DarkCool : bg === 'dark' ? SceneBg.Dark : SceneBg.Black;

    const isCenter = align === 'center';

    return (
        <AbsoluteFill>
            <Background />

            {/* Accent glow at center */}
            <AbsoluteFill style={{
                background: `radial-gradient(ellipse at ${isCenter ? '50%' : '20%'} 50%, ${brandAccent}0a 0%, transparent 60%)`,
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

                {/* ── Index badge ── */}
                {index !== undefined && (
                    <div style={{
                        position: 'absolute',
                        top:      SPACE.safeTop,
                        left:     SPACE.padH,
                        opacity:  tagOpacity,
                    }}>
                        <span style={{
                            fontFamily:  sansFont,
                            fontSize:    `${TYPE.display.size * 0.8}px`,
                            fontWeight:  900,
                            color:       `${brandAccent}18`,
                            lineHeight:  1,
                            display:     'block',
                        }}>
                            {String(index).padStart(2, '0')}
                        </span>
                    </div>
                )}

                {/* ── Tag ── */}
                {tag && (
                    <div style={{
                        transform:    `translateY(${tagTy}px)`,
                        opacity:      tagOpacity,
                        marginBottom: `${SPACE.gap}px`,
                        display:      'flex',
                        alignItems:   'center',
                        gap:          `${SPACE.gapSm}px`,
                    }}>
                        <div style={{
                            width:        '8px',
                            height:       '8px',
                            borderRadius: '50%',
                            background:   brandAccent,
                            flexShrink:   0,
                        }} />
                        <span style={{
                            fontFamily:    sansFont,
                            fontSize:      `${TYPE.caption.size}px`,
                            fontWeight:    700,
                            letterSpacing: '2.5px',
                            color:         brandAccent,
                            textTransform: 'none',
                        }}>
                            {tag}
                        </span>
                    </div>
                )}

                {/* ── Headline — word-by-word reveal ── */}
                <div style={{
                    marginBottom: sub ? `${SPACE.gapLg}px` : '0',
                    textAlign:    align,
                    maxWidth:     '960px',
                }}>
                    <span style={{
                        fontFamily,
                        fontSize:      `${TYPE.hero.size}px`,
                        fontWeight:    font === 'serif' ? 700 : TYPE.hero.weight,
                        letterSpacing: font === 'serif' ? '0' : `${TYPE.hero.tracking}px`,
                        lineHeight:    1.1,
                        fontStyle:     font === 'serif' ? 'italic' : 'normal',
                        display:       'block',
                    }}>
                        {allWords.map((w, wi) => {
                            const wordDelay = textDelay + wi * TIMING.stagger;
                            const wSp = spring({ frame: Math.max(0, frame - wordDelay), fps, config: SPRING.snappy });
                            const wTy      = interpolate(wSp, [0, 1], [48, 0]);
                            const wOpacity = interpolate(wSp, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });
                            const wScale   = interpolate(wSp, [0, 1], [0.95, 1]);

                            const glowStyle: React.CSSProperties = w.accent
                                ? { textShadow: `0 0 30px ${brandAccent}88, 0 0 60px ${brandAccent}44` }
                                : {};

                            return (
                                <span
                                    key={wi}
                                    style={{
                                        display:         'inline-block',
                                        transform:       `translateY(${wTy}px) scale(${wScale})`,
                                        opacity:         wOpacity,
                                        color:           w.accent ? brandAccent : COLOR.white,
                                        marginRight:     '0.28em',
                                        transformOrigin: 'center bottom',
                                        ...glowStyle,
                                    }}
                                >
                                    {w.word}
                                </span>
                            );
                        })}
                    </span>
                </div>

                {/* ── AccentBar divider ── */}
                {sub && (
                    <div style={{ marginBottom: `${SPACE.gap}px` }}>
                        <AccentBar
                            direction="horizontal"
                            width="60px"
                            thickness={3}
                            color={brandAccent}
                            animate
                            delay={subDelay - TIMING.snap}
                            duration={TIMING.fast}
                            radius={2}
                        />
                    </div>
                )}

                {/* ── Sub text ── */}
                {sub && (
                    <div style={{
                        transform: `translateY(${subTy}px)`,
                        opacity:   subOpacity,
                        maxWidth:  '860px',
                        textAlign: align,
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

// ── Parse *highlighted* syntax ────────────────────────────────
function parseHighlight(text: string): Array<{ text: string; accent: boolean }> {
    const result: Array<{ text: string; accent: boolean }> = [];
    const regex = /\*([^*]+)\*/g;
    let last = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > last) {
            result.push({ text: text.slice(last, match.index), accent: false });
        }
        result.push({ text: match[1], accent: true });
        last = match.index + match[0].length;
    }
    if (last < text.length) {
        result.push({ text: text.slice(last), accent: false });
    }
    return result;
}
