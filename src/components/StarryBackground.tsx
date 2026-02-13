"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface StarryBackgroundProps {
    variant?: "blink" | "rise" | "static"; // Added static if needed, or just default
    gradientClass?: string; // Can be empty for overlay
    className?: string;
}

export default function StarryBackground({ variant = "blink", gradientClass = "", className = "" }: StarryBackgroundProps) {
    const [stars, setStars] = useState<{ id: number; top: number; left: number; size: number; duration: number; delay: number }[]>([]);

    useEffect(() => {
        const starCount = 50;
        const newStars = Array.from({ length: starCount }).map((_, i) => ({
            id: i,
            top: Math.random() * 100,
            left: Math.random() * 100,
            size: Math.random() * 2 + 1, // 1px to 3px
            duration: Math.random() * 3 + 2, // 2s to 5s (Blink) or 10s-20s (Rise)
            delay: Math.random() * 5,
        }));
        setStars(newStars);
    }, []);

    return (
        <div className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${gradientClass} ${className}`}>
            {stars.map((star) => {
                if (variant === "rise") {
                    return (
                        <motion.div
                            key={star.id}
                            className="absolute bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,0.8)]"
                            style={{
                                left: `${star.left}%`,
                                width: star.size,
                                height: star.size,
                            }}
                            initial={{ top: "110%", opacity: 0 }}
                            animate={{
                                top: "-10%",
                                opacity: [0, 1, 1, 0] // Fade in, stay, fade out at very end
                            }}
                            transition={{
                                duration: star.duration * 4, // Slower for rising
                                repeat: Infinity,
                                delay: star.delay,
                                ease: "linear",
                            }}
                        />
                    );
                } else {
                    // Blink Variant
                    return (
                        <motion.div
                            key={star.id}
                            className="absolute bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,0.8)]"
                            style={{
                                top: `${star.top}%`,
                                left: `${star.left}%`,
                                width: star.size,
                                height: star.size,
                            }}
                            animate={{
                                opacity: [0.2, 1, 0.2],
                                scale: [1, 1.2, 1],
                            }}
                            transition={{
                                duration: star.duration,
                                repeat: Infinity,
                                delay: star.delay,
                                ease: "easeInOut",
                            }}
                        />
                    );
                }
            })}
        </div>
    );
}
