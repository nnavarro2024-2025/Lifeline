import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  Send, UserX, User, LogOut, Sparkles, MessageSquare,
  MoreVertical, Trash2, UserCheck, AlertTriangle, Plus, PhoneCall,
  CheckCircle, RefreshCw, Heart
} from 'lucide-react';
import { analyzeMessage } from '../utils/crisisDetection';
import { messageStore, ChatSession, getDisplayName } from '../utils/messageStore';
import { useAuth } from '../context/AuthContext';
import { useIsMobile } from './ui/use-mobile';

type ChatState = 'setup' | 'resolved' | 'chatting';

const crisisHotlines = [
  {
    title: 'Crisis Text Line',
    detail: '741741 to reach a live volunteer Crisis Counselor. Free, 24/7, confidential.',
  },
  {
    title: 'Davao City Health Office 24/7',
    detail: '0927 604 5797 • 0939 340 5675 • 0961 526 2861',
  },
  {
    title: 'National Center for Mental Health',
    detail: '0917 899 8727 (USAP) • 989-8727 (USAP)',
  },
  {
    title: 'In Touch Community Services Crisis Lines',
    detail: '0917 800 1123 • 0922 893 8944 • 893-7603',
  },
];

const MOBILE_HELPLINE_DISMISS_KEY_PREFIX = 'lifeline-mobile-helpline-dismissed-v1';

function getMobileHelplineDismissKey(email?: string) {
  return email ? `${MOBILE_HELPLINE_DISMISS_KEY_PREFIX}:${email.toLowerCase()}` : null;
}

