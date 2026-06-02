import { RiskLevel } from './crisisDetection';
import { api, ApiChatSession } from './api';

export function generateNickname(existingNicknames?: Set<string>): string {
  let nickname = '';

  do {
    const id = Math.floor(10000 + Math.random() * 90000);
    nickname = `Student${id}`;
  } while (existingNicknames?.has(nickname));

  return nickname;
}

export function getDisplayName(session: ChatSession): string {
  if (!session.isAnonymous || session.revealedRealName) {
    return session.realStudentName;
  }
  return session.nickname;
}

export interface Message {
  id: string;
  sessionId: string;
  content: string;
  sender: 'student' | 'counselor';
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  nickname: string;
  realStudentName: string;
  studentEmail: string;
  isAnonymous: boolean;
  revealedRealName: boolean;
  messages: Message[];
  riskLevel: RiskLevel;
  status: 'active' | 'resolved';
  createdAt: Date;
  lastMessageAt: Date;
  resolvedAt?: Date;
}

class MessageStore {
  private sessions: Map<string, ChatSession> = new Map();
  private listeners: Set<() => void> = new Set();
  private pollTimer: number | null = null;
  private isSyncing = false;
  private readonly pollIntervalMs = 2000;

  constructor() {
    void this.refreshSessions();
  }

  private parseSession(session: ApiChatSession): ChatSession {
    return {
      id: session.id,
      nickname: session.nickname,
      realStudentName: session.realStudentName,
      studentEmail: session.studentEmail,
      isAnonymous: Boolean(session.isAnonymous),
      revealedRealName: Boolean(session.revealedRealName),
      messages: session.messages.map(message => ({
        id: message.id,
        sessionId: message.sessionId,
        content: message.content,
        sender: message.sender,
        timestamp: new Date(message.timestamp),
      })),
      riskLevel: session.riskLevel,
      status: session.status,
      createdAt: new Date(session.createdAt),
      lastMessageAt: new Date(session.lastMessageAt),
      resolvedAt: session.resolvedAt ? new Date(session.resolvedAt) : undefined,
    };
  }

  private setSessionsFromApi(sessions: ApiChatSession[]) {
    this.sessions.clear();
    for (const session of sessions) {
      const parsed = this.parseSession(session);
      this.sessions.set(parsed.id, parsed);
    }
  }

  private async refreshSessions() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    try {
      const response = await api.listSessions('all');
      this.setSessionsFromApi(response.sessions);
      this.notify();
    } catch {
      // Keep last known in-memory snapshot if API temporarily fails.
    } finally {
      this.isSyncing = false;
    }
  }

  private startPolling() {
    if (this.pollTimer !== null) return;

    void this.refreshSessions();
    this.pollTimer = window.setInterval(() => {
      void this.refreshSessions();
    }, this.pollIntervalMs);
  }

  private stopPollingIfIdle() {
    if (this.listeners.size > 0) return;
    if (this.pollTimer !== null) {
      window.clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    this.startPolling();
    return () => {
      this.listeners.delete(listener);
      this.stopPollingIfIdle();
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  getAllSessions(): ChatSession[] {
    return Array.from(this.sessions.values());
  }

  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  getSessionsByEmail(email: string): ChatSession[] {
    return Array.from(this.sessions.values()).filter(
      session => session.studentEmail === email.toLowerCase()
    );
  }

  getActiveSessionByEmail(email: string): ChatSession | undefined {
    return Array.from(this.sessions.values()).find(
      session => session.studentEmail === email.toLowerCase() && session.status === 'active'
    );
  }

  getAllActiveSessions(): ChatSession[] {
    return Array.from(this.sessions.values()).filter(s => s.status === 'active');
  }

  getAllResolvedSessions(): ChatSession[] {
    return Array.from(this.sessions.values()).filter(s => s.status === 'resolved');
  }

  async createSession(studentEmail: string, realStudentName: string, isAnonymous: boolean, nickname?: string): Promise<ChatSession> {
    const response = await api.createSession({
      studentEmail,
      realStudentName,
      isAnonymous,
      nickname,
    });
    const parsed = this.parseSession(response.session);
    this.sessions.set(parsed.id, parsed);
    this.notify();
    return parsed;
  }

  async addMessage(sessionId: string, content: string, sender: 'student' | 'counselor', riskLevel: RiskLevel): Promise<ChatSession | undefined> {
    const response = await api.addMessage({
      sessionId,
      content,
      sender,
      riskLevel,
    });
    const parsed = this.parseSession(response.session);
    this.sessions.set(parsed.id, parsed);
    this.notify();
    return parsed;
  }

  async updateSessionStatus(sessionId: string, status: 'active' | 'resolved'): Promise<ChatSession | undefined> {
    const response = await api.updateSessionStatus(sessionId, status);
    const parsed = this.parseSession(response.session);
    this.sessions.set(parsed.id, parsed);
    this.notify();
    return parsed;
  }

  async reactivateSession(sessionId: string): Promise<ChatSession | undefined> {
    const response = await api.reactivateSession(sessionId);
    const parsed = this.parseSession(response.session);
    this.sessions.set(parsed.id, parsed);
    this.notify();
    return parsed;
  }

  async toggleRealName(sessionId: string): Promise<ChatSession | undefined> {
    const response = await api.toggleRealName(sessionId);
    const parsed = this.parseSession(response.session);
    this.sessions.set(parsed.id, parsed);
    this.notify();
    return parsed;
  }

  async deleteSession(sessionId: string) {
    await api.deleteSession(sessionId);
    this.sessions.delete(sessionId);
    this.notify();
  }
}

export const messageStore = new MessageStore();
