import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUser, selectIsAuthenticated } from '@/store/slices/authSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Camera, User, Mail, Calendar, Shield, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { toastSuccess, toastError } from '@/hooks/use-toast';

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

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

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('profileImage', selectedFile);

      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/auth/profile/upload-image', {
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
        toastSuccess('Profile image updated successfully!');


        // Clear selection
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        throw new Error(result.message ?? 'Upload failed');
      }
    } catch (error: unknown) {
      toastError((error as Error).message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const cancelSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-4xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Profile</h1>
            <p className='text-gray-600 mt-1'>Manage your account settings and preferences</p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
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
                      (user.profileImage ? `${user.profileImage}?t=${Date.now()}` : undefined)
                    }
                    alt={user.name}
                  />
                  <AvatarFallback className='text-2xl'>
                    {user.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()}
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
                    disabled={isUploading}
                  />
                  <p className='text-xs text-gray-500 mt-1'>
                    JPG, JPEG, PNG, or WebP. Max size 5MB.
                  </p>
                </div>

                {selectedFile && (
                  <div className='flex gap-2'>
                    <Button
                      onClick={() => void handleUploadImage()}
                      disabled={isUploading}
                      size='sm'
                      className='flex-1'
                    >
                      {isUploading ? (
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
                      disabled={isUploading}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card className='lg:col-span-2'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='h-5 w-5' />
                Profile Information
              </CardTitle>
              <CardDescription>Your account details and information</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-gray-700'>Full Name</Label>
                  <div className='flex items-center gap-2 p-2 bg-gray-50 rounded-md'>
                    <User className='h-4 w-4 text-gray-500' />
                    <span className='text-gray-900'>{user.name}</span>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-gray-700'>Email Address</Label>
                  <div className='flex items-center gap-2 p-2 bg-gray-50 rounded-md'>
                    <Mail className='h-4 w-4 text-gray-500' />
                    <span className='text-gray-900'>{user.email}</span>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-gray-700'>Role</Label>
                  <div className='flex items-center gap-2'>
                    <Shield className='h-4 w-4 text-gray-500' />
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-gray-700'>Account Status</Label>
                  <div className='flex items-center gap-2'>
                    <Badge variant={user.isActive ? 'default' : 'destructive'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-gray-700'>Member Since</Label>
                  <div className='flex items-center gap-2 p-2 bg-gray-50 rounded-md'>
                    <Calendar className='h-4 w-4 text-gray-500' />
                    <span className='text-gray-900'>
                      {format(new Date(user.createdAt), 'MMMM d, yyyy')}
                    </span>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-gray-700'>Last Updated</Label>
                  <div className='flex items-center gap-2 p-2 bg-gray-50 rounded-md'>
                    <Calendar className='h-4 w-4 text-gray-500' />
                    <span className='text-gray-900'>
                      {format(new Date(user.updatedAt), 'MMMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              <div className='pt-4 border-t'>
                <h3 className='text-sm font-medium text-gray-700 mb-2'>Quick Actions</h3>
                <div className='flex gap-2'>
                  <Button onClick={() => navigate('/tasks')} variant='outline'>
                    View Tasks
                  </Button>
                  <Button onClick={() => navigate('/')} variant='outline'>
                    Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account preferences and security settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-center py-8 text-gray-500'>
              <Shield className='h-12 w-12 mx-auto mb-4 opacity-50' />
              <p>Additional account settings coming soon</p>
              <p className='text-sm'>Password changes, notification preferences, and more</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
