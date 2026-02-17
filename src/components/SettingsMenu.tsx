"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Settings, X, Heart, Circle, CloudRain, MousePointer, Maximize, Eye, EyeOff, ArrowUp, ArrowRight, TrendingUp, Play, Pause, User, Volume2, Cloud, Music, Moon, Droplets, Flame, Bird, TreePine, Feather, Plus, Trash2, Star, Ban } from "lucide-react";
import AuthButton from "./AuthButton";
import { useAuth } from "@/context/AuthContext";
import { updateUserFields } from "@/lib/firestore";

type Tab = "words" | "background" | "audio" | "account";

interface SettingsMenuProps {
    wordMode: string;
    setWordMode: (mode: string) => void;
    bgTheme: string;
    setBgTheme: (theme: string) => void;
    circleColor: string;
    setCircleColor: (color: string) => void;
    enableTTS: boolean;
    setEnableTTS: (enable: boolean) => void;
    fallingSpeed: number;
    setFallingSpeed: (speed: number) => void;
    fallingDensity: number;
    setFallingDensity: (density: number) => void;
    fallingColorful: boolean | "black";
    setFallingColorful: (colorful: boolean | "black") => void;
    circleScale: number;
    setCircleScale: (scale: number) => void;
    bgAnimSpeed: number;
    setBgAnimSpeed: (speed: number) => void;
    bgAnimDirection: "vertical" | "horizontal" | "diagonal";
    setBgAnimDirection: (direction: "vertical" | "horizontal" | "diagonal") => void;
    showCircle: boolean;
    setShowCircle: (show: boolean) => void;
    showWords: boolean;
    setShowWords: (show: boolean) => void;
    starVariant: "none" | "blink" | "rise";
    setStarVariant: (variant: "none" | "blink" | "rise") => void;
    blurSharpness: number;
    setBlurSharpness: (val: number) => void;
    blurFantasy: number;
    setBlurFantasy: (val: number) => void;
    isPaused: boolean;
    togglePause: () => void;
    bgmSelection: "brown-noise" | "wave" | "birds" | "rivers-birds" | "bonfires" | "rivers";
    setBgmSelection: (val: "brown-noise" | "wave" | "birds" | "rivers-birds" | "bonfires" | "rivers") => void;
}

