import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const SubtleCTA: React.FC<{
    text?: string;
    delaySeconds?: number;
}> = ({ text = "Đọc caption 👇", delaySeconds = 2 }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const delayFrames = fps * delaySeconds;
    const opacity = interpolate(
        frame - delayFrames,
        [0, 15],
        [0, 0.8],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return (
        <div style={{
            position: 'absolute',
            bottom: '150px', // Đặt lơ lửng ngay trên cụm Watermark (đáy 80px)
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            opacity,
            zIndex: 990 // Dưới Watermark nhưng trên nội dung
        }}>
            <div style={{
                backgroundColor: 'rgba(0,0,0,0.4)',
                padding: '12px 30px',
                borderRadius: '50px',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#FFF',
                fontFamily: 'sans-serif',
                fontSize: 35,
                fontWeight: '500',
                letterSpacing: '2px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
                {text}
            </div>
        </div>
    );
};
