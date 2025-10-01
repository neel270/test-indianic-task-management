import { Download, Grid3X3, Plus, Table as TableIcon } from 'lucide-react';
import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { TaskStatus } from '../../../../types/task';

interface TaskFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: TaskStatus | 'all';
  onStatusFilterChange: (value: TaskStatus | 'all') => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  onExport: () => void;
  onCreateTask: () => void;
  isExporting: boolean;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  onExport,
  onCreateTask,
  isExporting,
}) => {
  return (
    <div className='flex flex-col sm:flex-row gap-4'>
      <div className='flex-1'>
        <Input
          placeholder='Search tasks...'
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className='w-[180px]'>
          <SelectValue placeholder='Filter by status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Tasks</SelectItem>
          <SelectItem value='Pending'>Pending</SelectItem>
          <SelectItem value='In Progress'>In Progress</SelectItem>
          <SelectItem value='Completed'>Completed</SelectItem>
          <SelectItem value='Cancelled'>Cancelled</SelectItem>
        </SelectContent>
      </Select>

      {/* CSV Export Button */}
      <Button variant='outline' size='sm' onClick={onExport} disabled={isExporting}>
        <Download className='h-4 w-4 mr-2' />
        {isExporting ? 'Exporting...' : 'Export CSV'}
      </Button>

      {/* View Toggle */}
      <div className='flex border rounded-lg'>
        <Button
          variant={viewMode === 'grid' ? 'default' : 'ghost'}
          size='sm'
          onClick={() => onViewModeChange('grid')}
          className='rounded-r-none'
        >
          <Grid3X3 className='h-4 w-4' />
        </Button>
        <Button
          variant={viewMode === 'table' ? 'default' : 'ghost'}
          size='sm'
          onClick={() => onViewModeChange('table')}
          className='rounded-l-none'
        >
          <TableIcon className='h-4 w-4' />
        </Button>
      </div>
      <Button onClick={onCreateTask}>
        <Plus className='h-4 w-4 mr-2' />
        Create Task
      </Button>
    </div>
  );
};
