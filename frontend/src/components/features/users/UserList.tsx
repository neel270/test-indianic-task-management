import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { fetchUsers, selectUsers, selectUsersLoading, selectUserPagination, selectUserFilters } from '@/store/slices/userSlice';
import { UserCard } from './UserCard';
import { UserForm } from './UserForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, UserFilters } from '@/types/api';
import { Plus, Search, Filter, Grid, List } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

interface UserListProps {
  viewMode?: 'grid' | 'list';
}

export const UserList = ({ viewMode = 'grid' }: UserListProps) => {
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const loading = useAppSelector(selectUsersLoading);
  const pagination = useAppSelector(selectUserPagination);
  const filters = useAppSelector(selectUserFilters);

  useEffect(() => {
    loadUsers();
  }, [dispatch, filters]);

  const loadUsers = () => {
    const params: Record<string, unknown> = {
      page: pagination.page,
      limit: pagination.limit,
    };

    if (roleFilter !== 'all') {
      params.role = roleFilter;
    }

    if (statusFilter !== 'all') {
      params.isActive = statusFilter === 'active';
    }

    if (searchTerm) {
      params.search = searchTerm;
    }

    dispatch(fetchUsers(params));
  };

  const handleSearch = () => {
    loadUsers();
  };

  const handleFilterChange = () => {
    loadUsers();
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleFormClose = () => {
    setShowUserForm(false);
    setEditingUser(null);
    loadUsers(); // Refresh the list
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    loadUsers();
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions
          </p>
        </div>
        <Button onClick={handleCreateUser} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={handleSearch}>
            Search
          </Button>
        </div>

        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleFilterChange}>
            <Filter className="h-4 w-4 mr-2" />
            Apply
          </Button>

          <Button variant="ghost" onClick={clearFilters}>
            Clear
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {pagination.total} Total Users
          </Badge>
          {roleFilter !== 'all' && (
            <Badge variant="outline">
              Role: {roleFilter}
            </Badge>
          )}
          {statusFilter !== 'all' && (
            <Badge variant="outline">
              Status: {statusFilter}
            </Badge>
          )}
        </div>
      </div>

      {/* Users Grid/List */}
      {users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No users found.</p>
          <Button variant="outline" onClick={clearFilters} className="mt-4">
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={handleEditUser}
            />
          ))}
        </div>
      )}

      {/* User Form Dialog */}
      <UserForm
        user={editingUser}
        open={showUserForm}
        onOpenChange={handleFormClose}
      />
    </div>
  );
};