import { useState } from 'react';
import { useUsers } from '@/hooks/useUserApi';
import { UserCard } from './UserCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';

interface UserListProps {
  viewMode?: 'grid' | 'list';
}

export const UserList = ({ viewMode = 'grid' }: UserListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('admin');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filters = {
    ...(roleFilter !== 'all' && { role: roleFilter }),
    ...(statusFilter !== 'all' && { isActive: statusFilter === 'active' }),
    ...(searchTerm && { search: searchTerm }),
  };

  const {
    data: usersResponse,
    isLoading,
    refetch,
  } = useUsers({
    page: currentPage,
    limit: 10,
    ...filters,
  });

  const users = usersResponse?.data ?? [];
  const pagination = usersResponse?.pagination ?? {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
  };

  const handleSearch = () => {
    setCurrentPage(1);
    void refetch();
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    void refetch();
  };


  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
    void refetch();
  };

  if (isLoading && users.length === 0) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4' />
          <p className='text-muted-foreground'>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header and Controls */}
      <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>User Management</h2>
          <p className='text-muted-foreground'>View and manage user status</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className='flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg'>
        <div className='flex-1 flex gap-2'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search users by name or email...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>
          <Button variant='outline' onClick={handleSearch}>
            Search
          </Button>
        </div>

        <div className='flex gap-2'>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className='w-32'>
              <SelectValue placeholder='Role' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Roles</SelectItem>
              <SelectItem value='admin'>Admin</SelectItem>
              <SelectItem value='user'>User</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-32'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='inactive'>Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button variant='outline' onClick={handleFilterChange}>
            <Filter className='h-4 w-4 mr-2' />
            Apply
          </Button>

          <Button variant='ghost' onClick={clearFilters}>
            Clear
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Badge variant='secondary'>{pagination.totalItems} Total Users</Badge>
          {roleFilter !== 'all' && <Badge variant='outline'>Role: {roleFilter}</Badge>}
          {statusFilter !== 'all' && <Badge variant='outline'>Status: {statusFilter}</Badge>}
        </div>
      </div>

      {/* Users Grid/List */}
      {users.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-muted-foreground'>No users found.</p>
          <Button variant='outline' onClick={clearFilters} className='mt-4'>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {users.map(user => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}

    </div>
  );
};
