import React from 'react';
import { Loader2, Save } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

interface TaskFormActionsProps {
  isEditMode: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
}

export const TaskFormActions: React.FC<TaskFormActionsProps> = ({
  isEditMode,
  isLoading,
  isSubmitting,
  onCancel,
}) => {
  return (
    <div className='flex justify-end space-x-4 pt-4'>
      <Button type='button' variant='outline' onClick={onCancel} disabled={isLoading}>
        Cancel
      </Button>
      <Button type='submit' disabled={isLoading || isSubmitting}>
        {isLoading || isSubmitting ? (
          <>
            <Loader2 className='w-4 h-4 animate-spin mr-2' />
            {isEditMode ? 'Updating...' : 'Creating...'}
          </>
        ) : (
          <>
            <Save className='w-4 h-4 mr-2' />
            {isEditMode ? 'Update Task' : 'Create Task'}
          </>
        )}
      </Button>
    </div>
  );
};
