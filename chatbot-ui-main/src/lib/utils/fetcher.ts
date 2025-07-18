import { getSession, signOut } from 'next-auth/react';
import { refreshAccessToken } from './token-refresh';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Extended session interface to handle potential error properties
interface ExtendedSession {
    token?: string;
    refreshToken?: string;
    error?: string;
    [key: string]: string | undefined;
}

/**
 * Enhanced fetch wrapper with authentication and automatic token refresh
 * @param endpoint - API endpoint path
 * @param options - Fetch options
 * @param auth - Whether to include authentication headers
 * @returns Promise<T> - Parsed response data
 */
async function fetcher<T>(
    endpoint: string,
    options: RequestInit = {},
    auth: boolean = true,
    inside: boolean = true
): Promise<T> {
    if (!BASE_URL) throw new Error('NEXT_PUBLIC_API_URL is not defined. Please set it in your environment variables.');

    const headers: HeadersInit & { Authorization?: string } = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add authentication if required
    if (auth) {
        const session = await getSession() as ExtendedSession | null;
        
        if (session?.error === 'RefreshTokenError' || session?.error === 'MissingRefreshToken') {
            signOut({ callbackUrl: '/auth/login' });
            throw new Error('Authentication session expired');
        }

        const token = session?.token;
        const refreshToken = session?.refreshToken;

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            console.log(`${BASE_URL}${endpoint}`, 'is url');
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                ...options,
                headers,
            });

            // If we get a 401 (Unauthorized), try to refresh the token
            if (response.status === 401 && refreshToken) {
                const newTokens = await refreshAccessToken(refreshToken);
                
                if (newTokens) {
                    // Retry the request with the new token
                    headers['Authorization'] = `Bearer ${newTokens.token}`;
                    
                    const retryResponse = await fetch(`${BASE_URL}${endpoint}`, {
                        ...options,
                        headers,
                    });

                    if (!retryResponse.ok) {
                        throw new Error(`HTTP ${retryResponse.status}: Failed to fetch ${endpoint}`);
                    }

                    const data = await retryResponse.json();
                    return inside ? data.data as T : data as T;
                } else {
                    // Refresh failed, sign out the user
                    signOut({ callbackUrl: '/auth/login' });
                    throw new Error('Token refresh failed');
                }
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch ${endpoint}`);
            }

            const data = await response.json();
            return inside ? data.data as T : data as T;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(`Network error: ${error}`);
        }
    } else {
        // No authentication required
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                ...options,
                headers,
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch ${endpoint}`);
            }

            const data = await response.json();
            return inside ? data.data as T : data as T;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(`Network error: ${error}`);
        }
    }
}

export default fetcher;