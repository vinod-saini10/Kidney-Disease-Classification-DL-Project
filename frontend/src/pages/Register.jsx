import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { User, Mail, Lock, Phone, MapPin, Upload, Loader2, AlertCircle } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: ''
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (image) data.append('image', image);

        try {
            await api.post('/auth/register', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/verify', { state: { email: formData.email } });
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4 py-12">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8"
            >
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                    <p className="text-gray-500 mt-2">Join our medical analytics platform</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3 text-red-700">
                        <AlertCircle size={20} />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 flex flex-col items-center mb-4">
                        <div className="relative group cursor-pointer">
                            <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary-400">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Upload className="text-gray-400 group-hover:text-primary-500" size={32} />
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleImageChange}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 font-medium">Upload Profile Image</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    className="input-field pl-10"
                                    placeholder="John Doe"
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="input-field pl-10"
                                    placeholder="john@example.com"
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="tel"
                                    required
                                    className="input-field pl-10"
                                    placeholder="+1 234 567 890"
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="md:row-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Address</label>
                            <div className="relative h-full">
                                <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                <textarea
                                    required
                                    className="input-field pl-10 h-[108px] resize-none"
                                    placeholder="Enter your permanent address"
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 mt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 text-lg flex justify-center items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
                        </button>
                    </div>
                </form>

                <p className="text-center mt-8 text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-600 font-bold hover:underline">
                        Login here
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
