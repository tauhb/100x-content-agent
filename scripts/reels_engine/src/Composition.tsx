import { AbsoluteFill, Sequence, useVideoConfig, Img, Audio, staticFile } from 'remotion';

// Import Cấu hình định dạng toàn cầu
// @ts-ignore
import brandConfig from './brand_config.json';

// Import Các Lõi Template Nội Bộ
import { SingleSceneTemplate } from './templates/core/SingleSceneTemplate';
import { MultiSceneDarkTemplate } from './templates/core/MultiSceneDarkTemplate';

// Props truyền vào dẳng Timeline JSON (mạng mảng Object)
export const MainComposition = ({ timeline }: { timeline: any[] }) => {
    const { fps } = useVideoConfig();

    // Tính toán điểm Start Frame cho từng Scene
    let currentFrame = 0;
    const scenesWithFrames = timeline.map((scene) => {
        const durationInFrames = Math.round((scene.duration_sec || 5) * fps);
        const startFrame = currentFrame;
        currentFrame += durationInFrames;
        return { ...scene, startFrame, durationInFrames };
    });

    // Lấy Watermark Info
    const watermark = brandConfig.brand_identity?.watermark;

    return (
        <AbsoluteFill style={{ backgroundColor: '#000000', color: 'white', fontFamily: `"${brandConfig.brand_identity?.fonts?.primary || 'Inter'}", sans-serif` }}>
            {/* NHẠC NỀN XUYÊN SUỐT TOÀN VIDEO */}
            {timeline[0]?.bg_music && <Audio src={staticFile(timeline[0].bg_music)} volume={0.35} />}

            {scenesWithFrames.map((scene, i) => {
                return (
                    <Sequence
                        key={i}
                        from={scene.startFrame}
                        durationInFrames={scene.durationInFrames}
                    >
                        {/* ======================================= */}
                        {/* ROUTER: CHỈ ĐẠO TEMPLATE TỪ THƯ MỤC NGOÀI */}
                        {/* ======================================= */}
                        
                        {scene.template_core === 'single_scene_dark' && (
                            <SingleSceneTemplate scene={scene} />
                        )}

                        {scene.template_core === 'multi_scene_dark' && (
                            <MultiSceneDarkTemplate scene={scene} />
                        )}

                        {/* Nếu thiết kế cũ truyền vào layout (Backwards compatibility) */}
                        {(!scene.template_core && scene.layout === 'text_overlay') && (
                            <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #111, #000)', zIndex: 0 }} />
                                <h1 style={{ fontSize: 100, color: scene.brand_accent || '#B6FF00', fontWeight: 'bold', textAlign: 'center', zIndex: 1 }}>
                                    {scene.visual_content.headline}
                                </h1>
                            </AbsoluteFill>
                        )}
                        {/* ... Các layout cũ khác giữ nguyên nếu cần ... */}
                    </Sequence>
                );
            })}

            {/* ========================================================= */}
            {/* LỚP PHỦ ĐỈNH (GLOBAL BRAND WATERMARK): HIỆN DIỆN MỌI FRAME */}
            {/* ========================================================= */}
            {watermark && watermark.enabled && (
                <AbsoluteFill style={{ 
                    justifyContent: 'flex-end', 
                    alignItems: 'center', 
                    paddingBottom: watermark.bottom_margin || '80px', 
                    zIndex: 9999,
                    pointerEvents: 'none'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', opacity: watermark.opacity || 0.6 }}>
                        {/* Ưu tiên dùng Logo nhúng Base64 từ scene đầu tiên */}
                        <Img src={timeline[0]?.brand_logo || staticFile('assets/brand_logo.png')} style={{ width: 60, height: 60, objectFit: 'contain' }} />
                        <span style={{ fontSize: 35, color: '#FFF', fontWeight: 'bold', letterSpacing: '4px' }}>
                            {watermark.text}
                        </span>
                    </div>
                </AbsoluteFill>
            )}
        </AbsoluteFill>
    );
};

