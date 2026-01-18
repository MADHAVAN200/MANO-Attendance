import React, { useEffect, useState } from 'react';
import { Video, CalendarDays } from 'lucide-react';
import api from '../../services/api';

const UpcomingMeetings = () => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                const nextWeekStr = nextWeek.toISOString().split('T')[0];

                const res = await api.get('/dar/events/list', {
                    params: {
                        type: 'MEETING',
                        date_from: today,
                        date_to: nextWeekStr
                    }
                });

                // Transform snake_case to UI props
                const rawData = res.data.data || [];
                const transformed = rawData.map(m => ({
                    id: m.event_id,
                    title: m.title,
                    date: m.event_date, // "2024-01-18"
                    startTime: m.start_time ? m.start_time.slice(0, 5) : '',
                    endTime: m.end_time ? m.end_time.slice(0, 5) : ''
                }));

                // Limit to top 5 maybe?
                setMeetings(transformed.slice(0, 5));
            } catch (error) {
                console.error("Failed to load upcoming meetings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMeetings();
    }, []);

    if (loading) return <div className="p-4 text-xs text-center text-gray-400">Loading meetings...</div>;

    return (
        <div className="bg-white dark:bg-dark-card p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3">
            <h5 className="font-semibold text-gray-700 dark:text-gray-200 text-sm flex items-center gap-2">
                <div className="p-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded">
                    <Video size={14} />
                </div>
                Upcoming Meetings
            </h5>

            {meetings.length === 0 ? (
                <div className="text-xs text-gray-400 dark:text-slate-500 text-center py-4">No upcoming meetings this week.</div>
            ) : (
                <div className="space-y-3">
                    {meetings.map(meeting => {
                        const dateObj = new Date(`${meeting.date}T12:00:00`);
                        const isToday = new Date().toISOString().split('T')[0] === meeting.date;

                        return (
                            <div key={meeting.id} className="flex gap-3 items-start group">
                                {/* Date Box */}
                                <div className={`
                            shrink-0 w-10 h-10 rounded-lg flex flex-col items-center justify-center border font-medium text-xs
                            ${isToday ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-100 dark:border-purple-800 text-purple-700 dark:text-purple-300' : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-500 dark:text-slate-400'}
                        `}>
                                    <span className="uppercase text-[9px] font-bold opacity-70">
                                        {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                                    </span>
                                    <span className="text-sm font-bold leading-none">
                                        {dateObj.getDate()}
                                    </span>
                                </div>

                                {/* Details */}
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                        {meeting.title}
                                    </p>
                                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                                        {meeting.startTime} - {meeting.endTime}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default UpcomingMeetings;
