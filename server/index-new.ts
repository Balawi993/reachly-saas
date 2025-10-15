import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { query, encrypt } from './db-postgres';
import { hashPassword, verifyPassword, generateToken, verifyToken, createUser, getUserByEmail } from './auth';
import { parseCookies, validateTwitterAccount, extractFollowers } from './twitter';
import { startCampaign, pauseCampaign, stopCampaign, resumeActiveCampaigns } from './campaign-runner';
import { startFollowCampaign, pauseFollowCampaign, stopFollowCampaign, resumeActiveFollowCampaigns } from './follow-runner';
import { getQueueStats } from './queue';
import logger from './logger';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// ============ Middleware ============

// CORS - Dynamic origin
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, 'http://localhost:8080']
  : ['http://localhost:8080'];

app.use(cors({ 
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));

app.use(express.json());
app.use(cookieParser());

// Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { 
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// ============ Health Check ============

app.get('/health', async (req, res) => {
  try {
    // Check database
    await query('SELECT 1');
    
    // Get queue stats
    const queueStats = await getQueueStats();
    
    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      redis: 'connected',
      queues: queueStats,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    logger.error('Health check failed', { error });
    res.status(503).json({ 
      status: 'unhealthy',
      error: (error as Error).message 
    });
  }
});

// ============ Auth Middleware ============

function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  req.user = user;
  next();
}

// ============ Auth Routes ============

// Sign up
app.post('/api/auth/signup', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const existing = await getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const passwordHash = await hashPassword(password);
    const userId = await createUser(email, passwordHash);
    
    const user = { id: userId, email };
    const token = generateToken(user);
    
    logger.info('User signed up', { userId, email });
    res.json({ user, token });
  } catch (error) {
    logger.error('Signup error', { error });
    res.status(500).json({ error: (error as Error).message });
  }
});

// Login
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken({ id: user.id, email: user.email });
    
    logger.info('User logged in', { userId: user.id, email });
    res.json({ user: { id: user.id, email: user.email }, token });
  } catch (error) {
    logger.error('Login error', { error });
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============ Accounts Routes ============

// Get accounts
app.get('/api/accounts', authMiddleware, async (req: any, res) => {
  try {
    const result = await query(`
      SELECT id, username, handle, avatar, is_valid, last_validated, created_at
      FROM accounts
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [req.user.id]);
    
    res.json(result.rows);
  } catch (error) {
    logger.error('Get accounts error', { error, userId: req.user.id });
    res.status(500).json({ error: (error as Error).message });
  }
});

// Add account
app.post('/api/accounts', authMiddleware, async (req: any, res) => {
  try {
    const { username, cookies } = req.body;
    
    if (!username || !cookies) {
      return res.status(400).json({ error: 'Username and cookies required' });
    }
    
    // Parse cookies
    const parsedCookies = parseCookies(cookies);
    
    // Validate account
    const validation = await validateTwitterAccount(parsedCookies, username);
    
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error || 'Invalid account' });
    }
    
    // Encrypt and save cookies
    const encryptedCookies = encrypt(JSON.stringify(parsedCookies));
    
    const result = await query(`
      INSERT INTO accounts (user_id, username, handle, avatar, encrypted_cookies)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, handle, avatar, is_valid, last_validated
    `, [
      req.user.id,
      validation.username,
      '@' + validation.username,
      validation.avatar,
      encryptedCookies
    ]);
    
    logger.info('Account added', { userId: req.user.id, username: validation.username });
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Add account error', { error, userId: req.user.id });
    res.status(500).json({ error: (error as Error).message });
  }
});

// Delete account
app.delete('/api/accounts/:id', authMiddleware, async (req: any, res) => {
  try {
    await query(
      'DELETE FROM accounts WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    logger.info('Account deleted', { userId: req.user.id, accountId: req.params.id });
    res.json({ success: true });
  } catch (error) {
    logger.error('Delete account error', { error, userId: req.user.id });
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============ Followers Routes ============

// Extract followers
app.post('/api/followers/extract', authMiddleware, async (req: any, res) => {
  try {
    const { accountId, targetUsername, quantity } = req.body;
    
    if (!accountId || !targetUsername) {
      return res.status(400).json({ error: 'Account ID and target username required' });
    }
    
    // Get account cookies
    const accountResult = await query(
      'SELECT encrypted_cookies FROM accounts WHERE id = $1 AND user_id = $2',
      [accountId, req.user.id]
    );
    
    if (!accountResult.rows[0]) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    const followers = await extractFollowers(
      accountResult.rows[0].encrypted_cookies,
      targetUsername,
      quantity || 100
    );
    
    logger.info('Followers extracted', { 
      userId: req.user.id, 
      accountId, 
      targetUsername, 
      count: followers.length 
    });
    
    res.json(followers);
  } catch (error) {
    logger.error('Extract followers error', { error, userId: req.user.id });
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============ Server Start ============

// Serve static files in production
if (isProduction) {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${isProduction ? 'production' : 'development'}`);
  
  // Resume active campaigns
  resumeActiveCampaigns();
  resumeActiveFollowCampaigns();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
