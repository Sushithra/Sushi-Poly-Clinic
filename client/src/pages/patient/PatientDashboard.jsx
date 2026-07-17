import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../config/env.js';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const parseTimeSlot = (timeSlot) => {
  const match = String(timeSlot || '').trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridian = match[3].toUpperCase();

  if (Number.isNaN(hours) || Number.isNaN(minutes) || hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
    return null;
  }

  hours = hours % 12;
  if (meridian === 'PM') {
    hours += 12;
  }

  return { hours, minutes };
};

const getConsultationWindow = (dateValue, timeSlot, openBeforeMinutes = 0, closeAfterMinutes = 240, nowTimestamp = Date.now()) => {
  const date = new Date(dateValue);
  const timeParts = parseTimeSlot(timeSlot);

  if (Number.isNaN(date.getTime()) || !timeParts) {
    return { startsAt: null, endsAt: null, canJoinNow: false };
  }

  date.setHours(timeParts.hours, timeParts.minutes, 0, 0);
  const startsAt = new Date(date.getTime() - openBeforeMinutes * 60 * 1000);
  const endsAt = new Date(date.getTime() + closeAfterMinutes * 60 * 1000);
  return {
    startsAt,
    endsAt,
    canJoinNow: nowTimestamp >= startsAt.getTime() && nowTimestamp <= endsAt.getTime(),
  };
};

