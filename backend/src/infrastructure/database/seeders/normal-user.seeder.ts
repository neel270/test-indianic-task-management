import { mongoConnection } from '../mongodb';
import { UserSchema } from '../schemas/user.schema';

export interface NormalUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'user';
  isActive: boolean;
  profileImage?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  otp?: string;
  otpExpires?: Date;
}

export class NormalUserSeeder {
  private static normalUsers: NormalUserData[] = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'User@123456',
      role: 'user',
      isActive: true,
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      password: 'User@123456',
      role: 'user',
      isActive: true,
    },
    {
      firstName: 'Michael',
      lastName: 'Johnson',
      email: 'michael.johnson@example.com',
      password: 'User@123456',
      role: 'user',
      isActive: true,
    },
    {
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@example.com',
      password: 'User@123456',
      role: 'user',
      isActive: true,
    },
    {
      firstName: 'David',
      lastName: 'Wilson',
      email: 'david.wilson@example.com',
      password: 'User@123456',
      role: 'user',
      isActive: true,
    },
    {
      firstName: 'Sarah',
      lastName: 'Brown',
      email: 'sarah.brown@example.com',
      password: 'User@123456',
      role: 'user',
      isActive: true,
    },
    {
      firstName: 'Chris',
      lastName: 'Miller',
      email: 'chris.miller@example.com',
      password: 'User@123456',
      role: 'user',
      isActive: true,
    },
    {
      firstName: 'Amanda',
      lastName: 'Taylor',
      email: 'amanda.taylor@example.com',
      password: 'User@123456',
      role: 'user',
      isActive: true,
    },
    {
      firstName: 'Robert',
      lastName: 'Anderson',
      email: 'robert.anderson@example.com',
      password: 'User@123456',
      role: 'user',
      isActive: true,
    },
    {
      firstName: 'Lisa',
      lastName: 'Thomas',
      email: 'lisa.thomas@example.com',
      password: 'User@123456',
      role: 'user',
      isActive: true,
    },
  ];

  public static async seed(): Promise<void> {
    try {
      await mongoConnection.connect();
      console.log('🌱 Starting normal user seeding...');

      for (const userData of this.normalUsers) {
        const existingUser = await UserSchema.findOne({ email: userData.email });

        if (existingUser) {
          console.log(`⚠️  Normal user already exists: ${userData.email}`);
          continue;
        }

        const normalUser = new UserSchema(userData);
        await normalUser.save();

        console.log(
          `✅ Normal user created: ${userData.firstName} ${userData.lastName} (${userData.email})`
        );
      }

      console.log('🎉 Normal user seeding completed successfully!');
    } catch (error) {
      console.error('❌ Error seeding normal users:', error);
      throw error;
    }
  }

  public static async clear(): Promise<void> {
    try {
      await mongoConnection.connect();
      console.log('🗑️  Clearing normal users...');

      const result = await UserSchema.deleteMany({
        email: { $in: this.normalUsers.map(user => user.email) },
      });

      console.log(`🗑️  Cleared ${result.deletedCount} normal users`);
    } catch (error) {
      console.error('❌ Error clearing normal users:', error);
      throw error;
    }
  }
}
