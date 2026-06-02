import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import { OAuth2Client } from 'google-auth-library';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

const PORT = Number(process.env.API_PORT || 3001);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lifeline_db',
  port: Number(process.env.DB_PORT || 3306),
};

const COUNSELOR_EMAILS = new Set([
  'counselor@uic.edu.ph',
  'dr.reyes@uic.edu.ph',
  'guidance@uic.edu.ph',
  'advisor@uic.edu.ph',
  'admin@uic.edu.ph',
]);

const allowedOrigins = FRONTEND_ORIGIN
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const localDevOriginPattern =
  /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+):\d+$/;

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  // Always allow local/private-network development origins.
  if (localDevOriginPattern.test(origin)) return true;
  return false;
}

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

const pool = mysql.createPool({
  ...DB_CONFIG,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.use(
  cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin not allowed by CORS'));
    },
    credentials: false,
  })
);
app.use(express.json());

function isUICEmail(email) {
  return String(email).toLowerCase().endsWith('@uic.edu.ph');
}

function normalizeRole(email) {
  return COUNSELOR_EMAILS.has(String(email).toLowerCase()) ? 'counselor' : 'student';
}

function buildFullName(firstName, lastName) {
  return `${String(firstName || '').trim()} ${String(lastName || '').trim()}`.trim();
}

function splitName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: 'Unknown', lastName: 'Student' };
  if (parts.length === 1) return { firstName: parts[0], lastName: 'Student' };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

function serializeAuthUser(row) {
  const firstName = String(row.first_name || '').trim();
  const lastName = String(row.last_name || '').trim();
  const fallback = splitName(row.name);
  const normalizedFirstName = firstName || fallback.firstName;
  const normalizedLastName = lastName || fallback.lastName;

  return {
    name: buildFullName(normalizedFirstName, normalizedLastName),
    firstName: normalizedFirstName,
    lastName: normalizedLastName,
    email: row.email,
    role: row.role,
    isAuthenticated: true,
  };
}

function toISO(value) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function serializeMessage(row) {
  return {
    id: String(row.id),
    sessionId: String(row.session_id),
    content: row.content,
    sender: row.sender,
    timestamp: toISO(row.created_at),
  };
}

function serializeSession(row, messages = []) {
  return {
    id: String(row.id),
    nickname: row.nickname,
    realStudentName: row.real_student_name,
    studentEmail: row.student_email,
    isAnonymous: Boolean(row.is_anonymous),
    revealedRealName: Boolean(row.revealed_real_name),
    messages,
    riskLevel: row.risk_level,
    status: row.status,
    createdAt: toISO(row.created_at),
    lastMessageAt: toISO(row.last_message_at),
    resolvedAt: toISO(row.resolved_at),
  };
}

async function ensureUserByEmail(email, realName) {
  const lowerEmail = String(email).toLowerCase().trim();
  const [existing] = await pool.query('SELECT id, first_name, last_name, name, email, role FROM users WHERE email = ? LIMIT 1', [lowerEmail]);
  if (existing.length > 0) {
    return existing[0];
  }

  const role = normalizeRole(lowerEmail);
  const parsedName = splitName(realName);
  const fullName = buildFullName(parsedName.firstName, parsedName.lastName);
  const randomPasswordHash = bcrypt.hashSync(Math.random().toString(36), 10);
  const [insertResult] = await pool.query(
    'INSERT INTO users (first_name, last_name, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
    [parsedName.firstName, parsedName.lastName, fullName || 'Unknown Student', lowerEmail, randomPasswordHash, role]
  );

  return {
    id: insertResult.insertId,
    first_name: parsedName.firstName,
    last_name: parsedName.lastName,
    name: fullName || 'Unknown Student',
    email: lowerEmail,
    role,
  };
}

async function loadMessagesBySessionIds(sessionIds) {
  if (!sessionIds.length) return new Map();

  const placeholders = sessionIds.map(() => '?').join(',');
  const [rows] = await pool.query(
    `SELECT id, session_id, sender, content, risk_level, created_at
     FROM messages
     WHERE session_id IN (${placeholders})
     ORDER BY created_at ASC, id ASC`,
    sessionIds
  );

  const grouped = new Map();
  for (const row of rows) {
    const key = String(row.session_id);
    const list = grouped.get(key) || [];
    list.push(serializeMessage(row));
    grouped.set(key, list);
  }

  return grouped;
}

