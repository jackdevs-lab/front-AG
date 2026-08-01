import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { userId } = await auth();
    const baseUrl = new URL(request.url).origin;

    // If the user is not logged in via Clerk, send them to sign-in
    if (!userId) {
        const signInUrl = new URL('/sign-in', baseUrl);
        signInUrl.searchParams.set('redirect_url', `${baseUrl}/dashboard`);
        return NextResponse.redirect(signInUrl);
    }

    // If logged in, send them straight to the dashboard
    return NextResponse.redirect(new URL('/dashboard', baseUrl));
}