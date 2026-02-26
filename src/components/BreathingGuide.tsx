"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Play, Pause, RotateCcw, Settings, X, Circle } from "lucide-react";

type BreathingMode = "relax" | "box" | "5-5" | "alternate" | "sigh" | "6-6" | "deep";

interface BreathingGuideProps {
    autoStart?: boolean;
    defaultMode?: BreathingMode;
    onBreathChange?: (phase: "inhale" | "hold" | "exhale") => void;
    onCycleComplete?: () => void;
    circleColor?: string;
    centerContent?: React.ReactNode;
    baseScale?: number; // Req 49: Adjustable MAX scale multiplier
    showCircle?: boolean;
    setShowCircle?: (val: boolean) => void;
}

interface BreathingConfig {
    id: BreathingMode;
    name: string;
    description: string;
    phases: {
        label: string;
        duration: number; // seconds
        scale: number; // target scale for circle
    }[];
}

// Req 53-2: Reordered List
const BREATHING_MODES: BreathingConfig[] = [
    {
        id: "6-6",
        name: "バランス",
        description: "バランスの取れた深い呼吸で心を整えます。",
        phases: [
            { label: "吸って (6秒)", duration: 6, scale: 1.4 },
            { label: "吐いて (6秒)", duration: 6, scale: 1.0 },
        ],
    },
    {
        id: "deep",
        name: "深呼吸",
        description: "ゆっくりと深く呼吸し、完全にリラックスします。",
        phases: [
            { label: "吸って (10秒)", duration: 10, scale: 1.5 },
            { label: "吐いて (10秒)", duration: 10, scale: 1.0 },
        ],
    },
    {
        id: "relax",
        name: "リラックス",
        description: "ゆっくりとした呼吸で心を落ち着けます。",
        phases: [
            { label: "吸って (4秒)", duration: 4, scale: 1.2 },
            { label: "吐いて (8秒)", duration: 8, scale: 1.0 },
        ],
    },
    {
        id: "box",
        name: "4-4-4 呼吸法",
        description: "緊張を和らげ、リセットするボックス呼吸。",
        phases: [
            { label: "吸って (4秒)", duration: 4, scale: 1.3 },
            { label: "止めて (4秒)", duration: 4, scale: 1.3 }, // Hold max expansion
            { label: "吐いて (4秒)", duration: 4, scale: 1.0 },
        ],
    },
    {
        id: "5-5",
        name: "5-5 呼吸法",
        description: "自律神経を整え、気分を安定させます。",
        phases: [
            { label: "吸って (5秒)", duration: 5, scale: 1.3 },
            { label: "吐いて (5秒)", duration: 5, scale: 1.0 },
        ],
    },
    {
        id: "alternate",
        name: "片鼻呼吸法",
        description: "左右の脳バランスを整え、思考をクリアにします。",
        phases: [
            { label: "左から吸って", duration: 4, scale: 1.2 },
            { label: "右から吐いて", duration: 4, scale: 1.0 },
            { label: "右から吸って", duration: 4, scale: 1.2 },
            { label: "左から吐いて", duration: 4, scale: 1.0 },
        ],
    },
    {
        id: "sigh",
        name: "ため息呼吸法",
        description: "深いリラックスと気分の切り替えに。",
        phases: [
            { label: "鼻から吸って", duration: 4, scale: 1.4 },
            { label: "はぁ〜っと吐く", duration: 8, scale: 0.8 }, // Compress slightly? Or just 1.0
        ],
    },
];

