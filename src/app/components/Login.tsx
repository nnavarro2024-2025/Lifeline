import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Heart, Eye, EyeOff, Mail, Lock, Sparkles, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEMO_GOOGLE_ACCOUNTS = [
  { email: 'student@uic.edu', label: 'Juan Dela Cruz', role: 'Student' },
  { email: 'counselor@uic.edu', label: 'Dr. Reyes', role: 'Counselor' },
  { email: 'guidance@uic.edu', label: 'Ms. Santos', role: 'Counselor' },
];

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleError, setGoogleError] = useState('');
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    const result = login(email, password);
    if (!result.success) {
      setError(result.error || 'Sign in failed. Please try again.');
      return;
    }

    // Route based on role
    redirectAfterLogin();
  };

  const redirectAfterLogin = () => {
    // The auth state is set, so we read from the updated context via a fresh check
    // Using a small workaround since state updates are async
    const storedEmail = email.toLowerCase().trim();
    const counselorEmails = ['counselor@uic.edu', 'dr.reyes@uic.edu', 'guidance@uic.edu', 'advisor@uic.edu', 'admin@uic.edu'];
    if (counselorEmails.includes(storedEmail)) {
      navigate('/counselor');
    } else {
      navigate('/student');
    }
  };

  const handleGoogleSignIn = (selectedEmail: string) => {
    setGoogleError('');
    const result = loginWithGoogle(selectedEmail);
    if (!result.success) {
      setGoogleError(result.error || 'Sign in failed.');
      return;
    }
    setShowGoogleModal(false);
    const counselorEmails = ['counselor@uic.edu', 'dr.reyes@uic.edu', 'guidance@uic.edu', 'advisor@uic.edu', 'admin@uic.edu'];
    if (counselorEmails.includes(selectedEmail.toLowerCase())) {
      navigate('/counselor');
    } else {
      navigate('/student');
    }
  };

  const handleGoogleCustomEmail = (e: React.FormEvent) => {
    e.preventDefault();
    handleGoogleSignIn(googleEmail);
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
                  placeholder="your.name@uic.edu"
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
          <button
            type="button"
            onClick={() => { setShowGoogleModal(true); setGoogleEmail(''); setGoogleError(''); }}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3.5 px-6 rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with UIC Gmail Account
          </button>

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
            <p>Student: <span className="font-mono font-medium text-gray-800">student@uic.edu</span> / student123</p>
            <p>Counselor: <span className="font-mono font-medium text-gray-800">counselor@uic.edu</span> / counselor123</p>
            <p className="text-gray-400 italic">Or sign up with any @uic.edu email</p>
          </div>
        </div>
      </div>

      {/* Google Login Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <svg className="w-7 h-7" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <div>
                <p className="font-semibold text-gray-800">Sign in with Google</p>
                <p className="text-xs text-gray-500">UIC Account</p>
              </div>
            </div>

            {googleError && (
              <div className="mb-3 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{googleError}</span>
              </div>
            )}

            <p className="text-sm text-gray-600 mb-3">Choose an account or enter your UIC email:</p>

            {/* Demo accounts */}
            <div className="space-y-2 mb-4">
              {DEMO_GOOGLE_ACCOUNTS.map(account => (
                <button
                  key={account.email}
                  onClick={() => handleGoogleSignIn(account.email)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-all text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {account.label[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{account.label}</p>
                    <p className="text-xs text-gray-500">{account.email}</p>
                  </div>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                    account.role === 'Counselor'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-pink-100 text-pink-700'
                  }`}>
                    {account.role}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs text-gray-400">or use another</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            <form onSubmit={handleGoogleCustomEmail} className="flex gap-2">
              <input
                type="email"
                value={googleEmail}
                onChange={e => { setGoogleEmail(e.target.value); setGoogleError(''); }}
                placeholder="name@uic.edu"
                className="flex-1 px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-pink-400 focus:bg-white transition-all"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all"
              >
                Go
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
