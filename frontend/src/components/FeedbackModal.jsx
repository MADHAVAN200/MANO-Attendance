import React, { useState } from 'react';
import { X, Upload, Bug, MessageSquare, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import api from '../services/api'; // Adjust path as needed
import { toast } from 'react-toastify';

const FeedbackModal = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('BUG'); // BUG or FEEDBACK
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const validFiles = selectedFiles.filter(file => file.type.startsWith('image/'));

        if (validFiles.length !== selectedFiles.length) {
            toast.warning("Only image files are allowed.");
        }

        setFiles(prev => [...prev, ...validFiles]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            toast.error("Title and description are required.");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('type', type);

            files.forEach(file => {
                formData.append('files', file);
            });

            const res = await api.post('/feedback', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.ok) {
                toast.success("Feedback submitted successfully!");
                // Reset form
                setTitle('');
                setDescription('');
                setFiles([]);
                setType('BUG');
                onClose();
            }
        } catch (error) {
            console.error("Feedback submit error:", error);
            toast.error(error.response?.data?.message || "Failed to submit feedback.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-dark-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        {type === 'BUG' ? <Bug className="text-red-500" size={20} /> : <MessageSquare className="text-indigo-500" size={20} />}
                        Submit {type === 'BUG' ? 'Bug Report' : 'Feedback'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Type Selection */}
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setType('BUG')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${type === 'BUG'
                                    ? 'bg-white dark:bg-dark-bg text-red-600 dark:text-red-400 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                }`}
                        >
                            <Bug size={16} />
                            Bug Report
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('FEEDBACK')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${type === 'FEEDBACK'
                                    ? 'bg-white dark:bg-dark-bg text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                }`}
                        >
                            <MessageSquare size={16} />
                            Feedback
                        </button>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-800 dark:text-slate-100 font-medium transition-all"
                            placeholder={type === 'BUG' ? "e.g., Error on Leave Page" : "e.g., Suggestion for Dashboard"}
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-800 dark:text-slate-100 text-sm resize-none transition-all"
                            placeholder="Describe the issue or feedback in detail..."
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                            Screenshots (Optional)
                        </label>
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 transition-colors hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-800/30">
                            <input
                                type="file"
                                id="feedback-files"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="feedback-files" className="cursor-pointer flex flex-col items-center gap-2">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-full text-indigo-500 dark:text-indigo-400">
                                    <Upload size={20} />
                                </div>
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                    Click to upload images
                                </span>
                                <span className="text-xs text-slate-400">
                                    PNG, JPG up to 50MB
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Preview Images */}
                    {files.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                            {files.map((file, idx) => (
                                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt="preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeFile(idx)}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 hover:scale-100"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Report"
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default FeedbackModal;
