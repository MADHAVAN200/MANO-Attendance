import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import {
    UploadCloud,
    FileText,
    CheckCircle,
    AlertCircle,
    X,
    ChevronRight,
    Download
} from 'lucide-react';

const BulkUpload = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Success
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);

    const handleFileDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
            setFile(droppedFile);
            mockParseCSV(droppedFile);
        }
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            mockParseCSV(selectedFile);
        }
    };

    const mockParseCSV = (file) => {
        // Mocking CSV parsing
        setTimeout(() => {
            setPreviewData([
                { name: 'John Doe', email: 'john@mano.com', role: 'Sales Executive', status: 'Valid' },
                { name: 'Jane Smith', email: 'jane@mano.com', role: 'Store Manager', status: 'Valid' },
                { name: 'Bob Wilson', email: 'bob@mano.com', role: 'Unknown Role', status: 'Error' }, // Error case
            ]);
            setStep(2);
        }, 1000);
    };

    const handleUpload = () => {
        // Mock upload API call
        setTimeout(() => {
            setStep(3);
        }, 1500);
    };

    return (
        <DashboardLayout title="Bulk Employee Upload">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'} transition-colors`}>1</div>
                        <span className={`ml-2 text-sm font-medium ${step >= 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>Upload</span>
                    </div>
                    <div className={`w-16 h-0.5 mx-4 ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                    <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'} transition-colors`}>2</div>
                        <span className={`ml-2 text-sm font-medium ${step >= 2 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>Preview</span>
                    </div>
                    <div className={`w-16 h-0.5 mx-4 ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                    <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'} transition-colors`}>3</div>
                        <span className={`ml-2 text-sm font-medium ${step >= 3 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>Done</span>
                    </div>
                </div>

                {/* Step 1: Upload Area */}
                {step === 1 && (
                    <div className="bg-white dark:bg-dark-card rounded-2xl p-8 sm:p-12 shadow-sm border border-slate-200 dark:border-slate-700 text-center transition-colors duration-300">
                        <div
                            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-10 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleFileDrop}
                            onClick={() => document.getElementById('fileInput').click()}
                        >
                            <input
                                type="file"
                                id="fileInput"
                                className="hidden"
                                accept=".csv"
                                onChange={handleFileSelect}
                            />
                            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <UploadCloud size={32} />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Click to upload or drag and drop</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">CSV files only (Max 5MB)</p>
                            <button className="px-6 py-2 bg-slate-900 dark:bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors">
                                Select File
                            </button>
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline cursor-pointer">
                            <Download size={16} />
                            <span>Download Sample CSV Template</span>
                        </div>
                    </div>
                )}

                {/* Step 2: Preview */}
                {step === 2 && (
                    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                    <FileText className="text-indigo-600 dark:text-indigo-400" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">{file?.name}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{(file?.size / 1024).toFixed(2)} KB</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setStep(1); setFile(null); }}
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Validation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {previewData.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                            <td className="px-6 py-4 text-sm text-slate-800 dark:text-slate-200">{row.name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{row.email}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{row.role}</td>
                                            <td className="px-6 py-4">
                                                {row.status === 'Valid' ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                                                        <CheckCircle size={12} /> Valid
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
                                                        <AlertCircle size={12} /> Error
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                            <button
                                onClick={() => setStep(1)}
                                className="px-4 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <span>Upload Employees</span>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Success */}
                {step === 3 && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Upload Successful!</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                            2 employees have been successfully added to the system. 1 record failed validation.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => navigate('/employees')}
                                className="px-6 py-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                View Employee List
                            </button>
                            <button
                                onClick={() => { setStep(1); setFile(null); }}
                                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 transition-colors"
                            >
                                Upload More
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};

export default BulkUpload;
