/**
 * Migration Script - SQLite to PostgreSQL
 * 
 * هذا السكريبت يقوم بإنشاء جميع الجداول في PostgreSQL
 * يتم تشغيله تلقائياً عند أول deployment على Railway
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function migrate() {
  console.log('🔄 Starting database migration...');
  
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created users table');

    // Create accounts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        username VARCHAR(255) NOT NULL,
        handle VARCHAR(255) NOT NULL,
        avatar TEXT,
        encrypted_cookies TEXT NOT NULL,
        is_valid BOOLEAN DEFAULT true,
        last_validated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created accounts table');

    // Create campaigns table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        target_source VARCHAR(50) NOT NULL,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created campaigns table');

    // Create targets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS targets (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        avatar TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        retry_count INTEGER DEFAULT 0,
        last_attempt_at TIMESTAMP,
        sent_at TIMESTAMP,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created targets table');

    // Create follow_campaigns table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS follow_campaigns (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        target_source VARCHAR(50) NOT NULL,
        tags TEXT,
        pacing_per_minute INTEGER DEFAULT 3,
        pacing_delay_min INTEGER DEFAULT 15,
        pacing_delay_max INTEGER DEFAULT 30,
        pacing_daily_cap INTEGER DEFAULT 50,
        pacing_retry_attempts INTEGER DEFAULT 2,
        stats_total INTEGER DEFAULT 0,
        stats_followed INTEGER DEFAULT 0,
        stats_failed INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created follow_campaigns table');

    // Create follow_targets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS follow_targets (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER NOT NULL REFERENCES follow_campaigns(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        avatar TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        retry_count INTEGER DEFAULT 0,
        last_attempt_at TIMESTAMP,
        followed_at TIMESTAMP,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created follow_targets table');

    // Create indexes
    console.log('🔄 Creating indexes...');
    
    await pool.query('CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_targets_campaign_id ON targets(campaign_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_targets_status ON targets(status);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_follow_campaigns_user_id ON follow_campaigns(user_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_follow_campaigns_status ON follow_campaigns(status);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_follow_targets_campaign_id ON follow_targets(campaign_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_follow_targets_status ON follow_targets(status);');
    
    console.log('✅ Created all indexes');

    console.log('');
    console.log('🎉 Migration completed successfully!');
    console.log('✅ All tables and indexes created');
    console.log('');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
