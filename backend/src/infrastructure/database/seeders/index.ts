import { AdminUserSeeder } from './admin-user.seeder';
import { NormalUserSeeder } from './normal-user.seeder';
import { TaskSeeder } from './task.seeder';

export class DatabaseSeeder {
  public static async seedAll(): Promise<void> {
    try {
      console.log('🚀 Starting database seeding process...\n');

      // Step 1: Seed admin users first (required for tasks)
      console.log('📋 Step 1: Seeding admin users...');
      await AdminUserSeeder.seed();
      console.log('✅ Admin users seeded successfully!\n');

      // Step 2: Seed normal users
      console.log('📋 Step 2: Seeding normal users...');
      await NormalUserSeeder.seed();
      console.log('✅ Normal users seeded successfully!\n');

      // Step 3: Seed tasks
      console.log('📋 Step 3: Seeding tasks...');
      await TaskSeeder.seed();
      console.log('✅ Tasks seeded successfully!\n');

      console.log('🎉 Database seeding completed successfully!');
      console.log('You can now start your application with sample data.');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  public static async clearAll(): Promise<void> {
    try {
      console.log('🗑️  Starting database cleanup process...\n');

      // Clear tasks first (due to foreign key constraints)
      console.log('📋 Step 1: Clearing tasks...');
      await TaskSeeder.clear();
      console.log('✅ Tasks cleared successfully!\n');

      // Clear normal users
      console.log('📋 Step 2: Clearing normal users...');
      await NormalUserSeeder.clear();
      console.log('✅ Normal users cleared successfully!\n');

      // Clear admin users
      console.log('📋 Step 3: Clearing admin users...');
      await AdminUserSeeder.clear();
      console.log('✅ Admin users cleared successfully!\n');

      console.log('🗑️  Database cleanup completed successfully!');
    } catch (error) {
      console.error('❌ Database cleanup failed:', error);
      throw error;
    }
  }

  public static async seedAdminUsers(): Promise<void> {
    try {
      console.log('👥 Seeding admin users...');
      await AdminUserSeeder.seed();
      console.log('✅ Admin users seeded successfully!');
    } catch (error) {
      console.error('❌ Admin user seeding failed:', error);
      throw error;
    }
  }

  public static async seedTasks(): Promise<void> {
    try {
      console.log('📝 Seeding tasks...');
      await TaskSeeder.seed();
      console.log('✅ Tasks seeded successfully!');
    } catch (error) {
      console.error('❌ Task seeding failed:', error);
      throw error;
    }
  }

  public static async seedNormalUsers(): Promise<void> {
    try {
      console.log('👤 Seeding normal users...');
      await NormalUserSeeder.seed();
      console.log('✅ Normal users seeded successfully!');
    } catch (error) {
      console.error('❌ Normal user seeding failed:', error);
      throw error;
    }
  }
}

// CLI interface for running seeders
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'seed':
        await DatabaseSeeder.seedAll();
        break;
      case 'clear':
        await DatabaseSeeder.clearAll();
        break;
      case 'seed:users':
        await DatabaseSeeder.seedAdminUsers();
        break;
      case 'seed:tasks':
        await DatabaseSeeder.seedTasks();
        break;
      case 'seed:normal-users':
        await DatabaseSeeder.seedNormalUsers();
        break;
      default:
        console.log('Usage:');
        console.log('  npm run seed                 - Seed all data');
        console.log('  npm run seed:clear           - Clear all seeded data');
        console.log('  npm run seed:users           - Seed only admin users');
        console.log('  npm run seed:normal-users    - Seed only normal users');
        console.log('  npm run seed:tasks           - Seed only tasks');
        console.log('');
        console.log('Examples:');
        console.log('  npm run seed');
        console.log('  npm run seed:clear');
        console.log('  npm run seed:users');
        console.log('  npm run seed:normal-users');
        console.log('  npm run seed:tasks');
        process.exit(1);
    }
  } catch (error) {
    console.error('Seeding operation failed:', error);
    process.exit(1);
  }
}

// Only run main if this file is executed directly
if (require.main === module) {
  void main();
}
