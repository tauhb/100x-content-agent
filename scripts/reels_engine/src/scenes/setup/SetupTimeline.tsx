import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { SceneBg, AccentBar, TIMING, SPRING, SPACE, COLOR, TYPE, Z, CANVAS } from '../../foundation';

/**
 * SETUP_TIMELINE — Hành trình theo thời gian (Vertical layout + SVG connector)
 *
 * Archetype: SETUP_TIMELINE
 * Act: 2 — SETUP
 *
 * Design rules:
 *   - Layout dọc: dot trái + text phải
 *   - SVG line animate từ trên xuống nối các dot
 *   - Mỗi item: dot spring bouncy → text slide in từ phải
 *   - Tối đa 5 mốc
 */

interface TimelineEvent {
    year?: string;
    title: string;
    sub?: string;
}

interface SetupTimelineProps {
    headline?: string;
    events?: TimelineEvent[];
    brandAccent?: string;
}

const DOT_R      = 18;   // dot radius px
const DOT_X      = SPACE.padH + DOT_R;  // dot center X
const HEADLINE_H = 180;  // headline + accent bar zone

export const SetupTimeline: React.FC<SetupTimelineProps> = ({
    headline    = 'Hành Trình',
    events      = [
        { year: '2020', title: 'Khởi đầu', sub: 'Từ số 0' },
        { year: '2021', title: 'Học hỏi', sub: 'Thất bại đầu tiên' },
        { year: '2022', title: 'Bứt phá', sub: 'Revenue ×10' },
        { year: '2023', title: 'Tự do', sub: 'Passive income' },
    ],
    brandAccent = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: sansFont } = loadInter();

    const safeEvents = events.slice(0, 5);
    const count      = safeEvents.length;

    // ── Layout math ────────────────────────────────────────────────────
    const contentTop    = SPACE.safeTop + HEADLINE_H;
    const contentBottom = CANVAS.height - SPACE.safeBottom;
    const contentH      = contentBottom - contentTop;
    const itemSpacing   = contentH / count;

    const dotY = (i: number) => contentTop + i * itemSpacing + itemSpacing / 2;

    // ── Headline entrance ──────────────────────────────────────────────
    const hlSp = spring({ frame, fps, config: SPRING.snappy });
    const hlOp = interpolate(hlSp, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });
    const hlTy = interpolate(hlSp, [0, 1], [-30, 0]);

    return (
        <AbsoluteFill>
            <SceneBg.Dark />

            {/* Ambient glow left side */}
            <AbsoluteFill style={{
                background: `radial-gradient(ellipse at 10% 50%, ${brandAccent}10 0%, transparent 55%)`,
                pointerEvents: 'none',
            }} />

            {/* ── Headline ── */}
            <div style={{
                position: 'absolute',
                top: SPACE.safeTop,
                left: SPACE.padH,
                right: SPACE.padH,
                opacity: hlOp,
                transform: `translateY(${hlTy}px)`,
                zIndex: Z.content,
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
                <AccentBar direction="horizontal" width="60px" thickness={4} color={brandAccent} animate delay={TIMING.snap} duration={TIMING.fast} glow radius={2} />
            </div>

            {/* ── SVG connector lines ── */}
            <svg
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: Z.content }}
                viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`}
            >
                {safeEvents.slice(0, -1).map((_, i) => {
                    const y1 = dotY(i) + DOT_R + 4;
                    const y2 = dotY(i + 1) - DOT_R - 4;
                    const lineLen = y2 - y1;

                    // Line wipe: starts after dot i appears (delay i*14 + 8)
                    const lineDelay = i * 14 + 14;
                    const lineProg = interpolate(
                        frame,
                        [lineDelay, lineDelay + TIMING.medium],
                        [0, 1],
                        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
                    );
                    const drawnLen = lineLen * lineProg;

                    return (
                        <g key={i}>
                            {/* Background faint line */}
                            <line
                                x1={DOT_X} y1={y1} x2={DOT_X} y2={y2}
                                stroke={`${COLOR.white}15`}
                                strokeWidth={2}
                            />
                            {/* Animated accent line */}
                            <line
                                x1={DOT_X} y1={y1} x2={DOT_X} y2={y1 + drawnLen}
                                stroke={brandAccent}
                                strokeWidth={3}
                                strokeLinecap="round"
                                opacity={0.8}
                                style={{ filter: `drop-shadow(0 0 6px ${brandAccent}88)` }}
                            />
                        </g>
                    );
                })}
            </svg>

            {/* ── Timeline items ── */}
            {safeEvents.map((evt, i) => {
                const dotDelay  = i * 14;
                const dotSp     = spring({ frame: Math.max(0, frame - dotDelay), fps, config: SPRING.bouncy });
                const dotScale  = interpolate(dotSp, [0, 1], [0, 1]);
                const dotOp     = interpolate(dotSp, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });

                const textDelay = dotDelay + 6;
                const textSp    = spring({ frame: Math.max(0, frame - textDelay), fps, config: SPRING.normal });
                const textOp    = interpolate(textSp, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });
                const textTx    = interpolate(textSp, [0, 1], [40, 0]);

                const cy = dotY(i);

                return (
                    <div key={i} style={{ position: 'absolute', top: cy, left: 0, right: SPACE.padH, zIndex: Z.content, transform: 'translateY(-50%)' }}>
                        {/* Dot */}
                        <div style={{
                            position:     'absolute',
                            left:         DOT_X - DOT_R,
                            top:          '50%',
                            transform:    `translateY(-50%) scale(${dotScale})`,
                            opacity:      dotOp,
                            width:        DOT_R * 2,
                            height:       DOT_R * 2,
                            borderRadius: '50%',
                            background:   brandAccent,
                            boxShadow:    `0 0 18px ${brandAccent}99, 0 0 36px ${brandAccent}44`,
                        }}>
                            {/* Inner dot */}
                            <div style={{
                                position:     'absolute',
                                inset:        '5px',
                                borderRadius: '50%',
                                background:   COLOR.black,
                            }} />
                        </div>

                        {/* Text block */}
                        <div style={{
                            marginLeft:  DOT_X + DOT_R + 32,
                            opacity:     textOp,
                            transform:   `translateX(${textTx}px)`,
                        }}>
                            {evt.year && (
                                <span style={{
                                    fontFamily:    sansFont,
                                    fontSize:      `${TYPE.caption.size}px`,
                                    fontWeight:    700,
                                    color:         brandAccent,
                                    letterSpacing: '2px',
                                    display:       'block',
                                    marginBottom:  '6px',
                                    textTransform: 'uppercase',
                                }}>
                                    {evt.year}
                                </span>
                            )}
                            <span style={{
                                fontFamily: sansFont,
                                fontSize:   `${TYPE.body.size}px`,
                                fontWeight: 700,
                                color:      COLOR.white,
                                lineHeight: 1.2,
                                display:    'block',
                            }}>
                                {evt.title}
                            </span>
                            {evt.sub && (
                                <span style={{
                                    fontFamily: sansFont,
                                    fontSize:   `${TYPE.caption.size}px`,
                                    fontWeight: 400,
                                    color:      COLOR.textMuted,
                                    lineHeight: 1.35,
                                    display:    'block',
                                    marginTop:  '6px',
                                }}>
                                    {evt.sub}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </AbsoluteFill>
    );
};
