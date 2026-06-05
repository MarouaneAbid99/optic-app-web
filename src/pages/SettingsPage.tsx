import { Settings, User, Shield, Mail } from 'lucide-react';
import { useAuthStore } from '../hooks/useAuth';

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrateur',
  OPTICIEN: 'Opticien',
  EMPLOYE: 'Employé',
};

const ROLE_COLOR: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  OPTICIEN: 'bg-blue-100 text-blue-700',
  EMPLOYE: 'bg-gray-100 text-gray-700',
};

export default function SettingsPage() {
  const user = useAuthStore(s => s.user);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <Settings size={22} className="text-gray-700" />
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
      </div>

      {/* Profile card */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Profil utilisateur</h2>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold select-none">
            {user?.fullName?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{user?.fullName}</p>
            <span className={`badge mt-1 ${ROLE_COLOR[user?.role ?? ''] || 'bg-gray-100 text-gray-700'}`}>
              {ROLE_LABEL[user?.role ?? ''] || user?.role}
            </span>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <User size={16} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Nom complet</p>
              <p className="font-medium text-gray-900">{user?.fullName || '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail size={16} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Adresse e-mail</p>
              <p className="font-medium text-gray-900">{user?.email || '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Shield size={16} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Rôle</p>
              <p className="font-medium text-gray-900">{ROLE_LABEL[user?.role ?? ''] || user?.role || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* App info */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Application</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span className="text-gray-400">Version</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">API</span>
            <span className="font-mono text-xs">http://localhost:3002/api</span>
          </div>
        </div>
      </div>
    </div>
  );
}
