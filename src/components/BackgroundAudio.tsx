"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function BackgroundAudio() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const audioContextRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const brownNoiseNodeRef = useRef<ScriptProcessorNode | null>(null);

    useEffect(() => {

        // Cleanup on unmount
        return () => {
            stopAudio();
        };
    }, []);

    useEffect(() => {
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = volume * 0.1; // Master volume scaling
        }
    }, [volume]);

    const initAudio = () => {
        if (!audioContextRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContext();

            // Master Gain
            const gainNode = audioContextRef.current.createGain();
            gainNode.gain.value = volume * 0.1;
            gainNode.connect(audioContextRef.current.destination);
            gainNodeRef.current = gainNode;
        }

        if (audioContextRef.current.state === "suspended") {
            audioContextRef.current.resume();
        }
    };

    const createBrownNoise = () => {
        if (!audioContextRef.current || !gainNodeRef.current) return;

        const bufferSize = 4096;
        const brownNoise = audioContextRef.current.createScriptProcessor(bufferSize, 1, 1);

        brownNoise.onaudioprocess = (e) => {
            const output = e.outputBuffer.getChannelData(0);
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5; // Compensate for gain loss
            }
        };

        brownNoise.connect(gainNodeRef.current);
        brownNoiseNodeRef.current = brownNoise;
    };

    const toggleAudio = () => {
        if (isPlaying) {
            stopAudio();
        } else {
            initAudio();
            createBrownNoise();
            setIsPlaying(true);
        }
    };

    const stopAudio = () => {
        if (brownNoiseNodeRef.current) {
            brownNoiseNodeRef.current.disconnect();
            brownNoiseNodeRef.current = null;
        }
        setIsPlaying(false);
    };

    return (
        <div className="fixed bottom-[3%] left-[4%] z-40 flex flex-col-reverse items-center gap-4">
            <button
                onClick={toggleAudio}
                className={`w-[46px] h-[46px] flex items-center justify-center rounded-full backdrop-blur-md transition-all ${isPlaying ? "bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "bg-white/5 text-white/50 hover:bg-white/10"
                    }`}
                title="環境音 (ブラウンノイズ)"
            >
                {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>

            {isPlaying && (
                <div className="h-24 w-8 flex items-center justify-center -translate-y-2">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white -rotate-90 shadow-lg"
                    />
                </div>
            )}
        </div>
    );
}
