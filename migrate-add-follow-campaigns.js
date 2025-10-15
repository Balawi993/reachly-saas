const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'reachly.db');
const db = new Database(dbPath);

console.log('🔄 Adding Follow Campaigns tables...');

try {
  // التحقق من وجود الجداول
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  const tableNames = tables.map(t => t.name);
  
  if (tableNames.includes('follow_campaigns') && tableNames.includes('follow_targets')) {
    console.log('✅ Follow Campaigns tables already exist. No migration needed.');
    process.exit(0);
  }
  
  // إنشاء الجداول
  console.log('Creating follow_campaigns table...');
  db.exec(`
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
  `);
  console.log('✅ Created follow_campaigns table');
  
  console.log('Creating follow_targets table...');
  db.exec(`
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
  console.log('✅ Created follow_targets table');
  
  console.log('\n✨ Migration completed successfully!');
  console.log('\nYou can now:');
  console.log('1. Restart your server: npm run server');
  console.log('2. Create follow campaigns from the UI');
  
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  db.close();
}
