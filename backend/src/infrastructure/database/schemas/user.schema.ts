import bcrypt from 'bcrypt';
import crypto from 'crypto';
import mongoose, { Document, Schema } from 'mongoose';

export interface IUserDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  isActive: boolean;
  profileImage?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  otp?: string;
  otpExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generatePasswordReset(): Promise<string>;
  generateOtp(): Promise<string>;
  clearResetPasswordToken(): void;
  clearOtp(): void;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'user'],
        message: 'Role must be either admin or user',
      },
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profileImage: {
      type: String,
      trim: true,
      maxlength: [500, 'Profile image URL cannot exceed 500 characters'],
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for better performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  const user = this as IUserDocument;

  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Generate password reset token
userSchema.methods.generatePasswordReset = async function (): Promise<string> {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await this.save();
  return resetToken;
};

// Generate OTP
userSchema.methods.generateOtp = async function (): Promise<string> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = await bcrypt.hash(otp, 10);
  this.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  await this.save();
  return otp;
};

// Clear reset password token
userSchema.methods.clearResetPasswordToken = function (): void {
  this.resetPasswordToken = undefined;
  this.resetPasswordExpires = undefined;
};

// Clear OTP
userSchema.methods.clearOtp = function (): void {
  this.otp = undefined;
  this.otpExpires = undefined;
};

export const UserSchema = mongoose.model<IUserDocument>('User', userSchema);
