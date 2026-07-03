import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const formatDate = (value) => {
  if (!value) return 'Unknown date';
  return new Date(value).toLocaleDateString();
};

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Pain Relief', price: '', image: '💊', prescriptionRequired: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const info = localStorage.getItem('doctorInfo');
    if (!info) {
      navigate('/doctor/login');
      return;
    }

    const parsed = JSON.parse(info);
    setDoctorInfo(parsed);
  }, [navigate]);

  useEffect(() => {
    if (!doctorInfo?.token) {
      return;
    }

    if (activeTab === 'dashboard') {
      fetchAppointments();
    }
  }, [activeTab, doctorInfo]);

  useEffect(() => {
    if (activeTab === 'pharmacy') {
      fetchProducts();
    }
  }, [activeTab]);

  const fetchAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      setAppointmentsError('');
      const config = { headers: { Authorization: `Bearer ${doctorInfo.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/appointments/doctorappointments', config);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      setAppointmentsError(error.response?.data?.message || 'Failed to load appointments');
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/products');
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    }
  };

  const handleConfirmAppointment = async (id) => {
    try {
      setActionLoadingId(id);
      const config = { headers: { Authorization: `Bearer ${doctorInfo.token}` } };
      await axios.patch(`http://localhost:5000/api/appointments/${id}/confirm`, {}, config);
      await fetchAppointments();
    } catch (error) {
      alert('Failed to confirm appointment: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${doctorInfo.token}` } };
      await axios.post('http://localhost:5000/api/products', newProduct, config);
      setNewProduct({ name: '', category: 'Pain Relief', price: '', image: '💊', prescriptionRequired: false });
      fetchProducts();
    } catch (error) {
      alert('Failed to add product: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${doctorInfo.token}` } };
      await axios.delete(`http://localhost:5000/api/products/${id}`, config);
      fetchProducts();
    } catch (error) {
      alert('Failed to delete product: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('doctorInfo');
    navigate('/');
  };

  const openConsultation = (appointmentId) => {
    navigate(`/consultations/${appointmentId}`);
  };

  const appointmentStats = useMemo(() => {
    const pending = appointments.filter((app) => app.status === 'pending');
    const confirmed = appointments.filter((app) => app.status === 'confirmed');
    const completed = appointments.filter((app) => app.status === 'completed');
    return {
      pending,
      confirmed,
      completed,
      total: appointments.length,
    };
  }, [appointments]);

  if (!doctorInfo) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-xl font-bold text-blue-600 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Doctor Portal
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/doctor/profile')}
                className="text-sm text-blue-600 font-medium hover:text-blue-700 transition"
              >
                Profile
              </button>
              <span className="text-sm font-medium text-neutral-700">Dr. {doctorInfo.name}</span>
              <button onClick={handleLogout} className="text-sm text-red-600 font-medium hover:text-red-700 transition">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <aside className="md:col-span-1 space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-lg transition ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-neutral-600 hover:bg-neutral-100'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('pharmacy')}
              className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-lg transition ${activeTab === 'pharmacy' ? 'bg-blue-50 text-blue-700' : 'text-neutral-600 hover:bg-neutral-100'}`}
            >
              Manage Pharmacy
            </button>
          </aside>

          <main className="md:col-span-3 space-y-6">
            {activeTab === 'dashboard' && (
              <>
                <header className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                  <h1 className="text-2xl font-bold text-neutral-900">Welcome, Dr. {doctorInfo.name}</h1>
                  <p className="text-neutral-500 mt-1">Review pending consultations and confirm them for patients.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 border-t-4 border-t-blue-500">
                    <h3 className="text-neutral-500 text-sm font-medium">Total Appointments</h3>
                    <p className="text-3xl font-bold text-neutral-900 mt-2">{appointmentStats.total}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 border-t-4 border-t-amber-400">
                    <h3 className="text-neutral-500 text-sm font-medium">Pending</h3>
                    <p className="text-3xl font-bold text-neutral-900 mt-2">{appointmentStats.pending.length}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 border-t-4 border-t-green-500">
                    <h3 className="text-neutral-500 text-sm font-medium">Confirmed</h3>
                    <p className="text-3xl font-bold text-neutral-900 mt-2">{appointmentStats.confirmed.length}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 border-t-4 border-t-violet-500">
                    <h3 className="text-neutral-500 text-sm font-medium">Completed</h3>
                    <p className="text-3xl font-bold text-neutral-900 mt-2">{appointmentStats.completed.length}</p>
                  </div>
                </div>

                <section className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-neutral-900">Pending Appointments</h2>
                    <button
                      onClick={fetchAppointments}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Refresh
                    </button>
                  </div>

                  <div className="p-6">
                    {appointmentsLoading ? (
                      <div className="text-neutral-500 text-center py-10">Loading appointments...</div>
                    ) : appointmentsError ? (
                      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">{appointmentsError}</div>
                    ) : appointmentStats.pending.length === 0 ? (
                      <div className="text-neutral-500 text-center py-10">No pending appointments found.</div>
                    ) : (
                      <div className="space-y-4">
                        {appointmentStats.pending.map((app) => (
                          <div key={app._id} className="border border-neutral-200 rounded-2xl p-5 bg-neutral-50">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                              <div className="space-y-2">
                                <div>
                                  <h3 className="text-lg font-semibold text-neutral-900">{app.patientName || app.patient?.name || 'Patient'}</h3>
                                  <p className="text-sm text-neutral-600">{app.patientEmail || app.patient?.email || ''}</p>
                                  {app.patientPhone && <p className="text-sm text-neutral-600">{app.patientPhone}</p>}
                                </div>
                                <div className="flex flex-wrap gap-3 text-sm text-neutral-700">
                                  <span className="px-3 py-1 rounded-full bg-white border border-neutral-200">{app.doctorName || 'Doctor'}</span>
                                  <span className="px-3 py-1 rounded-full bg-white border border-neutral-200">{app.doctorSpecialty || 'General Physician'}</span>
                                  <span className="px-3 py-1 rounded-full bg-white border border-neutral-200">{formatDate(app.date)} at {app.timeSlot}</span>
                                </div>
                                <div className="bg-white border border-neutral-200 rounded-xl p-4">
                                  <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">Complaint</p>
                                  <p className="text-neutral-800">{app.complaint || app.reason || 'No complaint provided'}</p>
                                </div>
                              </div>

                              <div className="flex flex-col items-start lg:items-end gap-3">
                                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold uppercase tracking-wide">
                                  Pending
                                </span>
                                <span className="px-3 py-1 rounded-full bg-white text-neutral-700 text-xs font-semibold uppercase tracking-wide border border-neutral-200">
                                  {app.paymentStatus === 'paid' ? 'Paid' : 'Awaiting payment'}
                                </span>
                                <button
                                  onClick={() => handleConfirmAppointment(app._id)}
                                  disabled={actionLoadingId === app._id}
                                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
                                >
                                  {actionLoadingId === app._id ? 'Confirming...' : 'Accept Appointment'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                <section className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-200">
                    <h2 className="text-lg font-bold text-neutral-900">Confirmed Appointments</h2>
                  </div>
                  <div className="p-6">
                    {appointmentStats.confirmed.length === 0 ? (
                      <div className="text-neutral-500 text-center py-6">No confirmed appointments yet.</div>
                    ) : (
                      <div className="space-y-4">
                        {appointmentStats.confirmed.map((app) => (
                          <div key={app._id} className="border border-neutral-200 rounded-2xl p-5 bg-neutral-50">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                              <div>
                                <h3 className="text-lg font-semibold text-neutral-900">{app.patientName || app.patient?.name || 'Patient'}</h3>
                                <p className="text-sm text-neutral-600">{app.patientEmail || app.patient?.email || ''}</p>
                                <p className="text-sm text-neutral-500 mt-1">{formatDate(app.date)} at {app.timeSlot}</p>
                              </div>
                              <div className="flex flex-col items-start md:items-end gap-2">
                                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold uppercase tracking-wide">
                                  Confirmed
                                </span>
                                <span className="px-3 py-1 rounded-full bg-white text-neutral-700 text-xs font-semibold uppercase tracking-wide border border-neutral-200">
                                  {app.paymentStatus === 'paid' ? 'Paid' : 'Awaiting payment'}
                                </span>
                                <button
                                  onClick={() => openConsultation(app._id)}
                                  disabled={app.status === 'cancelled'}
                                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {app.status === 'cancelled' ? 'Cancelled' : 'Open consultation'}
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-neutral-700 mt-4">
                              {app.complaint || app.reason || 'No complaint provided'}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                <section className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-200">
                    <h2 className="text-lg font-bold text-neutral-900">Completed Appointments</h2>
                  </div>
                  <div className="p-6">
                    {appointmentStats.completed.length === 0 ? (
                      <div className="text-neutral-500 text-center py-6">No completed appointments yet.</div>
                    ) : (
                      <div className="space-y-4">
                        {appointmentStats.completed.map((app) => (
                          <div key={app._id} className="border border-neutral-200 rounded-2xl p-5 bg-neutral-50">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                              <div>
                                <h3 className="text-lg font-semibold text-neutral-900">{app.patientName || app.patient?.name || 'Patient'}</h3>
                                <p className="text-sm text-neutral-600">{app.patientEmail || app.patient?.email || ''}</p>
                                <p className="text-sm text-neutral-500 mt-1">{formatDate(app.date)} at {app.timeSlot}</p>
                              </div>
                              <div className="flex flex-col items-start md:items-end gap-2">
                                <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold uppercase tracking-wide">
                                  Completed
                                </span>
                                <span className="px-3 py-1 rounded-full bg-white text-neutral-700 text-xs font-semibold uppercase tracking-wide border border-neutral-200">
                                  {app.paymentStatus === 'paid' ? 'Paid' : 'Awaiting payment'}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-neutral-700 mt-4">
                              {app.complaint || app.reason || 'No complaint provided'}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}

            {activeTab === 'pharmacy' && (
              <>
                <header className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                  <h1 className="text-2xl font-bold text-neutral-900">Pharmacy Management</h1>
                  <p className="text-neutral-500 mt-1">Add or remove products from the public pharmacy store.</p>
                </header>

                <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                  <h2 className="text-lg font-bold text-neutral-900 mb-4">Add New Medicine</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Product Name</label>
                      <input required type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full p-2 border rounded-lg" placeholder="E.g. Paracetamol" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Price (₹)</label>
                      <input required type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full p-2 border rounded-lg" placeholder="45" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
                      <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full p-2 border rounded-lg">
                        <option>Pain Relief</option>
                        <option>Antibiotics</option>
                        <option>Supplements</option>
                        <option>Cold & Cough</option>
                        <option>First Aid</option>
                      </select>
                    </div>
                    <div className="flex items-center mt-6">
                      <label className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={newProduct.prescriptionRequired} onChange={(e) => setNewProduct({ ...newProduct, prescriptionRequired: e.target.checked })} className="w-5 h-5 text-blue-600 rounded" />
                        <span className="ml-2 text-sm font-medium text-neutral-700">Requires Prescription</span>
                      </label>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">
                    {loading ? 'Adding...' : 'Add to Pharmacy'}
                  </button>
                </form>

                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200">
                        <th className="p-4 font-semibold text-neutral-600">Product</th>
                        <th className="p-4 font-semibold text-neutral-600">Category</th>
                        <th className="p-4 font-semibold text-neutral-600">Price</th>
                        <th className="p-4 font-semibold text-neutral-600">Rx</th>
                        <th className="p-4 font-semibold text-neutral-600">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p._id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                          <td className="p-4 font-medium text-neutral-900">{p.image} {p.name}</td>
                          <td className="p-4 text-neutral-600">{p.category}</td>
                          <td className="p-4 text-neutral-900 font-medium">₹{p.price}</td>
                          <td className="p-4">
                            {p.prescriptionRequired ? <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-medium">Yes</span> : <span className="text-neutral-400">-</span>}
                          </td>
                          <td className="p-4">
                            <button onClick={() => handleDeleteProduct(p._id)} className="text-red-500 hover:text-red-700 font-medium text-sm">Delete</button>
                          </td>
                        </tr>
                      ))}
                      {products.length === 0 && (
                        <tr><td colSpan="5" className="p-6 text-center text-neutral-500">No products available.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
