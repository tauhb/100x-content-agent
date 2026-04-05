import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, spring, staticFile, Video, Audio } from 'remotion';

export const SingleSceneDarkOverlay: React.FC<{ scene: any }> = ({ scene }) => {
    const { fps } = useVideoConfig();
    const frame = useCurrentFrame();

    // Mờ mờ Overlay (fade in black overlay)
    const fadeOverlay = interpolate(frame, [0, 15], [0, 0.7], { extrapolateRight: 'clamp' });
    
    // Trượt lên Headline cơ bản
    const slideUp = spring({ frame, fps, config: { damping: 12 } });

    const layout = scene.sub_layout || 'headline_cta';

    return (
        <AbsoluteFill style={{ backgroundColor: '#000', color: 'white', fontFamily: 'sans-serif' }}>
            {/* 1. BACKGROUND VIDEO TRÁNG */}
            {scene.bg_video && (
                <AbsoluteFill>
                    {/* Giả định bg_video được engine copy vào public/assets/ */}
                    <Video src={staticFile(scene.bg_video)} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                </AbsoluteFill>
            )}

            {/* Màng Phủ Đen */}
            <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${fadeOverlay})`, zIndex: 0 }} />

            {/* Nhạc nền tĩnh lặng */}
            {scene.bg_music && <Audio src={staticFile(scene.bg_music)} volume={0.4} />}

            {/* ========================================================= */}
            {/* TRẠNG THÁI 1: HEADLINE CTA (2s CTA popup) */}
            {layout === 'headline_cta' && (
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <h1 style={{ 
                        fontSize: 90, color: '#FFFFFF', fontWeight: 'bold',
                        textAlign: 'center', zIndex: 1,
                        padding: '0 80px', transform: `translateY(${interpolate(slideUp, [0, 1], [100, 0])}px)`,
                        opacity: slideUp
                    }}>
                        {scene.visual_content.headline}
                    </h1>
                    
                    {/* NÚT CTA XUẤT HIỆN SAU 2 GIÂY (60 frames) */}
                    {frame > (fps * 2) && (
                        <div style={{
                            marginTop: 60, padding: '20px 50px',
                            backgroundColor: scene.brand_accent || '#B6FF00', color: '#000',
                            fontSize: 45, fontWeight: 'bold', borderRadius: '50px',
                            opacity: interpolate(frame - (fps * 2), [0, 15], [0, 1], { extrapolateRight: 'clamp' })
                        }}>
                            👇 {scene.visual_content.cta_text || "ĐỌC CAPTION CHO RÕ"}
                        </div>
                    )}
                </AbsoluteFill>
            )}

            {/* ========================================================= */}
            {/* TRẠNG THÁI 2: HEADLINE LIST (Dàn trải ý chính từ giữa ra) */}
            {layout === 'headline_list' && (
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 80px' }}>
                    <h2 style={{ 
                        fontSize: 80, color: scene.brand_accent || '#B6FF00', fontWeight: 'bold',
                        textAlign: 'center', marginBottom: 80,
                        opacity: slideUp, transform: `translateY(${interpolate(slideUp, [0, 1], [-50, 0])}px)`
                    }}>
                        {scene.visual_content.headline}
                    </h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
                        {scene.visual_content.list && scene.visual_content.list.map((item: string, idx: number) => {
                            // Căn từ giữa ra: idx 0 trượt không trễ, idx 1 trễ 15f
                            const delay = idx * 15;
                            const itemSlide = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 12 } });
                            return (
                                <div key={idx} style={{ 
                                    fontSize: 55, color: '#FFF',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    padding: '40px', borderRadius: 20,
                                    borderLeft: `10px solid ${scene.brand_accent || '#B6FF00'}`,
                                    opacity: itemSlide, transform: `translateX(${interpolate(itemSlide, [0, 1], [-100, 0])}px)`
                                }}>
                                    {item}
                                </div>
                            );
                        })}
                    </div>
                </AbsoluteFill>
            )}

            {/* ========================================================= */}
            {/* TRẠNG THÁI 3: QUOTE BOX ONLY (Nằm lửng giữa màn hình) */}
            {layout === 'quote_box' && (
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: 80 }}>
                    <div style={{
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        border: '4px solid #333',
                        borderRadius: 40, padding: '100px 80px', width: '100%',
                        position: 'relative',
                        opacity: slideUp, transform: `scale(${interpolate(slideUp, [0, 1], [0.8, 1])})`
                    }}>
                        <div style={{ position: 'absolute', top: -140, left: 60, fontSize: 250, color: scene.brand_accent || '#B6FF00', lineHeight: 1 }}>"</div>
                        <div style={{ fontSize: 65, fontWeight: 'bold', color: '#FFF', lineHeight: 1.4, textAlign: 'center' }}>
                            {scene.visual_content.quote}
                        </div>
                        <div style={{ fontSize: 45, color: '#aaa', marginTop: 60, textAlign: 'right', fontStyle: 'italic' }}>
                            - {scene.visual_content.author || "Khuyết Danh"}
                        </div>
                    </div>
                </AbsoluteFill>
            )}
        </AbsoluteFill>
    );
};
