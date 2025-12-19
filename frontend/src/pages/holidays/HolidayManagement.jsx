import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import {
    Calendar,
    MapPin,
    Upload,
    Plus,
    Trash2,
    MoreVertical,
    Search,
    Filter,
    X
} from 'lucide-react';

const HolidayManagement = () => {
    const [holidays, setHolidays] = useState([
        { id: 1, name: 'New Year\'s Day', date: '2024-01-01', type: 'Public', locations: ['All Locations'] },
        { id: 2, name: 'Republic Day', date: '2024-01-26', type: 'Public', locations: ['All Locations'] },
        { id: 3, name: 'Holi', date: '2024-03-25', type: 'Optional', locations: ['Mumbai', 'Delhi'] },
        { id: 4, name: 'Good Friday', date: '2024-03-29', type: 'Public', locations: ['All Locations'] },
    ]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newHoliday, setNewHoliday] = useState({
        name: '',
        date: '',
        type: 'Public',
        locations: []
    });

    const locationsList = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'All Locations'];

    const handleAddHoliday = (e) => {
        e.preventDefault();
        const holiday = {
            id: holidays.length + 1,
            ...newHoliday,
            locations: newHoliday.locations.length > 0 ? newHoliday.locations : ['All Locations']
        };
        setHolidays([...holidays, holiday]);
        setIsAddModalOpen(false);
        setNewHoliday({ name: '', date: '', type: 'Public', locations: [] });
    };

    const toggleLocation = (loc) => {
        if (loc === 'All Locations') {
            setNewHoliday({ ...newHoliday, locations: ['All Locations'] });
            return;
        }

        let updatedLocs = [...newHoliday.locations];
        if (updatedLocs.includes('All Locations')) {
            updatedLocs = []; // Clear 'All' if selecting specific
        }

        if (updatedLocs.includes(loc)) {
            updatedLocs = updatedLocs.filter(l => l !== loc);
        } else {
            updatedLocs.push(loc);
        }
        setNewHoliday({ ...newHoliday, locations: updatedLocs });
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this holiday?')) {
            setHolidays(holidays.filter(h => h.id !== id));
        }
    };

    return (
        <DashboardLayout title="Holiday Management">
            <div className="space-y-6">

                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-dark-card p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search holidays..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 dark:text-slate-200"
                        />
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                            <Upload size={16} />
                            <span className="hidden sm:inline">Import CSV</span>
                            <span className="sm:hidden">Import</span>
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors"
                        >
                            <Plus size={16} />
                            <span>Add Holiday</span>
                        </button>
                    </div>
                </div>

                {/* Holiday List Table */}
                <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                                    <th className="px-6 py-4">Holiday Name</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Applicable Locations</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {holidays.map((holiday) => (
                                    <tr key={holiday.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800 dark:text-white">{holiday.name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-400" />
                                                {new Date(holiday.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'short' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${holiday.type === 'Public'
                                                ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
                                                : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
                                                }`}>
                                                {holiday.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {holiday.locations.map((loc, idx) => (
                                                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs">
                                                        <MapPin size={10} /> {loc}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(holiday.id)}
                                                className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {holidays.length === 0 && (
                            <div className="text-center py-12 text-slate-400">
                                <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No holidays added yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Holiday Modal */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-dark-card rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-700">
                                <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Add New Holiday</h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleAddHoliday} className="p-5 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Holiday Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newHoliday.name}
                                        onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 dark:text-slate-200"
                                        placeholder="e.g. Independence Day"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={newHoliday.date}
                                            onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 dark:text-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                                        <select
                                            value={newHoliday.type}
                                            onChange={(e) => setNewHoliday({ ...newHoliday, type: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 dark:text-slate-200 cursor-pointer"
                                        >
                                            <option value="Public">Public</option>
                                            <option value="Optional">Optional</option>
                                            <option value="Observance">Observance</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Applicable Locations</label>
                                    <div className="flex flex-wrap gap-2">
                                        {locationsList.map(loc => (
                                            <button
                                                key={loc}
                                                type="button"
                                                onClick={() => toggleLocation(loc)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${newHoliday.locations.includes(loc)
                                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-300'
                                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                    }`}
                                            >
                                                {loc}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors"
                                    >
                                        Add Holiday
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};

export default HolidayManagement;
