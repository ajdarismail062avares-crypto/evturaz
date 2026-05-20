'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, Users, Copy, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { useTourStore } from '@/store/tour';
import { useAuthStore } from '@/store/auth';
import { generateDemoRoomData } from '@/lib/utils';
import { TourRoomData } from '@/types';
import toast from 'react-hot-toast';

const FreeWalkMode = dynamic(() => import('@/components/3d/FreeWalkMode').then(m => ({ default: m.FreeWalkMode })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-luxury-dark">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60">3D mühit yüklənir...</p>
      </div>
    </div>
  ),
});

const TourChat = dynamic(() => import('@/components/3d/TourChat').then(m => ({ default: m.TourChat })), { ssr: false });

export default function TourPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  const { user, token } = useAuthStore();
  const { connect, disconnect, participants, joinTour, isMuted, toggleMute, messages, sendMessage } = useTourStore();

  const [roomData, setRoomData] = useState<TourRoomData | null>(null);
  const [roomCode, setRoomCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const { data: session } = await api.post('/tours', { propertyId, isMultiplayer });
        setRoomCode(session.roomCode);

        const { data: property } = await api.get(`/properties/${propertyId}`);
        setRoomData(property.tourRoomData ?? generateDemoRoomData());

        if (isMultiplayer && token) {
          connect(token);
          joinTour(session.roomCode);
        }
      } catch {
        setRoomData(generateDemoRoomData());
      }
    }
    init();
    return () => { disconnect(); };
  }, [propertyId, isMultiplayer, token]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(`${window.location.origin}/tour/join/${roomCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Dəvət linki kopyalandı!');
  };

  if (!roomData) {
    return (
      <div className="fixed inset-0 bg-luxury-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-luxury-dark flex flex-col">
      {/* Üst HUD paneli */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={() => router.back()} className="flex items-center gap-2 glass rounded-xl px-4 py-2 hover:bg-white/10 transition-colors text-sm">
          <ArrowLeft size={16} /> Turdan Çıx
        </button>

        <div className="flex items-center gap-2">
          {isMultiplayer && (
            <button onClick={copyRoomCode} className="flex items-center gap-2 glass rounded-xl px-4 py-2 text-sm hover:bg-white/10 transition-colors">
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              {copied ? 'Kopyalandı!' : 'Dəvət Et'}
            </button>
          )}

          <button
            onClick={() => setIsMultiplayer(m => !m)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-colors ${isMultiplayer ? 'bg-brand-500 text-white' : 'glass text-white/70 hover:text-white'}`}
          >
            <Users size={14} />
            {isMultiplayer ? `${participants.length + 1} turda` : 'Birgə Tura Keç'}
          </button>

          {isMultiplayer && (
            <button onClick={() => setShowChat(s => !s)} className="glass rounded-xl px-4 py-2 text-sm hover:bg-white/10 transition-colors">
              Söhbət {messages.length > 0 && <span className="ml-1 bg-brand-500 text-white text-xs rounded-full px-1.5">{messages.length}</span>}
            </button>
          )}
        </div>
      </div>

      {/* 3D Kətan */}
      <div className="flex-1">
        <FreeWalkMode
          roomData={roomData}
          participants={participants}
          isMultiplayer={isMultiplayer}
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />
      </div>

      {/* Söhbət paneli */}
      {showChat && isMultiplayer && (
        <TourChat
          messages={messages}
          onSend={msg => sendMessage(roomCode, msg)}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}
