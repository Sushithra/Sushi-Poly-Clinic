import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const getSession = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const doctorInfo = JSON.parse(localStorage.getItem('doctorInfo'));
  return userInfo || doctorInfo || null;
};

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

export default function AppointmentPayment() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const session = useMemo(() => getSession(), []);
  const isDoctorSession = Boolean(localStorage.getItem('doctorInfo')) && !localStorage.getItem('userInfo');

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (!session || !session.token) {
      navigate('/login');
      return;
    }

    const fetchAppointment = async () => {
      try {
        setLoading(true);
        setError('');
        const config = { headers: { Authorization: `Bearer ${session.token}` } };
        const { data } = await axios.get(`http://localhost:5000/api/appointments/${appointmentId}`, config);
        setAppointment(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load appointment');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId, navigate, session]);

  useEffect(() => {
    let mounted = true;

    loadRazorpayScript().then((loaded) => {
      if (mounted) {
        setScriptReady(loaded);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const verifyPayment = async ({ razorpay_payment_id, razorpay_order_id, razorpay_signature }) => {
    const config = { headers: { Authorization: `Bearer ${session.token}` } };
    const { data } = await axios.post(
      'http://localhost:5000/api/verify-payment',
      {
        appointmentId,
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      },
      config,
    );

    navigate(`/consultations/${appointmentId}`, {
      state: {
        appointment: data.appointment,
        consultation: data.consultation,
      },
    });
  };

  const handleRazorpayCheckout = async () => {
    if (!session?.token) {
      setError('Please log in again to continue.');
      return;
    }

    try {
      setProcessing(true);
      setError('');
      const scriptLoadedNow = scriptReady || (await loadRazorpayScript());
      if (!scriptLoadedNow || !window.Razorpay) {
        setError('Razorpay checkout failed to load. Please refresh and try again.');
        return;
      }

      const amount = Math.max(100, Math.round(Number(appointment?.consultationPrice ?? appointment?.doctor?.consultationFee ?? 500) * 100));
      const config = { headers: { Authorization: `Bearer ${session.token}` } };

      const { data: orderData } = await axios.post(
        'http://localhost:5000/api/create-order',
        {
          appointmentId,
          amount,
          currency: 'INR',
          receipt: `appointment_${appointmentId}`,
        },
        config,
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Eclinic',
        description: `Consultation payment for ${appointment?.doctorName || 'Doctor'}`,
        order_id: orderData.order_id,
        prefill: {
          name: session.name || appointment?.patientName || '',
          email: session.email || appointment?.patientEmail || '',
          contact: session.phone || appointment?.patientPhone || '',
        },
        theme: {
          color: '#06b6d4',
        },
        handler: async (response) => {
          try {
            await verifyPayment(response);
          } catch (verifyError) {
            setError(verifyError.response?.data?.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            setError('Payment was cancelled before completion.');
          },
        },
        notes: {
          appointmentId,
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response) => {
        setError(response?.error?.description || 'Payment failed');
      });
      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment could not be completed');
    } finally {
      setProcessing(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 text-white px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-cyan-200 uppercase tracking-[0.3em] text-xs font-semibold">Secure checkout</p>
          <h1 className="mt-3 text-3xl md:text-5xl font-bold">Complete payment to unlock the consultation room</h1>
          <p className="mt-3 text-slate-300 max-w-2xl">
            We keep the consultation locked until payment is confirmed. Once paid, the app generates a private room and opens it only for the booked doctor and patient.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm text-red-100">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-6 md:p-8 shadow-2xl">
            {loading ? (
              <div className="space-y-4">
                <div className="h-8 w-3/5 rounded-full bg-white/10 animate-pulse" />
                <div className="h-24 rounded-2xl bg-white/10 animate-pulse" />
                <div className="h-16 rounded-2xl bg-white/10 animate-pulse" />
              </div>
            ) : appointment ? (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-200">
                    Appointment #{String(appointment._id).slice(-6)}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
                    {appointment.paymentStatus === 'paid' ? 'Paid' : 'Awaiting payment'}
                  </span>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                  <h2 className="text-xl font-semibold">{appointment.doctorName || appointment.doctor?.name || 'Doctor'}</h2>
                  <p className="mt-1 text-slate-300">{appointment.doctorSpecialty || 'General Physician'} • {appointment.consultationType || 'video'}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Appointment time</p>
                      <p className="mt-1 text-white font-semibold">{new Date(appointment.date).toLocaleDateString()} at {appointment.timeSlot}</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Consultation fee</p>
                      <p className="mt-1 text-white font-semibold">Rs. {appointment.consultationPrice ?? appointment.doctor?.consultationFee ?? 500}</p>
                    </div>
                  </div>
                </div>

                {isDoctorSession ? (
                  <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-5">
                    <p className="text-cyan-50 font-semibold">Doctor access detected.</p>
                    <p className="mt-2 text-sm text-cyan-100/90">
                      Payments are handled by the patient. You can open the consultation room directly.
                    </p>
                    <button
                      onClick={() => navigate(`/consultations/${appointmentId}`)}
                      className="mt-4 inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
                    >
                      Open consultation
                    </button>
                  </div>
                ) : appointment.paymentStatus === 'paid' ? (
                  <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">
                    <p className="text-emerald-100 font-semibold">Payment already completed.</p>
                    <p className="mt-2 text-sm text-emerald-50/90">
                      Reference: {appointment.paymentReference || 'Generated by system'}
                    </p>
                    <button
                      onClick={() => navigate(`/consultations/${appointmentId}`)}
                      className="mt-4 inline-flex items-center justify-center rounded-2xl bg-emerald-300 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-200"
                    >
                      Open consultation
                    </button>
                  </div>
                ) : appointment.status !== 'confirmed' && appointment.status !== 'current' ? (
                  <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-5">
                    <p className="text-amber-50 font-semibold">Waiting for doctor confirmation.</p>
                    <p className="mt-2 text-sm text-amber-100/90">
                      You can pay after the doctor confirms your appointment.
                    </p>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleRazorpayCheckout}
                      disabled={processing || !scriptReady || !import.meta.env.VITE_RAZORPAY_KEY_ID}
                      className="mt-6 inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {processing ? 'Opening Razorpay...' : 'Pay with Razorpay'}
                    </button>
                    {!scriptReady && (
                      <p className="mt-3 text-sm text-slate-300">Loading secure checkout...</p>
                    )}
                    {!import.meta.env.VITE_RAZORPAY_KEY_ID && (
                      <p className="mt-3 text-sm text-amber-200">
                        Razorpay key ID is not configured in the frontend env file.
                      </p>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-red-100">
                Appointment not found.
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold">What happens next</h3>
              <ol className="mt-4 space-y-3 text-sm text-slate-300">
                <li>1. You confirm payment for the booked slot.</li>
                <li>2. The server generates a unique WebRTC room for this appointment.</li>
                <li>3. Only the assigned doctor and patient can enter from the website.</li>
                <li>4. The room opens shortly before the scheduled time and closes after the appointment window.</li>
              </ol>
            </div>

            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-6 text-cyan-50">
              <h3 className="text-lg font-semibold">Security note</h3>
              <p className="mt-3 text-sm text-cyan-100/90">
                The consultation link is never shown publicly. Access is checked on the server for each request, and the room name is generated after payment.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
