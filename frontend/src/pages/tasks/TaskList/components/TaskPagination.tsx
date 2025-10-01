import React from 'react';
import { Button } from '../../../../components/ui/button';

interface TaskPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const TaskPagination: React.FC<TaskPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className='flex items-center justify-center space-x-2 mt-6'>
      <Button
        variant='outline'
        size='sm'
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Previous
      </Button>

      <div className='flex items-center space-x-1'>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size='sm'
            onClick={() => onPageChange(page)}
            className='w-8 h-8 p-0'
          >
            {page}
          </Button>
        ))}
      </div>

      <Button
        variant='outline'
        size='sm'
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
      </Button>
    </div>
  );
};
