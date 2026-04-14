import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import { Upload, FileImage, X, Activity, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

const Prediction = () => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setResult(null);
            setError('');
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
        setError('');
        try {
            const base64 = await convertToBase64(image);
            const response = await api.post('/predict', { image: base64 });
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const clearSelection = () => {
        setImage(null);
        setPreview(null);
        setResult(null);
        setError('');
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-10">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kidney Disease Classification</h1>
                        <p className="text-gray-500">Upload a CT scan image for AI-powered diagnostic analysis.</p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Upload Section */}
                        <section className="space-y-6">
                            <div className={`card border-2 border-dashed ${preview ? 'border-primary-400' : 'border-gray-200'} transition-all min-h-[400px] flex flex-col items-center justify-center p-8 bg-white`}>
                                {!preview ? (
                                    <div className="text-center">
                                        <div className="bg-primary-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-600">
                                            <Upload size={32} />
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900 mb-2">Select CT Scan Image</p>
                                        <p className="text-sm text-gray-500 mb-8 px-4">Drag and drop or browse to upload.<br/>Supported: JPG, PNG, JPEG</p>
                                        <label className="btn-primary cursor-pointer px-8 py-3">
                                            Browse Files
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                        </label>
                                    </div>
                                ) : (
                                    <div className="relative w-full h-full flex flex-col items-center">
                                        <button 
                                            onClick={clearSelection}
                                            className="absolute -top-4 -right-4 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
                                        >
                                            <X size={20} />
                                        </button>
                                        <motion.div 
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="w-full rounded-lg overflow-hidden shadow-md mb-6"
                                        >
                                            <img src={preview} alt="Scan Preview" className="w-full h-auto object-cover max-h-[350px]" />
                                        </motion.div>
                                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                                            <FileImage size={18} />
                                            <span>{image.name}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handlePredict}
                                disabled={!image || loading}
                                className="btn-primary w-full py-4 text-xl flex justify-center items-center gap-3 shadow-lg shadow-primary-200"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={24} />
                                        Analyzing Scan...
                                    </>
                                ) : (
                                    <>
                                        <Activity size={24} />
                                        Run Diagnostics
                                    </>
                                )}
                            </button>
                        </section>

                        {/* Result Section */}
                        <section>
                            <AnimatePresence mode="wait">
                                {loading && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="card h-full flex flex-col items-center justify-center text-center p-8 border-primary-100"
                                    >
                                        <div className="relative mb-8">
                                            <div className="w-24 h-24 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                                            <Activity className="absolute inset-0 m-auto text-primary-400" size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Our AI is analyzing the patterns...</h3>
                                        <p className="text-gray-500">Checking for specific markers and feature correlations within the scan.</p>
                                    </motion.div>
                                )}

                                {result && !loading && (
                                    <motion.div 
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="card h-full bg-white border-primary-100"
                                    >
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="bg-green-100 p-3 rounded-xl text-green-600">
                                                <CheckCircle2 size={28} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">Analysis Complete</h3>
                                                <p className="text-sm text-gray-500">Results ready for review</p>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-2xl p-8 text-center mb-8">
                                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Diagnosis Result</p>
                                            <h2 className={`text-5xl font-black mb-4 ${result.result === 'Normal' ? 'text-green-600' : 'text-red-600'}`}>
                                                {result.result}
                                            </h2>
                                            <div className="flex justify-center items-center gap-2">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[200px]">
                                                    <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${result.confidence * 100}%` }}></div>
                                                </div>
                                                <span className="text-sm font-bold text-gray-700">{(result.confidence * 100).toFixed(1)}% Confidence</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4">
                                                <AlertTriangle className="text-blue-500 shrink-0" size={20} />
                                                <p className="text-sm text-blue-800">
                                                    <strong>Important Note:</strong> This diagnosis is generated by an AI model. Please consult with a qualified radiologist for a final professional medical opinion.
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {!result && !loading && !error && (
                                    <div className="card h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50/50 border-dashed border-gray-300">
                                        <Activity size={48} className="text-gray-300 mb-6" />
                                        <h3 className="text-xl font-bold text-gray-400">Analysis metrics will appear here</h3>
                                        <p className="text-gray-400 max-w-xs mt-2">Upload a scan and click "Run Diagnostics" to see results.</p>
                                    </div>
                                )}

                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="card h-full border-red-100 flex flex-col items-center justify-center p-8"
                                    >
                                        <AlertTriangle size={48} className="text-red-500 mb-4" />
                                        <h3 className="text-xl font-bold text-red-900">Analysis Error</h3>
                                        <p className="text-red-600 mb-6 text-center">{error}</p>
                                        <button onClick={handlePredict} className="btn-primary bg-red-600 hover:bg-red-700">Try Again</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Prediction;
