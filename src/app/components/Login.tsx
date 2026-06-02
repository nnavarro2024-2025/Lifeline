import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Heart, Eye, EyeOff, Mail, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GOOGLE_IDENTITY_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const GOOGLE_CLIENT_ID =
  (import.meta as unknown as { env?: { VITE_GOOGLE_CLIENT_ID?: string } }).env?.VITE_GOOGLE_CLIENT_ID || '';

let googleScriptPromise: Promise<void> | null = null;

function loadGoogleIdentityScript() {
  if ((window as any).google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GOOGLE_IDENTITY_SCRIPT_SRC}"]`) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Sign-In SDK.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_IDENTITY_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Sign-In SDK.'));
    document.head.appendChild(script);
  }).catch(error => {
    googleScriptPromise = null;
    throw error;
  });

  return googleScriptPromise;
}

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const processGoogleCredential = async (idToken: string) => {
    setIsGoogleLoading(true);

    try {
      const result = await loginWithGoogle(idToken);
      if (!result.success) {
        setError(result.error || 'Google sign in failed.');
        return;
      }

      if (result.user?.role === 'counselor') {
        navigate('/counselor');
      } else {
        navigate('/student');
      }
    } catch (googleError) {
      setError(googleError instanceof Error ? googleError.message : 'Google sign in failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleButtonRef.current) return;

    let cancelled = false;

    const renderGoogleButton = async () => {
      await loadGoogleIdentityScript();
      if (cancelled || !googleButtonRef.current) return;

      const google = (window as any).google;
      if (!google?.accounts?.id) {
        throw new Error('Google Sign-In SDK did not initialize correctly.');
      }

      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: { credential?: string }) => {
          if (!response?.credential) {
            setError('Google sign-in did not return a credential.');
            return;
          }

          void processGoogleCredential(response.credential);
        },
      });

      googleButtonRef.current.innerHTML = '';
      google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'signin_with',
        width: googleButtonRef.current.clientWidth || 360,
      });
    };

    renderGoogleButton().catch(error => {
      if (!cancelled) {
        setError(error instanceof Error ? error.message : 'Google sign-in is unavailable right now.');
      }
    });

    return () => {
      cancelled = true;
      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = '';
      }
    };
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!email.toLowerCase().trim().endsWith('@uic.edu.ph')) {
      setError('Please use your UIC email address (@uic.edu.ph).');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Sign in failed. Please try again.');
      return;
    }

    if (result.user?.role === 'counselor') {
      navigate('/counselor');
    } else {
      navigate('/student');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Soft background pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(251,113,133,0.15) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(217,70,239,0.1) 0%, transparent 50%)`
        }}
      />

      {/* Floating soft orbs */}
      <div className="absolute top-20 left-16 w-32 h-32 bg-pink-200/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-24 right-20 w-40 h-40 bg-fuchsia-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-8 w-24 h-24 bg-rose-200/25 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full blur-lg opacity-40 animate-pulse" />
              <Heart className="w-12 h-12 text-pink-600 relative fill-pink-500" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              LifeLine
            </h1>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm px-5 py-2 rounded-full shadow-md border border-pink-200">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium text-pink-700">AI-Powered Crisis Support Platform</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100 p-8">
          {/* Warm tagline */}
          <div className="text-center mb-8">
            <p className="text-2xl font-semibold text-gray-800 mb-1">You are not alone.</p>
            <p className="text-gray-500 text-sm leading-relaxed">
              We are here for you. Let us hear you out.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="your.name@uic.edu.ph"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus:bg-white transition-all text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <button type="button" className="text-xs text-pink-600 hover:text-pink-700 font-medium">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus:bg-white transition-all text-gray-900 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-2"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* Google / UIC Gmail button */}
          <div ref={googleButtonRef} className="w-full min-h-[48px] flex items-center justify-center" />

          {isGoogleLoading && (
            <p className="mt-3 text-center text-xs text-gray-500">Signing in with Google...</p>
          )}

          {/* Sign up link */}
          <p className="text-center text-sm text-gray-500 mt-5">
            New to LifeLine?{' '}
            <Link to="/register" className="text-pink-600 hover:text-pink-700 font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        {/* Demo credentials helper */}
        <div className="mt-4 p-4 bg-white/60 backdrop-blur-sm border border-pink-100 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Demo Accounts</p>
          <div className="space-y-1 text-xs text-gray-600">
            <p>Student: <span className="font-mono font-medium text-gray-800">student@uic.edu.ph</span> / student123</p>
            <p>Counselor: <span className="font-mono font-medium text-gray-800">counselor@uic.edu.ph</span> / counselor123</p>
            <p className="text-gray-400 italic">Or sign up with any @uic.edu.ph email</p>
          </div>
        </div>
      </div>

    </div>
  );
}
