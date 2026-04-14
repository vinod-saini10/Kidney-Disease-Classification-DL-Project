import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { Mail, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const Verify = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    if (!email) {
        navigate('/register');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/verify', { email, otp });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 text-center"
            >
                <div className="bg-primary-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-600">
                    {success ? <CheckCircle2 size={40} className="text-green-500" /> : <Mail size={40} />}
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Email</h2>
                <p className="text-gray-500 mb-8">We've sent a 6-digit code to <br/><span className="font-semibold text-gray-700">{email}</span></p>

                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3 text-red-700 text-left">
                        <AlertCircle size={20} />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {success ? (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="bg-green-50 text-green-700 p-4 rounded-lg font-medium"
                    >
                        Verification successful! Redirecting to login...
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <input
                                type="text"
                                maxLength="6"
                                required
                                className="w-full text-center text-3xl tracking-[1rem] font-bold border-2 border-gray-200 px-4 py-4 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-50 outline-none transition-all"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 text-lg flex justify-center items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={24} /> : 'Verify OTP'}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-sm text-gray-500">
                    Didn't receive the code?{' '}
                    <button className="text-primary-600 font-bold hover:underline">Resend OTP</button>
                </div>
            </motion.div>
        </div>
    );
};

export default Verify;
