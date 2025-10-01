import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const AuthShimmer = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4'>
      <Card className='w-full max-w-md shadow-elevated'>
        <CardHeader className='space-y-1'>
          <Skeleton className='h-8 w-3/4 mx-auto' />
          <Skeleton className='h-4 w-1/2 mx-auto' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-10 w-full' />
          </div>
          <Skeleton className='h-10 w-full' />
          <div className='flex justify-center space-y-2'>
            <Skeleton className='h-4 w-48' />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const LoginShimmer = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
      <Card className='w-full max-w-md shadow-elevated'>
        <CardHeader className='space-y-1'>
          <Skeleton className='h-8 w-48 mx-auto' />
          <Skeleton className='h-4 w-64 mx-auto' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-12' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-10 w-full' />
          </div>
          <Skeleton className='h-10 w-full' />
          <div className='text-center space-y-2'>
            <Skeleton className='h-4 w-40 mx-auto' />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const RegisterShimmer = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4'>
      <Card className='w-full max-w-md shadow-elevated'>
        <CardHeader className='space-y-1'>
          <Skeleton className='h-8 w-48 mx-auto' />
          <Skeleton className='h-4 w-64 mx-auto' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-12' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-10 w-full' />
          </div>
          <Skeleton className='h-10 w-full' />
          <div className='text-center space-y-2'>
            <Skeleton className='h-4 w-40 mx-auto' />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ForgotPasswordShimmer = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4'>
      <Card className='w-full max-w-md shadow-elevated'>
        <CardHeader className='space-y-1'>
          <Skeleton className='h-8 w-48 mx-auto' />
          <Skeleton className='h-4 w-80 mx-auto' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-10 w-full' />
          </div>
          <Skeleton className='h-10 w-full' />
          <div className='text-center space-y-2'>
            <Skeleton className='h-4 w-32 mx-auto' />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const OTPVerificationShimmer = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100 p-4'>
      <Card className='w-full max-w-md shadow-elevated'>
        <CardHeader className='space-y-1 text-center'>
          <Skeleton className='h-8 w-32 mx-auto' />
          <Skeleton className='h-4 w-64 mx-auto' />
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='space-y-2'>
            <div className='flex justify-center'>
              <div className='grid grid-cols-6 gap-2 max-w-xs'>
                {Array.from({ length: 6 }, (_, index) => (
                  <Skeleton key={index} className='w-12 h-12' />
                ))}
              </div>
            </div>
          </div>
          <Skeleton className='h-10 w-full' />
          <div className='text-center space-y-2'>
            <Skeleton className='h-8 w-32 mx-auto' />
            <Skeleton className='h-4 w-40 mx-auto' />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const SetPasswordShimmer = () => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100 p-4'>
      <Card className='w-full max-w-md shadow-elevated'>
        <CardHeader className='space-y-1 text-center'>
          <Skeleton className='w-16 h-16 rounded-full mx-auto' />
          <Skeleton className='h-8 w-48 mx-auto' />
          <Skeleton className='h-4 w-64 mx-auto' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-36' />
            <Skeleton className='h-10 w-full' />
          </div>
          <Skeleton className='h-10 w-full' />
          <div className='text-center space-y-2'>
            <Skeleton className='h-4 w-24 mx-auto' />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
