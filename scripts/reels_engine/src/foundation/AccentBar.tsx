import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { TIMING, COLOR } from './tokens';

/**
 * AccentBar — Animated accent bar / divider / underline
 *
 * Dùng làm:
 *   - Underline dưới headline (horizontal, wipe từ trái)
 *   - Divider giữa các section
 *   - Left accent bar bên cạnh quote
 *   - Progress indicator
 *   - Vertical divider giữa 2 cột
 *
 * Usage:
 *   <AccentBar direction="horizontal" width="60%" thickness={4} delay={8} glow />
 *   <AccentBar direction="vertical" height={120} thickness={6} />
 */

export interface AccentBarProps {
    direction?: 'horizontal' | 'vertical';
    /** CSS width — chỉ dùng cho horizontal */
    width?: string | number;
    /** CSS height — chỉ dùng cho vertical */
    height?: string | number;
    /** Độ dày thanh (px) */
    thickness?: number;
    /** Kích hoạt wipe animation (xuất hiện dần) */
    animate?: boolean;
    /** Frames delay trước khi bắt đầu wipe */
    delay?: number;
    /** Duration của wipe (frames) */
    duration?: number;
    /** Màu thanh */
    color?: string;
    /** Hiệu ứng glow (box-shadow) */
    glow?: boolean;
    /** Border radius */
    radius?: number;
    /** Style override */
    style?: React.CSSProperties;
}

export const AccentBar: React.FC<AccentBarProps> = ({
    direction = 'horizontal',
    width = '100%',
    height = '100%',
    thickness = 4,
    animate = true,
    delay = 0,
    duration = TIMING.medium,
    color = COLOR.accentDefault,
    glow = true,
    radius = 3,
    style,
}) => {
    const frame = useCurrentFrame();
    useVideoConfig(); // ensure hook is called in valid context

    const delayedFrame = Math.max(0, frame - delay);

    const progress = animate
        ? interpolate(delayedFrame, [0, duration], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
          })
        : 1;

    const glowStyle = glow
        ? { boxShadow: `0 0 14px 2px ${color}88, 0 0 30px 6px ${color}44` }
        : {};

    if (direction === 'horizontal') {
        const resolvedWidth = typeof width === 'number' ? `${width}px` : width;

        return (
            <div
                style={{
                    width: resolvedWidth,
                    overflow: 'hidden',
                    flexShrink: 0,
                    ...style,
                }}
            >
                <div
                    style={{
                        height: `${thickness}px`,
                        background: color,
                        borderRadius: `${radius}px`,
                        width: `${progress * 100}%`,
                        ...glowStyle,
                    }}
                />
            </div>
        );
    }

    // Vertical
    const resolvedHeight = typeof height === 'number' ? `${height}px` : height;

    return (
        <div
            style={{
                height: resolvedHeight,
                overflow: 'hidden',
                flexShrink: 0,
                ...style,
            }}
        >
            <div
                style={{
                    width: `${thickness}px`,
                    background: color,
                    borderRadius: `${radius}px`,
                    height: `${progress * 100}%`,
                    ...glowStyle,
                }}
            />
        </div>
    );
};

/**
 * QuoteBar — Shorthand cho left accent bar của quote
 * Thanh dọc bên trái, tự fill chiều cao theo content
 */
export const QuoteBar: React.FC<{
    color?: string;
    thickness?: number;
    delay?: number;
    animate?: boolean;
}> = ({ color = COLOR.accentDefault, thickness = 6, delay = 0, animate = true }) => (
    <AccentBar
        direction="vertical"
        height="100%"
        thickness={thickness}
        color={color}
        delay={delay}
        animate={animate}
        glow={true}
        style={{ alignSelf: 'stretch', marginRight: '0' }}
    />
);
