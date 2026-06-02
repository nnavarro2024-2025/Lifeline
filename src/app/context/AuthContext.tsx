import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../utils/api';

export interface AuthUser {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'counselor';
  isAuthenticated: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  loginWithGoogle: (idToken: string) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'lifeline_user';
const LAST_ACTIVITY_STORAGE_KEY = 'lifeline_last_activity';
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
const HELPLINE_DISMISS_KEY_PREFIX = 'lifeline-mobile-helpline-dismissed-v1';

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthUser;
    return parsed?.isAuthenticated ? parsed : null;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function getLastActivity(): number {
  const raw = localStorage.getItem(LAST_ACTIVITY_STORAGE_KEY);
  if (!raw) return Date.now();

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function setLastActivity(timestamp: number) {
  localStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, String(timestamp));
}

function clearHelplineDismissal(email?: string | null) {
  if (!email) return;
  localStorage.removeItem(`${HELPLINE_DISMISS_KEY_PREFIX}:${email.toLowerCase()}`);
}

function createFallbackAuthContext(): AuthContextType {
  const persistUser = (authUser: AuthUser) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    setLastActivity(Date.now());
  };

  const submitLogin = async (request: Promise<{ user: AuthUser }>) => {
    try {
      const response = await request;
      persistUser(response.user);
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Sign in failed.' };
    }
  };

  return {
    user: readStoredUser(),
    login: (email: string, password: string) => submitLogin(api.authLogin(email, password)),
    loginWithGoogle: (idToken: string) => submitLogin(api.authGoogleLogin(idToken)),
    register: async (firstName: string, lastName: string, email: string, password: string) => {
      try {
        const response = await api.authRegister(firstName, lastName, email, password);
        persistUser(response.user);
        return { success: true, user: response.user };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Registration failed.' };
      }
    },
    logout: () => {
      clearHelplineDismissal(readStoredUser()?.email);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(LAST_ACTIVITY_STORAGE_KEY);
    },
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  useEffect(() => {
    if (!user) {
      return;
    }

    const syncActivity = () => {
      setLastActivity(Date.now());
    };

    const checkInactivity = () => {
      const lastActivity = getLastActivity();
      if (Date.now() - lastActivity >= INACTIVITY_TIMEOUT_MS) {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(LAST_ACTIVITY_STORAGE_KEY);
      }
    };

    syncActivity();
    checkInactivity();

    const events = ['pointerdown', 'keydown', 'touchstart', 'scroll', 'focus'] as const;
    events.forEach(eventName => window.addEventListener(eventName, syncActivity, { passive: true }));
    window.addEventListener('visibilitychange', syncActivity);

    const timer = window.setInterval(checkInactivity, 60 * 1000);

    return () => {
      events.forEach(eventName => window.removeEventListener(eventName, syncActivity));
      window.removeEventListener('visibilitychange', syncActivity);
      window.clearInterval(timer);
    };
  }, [user]);

  const login = async (email: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
    try {
      const response = await api.authLogin(email, password);
      const authUser: AuthUser = response.user;
      setUser(authUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      setLastActivity(Date.now());
      return { success: true, user: authUser };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Sign in failed.' };
    }
  };

  const loginWithGoogle = async (idToken: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
    try {
      const response = await api.authGoogleLogin(idToken);
      const authUser: AuthUser = response.user;
      setUser(authUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      setLastActivity(Date.now());
      return { success: true, user: authUser };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Sign in failed.' };
    }
  };

  const register = async (firstName: string, lastName: string, email: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
    try {
      const response = await api.authRegister(firstName, lastName, email, password);
      const authUser: AuthUser = response.user;
      setUser(authUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      setLastActivity(Date.now());
      return { success: true, user: authUser };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Registration failed.' };
    }
  };

  const logout = () => {
    clearHelplineDismissal(user?.email);
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(LAST_ACTIVITY_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context ?? createFallbackAuthContext();
}
