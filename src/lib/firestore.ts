import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { User } from "firebase/auth";
import { UserData } from "@/types/user";

// Userがログインした時にデータを同期する関数
export const syncUserToFirestore = async (user: User) => {
    if (!db) return null; // Firestoreが初期化されていない場合（エラー回避）

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        // 既存ユーザー: 最終ログイン日時のみ更新
        await updateDoc(userRef, {
            lastLoginAt: Date.now(),
            // 情報が更新されていれば同期
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
        });
        return userSnap.data() as UserData;
    } else {
        // 新規ユーザー: データ作成
        const newUserData: UserData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: Date.now(),
            lastLoginAt: Date.now(),
            blockedWords: [],
            favoriteWords: [],
            subscriptionStatus: 'free',
        };
        await setDoc(userRef, newUserData);
        return newUserData;
    }
};

// ユーザーデータを取得
export const getUserData = async (uid: string) => {
    if (!db) return null;
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
        return snap.data() as UserData;
    }
    return null;
};
// ユーザーデータの一部を更新
export const updateUserFields = async (uid: string, data: Partial<UserData>) => {
    if (!db) return;
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, data);
};
