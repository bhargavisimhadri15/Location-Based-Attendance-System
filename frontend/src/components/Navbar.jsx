import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, MapPin } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="glass sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                    <MapPin className="text-primary w-6 h-6" />
                </div>
                <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Location-Based Attendance System
                </span>
            </div>

            <div className="flex items-center gap-6">
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
