import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { SceneBg, TIMING, SPRING, SPACE, COLOR, TYPE, Z } from '../../foundation';

/**
 * HOOK_BROLL_TEXT — Chữ đè thẳng lên b-roll
 *
 * Archetype: HOOK_BROLL_TEXT
 * Act: 1 — HOOK
 *
 * Design rules:
 *   - Video b-roll full screen, KHÔNG có card hay box nền
 *   - Vignette gradient mạnh phía dưới để chữ đọc được
 *   - Chữ nằm ở dưới (mặc định) hoặc giữa màn hình
 *   - Từng LINE xuất hiện với spring snappy từ dưới lên
 *   - Text-shadow mạnh để đọc được trên mọi nền video
 *   - 1 line accent tuỳ chọn làm điểm nhấn
 *
 * Props:
 *   src:           Đường dẫn video b-roll (static file hoặc URL)
 *   lines[]:       Danh sách dòng text
 *   position:      'bottom' | 'center' — vị trí text block
 *   align:         'left' | 'center'
 *   brandAccent:   Màu accent thương hiệu
 *
 * Ví dụ Director JSON:
 * {
 *   "archetype": "HOOK_BROLL_TEXT",
 *   "scene_rhythm": "fast",
 *   "voice_text": "Mỗi ngày bạn trì hoãn là mỗi ngày đối thủ bứt phá.",
 *   "props": {
 *     "src": "broll/city_timelapse.mp4",
 *     "lines": [
 *       { "text": "Mỗi ngày trì hoãn",  "size": "hero",  "color": "white"  },
 *       { "text": "là mỗi ngày",        "size": "title", "color": "muted"  },
 *       { "text": "đối thủ bứt phá.",   "size": "hero",  "color": "accent" }
 *     ],
 *     "position": "bottom",
 *     "align": "left"
 *   }
 * }
 */

interface BrollLine {
    text:    string;
    size?:   'display' | 'hero' | 'title' | 'body' | 'caption';
    /** 'white' | 'accent' | 'muted' | hex */
    color?:  'white' | 'accent' | 'muted' | string;
    italic?: boolean;
    caps?:   boolean;
}

interface HookBrollTextProps {
    src?:          string;
    image_src?:    string;
    lines?:        BrollLine[];
    position?:     'bottom' | 'center';
    align?:        'left' | 'center';
    brandAccent?:  string;
    /** Vignette strength — chỉnh theo độ sáng của video */
    vignette?:     'light' | 'medium' | 'heavy';
}

