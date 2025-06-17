
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, User, Camera, Save, Eye, EyeOff, Upload, X, Briefcase } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface UserData {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  profile_picture: string | null;
  role_id: number;
  role_name: string;
  created_at: string;
  updated_at: string;
}

// Expandable Settings Item Component
interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
  defaultExpanded?: boolean;
}

function ExpandableSettingsItem({ 
  icon, 
  title, 
  description, 
  children, 
  defaultExpanded = false 
}: SettingsItemProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <div className="text-gray-600">
            {icon}
          </div>
          <div className="text-left">
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            {description && (
              <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        <ChevronRight 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-90' : ''
          }`} 
        />
      </button>
      {isExpanded && children && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}

export default function Account() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user data on component mount
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/Login');
      return;
    }
    
    fetchUserData();
  }, [session, status, router]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/account');
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const result = await response.json();
      
      if (result.success) {
        const data = result.data;
        setUserData(data);
        setName(data.name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setProfilePicture(data.profile_picture);
      } else {
        toast.error(result.error || 'Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load account data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate form
    if (!name.trim() || !email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    if (password && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password && password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      setSaving(true);
      
      const updateData: any = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        profile_picture: profilePicture
      };

      if (password.trim()) {
        updateData.password = password;
      }

      const response = await fetch('/api/account', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update account');
      }

      const result = await response.json();

      if (result.success) {
        toast.success('Account updated successfully');
        setPassword('');
        setConfirmPassword('');
        
        // Update session if name or email changed
        if (result.data.name !== session?.user?.name || result.data.email !== session?.user?.email) {
          await update();
        }
        
        // Refresh user data
        await fetchUserData();
      } else {
        toast.error(result.error || 'Failed to update account');
      }
    } catch (error) {
      console.error('Error updating account:', error);
      toast.error('Failed to update account');
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureUpload = async (file: File) => {
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('profile_picture', file);

      const response = await fetch('/api/account/upload-profile-picture', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload profile picture');
      }

      const result = await response.json();      if (result.success) {
        setProfilePicture(result.data.profile_picture);
        // Update the session to reflect the new profile picture
        await update();
        toast.success('Profile picture uploaded successfully');
      } else {
        toast.error(result.error || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('File too large. Maximum size is 5MB.');
        return;
      }

      handleProfilePictureUpload(file);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading account settings...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <ExpandableSettingsItem
            icon={<User className="w-5 h-5" />}
            title="Profile Information"
            description="Update your personal information and profile picture"
            defaultExpanded={true}
          >
            <div className="space-y-6">
              {/* Profile Picture Section */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {profilePicture ? (
                      <img
                        src={profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">Profile Picture</h3>
                  <p className="text-sm text-gray-500">
                    Upload a profile picture. Recommended size: 400x400px. Maximum file size: 5MB.
                  </p>
                  <div className="mt-3 flex items-center space-x-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload Picture'}
                    </button>
                    {profilePicture && (
                      <button
                        onClick={removeProfilePicture}
                        className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={userData?.role_name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-500"
                    disabled
                  />
                </div>
              </div>

              {/* Password Change */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Change Password</h4>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                        placeholder="Enter new password (leave blank to keep current)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                {password && (
                  <p className="text-xs text-gray-500 mt-2">
                    Password must be at least 8 characters long
                  </p>
                )}
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </ExpandableSettingsItem>

          {/* Account Information */}
          {userData && (
            <ExpandableSettingsItem
              icon={<Briefcase className="w-5 h-5" />}
              title="Account Information"
              description="View your account details and activity"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User ID</label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{userData.user_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{userData.role_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Created</label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                      {userData.created_at ? new Date(userData.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                      {userData.updated_at ? new Date(userData.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </ExpandableSettingsItem>
          )}
        </div>
      </div>
    </div>
  );
}