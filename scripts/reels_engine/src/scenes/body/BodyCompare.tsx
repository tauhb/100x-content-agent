import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadPlayfair } from '@remotion/google-fonts/PlayfairDisplay';
import { SceneBg, AccentBar, TIMING, SPRING, SPACE, COLOR, TYPE, Z } from '../../foundation';

/**
 * BODY_COMPARE — So sánh 2 cột (Sai vs Đúng / Trước vs Sau)
 *
 * Archetype: BODY_COMPARE
 * Act: 3 — BODY
 *
 * Design rules:
 *   - Tiêu đề trên cùng
 *   - 2 cột: trái (sai/cũ) màu đỏ mờ, phải (đúng/mới) màu accent
 *   - Header mỗi cột có icon ✗ / ✓ và label
 *   - Mỗi row stagger vào: trái trước, phải sau
 *   - Không phải split screen — là table 2 cột trong 1 nền
 *
 * Ví dụ Director JSON:
 * {
 *   "archetype": "BODY_COMPARE",
 *   "scene_rhythm": "slow",
 *   "voice_text": "Đây là sự khác biệt giữa người dừng lại và người tiếp tục.",
 *   "props": {
 *     "headline": "Người Dừng vs Người Tiếp Tục",
 *     "left_label": "Người Dừng",
 *     "right_label": "Người Tiếp Tục",
 *     "rows": [
 *       { "left": "Chờ hứng khởi",        "right": "Hành động dù mệt"      },
 *       { "left": "Đổ lỗi hoàn cảnh",     "right": "Tìm cách trong hoàn cảnh" },
 *       { "left": "Bỏ khi khó",           "right": "Khó là lúc tăng tốc"   },
 *       { "left": "Kết quả ngắn hạn",     "right": "Hệ thống dài hạn"      }
 *     ]
 *   }
 * }
 */

interface CompareRow {
    left:  string;
    right: string;
}

interface BatteryItem {
    label: string;
    value: number;   // 0–100
    color?: string;  // override màu fill, mặc định tự tính từ value
}

interface BodyCompareProps {
    headline?:    string;
    left_label?:  string;
    right_label?: string;
    left_color?:  string;
    rows?:        CompareRow[];
    style?:       'table' | 'battery';
    batteries?:   BatteryItem[];  // chỉ dùng khi style: 'battery', tối đa 4
    bg?:          'black' | 'dark';
    brandAccent?: string;
}

// Màu fill battery theo % — đỏ → vàng → xanh (semantic, không theo brand)
function batteryColor(value: number, accent: string): string {
    if (value <= 20) return '#EF4444';   // đỏ — empty/bad
    if (value <= 50) return '#EAB308';   // vàng — low/mid
    if (value <= 79) return '#84CC16';   // xanh nhạt — good
    return accent;                        // accent brand — full/best
}