async function getSessionById(sessionId) {
  const [rows] = await pool.query('SELECT * FROM chat_sessions WHERE id = ? LIMIT 1', [sessionId]);
  if (!rows.length) return null;

  const sessionRow = rows[0];
  const messagesBySession = await loadMessagesBySessionIds([sessionRow.id]);
  return serializeSession(sessionRow, messagesBySession.get(String(sessionRow.id)) || []);
}

async function listSessions({ status = 'all', email } = {}) {
  const conditions = [];
  const params = [];

  if (status !== 'all') {
    conditions.push('status = ?');
    params.push(status);
  }

  if (email) {
    conditions.push('student_email = ?');
    params.push(String(email).toLowerCase().trim());
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.query(
    `SELECT * FROM chat_sessions ${whereClause} ORDER BY last_message_at DESC, id DESC`,
    params
  );

  const sessionIds = rows.map(row => row.id);
  const messagesBySession = await loadMessagesBySessionIds(sessionIds);

  return rows.map(row => serializeSession(row, messagesBySession.get(String(row.id)) || []));
}

async function generateUniqueNickname() {
  for (let i = 0; i < 20; i += 1) {
    const candidate = `Student${Math.floor(10000 + Math.random() * 90000)}`;
    const [rows] = await pool.query(
      'SELECT id FROM chat_sessions WHERE nickname = ? AND status = "active" LIMIT 1',
      [candidate]
    );
    if (!rows.length) return candidate;
  }

  return `Student${Date.now().toString().slice(-5)}`;
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'lifeline-api' });
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const lowerEmail = String(email || '').toLowerCase().trim();

    if (!lowerEmail || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    if (!isUICEmail(lowerEmail)) {
      return res.status(400).json({ success: false, error: 'Please use your UIC email address (@uic.edu.ph).' });
    }

    const [rows] = await pool.query('SELECT id, first_name, last_name, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1', [lowerEmail]);
    if (!rows.length) {
      return res.status(404).json({ success: false, error: 'No account found with this email. Please sign up first.' });
    }

    const user = rows[0];
    const passwordOk = await bcrypt.compare(String(password), user.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ success: false, error: 'Incorrect password. Please try again.' });
    }

    return res.json({
      success: true,
      user: serializeAuthUser(user),
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Login failed.' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, name, email, password } = req.body || {};
    const safeFirstName = String(firstName || '').trim();
    const safeLastName = String(lastName || '').trim();
    const fallbackName = String(name || '').trim();
    const derivedFromFallback = fallbackName ? splitName(fallbackName) : { firstName: '', lastName: '' };
    const finalFirstName = safeFirstName || derivedFromFallback.firstName;
    const finalLastName = safeLastName || derivedFromFallback.lastName;
    const fullName = buildFullName(finalFirstName, finalLastName);
    const lowerEmail = String(email || '').toLowerCase().trim();
    const plainPassword = String(password || '');

    if (!finalFirstName) {
      return res.status(400).json({ success: false, error: 'Please enter your first name.' });
    }
    if (!finalLastName) {
      return res.status(400).json({ success: false, error: 'Please enter your last name.' });
    }
    if (!isUICEmail(lowerEmail)) {
      return res.status(400).json({ success: false, error: 'Please use your UIC email address (@uic.edu.ph).' });
    }
    if (plainPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    const role = normalizeRole(lowerEmail);
    if (role === 'counselor') {
      return res.status(403).json({ success: false, error: 'Counselor accounts must be created by an administrator. Please contact support.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [lowerEmail]);
    if (existing.length) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists. Please sign in.' });
    }

    const passwordHash = await bcrypt.hash(plainPassword, 10);
    await pool.query(
      'INSERT INTO users (first_name, last_name, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
      [finalFirstName, finalLastName, fullName, lowerEmail, passwordHash, role]
    );

    return res.json({
      success: true,
      user: {
        name: fullName,
        firstName: finalFirstName,
        lastName: finalLastName,
        email: lowerEmail,
        role,
        isAuthenticated: true,
      },
    });
  } catch (_error) {
    return res.status(500).json({ success: false, error: 'Registration failed.' });
  }
});

app.post('/api/auth/google-login', async (req, res) => {
  try {
    const idToken = String(req.body?.idToken || '').trim();

    if (!idToken) {
      return res.status(400).json({ success: false, error: 'Google ID token is required.' });
    }

    if (!googleClient) {
      return res.status(500).json({ success: false, error: 'Google sign-in is not configured on the server.' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const lowerEmail = String(payload?.email || '').toLowerCase().trim();

    if (!payload?.email_verified || !lowerEmail) {
      return res.status(401).json({ success: false, error: 'Google account could not be verified.' });
    }

    if (!isUICEmail(lowerEmail)) {
      return res.status(400).json({ success: false, error: 'Please use your UIC email address (@uic.edu.ph).' });
    }

    const [rows] = await pool.query('SELECT id, first_name, last_name, name, email, role FROM users WHERE email = ? LIMIT 1', [lowerEmail]);
    if (rows.length) {
      const user = rows[0];
      return res.json({
        success: true,
        user: serializeAuthUser(user),
      });
    }

    const role = normalizeRole(lowerEmail);
    if (role === 'counselor') {
      return res.status(403).json({ success: false, error: 'Counselor accounts must be created by an administrator.' });
    }

    const payloadFirstName = String(payload?.given_name || '').trim();
    const payloadLastName = String(payload?.family_name || '').trim();
    const payloadName = String(payload?.name || '').trim();
    const nameParts = lowerEmail.split('@')[0].split('.').filter(Boolean);
    const inferredFirstName =
      payloadFirstName ||
      (nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'Student');
    const inferredLastName =
      payloadLastName ||
      (nameParts[1] ? nameParts.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'User');
    const inferredName = payloadName || buildFullName(inferredFirstName, inferredLastName);
    const randomPasswordHash = bcrypt.hashSync(Math.random().toString(36), 10);

    await pool.query(
      'INSERT INTO users (first_name, last_name, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
      [inferredFirstName, inferredLastName, inferredName || 'Student User', lowerEmail, randomPasswordHash, role]
    );

    return res.json({
      success: true,
      user: {
        name: inferredName || 'Student User',
        firstName: inferredFirstName,
        lastName: inferredLastName,
        email: lowerEmail,
        role,
        isAuthenticated: true,
      },
    });
  } catch (_error) {
    return res.status(500).json({ success: false, error: 'Google sign-in failed.' });
  }
});

app.get('/api/sessions', async (req, res) => {
  try {
    const status = String(req.query.status || 'all');
    const email = req.query.email ? String(req.query.email) : undefined;
    const sessions = await listSessions({ status, email });
    return res.json({ success: true, sessions });
  } catch (_error) {
    return res.status(500).json({ success: false, error: 'Failed to load sessions.' });
  }
});

app.get('/api/sessions/:id', async (req, res) => {
  try {
    const session = await getSessionById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found.' });
    }
    return res.json({ success: true, session });
  } catch (_error) {
    return res.status(500).json({ success: false, error: 'Failed to load session.' });
  }
});

app.post('/api/sessions', async (req, res) => {
  try {
    const { studentEmail, realStudentName, isAnonymous, nickname } = req.body || {};
    const lowerEmail = String(studentEmail || '').toLowerCase().trim();

    if (!lowerEmail || !realStudentName) {
      return res.status(400).json({ success: false, error: 'Missing session details.' });
    }

    const user = await ensureUserByEmail(lowerEmail, String(realStudentName));

    let finalNickname = String(realStudentName);
    if (isAnonymous) {
      const requested = String(nickname || '').trim();
      if (requested) {
        finalNickname = requested;
      } else {
        finalNickname = await generateUniqueNickname();
      }
    }

    const [insertResult] = await pool.query(
      `INSERT INTO chat_sessions
      (user_id, nickname, real_student_name, student_email, is_anonymous, revealed_real_name, risk_level, status, created_at, last_message_at)
      VALUES (?, ?, ?, ?, ?, 0, 'low', 'active', NOW(), NOW())`,
      [user.id, finalNickname, String(realStudentName), lowerEmail, isAnonymous ? 1 : 0]
    );

    const session = await getSessionById(insertResult.insertId);
    return res.json({ success: true, session });
  } catch (_error) {
    return res.status(500).json({ success: false, error: 'Failed to create session.' });
  }
});

app.post('/api/sessions/:id/reactivate', async (req, res) => {
  try {
    const sessionId = req.params.id;
    await pool.query(
      `UPDATE chat_sessions
       SET status = 'active', risk_level = 'low', resolved_at = NULL, last_message_at = NOW()
       WHERE id = ?`,
      [sessionId]
    );
    const session = await getSessionById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found.' });
    }
    return res.json({ success: true, session });
  } catch (_error) {
    return res.status(500).json({ success: false, error: 'Failed to reactivate session.' });
  }
});

app.post('/api/sessions/:id/status', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const status = String(req.body?.status || 'active');

    if (!['active', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status.' });
    }

    if (status === 'resolved') {
      await pool.query(
        `UPDATE chat_sessions
         SET status = 'resolved', resolved_at = NOW(), last_message_at = NOW()
         WHERE id = ?`,
        [sessionId]
      );
    } else {
      await pool.query(
        `UPDATE chat_sessions
         SET status = 'active', resolved_at = NULL, last_message_at = NOW()
         WHERE id = ?`,
        [sessionId]
      );
    }

    const session = await getSessionById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found.' });
    }
    return res.json({ success: true, session });
  } catch (_error) {
    return res.status(500).json({ success: false, error: 'Failed to update session status.' });
  }
});

app.post('/api/sessions/:id/toggle-real-name', async (req, res) => {
  try {
    const sessionId = req.params.id;
    await pool.query(
      `UPDATE chat_sessions
       SET revealed_real_name = IF(revealed_real_name = 1, 0, 1), last_message_at = NOW()
       WHERE id = ?`,
      [sessionId]
    );

    const session = await getSessionById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found.' });
    }

    return res.json({ success: true, session });
  } catch (_error) {
    return res.status(500).json({ success: false, error: 'Failed to toggle real name.' });
  }
});

