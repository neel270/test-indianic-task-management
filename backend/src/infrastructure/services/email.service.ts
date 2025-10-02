import nodemailer from 'nodemailer';
import { env } from '../config';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  data?: any;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private templates: Map<string, EmailTemplate> = new Map();

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.emailHost ?? 'smtp.gmail.com',
      port: env.emailPort,
      secure: false,
      auth: {
        user: env.emailUser,
        pass: env.emailPassword,
      },
    });

    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // Task reminder template
    this.templates.set('task-reminder', {
      subject: 'Task Reminder: {{taskTitle}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Task Reminder</h2>
          <p>Hello,</p>
          <p>This is a reminder that your task is due soon:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">{{taskTitle}}</h3>
            <p><strong>Description:</strong> {{taskDescription}}</p>
            <p><strong>Due Date:</strong> {{dueDate}}</p>
            <p><strong>Hours Until Due:</strong> {{hoursUntilDue}}</p>
            <p><strong>Priority:</strong> {{priority}}</p>
          </div>
          <p>
            <a href="{{actionUrl}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Task</a>
          </p>
          <p>Best regards,<br>Task Management System</p>
        </div>
      `,
      text: `Hello,

This is a reminder that your task is due soon:

Task: {{taskTitle}}
Description: {{taskDescription}}
Due Date: {{dueDate}}
Hours Until Due: {{hoursUntilDue}}
Priority: {{priority}}

View Task: {{actionUrl}}

Best regards,
Task Management System`,
    });

    // Task created template
    this.templates.set('task-created', {
      subject: 'New Task Created: {{taskTitle}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Task Created</h2>
          <p>Hello,</p>
          <p>A new task has been created for you:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">{{taskTitle}}</h3>
            <p><strong>Description:</strong> {{taskDescription}}</p>
            <p><strong>Due Date:</strong> {{dueDate}}</p>
            <p><strong>Priority:</strong> {{priority}}</p>
          </div>
          <p>
            <a href="{{actionUrl}}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Task</a>
          </p>
          <p>Best regards,<br>Task Management System</p>
        </div>
      `,
      text: `Hello,

A new task has been created for you:

Task: {{taskTitle}}
Description: {{taskDescription}}
Due Date: {{dueDate}}
Priority: {{priority}}

View Task: {{actionUrl}}

Best regards,
Task Management System`,
    });

    // Task completed template
    this.templates.set('task-completed', {
      subject: 'Task Completed: {{taskTitle}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Task Completed</h2>
          <p>Hello,</p>
          <p>Great news! A task has been marked as completed:</p>
          <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">{{taskTitle}}</h3>
            <p><strong>Description:</strong> {{taskDescription}}</p>
            <p><strong>Completed At:</strong> {{completedAt}}</p>
          </div>
          <p>
            <a href="{{actionUrl}}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Task</a>
          </p>
          <p>Best regards,<br>Task Management System</p>
        </div>
      `,
      text: `Hello,

Great news! A task has been marked as completed:

Task: {{taskTitle}}
Description: {{taskDescription}}
Completed At: {{completedAt}}

View Task: {{actionUrl}}

Best regards,
Task Management System`,
    });
  }

  private replaceTemplateVariables(template: string, data: any): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      let htmlContent = options.html ?? '';
      let textContent = options.text ?? '';
      let subject = options.subject;

      // Use template if specified
      if (options.template && this.templates.has(options.template)) {
        const template = this.templates.get(options.template)!;
        subject = this.replaceTemplateVariables(template.subject, options.data ?? {});

        if (!htmlContent && template.html) {
          htmlContent = this.replaceTemplateVariables(template.html, options.data ?? {});
        }

        if (!textContent && template.text) {
          textContent = this.replaceTemplateVariables(template.text, options.data ?? {});
        }
      }

      const mailOptions = {
        from: env.emailFrom ?? env.emailUser,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject,
        html: htmlContent,
        text: textContent,
      };

      const result = await this.transporter.sendMail(mailOptions);

      console.log('Email sent successfully:', result.messageId);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error(
        `Email sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async sendTaskReminderEmail(taskData: any, hoursUntilDue: number): Promise<void> {
    const data = {
      taskTitle: taskData.title,
      taskDescription: taskData.description,
      dueDate: new Date(taskData.dueDate).toLocaleDateString(),
      hoursUntilDue,
      priority: taskData.priority ?? 'Medium',
      actionUrl: `${env.frontendUrl ?? 'http://localhost:3000'}/tasks/${taskData.id}`,
    };

    const emailData = {
      to: taskData.userEmail ?? 'user@example.com',
      subject: this.replaceTemplateVariables('Task Reminder: {{taskTitle}}', data),
      template: 'task-reminder',
      data,
    };

    await this.sendEmail(emailData);
  }

  async sendTaskCreatedEmail(taskData: any): Promise<void> {
    const data = {
      taskTitle: taskData.title,
      taskDescription: taskData.description,
      dueDate: new Date(taskData.dueDate).toLocaleDateString(),
      priority: taskData.priority ?? 'Medium',
      actionUrl: `${env.frontendUrl ?? 'http://localhost:3000'}/tasks/${taskData.id}`,
    };

    const emailData = {
      to: taskData.userEmail ?? 'user@example.com',
      subject: this.replaceTemplateVariables('New Task Created: {{taskTitle}}', data),
      template: 'task-created',
      data,
    };

    await this.sendEmail(emailData);
  }

  async sendTaskCompletedEmail(taskData: any): Promise<void> {
    const data = {
      taskTitle: taskData.title,
      taskDescription: taskData.description,
      completedAt: new Date().toLocaleDateString(),
      actionUrl: `${env.frontendUrl ?? 'http://localhost:3000'}/tasks/${taskData.id}`,
    };

    const emailData = {
      to: taskData.userEmail ?? 'user@example.com',
      subject: this.replaceTemplateVariables('Task Completed: {{taskTitle}}', data),
      template: 'task-completed',
      data,
    };

    await this.sendEmail(emailData);
  }

  // Method to test email configuration
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email service connection test failed:', error);
      return false;
    }
  }
}
