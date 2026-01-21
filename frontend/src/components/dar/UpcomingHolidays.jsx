import React, { useEffect, useState } from 'react';
import { Calendar, PartyPopper } from 'lucide-react';
import api from '../../services/api';

const UpcomingHolidays = () => {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHolidays = async () => {
            try {
                const res = await api.get('/holiday');
                // The API returns all holidays for the org: { ok: true, holidays: [...] }
                const allHolidays = res.data.holidays || [];

                // Filter for holidays equal to or after today
                const todayStr = new Date().toISOString().split('T')[0];
                const upcoming = allHolidays
                    .filter(h => h.holiday_date >= todayStr)
                    .sort((a, b) => new Date(a.holiday_date) - new Date(b.holiday_date));

                // Transform to UI format expected below { date, name }
                const transformed = upcoming.map(h => ({
                    name: h.holiday_name,
                    date: h.holiday_date
                }));

                setHolidays(transformed.slice(0, 5));
            } catch (error) {
                console.error("Failed to load upcoming holidays", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHolidays();
    }, []);

    if (loading) return null;

    return (
        <div className="bg-white dark:bg-dark-card p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3">
            <h5 className="font-semibold text-gray-700 dark:text-gray-200 text-sm flex items-center gap-2">
                <div className="p-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded">
                    <PartyPopper size={14} />
                </div>
                Upcoming Holidays
            </h5>

            {holidays.length === 0 ? (
                <div className="text-xs text-gray-400 dark:text-slate-500 text-center py-2">No holidays coming up soon.</div>
            ) : (
                <div className="space-y-3">
                    {holidays.map((holiday, idx) => {
                        const dateObj = new Date(`${holiday.date}T12:00:00`);
                        return (
                            <div key={idx} className="flex gap-3 items-center group">
                                {/* Date Box */}
                                <div className="shrink-0 w-10 h-10 rounded-lg flex flex-col items-center justify-center border font-medium text-xs bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-800 text-green-700 dark:text-green-300">
                                    <span className="uppercase text-[9px] font-bold opacity-70">
                                        {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                                    </span>
                                    <span className="text-sm font-bold leading-none">
                                        {dateObj.getDate()}
                                    </span>
                                </div>

                                {/* Details */}
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                        {holiday.name}
                                    </p>
                                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                                        {dateObj.toLocaleDateString('en-US', { weekday: 'long' })}
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

export default UpcomingHolidays;
