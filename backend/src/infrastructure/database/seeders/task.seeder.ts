import { mongoConnection } from '../mongodb';
import { TaskSchema } from '../schemas/task.schema';
import { UserSchema } from '../schemas/user.schema';

export interface TaskSeedData {
  title: string;
  description: string;
  status: 'Pending' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  tags: string[];
  dueDate: Date;
}

export class TaskSeeder {
  private static taskTemplates: Omit<TaskSeedData, 'dueDate'>[] = [
    // High Priority Tasks
    {
      title: 'Fix critical production bug in payment system',
      description:
        'Users are unable to complete payments due to a critical bug in the payment processing module. This is causing revenue loss and customer dissatisfaction.',
      status: 'Pending',
      priority: 'High',
      tags: ['bug', 'critical', 'payment', 'production'],
    },
    {
      title: 'Deploy security patch for authentication system',
      description:
        'Security vulnerability found in authentication middleware. Immediate deployment required to prevent potential security breaches.',
      status: 'Pending',
      priority: 'High',
      tags: ['security', 'authentication', 'deployment', 'urgent'],
    },
    {
      title: 'Database performance optimization',
      description:
        'Slow query performance is affecting user experience. Need to optimize database indexes and queries for better response times.',
      status: 'Pending',
      priority: 'High',
      tags: ['database', 'performance', 'optimization', 'backend'],
    },

    // Medium Priority Tasks
    {
      title: 'Update user interface for dashboard',
      description:
        'Redesign the main dashboard interface to improve user experience and add new analytics widgets.',
      status: 'Pending',
      priority: 'Medium',
      tags: ['ui', 'dashboard', 'frontend', 'design'],
    },
    {
      title: 'Implement email notification system',
      description:
        'Set up automated email notifications for task updates, deadlines, and system alerts.',
      status: 'Pending',
      priority: 'Medium',
      tags: ['email', 'notifications', 'automation', 'backend'],
    },
    {
      title: 'Write unit tests for user service',
      description:
        'Create comprehensive unit tests for the user service layer to ensure code reliability and maintainability.',
      status: 'Pending',
      priority: 'Medium',
      tags: ['testing', 'unit-tests', 'backend', 'quality'],
    },
    {
      title: 'Setup CI/CD pipeline',
      description:
        'Configure continuous integration and deployment pipeline for automated testing and deployment.',
      status: 'Pending',
      priority: 'Medium',
      tags: ['devops', 'ci-cd', 'automation', 'deployment'],
    },

    // Low Priority Tasks
    {
      title: 'Update documentation for API endpoints',
      description:
        'Review and update API documentation to reflect recent changes and improvements.',
      status: 'Pending',
      priority: 'Low',
      tags: ['documentation', 'api', 'backend', 'maintenance'],
    },
    {
      title: 'Clean up unused dependencies',
      description: 'Remove unused npm packages and clean up package.json to reduce bundle size.',
      status: 'Pending',
      priority: 'Low',
      tags: ['maintenance', 'cleanup', 'dependencies', 'optimization'],
    },
    {
      title: 'Setup monitoring and logging',
      description: 'Implement application monitoring and logging system for better observability.',
      status: 'Pending',
      priority: 'Low',
      tags: ['monitoring', 'logging', 'observability', 'backend'],
    },

    // Completed Tasks
    {
      title: 'Set up project structure',
      description: 'Initialize the project with proper folder structure and configuration files.',
      status: 'Completed',
      priority: 'High',
      tags: ['setup', 'project-structure', 'configuration'],
    },
    {
      title: 'Implement user authentication',
      description: 'Create user registration, login, and password reset functionality.',
      status: 'Completed',
      priority: 'High',
      tags: ['authentication', 'security', 'backend', 'frontend'],
    },
    {
      title: 'Create task management API',
      description: 'Build REST API endpoints for creating, reading, updating, and deleting tasks.',
      status: 'Completed',
      priority: 'High',
      tags: ['api', 'tasks', 'backend', 'crud'],
    },
    {
      title: 'Design responsive layout',
      description: 'Create responsive web layout that works on desktop and mobile devices.',
      status: 'Completed',
      priority: 'Medium',
      tags: ['ui', 'responsive', 'frontend', 'design'],
    },
    {
      title: 'Add dark mode support',
      description: 'Implement dark/light theme toggle functionality for better user experience.',
      status: 'Completed',
      priority: 'Medium',
      tags: ['ui', 'theme', 'frontend', 'accessibility'],
    },
  ];

