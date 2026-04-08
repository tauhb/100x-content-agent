import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, spring } from 'remotion';
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { RichText } from '../components/RichText';

interface ChartItem {
    label: string;
    value: number;
    color?: string;
}

interface MetricChartProps {
    type: 'bar' | 'progress' | 'comparison';
    title?: string;
    data: ChartItem[];
    brandAccent?: string;
}

export const MetricChart: React.FC<MetricChartProps> = ({ type, title, data, brandAccent = '#B6FF00' }) => {
    const frame = useCurrentFrame();
    const { fps, width } = useVideoConfig();
    const { fontFamily: primaryFont } = loadInter();
    const { fontFamily: accentFont } = loadPlayfair();

    const renderBarChart = () => {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', width: '80%', gap: '40px' }}>
                {title && (
                    <h2 style={{ fontSize: '50px', color: 'white', marginBottom: '40px', textAlign: 'center', fontFamily: accentFont }}>
                        <RichText text={title} brandAccent={brandAccent} themeType="headline" staggerDelay={3} />
                    </h2>
                )}
                {data.map((item, i) => {
                    const delay = i * 10;
                    const grow = spring({
                        frame: Math.max(0, frame - delay),
                        fps,
                        config: { damping: 12, stiffness: 150 }
                    });

                    const barWidth = interpolate(grow, [0, 1], [0, item.value]);

                    return (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '32px', color: 'rgba(255,255,255,0.7)', fontFamily: primaryFont }}>
                                <span>{item.label}</span>
                                <span style={{ color: brandAccent, fontWeight: 'bold' }}>
                                    {Math.round(interpolate(grow, [0, 1], [0, item.value]))}%
                                </span>
                            </div>
                            <div style={{ 
                                height: '30px', 
                                background: 'rgba(255,255,255,0.1)', 
                                borderRadius: '15px', 
                                overflow: 'hidden',
                                border: `1px solid rgba(255,255,255,0.05)`
                            }}>
                                <div style={{ 
                                    width: `${barWidth}%`, 
                                    height: '100%', 
                                    background: item.color || brandAccent,
                                    borderRadius: '15px',
                                    boxShadow: `0 0 20px ${item.color || brandAccent}44`
                                }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderComparison = () => {
        return (
            <div style={{ display: 'flex', width: '90%', gap: '20px', justifyContent: 'center', alignItems: 'flex-end', height: '600px' }}>
                {data.map((item, i) => {
                    const delay = i * 15;
                    const grow = spring({
                        frame: Math.max(0, frame - delay - 20),
                        fps,
                        config: { damping: 10, stiffness: 100 }
                    });

                    const barHeight = interpolate(grow, [0, 1], [0, 500 * (item.value / 100)]);

                    return (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '20px' }}>
                             <span style={{ fontSize: '40px', fontWeight: 'bold', color: brandAccent, opacity: grow }}>
                                {Math.round(interpolate(grow, [0, 1], [0, item.value]))}
                            </span>
                            <div style={{ 
                                width: '100%', 
                                height: `${barHeight}px`, 
                                background: i === 0 ? brandAccent : 'rgba(255,255,255,0.1)', 
                                borderRadius: '20px 20px 0 0',
                                border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.2)'
                            }} />
                            <span style={{ fontSize: '28px', color: 'white', textAlign: 'center', fontWeight: i === 0 ? 'bold' : 'normal' }}>
                                {item.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '100px' }}>
            {type === 'bar' || type === 'progress' ? renderBarChart() : renderComparison()}
        </AbsoluteFill>
    );
};
