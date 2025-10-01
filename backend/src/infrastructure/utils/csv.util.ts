import * as fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';
import * as path from 'path';

export interface CSVExportOptions {
  fields?: string[];
  delimiter?: string;
  includeHeaders?: boolean;
  quote?: string;
}

export interface TaskCSVData {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  userName?: string;
  userEmail?: string;
  tags?: string[];
  attachments?: string[];
}

export interface UserCSVData {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: string;
  createdAt: string;
  profileImage?: string;
}

export class CSVUtil {
  /**
   * Export tasks data to CSV
   */
  static async exportTasksToCSV(
    tasks: TaskCSVData[],
    filePath: string,
    options: CSVExportOptions = {}
  ): Promise<string> {
    try {
      const {
        fields = [
          'id',
          'title',
          'description',
          'status',
          'priority',
          'dueDate',
          'createdAt',
          'completedAt',
          'userName',
          'userEmail',
          'tags',
        ],
        delimiter = ',',
      } = options;

      // Create output directory if it doesn't exist
      const outputDir = path.dirname(filePath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Define CSV headers based on fields
      const headers = fields.map(field => ({
        id: field,
        title: field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1'),
      }));

      // Transform data for CSV export
      const csvData = tasks.map(task => {
        const row: any = {};
        fields.forEach(field => {
          switch (field) {
            case 'tags':
              row[field] = task.tags ? task.tags.join('; ') : '';
              break;
            case 'attachments':
              row[field] = task.attachments ? task.attachments.join('; ') : '';
              break;
            default:
              row[field] = (task as any)[field] || '';
          }
        });
        return row;
      });

      // Create CSV writer
      const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: headers,
        fieldDelimiter: delimiter,
      });

      // Write CSV file
      await csvWriter.writeRecords(csvData);

      return filePath;
    } catch (error) {
      throw new Error(
        `CSV export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Export users data to CSV
   */
  static async exportUsersToCSV(
    users: UserCSVData[],
    filePath: string,
    options: CSVExportOptions = {}
  ): Promise<string> {
    try {
      const {
        fields = ['id', 'name', 'email', 'role', 'isActive', 'createdAt', 'profileImage'],
        delimiter = ',',
      } = options;

      // Create output directory if it doesn't exist
      const outputDir = path.dirname(filePath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Define CSV headers based on fields
      const headers = fields.map(field => ({
        id: field,
        title: field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1'),
      }));

      // Transform data for CSV export
      const csvData = users.map(user => {
        const row: any = {};
        fields.forEach(field => {
          switch (field) {
            case 'isActive':
              row[field] = user.isActive === 'true' ? 'Yes' : 'No';
              break;
            case 'role':
              row[field] = user.role.toUpperCase();
              break;
            default:
              row[field] = (user as any)[field] || '';
          }
        });
        return row;
      });

      // Create CSV writer
      const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: headers,
        fieldDelimiter: delimiter,
      });

      // Write CSV file
      await csvWriter.writeRecords(csvData);

      return filePath;
    } catch (error) {
      throw new Error(
        `CSV export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate CSV filename with timestamp
   */
  static generateCSVFilename(prefix: string, extension: string = 'csv'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${prefix}_${timestamp}.${extension}`;
  }

  /**
   * Validate CSV file
   */
  static validateCSVFile(filePath: string): boolean {
    try {
      if (!fs.existsSync(filePath)) {
        return false;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      return content.length > 0 && content.includes(',');
    } catch {
      return false;
    }
  }

  /**
   * Get CSV file size
   */
  static getCSVFileSize(filePath: string): number {
    try {
      if (!fs.existsSync(filePath)) {
        return 0;
      }

      const stats = fs.statSync(filePath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  /**
   * Delete CSV file
   */
  static async deleteCSVFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(filePath)) {
        return resolve();
      }

      fs.unlink(filePath, error => {
        if (error) {
          reject(new Error(`Failed to delete CSV file: ${error.message}`));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Convert JSON to CSV string
   */
  static async jsonToCSV(
    data: any[],
    fields?: string[],
    options: CSVExportOptions = {}
  ): Promise<string> {
    try {
      const { delimiter = ',' } = options;

      // Create temporary file path
      const tempFilePath = `/tmp/csv_export_${Date.now()}.csv`;

      // Define CSV headers based on fields
      const headers = (fields || []).map(field => ({
        id: field,
        title: field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1'),
      }));

      // Create CSV writer
      const csvWriter = createObjectCsvWriter({
        path: tempFilePath,
        header: headers,
        fieldDelimiter: delimiter,
      });

      // Write CSV file
      await csvWriter.writeRecords(data);

      // Read the file content
      const csvContent = fs.readFileSync(tempFilePath, 'utf8');

      // Clean up temporary file
      fs.unlinkSync(tempFilePath);

      return csvContent;
    } catch (error) {
      throw new Error(
        `JSON to CSV conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get default fields for task export
   */
  static getDefaultTaskFields(): string[] {
    return [
      'id',
      'title',
      'description',
      'status',
      'priority',
      'dueDate',
      'createdAt',
      'completedAt',
      'userName',
      'userEmail',
    ];
  }

  /**
   * Get default fields for user export
   */
  static getDefaultUserFields(): string[] {
    return ['id', 'name', 'email', 'role', 'isActive', 'createdAt'];
  }
}
