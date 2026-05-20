'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { TourParticipant } from '@/types';

const COLORS = ['#4a80ff', '#ff6b6b', '#51cf66', '#ffd43b', '#cc5de8'];

interface OtherPlayerProps {
  participant: TourParticipant;
}

export function OtherPlayer({ participant }: OtherPlayerProps) {
  const ref = useRef<THREE.Group>(null);
  const target = useRef(new THREE.Vector3(...Object.values(participant.position) as [number, number, number]));

  const color = COLORS[participant.userId.charCodeAt(0) % COLORS.length];

  useFrame(() => {
    if (!ref.current) return;
    target.current.set(participant.position.x, participant.position.y, participant.position.z);
    ref.current.position.lerp(target.current, 0.15);
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, participant.rotation.y, 0.2);
  });

  return (
    <group ref={ref} position={[participant.position.x, participant.position.y, participant.position.z]}>
      {/* Body capsule */}
      <mesh castShadow position={[0, 0, 0]}>
        <capsuleGeometry args={[0.3, 1.2, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Name tag */}
      <Html position={[0, 1.4, 0]} center distanceFactor={8} zIndexRange={[10, 0]}>
        <div className="bg-black/70 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap border border-white/20 backdrop-blur-sm">
          {participant.name}
          {participant.isMuted && ' 🔇'}
        </div>
      </Html>
    </group>
  );
}
