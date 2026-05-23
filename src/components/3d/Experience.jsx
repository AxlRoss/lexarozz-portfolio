import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import HardDrive from './HardDrive'; 

const CameraController = ({ targetPosition, isLocked }) => {
  const controlsRef = useRef();
  const vec = new THREE.Vector3();

  useFrame((state, delta) => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    // --- FASE 1: BLOQUEADA (ROTANDO/PEGANDO) ---
    if (isLocked) {
      controls.target.lerp(targetPosition, 5 * delta);
      controls.update();
      return;
    }

    // --- FASE 2: EXPLORACIÓN ---
    // Si nos alejamos mucho, regresamos el centro
    const distance = state.camera.position.distanceTo(controls.target);
    const ZOOM_THRESHOLD = 4.5; 

    if (distance > ZOOM_THRESHOLD) {
        vec.set(0, 0, 0);
        controls.target.lerp(vec, 5 * delta);
        controls.update();
    }
  });

  return (
    <OrbitControls 
      ref={controlsRef}
      makeDefault 
      enableDamping={true} 
      dampingFactor={0.05} 
      minDistance={2.0} 
      maxDistance={10}  
      enablePan={false}
      enableZoom={true} 
      enableRotate={!isLocked}
      zoomToCursor={!isLocked} 
      
      // 🔥 CAMBIO 2: LÍMITES POLARES (ESTABILIDAD)
      // Esto evita que la cámara pase exactamente por encima (0) o por debajo (PI)
      // del objeto, lo que causa el "flip" o inversión violenta de ejes.
      // Dejamos un margen pequeñito (0.1 radianes aprox 5 grados).
      minPolarAngle={0.1} 
      maxPolarAngle={Math.PI - 0.1}
    />
  );
};

const Experience = ({ selectedStickerId, stickerPhase, setStickerPhase, pasteProgress, onStickerFixed, onDeselect }) => {

  const [cameraFocusPoint, setCameraFocusPoint] = useState(new THREE.Vector3(0, 0, 0));
  const isCameraLocked = stickerPhase === 'rotating' || stickerPhase === 'pasting';

  return (
    <Canvas
      shadows
      dpr={[1, 2]} 
      camera={{ position: [0, 0, 5], fov: 55 }} 
      style={{ height: '100vh', width: '100vw', background: 'transparent' }}
    >
      <ambientLight intensity={1.5} color="#ffffff" />
      
      {/* 🔥 CAMBIO 2: ILUMINACIÓN FRONTAL */}
      <spotLight 
        // X=0 (Centro), Y=10 (Arriba), Z=10 (Frente a la cámara)
        position={[0, 10, 10]} 
        angle={0.5} 
        penumbra={1} 
        intensity={3} // Subimos intensidad para que brille bonito
        castShadow 
      />
      
      {/* Luz de relleno desde abajo para que no se vea negro por debajo */}
      <pointLight position={[0, -10, 5]} intensity={1} color="#eefeff" />

      <Environment preset="city" blur={0.8} />

      <CameraController 
        targetPosition={cameraFocusPoint} 
        isLocked={isCameraLocked}
      />

      <HardDrive 
        selectedStickerId={selectedStickerId} 
        phase={stickerPhase}
        setPhase={setStickerPhase}
        pasteProgress={pasteProgress}
        onStickerFixed={onStickerFixed}
        onDeselect={onDeselect}
        setCameraFocusPoint={setCameraFocusPoint}
      />

      <ContactShadows position={[0, -1.5, 0]} opacity={0.6} scale={10} blur={2} far={4} />
    </Canvas>
  );
};

export default Experience;