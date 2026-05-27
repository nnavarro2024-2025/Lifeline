import { Link } from 'react-router';
import { Heart, Shield, Sparkles, Brain, Zap, Lock, MessageCircle, TrendingUp, Users, ArrowRight, CheckCircle } from 'lucide-react';

export function GetStarted() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTEsMTEzLDEzMywwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
                <Heart className="w-10 h-10 text-pink-600 relative fill-pink-500" />
              </div>
              <span className="text-3xl font-extrabold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                LifeLine
              </span>
            </div>
            <Link
              to="/login"
              className="px-6 py-3 bg-white/80 backdrop-blur-sm hover:bg-white text-pink-700 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-pink-200"
            >
              Sign In
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-rose-100 px-6 py-3 rounded-full mb-8 shadow-lg border-2 border-pink-300">
              <Sparkles className="w-5 h-5 text-pink-600" />
              <span className="font-bold text-pink-700">AI-Powered Crisis Support Platform</span>
            </div>

            <h1 className="text-7xl font-extrabold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-fuchsia-600 bg-clip-text text-transparent">
                Real-Time Support
              </span>
              <br />
              <span className="text-gray-900">When It Matters Most</span>
            </h1>

            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-12 leading-relaxed">
              LifeLine uses advanced AI to analyze crisis messages in real-time, automatically prioritizing high-risk cases to ensure students receive immediate professional support when they need it most.
            </p>

            <div className="flex items-center justify-center gap-6">
              <Link
                to="/login"
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-pink-300 transition-all duration-300 transform hover:-translate-y-1"
              >
                Get Started
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/home"
                className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm hover:bg-white text-pink-700 px-10 py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all border-2 border-pink-300"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-xl border-2 border-pink-200 text-center">
              <div className="bg-gradient-to-br from-pink-400 to-rose-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-2">Instant</p>
              <p className="text-gray-600">AI-Powered Triage</p>
            </div>

            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-xl border-2 border-purple-200 text-center">
              <div className="bg-gradient-to-br from-purple-400 to-fuchsia-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-2">4 Languages</p>
              <p className="text-gray-600">Multilingual Support</p>
            </div>

            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-xl border-2 border-rose-200 text-center">
              <div className="bg-gradient-to-br from-rose-400 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-2">100%</p>
              <p className="text-gray-600">Privacy Protected</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-extrabold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to provide effective crisis support
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border-2 border-pink-200 hover:border-pink-400 transition-all hover:-translate-y-2">
              <div className="bg-gradient-to-br from-pink-400 to-rose-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Anonymous Support</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Students can reach out anonymously with complete privacy protection. Temporary aliases are automatically assigned, ensuring comfort and security while seeking help.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-pink-600" />
                  <span className="text-gray-700">Complete anonymity option</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-pink-600" />
                  <span className="text-gray-700">Secure temporary aliases</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-pink-600" />
                  <span className="text-gray-700">Optional identity visibility</span>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border-2 border-purple-200 hover:border-purple-400 transition-all hover:-translate-y-2">
              <div className="bg-gradient-to-br from-purple-400 to-fuchsia-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Text Analysis</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Advanced AI analyzes messages for crisis keywords in multiple languages (English, Tagalog, Bisaya, Taglish), detecting distress patterns and severity levels instantly.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">Multi-language detection</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">Crisis keyword matching</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">Message velocity tracking</span>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border-2 border-rose-200 hover:border-rose-400 transition-all hover:-translate-y-2">
              <div className="bg-gradient-to-br from-rose-400 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Priority Queue System</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                High-risk messages automatically jump to the top of the counselor's queue with bright alerts. Moderate and low-risk cases are organized by arrival time below.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-rose-600" />
                  <span className="text-gray-700">Automatic risk prioritization</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-rose-600" />
                  <span className="text-gray-700">Color-coded severity alerts</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-rose-600" />
                  <span className="text-gray-700">Real-time queue updates</span>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border-2 border-fuchsia-200 hover:border-fuchsia-400 transition-all hover:-translate-y-2">
              <div className="bg-gradient-to-br from-fuchsia-400 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Counselor Dashboard</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Professional dashboard with real-time monitoring, session management, and instant response capabilities. Track all active cases with comprehensive severity metrics.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-fuchsia-600" />
                  <span className="text-gray-700">Real-time session monitoring</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-fuchsia-600" />
                  <span className="text-gray-700">Live severity statistics</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-fuchsia-600" />
                  <span className="text-gray-700">Two-way communication</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-extrabold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to ensure rapid crisis response
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full blur-xl opacity-30"></div>
                <div className="relative bg-gradient-to-br from-pink-400 to-rose-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <span className="text-4xl font-bold text-white">1</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Student Reaches Out</h3>
              <p className="text-gray-600 leading-relaxed">
                Students initiate a chat session, choosing to remain anonymous or share their identity based on their comfort level.
              </p>
            </div>

            <div className="text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-fuchsia-500 rounded-full blur-xl opacity-30"></div>
                <div className="relative bg-gradient-to-br from-purple-400 to-fuchsia-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <span className="text-4xl font-bold text-white">2</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Messages are instantly analyzed for crisis keywords and patterns, automatically assigning severity levels.
              </p>
            </div>

            <div className="text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full blur-xl opacity-30"></div>
                <div className="relative bg-gradient-to-br from-rose-400 to-pink-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <span className="text-4xl font-bold text-white">3</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Priority Response</h3>
              <p className="text-gray-600 leading-relaxed">
                High-risk cases immediately move to the top of the queue, ensuring counselors can respond to urgent situations first.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 rounded-3xl p-16 shadow-2xl text-center">
            <h2 className="text-5xl font-extrabold text-white mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-pink-100 mb-10 max-w-2xl mx-auto">
              Join LifeLine today and help provide immediate support to students in crisis. Every second counts.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-3 bg-white text-pink-700 px-12 py-6 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-pink-300 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
            >
              Get Started Now
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-pink-600 fill-pink-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              LifeLine
            </span>
          </div>
          <p className="text-gray-600 mb-2">
            AI-Enhanced Crisis Support Platform
          </p>
          <p className="text-sm text-gray-500">
            © 2026 LifeLine. Saving lives through technology.
          </p>
        </footer>
      </div>
    </div>
  );
}
