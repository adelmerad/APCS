import { Save, User, Lock, Globe, Bell } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-deep-ocean">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-semibold text-deep-ocean mb-4 flex items-center gap-2">
            <User size={20} />
            Profile Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input type="text" defaultValue="Admin User" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" defaultValue="admin@apcs.dz" className="input-field" />
            </div>
            <button className="btn-primary w-full flex items-center justify-center gap-2">
              <Save size={18} />
              Save Profile
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-deep-ocean mb-4 flex items-center gap-2">
            <Lock size={20} />
            Security
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input type="password" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input type="password" className="input-field" />
            </div>
            <button className="btn-primary w-full">Change Password</button>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-deep-ocean mb-4 flex items-center gap-2">
            <Globe size={20} />
            Preferences
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select className="input-field">
                <option>English</option>
                <option>Français</option>
                <option>العربية</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-700">Email Notifications</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className="text-sm text-gray-700">SMS Alerts</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* API Integration Info */}
      <div className="card bg-gray-50 border border-gray-200">
        <h3 className="font-semibold text-deep-ocean mb-3 flex items-center gap-2">
          <Save size={18} />
          API Integration - Settings
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="font-mono bg-green-100 text-status-success px-2 py-0.5 rounded text-xs font-semibold">GET</span>
            <code className="text-gray-700">/api/user/profile</code>
            <span className="text-gray-500">- Get profile (All roles)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono bg-blue-100 text-status-info px-2 py-0.5 rounded text-xs font-semibold">PUT</span>
            <code className="text-gray-700">/api/user/profile</code>
            <span className="text-gray-500">- Update profile (All roles)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono bg-blue-100 text-status-info px-2 py-0.5 rounded text-xs font-semibold">PUT</span>
            <code className="text-gray-700">/api/user/password</code>
            <span className="text-gray-500">- Change password (All roles)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono bg-blue-100 text-status-info px-2 py-0.5 rounded text-xs font-semibold">PUT</span>
            <code className="text-gray-700">/api/user/preferences</code>
            <span className="text-gray-500">- Update preferences (All roles)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
