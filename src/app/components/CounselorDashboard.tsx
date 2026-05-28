import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertCircle, Clock, CheckCircle, Send, LogOut, Shield,
  Sparkles, TrendingUp, Archive, Users, Heart, Search
} from 'lucide-react';
import { messageStore, ChatSession, getDisplayName } from '../utils/messageStore';
import { RiskLevel } from '../utils/crisisDetection';
import { useAuth } from '../context/AuthContext';

type DashboardTab = 'active' | 'archived';

export function CounselorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [activeTab, setActiveTab] = useState<DashboardTab>('active');
  const [archiveRiskFilter, setArchiveRiskFilter] = useState<RiskLevel>('high');
  const [archiveSearch, setArchiveSearch] = useState('');
  const [archiveDate, setArchiveDate] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const updateSessions = () => {
      const allSessions = messageStore.getAllSessions();
      const sorted = [...allSessions].sort((a, b) => {
        const riskOrder: Record<RiskLevel, number> = { high: 3, moderate: 2, low: 1 };
        const riskDiff = riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
        if (riskDiff !== 0) return riskDiff;
        return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
      });
      setSessions(sorted);

      if (selectedSession) {
        const updated = sorted.find(s => s.id === selectedSession.id);
        if (updated) {
          setSelectedSession(updated);
        } else {
          // Session was deleted by student
          setSelectedSession(null);
        }
      }
    };

    updateSessions();
    const unsubscribe = messageStore.subscribe(updateSessions);
    return () => {
      unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSession?.id]);

  useEffect(() => {
    if (!messagesContainerRef.current) return;
    messagesContainerRef.current.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [selectedSession?.id, selectedSession?.messages.length]);

  const sendReply = () => {
    if (!replyMessage.trim() || !selectedSession) return;
    messageStore.addMessage(selectedSession.id, replyMessage, 'counselor', 'low');
    setReplyMessage('');
  };

  const resolveSession = (sessionId: string) => {
    messageStore.updateSessionStatus(sessionId, 'resolved');
    if (selectedSession?.id === sessionId) {
      setSelectedSession(null);
    }
  };

  const getRiskColors = (level: RiskLevel) => {
    switch (level) {
      case 'high':
        return {
          bg: 'bg-gradient-to-br from-red-50 to-rose-50',
          border: 'border-red-300',
          badge: 'bg-gradient-to-r from-red-500 to-rose-500',
          text: 'text-red-800',
          ring: 'ring-red-400',
          section: 'text-red-700',
          sectionBg: 'bg-red-50 border-red-200',
          dot: 'bg-red-500',
        };
      case 'moderate':
        return {
          bg: 'bg-gradient-to-br from-yellow-50 to-amber-50',
          border: 'border-yellow-300',
          badge: 'bg-gradient-to-r from-yellow-500 to-amber-500',
          text: 'text-yellow-800',
          ring: 'ring-yellow-400',
          section: 'text-yellow-700',
          sectionBg: 'bg-yellow-50 border-yellow-200',
          dot: 'bg-yellow-500',
        };
      case 'low':
        return {
          bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
          border: 'border-green-300',
          badge: 'bg-gradient-to-r from-green-500 to-emerald-500',
          text: 'text-green-800',
          ring: 'ring-green-400',
          section: 'text-green-700',
          sectionBg: 'bg-green-50 border-green-200',
          dot: 'bg-green-500',
        };
    }
  };

  const activeSessions = sessions.filter(s => s.status === 'active');
  const resolvedSessions = sessions.filter(s => s.status === 'resolved');
  const highRiskCount = activeSessions.filter(s => s.riskLevel === 'high').length;
  const moderateRiskCount = activeSessions.filter(s => s.riskLevel === 'moderate').length;
  const lowRiskCount = activeSessions.filter(s => s.riskLevel === 'low').length;

  const orderedActiveSessions = [...activeSessions].sort((a, b) => {
    if (a.riskLevel === 'high' && b.riskLevel !== 'high') return -1;
    if (b.riskLevel === 'high' && a.riskLevel !== 'high') return 1;

    if (a.riskLevel === 'high' && b.riskLevel === 'high') {
      return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
    }

    const createdDiff = a.createdAt.getTime() - b.createdAt.getTime();
    if (createdDiff !== 0) return createdDiff;

    return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
  });

  const highPrioritySessions = orderedActiveSessions.filter(session => session.riskLevel === 'high');
  const normalQueueSessions = orderedActiveSessions.filter(session => session.riskLevel !== 'high');

  const archiveSessions = resolvedSessions
    .filter(session => session.riskLevel === archiveRiskFilter)
    .filter(session => {
      const haystack = [
        getDisplayName(session),
        session.realStudentName,
        session.nickname,
        session.studentEmail,
        session.messages.map(message => message.content).join(' '),
      ].join(' ').toLowerCase();

      const searchOk = archiveSearch.trim()
        ? haystack.includes(archiveSearch.trim().toLowerCase())
        : true;

      const dateOk = archiveDate
        ? [session.createdAt, session.resolvedAt ?? session.lastMessageAt].some(date => date.toISOString().slice(0, 10) === archiveDate)
        : true;

      return searchOk && dateOk;
    })
    .sort((a, b) => {
      const aDate = a.resolvedAt ?? a.lastMessageAt;
      const bDate = b.resolvedAt ?? b.lastMessageAt;
      const diff = bDate.getTime() - aDate.getTime();
      if (diff !== 0) return diff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  const SessionCard = ({ session, compact = false }: { session: ChatSession; compact?: boolean }) => {
    const colors = getRiskColors(session.riskLevel);
    const displayName = getDisplayName(session);
    const lastMessage = session.messages[session.messages.length - 1];

    return (
      <div
        onClick={() => setSelectedSession(session)}
        className={`border ${colors.border} ${colors.bg} rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg ${
          selectedSession?.id === session.id
            ? `ring-2 ${colors.ring} ring-opacity-60 shadow-lg scale-[1.01]`
            : 'hover:scale-[1.005]'
        } ${compact ? 'p-3' : ''}`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-semibold text-gray-900 truncate text-sm">{displayName}</span>
              <span className={`px-2 py-0.5 ${colors.badge} text-white text-xs rounded-full uppercase font-bold shadow-sm flex-shrink-0`}>
                {session.riskLevel}
              </span>
              {session.status === 'resolved' && (
                <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full font-medium flex-shrink-0">
                  Resolved
                </span>
              )}
            </div>
            <div className="space-y-0.5 text-xs text-gray-500">
              <p>Started {new Date(session.createdAt).toLocaleString()}</p>
              <p>Last sent {new Date(session.lastMessageAt).toLocaleString()}</p>
              {session.status === 'resolved' && session.resolvedAt && (
                <p>Completed {new Date(session.resolvedAt).toLocaleString()}</p>
              )}
              <p>{session.messages.length} messages</p>
            </div>
          </div>
          {session.riskLevel === 'high' && session.status === 'active' && (
            <div className="bg-red-100 p-1.5 rounded-lg flex-shrink-0 ml-2">
              <AlertCircle className="w-4 h-4 text-red-600 animate-pulse" />
            </div>
          )}
        </div>

        {lastMessage && !compact && (
          <p className={`text-xs ${colors.text} line-clamp-2 mb-3 bg-white/60 p-2 rounded-lg`}>
            {lastMessage.content}
          </p>
        )}

        {session.status === 'active' && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={e => { e.stopPropagation(); setSelectedSession(session); }}
              className="flex-1 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              Respond
            </button>
            <button
              onClick={e => { e.stopPropagation(); resolveSession(session.id); }}
              className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-600 text-xs font-semibold py-1.5 px-3 rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              Resolve
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-pink-50 to-rose-50 p-3 relative overflow-hidden">
      <div className="max-w-7xl mx-auto h-[calc(100vh-1.5rem)] flex flex-col relative z-10">

        {/* Header */}
        <div className="bg-white/95 backdrop-blur-xl rounded-t-2xl shadow-lg border border-pink-200 border-b-0 px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-pink-600 fill-pink-500" />
                <span className="font-bold text-pink-700 text-lg">LifeLine</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-gray-200" />
              <div className="hidden sm:flex items-center gap-3">
                <div className="bg-gradient-to-br from-fuchsia-500 to-purple-600 p-2.5 rounded-xl shadow">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Counselor Dashboard</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Welcome, <span className="font-semibold text-fuchsia-700">{user?.name}</span>
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-red-300 text-gray-600 hover:text-red-600 rounded-xl transition-all shadow-sm hover:shadow-md text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-400 to-rose-500 p-2.5 rounded-xl shadow-sm flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">{highRiskCount}</p>
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">High Risk</p>
                {highRiskCount > 0 && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <TrendingUp className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-500">Urgent</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
              <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-2.5 rounded-xl shadow-sm flex-shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-700">{moderateRiskCount}</p>
                <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">Moderate</p>
                {moderateRiskCount > 0 && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs text-yellow-500">Monitor</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-2.5 rounded-xl shadow-sm flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{lowRiskCount}</p>
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Low Risk</p>
                {lowRiskCount > 0 && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-500">Standard</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-3 overflow-hidden">

          {/* Left Panel — Sessions List */}
          <div className="w-80 flex flex-col bg-white/95 backdrop-blur-xl rounded-bl-2xl shadow-lg border-l border-b border-pink-200 overflow-hidden">

            {/* Tabs */}
            <div className="flex border-b border-pink-200 bg-pink-50/50">
              <button
                onClick={() => setActiveTab('active')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all ${
                  activeTab === 'active'
                    ? 'text-fuchsia-700 border-b-2 border-fuchsia-600 bg-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="w-4 h-4" />
                Active
                {activeSessions.length > 0 && (
                  <span className="bg-fuchsia-600 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                    {activeSessions.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('archived')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all ${
                  activeTab === 'archived'
                    ? 'text-fuchsia-700 border-b-2 border-fuchsia-600 bg-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Archive className="w-4 h-4" />
                Archived
                {resolvedSessions.length > 0 && (
                  <span className="bg-gray-400 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                    {resolvedSessions.length}
                  </span>
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Active Sessions */}
              {activeTab === 'active' && (
                <>
                  {orderedActiveSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                        <CheckCircle className="w-8 h-8 text-pink-500" />
                      </div>
                      <p className="text-gray-600 font-medium">No active sessions</p>
                      <p className="text-gray-400 text-sm mt-1">All caught up! 🎉</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {highPrioritySessions.map(session => (
                        <SessionCard key={session.id} session={session} />
                      ))}

                      {highPrioritySessions.length > 0 && normalQueueSessions.length > 0 && (
                        <div className="relative py-2">
                          <div className="absolute left-0 right-0 top-1/2 h-px bg-red-300" />
                          <div className="relative mx-auto w-fit px-4 py-1 bg-white rounded-full border border-red-200 shadow-sm text-[11px] font-bold uppercase tracking-[0.2em] text-red-600">
                            Urgent
                          </div>
                        </div>
                      )}

                      {normalQueueSessions.map(session => (
                        <SessionCard key={session.id} session={session} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Archived Sessions */}
              {activeTab === 'archived' && (
                <>
                  <div className="space-y-4">
                    <div className="bg-white/90 border border-pink-200 rounded-2xl p-3 shadow-sm space-y-3">
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <input
                          type="search"
                          value={archiveSearch}
                          onChange={e => setArchiveSearch(e.target.value)}
                          placeholder="Search name"
                          className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
                        />
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <input
                          type="date"
                          value={archiveDate}
                          onChange={e => setArchiveDate(e.target.value)}
                          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700"
                        />
                        <div className="flex items-center gap-1 rounded-xl border border-pink-200 bg-pink-50 p-1">
                          {(['high', 'moderate', 'low'] as RiskLevel[]).map(risk => {
                            const colors = getRiskColors(risk);
                            const label = risk === 'high' ? 'High Risk (Resolved)' : risk === 'moderate' ? 'Moderate Risk (Resolved)' : 'Low Risk (Resolved)';
                            const active = archiveRiskFilter === risk;

                            return (
                              <button
                                key={risk}
                                onClick={() => setArchiveRiskFilter(risk)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${active ? `${colors.badge} text-white shadow-md` : 'text-gray-600 hover:bg-white'}`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {resolvedSessions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Archive className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No archived sessions</p>
                        <p className="text-gray-400 text-sm mt-1">Resolved sessions will appear here</p>
                      </div>
                    ) : archiveSessions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Archive className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No matching archived sessions</p>
                        <p className="text-gray-400 text-sm mt-1">Try a different name, date, or risk category</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {archiveSessions.map(session => (
                          <SessionCard key={session.id} session={session} compact />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Panel — Conversation View */}
          <div className="flex-1 bg-white/95 backdrop-blur-xl rounded-br-2xl shadow-lg border-r border-b border-pink-200 flex flex-col overflow-hidden">
            {!selectedSession ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl">
                    <Sparkles className="w-10 h-10 text-pink-500" />
                  </div>
                  <p className="text-gray-600 font-medium text-lg mb-1">Select a session</p>
                  <p className="text-gray-400 text-sm">Choose from the {activeTab === 'active' ? 'active sessions' : 'archived conversations'} on the left</p>
                </div>
              </div>
            ) : (
              <>
                {/* Conversation Header */}
                <div className="px-6 py-4 border-b border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-lg truncate">
                          {getDisplayName(selectedSession)}
                        </h3>
                        <span className={`px-3 py-1 ${getRiskColors(selectedSession.riskLevel).badge} text-white rounded-xl text-xs uppercase font-bold shadow-md flex-shrink-0`}>
                          {selectedSession.riskLevel} Risk
                        </span>
                        {selectedSession.status === 'resolved' && (
                          <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-xl text-xs font-bold flex-shrink-0">
                            Resolved
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Started {new Date(selectedSession.createdAt).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        Last sent {new Date(selectedSession.lastMessageAt).toLocaleString()}
                      </p>
                      {selectedSession.status === 'resolved' && selectedSession.resolvedAt && (
                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Completed {new Date(selectedSession.resolvedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    {selectedSession.status === 'active' && (
                      <button
                        onClick={() => resolveSession(selectedSession.id)}
                        className="flex-shrink-0 ml-3 bg-white hover:bg-green-50 border border-gray-300 hover:border-green-400 text-gray-700 hover:text-green-700 font-semibold text-sm py-2 px-4 rounded-xl transition-all shadow-sm hover:shadow-md"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-gradient-to-b from-white to-pink-50/20">
                  {selectedSession.messages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-400 text-sm">No messages yet in this session.</p>
                    </div>
                  )}
                  {selectedSession.messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'counselor' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-5 py-4 shadow-md ${
                          msg.sender === 'counselor'
                            ? 'bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white'
                            : 'bg-white border border-pink-200 text-gray-900'
                        }`}
                      >
                        {msg.sender === 'student' && (
                          <p className="text-xs font-semibold text-pink-600 mb-1">
                            {getDisplayName(selectedSession)}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.content}</p>
                        <p className={`text-xs mt-2 font-medium ${msg.sender === 'counselor' ? 'text-fuchsia-200' : 'text-gray-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Input */}
                {selectedSession.status === 'active' ? (
                  <div className="px-6 py-4 border-t border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50 flex-shrink-0">
                    <div className="flex gap-3">
                      <textarea
                        value={replyMessage}
                        onChange={e => setReplyMessage(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendReply();
                          }
                        }}
                        placeholder="Type your professional response here..."
                        rows={2}
                        className="flex-1 px-4 py-3 bg-white border border-pink-200 rounded-xl resize-none focus:outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-100 transition-all text-gray-900 placeholder-gray-400 text-sm shadow-inner"
                      />
                      <button
                        onClick={sendReply}
                        disabled={!replyMessage.trim()}
                        className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white p-3.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none self-end"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="px-6 py-4 border-t border-pink-200 bg-gray-50 flex-shrink-0">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Archive className="w-4 h-4" />
                      <span>This conversation has been resolved and is archived.</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