export default function BreathingGuide({
    autoStart = false,
    defaultMode = "6-6", // Default updated to match first item
    onBreathChange,
    onCycleComplete,
    circleColor = "bg-gradient-to-br from-white/40 to-white/10",
    centerContent,
    baseScale = 1.8, // Req 49: Default multiplier
    showCircle = true,
    setShowCircle,
}: BreathingGuideProps) {
    const [activeMode, setActiveMode] = useState<BreathingConfig>(
        BREATHING_MODES.find(m => m.id === defaultMode) || BREATHING_MODES[0]
    );
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
    const [showSettings, setShowSettings] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Auto-start
    useEffect(() => {
        if (autoStart) {
            setIsPlaying(true);
        }
    }, [autoStart]);

    // Handle phase transitions
    useEffect(() => {
        if (!isPlaying) {
            if (timerRef.current) clearTimeout(timerRef.current);
            return;
        }

        const currentPhase = activeMode.phases[currentPhaseIndex];

        // Notify parent of phase change
        if (onBreathChange) {
            if (currentPhase.label.includes("吸")) onBreathChange("inhale");
            else if (currentPhase.label.includes("止")) onBreathChange("hold");
            else if (currentPhase.label.includes("吐")) onBreathChange("exhale");
        }

        timerRef.current = setTimeout(() => {
            setCurrentPhaseIndex((prev) => {
                const next = (prev + 1) % activeMode.phases.length;
                // If wrapping around to 0, cycle is complete
                // Defer the callback to avoid updating parent during render
                if (next === 0 && onCycleComplete) {
                    setTimeout(() => onCycleComplete(), 0);
                }
                return next;
            });
        }, currentPhase.duration * 1000);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isPlaying, currentPhaseIndex, activeMode, onBreathChange, onCycleComplete]);

    // Reset when mode changes
    const changeMode = (mode: BreathingConfig) => {
        setActiveMode(mode);
        setIsPlaying(false);
        setCurrentPhaseIndex(0);
        setShowSettings(false);
    };

    const togglePlay = () => setIsPlaying(!isPlaying);

    const reset = () => {
        setIsPlaying(false);
        setCurrentPhaseIndex(0);
    };

    const currentPhase = activeMode.phases[currentPhaseIndex];

    const Controls = (
        <>
            {/* Controls Header - Redesigned C4-5: Bottom Command Center (Class-based via Portal) */}
            <div className="fixed bottom-[4%] left-1/2 -translate-x-1/2 ml-5 flex items-center justify-center gap-3 w-full max-w-lg px-4 z-40 pointer-events-auto">
                <div className="flex gap-3">
                    <button
                        onClick={togglePlay}
                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10 shadow-lg"
                        aria-label={isPlaying ? "一時停止" : "再生"}
                    >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    {/* 99-8-4: Replaced Reset button with Circle Visibility Toggle Button */}
                    {setShowCircle && (
                        <button
                            onClick={() => setShowCircle(!showCircle)}
                            className={`p-3 rounded-full transition-all backdrop-blur-md border shadow-lg ${showCircle ? 'bg-cyan-500/80 border-cyan-400 hover:bg-cyan-400/80 text-white' : 'bg-white/10 border-white/10 hover:bg-white/20 text-white/60'}`}
                            aria-label={showCircle ? "サークルを非表示" : "サークルを表示"}
                            title="サークルの表示ON/OFF"
                        >
                            <Circle size={20} />
                        </button>
                    )}
                </div>

                <button
                    onClick={() => setShowSettings(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/10 shadow-lg min-w-[140px] justify-center"
                >
                    <Wind size={20} />
                    <span className="text-sm font-medium whitespace-nowrap">{activeMode.name}</span>
                    <Settings size={16} className="ml-1 opacity-70" />
                </button>
            </div>

            {/* Settings Modal/Overlay - Fixed to cover everything */}
            <AnimatePresence>
                {showSettings && (
                    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setShowSettings(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-lake-900/95 backdrop-blur-xl rounded-3xl p-6 overflow-y-auto border border-white/10 shadow-2xl max-h-[80vh]"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-xl font-bold text-white">呼吸法を選択</h3>

                                    {/* 99-8-3: Circle Display Toggle moved next to the title */}
                                    {setShowCircle && (
                                        <div
                                            onClick={(e) => { e.stopPropagation(); setShowCircle(!showCircle); }}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer bg-white/5 border border-white/10"
                                            title="サークルの表示ON/OFF"
                                        >
                                            <div className={`w-8 h-4 rounded-full transition-colors relative ${showCircle ? 'bg-cyan-500' : 'bg-gray-500'}`}>
                                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${showCircle ? 'left-[1.125rem]' : 'left-[0.125rem]'}`} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button onClick={() => setShowSettings(false)} className="text-white/70 hover:text-white shrink-0">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {BREATHING_MODES.map((mode) => (
                                    <button
                                        key={mode.id}
                                        onClick={() => changeMode(mode)}
                                        className={`w-full text-left p-4 rounded-xl transition-all border ${activeMode.id === mode.id
                                            ? "bg-white/20 border-white/40 shadow-lg"
                                            : "bg-white/5 border-transparent hover:bg-white/10"
                                            }`}
                                    >
                                        <p className="font-bold text-white">{mode.name}</p>
                                        <p className="text-sm text-white/60 mt-1">{mode.description}</p>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );

    return (
        <div className="relative flex flex-col items-center justify-center w-full max-w-md mx-auto p-6">

            {/* Render Controls via Portal to escape parent transforms */}
            {mounted ? createPortal(Controls, document.body) : null}

            {/* Visualizer */}
            {/* 99-8-1: Allow clicking the circle to start when paused */}
            {showCircle !== false ? (
                <div
                    className={`relative flex items-center justify-center w-64 h-64 mb-12 ${!isPlaying ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
                    onClick={() => { if (!isPlaying) togglePlay(); }}
                >
                    {/* Background Circle */}
                    <div className="absolute w-48 h-48 rounded-full bg-white/5 blur-2xl" />

                    {/* Breathing Circle - Animated */}
                    <motion.div
                        animate={{
                            scale: isPlaying
                                ? (currentPhase.scale > 1.0 ? currentPhase.scale * baseScale : currentPhase.scale)
                                : 1,
                            opacity: isPlaying ? 0.8 : 0.5,
                        }}
                        transition={{
                            duration: isPlaying ? currentPhase.duration : 1,
                            ease: "easeInOut",
                        }}
                        className={`w-40 h-40 rounded-full border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.15)] md:shadow-[0_0_40px_rgba(255,255,255,0.2)] md:backdrop-blur-sm flex items-center justify-center ${circleColor}`}
                        style={{ willChange: "transform" }}
                    />

                    {/* Center Content - Rendered ON TOP of the circle, NOT scaled with it (Req: Fix Blur) */}
                    {centerContent && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            {centerContent}
                        </div>
                    )}

                    {/* Text Instruction - Only show if NO center content is provided (to avoid overlap) */}
                    {!centerContent && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <AnimatePresence mode="wait">
                                {isPlaying ? (
                                    <motion.p
                                        key={currentPhase.label}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.1 }}
                                        className="text-2xl font-bold text-white tracking-widest drop-shadow-md text-center px-4"
                                    >
                                        {currentPhase.label}
                                    </motion.p>
                                ) : (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-lg text-white/60 font-medium"
                                    >
                                        Ready
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            ) : (
                <div className="h-64 mb-12" /> // Empty placeholder to maintain layout
            )}



        </div>
    );
}
