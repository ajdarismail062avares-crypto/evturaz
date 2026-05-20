import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

interface TourParticipant {
  userId: string;
  socketId: string;
  name: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number };
  isMuted: boolean;
}

const tourRooms = new Map<string, TourParticipant[]>();

export function initWebSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL, credentials: true },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token'));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      const user = await prisma.user.findUnique({ where: { id: payload.id }, select: { id: true, firstName: true, lastName: true } });
      if (!user) return next(new Error('Invalid token'));
      (socket as any).user = user;
      next();
    } catch {
      next(new Error('Auth failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`WS connected: ${user.id}`);

    socket.on('join_tour', async ({ roomCode }: { roomCode: string }) => {
      socket.join(roomCode);
      if (!tourRooms.has(roomCode)) tourRooms.set(roomCode, []);

      const participant: TourParticipant = {
        userId: user.id,
        socketId: socket.id,
        name: `${user.firstName} ${user.lastName}`,
        position: { x: 0, y: 1.7, z: 0 },
        rotation: { x: 0, y: 0 },
        isMuted: false,
      };
      tourRooms.get(roomCode)!.push(participant);

      socket.to(roomCode).emit('participant_joined', participant);
      socket.emit('tour_state', { participants: tourRooms.get(roomCode) });

      await prisma.tourSession.updateMany({
        where: { roomCode, status: 'SCHEDULED' },
        data: { status: 'LIVE', startedAt: new Date() },
      });
    });

    socket.on('tour_move', ({ roomCode, position, rotation }: any) => {
      const room = tourRooms.get(roomCode);
      if (!room) return;
      const p = room.find(p => p.socketId === socket.id);
      if (p) { p.position = position; p.rotation = rotation; }
      socket.to(roomCode).emit('participant_moved', { socketId: socket.id, position, rotation });
    });

    socket.on('voice_signal', ({ roomCode, signal, targetId }: any) => {
      socket.to(roomCode).emit('voice_signal', { from: socket.id, signal, targetId });
    });

    socket.on('chat_message', ({ roomCode, message }: any) => {
      io.to(roomCode).emit('chat_message', {
        userId: user.id,
        name: user.firstName,
        message,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('teleport', ({ roomCode, roomName }: any) => {
      socket.to(roomCode).emit('participant_teleported', { socketId: socket.id, roomName });
    });

    socket.on('leave_tour', ({ roomCode }: any) => {
      leaveTour(socket, roomCode, io);
    });

    socket.on('disconnect', () => {
      tourRooms.forEach((_, roomCode) => leaveTour(socket, roomCode, io));
    });

    socket.on('send_message', async ({ receiverId, content }: any) => {
      const msg = await prisma.message.create({
        data: { senderId: user.id, receiverId, content },
      });
      socket.to(receiverId).emit('new_message', msg);
    });
  });

  return io;
}

function leaveTour(socket: Socket, roomCode: string, io: Server) {
  const room = tourRooms.get(roomCode);
  if (!room) return;
  const idx = room.findIndex(p => p.socketId === socket.id);
  if (idx !== -1) {
    room.splice(idx, 1);
    socket.to(roomCode).emit('participant_left', { socketId: socket.id });
    socket.leave(roomCode);
  }
  if (room.length === 0) tourRooms.delete(roomCode);
}
