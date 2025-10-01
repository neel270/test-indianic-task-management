import { FileText, Plus } from 'lucide-react';
import React from 'react';
import { Button } from '../../../../components/ui/button';
import {
  Card,
  CardContent,
} from '../../../../components/ui/card';

interface EmptyStateProps {
  hasFilters: boolean;
  onCreateTask?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ hasFilters, onCreateTask }) => {
  return (
    <Card>
      <CardContent className='text-center py-12'>
        <FileText className='h-12 w-12 mx-auto mb-4 text-gray-400' />
        <h3 className='text-lg font-medium text-gray-900 mb-2'>No tasks found</h3>
        <p className='text-gray-500 mb-4'>
          {hasFilters
            ? 'No tasks match your current filters'
            : 'Get started by creating your first task'}
        </p>
        {onCreateTask && (
          <Button onClick={onCreateTask}>
            <Plus className='h-4 w-4 mr-2' />
            Create Your First Task
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
