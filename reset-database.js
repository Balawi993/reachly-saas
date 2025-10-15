// Script لحذف قاعدة البيانات وإعادة البدء
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'reachly.db');

console.log('🔄 Resetting database...\n');

if (fs.existsSync(dbPath)) {
  try {
    fs.unlinkSync(dbPath);
    console.log('✅ Database deleted successfully!');
    console.log('📁 File:', dbPath);
    console.log('\n📝 Next steps:');
    console.log('1. Run: npm run dev:all');
    console.log('2. Login to the app');
    console.log('3. Re-add your Twitter accounts');
    console.log('\n✨ Done! Your database is now fresh and clean.');
  } catch (error) {
    console.error('❌ Error deleting database:', error.message);
    console.log('\n💡 Try manually:');
    console.log('   Windows: del reachly.db');
    console.log('   Linux/Mac: rm reachly.db');
  }
} else {
  console.log('ℹ️  Database file not found.');
  console.log('📁 Looking for:', dbPath);
  console.log('\n✅ No need to reset - database doesn\'t exist yet.');
  console.log('\n📝 Next steps:');
  console.log('1. Run: npm run dev:all');
  console.log('2. The database will be created automatically');
}
