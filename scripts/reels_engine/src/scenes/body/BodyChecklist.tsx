import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { SceneBg, AccentBar, TIMING, SPRING, SPACE, COLOR, TYPE, Z } from '../../foundation';

/**
 * BODY_CHECKLIST — Checklist với SVG draw animation
 *
 * Archetype: BODY_CHECKLIST
 * Act: 3 — BODY
 *
 * Design rules:
 *   - Checkbox border wipe (SVG stroke-dashoffset) → checkmark draw
 *   - Stagger mỗi item từ trên xuống
 *   - 3 style: 'check' (SVG tick), 'numbered' (badge số), 'emoji' (icon)
 *   - Item background subtle với left border brandAccent
 *   - Sub text mờ bên dưới main text
 *
 * Ví dụ Director JSON:
 * {
 *   "archetype": "BODY_CHECKLIST",
 *   "scene_rhythm": "medium",
 *   "voice_text": "5 bước để bứt phá trong 90 ngày tới.",
 *   "props": {
 *     "headline": "5 Bước Bứt Phá",
 *     "style": "check",
 *     "items": [
 *       { "text": "Xác định mục tiêu rõ ràng", "sub": "SMART goal, deadline cụ thể", "done": true },
 *       { "text": "Xây hệ thống không phải mục tiêu", "sub": "Process > result", "done": true },
 *       { "text": "Loại bỏ 80% task không quan trọng", "sub": "Pareto principle", "done": true },
 *       { "text": "Deep work 4 giờ mỗi ngày", "sub": "Không điện thoại, không mạng", "done": true },
 *       { "text": "Review và điều chỉnh hàng tuần", "sub": "Vòng lặp cải tiến", "done": true }
 *     ],
 *     "brandAccent": "#B6FF00"
 *   }
 * }
 */

interface ChecklistItem {
    text: string;
    sub?: string;
    done?: boolean;
    icon?: string;
}

interface BodyChecklistProps {
    headline?: string;
    items?: ChecklistItem[];
    style?: 'check' | 'numbered' | 'emoji';
    brandAccent?: string;
}

// ── SVG checkbox with animated draw ──────────────────────────
const AnimatedCheckbox: React.FC<{
    frame: number;
    delay: number;
    done: boolean;
    brandAccent: string;
}> = ({ frame, delay, done, brandAccent }) => {
    const BOX_PERIMETER = 160; // perimeter of 40×40 rect
    const TICK_LENGTH   = 40;  // estimated polyline length

    const localFrame = Math.max(0, frame - delay);

    // Phase 1: box border wipe (frames 0→8)
    const boxDash = interpolate(localFrame, [0, 8], [BOX_PERIMETER, 0], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });

    // Phase 2: checkmark draw (frames 8→14), only if done
    const tickDash = done
        ? interpolate(localFrame, [8, 14], [TICK_LENGTH, 0], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        })
        : TICK_LENGTH;

    const boxComplete = localFrame >= 8;

    return (
        <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            style={{ flexShrink: 0 }}
        >
            {/* Box background when done */}
            {done && boxComplete && (
                <rect
                    x="2" y="2"
                    width="36" height="36"
                    rx="6"
                    fill={`${brandAccent}22`}
                />
            )}
            {/* Box border */}
            <rect
                x="2" y="2"
                width="36" height="36"
                rx="6"
                fill="none"
                stroke={brandAccent}
                strokeWidth="3"
                strokeDasharray={BOX_PERIMETER}
                strokeDashoffset={boxDash}
                strokeLinecap="round"
            />
            {/* Checkmark */}
            {done && (
                <polyline
                    points="8,20 18,30 34,12"
                    fill="none"
                    stroke={brandAccent}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={TICK_LENGTH}
                    strokeDashoffset={tickDash}
                />
            )}
        </svg>
    );
};

// ── Numbered badge ───────────────────────────────────────────
const NumberBadge: React.FC<{
    index: number;
    brandAccent: string;
    sansFont: string;
}> = ({ index, brandAccent, sansFont }) => (
    <div style={{
        width:          '40px',
        height:         '40px',
        borderRadius:   '50%',
        border:         `2px solid ${brandAccent}`,
        background:     `${brandAccent}18`,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
        boxShadow:      `0 0 10px ${brandAccent}44`,
    }}>
        <span style={{
            fontFamily:  sansFont,
            fontSize:    `${TYPE.caption.size}px`,
            fontWeight:  700,
            color:       brandAccent,
            lineHeight:  1,
        }}>
            {index + 1}
        </span>
    </div>
);

