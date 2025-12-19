import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import {
    Users,
    TrendingUp,
    AlertTriangle,
    Clock,
    CheckCircle,
    XCircle,
    Calendar,
    FileText,
    UserPlus,
    Briefcase
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
    const weeklyData = [
        { name: 'Mon', present: 52, absent: 3, late: 5 },
        { name: 'Tue', present: 55, absent: 1, late: 4 },
        { name: 'Wed', present: 50, absent: 5, late: 5 },
        { name: 'Thu', present: 54, absent: 2, late: 4 },
        { name: 'Fri', present: 56, absent: 1, late: 3 },
    ];

    const activities = [
        { id: 1, user: 'Sarah Wilson', action: 'Clocked In', time: '08:45 AM', status: 'present', role: 'UX Designer' },
        { id: 2, user: 'Mike Johnson', action: 'Late Check-in', time: '09:15 AM', status: 'late', role: 'Developer' },
        { id: 3, user: 'Anna Davis', action: 'Sick Leave', time: '08:30 AM', status: 'absent', role: 'HR Manager' },
    ];

    const alerts = [
        { id: 1, type: 'warning', message: 'High absence rate in Sales Dept.' },
        { id: 2, type: 'error', message: '3 Unapproved Overtime requests.' },
    ];

    return (
        <DashboardLayout title="Dashboard">
            <div className="space-y-6 sm:space-y-8">
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <StatCard
                        title="Present Today"
                        value="56"
                        total="/ 60"
                        icon={<CheckCircle className="text-emerald-500" size={24} />}
                        trend="+2.5%"
                        trendUp
                    />
                    <StatCard
                        title="Absent"
                        value="3"
                        total="Employees"
                        icon={<XCircle className="text-red-500" size={24} />}
                        trend="-1.2%"
                    />
                    <StatCard
                        title="Late Check-ins"
                        value="5"
                        total="Employees"
                        icon={<Clock className="text-amber-500" size={24} />}
                        trend="+4%"
                    />
                    <StatCard
                        title="On Leave"
                        value="4"
                        total="Planned"
                        icon={<Calendar className="text-indigo-500" size={24} />}
                        period="This week"
                    />
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-3">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Quick Actions</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <QuickLinkCard icon={<UserPlus size={20} />} title="Add Employee" desc="Create new user profile" />
                            <QuickLinkCard icon={<FileText size={20} />} title="Generate Report" desc="Download monthly stats" />
                            <QuickLinkCard icon={<Briefcase size={20} />} title="Manage Shifts" desc="Update work schedules" />
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Chart Section */}
                    <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Attendance Trends</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Weekly insight</p>
                            </div>
                            <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3 py-1.5 rounded-md transition-colors">View Details</button>
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#fff' }}
                                    />
                                    <Line type="monotone" dataKey="present" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Present" />
                                    <Line type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Late" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Right Column: Activity & Alerts */}
                    <div className="space-y-8">
                        {/* Live Activity Feed */}
                        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Live Activity</h3>
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                            </div>
                            <div className="space-y-4">
                                {activities.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-slate-50 dark:border-slate-700/50 last:border-0 last:pb-0">
                                        <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                            {activity.user.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{activity.user}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{activity.role} • {activity.action}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${activity.status === 'present' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30' :
                                                activity.status === 'late' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800/30' :
                                                    'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800/30'
                                                }`}>
                                                {activity.time}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors border border-dashed border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20">
                                View Full Feed
                            </button>
                        </div>

                        {/* Anomalies / Alerts */}
                        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
                            <div className="flex items-center gap-2 mb-4 text-amber-600 dark:text-amber-500">
                                <AlertTriangle size={20} />
                                <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Anomalies</h3>
                            </div>
                            <div className="space-y-3">
                                {alerts.map((alert) => (
                                    <div key={alert.id} className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg text-sm text-amber-800 dark:text-amber-200 flex gap-3 items-start">
                                        <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></div>
                                        <span className="leading-snug">{alert.message}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

const StatCard = ({ title, value, total, icon, trend, trendUp, period }) => (
    <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
        <div className="flex items-start justify-between mb-4">
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                <h4 className="text-3xl font-bold text-slate-800 dark:text-white mt-1 tracking-tight">{value} <span className="text-sm font-normal text-slate-400 dark:text-slate-500">{total}</span></h4>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-100 dark:border-slate-700">
                {icon}
            </div>
        </div>
        <div className="flex items-center text-sm">
            {trend && (
                <span className={`font-semibold ${trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'} flex items-center bg-opacity-10 px-1.5 py-0.5 rounded`}>
                    {trendUp ? '↑' : '↓'} {trend}
                </span>
            )}
            {period && <span className="text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded">{period}</span>}
            {trend && <span className="text-slate-400 dark:text-slate-500 ml-2">vs last week</span>}
        </div>
    </div>
);

const QuickLinkCard = ({ icon, title, desc }) => (
    <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all cursor-pointer group">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                {icon}
            </div>
            <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
            </div>
        </div>
    </div>
);

export default AdminDashboard;
