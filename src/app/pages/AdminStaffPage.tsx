import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Users, Plus, Trash2, AlertCircle, X, Loader2, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { adminAPI, StaffCreate, StaffMember } from '../services/api';
import PhoneInput from '../components/PhoneInput';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const AUTO_LOGOUT_TIME = 5 * 60 * 1000; // 5 minutes
const WARNING_TIME = 4 * 60 * 1000; // 4 minutes

export const AdminStaffPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Confirmation dialog states
  const [deleteConfirm, setDeleteConfirm] = useState<StaffMember | null>(null);
  const [createConfirm, setCreateConfirm] = useState<StaffCreate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Auto-logout states
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningShownRef = useRef(false);

  // Reset logout timer on activity
  const resetLogoutTimer = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    warningShownRef.current = false;
    
    // Show warning at 4 minutes
    logoutTimerRef.current = setTimeout(() => {
      if (!warningShownRef.current) {
        warningShownRef.current = true;
        toast.warning(t('adminStaff.sessionExpiring'), {
          description: t('adminStaff.sessionExpiringDesc'),
          duration: 5000,
        });
      }
    }, WARNING_TIME);
    
    // Auto-logout at 5 minutes
    logoutTimerRef.current = setTimeout(() => {
      logout();
      navigate('/admin/login');
      toast.info(t('adminStaff.sessionExpired'));
    }, AUTO_LOGOUT_TIME);
  }, [logout, navigate]);

  // Set up activity listeners
  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'click', 'touchstart'];
    
    const handleActivity = () => {
      resetLogoutTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Initial timer setup
    resetLogoutTimer();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, [resetLogoutTimer]);

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchStaff();
  }, [user, navigate]);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const data = await adminAPI.listStaff();
      setStaff(data);
    } catch (err) {
      toast.error(t('adminStaff.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (formData.phone && !isValidPhoneNumber(formData.phone)) {
      setError(t('adminStaff.invalidPhone'));
      return;
    }
    
    // Show confirmation dialog
    setCreateConfirm({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone || undefined,
    });
  };


  const confirmCreateStaff = async () => {
    if (!createConfirm) return;
    
    setIsSubmitting(true);
    setIsCreating(true);

    try {
      await adminAPI.createStaff(createConfirm);
      toast.success(t('adminStaff.createdSuccess'));
      setFormData({ name: '', email: '', password: '', phone: '' });
      setShowCreateForm(false);
      setCreateConfirm(null);
      await fetchStaff();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message.includes('400') || message.includes('already')) {
        setError(t('adminStaff.emailRegistered'));
      } else {
        setError(t('adminStaff.createFailed'));
      }
    } finally {
      setIsSubmitting(false);
      setIsCreating(false);
    }
  };

  const handleDeleteClick = (member: StaffMember) => {
    setDeleteConfirm(member);
  };

  const confirmDeleteStaff = async () => {
    if (!deleteConfirm) return;
    
    setIsDeleting(true);
    try {
      await adminAPI.deleteStaff(deleteConfirm.id);
      toast.success(t('adminStaff.deletedSuccess'));
      setDeleteConfirm(null);
      await fetchStaff();
    } catch (err) {
      toast.error(t('adminStaff.deleteFailed'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-900 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t('adminStaff.title')}</h1>
              <p className="text-sm text-gray-500">{t('adminStaff.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <span className="text-sm text-gray-600">{t('adminStaff.welcome')}, {user?.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Create Staff Button */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">{t('adminStaff.staffAccounts')} ({staff.length})</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 hover:opacity-90 transition text-sm font-medium"
          >
            {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showCreateForm ? t('adminStaff.cancel') : t('adminStaff.addStaff')}
          </button>
        </div>

        {/* Create Staff Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminStaff.createTitle')}</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminStaff.fullName')}</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminStaff.email')}</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminStaff.password')}</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminStaff.phone')}</label>
                  <PhoneInput
                    value={formData.phone}
                    onChange={(value) => setFormData({ ...formData, phone: value || '' })}
                  />
                </div>

              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 hover:opacity-90 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {isSubmitting ? t('adminStaff.creating') : t('adminStaff.createStaff')}
              </button>
            </form>
          </div>
        )}

        {/* Staff List - Desktop Table / Mobile Cards */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="text-gray-500 mt-3">{t('adminStaff.loadingStaff')}</p>
            </div>
          ) : staff.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">{t('adminStaff.noStaffFound')}</p>
              <p className="text-sm text-gray-400 mt-1">{t('adminStaff.noStaffSubtitle')}</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{t('adminStaff.name')}</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{t('adminStaff.email')}</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{t('adminStaff.phoneLabel')}</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{t('adminStaff.created')}</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{t('adminStaff.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {staff.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-900">{member.name}</td>
                        <td className="px-6 py-4 text-gray-600">{member.email}</td>
                        <td className="px-6 py-4 text-gray-600">{member.phone || '-'}</td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {new Date(member.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteClick(member)}
                            className="cursor-pointer p-2 text-red-600 hover:bg-red-50 hover:opacity-80 rounded-lg transition"
                            title="Delete staff"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {staff.map((member) => (
                  <div key={member.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase">Name</span>
                          <p className="font-medium text-gray-900 truncate">{member.name}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase">Email</span>
                          <p className="text-sm text-gray-600 truncate">{member.email}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase">Phone</span>
                           <p className="text-sm text-gray-500">{member.phone || t('adminStaff.notProvided')}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase">Created</span>
                          <p className="text-xs text-gray-400">
                            {new Date(member.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteClick(member)}
                        className="cursor-pointer p-2 text-red-600 hover:bg-red-50 hover:opacity-80 rounded-lg transition ml-2 self-start"
                        title="Delete staff"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDeleteStaff}
        title={t('adminStaff.deleteTitle')}
        description={t('adminStaff.deleteDesc', { name: deleteConfirm?.name || '' })}
        confirmText={t('adminStaff.deleteBtn')}
        variant="destructive"
        icon={Trash2}
        iconColor="text-red-600"
        iconBgColor="bg-red-100"
        confirmButtonClassName="bg-red-600 hover:bg-red-700 cursor-pointer"
      />

      {/* Create Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!createConfirm}
        onClose={() => setCreateConfirm(null)}
        onConfirm={confirmCreateStaff}
        title={t('adminStaff.createConfirmTitle')}
        description={t('adminStaff.createConfirmDesc', { name: createConfirm?.name || '', email: createConfirm?.email || '' })}
        confirmText={t('adminStaff.createBtn')}
        variant="default"
        icon={UserPlus}
        iconColor="text-green-600"
        iconBgColor="bg-green-100"
        confirmButtonClassName="bg-green-600 hover:bg-green-700 cursor-pointer"
      />
    </div>
  );
};