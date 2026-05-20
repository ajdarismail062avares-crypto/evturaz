'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TourRoom } from '@/types';

interface RoomGeometryProps {
  room: TourRoom;
  wallColor: string;
  isActive: boolean;
  onClick: () => void;
}

export function RoomGeometry({ room, wallColor, isActive, onClick }: RoomGeometryProps) {
  const groupRef = useRef<THREE.Group>(null);

  const { width, depth, height } = useMemo(() => ({
    width: room.bounds.max.x - room.bounds.min.x,
    depth: room.bounds.max.z - room.bounds.min.z,
    height: room.height || 2.8,
  }), [room]);

  const cx = (room.bounds.min.x + room.bounds.max.x) / 2;
  const cz = (room.bounds.min.z + room.bounds.max.z) / 2;

  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: wallColor,
    roughness: 0.85,
    metalness: 0.0,
    side: THREE.FrontSide,
  }), [wallColor]);

  const floorMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#c8b89a',
    roughness: 0.9,
    metalness: 0.0,
  }), []);

  const ceilMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#f8f4f0',
    roughness: 0.95,
    metalness: 0.0,
  }), []);

  // Highlight active room
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.traverse(c => {
        if ((c as THREE.Mesh).isMesh) {
          const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (m.color && isActive) m.emissiveIntensity = 0.05;
          else if (m.emissiveIntensity) m.emissiveIntensity = 0;
        }
      });
    }
  });

  return (
    <group ref={groupRef} position={[cx, 0, cz]} onClick={onClick}>
      {/* Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} material={floorMat}>
        <planeGeometry args={[width, depth]} />
      </mesh>

      {/* Ceiling */}
      <mesh receiveShadow rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]} material={ceilMat}>
        <planeGeometry args={[width, depth]} />
      </mesh>

      {/* North wall */}
      <mesh castShadow receiveShadow position={[0, height / 2, -depth / 2]} material={wallMat}>
        <boxGeometry args={[width, height, 0.15]} />
      </mesh>

      {/* South wall */}
      <mesh castShadow receiveShadow position={[0, height / 2, depth / 2]} material={wallMat}>
        <boxGeometry args={[width, height, 0.15]} />
      </mesh>

      {/* West wall */}
      <mesh castShadow receiveShadow position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]} material={wallMat}>
        <boxGeometry args={[depth, height, 0.15]} />
      </mesh>

      {/* East wall */}
      <mesh castShadow receiveShadow position={[width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]} material={wallMat}>
        <boxGeometry args={[depth, height, 0.15]} />
      </mesh>

      {/* Room label */}
      <group position={[0, height - 0.1, 0]}>
        {/* Label rendered via overlay instead of 3D text for performance */}
      </group>

      {/* Baseboard trim */}
      <mesh position={[0, 0.05, -depth / 2 + 0.08]} material={new THREE.MeshStandardMaterial({ color: '#e0d0bc' })}>
        <boxGeometry args={[width, 0.1, 0.03]} />
      </mesh>
      <mesh position={[0, 0.05, depth / 2 - 0.08]} material={new THREE.MeshStandardMaterial({ color: '#e0d0bc' })}>
        <boxGeometry args={[width, 0.1, 0.03]} />
      </mesh>

      {/* Point light inside room */}
      <pointLight position={[0, height * 0.85, 0]} intensity={0.8} distance={Math.max(width, depth) * 1.5} color="#fff8e7" castShadow />

      {/* Furniture items */}
      {room.furniture?.map(item => (
        <FurnitureMesh key={item.id} item={item} />
      ))}
    </group>
  );
}

function FurnitureMesh({ item }: { item: any }) {
  const geometry = useMemo(() => {
    switch (item.type) {
      case 'sofa':    return new THREE.BoxGeometry(2.2, 0.9, 0.9);
      case 'bed':     return new THREE.BoxGeometry(1.8, 0.5, 2.2);
      case 'table':   return new THREE.BoxGeometry(1.2, 0.75, 0.8);
      case 'chair':   return new THREE.BoxGeometry(0.6, 0.8, 0.6);
      case 'wardrobe':return new THREE.BoxGeometry(1.5, 2.2, 0.6);
      case 'bathtub': return new THREE.BoxGeometry(1.6, 0.6, 0.8);
      default:        return new THREE.BoxGeometry(1, 1, 1);
    }
  }, [item.type]);

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: item.color || '#8b7355',
    roughness: 0.7,
    metalness: item.type === 'bathtub' ? 0.3 : 0.05,
  }), [item.color, item.type]);

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[item.position.x, item.position.y, item.position.z]}
      rotation={[0, item.rotation || 0, 0]}
      scale={[item.scale?.x ?? 1, item.scale?.y ?? 1, item.scale?.z ?? 1]}
      castShadow
      receiveShadow
    />
  );
}
