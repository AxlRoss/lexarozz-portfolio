import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import StopSign from './StopSign';

const Rig = ({ locked, zoomTarget }) => {
  const targetPos = new THREE.Vector3();

  useFrame((state) => {
    // 1. Calculamos el parallax del mouse (state.pointer va de -1 a 1)
    // Reducimos la fuerza del movimiento cuando hay zoom (para que no sea mareante)
    const factor = zoomTarget ? 0.6 : 3.0;
    const mX = state.pointer.x * factor;
    const mY = state.pointer.y * factor;

    // PRIORIDAD 1: ZOOM AL STICKER (Fase Completed)
    if (zoomTarget) {
      // Sumamos el movimiento del mouse (mX, mY) a la posición del sticker
      targetPos.set(
        zoomTarget.x + mX, 
        zoomTarget.y + mY, 
        zoomTarget.z + 2.2 // Un poco más cerca
      );
      state.camera.position.lerp(targetPos, 0.05);
      state.camera.lookAt(zoomTarget.x, zoomTarget.y, zoomTarget.z);
    } 
    // PRIORIDAD 2: BLOQUEO DE ROTACIÓN
    else if (locked) {
      targetPos.set(0, 0, 6);
      state.camera.position.lerp(targetPos, 0.05);
      state.camera.lookAt(0, 0, 0);
    } 
    // PRIORIDAD 3: PARALLAX NORMAL (Hover y Pasting)
    else {
      targetPos.set(mX, mY, 6);
      state.camera.position.lerp(targetPos, 0.05);
      state.camera.lookAt(0, 0, 0);
    }
  });
  return null;
};

const Experience = ({ selectedStickerId, stickerPhase, setStickerPhase, pasteProgress, onStickerFixed, zoomTarget, onDeselect }) => {

  // --- CORRECCIÓN AQUÍ ---
  // Solo bloqueamos el movimiento de la cámara estrictamente durante la rotación.
  // En 'hover' y 'pasting', isLocked será false, permitiendo el parallax.
  const isLocked = stickerPhase === 'rotating';

  return (
    <Canvas
      shadows
      dpr={[1, 2]} // Para que se vea nítido en pantallas retina
      camera={{ position: [0, 0, 6], fov: 45 }}
      style={{ height: '100vh', width: '100vw', background: 'transparent' }}
    >
      <ambientLight intensity={6.4} color="#ffffff" />
      <spotLight 
        position={[-5, 0, 2]} 
        angle={0.4} 
        color="#f8f0ff"
        penumbra={0.5} 
        intensity={0.5} 
        castShadow 
        shadow-bias={-0.0001}
      />
      {/* 3. LUZ DE RELLENO AZULADA (Toque artístico) */}
      <pointLight position={[-5, 0, 5]} intensity={5.5} color="#ffecfb" />

      {/* 4. ENTORNO HDR (Warehouse da reflejos metálicos muy buenos) */}
      <Environment preset="studio" blur={0.7} />

      <Rig locked={isLocked} zoomTarget={zoomTarget} />

      <StopSign 
        selectedStickerId={selectedStickerId} 
        phase={stickerPhase}
        setPhase={setStickerPhase}
        pasteProgress={pasteProgress}
        onLockChange={() => {}} 
        onStickerFixed={onStickerFixed}
        onDeselect={onDeselect}
      />

      <ContactShadows position={[0, -3.5, 0]} opacity={1} scale={15} blur={2} far={4.5} color="#000000" />
    </Canvas>
  );
};

export default Experience;