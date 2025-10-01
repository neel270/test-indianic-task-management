import { mongoConnection } from '../mongodb';
import { UserSchema } from '../schemas/user.schema';

export interface AdminUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin';
  isActive: boolean;
  profileImage?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  otp?: string;
  otpExpires?: Date;
}

export class AdminUserSeeder {
  private static adminUsers: AdminUserData[] = [
    {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@taskmanager.com',
      password: 'Admin@123456',
      role: 'admin',
      isActive: true,
    },
    {
      firstName: 'System',
      lastName: 'Administrator',
      email: 'sysadmin@taskmanager.com',
      password: 'SysAdmin@123',
      role: 'admin',
      isActive: true,
    },
    {
      firstName: 'Task',
      lastName: 'Manager',
      email: 'manager@taskmanager.com',
      password: 'Manager@123',
      role: 'admin',
      isActive: true,
    },
  ];

  public static async seed(): Promise<void> {
    try {
      await mongoConnection.connect();
      console.log('🌱 Starting admin user seeding...');

      for (const adminData of this.adminUsers) {
        const existingAdmin = await UserSchema.findOne({ email: adminData.email });

        if (existingAdmin) {
          console.log(`⚠️  Admin user already exists: ${adminData.email}`);
          continue;
        }

        const adminUser = new UserSchema(adminData);
        await adminUser.save();

        console.log(
          `✅ Admin user created: ${adminData.firstName} ${adminData.lastName} (${adminData.email})`
        );
      }

      console.log('🎉 Admin user seeding completed successfully!');
    } catch (error) {
      console.error('❌ Error seeding admin users:', error);
      throw error;
    }
  }

  public static async clear(): Promise<void> {
    try {
      await mongoConnection.connect();
      console.log('🗑️  Clearing admin users...');

      const result = await UserSchema.deleteMany({
        email: { $in: this.adminUsers.map(user => user.email) },
      });

      console.log(`🗑️  Cleared ${result.deletedCount} admin users`);
    } catch (error) {
      console.error('❌ Error clearing admin users:', error);
      throw error;
    }
  }
}
