import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Badge } from './badge';
import { Download, Eye } from 'lucide-react';
import { getFileTypeInfo, isImageFile } from '@/lib/fileUtils';

interface AttachmentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachments: string[];
  taskTitle: string;
  userId: string;
  taskId: string;
}

export const AttachmentPreviewModal: React.FC<AttachmentPreviewModalProps> = ({
  isOpen,
  onClose,
  attachments,
  taskTitle,
  userId,
  taskId,
}) => {
  const getAttachmentUrl = (attachment: string) => {
    // If it's already a full URL, return as is
    if (attachment.startsWith('http://') || attachment.startsWith('https://')) {
      return attachment;
    }
    // Otherwise, construct the URL for serving the file
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    const apiPrefix = '/api';
    return `${baseUrl}${apiPrefix}/tasks/attachments/${userId}/${taskId}/${attachment}`;
  };

  const handleDownload = (attachment: string) => {
    const url = getAttachmentUrl(attachment);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = attachment;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[80vh] overflow-hidden'>
        <DialogHeader>
          <DialogTitle className='flex items-center justify-between'>
            <span>Attachments - {taskTitle}</span>
          </DialogTitle>
        </DialogHeader>

        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 max-h-[60vh] overflow-y-auto'>
          {attachments.map((attachment, index) => {
            const fileInfo = getFileTypeInfo(attachment);
            const isImage = isImageFile(attachment);

            return (
              <div key={index} className='border rounded-lg p-3 hover:shadow-md transition-shadow'>
                <div className='aspect-square mb-3 bg-gray-100 rounded flex items-center justify-center overflow-hidden'>
                  {isImage ? (
                    <img
                      src={getAttachmentUrl(attachment)}
                      alt={attachment}
                      className='w-full h-full object-cover cursor-pointer'
                      onClick={() => window.open(getAttachmentUrl(attachment), '_blank')}
                    />
                  ) : (
                    <div className='text-center'>
                      <fileInfo.icon className={`h-12 w-12 mx-auto ${fileInfo.color}`} />
                      <Badge variant='outline' className='mt-2 text-xs'>
                        {fileInfo.label}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className='space-y-2'>
                  <p className='text-sm font-medium text-gray-900 truncate' title={attachment}>
                    {attachment}
                  </p>

                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='flex-1'
                      onClick={() => window.open(getAttachmentUrl(attachment), '_blank')}
                    >
                      <Eye className='h-3 w-3 mr-1' />
                      View
                    </Button>
                    <Button variant='outline' size='sm' onClick={() => handleDownload(attachment)}>
                      <Download className='h-3 w-3' />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {attachments.length === 0 && (
          <div className='text-center py-8 text-gray-500'>No attachments found</div>
        )}
      </DialogContent>
    </Dialog>
  );
};
