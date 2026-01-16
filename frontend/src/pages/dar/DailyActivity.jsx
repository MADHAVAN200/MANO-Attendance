import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { darService } from '../../services/mockDarService';
import MultiDayTimeline from '../../components/dar/MultiDayTimeline';
import MiniCalendar from '../../components/dar/MiniCalendar';
import UpcomingMeetings from '../../components/dar/UpcomingMeetings';
import UpcomingHolidays from '../../components/dar/UpcomingHolidays';
import TaskCreationPanel from '../../components/dar/TaskCreationPanel';
import EventMeetingModal from '../../components/dar/EventMeetingModal'; // Import
import { Plus, ChevronDown, Calendar, CheckSquare, Video } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';


const DailyActivity = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [daysToShow, setDaysToShow] = useState(7);
    const [tasks, setTasks] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Modal State
    const [eventModal, setEventModal] = useState({ isOpen: false, type: 'Meeting' }); // New State

    // Mode State
    const [sidebarMode, setSidebarMode] = useState('default'); // 'default' | 'create-task'

    // Load data for a range (e.g., selected date + N days)
    useEffect(() => {
        fetchRangeData();
    }, [selectedDate, daysToShow]);

    const handleDateRangeSelect = (range) => {
        if (typeof range === 'string') {
            setSelectedDate(range);
            setDaysToShow(7); // Default to 7 days if simple selection, or maybe 1? Let's stick to 7 for consistency unless range specified
        } else if (range.start && range.end) {
            setSelectedDate(range.start);
            // Calculate days difference
            const d1 = new Date(range.start);
            const d2 = new Date(range.end);
            const diffTime = Math.abs(d2 - d1);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            setDaysToShow(diffDays < 1 ? 1 : diffDays);
        }
    };

    const fetchRangeData = async () => {
        setLoading(true);
        try {
            // Fetch N days of data starting from selectedDate
            const rangeDates = [];
            for (let i = 0; i < daysToShow; i++) {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() + i);
                rangeDates.push(d.toISOString().split('T')[0]);
            }

            // Mock fetching loop (in real world, single API call for range)
            const allTasks = [];
            const attMap = {};

            for (const date of rangeDates) {
                const t = await darService.getTasks(date);
                const a = await darService.getAttendanceStatus(date);
                allTasks.push(...t);
                attMap[date] = a;
            }

            setTasks(allTasks);
            setAttendanceData(attMap);

        } catch (error) {
            console.error(error);
            toast.error("Failed to load schedule.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = (type) => {
        setIsCreateOpen(false);
        if (type === 'Task') {
            setSidebarMode('create-task');
        } else if (type === 'Event' || type === 'Meeting') {
            setEventModal({ isOpen: true, type });
        } else {
            toast.info(`Create ${type} - Coming Soon`);
        }
    };

    // Live update from TaskCreationPanel
    const handleTaskPreviewUpdate = (partials) => {
        // partials = { id, title, startTime, endTime, date, type, deleted }

        if (partials.deleted) {
            setTasks(prev => prev.filter(t => t.id !== partials.id));
            return;
        }

        // Check if task exists in state (by temp id)
        setTasks(prev => {
            const exists = prev.find(t => t.id === partials.id);
            if (exists) {
                return prev.map(t => t.id === partials.id ? { ...t, ...partials } : t);
            } else {
                // Add new task skeleton
                if (partials.startTime) {
                    return [...prev, partials];
                }
                return prev;
            }
        });
    };

    return (
        <DashboardLayout title="Daily Activity Report">
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">

                {/* Left Sidebar (Dynamic Width) */}
                <motion.div
                    layout
                    initial={false}
                    animate={{ width: sidebarMode === 'create-task' ? 420 : 300 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="shrink-0 flex flex-col gap-6"
                >
                    <AnimatePresence mode="wait">
                        {sidebarMode === 'create-task' ? (
                            <TaskCreationPanel
                                key="task-panel"
                                onClose={() => setSidebarMode('default')}
                                onUpdate={handleTaskPreviewUpdate}
                                initialTimeIn={attendanceData[new Date().toISOString().split('T')[0]]?.timeIn || "09:00"}
                            />
                        ) : (
                            <motion.div
                                key="default-sidebar"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col gap-6 w-full"
                            >
                                {/* Create Button Dropdown */}
                                <div className="relative z-20">
                                    <button
                                        onClick={() => setIsCreateOpen(!isCreateOpen)}
                                        className={`w-full py-3 px-4 bg-white dark:bg-dark-card border shadow-sm rounded-full flex items-center justify-between transition-all ${isCreateOpen ? 'ring-2 ring-indigo-100 dark:ring-indigo-900 border-indigo-200 dark:border-indigo-800' : 'border-slate-200 dark:border-slate-700 hover:shadow-md'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-1 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                                                <Plus size={24} />
                                            </div>
                                            <span className="font-semibold text-gray-700 dark:text-gray-200">Create</span>
                                        </div>
                                        <ChevronDown
                                            size={18}
                                            className={`text-gray-400 transition-transform duration-200 ${isCreateOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    {/* Dropdown */}
                                    {isCreateOpen && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-card rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-2 animate-in fade-in zoom-in-95 duration-100">
                                            <button onClick={() => handleCreate('Event')} className="flex items-center gap-3 w-full p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg text-gray-600 dark:text-gray-300 text-sm">
                                                <Calendar size={18} className="text-indigo-500" /> Event
                                            </button>
                                            <button onClick={() => handleCreate('Meeting')} className="flex items-center gap-3 w-full p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg text-gray-600 dark:text-gray-300 text-sm">
                                                <Video size={18} className="text-purple-500" /> Meeting
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Mini Calendar */}
                                <MiniCalendar
                                    selectedDate={selectedDate}
                                    endDate={(() => {
                                        const d = new Date(selectedDate);
                                        d.setDate(d.getDate() + daysToShow - 1);
                                        return d.toISOString().split('T')[0];
                                    })()}
                                    onDateSelect={handleDateRangeSelect} // Updated handler
                                />

                                {/* Add Task Button (Standalone) */}
                                <button
                                    onClick={() => handleCreate('Task')}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors active:scale-95"
                                >
                                    <CheckSquare size={18} />
                                    <span>Add Daily Tasks</span>
                                </button>

                                {/* Upcoming Meetings Widget */}
                                <UpcomingMeetings />

                                {/* Upcoming Holidays Widget */}
                                <UpcomingHolidays />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>


                {/* Main Content (Horizontal Multi-Day Timeline) */}
                <motion.div
                    layout
                    className="flex-1 min-w-0 bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col"
                >
                    <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-dark-card/50">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                {new Date(selectedDate).toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </h2>
                            {sidebarMode === 'create-task' && (
                                <motion.span
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs font-bold animate-pulse"
                                >
                                    Editing Today...
                                </motion.span>
                            )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                            {daysToShow}-Day View
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 z-50">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : (
                            <MultiDayTimeline
                                tasks={tasks}
                                startDate={selectedDate}
                                daysToShow={daysToShow} // Dynamic days
                                attendanceData={attendanceData}
                                onEditTask={(t) => toast.info(`Edit ${t.title}`)}
                            />
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Draggable Event/Meeting Modal */}
            <AnimatePresence>
                {eventModal.isOpen && (
                    <EventMeetingModal
                        type={eventModal.type}
                        initialDate={selectedDate}
                        onClose={() => setEventModal({ ...eventModal, isOpen: false })}
                        onSave={(newData) => {
                            setTasks(prev => [...prev, newData]);
                            toast.success(`${eventModal.type} created successfully!`);
                        }}
                    />
                )}
            </AnimatePresence>

        </DashboardLayout>
    );
};

export default DailyActivity;
