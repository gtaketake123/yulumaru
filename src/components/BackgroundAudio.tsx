"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, StepForward } from "lucide-react";

export default function BackgroundAudio({ activeType, setBgmSelection }: { activeType: "brown-noise" | "wave" | "birds" | "rivers" | "bonfires" | "rivers-birds", setBgmSelection: (type: any) => void }) {
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
            // Req 30: "Rivers" volume doubled, "Rivers-Birds" 0.33
            let multiplier = 1.0;
            if (activeType === "rivers") multiplier = 2.0;
            if (activeType === "rivers-birds") multiplier = 0.33; // approx 1/3 (Half of 0.67)

            // Cap at 1.0 just in case
            fileAudioRef.current.volume = Math.min(scaledVolume * multiplier, 1.0);
        }
    }, [volume, activeType]);

    const startAudio = (type: string) => {
        if (type === "brown-noise") {
            startBrownNoise();
        } else {
            startFileAudio(type);
        }
    };

    const startFileAudio = (type: string) => {
        let fileName = "";
        switch (type) {
            case "wave": fileName = "waves.mp3"; break;
            case "birds": fileName = "birds.mp3"; break;
            case "rivers": fileName = "rivers.mp3"; break;
            case "bonfires": fileName = "bonfires.mp3"; break;
            case "rivers-birds": fileName = "rivers_birds.mp3"; break;
            default: fileName = "waves.mp3"; break;
        }

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

    const cycleBgm = () => {
        const order = ["wave", "rivers", "bonfires", "rivers-birds", "birds", "brown-noise"];
        const currentIndex = order.indexOf(activeType);
        const nextIndex = (currentIndex + 1) % order.length;
        setBgmSelection(order[nextIndex] as any);
    };

    const buttonClasses = "p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/80 hover:bg-white/20 active:scale-95 transition-all shadow-lg shrink-0";

    const ambientControlsList = (
        <>
            {/* Play/Stop Button (Bottom) */}
            <button
                onClick={toggleAudio}
                className={buttonClasses}
                aria-label={isPlaying ? "環境音を停止" : "環境音を再生"}
            >
                {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>

            {/* Volume Slider (Middle - Vertical) */}
            {isPlaying && (
                <div className="w-10 h-32 flex items-center justify-center relative bg-black/20 rounded-full backdrop-blur-sm border border-white/10">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="absolute w-24 h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-cyan-400/80 -rotate-90 shadow-lg hover:accent-cyan-300"
                    />
                </div>
            )}

            {/* Next Track Button (Top) */}
            {isPlaying && (
                <button
                    onClick={cycleBgm}
                    className={`${buttonClasses} animate-fade-in`}
                    aria-label="次の環境音へ"
                >
                    <StepForward size={20} />
                </button>
            )}
        </>
    );

    return (
        <>
            {/* Desktop Layout: Fixed to left-6 */}
            <div className="hidden md:flex fixed bottom-[4%] left-6 z-[600] flex-col-reverse items-center gap-4 animate-fade-in pointer-events-auto touch-manipulation">
                {ambientControlsList}
            </div>

            {/* Mobile Layout: Anchored to BreathingGuide Controls via Ghost Structure */}
            <div className="md:hidden fixed bottom-[4%] left-1/2 -translate-x-[114px] flex items-center justify-start gap-3 pointer-events-none z-[600]">
                <div className="flex gap-3">
                    {/* Play Button Slot */}
                    <div className="relative">
                        {/* Ghost element to reserve exact dimensions of BreathingGuide's Play button */}
                        <div className="p-3 border border-transparent invisible pointer-events-none" aria-hidden="true">
                            <div className="w-[20px] h-[20px]" />
                        </div>

                        {/* Ambient Controls absolutely positioned exactly gap-3 (12px = 0.75rem) to the left */}
                        <div className="absolute bottom-0 right-[calc(100%_+_0.75rem)] flex flex-col-reverse items-center gap-4 pointer-events-auto">
                            {ambientControlsList}
                        </div>
                    </div>
                    {/* Reset Button Slot */}
                    <div className="p-3 border border-transparent invisible pointer-events-none" aria-hidden="true">
                        <div className="w-[20px] h-[20px]" />
                    </div>
                </div>
                {/* Mode Selector Slot */}
                <div className="min-w-[140px] px-6 py-3 border border-transparent invisible pointer-events-none" aria-hidden="true" />
            </div>
        </>
    );
}
