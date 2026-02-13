"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import PositiveAffirmations from "@/components/PositiveAffirmations";
import BreathingGuide from "@/components/BreathingGuide";
import SettingsMenu from "@/components/SettingsMenu";
import BackgroundAudio from "@/components/BackgroundAudio";
import StarryBackground from "@/components/StarryBackground";
import { ChevronDown, RefreshCw, Settings2, Palette, Circle, Sparkles, Rocket } from "lucide-react";

export default function Home() {
  const [activePhase, setActivePhase] = useState("inhale");
  const [wordMode, setWordMode] = useState("breath-sync");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [bgTheme, setBgTheme] = useState("midnight-city");
  // Req 71: Default Circle Color to 3rd (spring-warmth / index 2)
  const [circleColor, setCircleColor] = useState("spring-warmth");

  const [enableTTS, setEnableTTS] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  // Req 70: Default Falling Speed/Density to 4
  const [fallingSpeed, setFallingSpeed] = useState(4);
  const [fallingDensity, setFallingDensity] = useState(4);

  const [fallingColorful, setFallingColorful] = useState<boolean | "black">(false);

  // Settings States
  const [circleScale, setCircleScale] = useState(2.0);
  // Req 82, 98-5, 98-7: Default Animation Speed 60s
  const [bgAnimSpeed, setBgAnimSpeed] = useState(60);
  const [bgAnimDirection, setBgAnimDirection] = useState<"vertical" | "horizontal" | "diagonal">("vertical");
  const [showCircle, setShowCircle] = useState(true);
  const [showWords, setShowWords] = useState(true);

  // Req 84: Starry Animation Overlay State
  const [starVariant, setStarVariant] = useState<"none" | "blink" | "rise">("blink");

  // Req 17-18, 35-36, 40: 24 Coolhue gradients (Color Map for Directional Support)
  const THEME_COLORS: Record<string, string[]> = {
    "calm-sky": ["#a8edea", "#88d5f7", "#e0c3fc"],
    "night-fade": ["#a18cd1", "#fbc2eb"],
    "spring-warmth": ["#fad0c4", "#ffd1ff"],
    "sunny-morning": ["#f6d365", "#fda085"],
    "rainy-ashville": ["#fbc2eb", "#a6c1ee"],
    "frozen-dreams": ["#fdcbf1", "#e6dee9"],
    "dusty-grass": ["#d4fc79", "#96e6a1"],
    "tempting-azure": ["#84fab0", "#8fd3f4"],
    "heavy-rain": ["#cfd9df", "#e2ebf0"],
    "amy-crisp": ["#a6c0fe", "#f68084"],
    "mean-fruit": ["#fccb90", "#d57eeb"],
    "deep-blue": ["#e0c3fc", "#8ec5fc"],
    "midnight-city": ["#0f0c29", "#302b63", "#24243e"],
    "dark-ocean": ["#0a192f", "#112240", "#1a365d"],
    "purple-night": ["#1e1442", "#2d1b69", "#3e2a7a"],
    "forest-night": ["#0d1b2a", "#1b263b", "#415a77"],
    "deep-space": ["#000000", "#1a1a2e", "#16213e"],
    "twilight-purple": ["#2e1a47", "#4a2c5b", "#6b3e6f"],
    "dark-teal": ["#0a4d4e", "#1a6b6d", "#2a7a7c"],
    "carbon": ["#1c1c1c", "#2d2d2d", "#3e3e3e"],
    "navy-depths": ["#001f3f", "#003153", "#00416a"],
    "emerald-night": ["#0f2027", "#203a43", "#2c5364"],
    "plum-shadow": ["#2a1a3d", "#3d2a54", "#503a6b"],
    "charcoal-mist": ["#23252c", "#353941", "#484d56"],
    "rising-stars": ["#020111", "#0b1026", "#2b32b2"],
    "indigo-pink-stars": ["#4b0082", "#ffc0cb"],
    "starry-sky": ["#000000"],
  };

  const getDynamicGradient = (theme: string, direction: "vertical" | "horizontal" | "diagonal") => {
    const colors = THEME_COLORS[theme] || THEME_COLORS["calm-sky"]; // Fallback
    if (colors.length === 1) return `linear-gradient(to bottom, ${colors[0]}, ${colors[0]})`; // Solid color case

    let angle = "to bottom"; // Vertical Default
    if (direction === "horizontal") angle = "to right";
    if (direction === "diagonal") angle = "135deg";

    return `linear-gradient(${angle}, ${colors.join(", ")})`;
  };

  const getAnimClass = () => {
    return bgAnimDirection === "vertical" ? "animate-gradient-flow-vertical" :
      bgAnimDirection === "horizontal" ? "animate-gradient-flow-horizontal" :
        "animate-gradient-flow-diagonal";
  };

  // Req 67: Circle Colors now use SAME Gradient Classes as Backgrounds
  const getCircleColorClass = (color: string) => {
    if (color === "starry-sky") return "bg-gradient-midnight-city"; // Fallback for circle if starry selected (or make it look starry?)
    if (color === "rising-stars") return "bg-gradient-navy-depths";
    if (color === "indigo-pink-stars") return "bg-gradient-night-fade";

    switch (color) {
      case "white": return "bg-white/30 backdrop-blur-md";
      case "calm-sky": return "bg-gradient-calm-sky";
      case "night-fade": return "bg-gradient-night-fade";
      case "spring-warmth": return "bg-gradient-spring-warmth";
      case "sunny-morning": return "bg-gradient-sunny-morning";
      case "rainy-ashville": return "bg-gradient-rainy-ashville";
      case "frozen-dreams": return "bg-gradient-frozen-dreams";
      case "dusty-grass": return "bg-gradient-dusty-grass";
      case "tempting-azure": return "bg-gradient-tempting-azure";
      case "heavy-rain": return "bg-gradient-heavy-rain";
      case "amy-crisp": return "bg-gradient-amy-crisp";
      case "mean-fruit": return "bg-gradient-mean-fruit";
      case "deep-blue": return "bg-gradient-deep-blue";
      case "midnight-city": return "bg-gradient-midnight-city";
      case "dark-ocean": return "bg-gradient-dark-ocean";
      case "purple-night": return "bg-gradient-purple-night";
      case "forest-night": return "bg-gradient-forest-night";
      case "deep-space": return "bg-gradient-deep-space";
      case "twilight-purple": return "bg-gradient-twilight-purple";
      case "dark-teal": return "bg-gradient-dark-teal";
      case "carbon": return "bg-gradient-carbon";
      case "navy-depths": return "bg-gradient-navy-depths";
      case "emerald-night": return "bg-gradient-emerald-night";
      case "plum-shadow": return "bg-gradient-plum-shadow";
      case "charcoal-mist": return "bg-gradient-charcoal-mist";
      default: return "bg-gradient-calm-sky";
    }
  };

  const handleBreathChange = useCallback((phase: "inhale" | "hold" | "exhale") => {
    setActivePhase(phase);
  }, []);

  const handleCycleComplete = useCallback(() => {
    setCycleCount(prev => prev + 1);
  }, []);

  // Req 95, 97: Blur Settings (Sharpness renamed to Focus, Fantasy to Brightness)
  const [blurSharpness, setBlurSharpness] = useState(80); // Default 80% (Clearer)
  const [blurFantasy, setBlurFantasy] = useState(100); // Default 100% (Bright)

  // Req 98-3: Stop/Resume Logic
  const [isPaused, setIsPaused] = useState(false);
  const [savedState, setSavedState] = useState<{ speed: number; focus: number; brightness: number } | null>(null);

  // Restore themes definition for local usage
  const themes = [
    { id: "calm-sky", name: "1-Calm Sky", gradient: "bg-gradient-calm-sky" },
    { id: "night-fade", name: "2-Night Fade", gradient: "bg-gradient-night-fade" },
    { id: "spring-warmth", name: "3-Spring Warmth", gradient: "bg-gradient-spring-warmth" },
    { id: "sunny-morning", name: "4-Sunny Morning", gradient: "bg-gradient-sunny-morning" },
    { id: "rainy-ashville", name: "5-Rainy Ashville", gradient: "bg-gradient-rainy-ashville" },
    { id: "frozen-dreams", name: "6-Frozen Dreams", gradient: "bg-gradient-frozen-dreams" },
    { id: "dusty-grass", name: "7-Dusty Grass", gradient: "bg-gradient-dusty-grass" },
    { id: "tempting-azure", name: "8-Tempting Azure", gradient: "bg-gradient-tempting-azure" },
    { id: "heavy-rain", name: "9-Heavy Rain", gradient: "bg-gradient-heavy-rain" },
    { id: "amy-crisp", name: "10-Amy Crisp", gradient: "bg-gradient-amy-crisp" },
    { id: "mean-fruit", name: "11-Mean Fruit", gradient: "bg-gradient-mean-fruit" },
    { id: "deep-blue", name: "12-Deep Blue", gradient: "bg-gradient-deep-blue" },
    { id: "midnight-city", name: "13-Midnight City", gradient: "bg-gradient-midnight-city" },
    { id: "dark-ocean", name: "14-Dark Ocean", gradient: "bg-gradient-dark-ocean" },
    { id: "purple-night", name: "15-Purple Night", gradient: "bg-gradient-purple-night" },
    { id: "forest-night", name: "16-Forest Night", gradient: "bg-gradient-forest-night" },
    { id: "deep-space", name: "17-Deep Space", gradient: "bg-gradient-deep-space" },
    { id: "twilight-purple", name: "18-Twilight Purple", gradient: "bg-gradient-twilight-purple" },
    { id: "dark-teal", name: "19-Dark Teal", gradient: "bg-gradient-dark-teal" },
    { id: "carbon", name: "20-Carbon", gradient: "bg-gradient-carbon" },
    { id: "navy-depths", name: "21-Navy Depths", gradient: "bg-gradient-navy-depths" },
    { id: "emerald-night", name: "22-Emerald Night", gradient: "bg-gradient-emerald-night" },
    { id: "plum-shadow", name: "23-Plum Shadow", gradient: "bg-gradient-plum-shadow" },
    { id: "charcoal-mist", name: "24-Charcoal Mist", gradient: "bg-gradient-charcoal-mist" },
    { id: "rising-stars", name: "25-Rising Star", gradient: "bg-gradient-rising-stars" },
    { id: "indigo-pink-stars", name: "26-Indigo Pink", gradient: "bg-gradient-indigo-pink-stars" },
    { id: "starry-sky", name: "27-Starry Sky", gradient: "bg-gradient-starry-sky" },
  ];

  const togglePause = () => {
    if (!isPaused) {
      // Pause: Save state, then set to "Clear & Bright" static mode
      setSavedState({ speed: bgAnimSpeed, focus: blurSharpness, brightness: blurFantasy });
      setBgAnimSpeed(0); // Stop animation
      setBlurSharpness(100); // Max Focus (UI)
      setBlurFantasy(100); // Max Brightness
      setIsPaused(true);
    } else {
      // Resume: Restore saved state
      if (savedState) {
        setBgAnimSpeed(savedState.speed);
        setBlurSharpness(savedState.focus);
        setBlurFantasy(savedState.brightness);
      }
      setIsPaused(false);
    }
  };

  // Req 98-6: Internal Focus Mapping (0-100 UI -> 0-90 Internal)
  // Req 98-8: When Paused, force STRICT 100% (no blur), otherwise use mapped 90% cap
  const effectiveFocus = isPaused ? 100 : blurSharpness * 0.9;

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden text-white">

      {/* C2-5 & C2-6 & C2-7 & C2-8 & C2-9: Blurred Animated Background Layer */}
      <div
        className={`absolute inset-0 z-[-1] scale-125 bg-repeat transition-all duration-1000 ${bgAnimSpeed > 0 ? getAnimClass() : ""}`}
        style={{
          backgroundImage: getDynamicGradient(bgTheme, bgAnimDirection),
          animationDuration: `${bgAnimSpeed}s`,
          // Req 98-8: Strict 100% Focus (No Blur) when Paused
          filter: isPaused ? "none" : `blur(${(100 - effectiveFocus) * 2}px)`,
          opacity: blurFantasy / 100
        }}
      />

      <BackgroundAudio />

      {/* Req 84: Starry Sky Overlay (Togglable for ALL themes) - Needs to be above blurred bg but below content */}
      {starVariant !== "none" && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <StarryBackground key={starVariant} variant={starVariant as "blink" | "rise"} />
        </div>
      )}

      {/* Req 63: Toggle Words Visibility */}
      {showWords && wordMode === "falling" && (
        <div className="absolute inset-0 z-0">
          <PositiveAffirmations
            mode="falling"
            speed={fallingSpeed}
            density={fallingDensity}
            colorful={fallingColorful}
          />
        </div>
      )}

      <div className="absolute top-4 left-4 z-40 pointer-events-auto flex items-center gap-3">
        <SettingsMenu
          wordMode={wordMode} setWordMode={setWordMode}
          bgTheme={bgTheme} setBgTheme={setBgTheme}
          circleColor={circleColor} setCircleColor={setCircleColor}
          enableTTS={enableTTS} setEnableTTS={setEnableTTS}
          fallingSpeed={fallingSpeed} setFallingSpeed={setFallingSpeed}
          fallingDensity={fallingDensity} setFallingDensity={setFallingDensity}
          fallingColorful={fallingColorful} setFallingColorful={setFallingColorful}
          circleScale={circleScale} setCircleScale={setCircleScale}
          bgAnimSpeed={bgAnimSpeed} setBgAnimSpeed={setBgAnimSpeed}
          bgAnimDirection={bgAnimDirection} setBgAnimDirection={setBgAnimDirection}
          showCircle={showCircle} setShowCircle={setShowCircle}
          showWords={showWords} setShowWords={setShowWords}
          starVariant={starVariant} setStarVariant={setStarVariant}
          blurSharpness={blurSharpness} setBlurSharpness={setBlurSharpness}
          blurFantasy={blurFantasy} setBlurFantasy={setBlurFantasy}
          isPaused={isPaused} togglePause={togglePause}
        />

        {/* Req 99-7: Star Effect Toggle Button (White Circle 1) */}
        <button
          onClick={() => setStarVariant(prev => prev === "blink" ? "none" : "blink")}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${starVariant === "blink" ? "bg-white text-lake-900" : "bg-white/10 text-white hover:bg-white/20"}`}
          title="星空エフェクト"
        >
          <Sparkles size={18} className={starVariant === "blink" ? "fill-current" : ""} />
        </button>

        {/* Req 99-7: Planetarium Effect Toggle Button (White Circle 2) */}
        <button
          onClick={() => setStarVariant(prev => prev === "rise" ? "none" : "rise")}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${starVariant === "rise" ? "bg-white text-lake-900" : "bg-white/10 text-white hover:bg-white/20"}`}
          title="プラネタリウム"
        >
          <Rocket size={18} className={starVariant === "rise" ? "fill-current" : ""} />
        </button>
      </div>

      <header className="absolute top-0 w-full flex flex-col items-center pt-8 z-30 pointer-events-none">
        {/* Req 99-5: Strict visibility: Only show on screens tall enough and wide enough to prevent overlap */}
        {/* Req 99-8: Rename to "~ ゆるまる ~" */}
        <h1 className="hidden md:block min-h-[700px]:block text-lg md:text-xl font-medium tracking-[0.2em] opacity-80 uppercase drop-shadow-md transition-opacity duration-300 font-serif">
          ~ ゆるまる ~
        </h1>
      </header>


      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-screen pb-16">

        {showCircle && (
          <div className={`mb-4 scale-90 md:scale-100 transition-transform relative z-10 flex flex-col items-center`}>

            <BreathingGuide
              autoStart={true}
              defaultMode="6-6"
              onBreathChange={handleBreathChange}
              onCycleComplete={handleCycleComplete}
              circleColor={getCircleColorClass(circleColor)}
              baseScale={circleScale}
              centerContent={
                showWords && wordMode === "inside" ? (
                  <PositiveAffirmations
                    mode="inside"
                    trigger={cycleCount}
                  />
                ) : null
              }
            />
          </div>
        )}

        {/* Toggle Words Visibility */}
        {/* Req 99-2: Fixed positioning for manual mode */}
        {showWords && wordMode !== "inside" && wordMode !== "falling" && (
          <div className="w-full flex items-center justify-center pointer-events-auto z-20">
            <PositiveAffirmations
              mode={wordMode as any}
              trigger={cycleCount}
              speed={fallingSpeed}
              density={fallingDensity}
              colorful={fallingColorful}
            />
          </div>
        )}

        {/* Req 99-6: Word Mode Dropdown at Bottom - Redesigned C4-5 (Portal Fix C4-9) */}
        {mounted ? createPortal(
          <div
            className="pointer-events-auto relative group"
            style={{
              position: 'fixed',
              bottom: '8%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 300 // Higher than Controls (z-40) and Settings (z-50)
            }}
          >
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all text-sm font-medium border border-white/10 shadow-lg text-white/80 hover:text-white">
              <span>
                {wordMode === "breath-sync" && "呼吸連動"}
                {wordMode === "random" && "手動"}
                {wordMode === "falling" && "言葉の雨"}
                {wordMode === "inside" && "サークル内"}
              </span>
              <ChevronDown size={14} className="opacity-70 group-hover:rotate-180 transition-transform" />
            </button>

            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 py-2 bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-bottom overflow-hidden">
              <button onClick={() => setWordMode("breath-sync")} className="w-full text-left px-4 py-3 hover:bg-white/10 text-xs transition-colors">呼吸連動</button>
              <button onClick={() => setWordMode("random")} className="w-full text-left px-4 py-3 hover:bg-white/10 text-xs transition-colors">手動</button>
              <button onClick={() => setWordMode("falling")} className="w-full text-left px-4 py-3 hover:bg-white/10 text-xs transition-colors">言葉の雨</button>
              <button onClick={() => setWordMode("inside")} className="w-full text-left px-4 py-3 hover:bg-white/10 text-xs transition-colors">サークル内</button>
            </div>
          </div>,
          document.body
        ) : null}

      </div>

      <div className="absolute top-20 left-4 z-40 flex flex-col gap-3 pointer-events-auto">
        {/* Req 73: Sequential BG loop with UI [Icon + Number + Name] */}
        <button
          onClick={() => {
            const currentIndex = themes.findIndex(t => t.id === bgTheme);
            const nextIndex = (currentIndex + 1) % themes.length;
            setBgTheme(themes[nextIndex].id);
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white/90 transition-all border border-white/5"
          title="背景色を順に変更"
        >
          <Palette size={18} />
          <span className="text-xs font-bold whitespace-nowrap">
            {themes.find(t => t.id === bgTheme)?.name || "1-Calm Sky"}
          </span>
        </button>

        <button
          onClick={() => {
            const currentIndex = themes.findIndex(t => t.id === circleColor) !== -1
              ? themes.findIndex(t => t.id === circleColor)
              : 0;
            const nextIndex = (currentIndex + 1) % themes.length;
            setCircleColor(themes[nextIndex].id);
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white/90 transition-all border border-white/5"
          title="サークル色を順に変更"
        >
          <Circle size={18} />
          <span className="text-xs font-bold whitespace-nowrap">
            {themes.find(t => t.id === circleColor)?.name || "1"}
          </span>
        </button>
      </div>

      <footer className="absolute bottom-4 text-[10px] text-white/30 tracking-widest z-30 font-sans">
        © 2026 You lull mind room.
      </footer>

    </main>
  );
}
