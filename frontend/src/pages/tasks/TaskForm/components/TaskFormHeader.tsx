import React from 'react';
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';

interface TaskFormHeaderProps {
  isEditMode: boolean;
}

export const TaskFormHeader: React.FC<TaskFormHeaderProps> = ({
  isEditMode,
}) => {
  return (
    <CardHeader>
      <CardTitle>{isEditMode ? 'Edit Task' : 'Create New Task'}</CardTitle>
      <CardDescription>
        {isEditMode
          ? 'Update the task details below'
          : 'Fill in the details to create a new task'}
      </CardDescription>
    </CardHeader>
  );
};
