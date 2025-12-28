import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Webcam from 'react-webcam';
import {
    ArrowRight,
    LogOut,
    MapPin,
    Calendar as CalendarIcon,
    Camera,
    X,
    RefreshCw
} from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';
import { toast } from 'react-toastify';

const Attendance = () => {
    // Initialize with today's date formatted for input type="date" (YYYY-MM-DD)
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(formattedToday);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Camera State
    const [showCamera, setShowCamera] = useState(false);
    const [cameraMode, setCameraMode] = useState(null); // 'IN' or 'OUT'
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Records
    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            const res = await attendanceService.getMyRecords(selectedDate, selectedDate);
            if (res.ok) {
                setSessions(res.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch attendance records");
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    // Handle Camera Logic
    const openCamera = (mode) => {
        setCameraMode(mode);
        setImgSrc(null);
        setShowCamera(true);
    };

    const closeCamera = () => {
        setShowCamera(false);
        setImgSrc(null);
        setCameraMode(null);
    };

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
    }, [webcamRef]);

    const retake = () => {
        setImgSrc(null);
    };

    // Convert Base64 to Blob
    const dataURLtoBlob = (dataurl) => {
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }

    const confirmAttendance = async () => {
        if (!imgSrc) return;
        setIsSubmitting(true);

        // Get Location
        if (!navigator.geolocation) {
             toast.error("Geolocation is not supported by your browser");
             setIsSubmitting(false);
             return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude, accuracy } = position.coords;
                
                // --- STRICT ACCURACY CHECK ---
                // IP Geolocation is usually > 5000m. GPS/Wi-Fi is usually < 100m.
                const MAX_ALLOWED_ACCURACY = 500; // meters
                
                if (accuracy > MAX_ALLOWED_ACCURACY) {
                    toast.error(`Location too inaccurate (${Math.round(accuracy)}m). We require < ${MAX_ALLOWED_ACCURACY}m.`);
                    toast.warn("Please use a Mobile Phone with GPS or ensure Wi-Fi is ON.", { autoClose: 8000 });
                    setIsSubmitting(false);
                    return; // BLOCK submission
                }

                // Debug info (optional, keeping for transparency)
                // toast.info(`Location Accuracy: ${Math.round(accuracy)}m (Good)`);
                
                const imageBlob = dataURLtoBlob(imgSrc);
                
                const payload = {
                    latitude,
                    longitude,
                    imageFile: imageBlob
                };

                let res;
                if (cameraMode === 'IN') {
                    res = await attendanceService.timeIn(payload);
                    toast.success("Checked In Successfully!");
                } else {
                     res = await attendanceService.timeOut(payload);
                     toast.success("Checked Out Successfully!");
                }
                
                closeCamera();
                fetchRecords(); // Refresh list

            } catch (error) {
                console.error(error);
                toast.error(error.message || "Attendance failed");
            } finally {
                setIsSubmitting(false);
            }
        }, (error) => {
            console.error(error);
            toast.error("Unable to retrieve your location: " + error.message);
            setIsSubmitting(false);
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    };


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
    
    // Helper formats
    const formatTime = (isoString) => {
        if (!isoString) return null;
        return new Date(isoString).toLocaleTimeString('en-US', { 
            hour: '2-digit', minute: '2-digit', hour12: true 
        });
    };

    return (
        <DashboardLayout title="Attendance">
            <div className="space-y-8 relative">

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <button 
                        onClick={() => openCamera('IN')}
                        className="flex items-center justify-center gap-3 bg-indigo-600 text-white h-24 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 hover:bg-indigo-700 hover:shadow-xl transition-all active:scale-95 group">
                        <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                            <ArrowRight size={24} />
                        </div>
                        <span className="text-2xl font-bold">Time In</span>
                    </button>

                    <button 
                        onClick={() => openCamera('OUT')}
                        className="flex items-center justify-center gap-3 bg-slate-800 dark:bg-slate-700 text-white h-24 rounded-2xl shadow-lg shadow-slate-200 dark:shadow-slate-900/30 hover:bg-slate-900 dark:hover:bg-slate-600 hover:shadow-xl transition-all active:scale-95 group">
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
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                    </div>
                </div>

                {/* Timeline Sessions */}
                <div className="space-y-4">
                    {loading ? <p className="text-center text-slate-500">Loading records...</p> : 
                     sessions.length === 0 ? <p className="text-center text-slate-400 py-10">No attendance records for this date.</p> :
                     sessions.map((session) => (
                        <div key={session.attendance_id} className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative transition-colors duration-300">
                            {/* Connector Line */}
                            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-100 dark:bg-slate-700 hidden sm:block"></div>

                            <div className="grid grid-cols-1 sm:grid-cols-2">

                                {/* Time In Column */}
                                <div className="p-5 flex flex-col gap-2 relative">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">TIME IN</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-slate-800 dark:text-white">{formatTime(session.time_in)}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${session.late_minutes > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {session.late_minutes > 0 ? `Late ${session.late_minutes}m` : 'On Time'}
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-1.5 text-slate-500 dark:text-slate-400 text-xs mt-1">
                                        <MapPin size={14} className="flex-shrink-0 mt-0.5 text-slate-400 dark:text-slate-500" />
                                        <span className="line-clamp-2">{session.time_in_address || "Location unavailable"}</span>
                                    </div>
                                     {session.time_in_image && (
                                         <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                                             <img src={session.time_in_image} alt="In" className="w-full h-full object-cover" />
                                         </div>
                                     )}
                                </div>

                                {/* Time Out Column */}
                                <div className="p-5 flex flex-col gap-2 relative border-t sm:border-t-0 border-slate-100 dark:border-slate-700 sm:pl-8">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-2.5 h-2.5 rounded-full ${session.time_out ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">TIME OUT</span>
                                    </div>

                                    {session.time_out ? (
                                        <>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl font-bold text-slate-800 dark:text-white">{formatTime(session.time_out)}</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300`}>
                                                    {session.status}
                                                </span>
                                            </div>
                                            <div className="flex items-start gap-1.5 text-slate-500 dark:text-slate-400 text-xs mt-1">
                                                <MapPin size={14} className="flex-shrink-0 mt-0.5 text-slate-400 dark:text-slate-500" />
                                                <span className="line-clamp-2">{session.time_out_address || "Location unavailable"}</span>
                                            </div>
                                             {session.time_out_image && (
                                                <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                                                    <img src={session.time_out_image} alt="Out" className="w-full h-full object-cover" />
                                                </div>
                                            )}
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

                {/* --- CAMERA COMPONENT --- */}
                {showCamera && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-dark-card p-4 rounded-2xl w-full max-w-md shadow-2xl space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                 <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                     {cameraMode === 'IN' ? 'Check In Photo' : 'Check Out Photo'}
                                 </h3>
                                 <button onClick={closeCamera} className="p-2 text-slate-400 hover:text-red-500">
                                     <X size={24} />
                                 </button>
                            </div>

                            <div className="relative bg-black rounded-xl overflow-hidden aspect-square sm:aspect-video flex items-center justify-center">
                                {imgSrc ? (
                                    <img src={imgSrc} alt="Captured" className="w-full h-full object-cover" />
                                ) : (
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        className="w-full h-full object-cover"
                                        videoConstraints={{ facingMode: "user" }}
                                    />
                                )}
                            </div>

                            <div className="flex justify-center gap-4 pt-2">
                                {!imgSrc ? (
                                    <button 
                                        onClick={capture}
                                        className="w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center shadow-lg transition-transform active:scale-95 text-white">
                                        <Camera size={28} />
                                    </button>
                                ) : (
                                    <>
                                        <button 
                                            onClick={retake}
                                            className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2">
                                            <RefreshCw size={18} /> Retake
                                        </button>
                                        <button 
                                            onClick={confirmAttendance}
                                            disabled={isSubmitting}
                                            className="px-6 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium shadow-lg flex items-center gap-2 disabled:opacity-70">
                                            {isSubmitting ? 'Submitting...' : 'Confirm'} <ArrowRight size={18} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};

export default Attendance;
