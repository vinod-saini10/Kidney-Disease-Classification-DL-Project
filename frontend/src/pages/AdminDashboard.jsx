import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Upload, FileImage, X, Activity, CheckCircle2, History, Loader2, AlertTriangle, User, Phone, MapPin } from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useAuth();
    
    // Prediction State
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [predictionError, setPredictionError] = useState('');

    // History State
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({ Normal: 0, Tumor: 0 });
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        fetchPersonalData();
    }, []);

    const fetchPersonalData = async () => {
        try {
            const response = await api.get('/user/history');
            setHistory(response.data.history);
            setStats(response.data.stats);
        } catch (err) {
            console.error('Failed to fetch personal history', err);
        } finally {
            setDataLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setResult(null);
            setPredictionError('');
        }
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const handlePredict = async () => {
        if (!image) return;
        setLoading(true);
        setPredictionError('');
        try {
            const base64 = await convertToBase64(image);
            const response = await api.post('/predict', { image: base64 });
            setResult(response.data);
            // Refresh history after prediction
            fetchPersonalData();
        } catch (err) {
            setPredictionError(err.response?.data?.error || 'Analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const clearSelection = () => {
        setImage(null);
        setPreview(null);
        setResult(null);
        setPredictionError('');
    };

    const chartData = [
        { name: 'Normal', value: stats?.Normal || 0, color: '#10b981' },
        { name: 'Tumor', value: stats?.Tumor || 0, color: '#ef4444' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-6xl mx-auto">
                    <header className="mb-10 flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">Administrator Dashboard</h1>
                            <p className="text-gray-500">Manage your personal diagnostics and profile</p>
                        </div>
                        <div className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-primary-200">
                            Personal Workspace
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                        {/* Profile Card */}
                        <div className="card h-full lg:col-span-1">
                            <div className="flex flex-col items-center text-center pb-6 border-b mb-6 border-gray-100">
                                <div className="w-24 h-24 rounded-full bg-primary-100 mb-4 p-1 ring-4 ring-primary-50">
                                    {user?.image ? (
                                        <img src={`http://localhost:8080/${user.image}`} alt="PFP" className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        <div className="w-full h-full bg-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                            {user?.name?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                                <p className="text-sm text-primary-600 font-bold uppercase tracking-widest">{user?.role}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-gray-600">
                                    <User className="text-primary-500 shrink-0" size={20} />
                                    <span className="text-sm truncate">{user?.email}</span>
                                </div>
                                <div className="flex items-center gap-4 text-gray-600">
                                    <Phone className="text-primary-500 shrink-0" size={20} />
                                    <span className="text-sm">+1 999-000-Admin</span>
                                </div>
                                <div className="flex items-center gap-4 text-gray-600">
                                    <MapPin className="text-primary-500 shrink-0" size={20} />
                                    <span className="text-sm italic">System HQ Secure Office</span>
                                </div>
                            </div>
                        </div>

                        {/* Analysis & Visualization */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Personal Prediction Tool */}
                            <div className="card bg-white border-primary-50 border-2">
                                <div className="flex items-center gap-3 mb-6">
                                    <Activity className="text-primary-600" size={24} />
                                    <h3 className="text-lg font-bold text-gray-900">Run New Diagnostic Scan</h3>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className={`relative border-2 border-dashed ${preview ? 'border-primary-400' : 'border-gray-200'} rounded-xl p-4 flex flex-col items-center justify-center min-h-[220px] bg-gray-50/30 transition-all`}>
                                        {!preview ? (
                                            <label className="flex flex-col items-center cursor-pointer text-center">
                                                <Upload className="text-gray-400 mb-2" size={32} />
                                                <span className="text-xs font-bold text-gray-500">Click to upload CT Scan</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                            </label>
                                        ) : (
                                            <div className="relative w-full h-full flex flex-col items-center">
                                                <button onClick={clearSelection} className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 z-20">
                                                    <X size={14} />
                                                </button>
                                                <img src={preview} alt="Scan Preview" className="w-full h-40 object-cover rounded-lg shadow-sm" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col justify-center">
                                        <button
                                            onClick={handlePredict}
                                            disabled={!image || loading}
                                            className="btn-primary w-full py-4 text-lg flex justify-center items-center gap-3 shadow-lg shadow-primary-100"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Activity size={20} />}
                                            {loading ? 'Analyzing...' : 'Run Diagnostics'}
                                        </button>

                                        <AnimatePresence>
                                            {result && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`mt-4 p-4 rounded-xl text-center border ${result.result === 'Normal' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                                                >
                                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Analysis Result</p>
                                                    <h4 className={`text-2xl font-black ${result.result === 'Normal' ? 'text-green-600' : 'text-red-600'}`}>{result.result}</h4>
                                                    <p className="text-xs font-bold text-gray-600 mt-1">{(result.confidence * 100).toFixed(1)}% Confidence</p>
                                                </motion.div>
                                            )}
                                            {predictionError && (
                                                <motion.div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 font-medium">
                                                    {predictionError}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                        {/* Personal Analytics Graph */}
                        <div className="card lg:col-span-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Activity size={20} className="text-primary-500" />
                                Personal Case Distribution
                            </h3>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Legend verticalAlign="bottom" height={36}/>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent History Table */}
                        <div className="card lg:col-span-2">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <History size={20} className="text-primary-500" />
                                Your Recent Diagnostic Records
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-xs text-gray-400 font-bold uppercase border-b border-gray-100">
                                        <tr>
                                            <th className="pb-4 px-2">Diagnostic Scan</th>
                                            <th className="pb-4 px-2">Result</th>
                                            <th className="pb-4 px-2">AI Confidence</th>
                                            <th className="pb-4 px-2 text-right">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {history.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-2">
                                                    <div className="w-12 h-10 rounded bg-gray-200 overflow-hidden border border-gray-100 shadow-sm">
                                                        <img src={`http://localhost:8080/${item.image}`} alt="Scan" className="w-full h-full object-cover" />
                                                    </div>
                                                </td>
                                                <td className="py-4 px-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${item.result === 'Normal' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {item.result}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-12 bg-gray-200 rounded-full h-1">
                                                            <div className="bg-primary-500 h-1 rounded-full" style={{ width: `${item.confidence * 100}%` }}></div>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-gray-600">{(item.confidence * 100).toFixed(0)}%</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-2 text-[10px] text-gray-500 font-medium text-right">
                                                    {item.date.split(' ')[0]}
                                                </td>
                                            </tr>
                                        ))}
                                        {history.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="text-center py-10 text-gray-400 italic">No personal records found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
