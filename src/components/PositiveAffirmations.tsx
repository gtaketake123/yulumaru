"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import messages from "../data/messages.json";
import { RefreshCw } from "lucide-react";

interface PositiveAffirmationsProps {
    mode?: "breath-sync" | "random" | "falling" | "inside";
    trigger?: any; // Change trigger from parent (e.g. breath phase)
    onQuoteChange?: (quote: string) => void;
    enableTTS?: boolean; // Kept for prop compatibility, logic removed per Req 42
    speed?: number;
    density?: number;
    colorful?: boolean | "black";
}

export default function PositiveAffirmations({
    mode = "breath-sync",
    trigger,
    onQuoteChange,
    enableTTS = false,
    speed = 5,
    density = 5,
    colorful = false
}: PositiveAffirmationsProps) {
    // Initialize with a message immediately
    const [currentMessage, setCurrentMessage] = useState(() => {
        if (messages.length > 0) {
            const randomIndex = Math.floor(Math.random() * messages.length);
            return messages[randomIndex].text;
        }
        return "";
    });
    const [fallingMessages, setFallingMessages] = useState<{ id: number; text: string; left: number; duration: number, size?: number, opacity?: number, color?: string }[]>([]);
    const [isClient, setIsClient] = useState(false);

    // Req 42: TTS Logic Removed

    // Helper: Select new quote (Req 41/59: Ensure change using filtering)
    const selectNewQuote = useCallback(() => {
        if (messages.length === 0) return;

        setCurrentMessage(prev => {
            // Filter out the current message to guarantee a change
            const candidates = messages.filter(m => m.text !== prev);

            // If no candidates (only 1 message exists), return it; otherwise pick random
            if (candidates.length === 0) return prev;

            const randomIndex = Math.floor(Math.random() * candidates.length);
            const newMessage = candidates[randomIndex].text;

            if (onQuoteChange) onQuoteChange(newMessage);
            return newMessage;
        });
    }, [onQuoteChange]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Mode-specific behavior
    useEffect(() => {
        if (mode === "random" || mode === "falling") return;

        // Req 44: 'inside' mode also syncs with trigger
        if (mode === "breath-sync" || mode === "inside") {
            selectNewQuote();
        }
    }, [trigger, mode, selectNewQuote]);

    // Manual Click Handler
    const handleManualClick = () => {
        selectNewQuote();
    };

    // Falling Mode Logic
    useEffect(() => {
        if (mode !== "falling") {
            setFallingMessages([]);
            return;
        }

        const intervalTime = Math.max(200, 2000 - (density * 180));

        const interval = setInterval(() => {
            setFallingMessages(prev => {
                const baseDuration = Math.max(5, 25 - (speed * 2));
                const randomIndex = Math.floor(Math.random() * messages.length);

                const getRandomColor = () => {
                    const colors = [
                        "#93c5fd", "#86efac", "#f0abfc", "#fbb6ce", "#fcd34d",
                        "#a7f3d0", "#c7d2fe", "#bfdbfe", "#fecaca", "#d8b4fe",
                    ];
                    return colors[Math.floor(Math.random() * colors.length)];
                };

                const colorValue = colorful === true ? getRandomColor() : colorful === "black" ? "#000000" : "#ffffff";

                const newMessage = {
                    id: Date.now(),
                    text: messages[randomIndex].text,
                    // Req 80-Fixed: Cover full width (5vw to 95vw) per C5-2
                    left: Math.random() * 90 + 5,
                    duration: baseDuration + (Math.random() * 5),
                    size: Math.random() > 0.7 ? 1.2 : 1.0,
                    opacity: Math.random() * 0.5 + 0.3,
                    color: colorValue,
                };
                return [...prev.slice(-15), newMessage];
            });
        }, intervalTime);

        return () => clearInterval(interval);
    }, [mode, speed, density, colorful]);


    // Render Logic
    if (!isClient) return null;

    // Mode: Falling
    if (mode === "falling") {
        return (
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <AnimatePresence>
                    {fallingMessages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ y: -100, opacity: 0, x: `${msg.left}vw` }}
                            animate={{ y: "110vh", opacity: msg.opacity }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: msg.duration, ease: "linear" }}
                            className="absolute whitespace-nowrap font-medium tracking-wider"
                            style={{
                                fontSize: `${msg.size}rem`,
                                color: msg.color,
                                textShadow: "0 2px 10px rgba(0,0,0,0.1)"
                            }}
                        >
                            {msg.text}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        );
    }

    // Mode: Manual (Random)
    if (mode === "random") {
        return (
            <div className="flex flex-col items-center justify-center gap-6 z-20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentMessage}
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -20, filter: "blur(5px)" }}
                        transition={{ duration: 0.8 }}
                        className="text-center px-4 max-w-2xl"
                    >
                        <p className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/70 drop-shadow-[0_4px_10px_rgba(255,255,255,0.2)] leading-relaxed p-4">
                            {currentMessage}
                        </p>
                    </motion.div>
                </AnimatePresence>

                <button
                    onClick={handleManualClick}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white transition-all group cursor-pointer pointer-events-auto"
                >
                    <RefreshCw className="group-hover:rotate-180 transition-transform duration-500" size={20} />
                    <span>次の言葉</span>
                </button>
            </div>
        );
    }

    // Mode: Inside
    if (mode === "inside") {
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentMessage}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    // Req 75: Ensure checking full width availability
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 p-4"
                >
                    <p className="text-xs md:text-sm font-bold text-white/95 text-center leading-relaxed drop-shadow-md w-[90%]" style={{ textWrap: "balance" }}>
                        {currentMessage}
                    </p>
                </motion.div>
            </AnimatePresence>
        );
    }

    // Mode: Breath Sync (Default)
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={currentMessage}
                initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(5px)" }}
                transition={{ duration: 1.0 }}
                className="text-center px-4 max-w-2xl z-20"
            >
                <p className="text-xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/70 drop-shadow-lg leading-relaxed py-2">
                    {currentMessage}
                </p>
            </motion.div>
        </AnimatePresence>
    );
}
