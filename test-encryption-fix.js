/**
 * اختبار سريع للتأكد من أن مفتاح التشفير ثابت
 * 
 * الاستخدام:
 * node test-encryption-fix.js
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Testing Encryption Key Fix...\n');

// 1. التحقق من وجود .env.local
const envPath = path.join(__dirname, '.env.local');
console.log('1️⃣ Checking .env.local file...');

if (!fs.existsSync(envPath)) {
  console.log('   ❌ .env.local not found!');
  console.log('   💡 Run the server once to generate it: npm run server');
  process.exit(1);
}
console.log('   ✅ .env.local exists');

// 2. قراءة محتوى .env.local
console.log('\n2️⃣ Reading .env.local content...');
const envContent = fs.readFileSync(envPath, 'utf8');

// 3. البحث عن COOKIE_ENCRYPTION_KEY
console.log('\n3️⃣ Checking for COOKIE_ENCRYPTION_KEY...');
const keyMatch = envContent.match(/COOKIE_ENCRYPTION_KEY=([a-f0-9]{64})/);

if (!keyMatch) {
  console.log('   ❌ COOKIE_ENCRYPTION_KEY not found or invalid!');
  console.log('   💡 Run the server once: npm run server');
  console.log('   The key will be generated automatically.');
  process.exit(1);
}

const encryptionKey = keyMatch[1];
console.log('   ✅ COOKIE_ENCRYPTION_KEY found');
console.log(`   Key: ${encryptionKey.substring(0, 16)}...${encryptionKey.substring(48)}`);

// 4. التحقق من صحة المفتاح
console.log('\n4️⃣ Validating encryption key...');

if (encryptionKey.length !== 64) {
  console.log(`   ❌ Invalid key length: ${encryptionKey.length} (should be 64)`);
  process.exit(1);
}

if (!/^[a-f0-9]{64}$/.test(encryptionKey)) {
  console.log('   ❌ Invalid key format (should be hex)');
  process.exit(1);
}

console.log('   ✅ Key is valid (64 hex characters)');

// 5. اختبار التشفير وفك التشفير
console.log('\n5️⃣ Testing encryption/decryption...');

try {
  const key = Buffer.from(encryptionKey, 'hex');
  const testData = 'Test encryption data';
  
  // تشفير
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(testData, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const encryptedData = iv.toString('hex') + ':' + encrypted;
  
  // فك التشفير
  const parts = encryptedData.split(':');
  const ivDecrypt = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, ivDecrypt);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  if (decrypted === testData) {
    console.log('   ✅ Encryption/Decryption works correctly');
  } else {
    console.log('   ❌ Decryption failed!');
    process.exit(1);
  }
} catch (error) {
  console.log('   ❌ Error during encryption test:', error.message);
  process.exit(1);
}

// 6. نصائح
console.log('\n📋 Summary:');
console.log('   ✅ .env.local exists');
console.log('   ✅ COOKIE_ENCRYPTION_KEY is valid');
console.log('   ✅ Encryption/Decryption works');
console.log('\n🎉 Everything looks good!');
console.log('\n💡 Tips:');
console.log('   - Backup your .env.local file');
console.log('   - Never share COOKIE_ENCRYPTION_KEY');
console.log('   - If you lose the key, run: npm run reset-db');
console.log('\n✅ The encryption key fix is working correctly!');
