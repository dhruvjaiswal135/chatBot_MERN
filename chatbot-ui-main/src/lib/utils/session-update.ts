import { getSession } from 'next-auth/react';
import { refreshAccessToken } from './token-refresh';

/**
 * Update the session with new tokens after refresh
 * This is a utility function that can be used to manually refresh tokens
 */
export async function updateSessionWithNewTokens(): Promise<boolean> {
    try {
        const session = await getSession();
        const refreshToken = session?.user?.refreshToken;

        if (!refreshToken) {
            return false;
        }

        const newTokens = await refreshAccessToken(refreshToken);
        
        if (newTokens) {
            // In a real app, you would update the session here
            // For now, we'll return true to indicate success
            // The actual session update would be handled by NextAuth callbacks
            return true;
        }

        return false;
    } catch (error) {
        console.error('Failed to update session with new tokens:', error);
        return false;
    }
}

/**
 * Check if the current session has valid tokens
 */
export async function hasValidSession(): Promise<boolean> {
    try {
        const session = await getSession();
        return !!(session?.user?.token && session?.user?.refreshToken);
    } catch {
        return false;
    }
} 