export const HookBrollText: React.FC<HookBrollTextProps> = ({
    src = '',
    image_src,
    lines = [
        { text: 'Mỗi ngày trì hoãn',  size: 'hero',  color: 'white'  },
        { text: 'là 1 ngày',          size: 'title', color: 'muted'  },
        { text: 'đối thủ bứt phá.',   size: 'hero',  color: 'accent' },
    ],
    position = 'bottom',
    align = 'left',
    brandAccent = COLOR.accentDefault,
    vignette = 'heavy',
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    const { fontFamily: sansFont } = loadInter();

    const kenBurnsScale = interpolate(frame, [0, durationInFrames], [1.0, 1.10], { extrapolateRight: 'clamp' });

    // ── Exit — fade out trong 8 frames cuối ──────────────────────────────
    const EXIT_FRAMES = 8;
    const exitOpacity = interpolate(
        frame,
        [durationInFrames - EXIT_FRAMES, durationInFrames],
        [1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
    );

    // Text-shadow mạnh để đọc được trên mọi nền video
    const readabilityGlow = '0 2px 8px rgba(0,0,0,0.9), 0 4px 24px rgba(0,0,0,0.8), 0 8px 48px rgba(0,0,0,0.6)';

    const isBottom = position === 'bottom';

    // Auto-scale font size based on line length to prevent 1 word per line
    const scaledFontSize = (size: string, text: string): number => {
        const tokens = TYPE[size as keyof typeof TYPE] as { size: number };
        const base = tokens.size;
        const len  = text.trim().length;
        if (base >= 100) {
            if (len <= 5)  return base;
            if (len <= 10) return Math.round(base * 0.82);
            if (len <= 18) return Math.round(base * 0.68);
            return Math.round(base * 0.58);
        }
        return base;
    };

    return (
        <AbsoluteFill>
            {/* B-roll video nền */}
            {src ? (
                <SceneBg.Video src={src} />
            ) : image_src ? (
                // Ken Burns image fallback
                <AbsoluteFill style={{ overflow: 'hidden', background: '#000' }}>
                    <Img
                        src={image_src}
                        style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            transform: `scale(${kenBurnsScale})`,
                            transformOrigin: '55% 45%',
                        }}
                    />
                </AbsoluteFill>
            ) : (
                <SceneBg.Dark />
            )}

            {/* Vignette overlay — gradient từ dưới lên */}
            <SceneBg.Vignette strength={vignette} />

            {/* Thêm vignette 4 cạnh để tăng contrast */}
            <SceneBg.EdgeVignette opacity={0.4} />

            {/* Text block — zIndex: Z.content để không bị Vignette (z=1) đè lên */}
            <AbsoluteFill style={{
                justifyContent: isBottom ? 'flex-end' : 'center',
                alignItems: align === 'center' ? 'center' : 'flex-start',
                paddingTop: SPACE.safeTop,
                paddingBottom: isBottom ? SPACE.safeBottom + 20 : SPACE.safeBottom,
                paddingLeft: SPACE.padH,
                paddingRight: SPACE.padH,
                zIndex: Z.content,
            }}>
                <div style={{ width: '100%', opacity: exitOpacity }}>
                <div style={{
                    width: '100%',
                    textAlign: align,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: align === 'center' ? 'center' : 'flex-start',
                    gap: '0px',
                }}>
                    {lines.map((line, i) => {
                        const size   = line.size  || 'hero';
                        const tokens = TYPE[size];
                        const isItalic = line.italic ?? false;
                        const isCaps   = line.caps   ?? false;

                        const rawColor = line.color || 'white';
                        const textColor =
                            rawColor === 'accent' ? brandAccent
                          : rawColor === 'white'  ? COLOR.white
                          : rawColor === 'muted'  ? 'rgba(255,255,255,0.80)'
                          : rawColor;

                        // Stagger: line i xuất hiện sau i * TIMING.fast frames
                        const lineDelay = i * TIMING.fast;
                        const sp = spring({
                            frame: Math.max(0, frame - lineDelay),
                            fps,
                            config: SPRING.snappy,
                        });

                        const ty      = interpolate(sp, [0, 1], [50, 0]);
                        const opacity = interpolate(sp, [0, 0.2], [0, 1], { extrapolateRight: 'clamp' });

                        // Accent glow + extra readability shadow
                        const glowExtra = rawColor === 'accent'
                            ? `, 0 0 30px ${brandAccent}88, 0 0 60px ${brandAccent}44`
                            : '';
                        const shadowStyle = `${readabilityGlow}${glowExtra}`;

                        return (
                            <div
                                key={i}
                                style={{
                                    transform: `translateY(${ty}px)`,
                                    opacity,
                                    marginBottom: size === 'display' ? '-4px'
                                                : size === 'hero'    ? '-2px'
                                                : '4px',
                                }}
                            >
                                <span style={{
                                    fontFamily:    sansFont,
                                    fontSize:      `${scaledFontSize(size, line.text)}px`,
                                    fontWeight:    tokens.weight,
                                    letterSpacing: `${tokens.tracking}px`,
                                    lineHeight:    tokens.lineHeight,
                                    color:         textColor,
                                    textTransform: isCaps ? 'uppercase' : 'none',
                                    fontStyle:     isItalic ? 'italic' : 'normal',
                                    display:       'inline-block',
                                    textShadow:    shadowStyle,
                                }}>
                                    {line.text}
                                </span>
                            </div>
                        );
                    })}
                </div>
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
