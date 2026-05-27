import { createContext, useContext, useState, ReactNode } from 'react';

const COUNSELOR_EMAILS = new Set([
  'counselor@uic.edu',
  'dr.reyes@uic.edu',
  'guidance@uic.edu',
  'advisor@uic.edu',
  'admin@uic.edu',
]);

interface RegisteredUser {
  password: string;
  name: string;
  role: 'student' | 'counselor';
}

// Mock user database (demo only — in production this would be server-side)
const userDatabase: Record<string, RegisteredUser> = {
  'counselor@uic.edu': { password: 'counselor123', name: 'Dr. Reyes', role: 'counselor' },
  'guidance@uic.edu': { password: 'guidance123', name: 'Ms. Santos', role: 'counselor' },
  'student@uic.edu': { password: 'student123', name: 'Juan Dela Cruz', role: 'student' },
  'maria.santos@uic.edu': { password: 'maria123', name: 'Maria Santos', role: 'student' },
};

export interface AuthUser {
  name: string;
  email: string;
  role: 'student' | 'counselor';
  isAuthenticated: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  loginWithGoogle: (email: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const determineRole = (email: string): 'student' | 'counselor' => {
    return COUNSELOR_EMAILS.has(email.toLowerCase()) ? 'counselor' : 'student';
  };

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const lowerEmail = email.toLowerCase().trim();
    const stored = userDatabase[lowerEmail];

    if (!stored) {
      return { success: false, error: 'No account found with this email. Please sign up first.' };
    }
    if (stored.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    setUser({
      name: stored.name,
      email: lowerEmail,
      role: stored.role,
      isAuthenticated: true,
    });
    return { success: true };
  };

  const loginWithGoogle = (email: string): { success: boolean; error?: string } => {
    const lowerEmail = email.toLowerCase().trim();

    if (!lowerEmail.endsWith('@uic.edu')) {
      return { success: false, error: 'Please use your UIC email address (@uic.edu).' };
    }

    const stored = userDatabase[lowerEmail];
    const role = determineRole(lowerEmail);

    if (!stored) {
      if (role === 'counselor') {
        return { success: false, error: 'Counselor accounts must be created by an administrator.' };
      }
      const nameParts = lowerEmail.split('@')[0].split('.');
      const name = nameParts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      userDatabase[lowerEmail] = { password: '', name, role };
      setUser({ name, email: lowerEmail, role, isAuthenticated: true });
    } else {
      setUser({ name: stored.name, email: lowerEmail, role: stored.role, isAuthenticated: true });
    }

    return { success: true };
  };

  const register = (name: string, email: string, password: string): { success: boolean; error?: string } => {
    const lowerEmail = email.toLowerCase().trim();

    if (!lowerEmail.endsWith('@uic.edu')) {
      return { success: false, error: 'Please use your UIC email address (@uic.edu).' };
    }
    if (userDatabase[lowerEmail]) {
      return { success: false, error: 'An account with this email already exists. Please sign in.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }
    if (!name.trim()) {
      return { success: false, error: 'Please enter your full name.' };
    }

    const role = determineRole(lowerEmail);
    if (role === 'counselor') {
      return { success: false, error: 'Counselor accounts must be created by an administrator. Please contact support.' };
    }

    userDatabase[lowerEmail] = { password, name: name.trim(), role };
    setUser({ name: name.trim(), email: lowerEmail, role, isAuthenticated: true });
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
