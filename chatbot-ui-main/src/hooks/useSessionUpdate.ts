import { useSession } from 'next-auth/react';
import { useCallback } from 'react';

interface TokenUpdate {
  token: string;
  refreshToken: string;
}

export function useSessionUpdate() {
  const { data: session, update } = useSession();

  const updateTokens = useCallback(async (tokens: TokenUpdate) => {
    try {
      await update({
        ...session,
        user: {
          ...session?.user,
          token: tokens.token,
          refreshToken: tokens.refreshToken,
        },
      });
    } catch (error) {
      console.error('Failed to update session tokens:', error);
    }
  }, [session, update]);

  return { updateTokens };
} 