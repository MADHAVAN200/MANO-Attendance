import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import {
    Map,
    MapPin,
    Plus,
    Search,
    Navigation,
    Users,
    Settings,
    ToggleLeft,
    ToggleRight,
    Crosshair,
    MoreVertical,
    Check
} from 'lucide-react';

const GeoFencing = () => {
    // --- STATE ---
    const [locations, setLocations] = useState([
        { id: 1, name: 'Head Office', address: '123 Business Park, Mumbai', radius: 100, lat: 19.0760, lng: 72.8777, active: true, assignedEmployees: 45 },
        { id: 2, name: 'Andheri Branch', address: 'Times Square, Andheri East', radius: 50, lat: 19.1136, lng: 72.8697, active: true, assignedEmployees: 12 },
        { id: 3, name: 'Pune Hub', address: 'Hinjewadi Phase 1, Pune', radius: 200, lat: 18.5913, lng: 73.7389, active: false, assignedEmployees: 0 },
    ]);
    const [selectedLocation, setSelectedLocation] = useState(locations[0]);
    const [searchQuery, setSearchQuery] = useState('');

    // Mock Employees for Assignment
    const [employees, setEmployees] = useState([
        { id: 1, name: 'Sarah Wilson', role: 'UX Designer', assignedTo: 1 },
        { id: 2, name: 'Mike Johnson', role: 'Developer', assignedTo: 1 },
        { id: 3, name: 'Anna Davis', role: 'HR Manager', assignedTo: 2 },
        { id: 4, name: 'James Wilson', role: 'Sales rep', assignedTo: null },
    ]);

    const handleRadiusChange = (id, newRadius) => {
        setLocations(locations.map(loc => loc.id === id ? { ...loc, radius: newRadius } : loc));
        if (selectedLocation.id === id) {
            setSelectedLocation({ ...selectedLocation, radius: newRadius });
        }
    };

    const toggleLocationStatus = (id) => {
        setLocations(locations.map(loc => loc.id === id ? { ...loc, active: !loc.active } : loc));
        if (selectedLocation.id === id) {
            setSelectedLocation({ ...selectedLocation, active: !selectedLocation.active });
        }
    };

    const assignEmployee = (empId, locId) => {
        setEmployees(employees.map(emp => emp.id === empId ? { ...emp, assignedTo: locId } : emp));
        // Update counts (simple recalucation for demo)
    };


    return (
        <DashboardLayout title="Geo-Fencing">
            <div className="flex h-[calc(100vh-140px)] gap-6">

                {/* Left Panel: Locations List */}
                <div className="w-80 flex-shrink-0 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">

                    {/* Header / Search */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-slate-800 dark:text-white">Locations</h3>
                            <button className="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                                <Plus size={18} />
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search offices..."
                                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {locations.map(loc => (
                            <div
                                key={loc.id}
                                onClick={() => setSelectedLocation(loc)}
                                className={`p-3 rounded-lg border transition-all cursor-pointer group ${selectedLocation.id === loc.id
                                        ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-900/50 shadow-sm'
                                        : 'bg-white dark:bg-dark-card border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`font-semibold text-sm ${selectedLocation.id === loc.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'}`}>{loc.name}</h4>
                                    {loc.active ? (
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                                    ) : (
                                        <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">{loc.address}</p>
                                <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                                    <span className="flex items-center gap-1"><Crosshair size={10} /> {loc.radius}m</span>
                                    <span className="flex items-center gap-1"><Users size={10} /> {employees.filter(e => e.assignedTo === loc.id).length} Active</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Center: Map View (Mock) */}
                <div className="flex-1 relative bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden group">

                    {/* Mock Map Background */}
                    <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 opacity-50 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center grayscale contrast-[.8] dark:invert"></div>

                    {/* Pins (Simulated positions) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        {/* Radius Circle */}
                        <div
                            className="rounded-full border-2 border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center animate-pulse"
                            style={{
                                width: `${selectedLocation.radius * 2}px`,
                                height: `${selectedLocation.radius * 2}px`,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {/* Pin */}
                            <div className="relative text-indigo-600 dark:text-indigo-400 drop-shadow-lg transform -translate-y-1/2">
                                <MapPin size={40} fill="currentColor" className="text-white dark:text-dark-card" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* Map Controls Overlay */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <button className="p-2 bg-white dark:bg-dark-card rounded-lg shadow-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors">
                            <Navigation size={20} />
                        </button>
                        <button className="p-2 bg-white dark:bg-dark-card rounded-lg shadow-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors">
                            <Plus size={20} />
                        </button>
                    </div>

                    {/* Edit Overlay (Bottom Info Panel) */}
                    <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-dark-card/90 backdrop-blur-md p-5 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 flex flex-col md:flex-row gap-6 items-end md:items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white">{selectedLocation.name}</h2>
                                <button
                                    onClick={() => toggleLocationStatus(selectedLocation.id)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${selectedLocation.active ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${selectedLocation.active ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <MapPin size={14} /> {selectedLocation.address}
                            </p>
                        </div>

                        <div className="w-full md:w-64">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <Crosshair size={14} className="text-indigo-500" /> Geofence Radius
                                </label>
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">{selectedLocation.radius}m</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="500"
                                step="10"
                                value={selectedLocation.radius}
                                onChange={(e) => handleRadiusChange(selectedLocation.id, parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Panel: Employee Assignment */}
                <div className="w-80 flex-shrink-0 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            <Users size={18} /> Assigned Staff
                        </h3>
                    </div>
                    <div className="p-2 flex-1 overflow-y-auto space-y-1">
                        {employees.map(emp => {
                            const isAssigned = emp.assignedTo === selectedLocation.id;
                            return (
                                <div
                                    key={emp.id}
                                    className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-400">
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800 dark:text-white">{emp.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{emp.role}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => assignEmployee(emp.id, isAssigned ? null : selectedLocation.id)}
                                        className={`p-1.5 rounded-md transition-all ${isAssigned
                                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200'
                                            }`}
                                    >
                                        {isAssigned ? <Check size={16} /> : <Plus size={16} />}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default GeoFencing;
