import React, { useState, useRef } from 'react';
import { Button } from './button';
import { Progress } from './progress';
import { Badge } from './badge';
import { Upload, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getFileName, getFileTypeInfo, isImageFile } from '@/lib/fileUtils';
import { validURL } from '@/lib/utils';

interface AttachmentUploadProps {
  value: (File | string)[];
  onChange: (files: (File | string)[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string;
}

export const AttachmentUpload: React.FC<AttachmentUploadProps> = ({
  value,
  onChange,
  disabled = false,
  maxFiles = 5,
  maxSize = 10, // 10MB default
  acceptedTypes = '*/*',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File | string): string | null => {
    if (value.length >= maxFiles) {
      return `Maximum ${maxFiles} files allowed`;
    }

    // For File objects, validate size
    if (typeof file !== 'string' && file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    return null;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || disabled) return;

    const newFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        newFiles.push(file);
      }
    });

    if (errors.length > 0) {
      toast({
        title: 'File upload errors',
        description: errors.join('\n'),
        variant: 'destructive',
      });
    }

    if (newFiles.length > 0) {
      onChange([...value, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className='space-y-4'>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : disabled
              ? 'border-gray-200 bg-gray-50'
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type='file'
          multiple
          accept={acceptedTypes}
          onChange={e => handleFiles(e.target.files)}
          disabled={disabled}
          className='hidden'
        />

        <Upload className='mx-auto h-12 w-12 text-gray-400 mb-4' />
        <div className='space-y-2'>
          <p className='text-sm text-gray-600'>
            Drag and drop files here, or{' '}
            <button
              type='button'
              onClick={handleUploadClick}
              disabled={disabled}
              className='text-blue-600 hover:text-blue-500 font-medium disabled:text-gray-400'
            >
              browse
            </button>
          </p>
          <p className='text-xs text-gray-500'>
            Maximum {maxFiles} files, up to {maxSize}MB each
          </p>
        </div>
      </div>

      {/* File List */}
      {value.length > 0 && (
        <div className='space-y-2'>
          <p className='text-sm font-medium text-gray-700'>Attached Files</p>
          <div className='space-y-2'>
            {value.map((file, index) => {
              const fileInfo = getFileTypeInfo(file);
              const isImage = isImageFile(file);
              return (
                <div
                  key={index}
                  className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                >
                  <div className='flex items-center space-x-3'>
                    {isImage ? (
                      <div className='relative'>
                        <img
                          src={typeof file === 'string' ? file : URL.createObjectURL(file)}
                          alt={typeof file === 'string' ? file : file.name}
                          className='h-10 w-10 object-cover rounded'
                        />
                        <div className='absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                          {React.createElement(fileInfo.icon, {
                            className: 'h-3 w-3',
                          })}
                        </div>
                      </div>
                    ) : (
                      React.createElement(fileInfo.icon, { className: 'h-4 w-4' })
                    )}
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-900 truncate'>
                        {typeof file === 'string' ? getFileName(file) : file.name}
                      </p>
                      <div className='flex items-center space-x-2'>
                        <Badge variant='outline' className='text-xs'>
                          {fileInfo.label}
                        </Badge>
                        {typeof file !== 'string' && (
                          <p className='text-xs text-gray-500'>{formatFileSize(file.size)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => removeFile(index)}
                    disabled={disabled}
                    className='text-red-600 hover:text-red-700 hover:bg-red-50'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
