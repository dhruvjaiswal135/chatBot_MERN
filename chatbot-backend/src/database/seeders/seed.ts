#!/usr/bin/env node

import {DatabaseSeeder} from './index';

async function main() {
    const args = process.argv.slice(2);
    const seeder = new DatabaseSeeder();

    try {
        if (args.length === 0) {
            // Run all seeders
            await seeder.run();
        } else if (args[0] === '--help' || args[0] === '-h') {
            console.log(`
🌱 Database Seeder CLI

Usage:
  npm run seed                    # Run all seeders
  npm run seed:role              # Run only role seeder
  npm run seed:user              # Run only user seeder

Available seeders:
  - RoleSeeder: Creates roles (Super Admin, Admin, User)
  - UserSeeder: Creates super admin user
      `);
        } else {
            // Run specific seeder
            const seederName = args[0];
            await seeder.runSeeder(seederName);
        }
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

main(); 