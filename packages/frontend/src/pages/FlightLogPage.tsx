import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { DateTimePicker } from '../components/DateTimePicker';

// Dummy user role fetcher (replace with real auth/user context)
const getCurrentUser = () => ({
  id: 'user-001',
  role: 'pilot', // 'admin', 'super_admin', 'instructor', 'base_manager', 'pilot', 'user'
  fullName: 'John Doe',
});

const API_URL = '';

export const FlightLogPage: React.FC = () => {
  const currentUser = getCurrentUser();
  const [aircraft, setAircraft] = useState<any[]>([]);
  const [airfields, setAirfields] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [flights, setFlights] = useState<any[]>([]);

  // Form state
  const [form, setForm] = useState({
    callSign: '',
    pilotId: currentUser.id,
    instructorId: '',
    departureAirfield: '',
    arrivalAirfield: '',
    departureTime: '',
    arrivalTime: '',
    departureHobbs: '',
    arrivalHobbs: '',
    landings: '1',
  });

  const [showFlightModal, setShowFlightModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [showViewFlightModal, setShowViewFlightModal] = useState(false);
  const [viewFlight, setViewFlight] = useState<any>(null);

  // Fetch dropdown data
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/api/aircraft`).then(r => r.json()),
      fetch(`${API_URL}/api/bases`).then(r => r.json()),
      fetch(`${API_URL}/api/users`).then(r => r.json()),
    ]).then(([aircraft, airfields, users]) => {
      setAircraft(Array.isArray(aircraft) ? aircraft : []);
      setAirfields(Array.isArray(airfields) ? airfields : []);
      setUsers(Array.isArray(users) ? users : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Mock flight data
  const mockFlights = [
    {
      id: 1,
      callSign: 'N12345',
      pilotName: 'John Doe',
      instructorName: 'Sarah Smith',
      departureAirfield: 'KJFK',
      arrivalAirfield: 'KLAX',
      departureTime: '2024-01-15T08:00:00',
      arrivalTime: '2024-01-15T11:30:00',
      landings: 1,
      durationMinutes: 210,
      hobbsDeparture: '1250.5',
      hobbsArrival: '1263.8',
      pilotId: 'user-001',
      instructorId: 'instructor-001'
    },
    {
      id: 2,
      callSign: 'N67890',
      pilotName: 'Jane Wilson',
      instructorName: 'Mike Johnson',
      departureAirfield: 'KLAX',
      arrivalAirfield: 'KSFO',
      departureTime: '2024-01-16T14:00:00',
      arrivalTime: '2024-01-16T15:45:00',
      landings: 1,
      durationMinutes: 105,
      hobbsDeparture: '890.2',
      hobbsArrival: '892.0',
      pilotId: 'user-002',
      instructorId: 'instructor-002'
    },
    {
      id: 3,
      callSign: 'N11111',
      pilotName: 'Bob Brown',
      instructorName: 'Alice Davis',
      departureAirfield: 'KSFO',
      arrivalAirfield: 'KSEA',
      departureTime: '2024-01-17T09:30:00',
      arrivalTime: '2024-01-17T12:15:00',
      landings: 2,
      durationMinutes: 165,
      hobbsDeparture: '1100.0',
      hobbsArrival: '1102.8',
      pilotId: 'user-003',
      instructorId: 'instructor-003'
    },
    {
      id: 4,
      callSign: 'N22222',
      pilotName: 'Emily Chen',
      instructorName: 'David Lee',
      departureAirfield: 'KSEA',
      arrivalAirfield: 'KPDX',
      departureTime: '2024-01-18T16:00:00',
      arrivalTime: '2024-01-18T17:30:00',
      landings: 1,
      durationMinutes: 90,
      hobbsDeparture: '750.5',
      hobbsArrival: '752.0',
      pilotId: 'user-004',
      instructorId: 'instructor-004'
    },
    {
      id: 5,
      callSign: 'N33333',
      pilotName: 'Tom Anderson',
      instructorName: 'Lisa Garcia',
      departureAirfield: 'KPDX',
      arrivalAirfield: 'KBOI',
      departureTime: '2024-01-19T10:00:00',
      arrivalTime: '2024-01-19T12:45:00',
      landings: 1,
      durationMinutes: 165,
      hobbsDeparture: '600.0',
      hobbsArrival: '602.8',
      pilotId: 'user-005',
      instructorId: 'instructor-005'
    }
  ];

  // Fetch flights
  useEffect(() => {
    fetch(`${API_URL}/api/flights`)
      .then(r => r.json())
      .then(data => setFlights(Array.isArray(data) ? data : mockFlights))
      .catch(() => setFlights(mockFlights));
  }, []);

  // Computed fields
  const durationMinutes = useMemo(() => {
    if (form.departureTime && form.arrivalTime) {
      const dep = new Date(form.departureTime);
      const arr = new Date(form.arrivalTime);
      const diff = (arr.getTime() - dep.getTime()) / 60000;
      return diff > 0 ? Math.round(diff) : '';
    }
    return '';
  }, [form.departureTime, form.arrivalTime]);

  const durationHobbs = useMemo(() => {
    const dep = parseFloat(form.departureHobbs);
    const arr = parseFloat(form.arrivalHobbs);
    if (!isNaN(dep) && !isNaN(arr) && arr > dep) {
      return (arr - dep).toFixed(2);
    }
    return '';
  }, [form.departureHobbs, form.arrivalHobbs]);

  const durationHours = useMemo(() => {
    if (durationMinutes && typeof durationMinutes === 'number') {
      const h = Math.floor(durationMinutes / 60);
      const m = durationMinutes % 60;
      return `${h}h ${m}m`;
    }
    return '';
  }, [durationMinutes]);

  // Role logic
  const isAdmin = ['admin', 'super_admin', 'base_manager'].includes(currentUser.role);
  const isInstructor = currentUser.role === 'instructor';
  const isSuperAdmin = currentUser.role === 'super_admin';

  // Determine permissions based on role
  const canViewAllFlights = ['admin', 'super_admin', 'instructor', 'base_manager', 'pilot'].includes(currentUser.role);
  const canEditFlights = ['admin', 'super_admin', 'instructor', 'base_manager'].includes(currentUser.role);
  const canDeleteFlights = ['admin', 'super_admin', 'instructor'].includes(currentUser.role);
  const canAddFlights = ['admin', 'super_admin', 'instructor', 'base_manager'].includes(currentUser.role);

  // Filter flights for regular users
  const visibleFlights = canViewAllFlights ? flights : flights.filter(f => f.pilotId === currentUser.id || f.userId === currentUser.id);

  // Handlers
  const handleChange = (field: string, value: any) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit logic
    toast.success('Flight log submitted (not yet implemented)');
  };

  const openAddFlightModal = () => {
    setIsEditMode(false);
    setSelectedFlight(null);
    setShowFlightModal(true);
  };
  const openEditFlightModal = (flight: any) => {
    setIsEditMode(true);
    setSelectedFlight(flight);
    setShowFlightModal(true);
    setForm({
      callSign: flight.callSign || flight.call_sign || '',
      pilotId: flight.pilotId || flight.userId || '',
      instructorId: flight.instructorId || '',
      departureAirfield: flight.departureAirfield || flight.departure_airfield || '',
      arrivalAirfield: flight.arrivalAirfield || flight.arrival_airfield || '',
      departureTime: flight.departureTime || '',
      arrivalTime: flight.arrivalTime || '',
      departureHobbs: flight.departureHobbs || '',
      arrivalHobbs: flight.arrivalHobbs || '',
      landings: flight.landings || '1',
    });
  };
  const closeFlightModal = () => {
    setShowFlightModal(false);
    setIsEditMode(false);
    setSelectedFlight(null);
    setForm({
      callSign: '',
      pilotId: currentUser.id,
      instructorId: '',
      departureAirfield: '',
      arrivalAirfield: '',
      departureTime: '',
      arrivalTime: '',
      departureHobbs: '',
      arrivalHobbs: '',
      landings: '1',
    });
  };

  // Handler for view
  const handleViewFlight = (flight: any) => {
    setViewFlight(flight);
    setShowViewFlightModal(true);
  };

  return (
    <>
      <Helmet>
        <title>Flight Log - Cruiser Aviation Platform</title>
      </Helmet>
      <div className="h-full flex flex-col">
        {/* Header Section with Table Headers - Fixed at top */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-2xl font-bold text-gray-900">Flight Log</h2>
            {canAddFlights && (
              <button
                onClick={openAddFlightModal}
                className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800 transition-colors"
              >
                Add Flight
              </button>
            )}
          </div>
          <div className="px-6 py-3 bg-gray-50">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div>Date</div>
              <div>Aircraft</div>
              <div>Departure Airfield</div>
              <div>Departure Time</div>
              <div>Arrival Airfield</div>
              <div>Arrival Time</div>
              <div>Duration</div>
              <div>Pilot</div>
              <div>Instructor</div>
              <div>Landings</div>
              <div>Actions</div>
            </div>
          </div>
        </div>

        {/* Table Container with Scrollable Body */}
        <div className="flex-1 flex flex-col">
          {/* Loading State */}
          {loading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading flights...</p>
              </div>
            </div>
          )}
          
          {/* Scrollable Table Body */}
          {!loading && (
            <div className="flex-1 overflow-auto">
              <div className="bg-white">
                <div className="divide-y divide-gray-200">
                  {visibleFlights.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <p className="text-gray-500">No flights found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {visibleFlights.map(flight => {
                        // Duration in HH:MM
                        let duration = '';
                        const mins = flight.durationMinutes || flight.duration_minutes;
                        if (mins && !isNaN(mins)) {
                          const h = Math.floor(mins / 60);
                          const m = mins % 60;
                          duration = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                        }
                        // Pilot display
                        let pilotDisplay = '-';
                        if (flight.pilotName || flight.pilot_name) {
                          const name = flight.pilotName || flight.pilot_name;
                          const [first, ...rest] = name.split(' ');
                          pilotDisplay = `${first[0]}. ${rest.join(' ')}`;
                        } else if (flight.pilotId || flight.userId) {
                          pilotDisplay = flight.pilotId || flight.userId;
                        }
                        // Instructor display
                        let instructorDisplay = '-';
                        if (flight.instructorName || flight.instructor_name) {
                          const name = flight.instructorName || flight.instructor_name;
                          const [first, ...rest] = name.split(' ');
                          instructorDisplay = `${first[0]}. ${rest.join(' ')}`;
                        } else if (flight.instructorId) {
                          instructorDisplay = flight.instructorId;
                        }
                        return (
                          <div key={flight.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                            {/* Date */}
                            <div className="text-sm text-gray-900">{flight.departureTime ? new Date(flight.departureTime).toLocaleDateString() : '-'}</div>
                            {/* Aircraft (Call Sign) */}
                            <div className="text-sm text-gray-900">{flight.callSign || flight.call_sign}</div>
                            {/* Departure Airfield */}
                            <div className="text-sm text-gray-900">{flight.departureAirfield || flight.departure_airfield}</div>
                            {/* Departure Time (24h) */}
                            <div className="text-sm text-gray-900">{flight.departureTime ? new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '-'}</div>
                            {/* Arrival Airfield */}
                            <div className="text-sm text-gray-900">{flight.arrivalAirfield || flight.arrival_airfield}</div>
                            {/* Arrival Time (24h) */}
                            <div className="text-sm text-gray-900">{flight.arrivalTime ? new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '-'}</div>
                            {/* Duration (HH:MM) */}
                            <div className="text-sm text-gray-900">{duration || '-'}</div>
                            {/* Pilot */}
                            <div className="text-sm text-gray-900">{pilotDisplay}</div>
                            {/* Instructor */}
                            <div className="text-sm text-gray-900">{instructorDisplay}</div>
                            {/* Landings */}
                            <div className="text-sm text-gray-900">{flight.landings || '-'}</div>
                            {/* Actions */}
                            <div className="flex space-x-2">
                              {canViewAllFlights && (
                                <button
                                  onClick={() => handleViewFlight(flight)}
                                  className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
                                >
                                  View
                                </button>
                              )}
                              {canEditFlights && (
                                <button
                                  onClick={() => openEditFlightModal(flight)}
                                  className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
                                >
                                  Edit
                                </button>
                              )}
                              {canDeleteFlights && (
                                <button
                                  onClick={() => toast('Delete not implemented')}
                                  className="text-red-600 hover:text-red-900 px-2 py-1 rounded border border-red-200 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
              {/* Flight Modal */}
      {showFlightModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
              <h3 className="text-lg font-medium text-gray-900">{isEditMode ? 'Edit Flight' : 'Add New Flight'}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={closeFlightModal}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (isEditMode ? 'Update Flight' : 'Create Flight')}
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
                            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Flight Information</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Call Sign <span className="text-red-500">*</span></label>
                      <select
                        value={form.callSign}
                        onChange={e => handleChange('callSign', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-Select-</option>
                        {aircraft.map(a => (
                          <option key={a.id} value={a.call_sign || a.callSign}>{a.call_sign || a.callSign}</option>
                        ))}
                      </select>
                    </div>

                    {/* Pilot (dropdown for admin/instructor, hidden for user) */}
                    {(isAdmin || isInstructor) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pilot</label>
                        <select
                          value={form.pilotId}
                          onChange={e => handleChange('pilotId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">-Select-</option>
                          {users.map(u => (
                            <option key={u.id} value={u.id}>{u.fullName || u.first_name + ' ' + u.last_name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Instructor (dropdown for admin/user, hidden/auto for instructor) */}
                    {!isInstructor && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                        <select
                          value={form.instructorId}
                          onChange={e => handleChange('instructorId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">-Select-</option>
                          {users.filter(u => u.role === 'instructor').map(u => (
                            <option key={u.id} value={u.id}>{u.fullName || u.first_name + ' ' + u.last_name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Landings <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        min="1"
                        value={form.landings}
                        onChange={e => handleChange('landings', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Route Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Route Information</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Departure Airfield <span className="text-red-500">*</span></label>
                      <select
                        value={form.departureAirfield}
                        onChange={e => handleChange('departureAirfield', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-Select-</option>
                        {airfields.map(a => (
                          <option key={a.id} value={a.name}>{a.name} ({a.icaoCode || a.icao_code})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Airfield <span className="text-red-500">*</span></label>
                      <select
                        value={form.arrivalAirfield}
                        onChange={e => handleChange('arrivalAirfield', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-Select-</option>
                        {airfields.map(a => (
                          <option key={a.id} value={a.name}>{a.name} ({a.icaoCode || a.icao_code})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <DateTimePicker
                        value={form.departureTime}
                        onChange={(value) => handleChange('departureTime', value)}
                        label="Departure Time (UTC)"
                        required
                        placeholder="Select departure date and time"
                      />
                    </div>

                    <div>
                      <DateTimePicker
                        value={form.arrivalTime}
                        onChange={(value) => handleChange('arrivalTime', value)}
                        label="Arrival Time (UTC)"
                        required
                        placeholder="Select arrival date and time"
                      />
                    </div>
                  </div>
                </div>

                {/* Hobbs Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Hobbs Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Departure Hobbs <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        step="0.01"
                        value={form.departureHobbs}
                        onChange={e => handleChange('departureHobbs', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="######.##"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Hobbs <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        step="0.01"
                        value={form.arrivalHobbs}
                        onChange={e => handleChange('arrivalHobbs', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="######.##"
                      />
                    </div>
                  </div>
                </div>

                {/* Computed Duration */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Computed Duration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Flight Duration (min)</label>
                      <input
                        type="text"
                        value={durationMinutes}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Flight Duration (Hobbs)</label>
                      <input
                        type="text"
                        value={durationHobbs}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">HOURS</label>
                      <input
                        type="text"
                        value={durationHours}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Flight Modal */}
      {showViewFlightModal && viewFlight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
              <h3 className="text-lg font-medium text-gray-900">View Flight</h3>
              <button
                onClick={() => setShowViewFlightModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-2"><span className="font-semibold">Call Sign:</span> {viewFlight.callSign}</div>
                  <div className="mb-2"><span className="font-semibold">Pilot:</span> {viewFlight.pilotName}</div>
                  <div className="mb-2"><span className="font-semibold">Instructor:</span> {viewFlight.instructorName}</div>
                  <div className="mb-2"><span className="font-semibold">Departure Airfield:</span> {viewFlight.departureAirfield}</div>
                  <div className="mb-2"><span className="font-semibold">Arrival Airfield:</span> {viewFlight.arrivalAirfield}</div>
                  <div className="mb-2"><span className="font-semibold">Departure Time:</span> {viewFlight.departureTime}</div>
                  <div className="mb-2"><span className="font-semibold">Arrival Time:</span> {viewFlight.arrivalTime}</div>
                </div>
                <div>
                  <div className="mb-2"><span className="font-semibold">Landings:</span> {viewFlight.landings}</div>
                  <div className="mb-2"><span className="font-semibold">Duration (min):</span> {viewFlight.durationMinutes}</div>
                  <div className="mb-2"><span className="font-semibold">Duration (Hobbs):</span> {viewFlight.hobbsArrival && viewFlight.hobbsDeparture ? (parseFloat(viewFlight.hobbsArrival) - parseFloat(viewFlight.hobbsDeparture)).toFixed(2) : '-'}</div>
                  <div className="mb-2"><span className="font-semibold">Departure Hobbs:</span> {viewFlight.hobbsDeparture}</div>
                  <div className="mb-2"><span className="font-semibold">Arrival Hobbs:</span> {viewFlight.hobbsArrival}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 