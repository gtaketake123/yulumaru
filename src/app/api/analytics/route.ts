import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NAMESPACE = "mindful-moments-app-v2";
const API_BASE = `https://api.counterapi.dev/v1/${NAMESPACE}`;

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

// Helper: Fetch count for a specific key
const getCount = async (key: string) => {
    try {
        const res = await fetch(`${API_BASE}/${key}`, { cache: 'no-store' });
        if (!res.ok) return 0;
        const data = await res.json();
        return data.count || 0;
    } catch {
        return 0;
    }
};

// Helper: Increment count for a specific key
const upCount = async (key: string) => {
    try {
        await fetch(`${API_BASE}/${key}/up`, { cache: 'no-store' });
    } catch {
        // Silently fail if increment fails
    }
};

export async function GET() {
    try {
        const { dailyKey, monthlyKey } = getJSTDateParts();

        // Fetch all 6 keys concurrently for performance
        const [
            dailyViews, dailyUsers,
            monthlyViews, monthlyUsers,
            totalViews, totalUsers
        ] = await Promise.all([
            getCount(`${dailyKey}_views`),
            getCount(`${dailyKey}_users`),
            getCount(`${monthlyKey}_views`),
            getCount(`${monthlyKey}_users`),
            getCount('total_views'),
            getCount('total_users')
        ]);

        return NextResponse.json({
            dailyViews, dailyUsers,
            monthlyViews, monthlyUsers,
            totalViews, totalUsers,
        });
    } catch (error) {
        console.error("Analytics fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
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

        const promises: Promise<void>[] = [];

        if (isNewSession) {
            promises.push(upCount('total_views'));
            promises.push(upCount(`${monthlyKey}_views`));
            promises.push(upCount(`${dailyKey}_views`));
        }

        if (isNewTotalUser) {
            promises.push(upCount('total_users'));
        }

        if (isNewMonthlyUser) {
            promises.push(upCount(`${monthlyKey}_users`));
        }

        if (isNewDailyUser) {
            promises.push(upCount(`${dailyKey}_users`));
        }

        await Promise.all(promises);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Analytics increment error:", error);
        return NextResponse.json({ error: "Failed to update analytics" }, { status: 500 });
    }
}
