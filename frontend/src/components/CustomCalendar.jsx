import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CustomCalendar = ({ selectedDate, onChange, onClose }) => {
    // Parse the initial date or default to today
    const initialDate = selectedDate ? new Date(selectedDate) : new Date();

    // State for the currently viewed month/year
    const [currentDate, setCurrentDate] = useState(initialDate);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Days of week headers
    const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    // Helper to get days in month
    const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();

    // Helper to get day of week for the 1st of the month
    const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Previous month (for padding)
    const prevMonthDays = getDaysInMonth(year, month - 1);

    // Generate grid cells
    const days = [];

    // Padding for previous month
    for (let i = 0; i < firstDay; i++) {
        days.push({ day: prevMonthDays - firstDay + i + 1, type: 'prev' });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({ day: i, type: 'current' });
    }

    // Padding for next month (to complete the grid of 35 or 42 cells)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
        days.push({ day: i, type: 'next' });
    }

    // Navigation Handlers
    const prevMonth = (e) => {
        e.stopPropagation();
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = (e) => {
        e.stopPropagation();
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleDateClick = (dayObj) => {
        if (dayObj.type === 'prev') {
            const newDate = new Date(year, month - 1, dayObj.day);
            // formatting manually to avoid timezone issues: YYYY-MM-DD
            onChange(formatDate(newDate));
        } else if (dayObj.type === 'next') {
            const newDate = new Date(year, month + 1, dayObj.day);
            onChange(formatDate(newDate));
        } else {
            const newDate = new Date(year, month, dayObj.day);
            onChange(formatDate(newDate));
        }
        onClose(); // Close picker after selection
    };

    // YYYY-MM-DD formatter
    const formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    // Check if a day is the selected date
    const isSelected = (dayObj) => {
        if (dayObj.type !== 'current') return false; // simple check logic for current month view

        // Accurate check requires reconstructing full date
        const checkDate = new Date(year, month, dayObj.day);
        const sDate = new Date(selectedDate);

        return checkDate.getFullYear() === sDate.getFullYear() &&
            checkDate.getMonth() === sDate.getMonth() &&
            checkDate.getDate() === sDate.getDate();
    };

    return (
        <div
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-dark-card rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 w-[320px] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={prevMonth}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="font-bold text-slate-800 dark:text-white">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <button
                    onClick={nextMonth}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 mb-2">
                {daysOfWeek.map((d) => (
                    <div key={d} className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 py-1">
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((dayObj, index) => {
                    const selected = isSelected(dayObj);
                    const isCurrentMonth = dayObj.type === 'current';

                    return (
                        <button
                            key={index}
                            onClick={() => handleDateClick(dayObj)}
                            className={`
                                h-9 w-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all
                                ${isCurrentMonth
                                    ? selected
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
                                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    : 'text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }
                            `}
                        >
                            {dayObj.day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CustomCalendar;