export const BodyCompare: React.FC<BodyCompareProps> = ({
    headline    = 'Người Dừng vs Người Tiếp Tục',
    left_label  = 'Người Dừng',
    right_label = 'Người Tiếp Tục',
    left_color  = '#FF4444',
    rows        = [
        { left: 'Chờ hứng khởi',    right: 'Hành động dù mệt'         },
        { left: 'Đổ lỗi hoàn cảnh', right: 'Tìm cách trong hoàn cảnh' },
        { left: 'Bỏ khi khó',       right: 'Khó là lúc tăng tốc'      },
        { left: 'Kết quả ngắn hạn', right: 'Hệ thống dài hạn'         },
    ],
    style       = 'table',
    batteries   = [
        { label: 'STUDENT',     value: 0   },
        { label: 'EMPLOYEE',    value: 40  },
        { label: 'FREELANCER',  value: 60  },
        { label: 'ENTREPRENEUR', value: 100 },
    ],
    bg          = 'dark',
    brandAccent = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: sansFont } = loadInter();
    const { fontFamily: serifFont } = loadPlayfair();

    const headlineDelay = 0;
    const headerDelay   = TIMING.fast;
    const rowStart      = TIMING.fast + TIMING.medium;
    const rowStagger    = TIMING.fast;

    // ── Headline ──────────────────────────────────────────────
    const hlSp = spring({ frame: Math.max(0, frame - headlineDelay), fps, config: SPRING.snappy });
    const hlTy = interpolate(hlSp, [0, 1], [30, 0]);
    const hlOp = interpolate(hlSp, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

    // ── Column headers ────────────────────────────────────────
    const hdrSp = spring({ frame: Math.max(0, frame - headerDelay), fps, config: SPRING.normal });
    const hdrOp = interpolate(hdrSp, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
    const hdrTy = interpolate(hdrSp, [0, 1], [20, 0]);

    const CELL_PAD = SPACE.gap;
    const COL_GAP  = SPACE.gapSm;

    // ── BATTERY STYLE ─────────────────────────────────────────────────────────
    if (style === 'battery') {
        const items = batteries.slice(0, 4);
        const isGrid = items.length > 2; // 3–4 items → 2×2 grid, 1–2 → single row

        return (
            <AbsoluteFill>
                {bg === 'dark' ? <SceneBg.Dark /> : <SceneBg.Black />}
                {/* Subtle ambient from accent */}
                <AbsoluteFill style={{
                    background: `radial-gradient(ellipse at 50% 80%, ${brandAccent}0a 0%, transparent 65%)`,
                }} />

                <AbsoluteFill style={{
                    justifyContent: 'center',
                    alignItems:     'center',
                    paddingTop:     SPACE.safeTop,
                    paddingBottom:  SPACE.safeBottom,
                    paddingLeft:    SPACE.padH,
                    paddingRight:   SPACE.padH,
                    flexDirection:  'column',
                    gap:            `${SPACE.gapLg}px`,
                    zIndex:         Z.content,
                }}>
                    {/* Headline */}
                    {headline && (
                        <div style={{
                            transform:    `translateY(${interpolate(spring({ frame, fps, config: SPRING.snappy }), [0,1], [30,0])}px)`,
                            opacity:      interpolate(spring({ frame, fps, config: SPRING.snappy }), [0,0.3], [0,1], { extrapolateRight: 'clamp' }),
                            textAlign:    'center',
                            width:        '100%',
                        }}>
                            <span style={{
                                fontFamily:    sansFont,
                                fontSize:      `${TYPE.title.size}px`,
                                fontWeight:    TYPE.title.weight,
                                color:         COLOR.white,
                                letterSpacing: `${TYPE.title.tracking}px`,
                                display:       'block',
                                marginBottom:  '12px',
                            }}>
                                {headline}
                            </span>
                            <AccentBar direction="horizontal" width="72px" thickness={4} color={brandAccent} animate delay={TIMING.snap} duration={TIMING.fast} glow radius={2} />
                        </div>
                    )}

                    {/* Battery grid */}
                    <div style={{
                        display:             'grid',
                        gridTemplateColumns: isGrid ? '1fr 1fr' : `repeat(${items.length}, 1fr)`,
                        gap:                 `${SPACE.gapLg}px ${SPACE.gap}px`,
                        width:               '100%',
                    }}>
                        {items.map((bat, i) => {
                            const delay = TIMING.fast + i * TIMING.fast;
                            const sp    = spring({ frame: Math.max(0, frame - delay), fps, config: SPRING.bouncy });
                            const opacity = interpolate(sp, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });
                            const scaleIn = interpolate(sp, [0, 1], [0.85, 1]);

                            const fillColor = bat.color || batteryColor(bat.value, brandAccent);
                            // Fill animates from 0 to bat.value
                            const fillProgress = interpolate(frame, [delay, delay + 20], [0, bat.value], {
                                extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
                            });
                            const fillPct = `${fillProgress}%`;

                            return (
                                <div key={i} style={{
                                    display:       'flex',
                                    flexDirection: 'column',
                                    alignItems:    'center',
                                    gap:           `${SPACE.gapSm}px`,
                                    opacity,
                                    transform:     `scale(${scaleIn})`,
                                }}>
                                    {/* Battery shell */}
                                    <div style={{
                                        position:     'relative',
                                        width:        '140px',
                                        height:       '220px',
                                        borderRadius: '20px',
                                        border:       `3px solid ${fillColor}66`,
                                        boxShadow:    `0 0 24px ${fillColor}44, inset 0 0 12px rgba(0,0,0,0.6)`,
                                        overflow:     'hidden',
                                        background:   'rgba(0,0,0,0.5)',
                                    }}>
                                        {/* Battery nub */}
                                        <div style={{
                                            position:     'absolute',
                                            top:          '-10px',
                                            left:         '50%',
                                            transform:    'translateX(-50%)',
                                            width:        '40px',
                                            height:       '12px',
                                            background:   `${fillColor}88`,
                                            borderRadius: '4px 4px 0 0',
                                        }} />
                                        {/* Fill level — rises from bottom */}
                                        <div style={{
                                            position:   'absolute',
                                            bottom:     0,
                                            left:       0,
                                            right:      0,
                                            height:     fillPct,
                                            background: `linear-gradient(to top, ${fillColor}, ${fillColor}99)`,
                                            boxShadow:  `0 0 20px ${fillColor}88`,
                                            transition: 'none',
                                        }} />
                                        {/* Percentage text center */}
                                        <div style={{
                                            position:   'absolute',
                                            inset:      0,
                                            display:    'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <span style={{
                                                fontFamily:  serifFont,
                                                fontSize:    '38px',
                                                fontWeight:  900,
                                                color:       bat.value <= 20 ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)',
                                                textShadow:  bat.value <= 20 ? '0 1px 6px rgba(0,0,0,0.8)' : 'none',
                                            }}>
                                                {Math.round(fillProgress)}%
                                            </span>
                                        </div>
                                    </div>
                                    {/* Label */}
                                    <span style={{
                                        fontFamily:    sansFont,
                                        fontSize:      `${TYPE.caption.size}px`,
                                        fontWeight:    700,
                                        letterSpacing: '2px',
                                        color:         fillColor,
                                        textTransform: 'none',
                                        textShadow:    `0 0 12px ${fillColor}88`,
                                    }}>
                                        {bat.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </AbsoluteFill>
            </AbsoluteFill>
        );
    }

    // ── TABLE STYLE (default) ─────────────────────────────────────────────────
    return (
        <AbsoluteFill>
            {bg === 'dark' ? <SceneBg.Dark /> : <SceneBg.Black />}

            <AbsoluteFill style={{
                justifyContent: 'center',
                alignItems:     'flex-start',
                paddingTop:     SPACE.safeTop,
                paddingBottom:  SPACE.safeBottom,
                paddingLeft:    SPACE.padH,
                paddingRight:   SPACE.padH,
                flexDirection:  'column',
            }}>

                {/* ── Headline ── */}
                <div style={{
                    transform:    `translateY(${hlTy}px)`,
                    opacity:      hlOp,
                    marginBottom: `${SPACE.gapLg}px`,
                    width:        '100%',
                }}>
                    <span style={{
                        fontFamily:    sansFont,
                        fontSize:      `${TYPE.title.size}px`,
                        fontWeight:    TYPE.title.weight,
                        letterSpacing: `${TYPE.title.tracking}px`,
                        lineHeight:    TYPE.title.lineHeight,
                        color:         COLOR.white,
                        display:       'block',
                        marginBottom:  '12px',
                    }}>
                        {headline}
                    </span>
                    <AccentBar
                        direction="horizontal"
                        width="72px"
                        thickness={4}
                        color={brandAccent}
                        animate
                        delay={TIMING.snap}
                        duration={TIMING.fast}
                        glow
                        radius={2}
                    />
                </div>

                {/* ── Table ── */}
                <div style={{ width: '100%' }}>

                    {/* Column headers */}
                    <div style={{
                        transform:    `translateY(${hdrTy}px)`,
                        opacity:      hdrOp,
                        display:      'flex',
                        flexDirection: 'row',
                        gap:          `${COL_GAP}px`,
                        marginBottom: `${SPACE.gapSm}px`,
                    }}>
                        {/* Left header */}
                        <div style={{
                            flex:           1,
                            display:        'flex',
                            alignItems:     'center',
                            gap:            `${SPACE.gapSm}px`,
                            padding:        `${CELL_PAD / 2}px ${CELL_PAD}px`,
                            background:     `${left_color}18`,
                            border:         `1px solid ${left_color}44`,
                            borderRadius:   '8px',
                        }}>
                            <span style={{ color: left_color, fontSize: `${TYPE.body.size}px`, fontWeight: 700 }}>✗</span>
                            <span style={{
                                fontFamily:    sansFont,
                                fontSize:      `${Math.round(TYPE.body.size * 0.85)}px`,
                                fontWeight:    700,
                                letterSpacing: '1.5px',
                                color:         left_color,
                                textTransform: 'none',
                            }}>
                                {left_label}
                            </span>
                        </div>

                        {/* Right header */}
                        <div style={{
                            flex:           1,
                            display:        'flex',
                            alignItems:     'center',
                            gap:            `${SPACE.gapSm}px`,
                            padding:        `${CELL_PAD / 2}px ${CELL_PAD}px`,
                            background:     `${brandAccent}18`,
                            border:         `1px solid ${brandAccent}55`,
                            borderRadius:   '8px',
                        }}>
                            <span style={{ color: brandAccent, fontSize: `${TYPE.body.size}px`, fontWeight: 700 }}>✓</span>
                            <span style={{
                                fontFamily:    sansFont,
                                fontSize:      `${Math.round(TYPE.body.size * 0.85)}px`,
                                fontWeight:    700,
                                letterSpacing: '1.5px',
                                color:         brandAccent,
                                textTransform: 'none',
                            }}>
                                {right_label}
                            </span>
                        </div>
                    </div>

                    {/* Rows */}
                    {rows.slice(0, 5).map((row, i) => {
                        const delay = rowStart + i * rowStagger;
                        const sp    = spring({ frame: Math.max(0, frame - delay), fps, config: SPRING.normal });
                        const ty    = interpolate(sp, [0, 1], [24, 0]);
                        const op    = interpolate(sp, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

                        return (
                            <div
                                key={i}
                                style={{
                                    transform:    `translateY(${ty}px)`,
                                    opacity:      op,
                                    display:      'flex',
                                    flexDirection: 'row',
                                    gap:          `${COL_GAP}px`,
                                    marginBottom: `${SPACE.gapSm}px`,
                                }}
                            >
                                {/* Left cell */}
                                <div style={{
                                    flex:         1,
                                    padding:      `${CELL_PAD}px`,
                                    background:   `${left_color}0a`,
                                    border:       `1px solid ${left_color}1a`,
                                    borderRadius: '8px',
                                }}>
                                    <span style={{
                                        fontFamily:    sansFont,
                                        fontSize:      `${TYPE.body.size * 0.88}px`,
                                        fontWeight:    500,
                                        letterSpacing: '0px',
                                        lineHeight:    1.3,
                                        color:         `${left_color}cc`,
                                    }}>
                                        {row.left}
                                    </span>
                                </div>

                                {/* Right cell */}
                                <div style={{
                                    flex:         1,
                                    padding:      `${CELL_PAD}px`,
                                    background:   `${brandAccent}0d`,
                                    border:       `1px solid ${brandAccent}2a`,
                                    borderRadius: '8px',
                                }}>
                                    <span style={{
                                        fontFamily:    sansFont,
                                        fontSize:      `${TYPE.body.size * 0.88}px`,
                                        fontWeight:    600,
                                        letterSpacing: '0px',
                                        lineHeight:    1.3,
                                        color:         COLOR.white,
                                    }}>
                                        {row.right}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
