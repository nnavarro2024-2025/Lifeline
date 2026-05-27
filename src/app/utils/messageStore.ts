import { RiskLevel } from './crisisDetection';

const NICKNAME_ADJECTIVES = ['Gentle', 'Calm', 'Brave', 'Quiet', 'Warm', 'Kind', 'Soft', 'Clear', 'Bright', 'Still'];
const NICKNAME_NOUNS = ['River', 'Breeze', 'Cloud', 'Star', 'Moon', 'Wave', 'Petal', 'Dawn', 'Leaf', 'Rain'];

export function generateNickname(): string {
  const adj = NICKNAME_ADJECTIVES[Math.floor(Math.random() * NICKNAME_ADJECTIVES.length)];
  const noun = NICKNAME_NOUNS[Math.floor(Math.random() * NICKNAME_NOUNS.length)];
  return `${adj} ${noun}`;
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

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const now = new Date();

    const mockSessions: ChatSession[] = [
      {
        id: 'session-001',
        nickname: 'Quiet Moon',
        realStudentName: 'Unknown Student',
        studentEmail: 'mock1@uic.edu',
        isAnonymous: true,
        revealedRealName: false,
        riskLevel: 'high',
        status: 'active',
        createdAt: new Date(now.getTime() - 300000),
        lastMessageAt: new Date(now.getTime() - 60000),
        messages: [
          {
            id: 'msg-1',
            sessionId: 'session-001',
            content: "I don't know what to do anymore. I feel like there's no reason to live.",
            sender: 'student',
            timestamp: new Date(now.getTime() - 300000),
          },
          {
            id: 'msg-2',
            sessionId: 'session-001',
            content: "Everything feels hopeless. I'm thinking about ending it all.",
            sender: 'student',
            timestamp: new Date(now.getTime() - 60000),
          },
        ],
      },
      {
        id: 'session-002',
        nickname: 'Brave River',
        realStudentName: 'Maria Santos',
        studentEmail: 'maria.santos@uic.edu',
        isAnonymous: false,
        revealedRealName: false,
        riskLevel: 'moderate',
        status: 'active',
        createdAt: new Date(now.getTime() - 600000),
        lastMessageAt: new Date(now.getTime() - 120000),
        messages: [
          {
            id: 'msg-3',
            sessionId: 'session-002',
            content: 'Sobrang stressed na ako sa school. Hindi ko na kaya.',
            sender: 'student',
            timestamp: new Date(now.getTime() - 600000),
          },
          {
            id: 'msg-4',
            sessionId: 'session-002',
            content: 'Feeling ko worthless na ako. Ang hirap ng buhay.',
            sender: 'student',
            timestamp: new Date(now.getTime() - 120000),
          },
        ],
      },
      {
        id: 'session-003',
        nickname: 'Calm Breeze',
        realStudentName: 'Unknown Student',
        studentEmail: 'mock2@uic.edu',
        isAnonymous: true,
        revealedRealName: false,
        riskLevel: 'low',
        status: 'active',
        createdAt: new Date(now.getTime() - 900000),
        lastMessageAt: new Date(now.getTime() - 180000),
        messages: [
          {
            id: 'msg-5',
            sessionId: 'session-003',
            content: "I'm feeling a bit overwhelmed with my assignments.",
            sender: 'student',
            timestamp: new Date(now.getTime() - 900000),
          },
        ],
      },
      {
        id: 'session-004',
        nickname: 'Gentle Wave',
        realStudentName: 'Juan Cruz',
        studentEmail: 'juan.cruz@uic.edu',
        isAnonymous: false,
        revealedRealName: false,
        riskLevel: 'high',
        status: 'resolved',
        createdAt: new Date(now.getTime() - 86400000),
        lastMessageAt: new Date(now.getTime() - 82000000),
        resolvedAt: new Date(now.getTime() - 80000000),
        messages: [
          {
            id: 'msg-6',
            sessionId: 'session-004',
            content: "I was struggling with thoughts of hurting myself but I reached out.",
            sender: 'student',
            timestamp: new Date(now.getTime() - 86400000),
          },
          {
            id: 'msg-7',
            sessionId: 'session-004',
            content: "Thank you for reaching out. I'm glad you did. Let's talk through this together.",
            sender: 'counselor',
            timestamp: new Date(now.getTime() - 83000000),
          },
          {
            id: 'msg-8',
            sessionId: 'session-004',
            content: "I feel better now. Thank you so much.",
            sender: 'student',
            timestamp: new Date(now.getTime() - 82000000),
          },
        ],
      },
      {
        id: 'session-005',
        nickname: 'Soft Star',
        realStudentName: 'Ana Reyes',
        studentEmail: 'ana.reyes@uic.edu',
        isAnonymous: false,
        revealedRealName: false,
        riskLevel: 'moderate',
        status: 'resolved',
        createdAt: new Date(now.getTime() - 172800000),
        lastMessageAt: new Date(now.getTime() - 170000000),
        resolvedAt: new Date(now.getTime() - 168000000),
        messages: [
          {
            id: 'msg-9',
            sessionId: 'session-005',
            content: "I'm having a really hard time with anxiety lately.",
            sender: 'student',
            timestamp: new Date(now.getTime() - 172800000),
          },
          {
            id: 'msg-10',
            sessionId: 'session-005',
            content: "I hear you. Anxiety can feel overwhelming. Let's talk about what's been happening.",
            sender: 'counselor',
            timestamp: new Date(now.getTime() - 171000000),
          },
        ],
      },
      {
        id: 'session-006',
        nickname: 'Clear Dawn',
        realStudentName: 'Unknown Student',
        studentEmail: 'mock3@uic.edu',
        isAnonymous: true,
        revealedRealName: false,
        riskLevel: 'low',
        status: 'resolved',
        createdAt: new Date(now.getTime() - 259200000),
        lastMessageAt: new Date(now.getTime() - 256000000),
        resolvedAt: new Date(now.getTime() - 254000000),
        messages: [
          {
            id: 'msg-11',
            sessionId: 'session-006',
            content: "Just wanted to talk to someone. I've been feeling lonely.",
            sender: 'student',
            timestamp: new Date(now.getTime() - 259200000),
          },
          {
            id: 'msg-12',
            sessionId: 'session-006',
            content: "You did the right thing by reaching out. I'm here to listen.",
            sender: 'counselor',
            timestamp: new Date(now.getTime() - 258000000),
          },
        ],
      },
    ];

    for (const session of mockSessions) {
      this.sessions.set(session.id, session);
    }
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
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

  createSession(studentEmail: string, realStudentName: string, isAnonymous: boolean): ChatSession {
    const session: ChatSession = {
      id: `session-${Date.now()}`,
      nickname: generateNickname(),
      realStudentName,
      studentEmail: studentEmail.toLowerCase(),
      isAnonymous,
      revealedRealName: false,
      messages: [],
      riskLevel: 'low',
      status: 'active',
      createdAt: new Date(),
      lastMessageAt: new Date(),
    };
    this.sessions.set(session.id, session);
    this.notify();
    return session;
  }

  addMessage(sessionId: string, content: string, sender: 'student' | 'counselor', riskLevel: RiskLevel) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      content,
      sender,
      timestamp: new Date(),
    };

    session.messages.push(message);
    session.lastMessageAt = new Date();

    if (sender === 'student') {
      const riskLevels: Record<RiskLevel, number> = { low: 1, moderate: 2, high: 3 };
      if (riskLevels[riskLevel] > riskLevels[session.riskLevel]) {
        session.riskLevel = riskLevel;
      }
    }

    this.notify();
  }

  updateSessionStatus(sessionId: string, status: 'active' | 'resolved') {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = status;
      if (status === 'resolved') {
        session.resolvedAt = new Date();
      }
      this.notify();
    }
  }

  reactivateSession(sessionId: string): ChatSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session && session.status === 'resolved') {
      session.status = 'active';
      session.riskLevel = 'low';
      session.resolvedAt = undefined;
      this.notify();
    }
    return session;
  }

  toggleRealName(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.revealedRealName = !session.revealedRealName;
      this.notify();
    }
  }

  deleteSession(sessionId: string) {
    this.sessions.delete(sessionId);
    this.notify();
  }
}

export const messageStore = new MessageStore();
