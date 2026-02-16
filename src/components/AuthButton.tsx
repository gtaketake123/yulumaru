"use client";

import { useAuth } from "@/context/AuthContext";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";

export default function AuthButton() {
    const { user, signInWithGoogle, logout } = useAuth();

    if (user) {
        return (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                    {user.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt={user.displayName || "User"}
                            className="w-10 h-10 rounded-full border border-white/20"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <UserIcon size={20} className="text-white/70" />
                        </div>
                    )}
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{user.displayName}</p>
                        <p className="text-xs text-white/50 truncate">{user.email}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-200 transition-colors text-xs font-bold"
                >
                    <LogOut size={14} />
                    ログアウト
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10 hover:border-white/30 shadow-sm"
        >
            <LogIn size={18} />
            <span className="font-bold">Googleでログイン</span>
        </button>
    );
}
