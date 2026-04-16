import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { SceneBg, AccentBar, TIMING, SPRING, SPACE, COLOR, TYPE, Z } from '../../foundation';

/**
 * LANDING_TICKER — Ticker ngang + headline + stat cards
 *
 * Archetype: LANDING_TICKER
 * Act: 4 — LANDING
 *
 * Design rules:
 *   - Ticker bar chạy ngang liên tục (seamless loop)
 *   - Headline lớn căn trái hoặc căn giữa
 *   - 3 stat cards hàng ngang, spring in stagger từ dưới
 *   - Ticker bar thứ 2 chạy ngược chiều phía dưới
 *   - Nền đen với glow accent
 *
 * Ví dụ Director JSON:
 * {
 *   "archetype": "LANDING_TICKER",
 *   "scene_rhythm": "medium",
 *   "voice_text": "Kết quả thực tế từ hàng chục nghìn học viên.",
 *   "props": {
 *     "headline": "Kết quả thực tế",
 *     "stats": [
 *       { "value": "10,000+", "label": "Học viên" },
 *       { "value": "94%", "label": "Hài lòng" },
 *       { "value": "3×", "label": "ROI trung bình" }
 *     ],
 *     "ticker_items": ["10,000+ học viên", "94% hài lòng", "ROI trung bình 3×", "Được chứng minh", "Kết quả thực tế"],
 *     "brandAccent": "#B6FF00"
 *   }
 * }
 */

interface TickerStat {
    value: string;
    label: string;
}

interface LandingTickerProps {
    headline?:     string;
    stats?:        TickerStat[];
    ticker_items?: string[];
    brandAccent?:  string;
}

