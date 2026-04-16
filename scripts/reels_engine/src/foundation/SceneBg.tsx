import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile, interpolate, useCurrentFrame } from 'remotion';
import { COLOR, Z } from './tokens';

/**
 * SceneBg — Background system
 *
 * Cung cấp tất cả background variants và overlay helpers.
 * Mọi layout dùng 1 trong các component dưới đây làm nền,
 * KHÔNG tự viết background CSS inline.
 *
 * ── BACKGROUNDS ──────────────────────────────────────────────
 *   <SceneBg.Black />           — Nền đen tuyền
 *   <SceneBg.Dark />            — Nền đen có radial gradient ấm
 *   <SceneBg.DarkCool />        — Nền đen có radial gradient lạnh
 *   <SceneBg.Accent />          — Nền solid màu accent
 *   <SceneBg.Grid />            — Nền đen + lưới trắng mờ
 *   <SceneBg.SplitH />          — Nền chia ngang: trên tối / dưới màu
 *   <SceneBg.SplitV />          — Nền chia dọc: trái / phải
 *
 * ── VIDEO BACKGROUND ─────────────────────────────────────────
 *   <SceneBg.Video src={...} />              — Video full screen
 *   <SceneBg.VideoAmbient src={...} opacity={0.15} />  — Video mờ ambient
 *
 * ── OVERLAYS (đặt sau video) ─────────────────────────────────
 *   <SceneBg.Vignette />        — Gradient tối từ dưới lên (để chữ đọc được)
 *   <SceneBg.DarkOverlay />     — Lớp đen mờ đồng đều
 *   <SceneBg.BottomFade />      — Fade tối chỉ phần dưới
 */

// ─────────────────────────────────────────────
// BACKGROUND COMPONENTS
// ─────────────────────────────────────────────

const Black: React.FC = () => (
    <AbsoluteFill style={{ background: COLOR.black, zIndex: Z.bg }} />
);

const Dark: React.FC<{ warm?: boolean }> = ({ warm = false }) => (
    <AbsoluteFill style={{
        background: warm
            ? 'radial-gradient(ellipse at 50% 60%, #1a1208 0%, #080808 70%)'
            : 'radial-gradient(ellipse at 50% 40%, #101010 0%, #040404 75%)',
        zIndex: Z.bg,
    }} />
);

const DarkCool: React.FC = () => (
    <AbsoluteFill style={{
        background: 'radial-gradient(ellipse at 50% 30%, #080f18 0%, #020408 75%)',
        zIndex: Z.bg,
    }} />
);

const Accent: React.FC<{ color?: string; gradient?: boolean }> = ({
    color = COLOR.accentDefault,
    gradient = false,
}) => (
    <AbsoluteFill style={{
        background: gradient
            ? `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`
            : color,
        zIndex: Z.bg,
    }} />
);

