import React, { useState } from 'react';
import { User, Mail, Phone, ArrowLeft, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { User as UserType } from '../services/api';
import { useTranslation } from 'react-i18next';

interface UserProfileProps {
  user: UserType | null;
  onBack: () => void;
  onUpdate: (userData: { name: string; phone: string }) => void;
}

export const UserProfile = ({ user, onBack, onUpdate }: UserProfileProps) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const phoneRegex = /^\d{8,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Phone number must contain 8-15 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onUpdate(formData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
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
                <h1 className="text-3xl font-bold">{user?.name}</h1>
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
                    onClick={handleSave}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-80 transition-opacity font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {t('userProfile.saveChanges')}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <User className="w-4 h-4" />
                  {t('userProfile.fullName')}
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.name ? 'border-red-500' : 'border-border'
                      } bg-background focus:ring-2 focus:ring-primary focus:border-transparent`}
                      placeholder={t('userProfile.fullNamePlaceholder')}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-base font-medium px-4 py-3 bg-muted rounded-lg">
                    {formData.name}
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
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.phone ? 'border-red-500' : 'border-border'
                      } bg-background focus:ring-2 focus:ring-primary focus:border-transparent`}
                      placeholder={t('userProfile.phonePlaceholder')}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-base font-medium px-4 py-3 bg-muted rounded-lg">
                    {formData.phone || t('userProfile.notSet')}
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
    </div>
  );
};