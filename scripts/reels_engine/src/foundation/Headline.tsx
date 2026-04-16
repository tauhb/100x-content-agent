import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadPlayfair } from '@remotion/google-fonts/PlayfairDisplay';
import { TYPE, SPRING, COLOR, type TypeLevel, type SpringPreset } from './tokens';

/**
 * Headline — Type-scale aware text component
 *
 * Tự động apply đúng font-size, weight, letter-spacing từ design tokens.
 * Hỗ trợ word-by-word stagger animation và *highlight* syntax.
 *
 * Usage:
 *   <Headline level="hero" color="white" animate staggerDelay={4}>
 *     Đây là tiêu đề
 *   </Headline>
 *
 *   <Headline level="title" color="accent" brandAccent="#B6FF00">
 *     Highlight *từ khoá* này
 *   </Headline>
 */

export interface HeadlineProps {
    /** Cấp độ typography từ design tokens */
    level?: TypeLevel;
    /** Màu chữ — 'white' | 'accent' | hex string */
    color?: 'white' | 'accent' | string;
    /** Màu accent của thương hiệu (dùng khi color='accent' hoặc có *highlight*) */
    brandAccent?: string;
    /** Font family — 'sans' (Inter) | 'serif' (Playfair) */
    font?: 'sans' | 'serif';
    /** Text align */
    align?: 'left' | 'center' | 'right';
    /** Kích hoạt word-by-word stagger animation */
    animate?: boolean;
    /** Frames delay giữa mỗi từ (khi animate=true) */
    staggerDelay?: number;
    /** Frames delay trước khi bắt đầu animation */
    startDelay?: number;
    /** Spring preset cho entrance animation */
    spring?: SpringPreset;
    /** Text content — hỗ trợ *highlight* syntax */
    children: string;
    /** Style override */
    style?: React.CSSProperties;
    /** uppercase */
    caps?: boolean;
    /** italic */
    italic?: boolean;
}

export const Headline: React.FC<HeadlineProps> = ({
    level = 'hero',
    color = 'white',
    brandAccent = COLOR.accentDefault,
    font = 'sans',
    align = 'left',
    animate = false,
    staggerDelay = 4,
    startDelay = 0,
    spring: springPreset = 'snappy',
    children,
    style,
    caps = false,
    italic = false,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: sansFont } = loadInter();
    const { fontFamily: serifFont } = loadPlayfair();

    const tokens = TYPE[level];
    const fontFamily = font === 'serif' ? serifFont : sansFont;

    const resolvedColor = color === 'white' ? COLOR.white
        : color === 'accent' ? brandAccent
        : color;

    // ── Parse *highlight* syntax ──────────────────────────────
    // Tách text thành segments: normal | highlighted
    const segments = parseSegments(children);

    // ── Render ───────────────────────────────────────────────
    let wordIndex = 0;

    const rendered = segments.map((seg, segIdx) => {
        const isHighlight = seg.type === 'highlight';

        const words = seg.text.split(/(\s+)/);

        return words.map((word, wIdx) => {
            if (!word.trim()) {
                // Whitespace — render plain
                return <span key={`${segIdx}-${wIdx}`}>{word}</span>;
            }

            const currentWord = wordIndex;
            wordIndex++;

            if (!animate) {
                return (
                    <span
                        key={`${segIdx}-${wIdx}`}
                        style={getWordStyle(isHighlight, resolvedColor, brandAccent, fontFamily)}
                    >
                        {word}
                    </span>
                );
            }

            const wordDelay = startDelay + currentWord * staggerDelay;
            const sp = spring({
                frame: Math.max(0, frame - wordDelay),
                fps,
                config: SPRING[springPreset],
            });
            const ty = interpolate(sp, [0, 1], [28, 0]);
            const sc = interpolate(sp, [0, 1], [0.82, 1]);
            const op = interpolate(sp, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

            return (
                <span
                    key={`${segIdx}-${wIdx}`}
                    style={{
                        ...getWordStyle(isHighlight, resolvedColor, brandAccent, fontFamily),
                        display: 'inline-block',
                        transform: `translateY(${ty}px) scale(${sc})`,
                        opacity: op,
                    }}
                >
                    {word}
                </span>
            );
        });
    });

    return (
        <div style={{
            fontFamily,
            fontSize: `${tokens.size}px`,
            fontWeight: tokens.weight,
            letterSpacing: `${tokens.tracking}px`,
            lineHeight: tokens.lineHeight,
            color: resolvedColor,
            textAlign: align,
            textTransform: 'none',
            fontStyle: italic ? 'italic' : 'normal',
            wordBreak: 'keep-all',
            ...style,
        }}>
            {rendered}
        </div>
    );
};

// ── Helpers ────────────────────────────────────────────────

type Segment = { type: 'normal' | 'highlight'; text: string };

function parseSegments(text: string): Segment[] {
    const parts = text.split(/(\*[^*\n]+\*)/g);
    return parts.filter(p => p.length > 0).map(part => {
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
            return { type: 'highlight' as const, text: part.slice(1, -1) };
        }
        return { type: 'normal' as const, text: part };
    });
}

function getWordStyle(
    isHighlight: boolean,
    textColor: string,
    brandAccent: string,
    fontFamily: string,
): React.CSSProperties {
    if (!isHighlight) {
        return { color: textColor, fontFamily };
    }
    // Highlight: accent-colored text with subtle glow
    return {
        color: brandAccent,
        fontFamily,
        textShadow: `0 0 20px ${brandAccent}66`,
    };
}