app.delete('/api/sessions/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM chat_sessions WHERE id = ?', [req.params.id]);
    return res.json({ success: true });
  } catch (_error) {
    return res.status(500).json({ success: false, error: 'Failed to delete session.' });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { sessionId, content, sender, riskLevel } = req.body || {};
    const cleanContent = String(content || '').trim();

    if (!sessionId || !cleanContent || !['student', 'counselor'].includes(String(sender))) {
      return res.status(400).json({ success: false, error: 'Invalid message payload.' });
    }

    await pool.query(
      `INSERT INTO messages (session_id, sender, content, risk_level, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [sessionId, sender, cleanContent, ['low', 'moderate', 'high'].includes(String(riskLevel)) ? riskLevel : 'low']
    );

    if (sender === 'student') {
      const [sessionRows] = await pool.query('SELECT risk_level FROM chat_sessions WHERE id = ? LIMIT 1', [sessionId]);
      if (sessionRows.length) {
        const current = sessionRows[0].risk_level;
        const order = { low: 1, moderate: 2, high: 3 };
        const next = String(riskLevel);
        if ((order[next] || 1) > (order[current] || 1)) {
          await pool.query('UPDATE chat_sessions SET risk_level = ?, last_message_at = NOW() WHERE id = ?', [next, sessionId]);
        } else {
          await pool.query('UPDATE chat_sessions SET last_message_at = NOW() WHERE id = ?', [sessionId]);
        }
      }
    } else {
      await pool.query('UPDATE chat_sessions SET last_message_at = NOW() WHERE id = ?', [sessionId]);
    }

    const session = await getSessionById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found.' });
    }

    return res.json({ success: true, session });
  } catch (_error) {
    return res.status(500).json({ success: false, error: 'Failed to add message.' });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`LifeLine API running at http://localhost:${PORT}`);
});
