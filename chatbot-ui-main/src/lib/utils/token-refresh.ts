import { getSession } from 'next-auth/react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface RefreshTokenResponse {
    status: boolean;
    message: string;
    data?: {
        auth: string;
        refresh: string;
    };
    timestamp: string;
}

export interface TokenPair {
    token: string;
    refreshToken: string;
}

/**
 * Refresh the access token using the refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenPair | null> {
    if (!BASE_URL) {
        throw new Error('NEXT_PUBLIC_API_URL is not defined');
    }

    try {
        const response = await fetch(`${BASE_URL}/management/auth/refresh/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to refresh token`);
        }

        const data: RefreshTokenResponse = await response.json();
        
        if (data.status && data.data?.auth && data.data?.refresh) {
            return {
                token: data.data.auth,
                refreshToken: data.data.refresh,
            };
        }

        return null;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return null;
    }
}

/**
 * Get current session tokens
 */
export async function getCurrentTokens(): Promise<TokenPair | null> {
    try {
        const session = await getSession();
        if (session?.user?.token && session?.user?.refreshToken) {
            return {
                token: session.user.token,
                refreshToken: session.user.refreshToken,
            };
        }
        return null;
    } catch (error) {
        console.error('Failed to get current tokens:', error);
        return null;
    }
}

/**
 * Check if token is expired (basic check - you might want to implement JWT decoding)
 */
export function isTokenExpired(token: string): boolean {
    try {
        // Basic check - in a real app, you'd decode the JWT and check expiration
        // For now, we'll assume tokens are valid if they exist
        return !token || token.length < 10;
    } catch {
        return true;
    }
} 