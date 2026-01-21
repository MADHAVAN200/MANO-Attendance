import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { X, Plus, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const TaskCreationPanel = ({ onClose, onUpdate, initialTimeIn = "09:30", highlightTaskId }) => {


    // Helper to add minutes to HH:MM time
    const addMinutes = (timeStr, minutes) => {
        if (!timeStr) return '';
        const [h, m] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(h, m + minutes);
        return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    };

    // Helper: check if t1 < t2
    const isBefore = (t1, t2) => {
        if (!t1 || !t2) return false;
        return t1.localeCompare(t2) < 0;
    };

    const [inputs, setInputs] = useState([]);

    // Auto-scroll to highlight
    useEffect(() => {
        if (highlightTaskId) {
            // Slight delay to ensure DOM is ready
            setTimeout(() => {
                const el = document.getElementById(`task-card-${highlightTaskId}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [highlightTaskId, inputs]);

    // Initialize defaults on mount
    // Initialize defaults on mount
    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const res = await api.get(`/dar/activities/list?date=${today}`);
                const activities = res.data.data.map(a => ({
                    id: a.activity_id,
                    title: a.title,
                    description: a.description,
                    startTime: a.start_time ? a.start_time.slice(0, 5) : '',
                    endTime: a.end_time ? a.end_time.slice(0, 5) : '',
                    isValid: true,
                    isSaved: true // Mark as already saved
                }));
                // If no activities, maybe add one empty slot?
                if (activities.length === 0) {
                    setInputs([{
                        id: `new-${Date.now()}`,
                        title: '',
                        description: '',
                        startTime: initialTimeIn, // Start at Time In
                        endTime: addMinutes(initialTimeIn, 60),
                        isValid: true,
                        error: null,
                        isSaved: false
                    }]);
                } else {
                    setInputs(activities);
                }
            } catch (err) {
                console.error("Failed to fetch activities", err);
            }
        };

        fetchActivities();
    }, [initialTimeIn]);


    const handleInputChange = (index, field, value) => {
        const newInputs = [...inputs];
        let task = { ...newInputs[index], [field]: value, isSaved: false }; // Mark modified

        // Validation
        if (field === 'startTime') {
            if (isBefore(value, initialTimeIn)) {
                task.error = "Cannot start before Time In";
            } else {
                task.error = null;
            }
        }

        newInputs[index] = task;
        setInputs(newInputs);

        // Update Parent
        if (task.startTime && !task.error) {
            // Logic: If title is empty, send "Task X". Ensure description is passed.
            const displayTitle = task.title.trim() === '' ? `Task ${index + 1}` : task.title;

            onUpdate({
                id: task.id,
                title: displayTitle,
                description: task.description,
                startTime: task.startTime,
                endTime: task.endTime,
                type: 'task',
                date: new Date().toISOString().split('T')[0]
            });
        }
    };

    const handleAddAnother = () => {
        const lastTask = inputs[inputs.length - 1];
        let nextStart = lastTask ? lastTask.endTime : initialTimeIn;
        let nextEnd = addMinutes(nextStart, 60);

        const newTask = {
            id: `new-${inputs.length + Math.random().toString(36).substr(2, 5)}`,
            title: '',
            description: '',
            startTime: nextStart,
            endTime: nextEnd,
            isValid: true,
            error: null
        };

        const newIndex = inputs.length;
        setInputs([...inputs, newTask]);

        onUpdate({
            id: newTask.id,
            title: `Task ${newIndex + 1}`,
            description: '',
            startTime: newTask.startTime,
            endTime: newTask.endTime,
            type: 'task',
            date: new Date().toISOString().split('T')[0]
        });
    };

    const handleDelete = async (index) => {
        const task = inputs[index];
        // If it's saved in DB (has valid ID not starting with 'new-'), delete from DB
        const isExisting = task.id && !String(task.id).startsWith('new-');

        if (isExisting) {
            try {
                await api.delete(`/dar/activities/delete/${task.id}`);
                // Notify parent to update preview
                onUpdate({ id: task.id, deleted: true });
            } catch (err) {
                alert("Failed to delete task: " + err.response?.data?.message);
                return;
            }
        }

        const newInputs = inputs.filter((_, i) => i !== index);
        setInputs(newInputs);
    };

    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full h-full bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 flex flex-col overflow-hidden"
        >

            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-start bg-white dark:bg-dark-card z-10">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">Daily Tasks</h3>
                    <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">Plan your day effectively</p>

                    <div className="flex items-center gap-2 mt-3 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full w-fit border border-emerald-100 dark:border-emerald-800">
                        <Clock size={14} />
                        <span>Time In: {initialTimeIn}</span>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-full text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Task List Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                {inputs.map((task, i) => (
                    <div id={`task-card-${task.id}`} key={task.id} className={`group relative bg-white dark:bg-slate-800 rounded-xl border transition-all p-3 flex flex-col gap-3 ${task.error ? 'border-red-200 ring-1 ring-red-100 dark:border-red-900/50 dark:ring-red-900/30' : 'border-gray-100 dark:border-slate-700 hover:border-indigo-100 dark:hover:border-indigo-900 hover:shadow-sm'} ${highlightTaskId === task.id ? 'ring-2 ring-indigo-500 border-indigo-500' : ''}`}>
                        {/* Indicator Line */}
                        <div className={`absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full transition-colors ${task.error ? 'bg-red-400' : 'bg-gray-200 group-hover:bg-indigo-500'}`}></div>

                        {/* Top Row: TITLE INPUT & Hidden Delete */}
                        <div className="flex items-center justify-between relative border-b border-gray-50 pb-2 mb-1">
                            {/* TITLE INPUT replacing the Label */}
                            <input
                                type="text"
                                placeholder={`TASK ${i + 1 < 10 ? '0' + (i + 1) : i + 1}`}
                                value={task.title}
                                onChange={(e) => handleInputChange(i, 'title', e.target.value)}
                                className="w-full text-xs font-bold text-gray-600 dark:text-gray-200 placeholder:text-gray-300 dark:placeholder:text-slate-500 placeholder:font-bold bg-transparent border-none p-0 focus:ring-0 uppercase tracking-wider"
                            />

                            {/* Hidden Delete Button (Top Right) */}
                            <button
                                onClick={() => handleDelete(i)}
                                className="absolute -top-1 -right-1 p-1.5 bg-red-50 text-red-400 rounded-full hover:bg-red-100 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                title="Remove Task"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {/* DESCRIPTION INPUT */}
                            <input
                                type="text"
                                placeholder="Add description..."
                                value={task.description}
                                onChange={(e) => handleInputChange(i, 'description', e.target.value)}
                                className="w-full text-sm font-medium text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-slate-500 placeholder:font-normal bg-transparent border-none p-0 focus:ring-0"
                            />

                            {/* Time Intervals */}
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3 pt-2 border-t border-dashed border-gray-100 dark:border-slate-700">
                                    <div className={`flex-1 bg-gray-50 dark:bg-slate-700/50 rounded-lg px-2 py-1.5 focus-within:bg-white dark:focus-within:bg-slate-700 focus-within:ring-2 transition-all flex items-center gap-2 ${task.error ? 'focus-within:ring-red-500/20' : 'focus-within:ring-indigo-500/20'}`}>
                                        <Clock size={14} className={task.error ? "text-red-400" : "text-gray-400 dark:text-slate-500"} />
                                        <input
                                            type="time"
                                            value={task.startTime}
                                            onChange={(e) => handleInputChange(i, 'startTime', e.target.value)}
                                            className={`w-full bg-transparent border-none p-0 text-xs font-medium focus:ring-0 ${task.error ? 'text-red-600' : 'text-gray-600 dark:text-gray-300'}`}
                                        />
                                    </div>
                                    <span className="text-gray-300">to</span>
                                    <div className="flex-1 bg-gray-50 dark:bg-slate-700/50 rounded-lg px-2 py-1.5 focus-within:bg-white dark:focus-within:bg-slate-700 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all flex items-center gap-2">
                                        <input
                                            type="time"
                                            value={task.endTime}
                                            onChange={(e) => handleInputChange(i, 'endTime', e.target.value)}
                                            className="w-full bg-transparent border-none p-0 text-xs font-medium text-gray-600 dark:text-gray-300 focus:ring-0 text-right"
                                        />
                                    </div>
                                </div>
                                {task.error && (
                                    <span className="text-[10px] text-red-500 font-medium flex items-center gap-1">
                                        <AlertCircle size={10} /> {task.error}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Unavailable Slot Placeholder */}
                <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex items-center justify-between opacity-70">
                    <span className="text-xs font-bold text-gray-400 uppercase">
                        End of Day
                    </span>
                    <div className="flex items-center gap-2 text-xs text-orange-500 font-medium">
                        <AlertCircle size={14} />
                        <span>Unavailable</span>
                    </div>
                </div>

                {/* Add New */}
                <button
                    onClick={handleAddAnother}
                    className="w-full py-4 border border-dashed border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center gap-2 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all text-sm font-bold"
                >
                    <Plus size={16} />
                    Add Another Task
                </button>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-dark-card">
                <button
                    className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg shadow-gray-200 dark:shadow-none transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2"
                    onClick={async () => {
                        // Filter for unsaved or modified tasks
                        const unsavedTasks = inputs.filter(t => !t.isSaved);

                        if (unsavedTasks.length === 0) {
                            onClose();
                            return;
                        }

                        // Submit sequentially
                        for (const task of unsavedTasks) {
                            try {
                                const payload = {
                                    title: task.title || "Untitled Task",
                                    description: task.description,
                                    start_time: task.startTime,
                                    end_time: task.endTime,
                                    activity_date: new Date().toISOString().split('T')[0],
                                    activity_type: 'TASK',
                                    status: 'COMPLETED'
                                };

                                // Check if it's an existing task (numeric ID or ID string not starting with 'new-')
                                const isExisting = task.id && !String(task.id).startsWith('new-');

                                if (isExisting) {
                                    await api.put(`/dar/activities/update/${task.id}`, payload);
                                } else {
                                    await api.post('/dar/activities/create', payload);
                                }

                                // visual success feedback could go here
                            } catch (err) {
                                alert(`Failed to save "${task.title}": ${err.response?.data?.message}`);
                                return; // Stop on error
                            }
                        }

                        // If all success
                        onClose();
                    }}
                >
                    Save & Continue
                </button>
            </div>

        </motion.div>
    );
};

export default TaskCreationPanel;
