import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Task } from '@/store/slices/tasksSlice';
import { format } from 'date-fns';
import { Calendar, CheckCircle2, Circle, FileText, Pencil, Trash2 } from 'lucide-react';

/**
 * Props for TaskCard component
 */
interface TaskCardProps {
  /** The task object to display */
  task: Task;
  /** Callback function called when edit button is clicked */
  onEdit: (task: Task) => void;
  /** Callback function called when delete button is clicked */
  onDelete: (id: string) => void;
  /** Callback function called when status toggle button is clicked */
  onToggleStatus: (id: string, currentStatus: string) => void;
}

/**
 * TaskCard Component
 *
 * Displays a single task in a card format with actions for editing, deleting,
 * and toggling task status. Shows task details including title, description,
 * due date, and attached files.
 *
 * @param props - TaskCard component props
 * @returns JSX element representing a task card
 *
 * @example
 * ```tsx
 * <TaskCard
 *   task={task}
 *   onEdit={(task) => setEditingTask(task)}
 *   onDelete={(id) => handleDeleteTask(id)}
 *   onToggleStatus={(id, status) => toggleTaskStatus(id, status)}
 * />
 * ```
 */
const TaskCard = ({ task, onEdit, onDelete, onToggleStatus }: TaskCardProps) => {
  return (
    <Card className="shadow-card hover:shadow-elevated transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg">{task.title}</h3>
          <Badge
            variant={task.status === 'Completed' ? 'default' : 'secondary'}
            className={task.status === 'Completed' ? 'bg-gradient-success' : ''}
          >
            {task.status === 'Completed' ? (
              <CheckCircle2 className="w-3 h-3 mr-1" />
            ) : (
              <Circle className="w-3 h-3 mr-1" />
            )}
            {task.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {task.description && (
          <p className="text-sm text-muted-foreground">{task.description}</p>
        )}
        {task.dueDate && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
          </div>
        )}
        {task.file?.originalName && (
          <div className="flex items-center text-sm text-primary">
            <FileText className="w-4 h-4 mr-2" />
            {task.file.originalName}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleStatus(task.id, task.status)}
        >
          {task.status === 'Completed' ? 'Mark Pending' : 'Complete'}
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(task)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