export const BodyChecklist: React.FC<BodyChecklistProps> = ({
    headline    = '5 Bước Bứt Phá',
    items       = [
        { text: 'Xác định mục tiêu rõ ràng', sub: 'SMART goal, deadline cụ thể', done: true },
        { text: 'Xây hệ thống không phải mục tiêu', sub: 'Process > result', done: true },
        { text: 'Loại bỏ 80% task không quan trọng', sub: 'Pareto principle', done: true },
        { text: 'Deep work 4 giờ mỗi ngày', sub: 'Không điện thoại, không mạng', done: true },
        { text: 'Review và điều chỉnh hàng tuần', sub: 'Vòng lặp cải tiến', done: true },
    ],
    style       = 'check',
    brandAccent = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: sansFont } = loadInter();

    // ── Headline ─────────────────────────────────────────────
    const hlSp = spring({ frame: Math.max(0, frame), fps, config: SPRING.snappy });
    const hlTy = interpolate(hlSp, [0, 1], [-40, 0]);
    const hlOp = interpolate(hlSp, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

    const safeItems = items.slice(0, 7);

    return (
        <AbsoluteFill>
            <SceneBg.Dark />

            {/* Ambient glow */}
            <AbsoluteFill style={{
                background: `radial-gradient(ellipse at 20% 40%, ${brandAccent}06 0%, transparent 55%)`,
                pointerEvents: 'none',
            }} />

            <AbsoluteFill style={{
                justifyContent: 'center',
                alignItems:     'flex-start',
                paddingTop:     SPACE.safeTop,
                paddingBottom:  SPACE.safeBottom,
                paddingLeft:    SPACE.padH,
                paddingRight:   SPACE.padH,
                flexDirection:  'column',
                zIndex:         Z.content,
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
                        marginBottom:  `${SPACE.gap}px`,
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

                {/* ── Checklist items ── */}
                <div style={{
                    display:       'flex',
                    flexDirection: 'column',
                    gap:           `${SPACE.gapSm}px`,
                    width:         '100%',
                }}>
                    {safeItems.map((item, i) => {
                        const itemDelay = TIMING.fast + i * (TIMING.fast + TIMING.stagger);
                        const sp = spring({ frame: Math.max(0, frame - itemDelay), fps, config: SPRING.normal });
                        const ty = interpolate(sp, [0, 1], [30, 0]);
                        const op = interpolate(sp, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });
                        const isDone = item.done !== false; // default true

                        return (
                            <div
                                key={i}
                                style={{
                                    transform:     `translateY(${ty}px)`,
                                    opacity:       op,
                                    display:       'flex',
                                    alignItems:    'flex-start',
                                    gap:           '20px',
                                    background:    `${COLOR.white}05`,
                                    borderLeft:    `3px solid ${brandAccent}`,
                                    borderRadius:  '12px',
                                    padding:       '24px 28px',
                                }}
                            >
                                {/* Left: marker */}
                                <div style={{ paddingTop: '2px' }}>
                                    {style === 'check' && (
                                        <AnimatedCheckbox
                                            frame={frame}
                                            delay={itemDelay}
                                            done={isDone}
                                            brandAccent={brandAccent}
                                        />
                                    )}
                                    {style === 'numbered' && (
                                        <NumberBadge
                                            index={i}
                                            brandAccent={brandAccent}
                                            sansFont={sansFont}
                                        />
                                    )}
                                    {style === 'emoji' && item.icon && (
                                        <span style={{ fontSize: '32px', lineHeight: 1.25, display: 'block' }}>
                                            {item.icon}
                                        </span>
                                    )}
                                    {style === 'emoji' && !item.icon && (
                                        <NumberBadge
                                            index={i}
                                            brandAccent={brandAccent}
                                            sansFont={sansFont}
                                        />
                                    )}
                                </div>

                                {/* Right: text */}
                                <div style={{ flex: 1 }}>
                                    <span style={{
                                        fontFamily:    sansFont,
                                        fontSize:      `${TYPE.body.size}px`,
                                        fontWeight:    600,
                                        color:         COLOR.white,
                                        letterSpacing: `${TYPE.body.tracking}px`,
                                        lineHeight:    TYPE.body.lineHeight,
                                        display:       'block',
                                    }}>
                                        {item.text}
                                    </span>
                                    {item.sub && (
                                        <span style={{
                                            fontFamily:  sansFont,
                                            fontSize:    `${TYPE.caption.size}px`,
                                            fontWeight:  400,
                                            color:       COLOR.textMuted,
                                            lineHeight:  TYPE.caption.lineHeight,
                                            display:     'block',
                                            marginTop:   '6px',
                                        }}>
                                            {item.sub}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
