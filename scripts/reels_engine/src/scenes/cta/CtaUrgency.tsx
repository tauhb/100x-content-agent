import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { TIMING, SPRING, SPACE, COLOR, TYPE, Z } from '../../foundation';

/**
 * CTA_URGENCY — Pulsing border toàn màn hình + countdown timer visual + CTA text
 *
 * Archetype: CTA_URGENCY
 * Act: 5 — CTA
 *
 * Design rules:
 *   - Nền đen với pulsing border accent toàn màn hình
 *   - 4 corner accents (2 lines mỗi góc) spring in từ ngoài vào
 *   - Timer display: label + countdown dạng số lớn, colon nhấp nháy
 *   - CTA lines stagger spring in từ dưới, highlight line có glow
 *   - Urgency text nhỏ italic pulsing nhẹ ở cuối
 *
 * Ví dụ Director JSON:
 * {
 *   "archetype": "CTA_URGENCY",
 *   "scene_rhythm": "slow",
 *   "voice_text": "Ưu đãi kết thúc sau 24 giờ. Bắt đầu ngay hôm nay.",
 *   "props": {
 *     "lines": [
 *       { "text": "Bắt đầu ngay hôm nay.", "highlight": true },
 *       { "text": "Đừng để ngày mai quyết định." }
 *     ],
 *     "timer_label": "Ưu đãi kết thúc sau",
 *     "timer_display": "23:59:59",
 *     "urgency_text": "Hôm nay. Không phải ngày mai.",
 *     "brandAccent": "#B6FF00"
 *   }
 * }
 */

interface CtaLine {
    text:       string;
    highlight?: boolean;
}

interface CtaUrgencyProps {
    lines?:         CtaLine[];
    timer_label?:   string;
    timer_display?: string;
    urgency_text?:  string;
    brandAccent?:   string;
}

/** Corner accent: draws 2 lines (horizontal + vertical) at a given corner */
const CornerAccent: React.FC<{
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    color:    string;
    progress: number; // 0→1 spring progress
    size?:    number;
    thickness?: number;
}> = ({ position, color, progress, size = 44, thickness = 4 }) => {
    const len = interpolate(progress, [0, 1], [0, size]);

    const isTop    = position.startsWith('top');
    const isLeft   = position.endsWith('left');

    const corner: React.CSSProperties = {
        position: 'absolute',
        top:      isTop    ? 0 : 'auto',
        bottom:   !isTop   ? 0 : 'auto',
        left:     isLeft   ? 0 : 'auto',
        right:    !isLeft  ? 0 : 'auto',
        width:    `${size}px`,
        height:   `${size}px`,
    };

    const hLine: React.CSSProperties = {
        position:  'absolute',
        top:       isTop    ? 0 : 'auto',
        bottom:    !isTop   ? 0 : 'auto',
        left:      isLeft   ? 0 : 'auto',
        right:     !isLeft  ? 0 : 'auto',
        width:     `${len}px`,
        height:    `${thickness}px`,
        background: color,
        borderRadius: '2px',
    };

    const vLine: React.CSSProperties = {
        position:  'absolute',
        top:       isTop    ? 0 : 'auto',
        bottom:    !isTop   ? 0 : 'auto',
        left:      isLeft   ? 0 : 'auto',
        right:     !isLeft  ? 0 : 'auto',
        width:     `${thickness}px`,
        height:    `${len}px`,
        background: color,
        borderRadius: '2px',
    };

    return (
        <div style={corner}>
            <div style={hLine} />
            <div style={vLine} />
        </div>
    );
};

