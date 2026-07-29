import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { config } from '@/lib/config';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const realmId = searchParams.get('realmId');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log('OAuth Callback Params Received');

    const { getToken } = await auth();
    const token = await getToken();

    if (error) {
        console.error('QuickBooks OAuth Error:', error);
        return NextResponse.redirect(
            new URL(`/dashboard?error=${encodeURIComponent(error)}`, request.url)
        );
    }

    if (!code || !realmId || !state) {
        console.error('Missing required OAuth parameters');
        return NextResponse.redirect(new URL('/dashboard?error=missing_params', request.url));
    }

    try {
        const response = await fetch(`${config.api.baseUrl}/connections/quickbooks/callback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ code, realmId, state }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Backend Callback Error:', errorData);
            throw new Error(errorData.message || errorData.error || 'Failed to exchange code for tokens');
        }

        const result = await response.json();
        console.log('OAuth Connection Success');

        const redirectUrl = new URL(result.data?.redirectUrl || result.redirectUrl || '/dashboard', request.url);
        return NextResponse.redirect(redirectUrl);
    } catch (error) {
        console.error('OAuth callback exception:', error);
        return NextResponse.redirect(
            new URL(`/dashboard?error=authentication_failed&message=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`, request.url)
        );
    }
}