const envApiBaseUrl =
  (import.meta as unknown as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL || '';

// Default to same-origin requests so Vite dev proxy can forward to the API.
const API_BASE_URL = envApiBaseUrl || '';

type RequestOptions = RequestInit & { parseJson?: boolean };

const CONNECTION_ERROR_MESSAGE =
  'Unable to connect to the server. Please make sure the API and database are running.';

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch {
    throw new Error(CONNECTION_ERROR_MESSAGE);
  }

  const bodyText = await response.text().catch(() => '');

  if (bodyText.includes('ERR_NGROK_6024')) {
    throw new Error(
      'ngrok is showing its browser warning page. Open your ngrok URL once and tap "Visit Site", then try again.'
    );
  }

  const data =
    options.parseJson === false
      ? null
      : bodyText
        ? (() => {
            try {
              return JSON.parse(bodyText);
            } catch {
              return null;
            }
          })()
        : null;

  if (!response.ok) {
    const message = data?.error || data?.message || `Request failed (${response.status})`;

    if (response.status >= 500) {
      // Keep useful backend error messages (for example OAuth/config issues)
      // and fallback to connection guidance when no server details are available.
      throw new Error(message && !message.startsWith('Request failed') ? message : CONNECTION_ERROR_MESSAGE);
    }

    throw new Error(message);
  }

  return data as T;
}

export interface ApiAuthUser {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'counselor';
  isAuthenticated: boolean;
}

export interface ApiMessage {
  id: string;
  sessionId: string;
  content: string;
  sender: 'student' | 'counselor';
  timestamp: string;
}

export interface ApiChatSession {
  id: string;
  nickname: string;
  realStudentName: string;
  studentEmail: string;
  isAnonymous: boolean;
  revealedRealName: boolean;
  messages: ApiMessage[];
  riskLevel: 'low' | 'moderate' | 'high';
  status: 'active' | 'resolved';
  createdAt: string;
  lastMessageAt: string;
  resolvedAt?: string | null;
}

export const api = {
  health: () => request<{ ok: boolean; service: string }>('/health'),

  authLogin: (email: string, password: string) =>
    request<{ success: boolean; user: ApiAuthUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  authRegister: (firstName: string, lastName: string, email: string, password: string) =>
    request<{ success: boolean; user: ApiAuthUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, email, password }),
    }),

  authGoogleLogin: (idToken: string) =>
    request<{ success: boolean; user: ApiAuthUser }>('/api/auth/google-login', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    }),

  listSessions: (status: 'all' | 'active' | 'resolved' = 'all', email?: string) => {
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (email) params.set('email', email);
    const query = params.toString();
    return request<{ success: boolean; sessions: ApiChatSession[] }>(`/api/sessions${query ? `?${query}` : ''}`);
  },

  getSession: (sessionId: string) => request<{ success: boolean; session: ApiChatSession }>(`/api/sessions/${sessionId}`),

  createSession: (payload: {
    studentEmail: string;
    realStudentName: string;
    isAnonymous: boolean;
    nickname?: string;
  }) =>
    request<{ success: boolean; session: ApiChatSession }>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  reactivateSession: (sessionId: string) =>
    request<{ success: boolean; session: ApiChatSession }>(`/api/sessions/${sessionId}/reactivate`, {
      method: 'POST',
    }),

  updateSessionStatus: (sessionId: string, status: 'active' | 'resolved') =>
    request<{ success: boolean; session: ApiChatSession }>(`/api/sessions/${sessionId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  toggleRealName: (sessionId: string) =>
    request<{ success: boolean; session: ApiChatSession }>(`/api/sessions/${sessionId}/toggle-real-name`, {
      method: 'POST',
    }),

  deleteSession: (sessionId: string) =>
    request<{ success: boolean }>(`/api/sessions/${sessionId}`, {
      method: 'DELETE',
    }),

  addMessage: (payload: {
    sessionId: string;
    content: string;
    sender: 'student' | 'counselor';
    riskLevel: 'low' | 'moderate' | 'high';
  }) =>
    request<{ success: boolean; session: ApiChatSession }>('/api/messages', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
