import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { UserProfile } from '../components/UserProfile';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const AccountProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProfile = async (userData: { name: string; phone: string }) => {
    setIsUpdating(true);
    try {
      const result = await updateUser(userData);
      if (result.success) {
        toast.success(t('userProfile.profileUpdated'));
      } else {
        toast.error(result.error || t('userProfile.updateFailed'));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? getErrorMessage(error) : t('userProfile.updateFailed');
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
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
