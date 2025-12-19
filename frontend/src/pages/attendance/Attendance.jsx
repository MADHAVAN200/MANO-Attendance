import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import {
    ArrowRight,
    LogOut,
    MapPin,
    Calendar as CalendarIcon
} from 'lucide-react';

const Attendance = () => {
    // Initialize with today's date formatted for input type="date" (YYYY-MM-DD)
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(formattedToday);

    // Helper to format the displayed date
    const formatDateDisplay = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const timelineSessions = [
        {
            id: 2,
            inTime: '02:15 PM',
            inLocation: 'Client Meeting - Lower Parel',
            inStatus: 'ontime',
            outTime: null, // Active session
            outLocation: null,
            outStatus: null
        },
        {
            id: 1,
            inTime: '09:15 AM',
            inLocation: 'Shop No 13, West View, Dadar West',
            inStatus: 'ontime',
            outTime: '01:30 PM',
            outLocation: 'Shop No 13, West View, Dadar West',
            outStatus: 'early'
        }
    ];

    return (
        <DashboardLayout title="Attendance">
            <div className="space-y-8">

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <button className="flex items-center justify-center gap-3 bg-indigo-600 text-white h-24 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 hover:bg-indigo-700 hover:shadow-xl transition-all active:scale-95 group">
                        <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                            <ArrowRight size={24} />
                        </div>
                        <span className="text-2xl font-bold">Time In</span>
                    </button>

                    <button className="flex items-center justify-center gap-3 bg-slate-800 dark:bg-slate-700 text-white h-24 rounded-2xl shadow-lg shadow-slate-200 dark:shadow-slate-900/30 hover:bg-slate-900 dark:hover:bg-slate-600 hover:shadow-xl transition-all active:scale-95 group">
                        <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                            <LogOut size={24} />
                        </div>
                        <span className="text-2xl font-bold">Time Out</span>
                    </button>
                </div>

                {/* Date Picker Header */}
                <div className="flex justify-center">
                    <div className="relative cursor-pointer group">
                        <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 font-medium bg-white dark:bg-dark-card py-2.5 px-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
                            <CalendarIcon size={18} />
                            <span>{formatDateDisplay(selectedDate)}</span>
                        </div>
                        {/* 
                   Hidden Date Input: 
                   Positioned absolutely over the custom trigger with 0 opacity.
                   This makes the custom UI clickable to open the native picker.
                */}
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                    </div>
                </div>

                {/* Timeline Sessions (Paired Cards) */}
                <div className="space-y-4">
                    {timelineSessions.map((session) => (
                        <div key={session.id} className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative transition-colors duration-300">
                            {/* Connector Line (Vertical) - purely visual decoration for the card */}
                            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-100 dark:bg-slate-700 hidden sm:block"></div>

                            <div className="grid grid-cols-1 sm:grid-cols-2">

                                {/* Time In Column */}
                                <div className="p-5 flex flex-col gap-2 relative">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">TIME IN</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-slate-800 dark:text-white">{session.inTime}</span>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 uppercase">{session.inStatus}</span>
                                    </div>
                                    <div className="flex items-start gap-1.5 text-slate-500 dark:text-slate-400 text-xs mt-1">
                                        <MapPin size={14} className="flex-shrink-0 mt-0.5 text-slate-400 dark:text-slate-500" />
                                        <span className="line-clamp-2">{session.inLocation}</span>
                                    </div>
                                </div>

                                {/* Time Out Column */}
                                <div className="p-5 flex flex-col gap-2 relative border-t sm:border-t-0 border-slate-100 dark:border-slate-700 sm:pl-8">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-2.5 h-2.5 rounded-full ${session.outTime ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">TIME OUT</span>
                                    </div>

                                    {session.outTime ? (
                                        <>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl font-bold text-slate-800 dark:text-white">{session.outTime}</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${session.outStatus === 'early' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                                                    }`}>{session.outStatus}</span>
                                            </div>
                                            <div className="flex items-start gap-1.5 text-slate-500 dark:text-slate-400 text-xs mt-1">
                                                <MapPin size={14} className="flex-shrink-0 mt-0.5 text-slate-400 dark:text-slate-500" />
                                                <span className="line-clamp-2">{session.outLocation}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="h-full flex flex-col justify-center">
                                            <span className="text-4xl font-light text-slate-300 dark:text-slate-600">-</span>
                                            <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">Active Session</span>
                                        </div>
                                    )}

                                </div>

                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </DashboardLayout>
    );
};

export default Attendance;
