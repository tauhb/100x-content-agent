import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { TYPE, TIMING, COLOR, type TypeLevel } from './tokens';

/**
 * CountUp — Animated number counter
 *
 * Số đếm từ `from` → `to` với easing, hỗ trợ prefix/suffix, số thập phân.
 * Dùng cho: số liệu thống kê, % tăng trưởng, thời gian đếm ngược.
 *
 * Usage:
 *   <CountUp to={93} suffix="%" level="display" delay={8} />
 *   <CountUp from={0} to={10} prefix="x" level="hero" easing="expo" />
 *   <CountUp to={1000000} format="compact" suffix="+" />
 */

export type CountEasing = 'linear' | 'ease-out' | 'expo' | 'spring-snap';

export interface CountUpProps {
    /** Giá trị bắt đầu */
    from?: number;
    /** Giá trị kết thúc */
    to: number;
    /** Tiền tố (vd: "x", "$", "+") */
    prefix?: string;
    /** Hậu tố (vd: "%", "k", "+") */
    suffix?: string;
    /** Số chữ số thập phân */
    decimals?: number;
    /** Loại easing */
    easing?: CountEasing;
    /** Duration animation (frames) */
    duration?: number;
    /** Delay trước khi bắt đầu (frames) */
    delay?: number;
    /** Typography level */
    level?: TypeLevel;
    /** Màu chữ số chính */
    color?: string;
    /** Màu prefix/suffix (mặc định mờ hơn) */
    labelColor?: string;
    /** Font style */
    fontStyle?: 'sans' | 'serif';
    /** Compact format: 1000→"1K", 1000000→"1M" */
    format?: 'number' | 'compact';
    /** Thêm comma separator (1000 → 1,000) */
    separator?: boolean;
    /** Style override cho container */
    style?: React.CSSProperties;
    /** Hiển thị glow text shadow */
    glow?: boolean;
}

export const CountUp: React.FC<CountUpProps> = ({
    from = 0,
    to,
    prefix = '',
    suffix = '',
    decimals = 0,
    easing = 'ease-out',
    duration = TIMING.slow * 2, // 48 frames = 1.6s
    delay = 0,
    level = 'display',
    color = COLOR.white,
    labelColor,
    fontStyle = 'sans',
    format = 'number',
    separator = false,
    style,
    glow = false,
}) => {
    const frame = useCurrentFrame();
    const { fontFamily } = loadInter();

    const tokens = TYPE[level];
    const delayedFrame = Math.max(0, frame - delay);

    // ── Easing progress ──────────────────────────────────────
    let progress: number;

    if (easing === 'linear') {
        progress = interpolate(delayedFrame, [0, duration], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        });
    } else if (easing === 'ease-out') {
        const raw = interpolate(delayedFrame, [0, duration], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        });
        progress = 1 - Math.pow(1 - raw, 3); // cubic ease-out
    } else if (easing === 'expo') {
        const raw = interpolate(delayedFrame, [0, duration], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        });
        progress = raw === 0 ? 0 : Math.pow(2, 10 * raw - 10);
    } else {
        // spring-snap: fast then locks
        const raw = interpolate(delayedFrame, [0, duration * 0.6], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        });
        progress = 1 - Math.pow(1 - raw, 4);
    }

    const current = from + (to - from) * progress;

    // ── Format number ────────────────────────────────────────
    let displayValue: string;

    if (format === 'compact') {
        displayValue = formatCompact(current);
    } else {
        const rounded = parseFloat(current.toFixed(decimals));
        if (separator) {
            displayValue = rounded.toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            });
        } else {
            displayValue = rounded.toFixed(decimals);
        }
    }

    const effectiveLabelColor = labelColor ?? `${color}99`;
    const glowStyle = glow
        ? { textShadow: `0 0 40px ${color}88, 0 0 80px ${color}44` }
        : {};

    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: '4px',
            fontFamily,
            ...style,
        }}>
            {prefix && (
                <span style={{
                    fontSize: `${tokens.size * 0.5}px`,
                    fontWeight: tokens.weight,
                    color: effectiveLabelColor,
                    letterSpacing: `${tokens.tracking}px`,
                    fontStyle: fontStyle === 'serif' ? 'italic' : 'normal',
                }}>
                    {prefix}
                </span>
            )}

            <span style={{
                fontSize: `${tokens.size}px`,
                fontWeight: tokens.weight,
                letterSpacing: `${tokens.tracking}px`,
                lineHeight: tokens.lineHeight,
                color,
                fontVariantNumeric: 'tabular-nums',
                ...glowStyle,
            }}>
                {displayValue}
            </span>

            {suffix && (
                <span style={{
                    fontSize: `${tokens.size * 0.45}px`,
                    fontWeight: tokens.weight,
                    color: effectiveLabelColor,
                    letterSpacing: `${tokens.tracking}px`,
                    marginLeft: '2px',
                }}>
                    {suffix}
                </span>
            )}
        </div>
    );
};

// ── Compact format helper ─────────────────────────────────

function formatCompact(n: number): string {
    const abs = Math.abs(n);
    if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
    return n.toFixed(0);
}
