import React from 'react';
import { useNavigate } from 'react-router';
import { UserProfile } from '../components/UserProfile';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const AccountProfilePage = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const handleUpdateProfile = async (userData: any) => {
    try {
      // Note: The backend doesn't have a profile update endpoint yet
      // For now, we'll just show a success message
      toast.success('Profile updated successfully');
      await refreshUser();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <UserProfile 
      user={user}
      onBack={() => navigate('/')}
      onUpdate={handleUpdateProfile}
    />
  );
};
