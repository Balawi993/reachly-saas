// Script to manually create admin user
// Run with: node create-admin.js

import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createAdmin() {
  try {
    console.log('🔄 Connecting to database...');
    
    // Check if admin exists
    const adminEmail = 'admin@reachly.com';
    const checkResult = await pool.query(`SELECT id FROM users WHERE email = $1`, [adminEmail]);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Admin user already exists!');
      console.log('📧 Email: admin@reachly.com');
      console.log('🔑 Password: Balawi123');
      process.exit(0);
    }
    
    console.log('🔄 Creating admin user...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash('Balawi123', 10);
    
    // Create admin user
    const userResult = await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [adminEmail, hashedPassword, 'Admin', 'User', 'admin']);
    
    const adminId = userResult.rows[0].id;
    console.log(`✅ Admin user created with ID: ${adminId}`);
    
    // Get Pro plan ID
    const planResult = await pool.query(`SELECT id FROM subscription_plans WHERE name = 'Pro'`);
    
    if (planResult.rows.length === 0) {
      console.log('⚠️  Pro plan not found. Creating default plans...');
      
      // Create plans
      await pool.query(`
        INSERT INTO subscription_plans (name, price, max_accounts, max_dms_per_month, max_follows_per_month, max_active_dm_campaigns, max_active_follow_campaigns, display_order)
        VALUES 
        ('Free', 0, 1, 100, 50, 1, 1, 1),
        ('Starter', 29, 3, 1000, 500, 5, 3, 2),
        ('Pro', 79, 10, 10000, 5000, 999, 999, 3)
      `);
      
      console.log('✅ Default plans created');
      
      // Get Pro plan again
      const newPlanResult = await pool.query(`SELECT id FROM subscription_plans WHERE name = 'Pro'`);
      var proPlanId = newPlanResult.rows[0].id;
    } else {
      var proPlanId = planResult.rows[0].id;
    }
    
    // Assign Pro plan to admin
    await pool.query(`
      INSERT INTO user_subscriptions (user_id, plan_id, status, period_end)
      VALUES ($1, $2, 'active', NOW() + INTERVAL '365 days')
    `, [adminId, proPlanId]);
    
    console.log('✅ Pro plan assigned to admin');
    console.log('');
    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email: admin@reachly.com');
    console.log('🔑 Password: Balawi123');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