export const CtaUrgency: React.FC<CtaUrgencyProps> = ({
    lines = [
        { text: 'Bắt đầu ngay hôm nay.',          highlight: true },
        { text: 'Đừng để ngày mai quyết định.' },
    ],
    timer_label   = 'Ưu đãi kết thúc sau',
    timer_display = '23:59:59',
    urgency_text  = 'Hôm nay. Không phải ngày mai.',
    brandAccent   = COLOR.accentDefault,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: sansFont } = loadInter();

    // ── Pulsing border ─────────────────────────────────────────
    const borderPulse = interpolate(
        frame % 40,
        [0, 20, 40],
        [0.3, 1.0, 0.3],
        { extrapolateRight: 'clamp' }
    );

    // ── Corner accents spring in (4 corners, staggered) ────────
    const cornerDelays = [0, TIMING.snap, TIMING.fast, TIMING.fast + TIMING.snap];
    const cornerSprings = cornerDelays.map(delay =>
        spring({ frame: Math.max(0, frame - delay), fps, config: SPRING.snappy })
    );

    // ── Timer spring in ────────────────────────────────────────
    const timerDelay = TIMING.snap;
    const timerSp    = spring({ frame: Math.max(0, frame - timerDelay), fps, config: SPRING.bouncy });
    const timerTy    = interpolate(timerSp, [0, 1], [60, 0]);
    const timerOp    = interpolate(timerSp, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

    // Colon blink
    const colonOp = interpolate(
        frame % 15,
        [0, 7, 15],
        [1, 0.2, 1],
        { extrapolateRight: 'clamp' }
    );

    // Parse timer_display into segments split by ":"
    const timerSegments = timer_display.split(':');

    // ── CTA lines stagger ──────────────────────────────────────
    const ctaBaseDelay = timerDelay + TIMING.medium;

    // ── Urgency text ───────────────────────────────────────────
    const urgencyDelay = ctaBaseDelay + lines.length * TIMING.fast + TIMING.medium;
    const urgencyOp    = interpolate(
        frame,
        [urgencyDelay, urgencyDelay + TIMING.medium],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    // Subtle pulsing
    const urgencyPulse = interpolate(
        frame % 60,
        [0, 30, 60],
        [0.6, 1.0, 0.6],
        { extrapolateRight: 'clamp' }
    );

    return (
        <AbsoluteFill style={{ background: COLOR.black }}>

            {/* ── Pulsing border (full-screen AbsoluteFill) ── */}
            <AbsoluteFill style={{
                border:      `4px solid ${brandAccent}`,
                opacity:     borderPulse,
                boxShadow:   `inset 0 0 60px ${brandAccent}22, 0 0 60px ${brandAccent}44`,
                pointerEvents: 'none',
                zIndex:      Z.overlay,
            }} />

            {/* ── Corner accents ── */}
            <AbsoluteFill style={{ pointerEvents: 'none', zIndex: Z.overlay }}>
                {(
                    ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const
                ).map((pos, i) => (
                    <CornerAccent
                        key={pos}
                        position={pos}
                        color={brandAccent}
                        progress={cornerSprings[i]}
                        size={44}
                        thickness={4}
                    />
                ))}
            </AbsoluteFill>

            {/* ── Main content ── */}
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

                {/* ── Timer display ── */}
                <div style={{
                    transform:  `translateY(${timerTy}px)`,
                    opacity:    timerOp,
                    display:    'flex',
                    flexDirection: 'column',
                    alignItems:   'center',
                    gap:         `${SPACE.gap}px`,
                    background:   'rgba(0,0,0,0.6)',
                    border:       `2px solid ${brandAccent}`,
                    borderRadius: '16px',
                    padding:      '32px 60px',
                    width:        '100%',
                }}>
                    {/* Timer label */}
                    <span style={{
                        fontFamily:    sansFont,
                        fontSize:      `${TYPE.caption.size}px`,
                        fontWeight:    TYPE.caption.weight,
                        letterSpacing: `${TYPE.caption.tracking}px`,
                        color:         COLOR.textSecondary,
                        textTransform: 'uppercase',
                    }}>
                        {timer_label}
                    </span>

                    {/* Timer digits */}
                    <div style={{
                        display:    'flex',
                        alignItems: 'center',
                        gap:        '4px',
                    }}>
                        {timerSegments.map((seg, si) => (
                            <React.Fragment key={si}>
                                {/* Each digit character individually */}
                                <div style={{ display: 'flex', gap: '2px' }}>
                                    {seg.split('').map((ch, ci) => (
                                        <span
                                            key={ci}
                                            style={{
                                                fontFamily:    sansFont,
                                                fontSize:      '80px',
                                                fontWeight:    900,
                                                color:         brandAccent,
                                                lineHeight:    1,
                                                letterSpacing: '-2px',
                                                textShadow:    `0 0 30px ${brandAccent}88`,
                                                display:       'inline-block',
                                                fontVariantNumeric: 'tabular-nums',
                                            }}
                                        >
                                            {ch}
                                        </span>
                                    ))}
                                </div>
                                {/* Colon separator (blinks) */}
                                {si < timerSegments.length - 1 && (
                                    <span style={{
                                        fontFamily: sansFont,
                                        fontSize:   '80px',
                                        fontWeight: 900,
                                        color:      brandAccent,
                                        lineHeight: 1,
                                        opacity:    colonOp,
                                        display:    'inline-block',
                                        width:      '32px',
                                        textAlign:  'center',
                                        textShadow: `0 0 20px ${brandAccent}66`,
                                    }}>
                                        :
                                    </span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* ── CTA lines ── */}
                <div style={{
                    width:         '100%',
                    display:       'flex',
                    flexDirection: 'column',
                    alignItems:    'flex-start',
                    gap:           `${SPACE.gapSm}px`,
                }}>
                    {lines.map((line, i) => {
                        const delay    = ctaBaseDelay + i * TIMING.fast;
                        const lineSp   = spring({ frame: Math.max(0, frame - delay), fps, config: SPRING.snappy });
                        const ty       = interpolate(lineSp, [0, 1], [50, 0]);
                        const op       = interpolate(lineSp, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

                        return (
                            <div key={i} style={{
                                transform:  `translateY(${ty}px)`,
                                opacity:    op,
                            }}>
                                <span style={{
                                    fontFamily:    sansFont,
                                    fontSize:      `${TYPE.title.size}px`,
                                    fontWeight:    line.highlight ? 900 : 600,
                                    letterSpacing: `${TYPE.title.tracking}px`,
                                    lineHeight:    TYPE.title.lineHeight,
                                    color:         line.highlight ? brandAccent : COLOR.white,
                                    display:       'block',
                                    textShadow:    line.highlight
                                        ? `0 0 30px ${brandAccent}88, 0 0 60px ${brandAccent}44`
                                        : 'none',
                                }}>
                                    {line.text}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* ── Urgency text ── */}
                {urgency_text && (
                    <div style={{
                        opacity:   urgencyOp * urgencyPulse,
                        width:     '100%',
                    }}>
                        <span style={{
                            fontFamily:    sansFont,
                            fontSize:      `${TYPE.body.size}px`,
                            fontWeight:    400,
                            letterSpacing: `${TYPE.body.tracking}px`,
                            lineHeight:    TYPE.body.lineHeight,
                            color:         COLOR.textSecondary,
                            fontStyle:     'italic',
                            display:       'block',
                        }}>
                            {urgency_text}
                        </span>
                    </div>
                )}

            </AbsoluteFill>
        </AbsoluteFill>
    );
};
