export interface UserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    createdAt: number; // Timestamp
    lastLoginAt: number; // Timestamp

    // Feature: Word Filtering & Favorites
    blockedWords: string[];
    favoriteWords: string[];

    // Feature: Subscription (Phase 3)
    subscriptionStatus: 'free' | 'premium';
    subscriptionExpiry?: number | null;
}
