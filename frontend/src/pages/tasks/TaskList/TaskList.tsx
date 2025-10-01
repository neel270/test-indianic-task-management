import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { useToast } from '../../../hooks/use-toast';
import { useTasks, useDeleteTask, useUpdateTaskStatus, useExportTasksToCSV } from '../../../hooks/useTaskApi';
import { Task } from '../../../types/task';
import { ShimmerCard } from '../../../components/ui/shimmer.tsx';
import {
  TaskFilters,
  TaskGridView,
  TaskTableView,
  EmptyState,
} from './components';

interface TaskListProps {
  onCreateTask?: () => void;
  onEditTask?: (_: Task) => void;
  onViewTask?: (_: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ onCreateTask, onEditTask, onViewTask }) => {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // for grid view

  // API integration
  const { data: tasksResponse, isLoading } = useTasks(currentPage, itemsPerPage, {
    ...(statusFilter !== 'all' && { status: statusFilter }),
  });

  const deleteTaskMutation = useDeleteTask();
  const updateStatusMutation = useUpdateTaskStatus();
  const exportTasksMutation = useExportTasksToCSV();
  console.log(tasksResponse, '---tasksResponse---');
  const tasks = tasksResponse?.data || [];
  const totalPages = tasksResponse?.pagination?.totalPages || 0;

  // Filter tasks based on search term (client-side filtering for search)
  const filteredTasks = tasks.filter((task: Task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderTableView = () => (
    <TaskTableView
      tasks={paginatedTasks}
      onView={onViewTask}
      onEdit={onEditTask}
      onStatusToggle={handleStatusToggle}
      onDelete={handleDeleteTask}
    />
  );

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${taskTitle}"?`)) {
      try {
        await deleteTaskMutation.mutateAsync(taskId);
      } catch (error) {
        // Error handling is done in the mutation
      }
    }
  };

  const handleStatusToggle = (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateStatusMutation.mutate(
      { id: task.id, status: newStatus },
      {
        onSuccess: () => {
          toast({
            title: 'Status updated',
            description: `Task marked as ${newStatus}.`,
          });
        },
      }
    );
  };


  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {[...Array(6)].map((_, i) => (
          <ShimmerCard key={i} />
        ))}
      </div>
    );
  }

  if (!filteredTasks || filteredTasks.length === 0) {
    return (
      <EmptyState
        hasFilters={!!(searchTerm || statusFilter !== 'all')}
        onCreateTask={onCreateTask}
      />
    );
  }

  return (
    <div className='space-y-6'>
      {/* Filters */}
      <Card>
        <CardContent className='p-4'>
          <TaskFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onExport={() => exportTasksMutation.mutate({
              ...(statusFilter !== 'all' && { status: statusFilter }),
            })}
            isExporting={exportTasksMutation.isPending}
            onCreateTask={onCreateTask}
          />
        </CardContent>
      </Card>

      {/* Tasks View */}
      {viewMode === 'grid' ? (
        <TaskGridView
          tasks={paginatedTasks}
          onView={onViewTask}
          onEdit={onEditTask}
          onStatusToggle={handleStatusToggle}
          onDelete={handleDeleteTask}
        />
      ) : (
        renderTableView()
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-center space-x-2 mt-6'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handlePageChange(currentPage - 1)}
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
                onClick={() => handlePageChange(page)}
                className='w-8 h-8 p-0'
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant='outline'
            size='sm'
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskList;
