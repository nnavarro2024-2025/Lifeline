import { Link, useNavigate } from "react-router";
import { Heart, Shield, LogOut, LogIn, Sparkles, Brain, Zap, Lock, MessageCircle, TrendingUp, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTEsMTEzLDEzMywwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white/80 backdrop-blur-sm hover:bg-white text-pink-700 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-pink-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Get Started
          </Link>
        </div>

        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full blur-2xl opacity-40 animate-pulse"></div>
              <Heart className="w-16 h-16 text-pink-600 relative fill-pink-500 drop-shadow-lg" />
            </div>
            <h1 className="text-7xl font-extrabold bg-gradient-to-r from-pink-600 via-rose-600 to-fuchsia-600 bg-clip-text text-transparent drop-shadow-sm">
              LifeLine
            </h1>
          </div>

          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-xl px-8 py-4 rounded-full shadow-xl border-2 border-pink-200 mb-4">
            <Sparkles className="w-6 h-6 text-pink-500" />
            <p className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              AI-Enhanced Crisis Support Platform
            </p>
          </div>

          <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-6">
            Real-time triage and severity-based prioritization for immediate mental health support
          </p>

          {user?.isAuthenticated && (
            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-pink-100 to-rose-100 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg border-2 border-pink-300">
              <p className="text-gray-800 font-medium">
                Welcome back, <span className="font-bold text-pink-700">{user.name}</span>
                <span className="text-pink-600 ml-2">({user.role})</span>
              </p>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>

        {user?.isAuthenticated ? (
          <div className="max-w-2xl mx-auto mb-16">
            {user.role === 'student' ? (
              <Link
                to="/student"
                className="group bg-white/90 backdrop-blur-xl rounded-3xl p-12 shadow-2xl hover:shadow-pink-200 transition-all duration-300 border-2 border-pink-200 hover:border-pink-400 transform hover:-translate-y-2 block"
              >
                <div className="flex items-center gap-6 mb-8">
                  <div className="bg-gradient-to-br from-pink-400 to-rose-500 p-6 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900">
                    Student Portal
                  </h2>
                </div>
                <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                  Reach out for support anonymously or with your identity. Your messages are analyzed for urgency and prioritized to ensure you receive timely assistance when you need it most.
                </p>
                <div className="flex items-center gap-3 text-pink-600 font-bold text-lg group-hover:gap-4 transition-all">
                  <span>Access Your Support Portal</span>
                  <span className="text-2xl">→</span>
                </div>
              </Link>
            ) : (
              <Link
                to="/counselor"
                className="group bg-white/90 backdrop-blur-xl rounded-3xl p-12 shadow-2xl hover:shadow-fuchsia-200 transition-all duration-300 border-2 border-fuchsia-200 hover:border-fuchsia-400 transform hover:-translate-y-2 block"
              >
                <div className="flex items-center gap-6 mb-8">
                  <div className="bg-gradient-to-br from-fuchsia-500 to-purple-600 p-6 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900">
                    Counselor Dashboard
                  </h2>
                </div>
                <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                  Monitor active sessions with real-time severity alerts. High-risk messages automatically prioritize to the top of your queue for immediate attention and response.
                </p>
                <div className="flex items-center gap-3 text-fuchsia-600 font-bold text-lg group-hover:gap-4 transition-all">
                  <span>Access Your Dashboard</span>
                  <span className="text-2xl">→</span>
                </div>
              </Link>
            )}
          </div>
        ) : (
          <div className="text-center mb-16">
            <Link
              to="/login"
              className="group inline-flex items-center gap-5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-3xl p-10 shadow-2xl hover:shadow-pink-300 transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="bg-white/20 backdrop-blur-sm p-5 rounded-2xl group-hover:scale-110 transition-transform">
                <LogIn className="w-10 h-10 text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-3xl font-bold mb-2">
                  Sign In to Continue
                </h2>
                <p className="text-pink-100 text-lg">
                  Access the student portal or counselor dashboard
                </p>
              </div>
            </Link>
          </div>
        )}

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border-2 border-pink-100 mb-12">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              How LifeLine Works
            </h3>
            <p className="text-gray-600">Our intelligent three-step process ensures rapid response</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-pink-100 to-rose-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <MessageCircle className="w-10 h-10 text-pink-600" />
              </div>
              <h4 className="font-bold text-xl text-gray-900 mb-3">
                1. Student Reaches Out
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Students can chat anonymously or with their identity visible, ensuring comfort and safety
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-100 to-fuchsia-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Brain className="w-10 h-10 text-purple-600" />
              </div>
              <h4 className="font-bold text-xl text-gray-900 mb-3">
                2. AI Analysis
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Messages analyzed for crisis keywords in English, Tagalog, Bisaya, and Taglish
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-rose-100 to-pink-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Zap className="w-10 h-10 text-rose-600" />
              </div>
              <h4 className="font-bold text-xl text-gray-900 mb-3">
                3. Priority Response
              </h4>
              <p className="text-gray-600 leading-relaxed">
                High-risk cases jump to the top for immediate counselor attention and intervention
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl p-6 border-2 border-pink-200 shadow-lg">
            <Lock className="w-8 h-8 text-pink-600 mb-4" />
            <h4 className="font-bold text-lg text-gray-900 mb-2">Privacy Protected</h4>
            <p className="text-gray-700 text-sm">Complete anonymity option with secure temporary aliases</p>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-fuchsia-100 rounded-2xl p-6 border-2 border-purple-200 shadow-lg">
            <TrendingUp className="w-8 h-8 text-purple-600 mb-4" />
            <h4 className="font-bold text-lg text-gray-900 mb-2">Real-Time Triage</h4>
            <p className="text-gray-700 text-sm">Automatic severity detection and priority queue management</p>
          </div>
          <div className="bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl p-6 border-2 border-rose-200 shadow-lg">
            <Brain className="w-8 h-8 text-rose-600 mb-4" />
            <h4 className="font-bold text-lg text-gray-900 mb-2">Multi-Language AI</h4>
            <p className="text-gray-700 text-sm">Supports English, Tagalog, Bisaya, and Taglish detection</p>
          </div>
        </div>
      </div>
    </div>
  );
}
