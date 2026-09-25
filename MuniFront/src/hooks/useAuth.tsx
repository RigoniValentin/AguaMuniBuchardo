import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '@/services/auth.api';
import { ApiError, setAccessToken } from '@/services/api';
import { AuthContext, type AuthContextValue } from './auth-context';
import type { Permission, Role, User } from '@/types/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthContextValue['status']>('loading');

  const restoreSession = useCallback(async () => {
    setStatus('loading');
    try {
      try {
        const result = await authApi.refresh();
        setAccessToken(result.accessToken);
        setUser(result.user);
        setStatus('authenticated');
        return;
      } catch (refreshErr) {
        if (!(refreshErr instanceof ApiError && refreshErr.status === 401)) {
          throw refreshErr;
        }
      }

      setAccessToken(null);
      setUser(null);
      setStatus('unauthenticated');
    } catch {
      setAccessToken(null);
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    setAccessToken(result.accessToken);
    setUser(result.user);
    setStatus('authenticated');
  }, []);

  const register = useCallback(
    async (payload: import('./auth-context').RegisterPayload) => {
      const result = await authApi.register(payload);
      setAccessToken(result.accessToken);
      setUser(result.user);
      setStatus('authenticated');
      return { linked: result.linked };
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore logout errors
    }
    setAccessToken(null);
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const refresh = useCallback(async () => {
    try {
      const result = await authApi.refresh();
      setAccessToken(result.accessToken);
      setUser(result.user);
      setStatus('authenticated');
    } catch {
      setAccessToken(null);
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      login,
      register,
      logout,
      refresh,
      hasRole: (...roles: Role[]) => Boolean(user && roles.includes(user.role)),
      hasPermission: (...required: Permission[]) =>
        Boolean(user && required.every((p) => user.permissions.includes(p))),
    }),
    [user, status, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