const getRazorpayPublicKey = () => import.meta.env.VITE_RAZORPAY_KEY_ID || '';
const resolveRecordUrl = (value) => {
  const url = String(value || '');
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE_URL}/${url.replace(/^\/+/, '')}`;
};

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [patientRecords, setPatientRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('current');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentNotice, setPaymentNotice] = useState('');
  const [recordFile, setRecordFile] = useState(null);
  const [recordUploadLoading, setRecordUploadLoading] = useState(false);
  const [recordError, setRecordError] = useState('');
  const [previewRecord, setPreviewRecord] = useState(null);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [now, setNow] = useState(Date.now());
  const navigate = useNavigate();
  const location = useLocation();
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab === 'pending' ? 'current' : location.state.activeTab);
    }
  }, [location.state]);

  useEffect(() => {
    let mounted = true;
    loadRazorpayScript().then((loaded) => {
      if (mounted) {
        setRazorpayReady(loaded);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchAppointments = async () => {
      try {
        const token = userInfo?.token;
        if (!token) {
          console.error('No token available');
          return;
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get('http://localhost:5000/api/appointments/myappointments', config);
        setAppointments(data);

        const targetId = location.state?.openPaymentAppointmentId;
        if (targetId) {
          const targetAppointment = Array.isArray(data) ? data.find((item) => item._id === targetId) : null;
          if (
            targetAppointment &&
            (targetAppointment.status === 'confirmed' || targetAppointment.status === 'current') &&
            targetAppointment.paymentStatus !== 'paid'
          ) {
            setPaymentTarget(targetAppointment);
            setPaymentError('');
            setPaymentNotice('');
            setPaymentModalOpen(true);
          }
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
    const refreshTimer = window.setInterval(fetchAppointments, 30000);

    return () => {
      window.clearInterval(refreshTimer);
    };
  }, [navigate, userInfo, location.state]);

  useEffect(() => {
    if (!userInfo?.token) return;

    const fetchPatientRecords = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/patient-records/me', config);
        setPatientRecords(Array.isArray(data) ? data : []);
      } catch (error) {
        setRecordError(error.response?.data?.message || 'Failed to load records');
      }
    };

    fetchPatientRecords();
  }, [userInfo]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  // Classify appointments into tabs
  const classifyAppointments = () => {
    const current = [];
    const previous = [];

    appointments.forEach((app) => {
      if (app.status === 'completed' || app.status === 'cancelled') {
        previous.push(app);
      } else {
        current.push(app);
      }
    });

    return { current, previous };
  };

  const { current, previous } = classifyAppointments();

  const getTabContent = () => {
    let tabData = [];
    let emptyMessage = '';

    if (activeTab === 'current') {
      tabData = current;
      emptyMessage = 'No current appointments.';
    } else if (activeTab === 'previous') {
      tabData = previous;
      emptyMessage = 'No previous appointments.';
    }

    return { tabData, emptyMessage };
  };

  const { tabData, emptyMessage } = getTabContent();

  const openConsultation = (appointmentId) => {
    navigate(`/consultations/${appointmentId}`);
  };

  const openPayment = (appointmentId) => {
    const appointment = appointments.find((item) => item._id === appointmentId) || null;
    setPaymentTarget(appointment);
    setPaymentError('');
    setPaymentNotice('');
    setPaymentModalOpen(true);
  };

  const handleRecordUpload = async (e) => {
    e.preventDefault();
    if (!recordFile) {
      setRecordError('Please choose a photo or PDF first.');
      return;
    }

    try {
      setRecordUploadLoading(true);
      setRecordError('');
      const formData = new FormData();
      formData.append('file', recordFile);
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          'Content-Type': 'multipart/form-data',
        },
      };
      const { data } = await axios.post('http://localhost:5000/api/patient-records', formData, config);
      setPatientRecords((current) => [data, ...current]);
      setRecordFile(null);
      e.target.reset();
    } catch (error) {
      setRecordError(error.response?.data?.message || 'Unable to upload record');
    } finally {
      setRecordUploadLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Delete this record?')) return;

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`http://localhost:5000/api/patient-records/${recordId}`, config);
      setPatientRecords((current) => current.filter((record) => record._id !== recordId));
      if (previewRecord?._id === recordId) {
        setPreviewRecord(null);
      }
    } catch (error) {
      setRecordError(error.response?.data?.message || 'Unable to delete record');
    }
  };

  const closePaymentModal = () => {
    setPaymentModalOpen(false);
    setPaymentTarget(null);
    setPaymentError('');
  };

  const verifyRazorpayPayment = async (payload) => {
    const token = userInfo?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.post('http://localhost:5000/api/verify-payment', payload, config);
    setAppointments((current) => current.map((appointment) => (appointment._id === data.appointment._id ? data.appointment : appointment)));
    setPaymentNotice('Payment completed successfully.');
    closePaymentModal();
  };

  const handlePayWithRazorpay = async () => {
    if (!paymentTarget) {
      setPaymentError('Select an appointment first.');
      return;
    }

    if (!razorpayReady || !getRazorpayPublicKey()) {
      setPaymentError('Razorpay is still loading. Please try again in a moment.');
      return;
    }

    try {
      setPaymentLoading(true);
      setPaymentError('');
      const token = userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const fee = Number(paymentTarget.consultationPrice ?? paymentTarget.doctor?.consultationFee ?? 500);
      const amount = Math.max(100, Math.round(fee * 100));

      const { data: orderData } = await axios.post(
        'http://localhost:5000/api/create-order',
        {
          appointmentId: paymentTarget._id,
          amount,
          currency: 'INR',
          receipt: `appointment_${paymentTarget._id}`,
        },
        config,
      );

      const options = {
        key: getRazorpayPublicKey(),
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.order_id,
        name: 'Eclinic',
        description: `Consultation payment for ${paymentTarget.doctorName || 'Doctor'}`,
        prefill: {
          name: userInfo?.name || paymentTarget.patientName || '',
          email: userInfo?.email || paymentTarget.patientEmail || '',
          contact: userInfo?.phone || paymentTarget.patientPhone || '',
        },
        handler: async (response) => {
          try {
            await verifyRazorpayPayment({
              appointmentId: paymentTarget._id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
          } catch (err) {
            setPaymentError(err.response?.data?.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentError('Payment was cancelled.');
          },
        },
        theme: {
          color: '#0ea5e9',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response) => {
        setPaymentError(response?.error?.description || 'Payment failed');
      });
      razorpay.open();
    } catch (error) {
      setPaymentError(error.response?.data?.message || 'Unable to start payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const canJoinAppointment = (app) => {
    if (!app || app.paymentStatus !== 'paid' || app.status === 'cancelled' || app.status === 'completed') {
      return false;
    }

    const windowInfo = getConsultationWindow(app.date, app.timeSlot, 0, 240, now);
    return Boolean(windowInfo.startsAt && now >= windowInfo.startsAt.getTime());
  };

  if (!userInfo) return null;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">Eclinic Patient</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/patient/profile')}
              className="text-primary-600 font-medium hover:text-primary-700"
            >
              Profile
            </button>
            <button onClick={handleLogout} className="text-red-500 font-medium hover:text-red-600">Logout</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {paymentNotice && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
              {paymentNotice}
            </div>
          )}

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">My Appointments</h2>
            <p className="text-neutral-600">Track your consultation status</p>
          </div>

          {/* 3 Big Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div
              onClick={() => setActiveTab('current')}
              className={`cursor-pointer p-8 rounded-2xl border-2 transition transform hover:scale-105 ${
                activeTab === 'current'
                  ? 'bg-green-50 border-green-400 shadow-lg'
                  : 'bg-white border-neutral-200 hover:border-green-200'
              }`}
            >
              <div className="text-center">
                <h3 className="text-5xl font-bold text-neutral-900 mb-2">{current.length}</h3>
                <p className="text-lg font-semibold text-neutral-700 mb-4">Current</p>
                <p className="text-sm text-neutral-500">Active appointments</p>
              </div>
            </div>

            {/* Previous */}
            <div
              onClick={() => setActiveTab('previous')}
              className={`cursor-pointer p-8 rounded-2xl border-2 transition transform hover:scale-105 ${
                activeTab === 'previous'
                  ? 'bg-blue-50 border-blue-400 shadow-lg'
                  : 'bg-white border-neutral-200 hover:border-blue-200'
              }`}
            >
              <div className="text-center">
                <h3 className="text-5xl font-bold text-neutral-900 mb-2">{previous.length}</h3>
                <p className="text-lg font-semibold text-neutral-700 mb-4">Previous</p>
                <p className="text-sm text-neutral-500">Completed appointments</p>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h3 className="text-xl font-bold text-neutral-900">
                {activeTab === 'current' ? 'Current Appointments' : 'Previous Appointments'}
              </h3>
              <button
                onClick={() => navigate('/doctors')}
                className="inline-flex items-center justify-center gap-2 self-start md:self-auto px-6 py-3 rounded-xl bg-primary-600 text-white text-base font-semibold shadow-lg hover:bg-primary-700 hover:shadow-xl transition-transform hover:scale-[1.02]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14m-7-7h14" />
                </svg>
                Book New Appointment
              </button>
            </div>

            {tabData.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <p className="text-neutral-500 text-lg">{emptyMessage}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tabData.map((app) => (
                  <React.Fragment key={app._id}>
                    <div className="flex items-center p-4 border border-neutral-100 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-neutral-900">{app.doctorName || app.doctor?.name || 'Doctor'}</h4>
                        <p className="text-sm text-neutral-600">{app.doctorSpecialty || app.doctor?.specialty || 'Specialist'}</p>
                        <p className="text-sm text-neutral-500">{new Date(app.date).toLocaleDateString()} at {app.timeSlot} • {app.consultationType || 'video'}</p>
                      </div>
                      <div className="text-right ml-4 flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          app.status === 'completed'
                            ? 'bg-violet-100 text-violet-700'
                            : app.paymentStatus === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {app.status === 'completed'
                            ? 'Completed'
                            : app.paymentStatus === 'paid'
                              ? 'Paid'
                              : app.status === 'pending' || app.status === 'requested'
                                ? 'Waiting for confirmation'
                                : 'Payment pending'}
                        </span>
                        {app.status === 'cancelled' ? (
                          <span className="px-4 py-2 text-sm font-semibold rounded-xl bg-red-100 text-red-700">
                            Cancelled
                          </span>
                        ) : app.status === 'completed' ? (
                          <span className="px-4 py-2 text-sm font-semibold rounded-xl bg-violet-100 text-violet-700">
                            Completed
                          </span>
                        ) : canJoinAppointment(app) ? (
                          <button
                            onClick={() => openConsultation(app._id)}
                            className="px-4 py-2 text-sm font-semibold rounded-xl bg-primary-600 text-white hover:bg-primary-700"
                          >
                            Join meeting
                          </button>
                        ) : app.paymentStatus === 'paid' ? (
                          <span className="px-4 py-2 text-sm font-semibold rounded-xl bg-sky-100 text-sky-700">
                            Waiting for meeting
                          </span>
                        ) : app.status === 'confirmed' || app.status === 'current' ? (
                          <button
                            onClick={() => openPayment(app._id)}
                            className="px-4 py-2 text-sm font-semibold rounded-xl bg-neutral-900 text-white hover:bg-neutral-800"
                          >
                            Pay now
                          </button>
                        ) : (
                          <span className="px-4 py-2 text-sm font-semibold rounded-xl bg-amber-100 text-amber-700">
                            Waiting for doctor confirmation
                          </span>
                        )}
                      </div>
                    </div>
                        {app.status === 'cancelled' && app.cancellationReason && (
                          <div className="mt-3 ml-16 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
                            {app.cancellationReason}
                          </div>
                        )}
                        {app.status === 'cancelled' && app.paymentStatus === 'refunded' && (
                          <div className="mt-2 ml-16 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2">
                            Refund initiated for this appointment.
                          </div>
                        )}
                      </React.Fragment>
                    ))}
              </div>
            )}
          </div>
        </div>
          </div>

          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-neutral-900">My Records</h3>
                <p className="text-neutral-600 text-sm">Upload photos or PDFs that your doctor can view after a completed meeting.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-sm font-semibold">
                {patientRecords.length} files
              </span>
            </div>

            <form onSubmit={handleRecordUpload} className="grid gap-4 md:grid-cols-[1fr_auto]">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setRecordFile(e.target.files?.[0] || null)}
                className="block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm"
              />
              <button
                type="submit"
                disabled={recordUploadLoading}
                className="rounded-xl bg-primary-600 px-5 py-3 font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
              >
                {recordUploadLoading ? 'Uploading...' : 'Upload Record'}
              </button>
            </form>

            {recordError && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {recordError}
              </div>
            )}

            <div className="mt-6 space-y-3">
              {patientRecords.length === 0 ? (
                <p className="text-sm text-neutral-500">No records uploaded yet.</p>
              ) : (
                patientRecords.map((record) => (
                  <div
                    key={record._id}
                    className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setPreviewRecord(record)}
                        className="text-left"
                      >
                        <p className="font-semibold text-neutral-900">{record.title}</p>
                        <p className="text-xs text-neutral-500">{new Date(record.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-primary-600 mt-1">View record</p>
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewRecord(record)}
                          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(record._id)}
                          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {previewRecord && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
              <div className="w-full max-w-4xl rounded-3xl bg-white p-4 shadow-2xl">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900">{previewRecord.title}</h3>
                    <p className="text-sm text-neutral-500">{previewRecord.fileName || previewRecord.title}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewRecord(null)}
                    className="rounded-full px-3 py-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                    aria-label="Close preview"
                  >
                    ×
                  </button>
                </div>
                {previewRecord.mimeType?.includes('pdf') ? (
                  <iframe
                    title={previewRecord.title}
                    src={resolveRecordUrl(previewRecord.fileUrl)}
                    className="h-[75vh] w-full rounded-2xl border border-neutral-200"
                  />
                ) : (
                  <img
                    src={resolveRecordUrl(previewRecord.fileUrl)}
                    alt={previewRecord.title}
                    className="max-h-[75vh] w-full rounded-2xl object-contain bg-neutral-100"
                  />
                )}
              </div>
            </div>
          )}

          {paymentModalOpen && paymentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600">Secure payment</p>
                <h3 className="mt-2 text-2xl font-bold text-neutral-900">Pay for your consultation</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  {paymentTarget.doctorName || 'Doctor'} on {new Date(paymentTarget.date).toLocaleDateString()} at {paymentTarget.timeSlot}
                </p>
              </div>
              <button
                onClick={closePaymentModal}
                className="rounded-full px-3 py-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                aria-label="Close payment dialog"
              >
                ×
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-neutral-600">Consultation fee</span>
                <span className="text-2xl font-bold text-neutral-900">₹{paymentTarget.consultationPrice ?? paymentTarget.doctor?.consultationFee ?? 500}</span>
              </div>
              <p className="mt-3 text-sm text-neutral-500">
                After payment, you will return to this home screen. When it is time for your appointment, a join button will appear here.
              </p>
            </div>

            {paymentError && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {paymentError}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
              <button
                onClick={closePaymentModal}
                className="rounded-2xl border border-neutral-300 px-5 py-3 font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePayWithRazorpay}
                disabled={paymentLoading || !razorpayReady}
                className="rounded-2xl bg-primary-600 px-5 py-3 font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {paymentLoading ? 'Opening Razorpay...' : 'Pay with Razorpay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
