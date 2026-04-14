import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Calendar, User, Phone, MapPin, History, FileText, CheckCircle, AlertCircle, Activity } from 'lucide-react';

const UserDashboard = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({ Normal: 0, Tumor: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/user/history');
                setHistory(response.data.history);
                setStats(response.data.stats);
            } catch (err) {
                console.error('Failed to fetch stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const chartData = [
        { name: 'Normal', value: stats?.Normal || 0, color: '#10b981' },
        { name: 'Tumor', value: stats?.Tumor || 0, color: '#ef4444' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-6xl mx-auto">
                    <header className="mb-8 flex justify-between items-end">
                        <div className="">
                            <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
                            <p className="text-gray-500 mt-1">Manage your profiles and health analytics</p>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Calendar size={18} />
                            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Profile Info */}
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
                                <p className="text-sm text-gray-500">{user?.role} Account</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-gray-600">
                                    <User className="text-primary-500 shrink-0" size={20} />
                                    <span className="text-sm">{user?.email}</span>
                                </div>
                                <div className="flex items-center gap-4 text-gray-600">
                                    <Phone className="text-primary-500 shrink-0" size={20} />
                                    <span className="text-sm">+1 456-789-0123</span>
                                </div>
                                <div className="flex items-center gap-4 text-gray-600">
                                    <MapPin className="text-primary-500 shrink-0" size={20} />
                                    <span className="text-sm">742 Evergreen Terrace, Springfield</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-50">
                                <div className="bg-primary-50 rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-lg text-primary-600 shadow-sm border border-primary-100">
                                            <History size={18} />
                                        </div>
                                        <span className="text-sm font-bold text-primary-900">Total Scans</span>
                                    </div>
                                    <span className="text-lg font-black text-primary-600">{history.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Analytic Overview */}
                        <div className="card lg:col-span-2 flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Activity size={20} className="text-primary-500" />
                                Result Analytics Overview
                            </h3>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
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
                                            <Legend />
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl border border-green-100 bg-green-50">
                                        <p className="text-xs font-bold text-green-600 uppercase mb-1">Normal Scans</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-2xl font-black text-green-700">{stats.Normal}</p>
                                            <CheckCircle className="text-green-500" size={24} />
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl border border-red-100 bg-red-50">
                                        <p className="text-xs font-bold text-red-600 uppercase mb-1">Tumor Detections</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-2xl font-black text-red-700">{stats.Tumor}</p>
                                            <AlertCircle className="text-red-500" size={24} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* History Table */}
                    <div className="card">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <History size={20} className="text-primary-500" />
                            Recent scan History
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-xs text-gray-400 uppercase font-bold border-b border-gray-100">
                                    <tr>
                                        <th className="pb-4 px-2">Diagnostic scan</th>
                                        <th className="pb-4 px-2">Diagnosis result</th>
                                        <th className="pb-4 px-2">AI Confidence</th>
                                        <th className="pb-4 px-2">Collection Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {history.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-2">
                                                <div className="w-16 h-12 rounded-lg bg-gray-200 overflow-hidden border">
                                                    <img src={`http://localhost:8080/${item.image}`} alt="Scan" className="w-full h-full object-cover" />
                                                </div>
                                            </td>
                                            <td className="py-4 px-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.result === 'Normal' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {item.result}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                                        <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${item.confidence * 100}%` }}></div>
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-600">{(item.confidence * 100).toFixed(0)}%</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-2 text-sm text-gray-500">
                                                {item.date}
                                            </td>
                                        </tr>
                                    ))}
                                    {history.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="text-center py-12 text-gray-400 font-medium">No scan history available. Start a new prediction to see results here.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;
