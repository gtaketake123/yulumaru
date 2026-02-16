
import { NextResponse } from 'next/server';

// External Counter API Configuration
// Using 'counterapi.dev' which is free and no-auth.
// Namespace: mindful-moments-app (Unique identifier)
// Key: visits
const COUNTER_API_URL = "https://api.counterapi.dev/v1/mindful-moments-app/visits";

export async function GET() {
    try {
        const res = await fetch(COUNTER_API_URL, { cache: 'no-store' });
        if (!res.ok) {
            // If 404 (first time), it might not exist. Return 0.
            return NextResponse.json({ views: 0 });
        }
        const data = await res.json();
        // API returns { count: number }, we map to { views: number }
        return NextResponse.json({ views: data.count });
    } catch (error) {
        console.error("Analytics fetch error:", error);
        return NextResponse.json({ views: 0 });
    }
}

export async function POST() {
    try {
        // Calling /up endpoint increments the counter
        const res = await fetch(`${COUNTER_API_URL}/up`, { cache: 'no-store' });
        const data = await res.json();
        return NextResponse.json({ views: data.count });
    } catch (error) {
        console.error("Analytics increment error:", error);
        return NextResponse.json({ views: 0 });
    }
}
