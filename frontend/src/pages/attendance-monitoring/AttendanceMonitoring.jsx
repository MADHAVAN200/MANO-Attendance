import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import {
    Search,
    Filter,
    Clock,
    UserCheck,
    UserX,
    AlertTriangle,
    MoreVertical,
    Download,
    FileText,
    CheckCircle,
    XCircle,
    Calendar,
    ChevronRight,
    MessageSquare,
    Activity
} from 'lucide-react';

const AttendanceMonitoring = () => {
    const [activeTab, setActiveTab] = useState('live'); // 'live' | 'requests'
    const [selectedRequest, setSelectedRequest] = useState(1); // For Detail View

    // Mock Data - Live Attendance
    const [attendanceData, setAttendanceData] = useState([
        { id: 1, name: 'Arjun Mehta', role: 'Sales Executive', avatar: 'A', timeIn: '09:15 AM', timeOut: '-', status: 'Present', hours: '4h 30m', department: 'Sales' },
        { id: 2, name: 'Priya Sharma', role: 'Store Manager', avatar: 'P', timeIn: '09:00 AM', timeOut: '-', status: 'Present', hours: '4h 45m', department: 'Retail' },
        { id: 3, name: 'Rahul Verma', role: 'Inventory Specialist', avatar: 'R', timeIn: '10:30 AM', timeOut: '-', status: 'Late', hours: '3h 15m', department: 'Logistics' },
        { id: 4, name: 'Sneha Patil', role: 'Sales Executive', avatar: 'S', timeIn: '-', timeOut: '-', status: 'Absent', hours: '-', department: 'Sales' },
        { id: 5, name: 'Vikram Singh', role: 'Regional Manager', avatar: 'V', timeIn: '08:55 AM', timeOut: '01:00 PM', status: 'Half Day', hours: '4h 05m', department: 'Operations' },
        { id: 6, name: 'Anjali Gupta', role: 'HR Executive', avatar: 'A', timeIn: '09:30 AM', timeOut: '-', status: 'Present', hours: '4h 15m', department: 'HR' },
    ]);

    // Mock Data - Correction Requests
    const [requests, setRequests] = useState([
        {
            id: 1,
            name: 'Rahul Verma',
            role: 'Inventory Specialist',
            avatar: 'R',
            type: 'Missed Punch',
            date: '18 Dec 2023',
            requestedTime: '09:00 AM',
            systemTime: '-',
            reason: 'Forgot to punch in due to urgent delivery handling.',
            status: 'Pending',
            timeline: [
                { status: 'Request Submitted', time: '18 Dec, 10:15 AM', by: 'Rahul Verma' },
                { status: 'Under Review', time: '19 Dec, 09:00 AM', by: 'System' }
            ]
        },
        {
            id: 2,
            name: 'Sneha Patil',
            role: 'Sales Executive',
            avatar: 'S',
            type: 'Correction',
            date: '17 Dec 2023',
            requestedTime: '09:15 AM',
            systemTime: '10:45 AM',
            reason: 'Biometric issue, scanner was not working.',
            status: 'Pending',
            timeline: [
                { status: 'Request Submitted', time: '17 Dec, 11:30 AM', by: 'Sneha Patil' }
            ]
        },
        {
            id: 3,
            name: 'Arjun Mehta',
            role: 'Sales Executive',
            avatar: 'A',
            type: 'Overtime',
            date: '16 Dec 2023',
            requestedTime: '08:30 PM',
            systemTime: '06:30 PM',
            reason: 'Stayed late for year-end inventory audit.',
            status: 'Approved',
            timeline: [
                { status: 'Request Submitted', time: '16 Dec, 09:00 PM', by: 'Arjun Mehta' },
                { status: 'Approved', time: '17 Dec, 10:00 AM', by: 'Manager' }
            ]
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('All');

    // Stats
    const stats = [
        { label: 'Total Present', value: '42', icon: <UserCheck size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
        { label: 'Late Arrivals', value: '5', icon: <Clock size={20} />, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
        { label: 'Absent', value: '3', icon: <UserX size={20} />, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
        { label: 'On Break', value: '8', icon: <AlertTriangle size={20} />, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    ];

    // Filter Logic for Live Tab
    const filteredData = attendanceData.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = departmentFilter === 'All' || item.department === departmentFilter;
        return matchesSearch && matchesDept;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Present': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'Late': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'Absent': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'Half Day': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        }
    };

    const getRequestTypeStyle = (type) => {
        switch (type) {
            case 'Missed Punch': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
            case 'Correction': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
            case 'Overtime': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
            default: return 'text-slate-600 bg-slate-50';
        }
    };

    const handleApprove = (id) => {
        // Mock API call
        alert(`Request ${id} Approved`);
    };

    const handleReject = (id) => {
        // Mock API call
        alert(`Request ${id} Rejected`);
    };

    const selectedRequestData = requests.find(r => r.id === selectedRequest);

    return (
        <DashboardLayout title="Live Attendance">
            <div className="space-y-6">

                {/* Tabs */}
                <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('live')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'live' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        Live Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'requests' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        Correction Requests
                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">3</span>
                    </button>
                </div>

                {activeTab === 'live' ? (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-colors duration-300">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                                        <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stat.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                                        {stat.icon}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Main Content */}
                        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">

                            {/* Toolbar */}
                            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Real-time Monitoring</h2>

                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search employee..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full sm:w-64 transition-all"
                                        />
                                    </div>

                                    <div className="relative">
                                        <select
                                            value={departmentFilter}
                                            onChange={(e) => setDepartmentFilter(e.target.value)}
                                            className="appearance-none pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                                        >
                                            <option value="All">All Depts</option>
                                            <option value="Sales">Sales</option>
                                            <option value="Retail">Retail</option>
                                            <option value="Logistics">Logistics</option>
                                            <option value="Operations">Operations</option>
                                            <option value="HR">HR</option>
                                        </select>
                                        <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                    </div>

                                    <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Export Report">
                                        <Download size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                                            <th className="px-6 py-4">Employee</th>
                                            <th className="px-6 py-4">Time In</th>
                                            <th className="px-6 py-4">Time Out</th>
                                            <th className="px-6 py-4">Working Hours</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredData.length > 0 ? (
                                            filteredData.map((item) => (
                                                <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm text-slate-600 dark:text-slate-300">
                                                                {item.avatar}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">{item.role}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm font-medium">
                                                            <Clock size={14} className="text-slate-400" />
                                                            {item.timeIn}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-slate-600 dark:text-slate-400">{item.timeOut}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-mono text-slate-700 dark:text-slate-300">{item.hours}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusStyle(item.status)}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                            <MoreVertical size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                                    No records found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    // Approvals Tab Content
                    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-14rem)]">

                        {/* List Panel */}
                        <div className="w-full lg:w-1/3 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                                <h3 className="font-semibold text-slate-800 dark:text-white">Requests</h3>
                                <div className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">
                                    {requests.length} Total
                                </div>
                            </div>
                            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-700">
                                {requests.map(request => (
                                    <div
                                        key={request.id}
                                        onClick={() => setSelectedRequest(request.id)}
                                        className={`p-4 cursor-pointer transition-colors ${selectedRequest === request.id ? 'bg-indigo-50 dark:bg-indigo-900/10 border-l-4 border-indigo-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-l-4 border-transparent'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
                                                    {request.avatar}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-semibold ${selectedRequest === request.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-white'}`}>{request.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{request.role}</p>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getRequestTypeStyle(request.type)}`}>
                                                {request.type}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mt-3">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {request.date}
                                            </div>
                                            <div className={`flex items-center gap-1 font-medium ${request.status === 'Pending' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                {request.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Detail Panel */}
                        <div className="w-full lg:w-2/3 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
                            {selectedRequestData ? (
                                <>
                                    <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Request #{selectedRequestData.id}</h2>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                Submitted on {selectedRequestData.timeline[0]?.time}
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleReject(selectedRequestData.id)}
                                                className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                            >
                                                <XCircle size={16} /> Reject
                                            </button>
                                            <button
                                                onClick={() => handleApprove(selectedRequestData.id)}
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-md transition-colors flex items-center gap-2"
                                            >
                                                <CheckCircle size={16} /> Approve
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6">

                                        {/* Grid Layout for details */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                            <div>
                                                <h4 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-3">Correction Details</h4>
                                                <div className="space-y-4">
                                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                                                        <span className="text-sm text-slate-500 dark:text-slate-400 block mb-1">Request Type</span>
                                                        <span className="font-semibold text-slate-800 dark:text-white">{selectedRequestData.type}</span>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                                                            <span className="text-sm text-slate-500 dark:text-slate-400 block mb-1">System Time</span>
                                                            <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">{selectedRequestData.systemTime}</span>
                                                        </div>
                                                        <div className="flex-1 bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                                                            <span className="text-sm text-indigo-600 dark:text-indigo-400 block mb-1">Requested Time</span>
                                                            <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">{selectedRequestData.requestedTime}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-3">Justification</h4>
                                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700 h-full">
                                                    <div className="flex items-start gap-3">
                                                        <MessageSquare size={18} className="text-slate-400 mt-1" />
                                                        <div>
                                                            <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{selectedRequestData.reason}"</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Audit Trail */}
                                        <div>
                                            <h4 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-4 flex items-center gap-2">
                                                <Activity size={14} /> Audit Trail
                                            </h4>
                                            <div className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-6">
                                                {selectedRequestData.timeline.map((event, idx) => (
                                                    <div key={idx} className="relative">
                                                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-dark-card ring-1 ring-slate-100 dark:ring-slate-800"></div>
                                                        <p className="text-sm font-medium text-slate-800 dark:text-white">{event.status}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{event.time} • by {event.by}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <FileText size={48} className="mb-4 opacity-50" />
                                    <p>Select a request to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};

export default AttendanceMonitoring;
