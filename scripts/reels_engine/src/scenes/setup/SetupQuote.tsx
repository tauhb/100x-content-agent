import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadPlayfair } from '@remotion/google-fonts/PlayfairDisplay';
import { SceneBg, AccentBar, TIMING, SPRING, SPACE, COLOR, TYPE, Z } from '../../foundation';

/**
 * SETUP_QUOTE — Trích dẫn có impact
 *
 * Archetype: SETUP_QUOTE
 * Act: 2 — SETUP
 *
 * Design rules:
 *   - Nền đen / dark — text-only, không có video
 *   - Dấu ngoặc kép to màu accent xuất hiện trước
 *   - Quote text serif italic, chữ to, căn trái
 *   - QuoteBar accent dọc bên trái
 *   - Author + role slide lên sau quote
 *   - Optional: source/book nhỏ italic ở dưới
 *
 * Ví dụ Director JSON:
 * {
 *   "archetype": "SETUP_QUOTE",
 *   "scene_rhythm": "slow",
 *   "voice_text": "Người giỏi nhất không phải làm nhiều nhất, mà là biết chọn đúng việc.",
 *   "props": {
 *     "quote": "Người giỏi nhất không phải làm nhiều nhất, mà là biết chọn đúng việc.",
 *     "author": "Warren Buffett",
 *     "role": "Nhà đầu tư huyền thoại",
 *     "source": "Thư gửi cổ đông, 2008"
 *   }
 * }
 */

interface SetupQuoteProps {
    quote?:       string;
    author?:      string;
    role?:        string;
    source?:      string;
    style?:       'serif' | 'sans';
    bg?:          'black' | 'dark' | 'dark-cool';
    brandAccent?: string;
}

