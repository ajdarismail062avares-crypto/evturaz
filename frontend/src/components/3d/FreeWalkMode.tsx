'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Sky, Environment, Stats } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Maximize2, Sun, Moon, Users, Mic, MicOff, Settings,
  ChevronRight, Home, RotateCcw, Eye, Ruler,
} from 'lucide-react';
import { TourRoomData, TourParticipant } from '@/types';
import { RoomGeometry } from './RoomGeometry';
import { OtherPlayer } from './OtherPlayer';
import { useTourStore } from '@/store/tour';
import { cn } from '@/lib/utils';

function PlayerController({ speed = 4, height = 1.7 }: { speed?: number; height?: number }) {
  const { camera } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const prevTime = useRef(performance.now());

  useEffect(() => {
    const down = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const up = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    camera.position.y = height;
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [camera, height]);

  useFrame(() => {
    const now = performance.now();
    const delta = Math.min((now - prevTime.current) / 1000, 0.1);
    prevTime.current = now;

    const k = keys.current;
    const forward = Number(k['KeyW'] || k['ArrowUp']) - Number(k['KeyS'] || k['ArrowDown']);
    const strafe = Number(k['KeyD'] || k['ArrowRight']) - Number(k['KeyA'] || k['ArrowLeft']);
    const sprint = k['ShiftLeft'] ? 1.8 : 1;

    if (forward !== 0 || strafe !== 0) {
      direction.current.set(strafe, 0, -forward).normalize();
      direction.current.applyEuler(new THREE.Euler(0, camera.rotation.y, 0, 'YXZ'));
      velocity.current.add(direction.current.multiplyScalar(speed * sprint * delta * 10));
    }

    velocity.current.multiplyScalar(1 - delta * 15);
    camera.position.addScaledVector(velocity.current, delta);
    camera.position.y = height;
  });

  return null;
}

function InfiniteGrid() {
  return <gridHelper args={[200, 200, '#1a1a2e', '#12121a']} position={[0, 0, 0]} />;
}

function SceneLighting({ timeOfDay }: { timeOfDay: 'day' | 'dusk' | 'night' }) {
  const configs = {
    day:   { ambient: 0.6, sun: '#fff8e7', intensity: 2.5, pos: [5, 10, 5] as [number,number,number] },
    dusk:  { ambient: 0.3, sun: '#ff7043', intensity: 1.5, pos: [-5, 4, 5] as [number,number,number] },
    night: { ambient: 0.08, sun: '#7986cb', intensity: 0.4, pos: [0, 20, 0] as [number,number,number] },
  };
  const c = configs[timeOfDay];
  return (
    <>
      <ambientLight intensity={c.ambient} />
      <directionalLight color={c.sun} intensity={c.intensity} position={c.pos} castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-far={50}
        shadow-camera-left={-20} shadow-camera-right={20}
        shadow-camera-top={20} shadow-camera-bottom={-20}
      />
      <pointLight position={[0, 3, 0]} intensity={0.3} color="#ffffff" />
    </>
  );
}

function MobileJoystick({ onMove }: { onMove: (dx: number, dy: number) => void }) {
  const base = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const origin = useRef({ x: 0, y: 0 });
  const touching = useRef(false);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    origin.current = { x: t.clientX, y: t.clientY };
    touching.current = true;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touching.current) return;
    const t = e.touches[0];
    const dx = Math.max(-40, Math.min(40, t.clientX - origin.current.x));
    const dy = Math.max(-40, Math.min(40, t.clientY - origin.current.y));
    if (thumb.current) { thumb.current.style.transform = `translate(${dx}px,${dy}px)`; }
    onMove(dx / 40, dy / 40);
  };
  const onTouchEnd = () => {
    touching.current = false;
    if (thumb.current) thumb.current.style.transform = 'translate(0,0)';
    onMove(0, 0);
  };

  return (
    <div
      ref={base}
      className="w-28 h-28 rounded-full bg-white/10 border border-white/20 relative flex items-center justify-center touch-none"
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
    >
      <div ref={thumb} className="w-12 h-12 rounded-full bg-white/30 border border-white/50 transition-transform duration-75" />
    </div>
  );
}

