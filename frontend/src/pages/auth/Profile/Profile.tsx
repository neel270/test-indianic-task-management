import { useFormik } from 'formik';
import { Camera, Loader2, Save, Key, Settings } from 'lucide-react';
import React, { useState } from 'react';
import * as Yup from 'yup';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Input,
  Label,
  Separator,
} from '@/components/ui';

import { useToast } from '../../../hooks/use-toast';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { useUpdateProfile } from '../../../hooks/useAuthApi';
import { logger } from '../../../lib/logger';
import { selectUser } from '@/store/slices/authSlice';
import { updateProfileSuccess } from '@/store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
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
        const result = await updateProfileMutation.mutateAsync(values);
        setIsEditing(false);
        formik.resetForm();

        // Update Redux state with the new user data
        if (result?.user) {
          dispatch(updateProfileSuccess(result.user));
        }

        logger.info('Profile update completed', { userId: user?.id });
      } catch (error) {
        // Error handling is done in the mutation
        logger.error('Profile update failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      }
    },
  });

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image size must be less than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/auth/upload-profile-image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorData.message ?? 'Upload failed');
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Avatar uploaded',
          description: 'Profile image updated successfully!',
        });

        // Update Redux store with new profile image
        if (user && result.data?.imageUrl) {
          dispatch(updateProfileSuccess({
            ...user,
            profileImage: result.data.imageUrl
          }));

          // Force refresh the avatar by updating the src
          const avatarImg = document.querySelector(`img[alt="${user.firstName} ${user.lastName}"]`) as HTMLImageElement;
          if (avatarImg) {
            avatarImg.src = `${result.data.imageUrl}?t=${Date.now()}`;
          }
        }

        logger.info('Avatar upload completed', {
          fileName: file.name,
          fileSize: file.size,
          imageUrl: result.data?.imageUrl
        });
      } else {
        throw new Error(result.message ?? 'Upload failed');
      }
    } catch (error) {
      logger.error('Avatar upload failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload avatar.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingAvatar(false);
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
              <label className={`absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer hover:bg-blue-700 transition-colors ${isUploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {isUploadingAvatar ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <Camera className='w-4 h-4' />
                )}
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleAvatarChange}
                  className='hidden'
                  disabled={isUploadingAvatar}
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

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Settings className='h-5 w-5' />
              Account Actions
            </CardTitle>
            <CardDescription>
              Manage your account security and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <Button
                variant='outline'
                className='w-full justify-start'
                onClick={() => navigate('/auth/change-password')}
              >
                <Key className='w-4 h-4 mr-2' />
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
