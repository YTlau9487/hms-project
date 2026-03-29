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
  const { user, updateProfile } = useAuth();

  const handleUpdateProfile = async (userData: { name: string; phone: string }) => {
    const result = await updateProfile({
      name: userData.name,
      phone: userData.phone,
    });

    if (result.success) {
      toast.success(t('userProfile.saveChanges'));
    } else {
      toast.error(getErrorMessage(new Error(result.error || t('common.failed'))));
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
