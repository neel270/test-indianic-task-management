import React, { useState } from 'react';
import { useFormik } from 'formik';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/authSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, User, Upload, Eye, EyeOff, Lock, Loader2, Save, Settings } from 'lucide-react';
import { toastError } from '@/hooks/use-toast';
import { updateProfileSuccess } from '@/store/slices/authSlice';
import { useUpdateProfile, useChangePassword, useUploadProfileImage } from '@/hooks/useAuthApi';
import { logger } from '@/lib/logger';
import * as Yup from 'yup';

const ProfileTabs = () => {
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectUser);

  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const updateProfileMutation = useUpdateProfile();
  const uploadProfileImageMutation = useUploadProfileImage();

  // Password change state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const changePasswordMutation = useChangePassword();

  // Profile image upload state (for main profile view)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Profile editing formik
  const profileFormik = useFormik({
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
        profileFormik.resetForm();
        logger.info('Profile update completed', { userId: user?.id });
      } catch (error) {
        // Error handling is done in the mutation
        logger.error('Profile update failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  // Password change formik
  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required('Current password is required'),
      newPassword: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        )
        .required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        .required('Please confirm your new password'),
    }),
    onSubmit: async values => {
      try {
        await changePasswordMutation.mutateAsync({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });

        // Clear form after successful password change
        passwordFormik.resetForm();

        logger.info('Password change completed successfully');
      } catch (error) {
        // Error handling is done in the mutation
        logger.error('Password change failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toastError('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toastError('Image size must be less than 5MB');
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = e => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadImage = async () => {
    if (!selectedFile || !user) {
      return;
    }

    try {
      const result = await uploadProfileImageMutation.mutateAsync(selectedFile);

      if (result.success && result.data?.imageUrl) {
        // Update Redux store with new profile image
        dispatch(
          updateProfileSuccess({
            ...user,
            profileImage: result.data.imageUrl,
          })
        );

        // Clear selection
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    } catch (error) {
      // Error handling is done in the mutation
      logger.error('Profile image upload failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const cancelSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };
  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-6xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Profile Settings</h1>
            <p className='text-gray-600 mt-1'>Manage your account settings and preferences</p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          {/* Profile Image Card */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Camera className='h-5 w-5' />
                Profile Image
              </CardTitle>
              <CardDescription>Update your profile picture</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex justify-center'>
                <Avatar className='h-32 w-32'>
                  <AvatarImage
                    src={
                      previewUrl ??
                      (user?.profileImage ? `${user?.profileImage}?t=${Date.now()}` : undefined)
                    }
                    alt={`${user?.firstName} ${user?.lastName}`}
                  />
                  <AvatarFallback className='text-2xl'>
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className='space-y-3'>
                <div>
                  <Label htmlFor='profile-image'>Choose Image</Label>
                  <Input
                    id='profile-image'
                    type='file'
                    accept='image/*'
                    onChange={handleFileSelect}
                    className='mt-1'
                    disabled={uploadProfileImageMutation.isPending}
                  />
                  <p className='text-xs text-gray-500 mt-1'>
                    JPG, JPEG, PNG, or WebP. Max size 5MB.
                  </p>
                </div>

                {selectedFile && (
                  <div className='flex gap-2'>
                    <Button
                      onClick={() => void handleUploadImage()}
                      disabled={uploadProfileImageMutation.isPending}
                      size='sm'
                      className='flex-1'
                    >
                      {uploadProfileImageMutation.isPending ? (
                        <>Uploading...</>
                      ) : (
                        <>
                          <Upload className='h-4 w-4 mr-2' />
                          Upload
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={cancelSelection}
                      variant='outline'
                      size='sm'
                      disabled={uploadProfileImageMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Main Content with Tabs */}
          <Card className='lg:col-span-3'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Settings className='h-5 w-5' />
                Account Management
              </CardTitle>
              <CardDescription>Edit your profile and manage your account security</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue='profile' className='w-full'>
                <TabsList className='grid w-full grid-cols-2'>
                  <TabsTrigger value='profile' className='flex items-center gap-2'>
                    <User className='h-4 w-4' />
                    Edit Profile
                  </TabsTrigger>
                  <TabsTrigger value='password' className='flex items-center gap-2'>
                    <Lock className='h-4 w-4' />
                    Change Password
                  </TabsTrigger>
                </TabsList>

                {/* Profile Edit Tab */}
                <TabsContent value='profile' className='space-y-6'>
                  <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                    {/* Profile Form */}
                    <Card className='lg:col-span-3'>
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
                        <form onSubmit={profileFormik.handleSubmit} className='space-y-6'>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                              <Label htmlFor='firstName'>First Name</Label>
                              <Input
                                id='firstName'
                                name='firstName'
                                value={profileFormik.values.firstName}
                                onChange={profileFormik.handleChange}
                                onBlur={profileFormik.handleBlur}
                                disabled={!isEditing}
                                className={
                                  profileFormik.touched.firstName && profileFormik.errors.firstName
                                    ? 'border-red-500'
                                    : ''
                                }
                              />
                              {profileFormik.touched.firstName &&
                                profileFormik.errors.firstName && (
                                  <p className='text-sm text-red-500'>
                                    {profileFormik.errors.firstName}
                                  </p>
                                )}
                            </div>

                            <div className='space-y-2'>
                              <Label htmlFor='lastName'>Last Name</Label>
                              <Input
                                id='lastName'
                                name='lastName'
                                value={profileFormik.values.lastName}
                                onChange={profileFormik.handleChange}
                                onBlur={profileFormik.handleBlur}
                                disabled={!isEditing}
                                className={
                                  profileFormik.touched.lastName && profileFormik.errors.lastName
                                    ? 'border-red-500'
                                    : ''
                                }
                              />
                              {profileFormik.touched.lastName && profileFormik.errors.lastName && (
                                <p className='text-sm text-red-500'>
                                  {profileFormik.errors.lastName}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className='space-y-2'>
                            <Label htmlFor='email'>Email Address</Label>
                            <Input
                              id='email'
                              name='email'
                              type='email'
                              value={profileFormik.values.email}
                              onChange={profileFormik.handleChange}
                              onBlur={profileFormik.handleBlur}
                              disabled={!isEditing}
                              className={
                                profileFormik.touched.email && profileFormik.errors.email
                                  ? 'border-red-500'
                                  : ''
                              }
                            />
                            {profileFormik.touched.email && profileFormik.errors.email && (
                              <p className='text-sm text-red-500'>{profileFormik.errors.email}</p>
                            )}
                          </div>

                          {isEditing && (
                            <div className='flex justify-end space-x-4'>
                              <Button
                                type='button'
                                variant='outline'
                                onClick={() => {
                                  setIsEditing(false);
                                  profileFormik.resetForm();
                                }}
                              >
                                Cancel
                              </Button>
                              <Button type='submit' disabled={profileFormik.isSubmitting}>
                                {profileFormik.isSubmitting ? (
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
                </TabsContent>

                {/* Password Change Tab */}
                <TabsContent value='password' className='space-y-6'>
                  <Card>
                    <CardHeader className='text-center'>
                      <div className='mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
                        <Lock className='w-6 h-6 text-blue-600' />
                      </div>
                      <CardTitle className='text-2xl font-bold'>Change Password</CardTitle>
                      <CardDescription>
                        Enter your current password and choose a new secure password
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={passwordFormik.handleSubmit} className='space-y-4'>
                        {/* Current Password */}
                        <div className='space-y-2'>
                          <Label htmlFor='currentPassword'>Current Password</Label>
                          <div className='relative'>
                            <Input
                              id='currentPassword'
                              name='currentPassword'
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={passwordFormik.values.currentPassword}
                              onChange={passwordFormik.handleChange}
                              onBlur={passwordFormik.handleBlur}
                              className={
                                passwordFormik.touched.currentPassword &&
                                passwordFormik.errors.currentPassword
                                  ? 'border-red-500 pr-10'
                                  : 'pr-10'
                              }
                              placeholder='Enter your current password'
                            />
                            <button
                              type='button'
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                            >
                              {showCurrentPassword ? (
                                <EyeOff className='w-4 h-4' />
                              ) : (
                                <Eye className='w-4 h-4' />
                              )}
                            </button>
                          </div>
                          {passwordFormik.touched.currentPassword &&
                            passwordFormik.errors.currentPassword && (
                              <p className='text-sm text-red-500'>
                                {passwordFormik.errors.currentPassword}
                              </p>
                            )}
                        </div>

                        {/* New Password */}
                        <div className='space-y-2'>
                          <Label htmlFor='newPassword'>New Password</Label>
                          <div className='relative'>
                            <Input
                              id='newPassword'
                              name='newPassword'
                              type={showNewPassword ? 'text' : 'password'}
                              value={passwordFormik.values.newPassword}
                              onChange={passwordFormik.handleChange}
                              onBlur={passwordFormik.handleBlur}
                              className={
                                passwordFormik.touched.newPassword &&
                                passwordFormik.errors.newPassword
                                  ? 'border-red-500 pr-10'
                                  : 'pr-10'
                              }
                              placeholder='Enter your new password'
                            />
                            <button
                              type='button'
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                            >
                              {showNewPassword ? (
                                <EyeOff className='w-4 h-4' />
                              ) : (
                                <Eye className='w-4 h-4' />
                              )}
                            </button>
                          </div>
                          {passwordFormik.touched.newPassword &&
                            passwordFormik.errors.newPassword && (
                              <p className='text-sm text-red-500'>
                                {passwordFormik.errors.newPassword}
                              </p>
                            )}
                        </div>

                        {/* Confirm New Password */}
                        <div className='space-y-2'>
                          <Label htmlFor='confirmPassword'>Confirm New Password</Label>
                          <div className='relative'>
                            <Input
                              id='confirmPassword'
                              name='confirmPassword'
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={passwordFormik.values.confirmPassword}
                              onChange={passwordFormik.handleChange}
                              onBlur={passwordFormik.handleBlur}
                              className={
                                passwordFormik.touched.confirmPassword &&
                                passwordFormik.errors.confirmPassword
                                  ? 'border-red-500 pr-10'
                                  : 'pr-10'
                              }
                              placeholder='Confirm your new password'
                            />
                            <button
                              type='button'
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                            >
                              {showConfirmPassword ? (
                                <EyeOff className='w-4 h-4' />
                              ) : (
                                <Eye className='w-4 h-4' />
                              )}
                            </button>
                          </div>
                          {passwordFormik.touched.confirmPassword &&
                            passwordFormik.errors.confirmPassword && (
                              <p className='text-sm text-red-500'>
                                {passwordFormik.errors.confirmPassword}
                              </p>
                            )}
                        </div>

                        {/* Password Requirements */}
                        <div className='text-sm text-gray-600 bg-gray-50 p-3 rounded-md'>
                          <p className='font-medium mb-2'>Password requirements:</p>
                          <ul className='space-y-1 text-xs'>
                            <li>• At least 8 characters long</li>
                            <li>• At least one uppercase letter</li>
                            <li>• At least one lowercase letter</li>
                            <li>• At least one number</li>
                          </ul>
                        </div>

                        {/* Submit Button */}
                        <Button
                          type='submit'
                          className='w-full'
                          disabled={passwordFormik.isSubmitting || changePasswordMutation.isPending}
                        >
                          {passwordFormik.isSubmitting || changePasswordMutation.isPending ? (
                            <>
                              <Loader2 className='w-4 h-4 animate-spin mr-2' />
                              Changing Password...
                            </>
                          ) : (
                            <>
                              <Save className='w-4 h-4 mr-2' />
                              Change Password
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfileTabs;