const Grid: React.FC<{
    color?: string;
    cellSize?: number;
    opacity?: number;
}> = ({ color = 'rgba(255,255,255,0.14)', cellSize = 80, opacity = 1 }) => (
    <>
        <AbsoluteFill style={{ background: COLOR.black, zIndex: Z.bg }} />
        <AbsoluteFill style={{ opacity, zIndex: Z.bgGrid }}>
            <svg width="100%" height="100%" style={{ position: 'absolute' }}>
                <defs>
                    <pattern id="sceneBgGrid" width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
                        <path
                            d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`}
                            fill="none"
                            stroke={color}
                            strokeWidth="0.8"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#sceneBgGrid)" />
            </svg>
        </AbsoluteFill>
    </>
);

const SplitH: React.FC<{
    topColor?: string;
    bottomColor?: string;
    splitAt?: string; // CSS percentage, e.g. "50%"
}> = ({ topColor = COLOR.darkBg, bottomColor = COLOR.accentDefault, splitAt = '50%' }) => (
    <AbsoluteFill style={{
        background: `linear-gradient(to bottom, ${topColor} 0%, ${topColor} ${splitAt}, ${bottomColor} ${splitAt}, ${bottomColor} 100%)`,
        zIndex: Z.bg,
    }} />
);

const SplitV: React.FC<{
    leftColor?: string;
    rightColor?: string;
    splitAt?: string;
}> = ({ leftColor = '#1a0a0a', rightColor = '#0a1a0a', splitAt = '50%' }) => (
    <AbsoluteFill style={{
        background: `linear-gradient(to right, ${leftColor} 0%, ${leftColor} ${splitAt}, ${rightColor} ${splitAt}, ${rightColor} 100%)`,
        zIndex: Z.bg,
    }} />
);

// ─────────────────────────────────────────────
// VIDEO BACKGROUND
// ─────────────────────────────────────────────

const Video: React.FC<{ src: string; startFrom?: number }> = ({ src, startFrom = 0 }) => (
    <AbsoluteFill style={{ zIndex: Z.bg }}>
        <OffthreadVideo
            src={src.startsWith('http') ? src : staticFile(src)}
            muted
            startFrom={startFrom}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
    </AbsoluteFill>
);

const VideoAmbient: React.FC<{
    src: string;
    opacity?: number;
    startFrom?: number;
}> = ({ src, opacity = 0.12, startFrom = 0 }) => (
    <AbsoluteFill style={{ zIndex: Z.bg, opacity }}>
        <OffthreadVideo
            src={src.startsWith('http') ? src : staticFile(src)}
            muted
            startFrom={startFrom}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
    </AbsoluteFill>
);

// ─────────────────────────────────────────────
// OVERLAY COMPONENTS
// ─────────────────────────────────────────────

/** Gradient tối từ dưới lên — standard overlay cho b-roll với chữ ở dưới */
const Vignette: React.FC<{ strength?: 'light' | 'medium' | 'heavy' }> = ({
    strength = 'medium',
}) => {
    const gradients = {
        light:  'linear-gradient(to top, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.20) 55%, rgba(0,0,0,0.05) 100%)',
        medium: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.08) 100%)',
        heavy:  'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.15) 100%)',
    };

    return (
        <AbsoluteFill style={{ background: gradients[strength], zIndex: Z.bgOverlay }} />
    );
};

/** Overlay đen đồng đều — làm mờ video khi chữ cần đọc được ở giữa */
const DarkOverlay: React.FC<{ opacity?: number }> = ({ opacity = 0.55 }) => (
    <AbsoluteFill style={{ background: `rgba(0,0,0,${opacity})`, zIndex: Z.bgOverlay }} />
);

/** Fade tối chỉ phần dưới — dùng với karaoke zone */
const BottomFade: React.FC<{ height?: string; opacity?: number }> = ({
    height = '35%',
    opacity = 0.75,
}) => (
    <AbsoluteFill style={{
        background: `linear-gradient(to top, rgba(0,0,0,${opacity}) 0%, transparent ${height})`,
        zIndex: Z.bgOverlay,
    }} />
);

/** Fade tối 4 cạnh (vignette đối xứng) */
const EdgeVignette: React.FC<{ opacity?: number }> = ({ opacity = 0.5 }) => (
    <AbsoluteFill style={{
        background: `radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,${opacity}) 100%)`,
        zIndex: Z.bgOverlay,
    }} />
);

/**
 * FadeIn overlay — toàn màn hình fade từ đen vào đầu scene
 * Dùng để tránh hard cut giữa các cảnh
 */
const FadeIn: React.FC<{ durationFrames?: number }> = ({ durationFrames = 8 }) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [0, durationFrames], [1, 0], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill style={{
            background: COLOR.black,
            opacity,
            zIndex: Z.overlay,
            pointerEvents: 'none',
        }} />
    );
};

// ─────────────────────────────────────────────
// EXPORT — namespace pattern
// ─────────────────────────────────────────────
export const SceneBg = {
    // Backgrounds
    Black,
    Dark,
    DarkCool,
    Accent,
    Grid,
    SplitH,
    SplitV,
    // Video
    Video,
    VideoAmbient,
    // Overlays
    Vignette,
    DarkOverlay,
    BottomFade,
    EdgeVignette,
    FadeIn,
} as const;
