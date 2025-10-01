import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
      <div className='flex items-center justify-center min-h-screen p-4'>
        <div className='w-full max-w-md'>{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
