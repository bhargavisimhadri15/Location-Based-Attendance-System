import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';
import { LogOut, MapPin } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="glass sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between border-b border-white/5">
            <NavLink to="/dashboard" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                    <MapPin className="text-primary w-6 h-6" />
                </div>
                <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Location-Based Attendance System
                </span>
            </NavLink>

            <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-2">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-xl border transition-colors text-sm font-bold ${
                                isActive
                                    ? 'bg-primary/15 border-primary/25 text-primary-light'
                                    : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                            }`
                        }
                    >
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-xl border transition-colors text-sm font-bold ${
                                isActive
                                    ? 'bg-primary/15 border-primary/25 text-primary-light'
                                    : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                            }`
                        }
                    >
                        Settings
                    </NavLink>
                    {user?.role === 'admin' && (
                        <NavLink
                            to="/admin"
                            className={({ isActive }) =>
                                `px-4 py-2 rounded-xl border transition-colors text-sm font-bold ${
                                    isActive
                                        ? 'bg-primary/15 border-primary/25 text-primary-light'
                                        : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                                }`
                            }
                        >
                            Admin
                        </NavLink>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end text-sm">
                        <span className="font-semibold">{user?.name}</span>
                        <span className="text-white/40 text-xs capitalize">{user?.role}</span>
                    </div>
                    <button 
                        onClick={logout}
                        className="p-2.5 bg-white/5 hover:bg-danger/10 hover:text-danger rounded-xl border border-white/10 transition-all group"
                    >
                        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