interface FreeWalkModeProps {
  roomData: TourRoomData;
  participants?: TourParticipant[];
  onMove?: (pos: { x: number; y: number; z: number }, rot: { x: number; y: number }) => void;
  isMultiplayer?: boolean;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export function FreeWalkMode({
  roomData, participants = [], onMove, isMultiplayer, isMuted, onToggleMute,
}: FreeWalkModeProps) {
  const [started, setStarted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'dusk' | 'night'>('day');
  const [showStats, setShowStats] = useState(false);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [wallColor, setWallColor] = useState('#f5f0eb');
  const [showControls, setShowControls] = useState(true);
  const controlsRef = useRef<any>(null);

  const timeLabels = { day: <Sun size={16} />, dusk: <Eye size={16} />, night: <Moon size={16} /> };
  const timeOrder: Array<'day' | 'dusk' | 'night'> = ['day', 'dusk', 'night'];
  const cycleTime = () => setTimeOfDay(t => timeOrder[(timeOrder.indexOf(t) + 1) % 3]);

  const skyProps = {
    day:   { sunPosition: [5, 10, 5] as [number,number,number], turbidity: 8, rayleigh: 0.5 },
    dusk:  { sunPosition: [-5, 1, 5] as [number,number,number], turbidity: 20, rayleigh: 4 },
    night: { sunPosition: [0, -10, 0] as [number,number,number], turbidity: 2, rayleigh: 0.1 },
  }[timeOfDay];

  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 5000);
    return () => clearTimeout(timer);
  }, [started]);

  if (!started) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-luxury-dark rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-luxury-dark via-luxury-dark-2 to-luxury-dark-3" />
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-96 h-96 rounded-full border border-brand-500 animate-pulse-slow" />
          <div className="absolute w-64 h-64 rounded-full border border-brand-300 animate-pulse" />
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative text-center z-10 p-8">
          <div className="w-20 h-20 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto mb-6 shadow-brand">
            <Home size={36} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2 gradient-text">Sərbəst Gəzinti Rejimi</h2>
          <p className="text-white/60 mb-8 max-w-sm">
            Bu əmlakı immersiv birinci şəxs 3D rejimdə gəzin. Hərəkət üçün WASD, baxmaq üçün siçandan istifadə edin.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-8 text-sm text-white/60">
            {[
              ['W A S D', 'Hərəkət et'],
              ['Siçan', 'Ətrafına bax'],
              ['Shift', 'Sürətlə qaç'],
              ['Esc', 'Çıx'],
            ].map(([k, v]) => (
              <div key={k} className="glass rounded-lg p-3 text-left">
                <div className="font-mono text-brand-400 font-bold">{k}</div>
                <div>{v}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setStarted(true)} className="btn-primary text-lg px-10 py-4 w-full">
            Tura Başla →
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        camera={{ fov: 75, near: 0.1, far: 1000 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => { gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap; }}
      >
        <Sky {...skyProps} />
        <SceneLighting timeOfDay={timeOfDay} />
        <Environment preset={timeOfDay === 'day' ? 'apartment' : 'night'} />

        <PointerLockControls
          ref={controlsRef}
          onLock={() => setLocked(true)}
          onUnlock={() => setLocked(false)}
        />
        <PlayerController speed={5} height={1.7} />

        {roomData.rooms.map(room => (
          <RoomGeometry
            key={room.id} room={room} wallColor={wallColor}
            isActive={activeRoom === room.id}
            onClick={() => setActiveRoom(room.id === activeRoom ? null : room.id)}
          />
        ))}

        {participants.map(p => (
          <OtherPlayer key={p.socketId} participant={p} />
        ))}

        <InfiniteGrid />
        {showStats && <Stats />}
      </Canvas>

      {locked && <div className="crosshair" />}

      {!locked && (
        <div className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={() => controlsRef.current?.lock()}>
          <div className="glass rounded-xl px-6 py-4 text-center">
            <p className="text-white font-semibold">Tura davam etmək üçün klikləyin</p>
            <p className="text-white/50 text-sm">Dayandırmaq üçün Esc basın</p>
          </div>
        </div>
      )}

      {/* Üst HUD */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none">
        <div className="glass rounded-xl px-4 py-2 pointer-events-auto">
          <div className="flex items-center gap-2 text-sm">
            <Home size={14} className="text-brand-400" />
            <span className="text-white/80">
              {activeRoom ? roomData.rooms.find(r => r.id === activeRoom)?.name ?? 'Əmlak' : 'Əmlak'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button onClick={cycleTime} title="Günün vaxtını dəyiş"
            className="glass rounded-lg p-2.5 text-white/70 hover:text-white transition-colors">
            {timeLabels[timeOfDay]}
          </button>

          <div className="glass rounded-lg p-1 flex items-center gap-1">
            {['#f5f0eb', '#e8e0d4', '#dce8e4', '#e8dce8', '#1a1a2e'].map(c => (
              <button key={c} onClick={() => setWallColor(c)}
                className={cn('w-5 h-5 rounded-full border-2 transition-all', wallColor === c ? 'border-white scale-125' : 'border-transparent')}
                style={{ background: c }} />
            ))}
          </div>

          <button onClick={() => setShowStats(s => !s)}
            className="glass rounded-lg p-2.5 text-white/70 hover:text-white transition-colors">
            <Settings size={16} />
          </button>

          {isMultiplayer && (
            <button onClick={onToggleMute}
              className={cn('glass rounded-lg p-2.5 transition-colors', isMuted ? 'text-red-400' : 'text-white/70 hover:text-white')}>
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          )}

          {isMultiplayer && participants.length > 0 && (
            <div className="glass rounded-lg px-3 py-2 flex items-center gap-1.5 text-sm">
              <Users size={14} className="text-green-400" />
              <span>{participants.length + 1}</span>
            </div>
          )}
        </div>
      </div>

      {/* Otaq naviqasiyası */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        {roomData.rooms.map(room => (
          <button
            key={room.id}
            onClick={() => setActiveRoom(room.id === activeRoom ? null : room.id)}
            className={cn(
              'glass rounded-lg px-3 py-2 text-xs font-medium transition-all text-left flex items-center gap-2 max-w-[120px]',
              activeRoom === room.id ? 'border-brand-500 text-brand-300' : 'text-white/60 hover:text-white'
            )}
          >
            <ChevronRight size={12} />
            <span className="line-clamp-1">{room.name}</span>
          </button>
        ))}
      </div>

      {/* Mobil idarəetmə */}
      <div className="absolute bottom-6 left-6 md:hidden">
        <MobileJoystick onMove={() => {}} />
      </div>

      {/* İdarəetmə məlumatı */}
      <AnimatePresence>
        {showControls && locked && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 glass rounded-xl px-6 py-3 text-sm text-white/60"
          >
            WASD — Hərəkət &nbsp;|&nbsp; Siçan — Bax &nbsp;|&nbsp; Shift — Qaç &nbsp;|&nbsp; Esc — Dayan
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
