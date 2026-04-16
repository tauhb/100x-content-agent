import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { TIMING, SPRING, type SpringPreset } from './tokens';

/**
 * AnimateIn — Universal animation wrapper
 *
 * Bọc bất kỳ element nào để cho nó entrance animation.
 * Tất cả layouts phải dùng component này thay vì tự viết animation.
 *
 * Usage:
 *   <AnimateIn type="slide-up" delay={TIMING.fast}>
 *     <div>Nội dung</div>
 *   </AnimateIn>
 */

export type AnimateType =
    | 'slide-up'     // translateY(40px→0) + fade — card, text block
    | 'slide-down'   // translateY(-40px→0) + fade — dropdown, notification
    | 'slide-left'   // translateX(60px→0) + fade — list items từ phải vào
    | 'slide-right'  // translateX(-60px→0) + fade — list items từ trái vào
    | 'scale-pop'    // scale(0.6→1) spring bounce — số hero, badge, icon
    | 'scale-up'     // scale(0.88→1) + fade — card, subtle entrance
    | 'fade'         // opacity only — background text, subtext
    | 'wipe-right'   // clip-path: inset(0 100%→0% 0 0) — reveal từ trái sang
    | 'none';        // instant, không animation

export interface AnimateInProps {
    /** Loại animation */
    type?: AnimateType;
    /** Delay trước khi bắt đầu (frames) */
    delay?: number;
    /** Spring preset — chỉ áp dụng cho các type dùng spring */
    spring?: SpringPreset;
    /** Override travel distance (px) cho slide variants */
    distance?: number;
    /** Style override cho wrapper div */
    style?: React.CSSProperties;
    children: React.ReactNode;
}

export const AnimateIn: React.FC<AnimateInProps> = ({
    type = 'slide-up',
    delay = 0,
    spring: springPreset = 'normal',
    distance,
    style,
    children,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const delayedFrame = Math.max(0, frame - delay);

    // ── Spring-based animations ──────────────────────────────
    const sp = spring({
        frame: delayedFrame,
        fps,
        config: SPRING[springPreset],
    });

    // ── Linear fade (for 'fade' type & wipe) ─────────────────
    const fadeProgress = interpolate(delayedFrame, [0, TIMING.medium], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // ── Wipe clip progress ────────────────────────────────────
    const wipeProgress = interpolate(delayedFrame, [0, TIMING.medium], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    let animStyle: React.CSSProperties = {};

    switch (type) {
        case 'slide-up': {
            const dist = distance ?? 40;
            const ty = interpolate(sp, [0, 1], [dist, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const op = interpolate(sp, [0, 0.3], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            animStyle = { transform: `translateY(${ty}px)`, opacity: op };
            break;
        }
        case 'slide-down': {
            const dist = distance ?? 40;
            const ty = interpolate(sp, [0, 1], [-dist, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const op = interpolate(sp, [0, 0.3], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            animStyle = { transform: `translateY(${ty}px)`, opacity: op };
            break;
        }
        case 'slide-left': {
            const dist = distance ?? 60;
            const tx = interpolate(sp, [0, 1], [dist, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const op = interpolate(sp, [0, 0.3], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            animStyle = { transform: `translateX(${tx}px)`, opacity: op };
            break;
        }
        case 'slide-right': {
            const dist = distance ?? 60;
            const tx = interpolate(sp, [0, 1], [-dist, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const op = interpolate(sp, [0, 0.3], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            animStyle = { transform: `translateX(${tx}px)`, opacity: op };
            break;
        }
        case 'scale-pop': {
            const sc = interpolate(sp, [0, 1], [0.55, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const op = interpolate(sp, [0, 0.25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            animStyle = { transform: `scale(${sc})`, opacity: op };
            break;
        }
        case 'scale-up': {
            const sc = interpolate(sp, [0, 1], [0.88, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const op = interpolate(sp, [0, 0.35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            animStyle = { transform: `scale(${sc})`, opacity: op };
            break;
        }
        case 'fade': {
            animStyle = { opacity: fadeProgress };
            break;
        }
        case 'wipe-right': {
            // Reveals from left to right using clip-path
            const pct = (1 - wipeProgress) * 100;
            animStyle = { clipPath: `inset(0 ${pct.toFixed(1)}% 0 0)` };
            break;
        }
        case 'none':
        default:
            animStyle = {};
            break;
    }

    return (
        <div style={{ ...animStyle, ...style }}>
            {children}
        </div>
    );
};

/**
 * useAnimateIn — Hook variant khi cần giá trị thô (không muốn thêm div wrapper)
 *
 * Returns { opacity, transform } style object.
 */
export function useAnimateIn(
    type: AnimateType = 'slide-up',
    delay: number = 0,
    springPreset: SpringPreset = 'normal',
    distance?: number,
): React.CSSProperties {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const delayedFrame = Math.max(0, frame - delay);

    const sp = spring({ frame: delayedFrame, fps, config: SPRING[springPreset] });
    const fadeProgress = interpolate(delayedFrame, [0, TIMING.medium], [0, 1], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });

    switch (type) {
        case 'slide-up': {
            const dist = distance ?? 40;
            return {
                transform: `translateY(${interpolate(sp, [0, 1], [dist, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
                opacity: interpolate(sp, [0, 0.3], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            };
        }
        case 'slide-left': {
            const dist = distance ?? 60;
            return {
                transform: `translateX(${interpolate(sp, [0, 1], [dist, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
                opacity: interpolate(sp, [0, 0.3], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            };
        }
        case 'slide-right': {
            const dist = distance ?? 60;
            return {
                transform: `translateX(${interpolate(sp, [0, 1], [-dist, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
                opacity: interpolate(sp, [0, 0.3], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            };
        }
        case 'scale-pop': {
            return {
                transform: `scale(${interpolate(sp, [0, 1], [0.55, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
                opacity: interpolate(sp, [0, 0.25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            };
        }
        case 'fade': {
            return { opacity: fadeProgress };
        }
        default:
            return {};
    }
}
