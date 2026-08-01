// app/launch/route.ts (Next.js App Router)
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { userId } = await auth();
    const baseUrl = new URL(request.url).origin;

    if (!userId) {
        const signInUrl = new URL('/sign-in', baseUrl);
        signInUrl.searchParams.set('redirect_url', `${baseUrl}/dashboard`);
        return NextResponse.redirect(signInUrl);
    }

    return NextResponse.redirect(new URL('/dashboard', baseUrl));
}