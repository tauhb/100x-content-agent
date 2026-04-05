import React, { useEffect, useState, useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, staticFile, delayRender, continueRender } from 'remotion';

type Alignment = {
    characters: string[];
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
};

type WordTiming = {
    word: string;
    start: number;
    end: number;
};

export const KaraokeDynamic: React.FC<{ karaokeFile: string; brandAccent?: string }> = ({ karaokeFile, brandAccent }) => {
    const { fps } = useVideoConfig();
    const frame = useCurrentFrame();
    const currentTime = frame / fps;

    const [data, setData] = useState<Alignment | null>(null);
    const [handle] = useState(() => delayRender());

    // 1. Tải Timestamps JSON
    useEffect(() => {
        fetch(staticFile(karaokeFile))
            .then(res => res.json())
            .then(json => { 
                setData(json); 
                continueRender(handle); 
            })
            .catch(err => { 
                console.error("[Karaoke] Lỗi nạp phụ đề:", err); 
                continueRender(handle); 
            });
    }, [karaokeFile, handle]);

    // 2. Chuyển đổi Ký Tự (Characters) thành Từ (Words)
    const words = useMemo(() => {
        if (!data || !data.characters) return [];
        const _words: WordTiming[] = [];
        let currentWord = '';
        let start = -1;
        let end = -1;

        for (let i = 0; i < data.characters.length; i++) {
            const char = data.characters[i];
            const tStart = data.character_start_times_seconds[i];
            const tEnd = data.character_end_times_seconds[i];

            if (char === ' ' || char === '\n') {
                if (currentWord) {
                    _words.push({ word: currentWord, start, end });
                    currentWord = '';
                    start = -1;
                }
            } else {
                if (start === -1) start = tStart;
                currentWord += char;
                end = tEnd;
            }
        }
        if (currentWord) _words.push({ word: currentWord, start, end });
        return _words;
    }, [data]);

    // 3. Phân mảng 6 từ thành 1 Dòng (Line) để Dàn trang giống CapCut
    const lines = useMemo(() => {
        const _lines: { words: WordTiming[], start: number, end: number }[] = [];
        let currentLine: WordTiming[] = [];
        for (let i = 0; i < words.length; i++) {
            currentLine.push(words[i]);
            const isPunctuation = /[.,!?]/.test(words[i].word);
            
            // Cắt dòng nếu dài hơn 6 từ HOẶC gặp dấu câu HOẶC là từ cuối cùng
            if (currentLine.length >= 6 || isPunctuation || i === words.length - 1) {
                _lines.push({
                    words: currentLine,
                    start: currentLine[0].start,
                    end: currentLine[currentLine.length - 1].end
                });
                currentLine = [];
            }
        }
        return _lines;
    }, [words]);

    // 4. Tìm Dòng Hiện Tại Đang Phát (Active Line)
    const activeLine = lines.find(l => currentTime >= l.start && currentTime <= l.end + 0.8); // Dư 0.8s để chữ đừng biến mất quá gắt

    if (!activeLine) return null;

    return (
        <div style={{ 
            position: 'absolute', 
            bottom: 250, // Trọng tâm 1/3 dưới (Tránh đụng SingleTitleHook ở giữa màn hình)
            width: '100%', 
            textAlign: 'center',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '10px',
            padding: '0 50px'
        }}>
            {activeLine.words.map((w, i) => {
                // Xác định Từ (Word) đang được Voiceover đọc tại Frame này
                const isActive = currentTime >= w.start && currentTime <= w.end + 0.1;
                const activeColor = brandAccent || '#B6FF00';
                
                return (
                    <span key={i} style={{
                        fontSize: isActive ? 50 : 42,
                        color: isActive ? activeColor : '#FFFFFF',
                        fontFamily: 'sans-serif',
                        fontWeight: '900',
                        textTransform: 'none',
                        textShadow: isActive ? `0 0 20px ${activeColor}99` : '0 5px 15px rgba(0,0,0,0.9)',
                        transition: 'all 0.1s ease',
                        display: 'inline-block'
                    }}>
                        {w.word}
                    </span>
                );
            })}
        </div>
    );
};
