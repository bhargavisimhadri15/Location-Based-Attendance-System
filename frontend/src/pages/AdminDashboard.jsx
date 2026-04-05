import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../lib/api';
import { MapPin, Users, History, PlusCircle, Trash2, Calendar, Search, ArrowRightCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
    const location = useLocation();
    const [locations, setLocations] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [activeTab, setActiveTab] = useState('attendance');
    const [newLocation, setNewLocation] = useState({ name: '', lat: '', lon: '', radius: 100, address: '' });
    const [editingLocationId, setEditingLocationId] = useState(null);
    const [editLocation, setEditLocation] = useState({ name: '', lat: '', lon: '', radius: 100, address: '' });
    const [loading, setLoading] = useState(true);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        fetchAdminData();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        const allowedTabs = new Set(['attendance', 'locations', 'employees']);

        if (tab && allowedTabs.has(tab)) {
            setActiveTab(tab);
        }
    }, [location.search]);

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            setErrorMsg('');
            const [locRes, attRes, empRes] = await Promise.all([
                api.get('/api/admin/locations'),
                api.get('/api/admin/attendance'),
                api.get('/api/admin/users')
            ]);
            setLocations(locRes.data);
            setAttendance(attRes.data);
            setEmployees(empRes.data);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddLocation = async (e) => {
        e.preventDefault();
        try {
            setErrorMsg('');
            await api.post('/api/admin/locations', {
                name: newLocation.name,
                coordinates: [parseFloat(newLocation.lon), parseFloat(newLocation.lat)],
                radius: parseInt(newLocation.radius),
                address: newLocation.address
            });
            setNewLocation({ name: '', lat: '', lon: '', radius: 100, address: '' });
            setSuccessMsg('Location successfully added!');
            setTimeout(() => setSuccessMsg(''), 3000);
            fetchAdminData();
        } catch (err) {
            setErrorMsg(err.response?.data?.msg || 'Failed to add location');
        }
    };

    const startEditLocation = (loc) => {
        setErrorMsg('');
        setSuccessMsg('');
        setEditingLocationId(loc._id);
        setEditLocation({
            name: loc.name || '',
            lat: String(loc.coordinates?.coordinates?.[1] ?? ''),
            lon: String(loc.coordinates?.coordinates?.[0] ?? ''),
            radius: loc.radius ?? 100,
            address: loc.address || ''
        });
    };

    const cancelEditLocation = () => {
        setEditingLocationId(null);
        setEditLocation({ name: '', lat: '', lon: '', radius: 100, address: '' });
    };

    const handleUpdateLocation = async (e) => {
        e.preventDefault();
        if (!editingLocationId) return;

        try {
            setErrorMsg('');
            await api.put(`/api/admin/locations/${editingLocationId}`, {
                name: editLocation.name,
                coordinates: [parseFloat(editLocation.lon), parseFloat(editLocation.lat)],
                radius: parseInt(editLocation.radius),
                address: editLocation.address
            });
            setSuccessMsg('Location updated.');
            setTimeout(() => setSuccessMsg(''), 3000);
            cancelEditLocation();
            fetchAdminData();
        } catch (err) {
            setErrorMsg(err.response?.data?.msg || 'Failed to update location');
        }
    };

    const handleDeleteLocation = async (loc) => {
        const ok = window.confirm(`Delete location "${loc.name}"?`);
        if (!ok) return;

        try {
            setErrorMsg('');
            await api.delete(`/api/admin/locations/${loc._id}`);
            setSuccessMsg('Location deleted.');
            setTimeout(() => setSuccessMsg(''), 3000);
            fetchAdminData();
        } catch (err) {
            setErrorMsg(err.response?.data?.msg || 'Failed to delete location');
        }
    };

    const tabs = [
        { id: 'attendance', label: 'Attendance logs', icon: History },
        { id: 'locations', label: 'Manage Locations', icon: MapPin },
        { id: 'employees', label: 'Employee Roster', icon: Users },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-white/5">
                <div>
                  <h1 className="text-4xl font-black tracking-tight">Admin Console</h1>
                  <p className="text-white/40 mt-1">Control system parameters and monitor performance</p>
                </div>
                
                <div className="flex bg-surface/50 p-1.5 rounded-2xl border border-white/5">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
                                activeTab === tab.id 
                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
                                : 'text-white/40 hover:text-white/80'
                            }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            <AnimatePresence mode="wait">
                {activeTab === 'attendance' && (
                    <motion.div 
                        key="attendance"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass rounded-[2rem] overflow-hidden border-white/5"
                    >
                        <div className="p-6 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                            <h3 className="font-bold text-lg">Activity History</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                <input placeholder="Filter records..." className="bg-surface/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none" />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/[0.03] text-white/40 text-xs font-bold uppercase tracking-[0.1em]">
                                    <tr>
                                        <th className="px-6 py-4">Employee</th>
                                        <th className="px-6 py-4">Site</th>
                                        <th className="px-6 py-4">Check In</th>
                                        <th className="px-6 py-4">Check Out</th>
                                        <th className="px-6 py-4">Duration</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.05]">
                                    {attendance.map(row => (
                                        <tr key={row._id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold">{row.employeeId?.name || 'Unknown'}</div>
                                                <div className="text-xs text-white/40">{row.employeeId?.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                              <span className="bg-primary/10 text-primary-light px-3 py-1 rounded-full text-xs font-bold border border-primary/20">
                                                {row.locationId?.name}
                                              </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-mono text-sm">{new Date(row.checkIn.time).toLocaleString()}</div>
                                                <div className="text-[10px] text-white/30 truncate max-w-[150px]">{row.checkIn.coordinates.join(', ')}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {row.checkOut?.time ? (
                                                  <div className="font-mono text-sm">{new Date(row.checkOut.time).toLocaleString()}</div>
                                                ) : (
                                                  <span className="text-secondary animate-pulse text-xs font-bold uppercase">Working...</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {row.checkOut?.time ? (
                                                    <span className="text-white/60 font-semibold">{Math.round((new Date(row.checkOut.time) - new Date(row.checkIn.time))/60000)}m</span>
                                                ) : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'locations' && (
                    <motion.div 
                        key="locations"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        <AnimatePresence>
                            {editingLocationId && (
                                <motion.div
                                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <motion.div
                                        className="glass w-full max-w-xl rounded-[2rem] border border-white/10 p-8"
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                    >
                                        <div className="flex items-center justify-between gap-4 mb-6">
                                            <div>
                                                <h3 className="text-2xl font-black tracking-tight">Edit Location</h3>
                                                <p className="text-white/40 text-sm mt-1">Update geofence details</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={cancelEditLocation}
                                                className="text-white/40 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 border border-white/10 transition-colors text-sm font-bold"
                                            >
                                                Close
                                            </button>
                                        </div>

                                        <form onSubmit={handleUpdateLocation} className="space-y-4">
                                            <div>
                                                <label className="label">Site Name</label>
                                                <input
                                                    required
                                                    value={editLocation.name}
                                                    className="input-field"
                                                    onChange={e => setEditLocation({ ...editLocation, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="label">Latitude</label>
                                                    <input
                                                        required
                                                        type="number"
                                                        step="any"
                                                        value={editLocation.lat}
                                                        className="input-field"
                                                        onChange={e => setEditLocation({ ...editLocation, lat: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="label">Longitude</label>
                                                    <input
                                                        required
                                                        type="number"
                                                        step="any"
                                                        value={editLocation.lon}
                                                        className="input-field"
                                                        onChange={e => setEditLocation({ ...editLocation, lon: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 items-center">
                                                <div>
                                                    <label className="label">Radius (m)</label>
                                                    <input
                                                        required
                                                        type="number"
                                                        value={editLocation.radius}
                                                        className="input-field"
                                                        onChange={e => setEditLocation({ ...editLocation, radius: e.target.value })}
                                                    />
                                                </div>
                                                <div className="text-[10px] text-white/30 pt-6">Higher accuracy requires larger radius.</div>
                                            </div>
                                            <div>
                                                <label className="label">Address (Optional)</label>
                                                <input
                                                    value={editLocation.address}
                                                    className="input-field"
                                                    onChange={e => setEditLocation({ ...editLocation, address: e.target.value })}
                                                />
                                            </div>

                                            {errorMsg && <div className="text-danger text-sm font-bold flex items-center gap-2 bg-danger/10 p-3 rounded-xl">{errorMsg}</div>}

                                            <div className="flex items-center gap-3 pt-2">
                                                <button type="submit" className="btn-primary flex-1 py-3 font-bold">
                                                    Save Changes
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={cancelEditLocation}
                                                    className="btn-secondary flex-1 py-3 font-bold"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Location Form */}
                        <div className="glass p-8 rounded-[2rem] h-fit sticky top-28">
                            <div className="flex items-center gap-3 mb-6">
                                <PlusCircle className="text-primary" />
                                <h3 className="text-xl font-bold">New Geofence</h3>
                            </div>
                            <form onSubmit={handleAddLocation} className="space-y-4">
                                <div>
                                    <label className="label">Site Name</label>
                                    <input required placeholder="Headquarters" className="input-field" onChange={e => setNewLocation({...newLocation, name: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Latitude</label>
                                        <input required type="number" step="any" placeholder="17.4..." className="input-field" onChange={e => setNewLocation({...newLocation, lat: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="label">Longitude</label>
                                        <input required type="number" step="any" placeholder="78.3..." className="input-field" onChange={e => setNewLocation({...newLocation, lon: e.target.value})} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <div>
                                        <label className="label">Radius (m)</label>
                                        <input required type="number" value={newLocation.radius} className="input-field" onChange={e => setNewLocation({...newLocation, radius: e.target.value})} />
                                    </div>
                                    <div className="text-[10px] text-white/30 pt-6">Higher accuracy requires larger radius.</div>
                                </div>
                                <div>
                                    <label className="label">Address (Optional)</label>
                                    <input placeholder="Floor 5, Building B" className="input-field" onChange={e => setNewLocation({...newLocation, address: e.target.value})} />
                                </div>
                                <button type="submit" className="btn-primary w-full py-4 mt-4 font-bold flex items-center justify-center gap-2">
                                    Create Location
                                    <ArrowRightCircle size={18} />
                                </button>
                                {successMsg && <div className="text-secondary text-sm font-bold flex items-center gap-2 bg-secondary/10 p-3 rounded-xl"><CheckCircle size={16} /> {successMsg}</div>}
                                {errorMsg && <div className="text-danger text-sm font-bold flex items-center gap-2 bg-danger/10 p-3 rounded-xl">{errorMsg}</div>}
                            </form>
                        </div>

                        {/* Locations List */}
                        <div className="lg:col-span-2 space-y-4">
                            {successMsg && <div className="text-secondary text-sm font-bold flex items-center gap-2 bg-secondary/10 p-3 rounded-xl"><CheckCircle size={16} /> {successMsg}</div>}
                            {errorMsg && <div className="text-danger text-sm font-bold flex items-center gap-2 bg-danger/10 p-3 rounded-xl">{errorMsg}</div>}

                            {locations.map(loc => (
                                <div key={loc._id} className="glass p-6 rounded-3xl flex items-center justify-between group hover:bg-white/[0.03] transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                                            <MapPin size={24} className="text-primary-light" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">{loc.name}</h4>
                                            <p className="text-white/40 text-sm">{loc.address || 'No address specified'}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                              <span className="text-[10px] font-mono bg-white/5 text-white/50 px-2 py-0.5 rounded">LAT: {loc.coordinates.coordinates[1]}</span>
                                              <span className="text-[10px] font-mono bg-white/5 text-white/50 px-2 py-0.5 rounded">LON: {loc.coordinates.coordinates[0]}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold mb-1">{loc.radius}m Radius</div>
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => startEditLocation(loc)}
                                                className="text-white/30 hover:text-white px-3 py-2 rounded-xl bg-white/0 hover:bg-white/5 border border-white/5 transition-colors text-xs font-bold"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteLocation(loc)}
                                                className="text-white/20 hover:text-danger p-2 transition-colors"
                                                aria-label={`Delete ${loc.name}`}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'employees' && (
                  <motion.div 
                    key="employees"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {employees.map(emp => (
                      <div key={emp._id} className="glass p-6 rounded-3xl border-white/5 hover:-translate-y-1 transition-all group">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center ring-4 ring-primary/5">
                            <Users className="text-primary" size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold leading-none mb-1">{emp.name}</h4>
                            <p className="text-xs text-white/40">{emp.email}</p>
                          </div>
                        </div>
                        <div className="h-px bg-white/5 mb-4" />
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white/30">Joined</span>
                          <span className="font-bold text-white/60">{new Date(emp.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
