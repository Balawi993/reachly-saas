// Quick fix script - run with: node fix-now.js
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:MwKuLFnyIdEHEafUNavetKaOSlVLPmRd@tramway.proxy.rlwy.net:19524/railway',
  ssl: { rejectUnauthorized: false }
});

async function fix() {
  try {
    console.log('🔄 Connecting to database...');
    
    // Check current role
    const check = await pool.query(`SELECT id, email, role FROM users WHERE email = 'admin@reachly.com'`);
    
    if (check.rows.length === 0) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }
    
    console.log('📧 Current admin:', check.rows[0]);
    
    // Update role
    await pool.query(`UPDATE users SET role = 'admin' WHERE email = 'admin@reachly.com'`);
    
    // Verify
    const verify = await pool.query(`SELECT id, email, role FROM users WHERE email = 'admin@reachly.com'`);
    console.log('✅ Updated admin:', verify.rows[0]);
    
    console.log('');
    console.log('🎉 Success! Now:');
    console.log('1. Logout from website');
    console.log('2. Login again');
    console.log('3. Admin panel will appear!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fix();
