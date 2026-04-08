import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, spring } from 'remotion';
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { RichText } from '../components/RichText';

interface ProgressItem {
    label: string;
    value: number; // 0-100
    color?: string;
}

interface DataProgressProps {
    title?: string;
    items: ProgressItem[];
    brandAccent?: string;
}

// Single radial arc ring for one item
const RadialRing: React.FC<{
    item: ProgressItem;
    index: number;
    frame: number;
    fps: number;
    brandAccent: string;
    primaryFont: string;
    accentFont: string;
    total: number;
}> = ({ item, index, frame, fps, brandAccent, primaryFont, accentFont, total }) => {
    const delay = index * 18;
    const prog = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 16, stiffness: 80 } });
    const currentValue = Math.round(interpolate(prog, [0, 1], [0, item.value]));

    // Ring sizing based on index — concentric rings
    const baseRadius = 230 - index * 60;
    const circumference = 2 * Math.PI * baseRadius;
    const fillProgress = interpolate(prog, [0, 1], [0, item.value / 100]);
    const dashOffset = circumference * (1 - fillProgress);
    const color = item.color || brandAccent;

    return (
        <g>
            {/* Background track */}
            <circle cx="300" cy="300" r={baseRadius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="20" />
            {/* Progress arc */}
            <circle
                cx="300"
                cy="300"
                r={baseRadius}
                fill="none"
                stroke={color}
                strokeWidth="20"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 300 300)"
                style={{ filter: `drop-shadow(0 0 12px ${color}66)` }}
            />
            {/* Label at end of arc */}
            <text
                x={300 + (baseRadius + 36) * Math.cos(2 * Math.PI * fillProgress - Math.PI / 2)}
                y={300 + (baseRadius + 36) * Math.sin(2 * Math.PI * fillProgress - Math.PI / 2)}
                textAnchor="middle"
                alignmentBaseline="middle"
                fill={color}
                fontSize="22"
                fontWeight="bold"
                fontFamily={primaryFont}
                opacity={prog}
            >
                {currentValue}%
            </text>
        </g>
    );
};

export const DataProgress: React.FC<DataProgressProps> = ({
    title,
    items = [],
    brandAccent = '#B6FF00',
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const { fontFamily: primaryFont } = loadInter();
    const { fontFamily: accentFont } = loadPlayfair();

    const limitedItems = items.slice(0, 4); // Max 4 concentric rings

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '80px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', width: '100%' }}>
                {title && (
                    <h2 style={{ fontSize: '52px', fontFamily: accentFont, color: 'white', textAlign: 'center', margin: 0 }}>
                        <RichText text={title} brandAccent={brandAccent} themeType="headline" staggerDelay={4} />
                    </h2>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '60px' }}>
                    {/* SVG Concentric Rings */}
                    <svg width="600" height="600" viewBox="0 0 600 600">
                        {limitedItems.map((item, i) => (
                            <RadialRing
                                key={i}
                                item={item}
                                index={i}
                                frame={frame}
                                fps={fps}
                                brandAccent={brandAccent}
                                primaryFont={primaryFont}
                                accentFont={accentFont}
                                total={limitedItems.length}
                            />
                        ))}
                    </svg>

                    {/* Legend */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {limitedItems.map((item, i) => {
                            const delay = i * 18;
                            const fadeProg = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 14, stiffness: 120 } });
                            const currentValue = Math.round(interpolate(fadeProg, [0, 1], [0, item.value]));
                            const color = item.color || brandAccent;

                            return (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', opacity: fadeProg }}>
                                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}` }} />
                                    <span style={{ fontSize: '32px', fontFamily: primaryFont, color: 'rgba(255,255,255,0.85)', fontWeight: '500' }}>
                                        {item.label}
                                    </span>
                                    <span style={{ fontSize: '32px', fontFamily: accentFont, color, fontWeight: '700', marginLeft: '8px' }}>
                                        {currentValue}%
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );
};
