import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await register(formData);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.msg);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center -mt-16">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass w-full max-w-md p-8 rounded-3xl"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">Create Account</h2>
                    <p className="text-white/40">Initial admin setup (first user only)</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                            <input
                                placeholder="Full Name"
                                required
                                className="input-field pl-11"
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                            <input
                                type="email"
                                placeholder="Email Address"
                                required
                                className="input-field pl-11"
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                            <input
                                type="password"
                                placeholder="Password"
                                required
                                className="input-field pl-11"
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div className="text-xs text-white/50 bg-white/5 border border-white/10 rounded-2xl p-4">
                            After setup, create employees from the Admin Console. Employees should use Login only.
                        </div>
                    </div>

                    <button type="submit" className="btn-primary w-full py-3.5 h-14 font-bold text-lg">
                        Sign Up
                    </button>
                    
                    <p className="text-center text-white/40 text-sm">
                        Already have an account? {' '}
                        <Link to="/login" className="text-primary hover:text-primary-light transition-colors font-semibold">
                            Login here
                        </Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default Register;