export const SetupQuote: React.FC<SetupQuoteProps> = ({
    quote       = 'Người giỏi nhất không phải làm nhiều nhất, mà là biết chọn đúng việc.',
    author      = '',
    role        = '',
    source      = '',
    style       = 'serif',
    bg          = 'dark',
    brandAccent = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: sansFont }  = loadInter();
    const { fontFamily: serifFont } = loadPlayfair();

    const fontFamily = style === 'serif' ? serifFont : sansFont;

    // ── Timing ────────────────────────────────────────────────
    // 1. Dấu " xuất hiện
    const markDelay   = 0;
    // 2. QuoteBar wipe
    const barDelay    = TIMING.snap;
    // 3. Quote text fade in từng từ (slow reveal)
    const quoteDelay  = TIMING.fast;
    // 4. Author block
    const authorDelay = TIMING.slow + TIMING.medium;

    // ── Opening mark ─────────────────────────────────────────
    const markSp = spring({ frame: Math.max(0, frame - markDelay), fps, config: SPRING.bouncy });
    const markScale   = interpolate(markSp, [0, 1], [0.4, 1]);
    const markOpacity = interpolate(markSp, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });

    // ── Quote text reveal ─────────────────────────────────────
    const quoteSp = spring({ frame: Math.max(0, frame - quoteDelay), fps, config: SPRING.gentle });
    const quoteOpacity = interpolate(quoteSp, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
    const quoteTy      = interpolate(quoteSp, [0, 1], [40, 0]);

    // ── Author block ──────────────────────────────────────────
    const authorSp = spring({ frame: Math.max(0, frame - authorDelay), fps, config: SPRING.normal });
    const authorOpacity = interpolate(authorSp, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
    const authorTy      = interpolate(authorSp, [0, 1], [25, 0]);

    const Background = bg === 'dark-cool' ? SceneBg.DarkCool : bg === 'dark' ? SceneBg.Dark : SceneBg.Black;

    return (
        <AbsoluteFill>
            <Background />

            {/* Subtle radial glow tại vị trí dấu " */}
            <AbsoluteFill style={{
                background: `radial-gradient(ellipse at 15% 35%, ${brandAccent}0a 0%, transparent 55%)`,
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
            }}>
                <div style={{ width: '100%', position: 'relative' }}>

                    {/* ── Dấu mở ngoặc kép to ── */}
                    <div style={{
                        position:  'absolute',
                        top:       '-60px',
                        left:      '-8px',
                        transform: `scale(${markScale})`,
                        opacity:   markOpacity,
                        transformOrigin: 'left top',
                        lineHeight: 1,
                        pointerEvents: 'none',
                    }}>
                        <span style={{
                            fontFamily,
                            fontSize:   '180px',
                            fontWeight: 700,
                            color:      brandAccent,
                            display:    'block',
                            lineHeight: 1,
                            fontStyle:  'italic',
                        }}>
                            "
                        </span>
                    </div>

                    {/* ── Quote bar dọc bên trái ── */}
                    <div style={{ marginBottom: `${SPACE.gap}px` }}>
                        <AccentBar
                            direction="vertical"
                            height="100%"
                            thickness={5}
                            color={brandAccent}
                            animate
                            delay={barDelay}
                            duration={TIMING.medium}
                            glow
                            radius={2}
                            style={{ alignSelf: 'stretch' }}
                        />
                    </div>

                    {/* ── Quote text ── */}
                    <div style={{
                        paddingLeft:   `${SPACE.gapLg}px`,
                        transform:     `translateY(${quoteTy}px)`,
                        opacity:       quoteOpacity,
                        marginBottom:  `${SPACE.gapLg}px`,
                    }}>
                        <span style={{
                            fontFamily,
                            fontSize:      `${TYPE.title.size}px`,
                            fontWeight:    style === 'serif' ? 600 : TYPE.title.weight,
                            letterSpacing: style === 'serif' ? '0px' : `${TYPE.title.tracking}px`,
                            lineHeight:    1.25,
                            color:         COLOR.white,
                            display:       'block',
                            fontStyle:     style === 'serif' ? 'italic' : 'normal',
                        }}>
                            {quote}
                        </span>
                    </div>

                    {/* ── AccentBar dưới quote ── */}
                    <div style={{ paddingLeft: `${SPACE.gapLg}px`, marginBottom: `${SPACE.gapLg}px` }}>
                        <AccentBar
                            direction="horizontal"
                            width="120px"
                            thickness={3}
                            color={brandAccent}
                            animate
                            delay={authorDelay - TIMING.fast}
                            duration={TIMING.fast}
                            radius={2}
                        />
                    </div>

                    {/* ── Author + role ── */}
                    {(author || role) && (
                        <div style={{
                            paddingLeft: `${SPACE.gapLg}px`,
                            transform:   `translateY(${authorTy}px)`,
                            opacity:     authorOpacity,
                        }}>
                            {author && (
                                <span style={{
                                    fontFamily:    sansFont,
                                    fontSize:      `${TYPE.body.size}px`,
                                    fontWeight:    700,
                                    letterSpacing: '0.5px',
                                    color:         COLOR.white,
                                    display:       'block',
                                    marginBottom:  `${SPACE.gapSm}px`,
                                }}>
                                    {author}
                                </span>
                            )}
                            {role && (
                                <span style={{
                                    fontFamily:    sansFont,
                                    fontSize:      `${TYPE.caption.size}px`,
                                    fontWeight:    400,
                                    letterSpacing: `${TYPE.caption.tracking}px`,
                                    color:         COLOR.textSecondary,
                                    display:       'block',
                                }}>
                                    {role}
                                </span>
                            )}
                            {source && (
                                <span style={{
                                    fontFamily: sansFont,
                                    fontSize:   `${TYPE.caption.size * 0.85}px`,
                                    fontWeight: 400,
                                    color:      COLOR.textMuted,
                                    display:    'block',
                                    marginTop:  `${SPACE.gapSm}px`,
                                    fontStyle:  'italic',
                                }}>
                                    — {source}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
