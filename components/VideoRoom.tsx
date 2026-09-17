'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type SignalPayload = { sdp?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit };

export default function VideoRoom({ roomToken, isProfessional }: { roomToken: string; isProfessional: boolean }) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);
  const makingOffer = useRef(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [status, setStatus] = useState('Preparando câmera e microfone…');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    const channel = supabase.channel(`consultation:${roomToken}`, {
      config: { broadcast: { self: false } },
    });
    channelRef.current = channel;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    peerRef.current = pc;

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setStatus('Conectado');
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        channel.send({ type: 'broadcast', event: 'ice', payload: { candidate: event.candidate.toJSON() } });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') setStatus('Conectado');
      if (pc.connectionState === 'disconnected') setStatus('Conexão interrompida');
      if (pc.connectionState === 'failed') setStatus('Não foi possível estabelecer a chamada');
    };

    async function createOffer() {
      if (!isProfessional || makingOffer.current || pc.signalingState !== 'stable') return;
      makingOffer.current = true;
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await channel.send({ type: 'broadcast', event: 'offer', payload: { sdp: pc.localDescription } });
        setStatus('Chamando paciente…');
      } finally {
        makingOffer.current = false;
      }
    }

    channel
      .on('broadcast', { event: 'ready' }, async () => {
        if (isProfessional) await createOffer();
        else await channel.send({ type: 'broadcast', event: 'ready', payload: {} });
      })
      .on('broadcast', { event: 'offer' }, async ({ payload }: { payload: SignalPayload }) => {
        if (isProfessional || !payload.sdp) return;
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await channel.send({ type: 'broadcast', event: 'answer', payload: { sdp: pc.localDescription } });
        setStatus('Conectando…');
      })
      .on('broadcast', { event: 'answer' }, async ({ payload }: { payload: SignalPayload }) => {
        if (!isProfessional || !payload.sdp) return;
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      })
      .on('broadcast', { event: 'ice' }, async ({ payload }: { payload: SignalPayload }) => {
        if (!payload.candidate) return;
        try {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch (err) {
          console.warn('ICE candidate rejected', err);
        }
      });

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) return;
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        channel.subscribe(async (state) => {
          if (state === 'SUBSCRIBED') {
            setStatus(isProfessional ? 'Aguardando paciente…' : 'Aguardando Fernanda…');
            await channel.send({ type: 'broadcast', event: 'ready', payload: {} });
          }
        });
      } catch (err) {
        console.error(err);
        setError('Não foi possível acessar câmera e microfone. Verifique as permissões do navegador.');
        setStatus('Permissão necessária');
      }
    }

    start();

    return () => {
      cancelled = true;
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      pc.close();
      supabase.removeChannel(channel);
    };
  }, [roomToken, isProfessional]);

  function toggleMic() {
    const next = !micOn;
    localStreamRef.current?.getAudioTracks().forEach((track) => { track.enabled = next; });
    setMicOn(next);
  }

  function toggleCamera() {
    const next = !cameraOn;
    localStreamRef.current?.getVideoTracks().forEach((track) => { track.enabled = next; });
    setCameraOn(next);
  }

  function hangUp() {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    peerRef.current?.close();
    window.location.href = isProfessional ? '/profissional' : '/dashboard';
  }

  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-col overflow-hidden rounded-3xl bg-[#111827] text-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div><p className="font-semibold">Sala de atendimento</p><p className="text-xs text-white/55">{status}</p></div>
        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">WebRTC P2P</span>
      </div>

      {error && <div className="m-4 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">{error}</div>}

      <div className="relative flex-1 p-4 sm:p-6">
        <div className="relative h-full min-h-[520px] overflow-hidden rounded-2xl bg-[#1F2937]">
          <video ref={remoteVideoRef} autoPlay playsInline className="h-full min-h-[520px] w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-white/45">
            <div><Video className="mx-auto h-12 w-12" /><p className="mt-3 text-sm">O vídeo da outra pessoa aparece aqui quando a conexão for estabelecida.</p></div>
          </div>

          <div className="absolute bottom-4 right-4 w-36 overflow-hidden rounded-xl border-2 border-white/20 bg-black shadow-2xl sm:w-56">
            <video ref={localVideoRef} autoPlay muted playsInline className="aspect-video w-full object-cover" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 border-t border-white/10 px-4 py-5">
        <button onClick={toggleMic} className={`flex h-12 w-12 items-center justify-center rounded-full ${micOn ? 'bg-white/10 hover:bg-white/20' : 'bg-amber-500'}`} aria-label="Microfone">{micOn ? <Mic /> : <MicOff />}</button>
        <button onClick={toggleCamera} className={`flex h-12 w-12 items-center justify-center rounded-full ${cameraOn ? 'bg-white/10 hover:bg-white/20' : 'bg-amber-500'}`} aria-label="Câmera">{cameraOn ? <Video /> : <VideoOff />}</button>
        <button onClick={hangUp} className="flex h-12 w-14 items-center justify-center rounded-full bg-red-500 hover:bg-red-600" aria-label="Encerrar"><PhoneOff /></button>
      </div>
    </div>
  );
}
