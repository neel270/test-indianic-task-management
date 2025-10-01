import { useFormik } from 'formik';
import { Camera, Loader2, Save } from 'lucide-react';
import React, { useState } from 'react';
import * as Yup from 'yup';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Separator } from '../../../components/ui/separator';
import { useToast } from '../../../hooks/use-toast';
import { useAppSelector } from '../../../store/hooks';
import { useUpdateProfile } from '../../../hooks/useAuthApi';
import { logger } from '../../../lib/logger';
import { selectUser } from '@/store/slices/authSlice';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const updateProfileMutation = useUpdateProfile();

  // Get user data from Redux store
  const user = useAppSelector(selectUser);

  const formik = useFormik({
    initialValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      firstName: Yup.string()
        .min(2, 'First name must be at least 2 characters')
        .required('First name is required'),
      lastName: Yup.string()
        .min(2, 'Last name must be at least 2 characters')
        .required('Last name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
    }),
    onSubmit: async values => {
      try {
        await updateProfileMutation.mutateAsync(values);
        setIsEditing(false);
        formik.resetForm();
      } catch {
        // Error handling is done in the mutation
        logger.error('Profile update failed');
      }
    },
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement avatar upload
      logger.info('Avatar upload initiated', { fileName: file.name, fileSize: file.size });
      toast({
        title: 'Avatar upload',
        description: 'Avatar upload functionality will be implemented.',
      });
    }
  };

  if (!user) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <Loader2 className='w-8 h-8 animate-spin mx-auto mb-4' />
          <p className='text-gray-600'>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      <div className='text-center'>
        <h1 className='text-3xl font-bold text-gray-900'>Profile Settings</h1>
        <p className='text-gray-600 mt-1'>Manage your account information and preferences</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Profile Overview */}
        <Card className='lg:col-span-1'>
          <CardHeader className='text-center'>
            <div className='relative inline-block'>
              <Avatar className='w-24 h-24 mx-auto'>
                <AvatarImage src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
                <AvatarFallback className='text-lg'>
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <label className='absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer hover:bg-blue-700 transition-colors'>
                <Camera className='w-4 h-4' />
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleAvatarChange}
                  className='hidden'
                />
              </label>
            </div>
            <CardTitle className='mt-4'>
              {user.firstName} {user.lastName}
            </CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='text-center'>
                <div className='inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800'>
                  <div className='w-2 h-2 bg-green-500 rounded-full mr-2' />
                  Active
                </div>
              </div>
              <Separator />
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Member since:</span>
                  <span className='font-medium'>
                    {new Date(user?.createdAt ?? '').toLocaleDateString()}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Role:</span>
                  <span className='font-medium capitalize'>{user.role}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </div>
              <Button
                variant={isEditing ? 'outline' : 'default'}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={formik.handleSubmit} className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='firstName'>First Name</Label>
                  <Input
                    id='firstName'
                    name='firstName'
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!isEditing}
                    className={
                      formik.touched.firstName && formik.errors.firstName ? 'border-red-500' : ''
                    }
                  />
                  {formik.touched.firstName && formik.errors.firstName && (
                    <p className='text-sm text-red-500'>{formik.errors.firstName}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='lastName'>Last Name</Label>
                  <Input
                    id='lastName'
                    name='lastName'
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!isEditing}
                    className={
                      formik.touched.lastName && formik.errors.lastName ? 'border-red-500' : ''
                    }
                  />
                  {formik.touched.lastName && formik.errors.lastName && (
                    <p className='text-sm text-red-500'>{formik.errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>Email Address</Label>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={!isEditing}
                  className={formik.touched.email && formik.errors.email ? 'border-red-500' : ''}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className='text-sm text-red-500'>{formik.errors.email}</p>
                )}
              </div>

              {isEditing && (
                <div className='flex justify-end space-x-4'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      setIsEditing(false);
                      formik.resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type='submit' disabled={formik.isSubmitting}>
                    {formik.isSubmitting ? (
                      <>
                        <Loader2 className='w-4 h-4 animate-spin mr-2' />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className='w-4 h-4 mr-2' />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
