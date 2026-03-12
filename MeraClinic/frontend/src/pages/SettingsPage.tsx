import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { clinicService, UpdateClinicData } from '@/services/clinic';
import { authService } from '@/services/auth';
import { toast } from 'sonner';
import { Save, User, Building2, Lock, Loader2 } from 'lucide-react';

// Urdu translations
const translations = {
  settings: 'Settings / ترتیبات',
  clinicSettings: 'Clinic Settings / کلینک کی ترتیبات',
  profileSettings: 'Profile Settings / پروفائل کی ترتیبات',
  changePassword: 'Change Password / پاسورڈ تبدیل کریں',
  clinicName: 'Clinic Name / کلینک کا نام',
  address: 'Address / پتہ',
  phone: 'Phone / فون',
  whatsapp: 'WhatsApp / وہاٹس ایپ',
  patientPrefix: 'Patient Prefix / مریض کا پریفکس',
  prefixHelp: 'Short clinic code used in patient IDs / مریض کے ریفرنس میں استعمال ہونے والا مختصر کوڈ',
  yourName: 'Your Name / آپکا نام',
  save: 'Save / محفوظ کریں',
  saving: 'Saving... / محفوظ ہو رہا ہے...',
  currentPassword: 'Current Password / موجودہ پاسورڈ',
  newPassword: 'New Password / نیا پاسورڈ',
  confirmPassword: 'Confirm Password / تصدیق پاسورڈ',
  updatePassword: 'Update Password / پاسورڈ اپڈیٹ کریں',
};

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clinicData, setClinicData] = useState<UpdateClinicData>({
    name: '',
    address: '',
    phone: '',
    whatsapp: '',
    patient_prefix: '',
  });
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  useEffect(() => {
    // Load clinic data from user
    if (user?.clinic) {
      setClinicData({
        name: user.clinic.name || '',
        address: user.clinic.address || '',
        phone: user.clinic.phone || '',
        whatsapp: user.clinic.whatsapp || '',
        patient_prefix: user.clinic.patient_prefix || '',
      });
    }
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleClinicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await clinicService.updateClinic(clinicData);
      await refreshUser();
      toast.success('Clinic settings saved successfully');
    } catch (error) {
      toast.error('Failed to save clinic settings');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await clinicService.updateProfile(profileData);
      await refreshUser();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authService.updatePassword(
        passwordData.current_password,
        passwordData.new_password
      );
      toast.success('Password updated successfully');
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{translations.settings}</h1>
          <p className="text-gray-500">Manage your clinic and profile settings</p>
        </div>

        {/* Clinic Settings */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">{translations.clinicSettings}</h2>
          </div>
          
          <form onSubmit={handleClinicSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.clinicName}
                </label>
                <input
                  type="text"
                  value={clinicData.name}
                  onChange={(e) => setClinicData({ ...clinicData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.patientPrefix}
                </label>
                <input
                  type="text"
                  value={clinicData.patient_prefix}
                  onChange={(e) => setClinicData({ ...clinicData, patient_prefix: e.target.value.toUpperCase() })}
                  placeholder="Clinic code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-xs text-gray-500 mt-1">{translations.prefixHelp}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.phone}
                </label>
                <input
                  type="text"
                  value={clinicData.phone}
                  onChange={(e) => setClinicData({ ...clinicData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.whatsapp}
                </label>
                <input
                  type="text"
                  value={clinicData.whatsapp}
                  onChange={(e) => setClinicData({ ...clinicData, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translations.address}
              </label>
              <textarea
                value={clinicData.address}
                onChange={(e) => setClinicData({ ...clinicData, address: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? translations.saving : translations.save}
            </button>
          </form>
        </div>

        {/* Profile Settings */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">{translations.profileSettings}</h2>
          </div>
          
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.yourName}
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.phone}
                </label>
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? translations.saving : translations.save}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">{translations.changePassword}</h2>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translations.currentPassword}
              </label>
              <input
                type="password"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.newPassword}
                </label>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.confirmPassword}
                </label>
                <input
                  type="password"
                  value={passwordData.new_password_confirmation}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {translations.updatePassword}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