export default function SettingsMenu({
    wordMode,
    setWordMode,
    bgTheme,
    setBgTheme,
    circleColor,
    setCircleColor,
    enableTTS,
    setEnableTTS,
    fallingSpeed,
    setFallingSpeed,
    fallingDensity,
    setFallingDensity,
    fallingColorful,
    setFallingColorful,
    circleScale,
    setCircleScale,
    bgAnimSpeed,
    setBgAnimSpeed,
    bgAnimDirection,
    setBgAnimDirection,
    showCircle,
    setShowCircle,
    showWords,
    setShowWords,
    starVariant,
    setStarVariant,
    blurSharpness,
    setBlurSharpness,
    blurFantasy,
    setBlurFantasy,
    isPaused,
    togglePause,
    bgmSelection,
    setBgmSelection,
}: SettingsMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>("words");
    const [mounted, setMounted] = useState(false);

    // Auth & User Data
    const { user, userData, refreshUserData } = useAuth();
    const [inputBlocked, setInputBlocked] = useState("");
    const [inputFavorite, setInputFavorite] = useState("");

    const handleAddBlocked = async () => {
        if (!user || !userData || !inputBlocked.trim()) return;
        const newWords = [...(userData.blockedWords || []), inputBlocked.trim()];
        // Optimistic update? Or wait for sync? Sync is better but requires context update.
        // Actually AuthContext syncs on login/load. 
        // We should manually update local state or rely on real-time listener?
        // Current AuthContext uses `onAuthStateChanged` which is for Auth object.
        // It DOES NOT listen to Firestore changes in real-time.
        // So we should ideally re-fetch or optimistically update.
        // For now, let's just push to Firestore.
        // AND we might need a way to refresh context? 
        // Or just let the user reload?
        // Let's implement Optimistic UI locally or simple approach first.

        await updateUserFields(user.uid, { blockedWords: newWords });
        setInputBlocked("");
        // Note: Code should handle showing the new data. 
        // Since AuthContext doesn't subscribe to Firestore, the UI won't update automatically 
        // unless we update the `userData` in context or fetch again.
        // A simple reload of page works, or let's assume we might need a context refresh method later.
        // Actually, user expects it to appear.
        // I'll update the Context Logic in next step if needed.
        await refreshUserData();
    };

    const handleRemoveBlocked = async (word: string) => {
        if (!user || !userData) return;
        const newWords = (userData.blockedWords || []).filter(w => w !== word);
        await updateUserFields(user.uid, { blockedWords: newWords });
        // Same refresh issue.
        await refreshUserData();
    };

    const handleAddFavorite = async () => {
        if (!user || !userData || !inputFavorite.trim()) return;
        const newWords = [...(userData.favoriteWords || []), inputFavorite.trim()];
        await updateUserFields(user.uid, { favoriteWords: newWords });
        setInputFavorite("");
        await refreshUserData();
    };

    const handleRemoveFavorite = async (word: string) => {
        if (!user || !userData) return;
        const newWords = (userData.favoriteWords || []).filter(w => w !== word);
        await updateUserFields(user.uid, { favoriteWords: newWords });
        await refreshUserData();
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    const wordModes = [
        { id: "breath-sync", label: "呼吸連動", icon: <Heart size={18} />, desc: "呼吸のリズムに合わせて" },
        { id: "inside", label: "サークル内", icon: <Circle size={18} />, desc: "呼吸サークルの中に表示" },
        { id: "falling", label: "言葉の雨", icon: <CloudRain size={18} />, desc: "上から言葉が降り注ぐ" },
        { id: "random", label: "手動", icon: <MousePointer size={18} />, desc: "タップで切り替え" },
    ];

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
        // Themes 25-27 are now just gradient presets + Overlay logic should be manual?
        // User asked to "Reflect... on all themes".
        // I'll keep them as distinct gradients for selection, but Overlay is separate.
        { id: "starry-sky", name: "25-Starry Sky", gradient: "bg-black border border-white/20" },
        { id: "rising-stars", name: "26-Rising Stars", gradient: "bg-[linear-gradient(to_top,#020111,#0b1026,#2b32b2)]" },
        { id: "indigo-pink-stars", name: "27-Indigo Pink Stars", gradient: "bg-[linear-gradient(to_top,#4b0082,#ffc0cb)]" },
    ];

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all z-50 text-white/80"
                aria-label="設定"
            >
                <Settings size={22} />
            </button>

            {isOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setIsOpen(false)} />
                    <div className="relative w-full max-w-lg bg-[#1a1a2e]/90 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden animate-fade-in text-white">

                        <div className="flex items-center justify-between p-5 border-b border-white/10">
                            <h2 className="text-lg font-bold tracking-wider">設定</h2>
                            <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex border-b border-white/10">
                            <button
                                onClick={() => setActiveTab("words")}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "words" ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80"
                                    }`}
                            >
                                言葉の設定
                            </button>
                            <button
                                onClick={() => setActiveTab("background")}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "background" ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80"
                                    }`}
                            >
                                背景・色
                            </button>
                            <button
                                onClick={() => setActiveTab("audio")}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "audio" ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80"
                                    }`}
                            >
                                BGM
                            </button>
                            <button
                                onClick={() => setActiveTab("account")}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "account" ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80"
                                    }`}
                            >
                                アカウント
                            </button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {activeTab === "audio" ? (
                                <div className="space-y-6 animate-fade-in">
                                    <div>
                                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">環境音の選択</h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            {[
                                                { id: "wave", label: "夜の浜辺", desc: "穏やかな波の音", icon: Moon },
                                                { id: "rivers", label: "春の小川", desc: "流れる水の音", icon: Droplets },
                                                { id: "bonfires", label: "冬の暖炉", desc: "パチパチとした安らぎ", icon: Flame },
                                                { id: "rivers-birds", label: "水辺に集う小鳥", desc: "清流と鳥の声", icon: Feather },
                                                { id: "birds", label: "野鳥の森", desc: "森の中の静寂", icon: Bird },
                                                { id: "brown-noise", label: "ブラウンノイズ", desc: "深い集中 (生成音)", icon: Cloud },
                                            ].map((bgm) => (
                                                <button
                                                    key={bgm.id}
                                                    onClick={() => setBgmSelection(bgm.id as any)}
                                                    className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${bgmSelection === bgm.id
                                                        ? "bg-white/20 border-white/40 shadow-md"
                                                        : "bg-white/5 border-transparent hover:bg-white/10"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-full ${bgmSelection === bgm.id ? "bg-white/20" : "bg-white/5"}`}>
                                                            <bgm.icon size={18} className={bgmSelection === bgm.id ? "text-white" : "text-white/60"} />
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-bold block">{bgm.label}</span>
                                                            <span className="text-xs text-white/60">{bgm.desc}</span>
                                                        </div>
                                                    </div>
                                                    {bgmSelection === bgm.id && (
                                                        <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-white/40 mt-4 text-center">
                                            ※左下のボタンでBGM切替・音量調整ができます
                                        </p>
                                    </div>
                                </div>
                            ) : activeTab === "account" ? (
                                <div className="space-y-6 animate-fade-in">
                                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">アカウント設定</h3>
                                    <AuthButton />

                                    {user && userData ? (
                                        <div className="space-y-6 mt-6 animate-fade-in">
                                            {/* Blocked Words Section */}
                                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                                <div className="flex items-center gap-2 mb-3 text-white/70">
                                                    <Ban size={16} className="text-red-400" />
                                                    <span className="text-sm font-bold">苦手な言葉（ブロック）</span>
                                                </div>
                                                <div className="flex gap-2 mb-3">
                                                    <input
                                                        type="text"
                                                        value={inputBlocked}
                                                        onChange={(e) => setInputBlocked(e.target.value)}
                                                        placeholder="言葉を入力..."
                                                        className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                                                        onKeyDown={(e) => e.key === "Enter" && handleAddBlocked()}
                                                    />
                                                    <button
                                                        onClick={handleAddBlocked}
                                                        disabled={!inputBlocked.trim()}
                                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        <Plus size={18} />
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {userData.blockedWords?.length > 0 ? (
                                                        userData.blockedWords.map((word, i) => (
                                                            <div key={i} className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded text-xs text-red-200">
                                                                <span>{word}</span>
                                                                <button onClick={() => handleRemoveBlocked(word)} className="hover:text-white ml-1">
                                                                    <X size={12} />
                                                                </button>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-white/30">登録なし</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Favorite Words Section */}
                                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                                <div className="flex items-center gap-2 mb-3 text-white/70">
                                                    <Star size={16} className="text-yellow-400" />
                                                    <span className="text-sm font-bold">お気に入りの言葉</span>
                                                </div>
                                                <div className="flex gap-2 mb-3">
                                                    <input
                                                        type="text"
                                                        value={inputFavorite}
                                                        onChange={(e) => setInputFavorite(e.target.value)}
                                                        placeholder="言葉を入力..."
                                                        className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                                                        onKeyDown={(e) => e.key === "Enter" && handleAddFavorite()}
                                                    />
                                                    <button
                                                        onClick={handleAddFavorite}
                                                        disabled={!inputFavorite.trim()}
                                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        <Plus size={18} />
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {userData.favoriteWords?.length > 0 ? (
                                                        userData.favoriteWords.map((word, i) => (
                                                            <div key={i} className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded text-xs text-yellow-200">
                                                                <span>{word}</span>
                                                                <button onClick={() => handleRemoveFavorite(word)} className="hover:text-white ml-1">
                                                                    <X size={12} />
                                                                </button>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-white/30">登録なし</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-white/40 mt-4 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                                            Googleログインすると、<br />
                                            苦手な言葉のブロックや、お気に入りの言葉を登録してカスタマイズできます。
                                        </p>
                                    )}
                                </div>
                            ) : activeTab === "words" ? (
                                <div className="space-y-6">

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">表示モード選択</h3>
                                            {/* Req 74: Toggle Words Visibility (Eye Icon) */}
                                            <button
                                                onClick={() => setShowWords(!showWords)}
                                                className={`p-1.5 rounded-lg transition-colors ${showWords ? "bg-cyan-500/20 text-cyan-300" : "bg-white/5 text-white/30"}`}
                                                title={showWords ? "表示中" : "非表示"}
                                            >
                                                {showWords ? <Eye size={16} /> : <EyeOff size={16} />}
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {wordModes.map((mode) => (
                                                <button
                                                    key={mode.id}
                                                    onClick={() => setWordMode(mode.id)}
                                                    className={`p-3 rounded-xl border text-left transition-all ${wordMode === mode.id
                                                        ? "bg-white/20 border-white/40 shadow-md"
                                                        : "bg-white/5 border-transparent hover:bg-white/10"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {mode.icon}
                                                        <span className="text-sm font-bold">{mode.label}</span>
                                                    </div>
                                                    <p className="text-[10px] text-white/60">{mode.desc}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {wordMode === "falling" && (
                                        <div className="space-y-4 animate-fade-in">
                                            <div className="h-px bg-white/10" />
                                            <div>
                                                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">降る言葉の設定</h3>

                                                <div className="space-y-4">
                                                    <div>
                                                        <div className="flex justify-between text-sm mb-2">
                                                            <span className="text-white/70">落下スピード</span>
                                                            <span className="text-white/50">{fallingSpeed}</span>
                                                        </div>
                                                        <input
                                                            type="range" min="1" max="10"
                                                            value={fallingSpeed}
                                                            onChange={(e) => setFallingSpeed(parseInt(e.target.value))}
                                                            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                                                        />
                                                    </div>

                                                    <div>
                                                        <div className="flex justify-between text-sm mb-2">
                                                            <span className="text-white/70">言葉の量</span>
                                                            <span className="text-white/50">{fallingDensity}</span>
                                                        </div>
                                                        <input
                                                            type="range" min="1" max="10"
                                                            value={fallingDensity}
                                                            onChange={(e) => setFallingDensity(parseInt(e.target.value))}
                                                            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                                                        />
                                                    </div>

                                                    <div>
                                                        <div className="text-xs text-white/50 mb-2">カラー選択</div>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <button
                                                                onClick={() => setFallingColorful(true)}
                                                                className={`px-3 py-2 rounded-lg text-xs transition-all ${fallingColorful === true
                                                                    ? "bg-white/20 text-white border border-white/30"
                                                                    : "bg-white/5 text-white/50 border border-white/10"
                                                                    }`}
                                                            >
                                                                カラフル
                                                            </button>
                                                            <button
                                                                onClick={() => setFallingColorful(false)}
                                                                className={`px-3 py-2 rounded-lg text-xs transition-all ${fallingColorful === false
                                                                    ? "bg-white/20 text-white border border-white/30"
                                                                    : "bg-white/5 text-white/50 border border-white/10"
                                                                    }`}
                                                            >
                                                                白
                                                            </button>
                                                            <button
                                                                onClick={() => setFallingColorful("black")}
                                                                className={`px-3 py-2 rounded-lg text-xs transition-all ${fallingColorful === "black"
                                                                    ? "bg-white/20 text-white border border-white/30"
                                                                    : "bg-white/5 text-white/50 border border-white/10"
                                                                    }`}
                                                            >
                                                                黒
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Circle Settings moved to Background Tab? Or kept here? 
                                        Actually usually "Words" tab had word stuff.
                                        But wait, "Background" tab usually has Theme and Circle Color.
                                        "Circle Scale" and "Show Circle" - maybe in Words/General?
                                        Previously it was in "words"?
                                        Let's check logical grouping.
                                        "Words" -> Mode, Falling Settings.
                                        "Background" -> Theme, Circle Color, Circle Scale, Animations.
                                        
                                        Wait, "Inside" mode places words INSIDE circle. 
                                        So Circle Visibility is relevant to words.
                                        But Circle Color is visual.
                                        
                                        The previous code (fragment) had "Show Circle" and "Circle Scale" in the "Words" tab (lines 230+ in broken file).
                                        But "Circle Color" was also there (line 259).
                                        AND "ActiveTab" logic suggests "words" vs "background".
                                        
                                        I will put Circle-related things in "Background & Visuals" (background tab) 
                                        EXCEPT maybe "Show Circle" if it's considered a "Mode" toggle?
                                        No, let's put all Visual Settings (Background, Circle, Animation) in the second tab.
                                        And "Words" tab is purely for Words configuration.
                                     */}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">背景設定</h3>
                                        </div>

                                        <div className="mb-4 bg-white/5 p-3 rounded-xl border border-white/10 space-y-4">
                                            {/* Req 97: Renamed to Focus/Brightness */}
                                            <div>
                                                <div className="flex justify-between text-xs text-white/50 mb-2">
                                                    <span>ピント (鮮明度)</span>
                                                    <span>{blurSharpness}%</span>
                                                </div>
                                                <input
                                                    type="range" min="0" max="100"
                                                    value={blurSharpness}
                                                    onChange={(e) => setBlurSharpness(parseInt(e.target.value))}
                                                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                                                />
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs text-white/50 mb-2">
                                                    <span>明るさ</span>
                                                    <span>{blurFantasy}%</span>
                                                </div>
                                                <input
                                                    type="range" min="0" max="100"
                                                    value={blurFantasy}
                                                    onChange={(e) => setBlurFantasy(parseInt(e.target.value))}
                                                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                                                />
                                            </div>

                                            <div className="h-px bg-white/5" />

                                            {/* Req 84, 98-4: Starry Overlay Controls */}
                                            <div>
                                                <div className="text-xs text-white/50 mb-2">エフェクト</div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <button onClick={() => setStarVariant("none")} className={`p-2 rounded text-[10px] ${starVariant === "none" ? "bg-white/20 text-white" : "bg-white/5 text-white/50"}`}>
                                                        なし
                                                    </button>
                                                    <button onClick={() => setStarVariant("blink")} className={`p-2 rounded text-[10px] ${starVariant === "blink" ? "bg-white/20 text-white" : "bg-white/5 text-white/50"}`}>
                                                        星空
                                                    </button>
                                                    <button onClick={() => setStarVariant("rise")} className={`p-2 rounded text-[10px] ${starVariant === "rise" ? "bg-white/20 text-white" : "bg-white/5 text-white/50"}`}>
                                                        プラネタリウム
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-xs text-white/50 mb-2">アニメーション方向</div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <button onClick={() => setBgAnimDirection("vertical")} className={`p-2 rounded flex flex-col items-center gap-1 ${bgAnimDirection === "vertical" ? "bg-white/20 text-white" : "bg-white/5 text-white/50"}`}>
                                                        <ArrowUp size={14} /> <span className="text-[10px]">縦</span>
                                                    </button>
                                                    <button onClick={() => setBgAnimDirection("horizontal")} className={`p-2 rounded flex flex-col items-center gap-1 ${bgAnimDirection === "horizontal" ? "bg-white/20 text-white" : "bg-white/5 text-white/50"}`}>
                                                        <ArrowRight size={14} /> <span className="text-[10px]">横</span>
                                                    </button>
                                                    <button onClick={() => setBgAnimDirection("diagonal")} className={`p-2 rounded flex flex-col items-center gap-1 ${bgAnimDirection === "diagonal" ? "bg-white/20 text-white" : "bg-white/5 text-white/50"}`}>
                                                        <TrendingUp size={14} /> <span className="text-[10px]">斜め</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-xs text-white/50 mb-2">ループ時間</div>
                                                {/* Req 98, 98-3, 98-4: Extended Options & Toggle Button */}
                                                <div className="grid grid-cols-5 gap-1">
                                                    {[4, 5, 6, 10, 12, 20, 60, 100, 120, 0].map(s => {
                                                        const isStopBtn = s === 0;
                                                        // Req 98-9: Disable other buttons when paused
                                                        const isDisabled = isPaused && !isStopBtn;

                                                        return (
                                                            <button
                                                                key={s}
                                                                disabled={isDisabled}
                                                                onClick={() => {
                                                                    if (isStopBtn) {
                                                                        togglePause();
                                                                    } else {
                                                                        setBgAnimSpeed(s);
                                                                    }
                                                                }}
                                                                className={`p-1.5 rounded text-[10px] flex items-center justify-center transition-all ${isStopBtn
                                                                    ? (isPaused ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/50" : "bg-white/5 text-white/50 hover:bg-white/10")
                                                                    : (isDisabled
                                                                        ? "bg-white/5 text-white/20 cursor-not-allowed opacity-50" // Disabled Style
                                                                        : (bgAnimSpeed === s && !isPaused ? "bg-white/20 text-white" : "bg-white/5 text-white/50 hover:bg-white/10")
                                                                    )
                                                                    }`}
                                                            >
                                                                {isStopBtn ? (isPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />) : `${s}s`}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">背景テーマ選択</h3>
                                        <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                                            {themes.map((theme) => (
                                                <button
                                                    key={theme.id}
                                                    onClick={() => setBgTheme(theme.id)}
                                                    className={`relative h-16 rounded-lg overflow-hidden border transition-all ${bgTheme === theme.id ? "border-white scale-[1.05] shadow-lg ring-2 ring-white/20" : "border-white/10 hover:border-white/30"
                                                        }`}
                                                >
                                                    <div className={`absolute inset-0 ${theme.gradient}`}></div>
                                                    {/* Req 96-4: Compact Telop Base (Name only, Number is text only) */}
                                                    <div className="absolute inset-0 flex flex-col justify-end p-1">
                                                        <div className="flex justify-between items-end">
                                                            <span className="backdrop-blur-[0px] rounded px-1 py-0.5 text-[10px] font-bold text-white font-sans leading-none drop-shadow-md">
                                                                {theme.name.split("-")[0]}
                                                            </span>
                                                            <span className="bg-gray-900/40 backdrop-blur-[2px] rounded px-1 py-0.5 text-[8px] text-white/90 leading-none">
                                                                {theme.name.split("-").slice(1).join("-")}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="h-px bg-white/10" />

                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">呼吸サークル</h3>
                                            <button
                                                onClick={() => setShowCircle(!showCircle)}
                                                className={`p-1.5 rounded-lg transition-colors ${showCircle ? "bg-cyan-500/20 text-cyan-300" : "bg-white/5 text-white/30"}`}
                                                title={showCircle ? "表示中" : "非表示"}
                                            >
                                                {showCircle ? <Eye size={16} /> : <EyeOff size={16} />}
                                            </button>
                                        </div>

                                        <div className="mb-4 bg-white/5 p-3 rounded-xl border border-white/10">
                                            <div className="flex justify-between text-sm mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Maximize size={14} className="opacity-70" />
                                                    <span className="text-white/70">サークルの大きさ</span>
                                                </div>
                                                <span className="text-white/50">x{circleScale.toFixed(1)}</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="3" step="0.1"
                                                value={circleScale}
                                                onChange={(e) => setCircleScale(parseFloat(e.target.value))}
                                                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                                            />
                                        </div>

                                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">サークル色</h3>
                                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                            {themes.map((color) => (
                                                <button
                                                    key={color.id}
                                                    onClick={() => setCircleColor(color.id)}
                                                    className={`relative h-16 rounded-lg border transition-all overflow-hidden ${circleColor === color.id ? "border-white scale-[1.05] ring-2 ring-white/20" : "border-white/10 hover:border-white/30"
                                                        }`}
                                                >
                                                    <div className={`absolute inset-0 ${color.gradient}`}></div>
                                                    {/* Req 96-4: Compact Telop Base (Name only, Number is text only) */}
                                                    <div className="absolute inset-0 flex flex-col justify-end p-1">
                                                        <div className="flex justify-between items-end">
                                                            <span className="backdrop-blur-[0px] rounded px-1 py-0.5 text-[10px] font-bold text-white font-sans leading-none drop-shadow-md">
                                                                {color.name.split("-")[0]}
                                                            </span>
                                                            <span className="bg-gray-900/40 backdrop-blur-[2px] rounded px-1 py-0.5 text-[8px] text-white/90 leading-none">
                                                                {color.name.split("-").slice(1).join("-")}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
