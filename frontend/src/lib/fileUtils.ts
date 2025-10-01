import { FileImage, FileText, File, LucideIcon } from 'lucide-react';

export interface FileTypeInfo {
  icon: LucideIcon;
  label: string;
  color: string;
  type: 'image' | 'document' | 'other';
}

export const getFileTypeInfo = (file: File | string): FileTypeInfo => {
  const fileName = typeof file === 'string' ? file : file.name;
  const mimeType = typeof file === 'string' ? '' : file.type;

  // Check by file extension if no mime type available
  const extension = fileName.toLowerCase().split('.').pop();

  if (
    mimeType.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(extension || '')
  ) {
    return {
      icon: FileImage,
      label: 'Image',
      color: 'text-blue-500',
      type: 'image',
    };
  } else if (mimeType === 'application/pdf' || extension === 'pdf') {
    return {
      icon: FileText,
      label: 'PDF',
      color: 'text-red-500',
      type: 'document',
    };
  } else if (
    mimeType.includes('document') ||
    mimeType.includes('word') ||
    ['doc', 'docx', 'txt', 'rtf'].includes(extension || '')
  ) {
    return {
      icon: FileText,
      label: 'Document',
      color: 'text-gray-600',
      type: 'document',
    };
  } else {
    return {
      icon: File,
      label: 'File',
      color: 'text-gray-500',
      type: 'other',
    };
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isImageFile = (file: File | string): boolean => {
  const fileName = typeof file === 'string' ? file : file.name;
  const mimeType = typeof file === 'string' ? '' : file.type;
  const extension = fileName.toLowerCase().split('.').pop();

  return (
    mimeType.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(extension || '')
  );
};
export const getFileName = (filePath: string): string => {
  return filePath.split('/').pop() || filePath;
};

export const getFileExtension = (fileName: string): string => {
  return fileName.toLowerCase().split('.').pop() || '';
};
