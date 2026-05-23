import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import HardDrive from './HardDrive'; 

const CameraController = ({ targetPosition, isLocked, hoverPointRef }) => {
  const controlsRef = useRef();
  
  // Vector temporal para no crear basura en memoria cada frame
  const vec = new THREE.Vector3();

  useFrame((state, delta) => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    // --- CASO 1: FASE BLOQUEADA (ROTANDO/PEGANDO) ---
    // La cámara obedece ciegamente al punto de anclaje
    if (isLocked) {
      controls.target.lerp(targetPosition, 5 * delta);
      controls.update();
      return;
    }

    // --- CASO 2: FASE EXPLORACIÓN (ZOOM INTELIGENTE) ---
    // Distancia actual de la cámara al objetivo actual
    const distance = state.camera.position.distanceTo(controls.target);
    
    // UMBRAL DE ZOOM: ¿Qué tan cerca consideramos "Zoom In"?
    // El disco está en 0,0,0. La cámara empieza en z=5.
    // Digamos que si estás a menos de 4 unidades, ya estás "viendo detalles".
    const ZOOM_THRESHOLD = 4.5; 

    if (distance < ZOOM_THRESHOLD) {
        // ZONA DE DETALLE:
        // Si el mouse está sobre el mesh (tenemos un punto válido), vamos hacia allá.
        // Si no (mouse en el vacío), nos quedamos donde estábamos (o vamos al último punto válido).
        if (hoverPointRef.current) {
            // Lerp suave hacia el punto del mouse
            controls.target.lerp(hoverPointRef.current, 5 * delta);
        }
    } else {
        // ZONA GENERAL (ZOOM OUT):
        // Si nos alejamos, regresamos suavemente al centro absoluto (0,0,0)
        vec.set(0, 0, 0);
        controls.target.lerp(vec, 5 * delta);
    }
    
    controls.update();
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
      
      // 🔥 CLAVE: Desactivamos zoomToCursor nativo para controlarlo nosotros
      zoomToCursor={false} 
    />
  );
};

const Experience = ({ selectedStickerId, stickerPhase, setStickerPhase, pasteProgress, onStickerFixed, onDeselect }) => {

  const [cameraFocusPoint, setCameraFocusPoint] = useState(new THREE.Vector3(0, 0, 0));
  
  // Ref para guardar la última posición conocida del mouse sobre el mesh
  const hoverPointRef = useRef(null);

  // Función para actualizar la ref desde HardDrive
  const handleHoverPointUpdate = (point) => {
      hoverPointRef.current = point;
  };

  const isCameraLocked = stickerPhase === 'rotating' || stickerPhase === 'pasting';

  return (
    <Canvas
      shadows
      dpr={[1, 2]} 
      camera={{ position: [0, 0, 5], fov: 45 }} 
      style={{ height: '100vh', width: '100vw', background: 'transparent' }}
    >
      <ambientLight intensity={1.5} color="#ffffff" />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#eefeff" />

      <Environment preset="city" blur={0.8} />

      <CameraController 
        targetPosition={cameraFocusPoint} 
        isLocked={isCameraLocked}
        hoverPointRef={hoverPointRef} // Pasamos la ref para leerla
      />

      <HardDrive 
        selectedStickerId={selectedStickerId} 
        phase={stickerPhase}
        setPhase={setStickerPhase}
        pasteProgress={pasteProgress}
        onStickerFixed={onStickerFixed}
        onDeselect={onDeselect}
        setCameraFocusPoint={setCameraFocusPoint}
        setHoverPointWorld={handleHoverPointUpdate} // Pasamos la función para escribirla
      />

      <ContactShadows position={[0, -1.5, 0]} opacity={0.6} scale={10} blur={2} far={4} />
    </Canvas>
  );
};

export default Experience;