import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Users, Activity, FileStack, TrendingUp, Search, MoreHorizontal } from 'lucide-react';

const AdminPanel = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminStats = async () => {
            try {
                const response = await api.get('/admin/stats');
                setStats(response.data);
            } catch (err) {
                console.error('Failed to fetch admin stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAdminStats();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-screen">Loading system analytics...</div>;

    const distributionData = [
        { name: 'Normal', value: stats?.overall_stats?.Normal || 0, color: '#10b981' },
        { name: 'Tumor', value: stats?.overall_stats?.Tumor || 0, color: '#ef4444' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-7xl mx-auto">
                    <header className="mb-10">
                        <h1 className="text-3xl font-bold text-gray-900">System Administrator Control</h1>
                        <p className="text-gray-500 mt-1">Global platform health and diagnostic analytics</p>
                    </header>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                                    <Users size={24} />
                                </div>
                            </div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Registered Patients</h3>
                            <p className="text-3xl font-black text-gray-900 mt-1">{stats?.total_users || 0}</p>
                        </motion.div>
                        
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="card">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                                    <FileStack size={24} />
                                </div>
                            </div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Diagnostic Analysis Performed</h3>
                            <p className="text-3xl font-black text-gray-900 mt-1">{stats?.total_predictions || 0}</p>
                        </motion.div>

                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="card">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-green-100 p-3 rounded-xl text-green-600">
                                    <TrendingUp size={24} />
                                </div>
                            </div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Normal Cases Found</h3>
                            <p className="text-3xl font-black text-gray-900 mt-1">{stats?.overall_stats?.Normal || 0}</p>
                        </motion.div>

                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="card">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-red-100 p-3 rounded-xl text-red-600">
                                    <Activity size={24} />
                                </div>
                            </div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Tumor Detections</h3>
                            <p className="text-3xl font-black text-gray-900 mt-1">{stats?.overall_stats?.Tumor || 0}</p>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                        {/* Global result Distribution */}
                        <div className="card">
                            <h3 className="text-lg font-bold text-gray-900 mb-8">Overall diagnosis distribution</h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={distributionData}
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {distributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* User Engagement Analytics */}
                        <div className="card">
                            <h3 className="text-lg font-bold text-gray-900 mb-8">Patient Activity Metrics</h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats?.users_analytics || []}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                        <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                        <Bar dataKey="prediction_count" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Detailed User Table */}
                    <div className="card">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-lg font-bold text-gray-900">User engagement breakdown</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search patients..." 
                                    className="bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-xs text-gray-400 uppercase font-bold border-b border-gray-100">
                                    <tr>
                                        <th className="pb-4 px-4 text-gray-500 font-bold">Patient Name</th>
                                        <th className="pb-4 px-4 text-gray-500 font-bold">Registration Email</th>
                                        <th className="pb-4 px-4 text-gray-500 font-bold">Performed Reports</th>
                                        <th className="pb-4 px-4 text-gray-500 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {stats?.users_analytics?.map((user, index) => (
                                        <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="py-5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <span className="font-semibold text-gray-900">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4 text-gray-600">{user.email}</td>
                                            <td className="py-5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900">{user.prediction_count}</span>
                                                    <div className="flex-1 w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-primary-500" 
                                                            style={{ width: `${Math.min((user.prediction_count / (stats.total_predictions || 1)) * 100 * 5, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4 text-right">
                                                <button className="text-gray-400 hover:text-gray-600 p-1">
                                                    <MoreHorizontal size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;
