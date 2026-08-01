import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    // 1. Get the user session from Clerk's server-side helper
    const { userId } = await auth();

    // 2. Get the base URL of your application from the incoming request
    const baseUrl = new URL(request.url).origin;

    // 3. If the user is NOT logged in, redirect them to your Clerk sign-in page.
    if (!userId) {
        const signInUrl = new URL('/sign-in', baseUrl);

        // This tells Clerk: "After they log in, send them to the dashboard"
        signInUrl.searchParams.set('redirect_url', `${baseUrl}/dashboard`);

        return NextResponse.redirect(signInUrl);
    }

    // 4. If the user IS logged in, send them straight to your dashboard.
    const dashboardUrl = new URL('/dashboard', baseUrl);
    return NextResponse.redirect(dashboardUrl);
}