import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addUpdatedAtColumn() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Adding updated_at column to targets table...');
    
    // Add updated_at to targets table
    await client.query(`
      ALTER TABLE targets 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NULL
    `);
    
    console.log('✅ Added updated_at to targets table');
    
    console.log('🔄 Adding updated_at column to follow_targets table...');
    
    // Add updated_at to follow_targets table
    await client.query(`
      ALTER TABLE follow_targets 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NULL
    `);
    
    console.log('✅ Added updated_at to follow_targets table');
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addUpdatedAtColumn().catch(console.error);
