import * as dotenv from 'dotenv';
import path from 'path';

// Load .env file from the project root (../)
dotenv.config({ path: path.resolve(import.meta.dirname, '..', '.env') });
// ------------------------------------

/**
 * Database Initialization Script for Truehost Deployment
 * 
 * This script:
 * 1. Tests database connectivity
 * 2. Creates necessary tables
 * 3. Creates the admin user
 * 4. Verifies the setup
 * 
 * Run this script after deploying to Truehost:
 * npx tsx scripts/init-db.ts
 */

import { testDatabaseConnection, pool } from '../server/db';
import { storage } from '../server/storage';

async function initializeDatabase() {
  console.log('🚀 Starting database initialization...\n');

  try {
    // Step 1: Test database connection
    console.log('Step 1: Testing database connection...');
    await testDatabaseConnection();
    console.log('');

    // Step 2: Push database schema
    console.log('Step 2: Database schema should be created using:');
    console.log('   npm run db:push');
    console.log('   (Run this command if you haven\'t already)');
    console.log('');

    // Step 3: Create admin user
    console.log('Step 3: Creating admin user...');
    try {
      const existingAdmin = await storage.getUserByUsername('admin');
      if (existingAdmin) {
        console.log('✅ Admin user already exists');
        console.log('   Username: admin');
        console.log('   ID:', existingAdmin.id);
      } else {
        const newAdmin = await storage.createUser({
          username: 'admin',
          password: 'pmbeki'
        });
        console.log('✅ Admin user created successfully');
        console.log('   Username: admin');
        console.log('   Password: pmbeki');
        console.log('   ID:', newAdmin.id);
      }
    } catch (error: any) {
      if (error.code === '42P01') {
        console.log('❌ Tables do not exist yet. Please run:');
        console.log('   npm run db:push');
        console.log('   Then run this script again.');
      } else {
        throw error;
      }
    }
    console.log('');

    // Step 4: Verify setup
    console.log('Step 4: Verifying setup...');
    const adminUser = await storage.getUserByUsername('admin');
    if (adminUser) {
      console.log('✅ Admin user verification successful');
      console.log('');
      console.log('🎉 Database initialization complete!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Start your application: npm start');
      console.log('2. Login with credentials:');
      console.log('   Username: admin');
      console.log('   Password: pmbeki');
    } else {
      console.log('❌ Admin user verification failed');
      console.log('Please check the errors above and try again.');
    }

  } catch (error) {
    console.error('\n❌ Database initialization failed:');
    console.error(error);
    console.error('\nTroubleshooting:');
    console.error('1. Check that DATABASE_URL is set correctly in .env');
    console.error('2. Verify PostgreSQL is running');
    console.error('3. Ensure database user has proper permissions');
    console.error('4. Check PostgreSQL version (13+ required)');
    process.exit(1);
  } finally {
    // Close database connection
    await pool.end();
  }
}

// Run initialization
initializeDatabase();
