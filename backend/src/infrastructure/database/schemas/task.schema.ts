import mongoose, { Document, Schema } from 'mongoose';

export interface ITaskDocument extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: 'Pending' | 'Completed';
  dueDate: Date;
  userId: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;
  priority: 'Low' | 'Medium' | 'High';
  tags: string[];
  attachments: string[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  markAsCompleted(): Promise<void>;
  markAsPending(): Promise<void>;
  updateDetails(updates: Partial<Pick<ITaskDocument, 'title' | 'description' | 'dueDate' | 'priority' | 'tags'>>): Promise<void>;
  addAttachment(attachmentUrl: string): Promise<void>;
  removeAttachment(attachmentUrl: string): Promise<void>;
  isOverdue(): boolean;
}

const taskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Completed'],
        message: 'Status must be either Pending or Completed',
      },
      default: 'Pending',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      validate: {
        validator: function (value: Date) {
          return value > new Date();
        },
        message: 'Due date must be in the future',
      },
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: 'Priority must be Low, Medium, or High',
      },
      default: 'Medium',
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags: string[]) {
          return tags.every(tag => tag.length <= 50);
        },
        message: 'Each tag cannot exceed 50 characters',
      },
    },
    attachments: {
      type: [String],
      default: [],
      validate: {
        validator: function (attachments: string[]) {
          return attachments.every(url => url.length <= 500);
        },
        message: 'Each attachment URL cannot exceed 500 characters',
      },
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for better performance
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ tags: 1 });
taskSchema.index({ userId: 1, status: 1 });

// Compound indexes for common queries
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ status: 1, dueDate: 1 });

// Mark task as completed
taskSchema.methods.markAsCompleted = async function (): Promise<void> {
  this.status = 'Completed';
  this.completedAt = new Date();
  await this.save();
};

// Mark task as pending
taskSchema.methods.markAsPending = async function (): Promise<void> {
  this.status = 'Pending';
  this.completedAt = undefined;
  await this.save();
};

// Update task details
taskSchema.methods.updateDetails = async function (
  updates: Partial<Pick<ITaskDocument, 'title' | 'description' | 'dueDate' | 'priority' | 'tags'>>
): Promise<void> {
  Object.assign(this, updates);
  await this.save();
};

// Add attachment
taskSchema.methods.addAttachment = async function (attachmentUrl: string): Promise<void> {
  if (!this.attachments.includes(attachmentUrl)) {
    this.attachments.push(attachmentUrl);
    await this.save();
  }
};

// Remove attachment
taskSchema.methods.removeAttachment = async function (url: string): Promise<void> {
  this.attachments = this.attachments.filter((attachmentUrl: string) => attachmentUrl !== url);
  await this.save();
};

// Check if task is overdue
taskSchema.methods.isOverdue = function (): boolean {
  return this.dueDate < new Date() && this.status !== 'Completed';
};

// Pre-save middleware to update completedAt when status changes to completed
taskSchema.pre('save', function (next) {
  const task = this as ITaskDocument;

  if (task.isModified('status') && task.status === 'Completed' && !task.completedAt) {
    task.completedAt = new Date();
  } else if (task.isModified('status') && task.status === 'Pending') {
    task.completedAt = undefined;
  }

  next();
});

export const TaskSchema = mongoose.model<ITaskDocument>('Task', taskSchema);
