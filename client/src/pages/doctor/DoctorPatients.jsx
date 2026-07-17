import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function DoctorPatients() {
  const navigate = useNavigate();
  const doctorInfo = JSON.parse(localStorage.getItem('doctorInfo'));
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!doctorInfo?.token) {
      navigate('/doctor/login');
      return;
    }

    const loadPatients = async () => {
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${doctorInfo.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/patient-records/doctor/patients', config);
        setPatients(Array.isArray(data) ? data : []);
        if (data?.[0]?._id) {
          setSelectedPatientId(data[0]._id);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load patients');
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, [doctorInfo, navigate]);

  useEffect(() => {
    if (!doctorInfo?.token || !selectedPatientId) return;

    const loadDetails = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${doctorInfo.token}` } };
        const { data } = await axios.get(`http://localhost:5000/api/patient-records/doctor/patients/${selectedPatientId}`, config);
        setDetails(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load patient details');
      }
    };

    loadDetails();
  }, [doctorInfo, selectedPatientId]);

  if (!doctorInfo) return null;

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Patients</h1>
            <p className="text-neutral-600">Patients appear here after a completed consultation.</p>
          </div>
          <button onClick={() => navigate('/doctor/dashboard')} className="rounded-xl bg-neutral-900 px-4 py-2 text-white">
            Back to dashboard
          </button>
        </div>

        {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-3xl border border-neutral-200 bg-white p-4">
            {loading ? (
              <p className="p-4 text-sm text-neutral-500">Loading patients...</p>
            ) : patients.length === 0 ? (
              <p className="p-4 text-sm text-neutral-500">No completed patients yet.</p>
            ) : (
              <div className="space-y-2">
                {patients.map((patient) => (
                  <button
                    key={patient._id}
                    onClick={() => setSelectedPatientId(patient._id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${selectedPatientId === patient._id ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'}`}
                  >
                    <div className="font-semibold text-neutral-900">{patient.name}</div>
                    <div className="text-xs text-neutral-500">{patient.email}</div>
                    <div className="mt-1 text-xs text-neutral-500">
                      {patient.completedMeetings} meeting(s) - {patient.recordCount} record(s)
                    </div>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <section className="rounded-3xl border border-neutral-200 bg-white p-6">
            {!details ? (
              <p className="text-sm text-neutral-500">Select a patient to view meetings and records.</p>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900">{details.patient.name}</h2>
                  <p className="text-neutral-600">{details.patient.email}</p>
                  <p className="text-neutral-600">{details.patient.phone || 'No phone added'}</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-neutral-900">Previous meetings</h3>
                    <div className="space-y-3">
                      {details.meetings?.length ? details.meetings.map((meeting) => (
                        <div key={meeting._id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm">
                          <div className="font-semibold text-neutral-900">{new Date(meeting.date).toLocaleDateString()} at {meeting.timeSlot}</div>
                          <div className="text-neutral-600">Status: {meeting.status}</div>
                          <div className="text-neutral-600">{meeting.complaint || meeting.reason || 'No complaint provided'}</div>
                        </div>
                      )) : <p className="text-sm text-neutral-500">No meetings found.</p>}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-neutral-900">Uploaded records</h3>
                    <div className="space-y-3">
                      {details.records?.length ? details.records.map((record) => (
                        <a key={record._id} href={record.fileUrl} target="_blank" rel="noreferrer" className="block rounded-2xl border border-neutral-200 bg-neutral-50 p-4 hover:bg-neutral-100">
                          <div className="font-semibold text-neutral-900">{record.title}</div>
                          <div className="text-xs text-neutral-500">{new Date(record.createdAt).toLocaleDateString()}</div>
                          <div className="text-xs text-neutral-500">{record.mimeType?.includes('pdf') ? 'PDF' : 'Image'}</div>
                        </a>
                      )) : <p className="text-sm text-neutral-500">No records uploaded yet.</p>}
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
