import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                lake: {
                    900: "#0f172a", // Deep night blue
                    800: "#1e293b",
                    700: "#334155",
                },
                accent: {
                    glow: "rgba(255, 255, 255, 0.1)",
                },
            },
            backgroundSize: {
                "size-200": "200% 200%",
                "size-400": "400% 400%",
            },
            backgroundImage: {
                // Req 17, 35, 36: Coolhue gradients (24 total: 12 bright + 12 dark)
                // Bright gradients
                'gradient-calm-sky': 'linear-gradient(to bottom, #a8edea, #88d5f7, #e0c3fc)', // Req 36: Replaced Warm Flame
                'gradient-night-fade': 'linear-gradient(to top, #a18cd1, #fbc2eb)',
                'gradient-spring-warmth': 'linear-gradient(to top, #fad0c4, #ffd1ff)',
                'gradient-sunny-morning': 'linear-gradient(120deg, #f6d365, #fda085)',
                'gradient-rainy-ashville': 'linear-gradient(to top, #fbc2eb, #a6c1ee)',
                'gradient-frozen-dreams': 'linear-gradient(to top, #fdcbf1, #e6dee9)',
                'gradient-dusty-grass': 'linear-gradient(120deg, #d4fc79, #96e6a1)',
                'gradient-tempting-azure': 'linear-gradient(120deg, #84fab0, #8fd3f4)',
                'gradient-heavy-rain': 'linear-gradient(to top, #cfd9df, #e2ebf0)',
                'gradient-amy-crisp': 'linear-gradient(120deg, #a6c0fe, #f68084)',
                'gradient-mean-fruit': 'linear-gradient(120deg, #fccb90, #d57eeb)',
                'gradient-deep-blue': 'linear-gradient(120deg, #e0c3fc, #8ec5fc)',
                // Dark gradients (Req 35)
                'gradient-midnight-city': 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
                'gradient-dark-ocean': 'linear-gradient(to right, #0a192f, #112240, #1a365d)',
                'gradient-purple-night': 'linear-gradient(135deg, #1e1442, #2d1b69, #3e2a7a)',
                'gradient-forest-night': 'linear-gradient(to bottom, #0d1b2a, #1b263b, #415a77)',
                'gradient-deep-space': 'linear-gradient(to bottom right, #000000, #1a1a2e, #16213e)',
                'gradient-twilight-purple': 'linear-gradient(135deg, #2e1a47, #4a2c5b, #6b3e6f)',
                'gradient-dark-teal': 'linear-gradient(to right, #0a4d4e, #1a6b6d, #2a7a7c)',
                'gradient-carbon': 'linear-gradient(135deg, #1c1c1c, #2d2d2d, #3e3e3e)',
                'gradient-navy-depths': 'linear-gradient(to bottom, #001f3f, #003153, #00416a)',
                'gradient-emerald-night': 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
                'gradient-plum-shadow': 'linear-gradient(to right, #2a1a3d, #3d2a54, #503a6b)',
                'gradient-charcoal-mist': 'linear-gradient(135deg, #23252c, #353941, #484d56)',
            },
            fontFamily: {
                sans: ["var(--font-noto-sans-jp)"],
            },
            animation: {
                "fade-in": "fadeIn 1s ease-in-out forwards",
                "fade-out": "fadeOut 1s ease-in-out forwards",
                "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "breathe-in": "breatheIn 4s ease-in-out forwards",
                "breathe-hold": "breatheHold 4s ease-in-out forwards",
                "breathe-out": "breatheOut 8s ease-in-out forwards",
                "gradient-flow-vertical": "gradientFlowVertical linear infinite",
                "gradient-flow-horizontal": "gradientFlowHorizontal linear infinite",
                "gradient-flow-diagonal": "gradientFlowDiagonal linear infinite",
            },
            keyframes: {
                gradientFlowVertical: {
                    "0%": { "background-position": "0 0" },
                    "100%": { "background-position": "0 100vh" }
                },
                gradientFlowHorizontal: {
                    "0%": { "background-position": "0 0" },
                    "100%": { "background-position": "100vw 0" }
                },
                gradientFlowDiagonal: {
                    "0%": { "background-position": "0 0" },
                    "100%": { "background-position": "100vw 100vh" }
                },
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                fadeOut: {
                    "0%": { opacity: "1" },
                    "100%": { opacity: "0" },
                },
                breatheIn: {
                    "0%": { transform: "scale(1)" },
                    "100%": { transform: "scale(1.5)" },
                },
                breatheHold: {
                    "0%": { transform: "scale(1.5)" },
                    "100%": { transform: "scale(1.5)" },
                },
                breatheOut: {
                    "0%": { transform: "scale(1.5)" },
                    "100%": { transform: "scale(1)" },
                },
            },
        },
    },
    plugins: [],
};
export default config;
