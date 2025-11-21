import React, { useState } from 'react';
import { BoxItem } from '../types';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface BoxMeshProps {
  data: BoxItem;
}

export const BoxMesh: React.FC<BoxMeshProps> = ({ data }) => {
  const [hovered, setHovered] = useState(false);

  if (!data.position) return null;

  // Three.js BoxGeometry is centered. 
  // data.position is bottom-left-front corner.
  // We need to shift by half dimensions.
  const [x, y, z] = data.position;
  const centerX = x + data.width / 2;
  const centerY = y + data.height / 2;
  const centerZ = z + data.depth / 2;

  return (
    <group position={[centerX, centerY, centerZ]}>
      {/* Main Box */}
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[data.width, data.height, data.depth]} />
        <meshStandardMaterial 
          color={data.color} 
          roughness={0.3}
          metalness={0.1}
          transparent={data.placed ? false : true}
          opacity={data.placed ? 1 : 0.5}
        />
        
        {/* Edges for better definition */}
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(data.width, data.height, data.depth)]} />
          <lineBasicMaterial color="black" opacity={0.2} transparent />
        </lineSegments>
      </mesh>

      {/* Warning Label for "No Top Stack" */}
      {data.cantStackTop && (
        <mesh position={[0, data.height / 2 + 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[Math.min(data.width, data.depth) * 0.8, Math.min(data.width, data.depth) * 0.8]} />
          <meshBasicMaterial color="red" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Tooltip */}
      {hovered && (
        <Html distanceFactor={200}>
          <div className="bg-slate-800/95 text-white text-xs p-3 rounded-lg whitespace-nowrap pointer-events-none select-none backdrop-blur-md shadow-2xl border border-slate-600 z-50 min-w-[120px]">
            <p className="font-bold text-blue-300 mb-2 border-b border-slate-600 pb-1">货物 ID: {data.id.slice(0, 8)}</p>
            <div className="space-y-1 text-slate-300">
               <div className="flex justify-between gap-4">
                 <span>尺寸:</span>
                 <span className="font-mono">{data.width}×{data.depth}×{data.height}</span>
               </div>
               <div className="flex justify-between gap-4">
                 <span>重量:</span>
                 <span className="font-mono text-white">{data.weight} kg</span>
               </div>
            </div>
            {data.cantStackTop && (
              <div className="mt-2 pt-2 border-t border-slate-600 flex items-center text-red-400 font-bold">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                顶部禁放 (易碎)
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};