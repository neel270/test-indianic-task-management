import { Bell, CheckSquare, LayoutDashboard, LogOut, Menu, User } from 'lucide-react';
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import { useLogout } from '../hooks/useAuthApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/authSlice';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAppSelector(selectUser);
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Users', href: '/users', icon: User },
  ];

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? 'w-full' : 'w-64'} bg-gray-50 border-r`}>
      <div className='flex items-center px-6 py-4 border-b'>
        <h1 className='text-xl font-bold text-gray-900'>Task Manager</h1>
      </div>

      <nav className='flex-1 px-4 py-6 space-y-2'>
        {navigation.map(item => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              className='flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors'
              onClick={mobile ? () => setSidebarOpen(false) : undefined}
            >
              <Icon className='mr-3 h-5 w-5' />
              {item.name}
            </a>
          );
        })}
      </nav>

      <div className='p-4 border-t'>
        <div className='flex items-center space-x-3 px-3 py-2'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={user?.profileImage} alt={user?.firstName} />
            <AvatarFallback>
              {user?.firstName
                ?.split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium text-gray-900 truncate'>{user?.firstName}</p>
            <p className='text-sm text-gray-500 truncate'>{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className='flex h-screen bg-gray-100'>
      {/* Desktop Sidebar */}
      <div className='hidden lg:flex lg:flex-shrink-0'>
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side='left' className='p-0 w-64'>
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className='flex flex-col flex-1 overflow-hidden'>
        {/* Top Header */}
        <header className='bg-white shadow-sm border-b'>
          <div className='flex items-center justify-between px-4 py-3'>
            <div className='flex items-center'>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant='ghost' size='sm' className='lg:hidden'>
                    <Menu className='h-5 w-5' />
                  </Button>
                </SheetTrigger>
              </Sheet>

              <h2 className='ml-2 text-lg font-semibold text-gray-900 lg:ml-0'>
                Welcome back, {user?.firstName?.split(' ')[0]}!
              </h2>
            </div>

            <div className='flex items-center space-x-4'>
              <Button variant='ghost' size='sm'>
                <Bell className='h-5 w-5' />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
                    <Avatar className='h-8 w-8'>
                      <AvatarImage src={user?.profileImage} alt={user?.firstName} />
                      <AvatarFallback>
                        {user?.firstName
                          ?.split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56' align='end' forceMount>
                  <DropdownMenuLabel className='font-normal'>
                    <div className='flex flex-col space-y-1'>
                      <p className='text-sm font-medium leading-none'>{user?.firstName}</p>
                      <p className='text-xs leading-none text-muted-foreground'>{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href='/profile'>Profile</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href='/settings'>Settings</a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className='mr-2 h-4 w-4' />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className='flex-1 overflow-y-auto'>
          <div className='py-6'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
