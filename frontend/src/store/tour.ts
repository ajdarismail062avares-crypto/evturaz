import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { TourParticipant } from '@/types';

interface TourState {
  socket: Socket | null;
  participants: TourParticipant[];
  isMuted: boolean;
  messages: ChatMessage[];
  connect: (token: string) => void;
  disconnect: () => void;
  joinTour: (roomCode: string) => void;
  sendMove: (roomCode: string, position: any, rotation: any) => void;
  toggleMute: () => void;
  sendMessage: (roomCode: string, message: string) => void;
}

interface ChatMessage {
  userId: string;
  name: string;
  message: string;
  timestamp: string;
}

export const useTourStore = create<TourState>((set, get) => ({
  socket: null,
  participants: [],
  isMuted: false,
  messages: [],

  connect: (token: string) => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('tour_state', ({ participants }: { participants: TourParticipant[] }) => {
      set({ participants });
    });

    socket.on('participant_joined', (p: TourParticipant) => {
      set(s => ({ participants: [...s.participants, p] }));
    });

    socket.on('participant_left', ({ socketId }: { socketId: string }) => {
      set(s => ({ participants: s.participants.filter(p => p.socketId !== socketId) }));
    });

    socket.on('participant_moved', ({ socketId, position, rotation }: any) => {
      set(s => ({
        participants: s.participants.map(p =>
          p.socketId === socketId ? { ...p, position, rotation } : p
        ),
      }));
    });

    socket.on('chat_message', (msg: ChatMessage) => {
      set(s => ({ messages: [...s.messages.slice(-99), msg] }));
    });

    set({ socket });
  },

  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null, participants: [], messages: [] });
  },

  joinTour: (roomCode: string) => {
    get().socket?.emit('join_tour', { roomCode });
  },

  sendMove: (roomCode, position, rotation) => {
    get().socket?.emit('tour_move', { roomCode, position, rotation });
  },

  toggleMute: () => set(s => ({ isMuted: !s.isMuted })),

  sendMessage: (roomCode, message) => {
    get().socket?.emit('chat_message', { roomCode, message });
  },
}));