export function StudentChat() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [chatState, setChatState] = useState<ChatState>('setup');
  const [session, setSession] = useState<ChatSession | null>(null);
  const [lastResolvedSession, setLastResolvedSession] = useState<ChatSession | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [anonymousMode, setAnonymousMode] = useState<'generated' | 'clue'>('generated');
  const [anonymousClue, setAnonymousClue] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [isScrolling, setIsScrolling] = useState(false);
  const [showHelplineModal, setShowHelplineModal] = useState(false);

  // Chat menu state
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openHelplineModal = () => {
    setShowHelplineModal(true);
  };

  const closeHelplineModal = () => {
    setShowHelplineModal(false);
    const dismissKey = getMobileHelplineDismissKey(user?.email);
    if (isMobile && dismissKey) {
      window.localStorage.setItem(dismissKey, 'true');
    }
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    window.requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }, [session?.messages.length]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setShowHelplineModal(false);
      return;
    }

    const dismissKey = getMobileHelplineDismissKey(user?.email);
    const hasDismissed = dismissKey ? window.localStorage.getItem(dismissKey) === 'true' : false;
    if (!hasDismissed) {
      setShowHelplineModal(true);
    }
  }, [isMobile, user?.email]);

  // Determine initial state based on student's sessions
  useEffect(() => {
    if (!user?.email) return;

    const syncState = () => {
      const activeSession = messageStore.getActiveSessionByEmail(user.email);
      if (activeSession) {
        setSession(activeSession);
        setChatState('chatting');
        return;
      }

      const allSessions = messageStore.getSessionsByEmail(user.email);
      if (allSessions.length > 0) {
        const lastSession = allSessions.sort(
          (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
        )[0];
        setLastResolvedSession(lastSession);
        setChatState('resolved');
      } else {
        setChatState('setup');
      }
    };

    syncState();
    const unsubscribe = messageStore.subscribe(syncState);
    return () => {
      unsubscribe();
    };
  }, [user?.email]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const startNewChat = async () => {
    if (!user?.email) return;
    const customNickname = anonymousMode === 'clue' ? anonymousClue.trim() : undefined;
    try {
      const newSession = await messageStore.createSession(
        user.email,
        user.name,
        isAnonymous,
        customNickname
      );
      setSession(newSession);
      setChatState('chatting');
    } catch {
      // Keep user on setup if API request fails.
    }
  };

  const continueResolvedSession = async () => {
    if (!lastResolvedSession) return;
    const reactivated = await messageStore.reactivateSession(lastResolvedSession.id);
    if (reactivated) {
      setSession(reactivated);
      setChatState('chatting');
    }
  };

  const startSetupForNew = () => {
    setSession(null);
    setChatState('setup');
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !session) return;

    const analysis = analyzeMessage(currentMessage, session.messages.length);
    const updated = await messageStore.addMessage(session.id, currentMessage, 'student', analysis.riskLevel);
    if (updated) {
      setSession(updated);
      setCurrentMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleToggleRealName = async () => {
    if (!session) return;
    const updated = await messageStore.toggleRealName(session.id);
    if (updated) setSession(updated);
    setShowMenu(false);
  };

  const handleDeleteConversation = () => {
    setShowDeleteConfirm(true);
    setShowMenu(false);
  };

  const confirmDelete = async () => {
    if (!session) return;
    await messageStore.deleteSession(session.id);
    setSession(null);
    setLastResolvedSession(null);
    setChatState('setup');
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleMessagesScroll = () => {
    setIsScrolling(true);

    if (scrollTimeoutRef.current !== null) {
      window.clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      setIsScrolling(false);
    }, 900);
  };

  // ── Setup Screen ──────────────────────────────────────────────────────────
  if (chatState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-16 left-12 w-32 h-32 bg-pink-200/25 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-16 right-12 w-40 h-40 bg-fuchsia-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="max-w-md w-full relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-pink-600 fill-pink-500" />
              <span className="font-bold text-pink-700 text-lg">LifeLine</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 text-gray-600 hover:text-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Hello, {user?.name?.split(' ')[0]} 👋
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                This is a safe space. You can reach out anonymously or with your name.
              </p>
            </div>

            {/* Anonymity Toggle */}
            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-200 rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-purple-400 to-fuchsia-500 p-2.5 rounded-xl shadow">
                    {isAnonymous ? (
                      <UserX className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {isAnonymous ? 'Chat Anonymously' : 'Chat as Yourself'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {isAnonymous
                        ? ' '
                        : `Your name "${user?.name}" will be visible`}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={e => setIsAnonymous(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-fuchsia-500" />
                </label>
              </div>
              {isAnonymous && (
                <div className="mt-3 space-y-3">
                  <p className="text-xs text-purple-700 bg-purple-100/60 px-3 py-2 rounded-lg">
                    Choose Auto Generate name or input a custom name.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setAnonymousMode('generated')}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${anonymousMode === 'generated' ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'}`}
                    >
                      Auto Generate name
                    </button>
                    <button
                      onClick={() => setAnonymousMode('clue')}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${anonymousMode === 'clue' ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'}`}
                    >
                      Custom
                    </button>
                  </div>

                  {anonymousMode === 'clue' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Custom name</label>
                      <input
                        value={anonymousClue}
                        onChange={e => setAnonymousClue(e.target.value)}
                        placeholder="e.g. blue hoodie, room 12, classmate"
                        className="w-full px-3 py-2.5 bg-white border border-purple-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={startNewChat}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
            >
              <Plus className="w-5 h-5" />
              Begin Conversation
            </button>

            {/* <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  If you are in immediate danger, please call emergency services (911) or a crisis hotline directly.
                </p>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    );
  }

  // ── Resolved Screen ───────────────────────────────────────────────────────
  if (chatState === 'resolved' && lastResolvedSession) {
    const displayName = getDisplayName(lastResolvedSession);
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-16 left-12 w-32 h-32 bg-pink-200/25 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-16 right-12 w-40 h-40 bg-fuchsia-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="max-w-md w-full relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-pink-600 fill-pink-500" />
              <span className="font-bold text-pink-700 text-lg">LifeLine</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 text-gray-600 hover:text-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome back, {user?.name?.split(' ')[0]}</h2>
              <p className="text-gray-500 text-sm">
                Your previous conversation as <strong className="text-gray-700">"{displayName}"</strong> was resolved.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm font-medium text-gray-700 text-center">What would you like to do?</p>

              <button
                onClick={continueResolvedSession}
                className="w-full flex items-center gap-4 bg-gradient-to-br from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 border-2 border-pink-200 hover:border-pink-400 rounded-2xl p-5 transition-all shadow-sm hover:shadow-md text-left"
              >
                <div className="bg-gradient-to-br from-pink-400 to-rose-500 p-3 rounded-xl shadow-md flex-shrink-0">
                  <RefreshCw className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Continue Previous Conversation</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Continue as <span className="font-medium">"{displayName}"</span> — returns to counselor queue
                  </p>
                </div>
              </button>

              <button
                onClick={startSetupForNew}
                className="w-full flex items-center gap-4 bg-gradient-to-br from-purple-50 to-fuchsia-50 hover:from-purple-100 hover:to-fuchsia-100 border-2 border-purple-200 hover:border-purple-400 rounded-2xl p-5 transition-all shadow-sm hover:shadow-md text-left"
              >
                <div className="bg-gradient-to-br from-purple-400 to-fuchsia-500 p-3 rounded-xl shadow-md flex-shrink-0">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Start a New Conversation</p>
                  <p className="text-xs text-gray-500 mt-0.5">Choose new anonymity settings and get a fresh start</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Chat Screen ───────────────────────────────────────────────────────────
  if (chatState !== 'chatting' || !session) return null;

  const displayName = getDisplayName(session);

  return (
    <div className="min-h-screen h-[100dvh] bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto h-[100dvh] flex flex-col lg:flex-row px-4 py-4 relative z-10 isolate gap-2 overflow-hidden">

        {/* Support sidebar */}
        <div className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-pink-200 px-4 py-4 relative z-30">
            <div className="flex items-center gap-2 text-pink-700 font-semibold text-sm mb-3">
              <PhoneCall className="w-4 h-4" />
              Helpline
            </div>

            <div className="space-y-3 text-sm leading-relaxed text-gray-700">
              <p className="text-sm text-gray-700">
                If you need immediate support, you can also reach out — these helplines are available 24/7. You're not alone.
              </p>
              <p><strong>Davao City Health Office 24/7:</strong><br/>0927 604 5797, <br/>0939 340 5675, <br/>0961 526 2861.</p>
              <p><strong>National Center for Mental Health:</strong> 0917 899 8727 (USAP) or <br/>989-8727 (USAP).</p>
              <p><strong>In Touch Community Services Crisis Lines:</strong> 0917 800 1123, <br/>0922 893 8944, <br/>893-7603.</p>
              <p><strong>Tawag Paglaum - Centro Bisaya:</strong> 0966-467-9626, <br/>
                <a href="https://www.facebook.com/profile.php?id=100068862624004" target="_blank" rel="noopener noreferrer" className="HelplineCardV2_websiteLink__LVCnd HelplineCardV2_linkBase__Wx3Ep text-blue-600 font-semibold underline" dir="ltr" data-testid="url">facebook.com</a>
              </p>
              <p><strong>NCMH Crisis Hotline:</strong> tel:1800-1888-1553, <br/>
                <a href="https://www.facebook.com/ncmhcrisishotline?mibextid=LQQJ4d" target="_blank" rel="noopener noreferrer" className="HelplineCardV2_websiteLink__LVCnd HelplineCardV2_linkBase__Wx3Ep text-blue-600 font-semibold underline" dir="ltr" data-testid="url">facebook.com</a>
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 hover:text-gray-900 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-0 relative z-10 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-white/95 backdrop-blur-xl rounded-t-2xl shadow-lg border border-pink-200 border-b-0 px-4 sm:px-5 py-4 flex items-center gap-4 overflow-visible relative z-30 shrink-0">
            <div className="bg-gradient-to-br from-pink-400 to-rose-500 p-2.5 rounded-xl shadow-md flex-shrink-0">
              {session.isAnonymous && !session.revealedRealName ? (
                <UserX className="w-5 h-5 text-white" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{displayName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
                <p className="text-xs text-gray-500">
                  {session.isAnonymous && !session.revealedRealName
                    ? 'Anonymous Session'
                    : 'Identified Session'}
                  {session.status === 'resolved' && (
                    <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">Resolved</span>
                  )}
                </p>
              </div>
            </div>

            {/* AI indicator
            <div className="hidden sm:flex items-center gap-1.5 bg-pink-50 px-3 py-1.5 rounded-full border border-pink-200">
              <Sparkles className="w-3.5 h-3.5 text-pink-600" />
              <span className="text-xs text-pink-700 font-medium">AI-Monitored</span>
            </div> */}

            {/* ⋮ Menu */}
            <div className="relative flex-shrink-0 z-[60]" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                aria-label="Conversation options"
                aria-expanded={showMenu}
                className="p-2 rounded-xl hover:bg-pink-50 transition-colors text-gray-500 hover:text-gray-700"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 w-64 max-w-[calc(100vw-2rem)] z-[70] overflow-hidden py-1">
                  {isMobile && (
                    <button
                      onClick={() => {
                        openHelplineModal();
                        setShowMenu(false);
                      }}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-pink-50 transition-colors text-left"
                    >
                      <PhoneCall className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-pink-700 leading-5">Helpline</p>
                        <p className="text-xs text-pink-500 mt-0.5 leading-4">
                          Open crisis support info for mobile
                        </p>
                      </div>
                    </button>
                  )}

                  {isMobile && <div className="mx-4 my-1 border-t border-gray-100" />}

                  {session.isAnonymous && (
                    <button
                      onClick={handleToggleRealName}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                    >
                      <UserCheck className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-blue-700 leading-5">
                          {session.revealedRealName ? 'Use Nickname Again' : 'Show Real Name'}
                        </p>
                        <p className="text-xs text-blue-500 mt-0.5 leading-4">
                          {session.revealedRealName
                            ? 'Switch back to your anonymous nickname'
                            : 'Let the counselor see your real name'}
                        </p>
                      </div>
                    </button>
                  )}

                  {session.isAnonymous && (
                    <div className="mx-4 my-1 border-t-2 border-dashed border-gray-200" />
                  )}

                  <button
                    onClick={handleDeleteConversation}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
                  >
                    <Trash2 className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-red-700">Delete Conversation</p>
                      <p className="text-xs text-red-400 mt-0.5">Permanently removes all messages</p>
                    </div>
                  </button>

                  <div className="mx-4 my-1 border-t border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-100 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-400">Sign Out</p>
                  </button>
                </div>
              )}
            </div>
          </div>

          {isMobile && showHelplineModal && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/45 px-4 py-4">
              <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden max-h-[85vh] flex flex-col">
                <div className="px-5 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="bg-white/20 rounded-2xl p-2.5 flex-shrink-0">
                        <PhoneCall className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg font-bold leading-tight">Helpline</h2>
                        <p className="text-xs text-pink-100 leading-4">
                          Crisis support contacts for mobile users
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={closeHelplineModal}
                      className="shrink-0 rounded-xl bg-white/15 hover:bg-white/25 px-3 py-2 text-sm font-semibold transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-3 overflow-y-auto text-sm leading-relaxed text-gray-700">
                  <p>
                    If you need immediate support, you can also reach out — these helplines are available 24/7. You're not alone.
                  </p>
                  <p>
                    <strong>Davao City Health Office 24/7:</strong><br />
                    0927 604 5797, <br />
                    0939 340 5675, <br />
                    0961 526 2861.
                  </p>
                  <p>
                    <strong>National Center for Mental Health:</strong> 0917 899 8727 (USAP) or <br />
                    989-8727 (USAP).
                  </p>
                  <p>
                    <strong>In Touch Community Services Crisis Lines:</strong> 0917 800 1123, <br />
                    0922 893 8944, <br />
                    893-7603.
                  </p>
                  <p>
                    <strong>Tawag Paglaum - Centro Bisaya:</strong> 0966-467-9626, <br />
                    <a href="https://www.facebook.com/profile.php?id=100068862624004" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold underline break-all">
                      facebook.com
                    </a>
                  </p>
                  <p>
                    <strong>NCMH Crisis Hotline:</strong> tel:1800-1888-1553, <br />
                    <a href="https://www.facebook.com/ncmhcrisishotline?mibextid=LQQJ4d" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold underline break-all">
                      facebook.com
                    </a>
                  </p>

                  <button
                    onClick={closeHelplineModal}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-3.5 px-5 rounded-2xl transition-all shadow-lg"
                  >
                    Close Helpline
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="bg-red-50 border-x border-red-200 px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800 font-medium">
                  Delete this conversation? This cannot be undone.
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            onScroll={handleMessagesScroll}
            className={`flex-1 min-h-0 bg-white/90 backdrop-blur-xl px-4 sm:px-5 pt-0 pb-5 overflow-y-auto border-x border-pink-200 relative z-10 scrollbar-fade overscroll-contain ${isScrolling ? 'scrollbar-fade--active' : ''}`}
          >
            {session.messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                    <MessageSquare className="w-8 h-8 text-pink-500" />
                  </div>
                  <p className="text-gray-500 font-medium">Start by sending a message</p>
                  <p className="text-gray-400 text-sm mt-1">We're here to listen and support you 💗</p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {session.messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[78%] rounded-2xl px-5 py-3.5 shadow-md ${
                        msg.sender === 'student'
                          ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white'
                          : 'bg-white border border-pink-200 text-gray-900'
                      }`}
                    >
                      {msg.sender === 'counselor' && (
                        <p className="text-xs font-semibold text-pink-600 mb-1">Counselor</p>
                      )}
                      <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.content}</p>
                      <p className={`text-xs mt-2 ${msg.sender === 'student' ? 'text-pink-200' : 'text-gray-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white/95 backdrop-blur-xl rounded-b-2xl shadow-lg border border-pink-200 border-t-0 px-4 sm:px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] relative z-20 shrink-0">
            {session.status === 'resolved' ? (
              <div className="text-center py-3">
                <p className="text-sm text-gray-600 mb-3">This conversation has been resolved by your counselor.</p>
                <button
                  onClick={continueResolvedSession}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-md"
                >
                  <RefreshCw className="w-4 h-4" />
                  Continue Conversation
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <textarea
                  value={currentMessage}
                  onChange={e => setCurrentMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message here..."
                  rows={2}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-pink-200 rounded-xl resize-none focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus:bg-white transition-all text-gray-900 placeholder-gray-400 text-base sm:text-sm leading-6"
                />
                <button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim()}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-400 text-white p-3.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none self-end"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
