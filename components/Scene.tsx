import React, { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { BoxItem, Dimensions } from '../types';
import { BoxMesh } from './BoxMesh';
import * as THREE from 'three';

interface SceneProps {
  boxes: BoxItem[];
  container: Dimensions;
}

// Component to auto-adjust camera based on container size
const CameraController: React.FC<{ container: Dimensions }> = ({ container }) => {
  const { camera, controls } = useThree();
  
  useEffect(() => {
    const maxDim = Math.max(container.width, container.height, container.depth);
    // Position camera to see the whole container nicely
    camera.position.set(container.width * 1.2, container.height * 2, container.depth * 1.8);
    camera.lookAt(0, container.height / 2, 0);
    // @ts-ignore
    if (controls) controls.target.set(0, container.height / 2, 0);
  }, [container, camera, controls]);

  return null;
};

export const Scene: React.FC<SceneProps> = ({ boxes, container }) => {
  return (
    <div className="w-full h-full bg-slate-900 relative shadow-inner">
      {/* Instructions Overlay */}
      <div className="absolute bottom-6 left-6 text-slate-400 text-xs select-none pointer-events-none bg-slate-900/50 p-3 rounded-lg backdrop-blur-sm border border-slate-700">
        <p className="font-bold text-slate-300 mb-1">操作指南:</p>
        <p>• 左键拖拽: 旋转视角</p>
        <p>• 右键拖拽: 平移视角</p>
        <p>• 滚轮滑动: 缩放视角</p>
      </div>

      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault fov={45} near={1} far={5000} />
        <CameraController container={container} />
        
        <OrbitControls 
          makeDefault 
          minPolarAngle={0} 
          maxPolarAngle={Math.PI / 1.9} 
          dampingFactor={0.05}
        />

        {/* Lighting */}
        <ambientLight intensity={0.7} color="#ffffff" />
        <directionalLight 
          position={[500, 1000, 500]} 
          intensity={1.2} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.001}
        >
          <orthographicCamera attach="shadow-camera" args={[-1000, 1000, 1000, -1000, 1, 3000]} />
        </directionalLight>
        <hemisphereLight intensity={0.3} color="#ffffff" groundColor="#333333" />

        <group position={[0, 0, 0]}>
          {/* Center the container logic: 
              The logic assumes boxes start at (0,0,0).
              We shift the whole group so the container center is at (0, H/2, 0) in world space.
          */}
          <group position={[-container.width / 2, 0, -container.depth / 2]}>
            
            {/* The Container Structure */}
            <group position={[container.width / 2, container.height / 2, container.depth / 2]}>
              {/* Transparent glass-like walls */}
              <mesh>
                <boxGeometry args={[container.width, container.height, container.depth]} />
                <meshPhysicalMaterial 
                  color="#e2e8f0" 
                  transmission={0.1}
                  opacity={0.1} 
                  transparent
                  roughness={0.1}
                  metalness={0.1}
                  depthWrite={false}
                  side={THREE.DoubleSide}
                />
              </mesh>
              
              {/* Stronger Frame */}
              <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(container.width, container.height, container.depth)]} />
                <lineBasicMaterial color="#64748b" linewidth={2} />
              </lineSegments>

              {/* Floor visual */}
              <mesh position={[0, -container.height / 2 + 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                 <planeGeometry args={[container.width, container.depth]} />
                 <meshStandardMaterial color="#475569" roughness={0.8} />
              </mesh>
            </group>

            {/* The Boxes */}
            {boxes.map((box) => (
              box.placed && <BoxMesh key={box.id} data={box} />
            ))}

          </group>
        </group>

        {/* Ground */}
        <Grid 
          position={[0, -0.5, 0]} 
          args={[3000, 3000]} 
          cellSize={100} 
          sectionSize={500} 
          fadeDistance={2500} 
          sectionColor="#334155" 
          cellColor="#1e293b" 
        />
        <ContactShadows opacity={0.5} scale={50} blur={2} far={100} resolution={256} color="#000000" />
      </Canvas>
    </div>
  );
};