export const LandingTicker: React.FC<LandingTickerProps> = ({
    headline     = 'Kết quả thực tế',
    stats        = [
        { value: '10,000+', label: 'Học viên' },
        { value: '94%',     label: 'Hài lòng' },
        { value: '3×',      label: 'ROI trung bình' },
    ],
    ticker_items = ['10,000+ học viên', '94% hài lòng', 'ROI trung bình 3×', 'Được chứng minh', 'Kết quả thực tế'],
    brandAccent  = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: sansFont } = loadInter();

    // ── Ticker animation (seamless: content nhân đôi, dịch -50%) ──
    // 2.5px per frame, modulo 1080 để wrap
    const tickerX  = -(frame * 2.5) % 1080;
    const tickerX2 = (frame * 2.5) % 1080; // ngược chiều cho bar thứ 2

    const tickerText = ticker_items.join('  ·  ') + '  ·  ';

    // ── Headline spring in ─────────────────────────────────────
    const headlineDelay = TIMING.fast;
    const headlineSp    = spring({ frame: Math.max(0, frame - headlineDelay), fps, config: SPRING.snappy });
    const headlineTy    = interpolate(headlineSp, [0, 1], [60, 0]);
    const headlineOp    = interpolate(headlineSp, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

    // ── AccentBar after headline ───────────────────────────────
    const barDelay = headlineDelay + TIMING.fast;

    // ── Stat cards stagger spring in from below ────────────────
    const cardBaseDelay = barDelay + TIMING.medium;

    return (
        <AbsoluteFill>
            <SceneBg.Black />

            {/* Center glow */}
            <AbsoluteFill style={{
                background:    `radial-gradient(ellipse at 50% 45%, ${brandAccent}10 0%, transparent 60%)`,
                pointerEvents: 'none',
            }} />

            <AbsoluteFill style={{
                flexDirection: 'column',
                justifyContent: 'center',
                paddingTop:    SPACE.safeTop,
                paddingBottom: SPACE.safeBottom,
                zIndex:        Z.content,
            }}>

                {/* ── Ticker Bar 1 (top) ── */}
                <div style={{
                    width:        '100%',
                    height:       '64px',
                    background:   `${brandAccent}15`,
                    borderTop:    `1px solid ${brandAccent}44`,
                    borderBottom: `1px solid ${brandAccent}44`,
                    overflow:     'hidden',
                    display:      'flex',
                    alignItems:   'center',
                    marginBottom: `${SPACE.gapLg}px`,
                    flexShrink:   0,
                }}>
                    {/* Seamless ticker: two identical copies side by side */}
                    <div style={{
                        display:        'flex',
                        flexDirection:  'row',
                        whiteSpace:     'nowrap',
                        transform:      `translateX(${tickerX}px)`,
                        width:          '200%',
                    }}>
                        {[0, 1].map(n => (
                            <span key={n} style={{
                                fontFamily:    sansFont,
                                fontSize:      `${TYPE.caption.size}px`,
                                fontWeight:    700,
                                letterSpacing: '2px',
                                color:         brandAccent,
                                textTransform: 'uppercase',
                                paddingRight:  '60px',
                                display:       'inline-block',
                                width:         '1080px',
                            }}>
                                {tickerText.repeat(4)}
                            </span>
                        ))}
                    </div>
                </div>

                {/* ── Headline ── */}
                <div style={{
                    paddingLeft:  SPACE.padH,
                    paddingRight: SPACE.padH,
                    transform:    `translateY(${headlineTy}px)`,
                    opacity:      headlineOp,
                    marginBottom: `${SPACE.gap}px`,
                }}>
                    <span style={{
                        fontFamily:    sansFont,
                        fontSize:      `${TYPE.hero.size}px`,
                        fontWeight:    TYPE.hero.weight,
                        letterSpacing: `${TYPE.hero.tracking}px`,
                        lineHeight:    TYPE.hero.lineHeight,
                        color:         COLOR.white,
                        display:       'block',
                    }}>
                        {headline}
                    </span>
                </div>

                {/* ── AccentBar ── */}
                <div style={{
                    paddingLeft:  SPACE.padH,
                    marginBottom: `${SPACE.gapLg}px`,
                }}>
                    <AccentBar
                        direction="horizontal"
                        width="120px"
                        thickness={4}
                        color={brandAccent}
                        animate
                        delay={barDelay}
                        duration={TIMING.medium}
                        glow
                        radius={2}
                    />
                </div>

                {/* ── Stat cards (3 cards hàng ngang) ── */}
                <div style={{
                    paddingLeft:  SPACE.padH,
                    paddingRight: SPACE.padH,
                    display:      'flex',
                    flexDirection:'row',
                    gap:          `${SPACE.gap}px`,
                    marginBottom: `${SPACE.gapLg}px`,
                }}>
                    {stats.map((stat, i) => {
                        const delay = cardBaseDelay + i * TIMING.snap;
                        const sp    = spring({ frame: Math.max(0, frame - delay), fps, config: SPRING.bouncy });
                        const ty    = interpolate(sp, [0, 1], [80, 0]);
                        const op    = interpolate(sp, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

                        return (
                            <div key={i} style={{
                                flex:           1,
                                transform:      `translateY(${ty}px)`,
                                opacity:        op,
                                background:     `${COLOR.white}05`,
                                border:         `1px solid ${brandAccent}33`,
                                borderRadius:   '20px',
                                padding:        '40px 24px',
                                textAlign:      'center',
                                display:        'flex',
                                flexDirection:  'column',
                                alignItems:     'center',
                                gap:            `${SPACE.gapSm}px`,
                            }}>
                                <span style={{
                                    fontFamily:    sansFont,
                                    fontSize:      `${TYPE.title.size}px`,
                                    fontWeight:    900,
                                    letterSpacing: `${TYPE.title.tracking}px`,
                                    lineHeight:    1,
                                    color:         brandAccent,
                                    display:       'block',
                                    textShadow:    `0 0 30px ${brandAccent}66`,
                                }}>
                                    {stat.value}
                                </span>
                                <span style={{
                                    fontFamily:    sansFont,
                                    fontSize:      `${TYPE.caption.size}px`,
                                    fontWeight:    TYPE.caption.weight,
                                    letterSpacing: `${TYPE.caption.tracking}px`,
                                    lineHeight:    TYPE.caption.lineHeight,
                                    color:         COLOR.textSecondary,
                                    display:       'block',
                                }}>
                                    {stat.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* ── Ticker Bar 2 (bottom, ngược chiều) ── */}
                <div style={{
                    width:        '100%',
                    height:       '64px',
                    background:   `${brandAccent}10`,
                    borderTop:    `1px solid ${brandAccent}33`,
                    borderBottom: `1px solid ${brandAccent}33`,
                    overflow:     'hidden',
                    display:      'flex',
                    alignItems:   'center',
                    flexShrink:   0,
                }}>
                    <div style={{
                        display:       'flex',
                        flexDirection: 'row',
                        whiteSpace:    'nowrap',
                        transform:     `translateX(${tickerX2 - 1080}px)`,
                        width:         '200%',
                    }}>
                        {[0, 1].map(n => (
                            <span key={n} style={{
                                fontFamily:    sansFont,
                                fontSize:      `${TYPE.caption.size}px`,
                                fontWeight:    700,
                                letterSpacing: '2px',
                                color:         `${brandAccent}88`,
                                textTransform: 'uppercase',
                                paddingRight:  '60px',
                                display:       'inline-block',
                                width:         '1080px',
                            }}>
                                {tickerText.repeat(4)}
                            </span>
                        ))}
                    </div>
                </div>

            </AbsoluteFill>
        </AbsoluteFill>
    );
};
