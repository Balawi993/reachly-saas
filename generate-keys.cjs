const crypto = require('crypto');

console.log('\n🔑 المفاتيح السرية المُولّدة:\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n1️⃣ JWT_SECRET:');
console.log(crypto.randomBytes(32).toString('hex'));
console.log('\n2️⃣ COOKIE_ENCRYPTION_KEY:');
console.log(crypto.randomBytes(32).toString('hex'));
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n⚠️  احفظ هذه المفاتيح في مكان آمن!');
console.log('⚠️  ستحتاجها عند الـ deployment على Railway\n');
