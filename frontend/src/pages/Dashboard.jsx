import React, { useState, useEffect, useContext } from 'react';
import api from '../lib/api';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Navigation, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [status, setStatus] = useState(null); // { isCheckIn: boolean, data: attendanceRecord }
    const [coords, setCoords] = useState(null);
    const [accuracy, setAccuracy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rangeLoading, setRangeLoading] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [locRes, statRes] = await Promise.all([
                api.get('/api/locations'),
                api.get('/api/attendance/status')
            ]);
            setLocations(locRes.data);
            if (statRes.data._id) {
                setStatus({ isCheckIn: true, data: statRes.data });
                setSelectedLocation(statRes.data.locationId);
            } else {
                setStatus({ isCheckIn: false, data: null });
            }
        } catch (err) {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const getMyLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject('Geolocation not supported');
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setCoords([pos.coords.longitude, pos.coords.latitude]);
                    setAccuracy(pos.coords.accuracy);
                    resolve(pos.coords);
                },
                (err) => {
                    setError('Location access denied or unavailable');
                    reject(err);
                },
                { enableHighAccuracy: true }
            );
        });
    };

    const handleCheckIn = async () => {
        if (!selectedLocation) return setError('Please select a location');
        setError('');
        setRangeLoading(true);
        try {
            const pos = await getMyLocation();
            const res = await api.post('/api/attendance/checkin', {
                locationId: selectedLocation._id,
                userCoordinates: [pos.longitude, pos.latitude],
                accuracy: pos.accuracy
            });
            setStatus({ isCheckIn: true, data: res.data });
        } catch (err) {
            setError(err.response?.data?.msg || 'Check-in failed');
        } finally {
            setRangeLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setError('');
        setRangeLoading(true);
        try {
            const pos = await getMyLocation();
            const res = await api.post('/api/attendance/checkout', {
                userCoordinates: [pos.longitude, pos.latitude],
                accuracy: pos.accuracy
            });
            setStatus({ isCheckIn: false, data: null });
            fetchInitialData(); // Refresh history or status
        } catch (err) {
            setError(err.response?.data?.msg || 'Check-out failed');
        } finally {
            setRangeLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-white/40">Initializing workspace...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Hello, {user?.name}!</h1>
                    <p className="text-white/40 font-medium">Capture your attendance for today</p>
                </div>
                <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3">
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse ring-4 ring-secondary/20" />
                    <span className="font-semibold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </header>

            {error && (
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-2xl flex items-start gap-3"
                >
                    <AlertCircle className="shrink-0 mt-0.5" size={20} />
                    <div className="text-sm font-medium">{error}</div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Attendance Action Card */}
                <div className="glass p-8 rounded-[2rem] space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                    
                    <div className="flex items-center gap-3 mb-2">
                        <Navigation className="text-primary" size={24} />
                        <h2 className="text-xl font-bold">Live Status</h2>
                    </div>

                    {!status?.isCheckIn ? (
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="label">Select Assigned Location</label>
                                {locations.length === 0 && (
                                    <div className="text-sm text-white/50 bg-white/5 border border-white/10 rounded-2xl p-4">
                                        No locations are assigned to your profile yet. Contact your administrator.
                                    </div>
                                )}
                                <div className="grid gap-3">
                                    {locations.map(loc => (
                                        <button 
                                            key={loc._id}
                                            onClick={() => setSelectedLocation(loc)}
                                            className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between group ${
                                                selectedLocation?._id === loc._id 
                                                    ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10' 
                                                    : 'bg-white/5 border-white/5 hover:border-white/20'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <MapPin className={selectedLocation?._id === loc._id ? 'text-primary' : 'text-white/20'} size={20} />
                                                <div>
                                                    <div className="font-bold">{loc.name}</div>
                                                    <div className="text-xs text-white/40">{loc.radius}m Radius</div>
                                                </div>
                                            </div>
                                            {selectedLocation?._id === loc._id && <CheckCircle2 className="text-primary" size={20} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={handleCheckIn}
                                disabled={rangeLoading || !selectedLocation || locations.length === 0}
                                className="btn-primary w-full py-5 h-20 rounded-3xl flex items-center justify-center gap-3 group relative overflow-hidden disabled:opacity-50"
                            >
                                {rangeLoading ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : (
                                    <>
                                        <span className="text-xl font-bold">Check In Now</span>
                                        <Navigation className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={24} />
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8 py-4 text-center">
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mb-4 ring-8 ring-secondary/5">
                                    <Clock className="text-secondary" size={36} />
                                </div>
                                <h3 className="text-2xl font-bold">Currently On Duty</h3>
                                <p className="text-white/40 mt-1">Checked in at <span className="text-white font-semibold">{status.data.locationId?.name}</span></p>
                                <div className="mt-2 text-primary font-mono text-lg">
                                    {new Date(status.data.checkIn.time).toLocaleTimeString()}
                                </div>
                            </div>

                            <button 
                                onClick={handleCheckOut}
                                disabled={rangeLoading}
                                className="w-full py-5 h-20 rounded-3xl bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 transition-all font-bold text-xl flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {rangeLoading ? <Loader2 className="animate-spin" size={24} /> : 'Complete Shift'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Info Card */}
                <div className="space-y-6">
                    <div className="glass p-8 rounded-[2rem] border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                             <AlertCircle size={20} className="text-accent" />
                             Compliance Rules
                        </h3>
                        <ul className="space-y-4 text-sm text-white/60">
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                                <span>You must be within the defined boundary to perform actions.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                                <span>GPS accuracy of less than 50m is required for valid check-ins.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                                <span>Ensure location permissions are enabled in your browser.</span>
                            </li>
                        </ul>
                    </div>

                    {coords && (
                        <div className="glass p-6 rounded-3xl border-primary/10">
                            <h4 className="text-sm font-semibold text-white/40 mb-3 uppercase tracking-wider">Current GPS Telemetry</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/40">Latitude</span>
                                    <span className="font-mono text-primary-light">{coords[1].toFixed(6)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/40">Longitude</span>
                                    <span className="font-mono text-primary-light">{coords[0].toFixed(6)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/40">Accuracy</span>
                                    <span className={`font-mono ${accuracy > 50 ? 'text-danger' : 'text-secondary'}`}>{accuracy.toFixed(1)}m</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
