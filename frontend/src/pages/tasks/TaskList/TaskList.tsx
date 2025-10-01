import React, { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { useToast } from '../../../hooks/use-toast';
import {
  useTasks,
  useDeleteTask,
  useUpdateTaskStatus,
  useExportTasksToCSV,
} from '../../../hooks/useTaskApi';
import { Task, TaskStatus } from '../../../types/task';
import { ShimmerCard } from '../../../components/ui/shimmer.tsx';
import { TaskFilters, TaskGridView, TaskTableView, EmptyState, TaskPagination } from './components';
import { useNavigate } from 'react-router-dom';

const TaskList: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // for grid view
  const onCreateTask = () => {
    navigate('/tasks/new');
  };
  const onEditTask = (_: Task) => {
    navigate('/tasks/' + _.id + '/edit/');
  };
  const onViewTask = (_: Task) => {
    navigate('/tasks/' + _.id);
  };
  // API integration
  const { data: tasksResponse, isLoading } = useTasks(currentPage, itemsPerPage, {
    ...(statusFilter !== 'all' && { status: statusFilter }),
  });

  const deleteTaskMutation = useDeleteTask();
  const updateStatusMutation = useUpdateTaskStatus();
  const exportTasksMutation = useExportTasksToCSV();
  const tasks = tasksResponse?.data || [];
  const totalPages = tasksResponse?.pagination?.totalPages || 0;

  // Filter tasks based on search term (client-side filtering for search)
  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
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

  if ((!filteredTasks || filteredTasks.length === 0) && statusFilter === 'all') {
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
            onExport={() =>
              exportTasksMutation.mutate({
                ...(statusFilter !== 'all' && { status: statusFilter }),
              })
            }
            isExporting={exportTasksMutation.isPending}
            onCreateTask={onCreateTask}
          />
        </CardContent>
      </Card>

      {/* Tasks View */}
      {viewMode === 'grid' ? (
        <TaskGridView
          tasks={filteredTasks}
          onView={onViewTask}
          onEdit={onEditTask}
          onStatusToggle={handleStatusToggle}
          onDelete={handleDeleteTask}
        />
      ) : (
        <TaskTableView
          tasks={filteredTasks}
          onView={onViewTask}
          onEdit={onEditTask}
          onStatusToggle={handleStatusToggle}
          onDelete={handleDeleteTask}
        />
      )}

      {/* Pagination */}
      <TaskPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      {!filteredTasks || filteredTasks.length === 0 && <EmptyState
        hasFilters={!!(searchTerm || statusFilter !== 'all')}
        onCreateTask={onCreateTask}
      />}
    </div>
  );
};

export default TaskList;
