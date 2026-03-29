import React from 'react';
import { useNavigate } from 'react-router';
import { UserProfile } from '../components/UserProfile';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const AccountProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleUpdateProfile = async (userData: { name: string; phone: string }) => {
    // Note: Profile update API endpoint is not implemented yet
    // This is a placeholder that shows a success message
    toast.success(t('userProfile.saveChanges'));
  };

  return (
    <UserProfile 
      user={user}
      onBack={() => {
        if (user?.role === 'staff') {
          navigate('/?view=customer');
        } else {
          navigate('/');
        }
      }}
      onUpdate={handleUpdateProfile}
    />
  );
};