  private static additionalTasks: string[] = [
    'Review code for code smells and refactoring opportunities',
    'Optimize images for web performance',
    'Set up error tracking and reporting',
    'Create user feedback collection system',
    'Implement data backup strategy',
    'Update privacy policy and terms of service',
    'Create admin panel for user management',
    'Implement search functionality',
    'Add pagination to task lists',
    'Create data export functionality',
    'Set up automated testing for critical paths',
    'Implement rate limiting for API endpoints',
    'Create user activity dashboard',
    'Add file upload functionality',
    'Implement real-time notifications',
    'Create API versioning strategy',
    'Set up database migration system',
    'Implement caching layer',
    'Create performance monitoring dashboard',
    'Add internationalization support',
    'Implement audit logging',
    'Create system health check endpoint',
    'Set up automated dependency updates',
    'Create disaster recovery plan',
    'Implement content security policy',
    'Add keyboard navigation support',
    'Create progressive web app features',
    'Implement lazy loading for better performance',
    'Create user onboarding flow',
    'Add social media login options',
    'Implement two-factor authentication',
    'Create advanced filtering options',
    'Add bulk operations for tasks',
    'Implement task templates',
    'Create time tracking functionality',
    'Add recurring task support',
    'Implement task dependencies',
    'Create team collaboration features',
    'Add task comments and discussions',
    'Implement file attachment system',
    'Create task history and audit trail',
    'Add task priority matrix',
    'Implement kanban board view',
    'Create calendar integration',
    'Add email integration',
    'Implement push notifications',
    'Create mobile app API',
    'Add voice command support',
    'Implement AI-powered task suggestions',
    'Create advanced reporting dashboard',
    'Add data visualization components',
    'Implement real-time collaboration',
    'Create video conferencing integration',
    'Add screen sharing capabilities',
    'Implement virtual whiteboard',
    'Create mind mapping tool',
    'Add note-taking functionality',
    'Implement bookmark management',
    'Create knowledge base system',
    'Add FAQ management',
    'Implement help desk system',
    'Create ticketing system',
    'Add customer support chat',
    'Implement survey and feedback system',
    'Create newsletter management',
    'Add event management system',
    'Implement appointment scheduling',
    'Create resource booking system',
    'Add inventory management',
    'Implement order processing',
    'Create payment gateway integration',
    'Add subscription management',
    'Implement affiliate system',
    'Create referral program',
    'Add loyalty rewards system',
    'Implement gamification features',
    'Create achievement system',
    'Add badge and certificate system',
    'Implement social features',
    'Create community forum',
    'Add messaging system',
    'Implement friend system',
    'Create group functionality',
    'Add event calendar',
    'Implement weather integration',
    'Create news feed',
    'Add stock market integration',
    'Implement cryptocurrency tracking',
    'Create fitness tracking',
    'Add habit tracking',
    'Implement goal setting',
    'Create project management',
    'Add time management',
    'Implement productivity tools',
  ];

  public static async seed(): Promise<void> {
    try {
      await mongoConnection.connect();
      console.log('🌱 Starting task seeding...');

      // Get all users to assign tasks to
      const users = await UserSchema.find({ role: 'user' }).select('_id').exec();
      if (users.length === 0) {
        console.log('⚠️  No users found. Please run admin user seeder first.');
        return;
      }

      const tasksToCreate: TaskSeedData[] = [];
      const now = new Date();

      // Create tasks from templates (multiply by 3 to get more variety)
      for (let i = 0; i < 3; i++) {
        for (const template of this.taskTemplates) {
          const dueDate = new Date(now.getTime() + (Math.random() * 30 + 1) * 24 * 60 * 60 * 1000); // 1-30 days from now

          tasksToCreate.push({
            ...template,
            dueDate,
          });
        }
      }

      // Create additional tasks from the additional tasks array
      for (let i = 0; i < 50 && i < this.additionalTasks.length; i++) {
        const randomPriority = ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as
          | 'Low'
          | 'Medium'
          | 'High';
        const randomStatus = Math.random() > 0.7 ? 'Completed' : 'Pending';
        const dueDate = new Date(now.getTime() + (Math.random() * 60 + 1) * 24 * 60 * 60 * 1000); // 1-60 days from now

        tasksToCreate.push({
          title: this.additionalTasks[i],
          description: `Detailed implementation for: ${this.additionalTasks[i].toLowerCase()}`,
          status: randomStatus,
          priority: randomPriority,
          tags: ['additional', 'feature', 'enhancement'],
          dueDate,
        });
      }

      console.log(`📝 Creating ${tasksToCreate.length} tasks...`);

      for (const taskData of tasksToCreate) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomAssignedTo = users[Math.floor(Math.random() * users.length)];

        const existingTask = await TaskSchema.findOne({
          title: taskData.title,
          userId: randomUser._id,
        });

        if (existingTask) {
          console.log(`⚠️  Task already exists: ${taskData.title}`);
          continue;
        }

        const task = new TaskSchema({
          ...taskData,
          userId: randomUser._id,
          assignedTo: randomAssignedTo._id,
        });

        await task.save();
      }

      console.log(`🎉 Task seeding completed! Created ${tasksToCreate.length} tasks`);
    } catch (error) {
      console.error('❌ Error seeding tasks:', error);
      throw error;
    }
  }

  public static async clear(): Promise<void> {
    try {
      await mongoConnection.connect();
      console.log('🗑️  Clearing all tasks...');

      const result = await TaskSchema.deleteMany({});
      console.log(`🗑️  Cleared ${result.deletedCount} tasks`);
    } catch (error) {
      console.error('❌ Error clearing tasks:', error);
      throw error;
    }
  }
}
