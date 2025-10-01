import { User } from '@/types/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserCheck, UserX } from 'lucide-react';
import { useToggleUserStatus } from '@/hooks/useUserApi';

interface UserCardProps {
  user: User;
}

export const UserCard = ({ user }: UserCardProps) => {
  const toggleStatusMutation = useToggleUserStatus();

  const handleToggleStatus = () => {
    void toggleStatusMutation.mutateAsync(user.id.toString());
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <>
      <Card className='hover:shadow-md transition-shadow'>
        <CardHeader className='pb-3'>
          <div className='flex items-center space-x-3'>
            <Avatar className='h-10 w-10'>
              <AvatarFallback className='bg-primary/10 text-primary font-medium'>
                {getInitials(user.firstName + ' ' + user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 min-w-0'>
              <h3 className='font-semibold text-sm truncate'>{user.firstName + ' ' + user.lastName}</h3>
              <p className='text-xs text-muted-foreground truncate'>{user.email}</p>
            </div>
            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
          </div>
        </CardHeader>
        <CardContent className='pt-0'>
          <div className='space-y-3'>
            <div className='flex items-center justify-between text-xs text-muted-foreground'>
              <span>Status:</span>
              <Badge variant={user.isActive ? 'default' : 'destructive'}>
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className='flex items-center justify-between text-xs text-muted-foreground'>
              <span>Joined:</span>
              <span>{formatDate(user.createdAt)}</span>
            </div>

            <div className='flex gap-2 pt-2'>
              <Button variant='outline' size='sm' onClick={handleToggleStatus} className='flex-1'>
                {user.isActive ? (
                  <>
                    <UserX className='h-3 w-3 mr-1' />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className='h-3 w-3 mr-1' />
                    Activate
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
