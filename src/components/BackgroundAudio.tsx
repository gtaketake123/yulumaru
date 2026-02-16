"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function BackgroundAudio({ activeType }: { activeType: "brown-noise" | "wave" | "birds" }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const audioContextRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const brownNoiseNodeRef = useRef<ScriptProcessorNode | null>(null);
    const fileAudioRef = useRef<HTMLAudioElement | null>(null);

    // Initial setup: Default OFF.
    // If activeType changes, we should restart playback if we are ALREADY playing.
    // Spec: "Default BGM off... select from Brown Noise to Wave".

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            stopAudio();
        };
    }, []);

    // Effect: Handle Type switching while playing
    useEffect(() => {
        if (isPlaying) {
            // Stop current, Start new
            stopAudioInternal(true); // Don't reset state, just stop sound
            startAudio(activeType);
        }
    }, [activeType]);

    // Effect: Volume Scaling (Req 24: Half range)
    useEffect(() => {
        const scaledVolume = volume * 0.5; // Max 0.5

        // Update Brown Noise Gain
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = scaledVolume * 0.1;
        }

        // Update File Audio Volume
        if (fileAudioRef.current) {
            fileAudioRef.current.volume = scaledVolume;
        }
    }, [volume]);

    const startAudio = (type: string) => {
        if (type === "brown-noise") {
            startBrownNoise();
        } else {
            startFileAudio(type);
        }
    };

    const startFileAudio = (type: string) => {
        const fileName = type === "wave" ? "wave.mp3" : "birds.mp3";
        const audio = new Audio(`/audio/${fileName}`);
        audio.loop = true; // Req 25: Loop
        audio.volume = volume * 0.5; // Scale
        audio.play().catch(e => console.error("Audio play failed", e));
        fileAudioRef.current = audio;
    };

    const startBrownNoise = () => {
        if (!audioContextRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContext();

            // Master Gain
            const gainNode = audioContextRef.current.createGain();
            gainNode.gain.value = (volume * 0.5) * 0.1; // Scale
            gainNode.connect(audioContextRef.current.destination);
            gainNodeRef.current = gainNode;
        }

        if (audioContextRef.current.state === "suspended") {
            audioContextRef.current.resume();
        }

        if (!gainNodeRef.current) return;

        // Create Noise
        const bufferSize = 4096;
        const brownNoise = audioContextRef.current.createScriptProcessor(bufferSize, 1, 1);

        brownNoise.onaudioprocess = (e) => {
            const output = e.outputBuffer.getChannelData(0);
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5;
            }
        };

        brownNoise.connect(gainNodeRef.current);
        brownNoiseNodeRef.current = brownNoise;
    };

    const stopAudioInternal = (keepContext = false) => {
        // Stop File
        if (fileAudioRef.current) {
            fileAudioRef.current.pause();
            fileAudioRef.current = null;
        }

        // Stop Brown Noise
        if (brownNoiseNodeRef.current) {
            brownNoiseNodeRef.current.disconnect();
            brownNoiseNodeRef.current = null;
        }

        // Need to keep Context alive if switching tracks? Yes.
    };

    const stopAudio = () => {
        stopAudioInternal();
        setIsPlaying(false);
    };

    const toggleAudio = () => {
        if (isPlaying) {
            stopAudio();
        } else {
            setIsPlaying(true);
            startAudio(activeType);
        }
    };

    return (
        <div className="fixed bottom-[3%] left-[4%] z-40 flex flex-col-reverse items-center gap-4">
            <button
                onClick={toggleAudio}
                className={`w-[46px] h-[46px] flex items-center justify-center rounded-full backdrop-blur-md transition-all ${isPlaying ? "bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "bg-white/5 text-white/50 hover:bg-white/10"
                    }`}
                title="BGM (再生/停止)"
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
