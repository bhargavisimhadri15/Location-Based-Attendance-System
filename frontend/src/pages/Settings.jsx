import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Shield, User } from 'lucide-react';

const SettingsPage = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="flex items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Settings</h1>
          <p className="text-white/40 mt-1">Manage your account and preferences</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-danger/10 hover:text-danger border border-white/10 transition-colors flex items-center gap-2 font-semibold"
        >
          <LogOut size={18} />
          Logout
        </button>
      </header>

      <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <User size={22} className="text-white/70" />
          </div>
          <div>
            <div className="font-bold text-lg">{user?.name || 'User'}</div>
            <div className="text-white/40 text-sm">{user?.email || '—'}</div>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl capitalize">
            <Shield size={14} className="text-white/60" />
            {user?.role || 'member'}
          </div>
        </div>

        <div className="text-sm text-white/50">
          API:{' '}
          <span className="font-mono text-white/70">
            {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}
          </span>
        </div>

        {user?.role === 'admin' && (
          <div className="pt-2">
            <Link
              to="/admin?tab=locations"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/15 hover:bg-primary/20 border border-primary/20 text-primary-light font-bold transition-colors"
            >
              Open Admin Console
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;

