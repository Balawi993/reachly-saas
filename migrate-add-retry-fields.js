const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'reachly.db');
const db = new Database(dbPath);

console.log('🔄 Migrating database to add retry fields...');

try {
  // التحقق من وجود الحقول
  const tableInfo = db.prepare("PRAGMA table_info(targets)").all();
  const hasRetryCount = tableInfo.some(col => col.name === 'retry_count');
  const hasLastAttempt = tableInfo.some(col => col.name === 'last_attempt_at');
  
  if (hasRetryCount && hasLastAttempt) {
    console.log('✅ Database already has retry fields. No migration needed.');
    process.exit(0);
  }
  
  // إضافة الحقول الجديدة
  if (!hasRetryCount) {
    console.log('Adding retry_count field...');
    db.prepare('ALTER TABLE targets ADD COLUMN retry_count INTEGER DEFAULT 0').run();
    console.log('✅ Added retry_count');
  }
  
  if (!hasLastAttempt) {
    console.log('Adding last_attempt_at field...');
    db.prepare('ALTER TABLE targets ADD COLUMN last_attempt_at DATETIME').run();
    console.log('✅ Added last_attempt_at');
  }
  
  // تحديث السجلات الموجودة
  console.log('Updating existing records...');
  
  // تحديث retry_count للرسائل الفاشلة
  const failedUpdated = db.prepare(`
    UPDATE targets 
    SET retry_count = 1 
    WHERE status = 'failed' AND retry_count = 0
  `).run();
  
  console.log(`✅ Updated ${failedUpdated.changes} failed targets`);
  
  console.log('\n✨ Migration completed successfully!');
  console.log('\nYou can now:');
  console.log('1. Restart your server: npm run server');
  console.log('2. The retry system will work automatically');
  
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  db.close();
}
