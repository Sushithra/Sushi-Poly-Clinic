import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config/env.js';

const getSession = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const doctorInfo = JSON.parse(localStorage.getItem('doctorInfo'));
  return userInfo || doctorInfo || null;
};

const getSocketUrl = () => import.meta.env.VITE_SOCKET_URL || API_BASE_URL;

const createPeerConnection = (onCandidate, onTrack, onStateChange) => {
  const peer = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  });

  peer.onicecandidate = (event) => {
    if (event.candidate) {
      onCandidate(event.candidate);
    }
  };

  peer.ontrack = onTrack;
  peer.onconnectionstatechange = onStateChange;

  return peer;
};

export default function ConsultationRoom() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const session = useMemo(() => getSession(), []);
  const isDoctorSession = Boolean(localStorage.getItem('doctorInfo')) && !localStorage.getItem('userInfo');

  const [appointment, setAppointment] = useState(location.state?.appointment || null);
  const [consultation, setConsultation] = useState(location.state?.consultation || null);
  const [loading, setLoading] = useState(!location.state?.consultation);
  const [error, setError] = useState('');
  const [meetingStatus, setMeetingStatus] = useState('idle');
  const [isJoining, setIsJoining] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [isInitiator, setIsInitiator] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const roomIdRef = useRef('');
  const offerCreatedRef = useRef(false);
  const joinResolvedRef = useRef(false);
  const joinRetryRef = useRef(false);

  useEffect(() => {
    if (!session?.token) {
      navigate('/login');
      return;
    }

    const fetchAccess = async () => {
      try {
        setLoading(true);
        setError('');
        const config = { headers: { Authorization: `Bearer ${session.token}` } };
        const { data } = await axios.get(`http://localhost:5000/api/appointments/${appointmentId}/consultation-access`, config);
        setAppointment(data.appointment);
        setConsultation(data.consultation);
      } catch (err) {
        const response = err.response?.data;
        setAppointment(response?.appointment || null);
        setConsultation(response?.consultation || null);
        setError(response?.message || 'Unable to load consultation access');
      } finally {
        setLoading(false);
      }
    };

    fetchAccess();
  }, [appointmentId, navigate, session]);

  const canPay =
    consultation?.paymentDue &&
    !isDoctorSession &&
    (appointment?.status === 'confirmed' || appointment?.status === 'current');
  const canJoin = Boolean(consultation?.canJoin);

  const cleanupMeeting = () => {
    offerCreatedRef.current = false;
    joinResolvedRef.current = false;
    joinRetryRef.current = false;
    setIsJoining(false);
    setMeetingStatus('idle');
    setParticipantCount(0);
    setIsInitiator(false);

    if (socketRef.current) {
      socketRef.current.emit('leave-room');
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (peerRef.current) {
      peerRef.current.onicecandidate = null;
      peerRef.current.ontrack = null;
      peerRef.current.onconnectionstatechange = null;
      peerRef.current.close();
      peerRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  useEffect(() => cleanupMeeting, []);

  const ensurePeerConnection = () => {
    if (peerRef.current) {
      return peerRef.current;
    }

    const peer = createPeerConnection(
      (candidate) => {
        if (socketRef.current && roomIdRef.current) {
          socketRef.current.emit('webrtc-ice-candidate', {
            roomId: roomIdRef.current,
            candidate,
          });
        }
      },
      (event) => {
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream();
        }

        event.streams[0]?.getTracks().forEach((track) => {
          if (!remoteStreamRef.current.getTracks().some((existingTrack) => existingTrack.id === track.id)) {
            remoteStreamRef.current.addTrack(track);
          }
        });

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStreamRef.current;
        }

        setMeetingStatus('connected');
      },
      () => {
        const state = peer.connectionState;
        if (state === 'connected') {
          setMeetingStatus('connected');
        } else if (state === 'connecting') {
          setMeetingStatus('connecting');
        } else if (state === 'disconnected' || state === 'failed') {
          setMeetingStatus('waiting');
        }
      },
    );

    localStreamRef.current?.getTracks().forEach((track) => {
      peer.addTrack(track, localStreamRef.current);
    });

    peerRef.current = peer;
    return peer;
  };

  const createAndSendOffer = async () => {
    if (offerCreatedRef.current || !socketRef.current || !roomIdRef.current) {
      return;
    }

    const peer = ensurePeerConnection();
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socketRef.current.emit('webrtc-offer', {
      roomId: roomIdRef.current,
      offer: peer.localDescription,
    });
    offerCreatedRef.current = true;
    setMeetingStatus('calling');
  };

  const startMeeting = async () => {
    if (!canJoin) {
      setError('The meeting window is not open yet.');
      return;
    }

    try {
      setError('');
      setIsJoining(true);
      setMeetingStatus('starting');

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('This browser does not support camera or microphone access');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const socket = io(getSocketUrl(), {
        transports: ['websocket'],
        auth: { token: session.token },
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit(
          'join-room',
          { appointmentId },
          async (response) => {
            if (!response?.success) {
              if (response?.message === 'This consultation room is already full' && !joinRetryRef.current) {
                joinRetryRef.current = true;
                setTimeout(() => {
                  if (socket.connected) {
                    socket.emit('join-room', { appointmentId }, () => {});
                  }
                }, 1500);
                setMeetingStatus('waiting');
                return;
              }
              setError(response?.message || 'Unable to join consultation');
              cleanupMeeting();
              return;
            }

            joinResolvedRef.current = true;
            roomIdRef.current = response.roomId;
            setIsInitiator(Boolean(response.isInitiator));
            setParticipantCount(response.participantCount || 1);
            setMeetingStatus(response.participantCount > 1 ? 'connecting' : 'waiting');

            ensurePeerConnection();

            if (response.isInitiator && response.participantCount > 1) {
              await createAndSendOffer();
            }
          },
        );
      });

      socket.on('room-ready', async (response) => {
        roomIdRef.current = response.roomId;
        setIsInitiator(Boolean(response.isInitiator));
        setParticipantCount(response.participantCount || 1);
        setMeetingStatus(response.participantCount > 1 ? 'connecting' : 'waiting');

        ensurePeerConnection();
        if (response.isInitiator && response.participantCount > 1) {
          await createAndSendOffer();
        }
      });

      socket.on('peer-joined', async (response) => {
        setParticipantCount(response.participantCount || 2);
        if (isInitiator && !offerCreatedRef.current) {
          setMeetingStatus('connecting');
          await createAndSendOffer();
        }
      });

      socket.on('room-initiator', async () => {
        setIsInitiator(true);
        if (joinResolvedRef.current && !offerCreatedRef.current && socketRef.current && roomIdRef.current) {
          await createAndSendOffer();
        }
      });

      socket.on('webrtc-offer', async ({ offer }) => {
        const peer = ensurePeerConnection();
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit('webrtc-answer', {
          roomId: roomIdRef.current,
          answer: peer.localDescription,
        });
        setMeetingStatus('answering');
      });

      socket.on('webrtc-answer', async ({ answer }) => {
        const peer = ensurePeerConnection();
        if (!peer.currentRemoteDescription) {
          await peer.setRemoteDescription(new RTCSessionDescription(answer));
          setMeetingStatus('connected');
        }
      });

      socket.on('webrtc-ice-candidate', async ({ candidate }) => {
        try {
          const peer = ensurePeerConnection();
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (iceError) {
          console.error('ICE candidate error:', iceError);
        }
      });

      socket.on('peer-left', () => {
        setParticipantCount((current) => Math.max(1, current - 1));
        setMeetingStatus('waiting');
      });

      socket.on('disconnect', () => {
        setMeetingStatus('disconnected');
      });

      socket.on('connect_error', (socketError) => {
        setError(socketError.message || 'Failed to connect to the consultation room');
        cleanupMeeting();
      });
    } catch (meetingError) {
      setError(meetingError.message || 'Unable to start meeting');
      cleanupMeeting();
    } finally {
      setIsJoining(false);
    }
  };

  const toggleMute = () => {
    const track = localStreamRef.current?.getAudioTracks?.()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setIsMuted(!track.enabled);
  };

  const toggleVideo = () => {
    const track = localStreamRef.current?.getVideoTracks?.()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setIsVideoOff(!track.enabled);
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Consultation room</p>
          <h1 className="mt-2 text-2xl font-semibold">
            {appointment?.doctorName || 'Doctor'} with {appointment?.patientName || 'Patient'}
          </h1>
          {appointment && (
            <p className="mt-2 text-sm text-slate-300">
              {new Date(appointment.date).toLocaleDateString()} at {appointment.timeSlot}
            </p>
          )}
        </div>

        {loading && <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">Loading consultation...</div>}
        {!loading && error && (
          <div className="mt-6 rounded-3xl border border-amber-400/20 bg-amber-500/10 p-6 text-amber-50">
            {error}
          </div>
        )}

        {!loading && consultation && !canJoin && consultation.paymentDue && (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">Payment required</h2>
            <p className="mt-2 text-sm text-slate-300">
              {appointment?.status === 'confirmed' || appointment?.status === 'current'
                ? 'The consultation is locked until payment is completed.'
                : 'Please wait for the doctor to confirm the appointment before payment.'}
            </p>
            {canPay && (
              <button
                onClick={() => navigate('/patient/dashboard', { state: { openPaymentAppointmentId: appointmentId } })}
                className="mt-4 rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950"
              >
                Complete payment
              </button>
            )}
          </div>
        )}

        {!loading && consultation && !canJoin && !consultation.paymentDue && consultation.isTooEarly && (
          <div className="mt-6 rounded-3xl border border-sky-400/20 bg-sky-500/10 p-6 text-sky-50">
            <h2 className="text-lg font-semibold">Waiting room</h2>
            <p className="mt-2 text-sm text-sky-100/90">
              The room opens at {consultation.startsAt ? new Date(consultation.startsAt).toLocaleString() : 'the scheduled time'}.
            </p>
          </div>
        )}

        {!loading && consultation && canJoin && (
          <div className="mt-6 rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-6 text-emerald-50 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Consultation ready</h2>
              <p className="mt-2 text-sm text-emerald-100/90">
                The room will stay inside the website. Invite the other participant to join the same appointment room.
              </p>
            </div>
            <button
              onClick={startMeeting}
              disabled={isJoining}
              className="rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-100 disabled:opacity-60"
            >
              {isJoining ? 'Starting...' : meetingStatus === 'connected' ? 'Rejoin meeting' : 'Join meeting'}
            </button>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">Session details</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p>Room: {consultation?.consultationRoomName || 'Not generated yet'}</p>
              <p>Payment: {appointment?.paymentStatus || consultation?.paymentStatus || 'pending'}</p>
              <p>Join window: {consultation?.startsAt ? `${new Date(consultation.startsAt).toLocaleString()} - ${new Date(consultation.endsAt).toLocaleString()}` : 'Pending'}</p>
              <p>Participants: {participantCount || 0}</p>
              <p>Status: {meetingStatus}</p>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-black p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-950 p-3">
                <p className="mb-2 text-xs uppercase tracking-[0.3em] text-cyan-300">Local camera</p>
                <video ref={localVideoRef} autoPlay playsInline muted className="h-[34vh] w-full rounded-xl bg-black object-cover" />
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950 p-3">
                <p className="mb-2 text-xs uppercase tracking-[0.3em] text-cyan-300">Remote camera</p>
                <video ref={remoteVideoRef} autoPlay playsInline className="h-[34vh] w-full rounded-xl bg-black object-cover" />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={toggleMute}
                className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                disabled={!localStreamRef.current}
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
              <button
                onClick={toggleVideo}
                className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                disabled={!localStreamRef.current}
              >
                {isVideoOff ? 'Start video' : 'Stop video'}
              </button>
              <button
                onClick={() => {
                  cleanupMeeting();
                  navigate('/patient/dashboard');
                }}
                className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400"
              >
                Leave room
              </button>
            </div>

            {!canJoin && !consultation?.paymentDue && !loading && (
              <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-center text-sm text-slate-300">
                The call will unlock when the appointment window opens.
              </div>
            )}

            {canJoin && meetingStatus !== 'connected' && (
              <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-center text-sm text-slate-300">
                Press Join meeting to start the camera and connect to the other side.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
