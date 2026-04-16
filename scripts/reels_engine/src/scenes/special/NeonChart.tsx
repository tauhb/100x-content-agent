import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";


/**
 * NeonChart — Biểu đồ đường neon vẽ dần từ trái sang phải
 *
 * Archetype: NEON_CHART
 * Mode "single": 1 đường (như screenshot "DISCIPLINE")
 * Mode "dual":   2 đường đối lập (như screenshot "Better than yesterday")
 *
 * Props: title, mode, lines[{label, color, points[]}], show_grid, show_reflection
 */

interface LineData {
    label?: string;
    color: string;
    points: number[]; // relative values — sẽ được normalize vào SVG viewport
}

interface DonutSegment {
    label: string;
    value: number;  // 0–100, tổng tất cả nên = 100
    color?: string; // override, nếu không có sẽ tự sinh từ brandAccent
}

interface NeonChartProps {
    title?: string;
    mode?: 'single' | 'dual' | 'donut';
    lines?: LineData[];
    segments?: DonutSegment[];  // chỉ dùng khi mode: 'donut'
    show_grid?: boolean;
    show_reflection?: boolean;
    brandAccent?: string;
}

// ── Palette helper — tự sinh N màu từ brandAccent bằng hue rotation ──────────
function hexToHsl(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
    return [h * 360, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
    const hh = h / 360, c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((hh * 6) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    const i = Math.floor(hh * 6);
    if (i === 0) { r = c; g = x; }
    else if (i === 1) { r = x; g = c; }
    else if (i === 2) { g = c; b = x; }
    else if (i === 3) { g = x; b = c; }
    else if (i === 4) { r = x; b = c; }
    else { r = c; b = x; }
    const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function generatePalette(base: string, n: number): string[] {
    const [h, s, l] = hexToHsl(base);
    const step = 360 / n;
    return Array.from({ length: n }, (_, i) => {
        const newH = (h + i * step) % 360;
        // Giữ saturation cao, lightness vừa để glow đẹp
        return hslToHex(newH, Math.min(s + 0.1, 1), Math.max(0.5, Math.min(l, 0.65)));
    });
}

// Convert normalized points → smooth cubic bezier SVG path
function pointsToSmoothPath(pts: [number, number][]): string {
    if (pts.length < 2) return '';
    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        const cpX = (prev[0] + curr[0]) / 2;
        d += ` C ${cpX.toFixed(1)} ${prev[1].toFixed(1)}, ${cpX.toFixed(1)} ${curr[1].toFixed(1)}, ${curr[0].toFixed(1)} ${curr[1].toFixed(1)}`;
    }
    return d;
}

// Normalize point array to [0..W] × [0..H] chart area
function normalizePoints(raw: number[], W: number, H: number, padL: number, padR: number, padT: number, padB: number): [number, number][] {
    const min = Math.min(...raw);
    const max = Math.max(...raw);
    const range = max - min || 1;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;
    return raw.map((v, i) => [
        padL + (i / (raw.length - 1)) * innerW,
        H - padB - ((v - min) / range) * innerH,
    ]);
}

// Estimate arc-length of a series of points (straight-segment approximation)
function estimateLength(pts: [number, number][]): number {
    let len = 0;
    for (let i = 1; i < pts.length; i++) {
        const dx = pts[i][0] - pts[i - 1][0];
        const dy = pts[i][1] - pts[i - 1][1];
        len += Math.sqrt(dx * dx + dy * dy);
    }
    return len * 1.35; // ×1.35 for bezier overhead
}

export const NeonChart: React.FC<NeonChartProps> = ({
    title,
    mode = 'single',
    lines = [],
    segments = [],
    show_grid = true,
    show_reflection = true,
    brandAccent = '#FF3333',
}) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const { fontFamily } = loadInter();

    const W = 860;
    const H = 560;
    const PAD = { t: 30, b: 40, l: 50, r: 50 };

    // Draw progress: starts after 10 frames, ends 8 frames before clip end
    const drawProgress = interpolate(frame, [10, durationInFrames - 8], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const titleOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
    const axisOpacity  = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: 'clamp' });

    // Default single-line if none provided
    const effectiveLines: LineData[] = lines.length > 0 ? lines : [
        { color: brandAccent, points: [0, 1, 3, 2, 4, 3, 6, 5, 9, 14, 24, 38] },
    ];

    // ── DONUT RENDER ───────────────────────────────────────────────────────────
    if (mode === 'donut') {
        const cx = 430, cy = 420, R = 300, r = 170; // outer/inner radius
        const palette = generatePalette(brandAccent, Math.max(segments.length, 3));
        const effectiveSegs = segments.length > 0 ? segments : [
            { label: 'Discipline', value: 48 },
            { label: 'Failures',   value: 19 },
            { label: 'Consistency', value: 18 },
            { label: 'Other',      value: 15 },
        ];

        // Normalise values to sum=100
        const total = effectiveSegs.reduce((s, seg) => s + seg.value, 0) || 100;
        const normed = effectiveSegs.map(seg => ({ ...seg, value: (seg.value / total) * 100 }));

        // Build arcs — each segment draws in from 0 staggered
        const GAP_DEG = 3;
        let cursor = -90; // start top

        const arcs = normed.map((seg, i) => {
            const color = seg.color || palette[i % palette.length];
            const angleDeg = (seg.value / 100) * 360 - GAP_DEG;
            const startDeg = cursor + GAP_DEG / 2;
            cursor += (seg.value / 100) * 360;

            const toRad = (d: number) => (d * Math.PI) / 180;
            const x1o = cx + R * Math.cos(toRad(startDeg));
            const y1o = cy + R * Math.sin(toRad(startDeg));
            const x2o = cx + R * Math.cos(toRad(startDeg + angleDeg));
            const y2o = cy + R * Math.sin(toRad(startDeg + angleDeg));
            const x1i = cx + r * Math.cos(toRad(startDeg + angleDeg));
            const y1i = cy + r * Math.sin(toRad(startDeg + angleDeg));
            const x2i = cx + r * Math.cos(toRad(startDeg));
            const y2i = cy + r * Math.sin(toRad(startDeg));
            const large = angleDeg > 180 ? 1 : 0;

            const pathD = `M ${x1o} ${y1o} A ${R} ${R} 0 ${large} 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${r} ${r} 0 ${large} 0 ${x2i} ${y2i} Z`;

            // Label position — midpoint angle, outside ring
            const midDeg = startDeg + angleDeg / 2;
            const lR = R + 80;
            const lx = cx + lR * Math.cos(toRad(midDeg));
            const ly = cy + lR * Math.sin(toRad(midDeg));

            // Per-segment draw: stagger by index
            const segDelay = 8 + i * 6;
            const segProgress = interpolate(frame, [segDelay, segDelay + 18], [0, 1], {
                extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });

            return { pathD, color, seg, lx, ly, segProgress, midDeg };
        });

        const labelsVisible = interpolate(frame, [28, 40], [0, 1], { extrapolateRight: 'clamp' });

        return (
            <AbsoluteFill style={{
                background: 'radial-gradient(ellipse at 50% 60%, #0a0a0a 0%, #000000 70%)',
                justifyContent: 'flex-start',
                alignItems: 'center',
                paddingTop: '100px',
                paddingBottom: '400px',
                flexDirection: 'column',
            }}>
                {show_grid && (
                    <AbsoluteFill style={{ opacity: 0.06 }}>
                        <svg width="100%" height="100%" style={{ position: 'absolute' }}>
                            <defs>
                                <pattern id="dngrid" width="55" height="55" patternUnits="userSpaceOnUse">
                                    <path d="M 55 0 L 0 0 0 55" fill="none" stroke="white" strokeWidth="0.6" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#dngrid)" />
                        </svg>
                    </AbsoluteFill>
                )}

                {title && (
                    <div style={{
                        fontFamily,
                        fontSize: '58px',
                        fontWeight: 800,
                        color: 'white',
                        opacity: titleOpacity,
                        marginBottom: '16px',
                        textAlign: 'center',
                        letterSpacing: '2px',
                    }}>
                        {title}
                    </div>
                )}

                <svg
                    viewBox="0 0 860 900"
                    width="90%"
                    style={{ overflow: 'visible' }}
                >
                    <defs>
                        {arcs.map(({ color }, i) => (
                            <filter key={i} id={`dng${i}`} x="-60%" y="-60%" width="220%" height="220%">
                                <feDropShadow dx="0" dy="0" stdDeviation="8"  floodColor={color} floodOpacity="0.8" />
                                <feDropShadow dx="0" dy="0" stdDeviation="22" floodColor={color} floodOpacity="0.4" />
                            </filter>
                        ))}
                    </defs>

                    {arcs.map(({ pathD, color, seg, lx, ly, segProgress, midDeg }, i) => {
                        // Clip mask approach: scale each arc from center
                        const s = segProgress;
                        return (
                            <g key={i}>
                                {/* Arc segment */}
                                <path
                                    d={pathD}
                                    fill={color}
                                    opacity={s * 0.85}
                                    filter={`url(#dng${i})`}
                                    style={{ transform: `scale(${0.6 + s * 0.4})`, transformOrigin: `${cx}px ${cy}px` }}
                                />
                                {/* Glow ring overlay */}
                                <path
                                    d={pathD}
                                    fill="none"
                                    stroke={color}
                                    strokeWidth="3"
                                    opacity={s * 0.6}
                                    filter={`url(#dng${i})`}
                                    style={{ transform: `scale(${0.6 + s * 0.4})`, transformOrigin: `${cx}px ${cy}px` }}
                                />

                                {/* Label */}
                                <g opacity={labelsVisible * s}>
                                    {/* Connector dot */}
                                    <circle
                                        cx={cx + (R + 16) * Math.cos((midDeg * Math.PI) / 180)}
                                        cy={cy + (R + 16) * Math.sin((midDeg * Math.PI) / 180)}
                                        r="8" fill={color}
                                        filter={`url(#dng${i})`}
                                    />
                                    {/* Label text */}
                                    <text
                                        x={lx} y={ly - 14}
                                        textAnchor="middle"
                                        fill={color}
                                        fontSize="26"
                                        fontFamily={fontFamily}
                                        fontWeight="700"
                                        filter={`url(#dng${i})`}
                                    >
                                        {seg.label}
                                    </text>
                                    {/* Value */}
                                    <text
                                        x={lx} y={ly + 18}
                                        textAnchor="middle"
                                        fill={color}
                                        fontSize="32"
                                        fontFamily={fontFamily}
                                        fontWeight="900"
                                        opacity={0.9}
                                    >
                                        {Math.round(seg.value)}%
                                    </text>
                                </g>
                            </g>
                        );
                    })}

                    {/* Center hole — dark circle to reinforce donut */}
                    <circle cx={cx} cy={cy} r={r - 12} fill="#000000" opacity={0.85} />
                    {/* Center reflection shimmer */}
                    <circle cx={cx} cy={cy} r={r - 12} fill="none"
                        stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                </svg>
            </AbsoluteFill>
        );
    }

    // ── LINE CHART RENDER (single / dual) ────────────────────────────────────
    return (
        <AbsoluteFill style={{
            background: 'radial-gradient(ellipse at 50% 60%, #1a0505 0%, #050505 70%)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: '100px',
            paddingBottom: '400px',
            flexDirection: 'column',
        }}>

            {/* Dark grid texture */}
            {show_grid && (
                <AbsoluteFill style={{ opacity: 0.12 }}>
                    <svg width="100%" height="100%" style={{ position: 'absolute' }}>
                        <defs>
                            <pattern id="ncgrid" width="55" height="55" patternUnits="userSpaceOnUse">
                                <path d="M 55 0 L 0 0 0 55" fill="none" stroke="white" strokeWidth="0.6" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#ncgrid)" />
                    </svg>
                </AbsoluteFill>
            )}

            {/* Title */}
            {title && (
                <div style={{
                    fontFamily,
                    fontSize: '68px',
                    fontWeight: '900',
                    letterSpacing: '14px',
                    color: 'white',
                    opacity: titleOpacity,
                    marginBottom: '24px',
                    filter: `drop-shadow(0 0 ${18 * titleOpacity}px rgba(255,255,255,0.7))`,
                    textAlign: 'center',
                }}>
                    {title}
                </div>
            )}

            {/* Chart */}
            <div style={{ width: '88%', position: 'relative' }}>
                <svg viewBox={`0 0 ${W} ${H}`} width="100%" overflow="visible">
                    <defs>
                        {effectiveLines.map((ln, i) => (
                            <filter key={i} id={`glow${i}`} x="-60%" y="-60%" width="220%" height="220%">
                                <feDropShadow dx="0" dy="0" stdDeviation="6"  floodColor={ln.color} floodOpacity="0.9" />
                                <feDropShadow dx="0" dy="0" stdDeviation="18" floodColor={ln.color} floodOpacity="0.5" />
                            </filter>
                        ))}
                        <filter id="axis-g" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="white" floodOpacity="0.5" />
                        </filter>
                    </defs>

                    {/* Y-axis */}
                    <line
                        x1={PAD.l} y1={PAD.t}
                        x2={PAD.l} y2={H - PAD.b}
                        stroke="white" strokeWidth="2.5"
                        filter="url(#axis-g)"
                        opacity={axisOpacity}
                    />
                    {/* X-axis */}
                    <line
                        x1={PAD.l} y1={H - PAD.b}
                        x2={W - PAD.r} y2={H - PAD.b}
                        stroke="white" strokeWidth="2.5"
                        filter="url(#axis-g)"
                        opacity={axisOpacity}
                    />

                    {effectiveLines.map((ln, idx) => {
                        const pts = normalizePoints(ln.points, W, H, PAD.l, PAD.r, PAD.t, PAD.b);
                        const pathD = pointsToSmoothPath(pts);
                        const totalLen = estimateLength(pts);
                        const dashOff = totalLen * (1 - drawProgress);

                        const lastPt = pts[pts.length - 1];
                        const prevPt = pts[pts.length - 2];
                        const angle = Math.atan2(lastPt[1] - prevPt[1], lastPt[0] - prevPt[0]) * 180 / Math.PI;
                        const arrowOpacity = interpolate(drawProgress, [0.88, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                        const labelOpacity = interpolate(drawProgress, [0.85, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

                        return (
                            <g key={idx}>
                                {/* Glow layer */}
                                <path
                                    d={pathD} fill="none"
                                    stroke={ln.color} strokeWidth="10"
                                    strokeLinecap="round" strokeLinejoin="round"
                                    strokeDasharray={totalLen}
                                    strokeDashoffset={dashOff}
                                    filter={`url(#glow${idx})`}
                                    opacity={0.55}
                                />
                                {/* Main line */}
                                <path
                                    d={pathD} fill="none"
                                    stroke={ln.color} strokeWidth="3.5"
                                    strokeLinecap="round" strokeLinejoin="round"
                                    strokeDasharray={totalLen}
                                    strokeDashoffset={dashOff}
                                />
                                {/* Arrow head */}
                                <g
                                    transform={`translate(${lastPt[0]},${lastPt[1]}) rotate(${angle})`}
                                    opacity={arrowOpacity}
                                    filter={`url(#glow${idx})`}
                                >
                                    <polygon points="0,0 -16,-7 -16,7" fill={ln.color} />
                                </g>
                                {/* Label */}
                                {ln.label && (
                                    <text
                                        x={lastPt[0] + 20} y={lastPt[1] + 8}
                                        fill={ln.color}
                                        fontSize="26" fontFamily={fontFamily} fontWeight="700"
                                        opacity={labelOpacity}
                                        filter={`url(#glow${idx})`}
                                    >
                                        {ln.label}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>

                {/* Reflection strip */}
                {show_reflection && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0, right: 0,
                        height: '70px',
                        opacity: 0.2,
                        transform: 'scaleY(-1)',
                        filter: 'blur(3px)',
                        pointerEvents: 'none',
                        maskImage: 'linear-gradient(to bottom, black, transparent)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
                        overflow: 'hidden',
                        background: `linear-gradient(to right, ${effectiveLines[0]?.color || brandAccent}33, transparent)`,
                    }} />
                )}
            </div>
        </AbsoluteFill>
    );
};
