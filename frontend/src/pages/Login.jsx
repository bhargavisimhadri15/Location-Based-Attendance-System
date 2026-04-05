import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await login(formData.email, formData.password);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.msg);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center -mt-16">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass w-full max-w-md p-8 rounded-3xl"
            >
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold mb-3 tracking-tight">Welcome Back</h2>
                    <p className="text-white/40 text-lg">Enter your details to sign in</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3.5 rounded-xl text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-danger rounded-full animate-pulse" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative group">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                placeholder="Email address"
                                type="email"
                                required
                                className="input-field pl-12 h-14 bg-surface/50 border-white/5 focus:bg-surface focus:border-primary/50 transition-all text-lg"
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                placeholder="Password"
                                type="password"
                                required
                                className="input-field pl-12 h-14 bg-surface/50 border-white/5 focus:bg-surface focus:border-primary/50 transition-all text-lg"
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary w-full py-4 h-14 font-bold text-lg shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]">
                        Sign In
                    </button>

                    <div className="pt-4 text-center">
                        <p className="text-white/40 font-medium">
                            First-time setup? {' '}
                            <Link to="/register" className="text-primary hover:text-primary-light transition-colors font-bold underline-offset-4 hover:underline">
                                Create admin account
                            </Link>
                        </p>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
