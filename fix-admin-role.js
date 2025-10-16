// Script to fix admin user role
// Run with: node fix-admin-role.js

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixAdminRole() {
  try {
    console.log('🔄 Connecting to database...');
    
    // Check current admin user
    const adminEmail = 'admin@reachly.com';
    const checkResult = await pool.query(`SELECT id, email, role FROM users WHERE email = $1`, [adminEmail]);
    
    if (checkResult.rows.length === 0) {
      console.log('❌ Admin user not found!');
      console.log('Run: npm run create-admin');
      process.exit(1);
    }
    
    const admin = checkResult.rows[0];
    console.log('📧 Admin user found:');
    console.log('   ID:', admin.id);
    console.log('   Email:', admin.email);
    console.log('   Current Role:', admin.role || 'NULL');
    
    if (admin.role === 'admin') {
      console.log('✅ Admin role is already correct!');
      process.exit(0);
    }
    
    console.log('🔄 Updating admin role...');
    
    // Update role to admin
    await pool.query(`
      UPDATE users 
      SET role = 'admin' 
      WHERE email = $1
    `, [adminEmail]);
    
    console.log('✅ Admin role updated successfully!');
    console.log('');
    console.log('🎉 You can now login as admin:');
    console.log('📧 Email: admin@reachly.com');
    console.log('🔑 Password: Balawi123');
    console.log('');
    console.log('⚠️  IMPORTANT: Logout and login again to get new token with admin role!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing admin role:', error);
    process.exit(1);
  }
}

fixAdminRole();
