import React, { useState } from 'react';
import { User, Mail, Phone, ArrowLeft, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { User as UserType } from '../services/api';
import { useTranslation } from 'react-i18next';
import PhoneInput, { formatPhoneDisplay } from './PhoneInput';

interface UserProfileProps {
  user: UserType | null;
  onBack: () => void;
  onUpdate: (userData: { first_name: string; last_name: string; phone: string }) => void;
}

export const UserProfile = ({ user, onBack, onUpdate }: UserProfileProps) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  // Helper: parse name into first/last as fallback for users without first_name/last_name
  const parseName = (u: typeof user) => {
    if (u?.first_name && u?.last_name) {
      return { first_name: u.first_name, last_name: u.last_name };
    }
    // Fallback: parse the combined name field
    const fullName = u?.name || '';
    const parts = fullName.trim().split(' ', 2);
    return {
      first_name: parts[0] || '',
      last_name: parts[1] || '',
    };
  };

  const [formData, setFormData] = useState({
    first_name: parseName(user).first_name,
    last_name: parseName(user).last_name,
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (user) {
      const parsed = parseName(user);
      setFormData({
        first_name: parsed.first_name,
        last_name: parsed.last_name,
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.first_name.trim().length < 1) {
      newErrors.first_name = t('userProfile.firstNameMinLength');
    }

    if (formData.last_name.trim().length < 1) {
      newErrors.last_name = t('userProfile.lastNameMinLength');
    }

    if (formData.phone && !isValidPhoneNumber(formData.phone)) {
      newErrors.phone = t('userProfile.phoneInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveClick = () => {
    if (validateForm()) {
      setShowConfirmDialog(true);
    }
  };

  const handleSaveConfirm = () => {
    setShowConfirmDialog(false);
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleSaveCancel = () => {
    setShowConfirmDialog(false);
  };

  const handleCancel = () => {
    const parsed = parseName(user);
    setFormData({
      first_name: parsed.first_name,
      last_name: parsed.last_name,
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-muted/30 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer hover:opacity-80"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{t('userProfile.back')}</span>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-background rounded-2xl shadow-lg border border-border overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 p-8 text-primary-foreground">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{parseName(user).first_name} {parseName(user).last_name}</h1>
                <p className="text-primary-foreground/80 mt-1">
                  {user?.role === 'staff' ? t('userProfile.staffMember') : t('userProfile.guest')}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{t('userProfile.personalInformation')}</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-80 transition-opacity font-medium cursor-pointer"
                >
                  {t('userProfile.editProfile')}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-muted text-foreground rounded-lg hover:opacity-80 transition-opacity font-medium cursor-pointer"
                  >
                    {t('userProfile.cancel')}
                  </button>
                  <button
                    onClick={handleSaveClick}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-80 transition-opacity font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {t('userProfile.saveChanges')}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* First Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <User className="w-4 h-4" />
                  {t('userProfile.firstName')}
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.first_name ? 'border-red-500' : 'border-border'
                      } bg-background focus:ring-2 focus:ring-primary focus:border-transparent`}
                      placeholder={t('userProfile.firstNamePlaceholder')}
                    />
                    {errors.first_name && (
                      <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-base font-medium px-4 py-3 bg-muted rounded-lg">
                    {formData.first_name}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <User className="w-4 h-4" />
                  {t('userProfile.lastName')}
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.last_name ? 'border-red-500' : 'border-border'
                      } bg-background focus:ring-2 focus:ring-primary focus:border-transparent`}
                      placeholder={t('userProfile.lastNamePlaceholder')}
                    />
                    {errors.last_name && (
                      <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-base font-medium px-4 py-3 bg-muted rounded-lg">
                    {formData.last_name}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <Mail className="w-4 h-4" />
                  {t('userProfile.emailAddress')}
                </label>
                <div>
                  <input
                    type="email"
                    value={formData.email}
                    disabled={true}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-muted/50 cursor-not-allowed opacity-60"
                    title={t('userProfile.emailNote')}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('userProfile.emailNote')}
                  </p>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <Phone className="w-4 h-4" />
                  {t('userProfile.phoneNumber')}
                </label>
                {isEditing ? (
                  <div>
                    <PhoneInput
                      value={formData.phone}
                      onChange={(value) => setFormData({ ...formData, phone: value || '' })}
                      error={!!errors.phone}
                      placeholder={t('userProfile.phonePlaceholder')}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-base font-medium px-4 py-3 bg-muted rounded-lg">
                    {formatPhoneDisplay(formData.phone) || t('userProfile.notSet')}
                  </p>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> {t('userProfile.infoBox')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl shadow-xl p-6 max-w-sm mx-4 w-full">
            <h3 className="text-lg font-bold mb-3">{t('userProfile.confirmSaveTitle')}</h3>
            <p className="text-sm text-muted-foreground mb-6">{t('userProfile.confirmSaveDesc')}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleSaveCancel}
                className="px-4 py-2 bg-muted text-foreground rounded-lg hover:opacity-80 transition-opacity font-medium cursor-pointer"
              >
                {t('userProfile.cancel')}
              </button>
              <button
                onClick={handleSaveConfirm}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-80 transition-opacity font-medium cursor-pointer"
              >
                {t('userProfile.confirmSave')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
