import Database from 'better-sqlite3';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

const db = new Database(path.join(process.cwd(), 'reachly.db'));

// إنشاء الجداول
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    handle TEXT NOT NULL,
    avatar TEXT,
    encrypted_cookies TEXT NOT NULL,
    is_valid BOOLEAN DEFAULT 1,
    last_validated DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    target_source TEXT NOT NULL,
    message_template TEXT NOT NULL,
    tags TEXT,
    pacing_per_minute INTEGER DEFAULT 3,
    pacing_delay_min INTEGER DEFAULT 15,
    pacing_delay_max INTEGER DEFAULT 30,
    pacing_daily_cap INTEGER DEFAULT 50,
    pacing_retry_attempts INTEGER DEFAULT 2,
    stats_total INTEGER DEFAULT 0,
    stats_sent INTEGER DEFAULT 0,
    stats_failed INTEGER DEFAULT 0,
    stats_replied INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS targets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    handle TEXT NOT NULL,
    name TEXT,
    avatar TEXT,
    status TEXT DEFAULT 'pending',
    retry_count INTEGER DEFAULT 0,
    last_attempt_at DATETIME,
    sent_at DATETIME,
    replied_at DATETIME,
    error_message TEXT,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    target_id INTEGER NOT NULL,
    last_message TEXT,
    last_message_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES targets(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    sender TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS follow_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    target_source TEXT NOT NULL,
    settings_follows_per_minute INTEGER DEFAULT 5,
    settings_daily_cap INTEGER DEFAULT 100,
    settings_random_delay BOOLEAN DEFAULT 1,
    settings_auto_pause BOOLEAN DEFAULT 1,
    stats_total INTEGER DEFAULT 0,
    stats_sent INTEGER DEFAULT 0,
    stats_failed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS follow_targets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    handle TEXT NOT NULL,
    name TEXT,
    avatar TEXT,
    status TEXT DEFAULT 'pending',
    last_attempt_at DATETIME,
    error_message TEXT,
    FOREIGN KEY (campaign_id) REFERENCES follow_campaigns(id) ON DELETE CASCADE
  );
`);

// ============ نظام التشفير المحسّن ============

/**
 * دالة للحصول على مفتاح التشفير بشكل آمن
 * تضمن أن المفتاح ثابت ولا يتغير عند إعادة تشغيل السيرفر
 */
function getEncryptionKey(): string {
  const envPath = path.join(process.cwd(), '.env.local');
  
  // 1. التحقق من وجود المفتاح في .env.local
  if (process.env.COOKIE_ENCRYPTION_KEY) {
    console.log('✅ Using COOKIE_ENCRYPTION_KEY from .env.local');
    return process.env.COOKIE_ENCRYPTION_KEY;
  }
  
  // 2. إذا لم يكن موجوداً، توليد مفتاح جديد وحفظه
  console.warn('⚠️  COOKIE_ENCRYPTION_KEY not found in .env.local');
  console.log('🔑 Generating new encryption key...');
  
  const newKey = crypto.randomBytes(32).toString('hex');
  
  try {
    // قراءة محتوى .env.local الحالي
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // إضافة المفتاح الجديد
    if (!envContent.includes('COOKIE_ENCRYPTION_KEY')) {
      const newLine = envContent.endsWith('\n') ? '' : '\n';
      envContent += `${newLine}COOKIE_ENCRYPTION_KEY=${newKey}\n`;
      
      fs.writeFileSync(envPath, envContent, 'utf8');
      console.log('✅ COOKIE_ENCRYPTION_KEY saved to .env.local');
      console.log('⚠️  IMPORTANT: Backup your .env.local file!');
    }
  } catch (error) {
    console.error('❌ Failed to save encryption key to .env.local:', error);
    console.error('⚠️  WARNING: Encryption key will change on server restart!');
    console.error('⚠️  Please manually add this to .env.local:');
    console.error(`COOKIE_ENCRYPTION_KEY=${newKey}`);
  }
  
  return newKey;
}

// الحصول على مفتاح التشفير الثابت
const ENCRYPTION_KEY = getEncryptionKey();
const key = Buffer.from(ENCRYPTION_KEY, 'hex');

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(text: string): string {
    try {
        const parts = text.split(':');
        if (parts.length !== 2) {
            throw new Error('Invalid encrypted data format');
        }
        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = parts[1];
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('❌ Decryption error:', error);
        console.error('⚠️  This usually happens when:');
        console.error('   1. COOKIE_ENCRYPTION_KEY changed in .env.local');
        console.error('   2. Database was created with a different encryption key');
        console.error('   3. Encrypted data is corrupted');
        console.error('');
        console.error('💡 Solution: Run "npm run reset-db" to reset the database');
        console.error('   (You will need to re-add your Twitter accounts)');
        throw new Error('Failed to decrypt data. The encryption key may have changed. Please re-add your accounts.');
    }
}

export default db;
