import React from 'react';
import { TaskCardComponent } from './TaskCard';
import { Task } from '../../../../types/task';

interface TaskGridViewProps {
  tasks: Task[];
  onView?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onStatusToggle: (task: Task) => void;
  onDelete: (taskId: string, taskTitle: string) => void;
}

export const TaskGridView: React.FC<TaskGridViewProps> = ({
  tasks,
  onView,
  onEdit,
  onStatusToggle,
  onDelete,
}) => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {tasks.map(task => (
        <TaskCardComponent
          key={task.id}
          task={task}
          onStatusToggle={onStatusToggle}
          onDelete={onDelete}
          {...(onView && { onView })}
          {...(onEdit && { onEdit })}
        />
      ))}
    </div>
  );
};
