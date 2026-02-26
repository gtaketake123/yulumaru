import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

// Helper to get JST date parts
const getJSTDateParts = () => {
    // Force UTC to JST (+9 hours)
    const jstDate = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
    const year = jstDate.getUTCFullYear();
    const month = String(jstDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(jstDate.getUTCDate()).padStart(2, '0');
    return {
        dailyKey: `daily_${year}_${month}_${day}`,
        monthlyKey: `monthly_${year}_${month}`
    };
};

export async function GET() {
    try {
        if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });

        const trafficRef = doc(db, 'analytics', 'traffic');
        const snap = await getDoc(trafficRef);

        const { dailyKey, monthlyKey } = getJSTDateParts();

        if (!snap.exists()) {
            return NextResponse.json({
                dailyViews: 0, dailyUsers: 0,
                monthlyViews: 0, monthlyUsers: 0,
                totalViews: 0, totalUsers: 0
            });
        }

        const data = snap.data();
        return NextResponse.json({
            dailyViews: data[`${dailyKey}_views`] || 0,
            dailyUsers: data[`${dailyKey}_users`] || 0,
            monthlyViews: data[`${monthlyKey}_views`] || 0,
            monthlyUsers: data[`${monthlyKey}_users`] || 0,
            totalViews: data.total_views || 0,
            totalUsers: data.total_users || 0,
        });
    } catch (error) {
        console.error("Analytics fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });

        // Use req.json() safely, fallback to default values if body is empty or malformed
        let payload = { isNewSession: true, isNewDailyUser: true, isNewMonthlyUser: true, isNewTotalUser: true };
        try {
            const body = await req.json();
            if (body && typeof body === 'object') {
                payload = { ...payload, ...body };
            }
        } catch (e) { /* Ignore empty body parsing error, just use defaults */ }

        const { isNewSession, isNewDailyUser, isNewMonthlyUser, isNewTotalUser } = payload;
        const { dailyKey, monthlyKey } = getJSTDateParts();

        const trafficRef = doc(db, 'analytics', 'traffic');

        // Build the update object dynamically
        const updates: Record<string, any> = {};
        let hasUpdates = false;

        if (isNewSession) {
            updates.total_views = increment(1);
            updates[`${monthlyKey}_views`] = increment(1);
            updates[`${dailyKey}_views`] = increment(1);
            hasUpdates = true;
        }

        if (isNewTotalUser) {
            updates.total_users = increment(1);
            hasUpdates = true;
        }

        if (isNewMonthlyUser) {
            updates[`${monthlyKey}_users`] = increment(1);
            hasUpdates = true;
        }

        if (isNewDailyUser) {
            updates[`${dailyKey}_users`] = increment(1);
            hasUpdates = true;
        }

        if (hasUpdates) {
            // Use setDoc with merge: true to avoid failing if the document doesn't exist yet
            await setDoc(trafficRef, updates, { merge: true });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Analytics increment error:", error);
        return NextResponse.json({ error: "Failed to update analytics" }, { status: 500 });
    }
}
