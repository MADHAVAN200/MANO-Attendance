import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { User, Mail, Phone, Briefcase, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
    const { user: authUser } = useAuth();
    // Dynamic Data with Fallback
    const user = {
        name: authUser?.user_name || 'Admin User',
        role: authUser?.user_type || 'Administrator',
        email: authUser?.email || 'admin@manosprings.com',
        phone: authUser?.phone || '+91 98765 43210',
        department: 'Management',
        location: 'Bangalore, India',
        joinDate: 'Jan 15, 2023',
        employeeId: 'MS-001'
    };

    return (
        <DashboardLayout title="My Profile">
            <div className="w-full space-y-6">

                {/* Profile Header Card */}
                <div className="bg-white dark:bg-dark-card rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center md:items-center gap-8 transition-colors">
                    <div className="w-32 h-32 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-4xl font-bold border-4 border-white dark:border-slate-800 shadow-lg shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white capitalize">{user.name}</h2>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/10 px-3 py-1 rounded-full w-fit mx-auto md:mx-0 capitalize">
                            <Shield size={16} />
                            <span>{user.role}</span>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Info */}
                    <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4">
                            Contact Information
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 shrink-0">
                                    <Mail size={22} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-0.5">Email Address</p>
                                    <p className="text-slate-800 dark:text-white font-medium truncate">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 shrink-0">
                                    <Phone size={22} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-0.5">Phone Number</p>
                                    <p className="text-slate-800 dark:text-white font-medium truncate">{user.phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Employment Info */}
                    <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4">
                            Employment Details
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 shrink-0">
                                    <Briefcase size={22} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-0.5">Department</p>
                                    <p className="text-slate-800 dark:text-white font-medium truncate">{user.department}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 shrink-0">
                                    <User size={22} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-0.5">Employee ID</p>
                                    <p className="text-slate-800 dark:text-white font-medium truncate">{user.employeeId}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default Profile;
