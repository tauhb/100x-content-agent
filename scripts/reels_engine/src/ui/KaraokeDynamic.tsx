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
    // staticFile() không hỗ trợ HTTP URL — dùng trực tiếp nếu đã là remote URL
    useEffect(() => {
        const url = karaokeFile.startsWith('http') ? karaokeFile : staticFile(karaokeFile);
        fetch(url)
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

    const activeColor = brandAccent || '#B6FF00';

    return (
        <div style={{
            position: 'absolute',
            // Đẩy lên 230px từ đáy — thoát vùng platform UI (Instagram/TikTok che ~240px)
            bottom: 230,
            left: 0,
            right: 0,
            // Gradient nền đủ cao để bao phủ cả vùng karaoke
            background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.6) 65%, transparent 100%)',
            paddingTop: '48px',
            paddingBottom: '32px',
            paddingLeft: '96px',
            paddingRight: '96px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
        }}>
            {activeLine.words.map((w, i) => {
                const isActive = currentTime >= w.start && currentTime <= w.end + 0.1;
                return (
                    <span key={i} style={{
                        fontSize: isActive ? 52 : 44,
                        color: isActive ? activeColor : '#FFFFFF',
                        fontFamily: 'sans-serif',
                        fontWeight: '800',
                        textShadow: isActive
                            ? `0 0 20px ${activeColor}CC, 0 2px 10px rgba(0,0,0,0.95)`
                            : '0 2px 10px rgba(0,0,0,0.95)',
                        display: 'inline-block',
                        lineHeight: 1.2,
                    }}>
                        {w.word}
                    </span>
                );
            })}
        </div>
    );
};
