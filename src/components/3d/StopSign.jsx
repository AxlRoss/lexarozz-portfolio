import React, { useRef, useState, useEffect } from 'react';
import { useTexture, Decal, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion as motion3d } from 'framer-motion-3d'; 
import { motion, AnimatePresence } from 'framer-motion'; 
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from '../../lib/firebase';


import '../../styles/home.scss';



// --- COMPONENTE VISUAL: TOOLTIP ---
const StickerInfoTooltip = ({ info }) => {
  if (!info) return null;

  let dateString = "--/--";
  if (info.createdAt) {
    const dateObj = info.createdAt.toDate ? info.createdAt.toDate() : new Date(info.createdAt);
    dateString = dateObj.toLocaleDateString('es-ES', { 
      day: '2-digit', month: '2-digit', 
      hour: '2-digit', minute: '2-digit' 
    }).replace(',', '');
  }

  return (
    <div className="sticker-tooltip-wrapper">
      <div className="green-dot-pulse" />
      <motion.div 
        className="sticker-info-card"
        initial={{ opacity: 0, y: 5 }} 
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        <span className="info-label">REGISTRADO:</span>
        <span className="info-date">{dateString}</span>
      </motion.div>
    </div>
  );
};

const StopSign = ({ selectedStickerId, onLockChange, pasteProgress, phase, setPhase, onStickerFixed, onDeselect }) => {
  const signMeshRef = useRef();
  
  // Estados Interactivos
  const [hoverPoint, setHoverPoint] = useState(null);
  const [anchorPoint, setAnchorPoint] = useState(null);
  const [rotationZ, setRotationZ] = useState(0);

  // Estados Data
  const [savedStickers, setSavedStickers] = useState([]);
  const [activeTooltipData, setActiveTooltipData] = useState(null);

  // 🔥 NUEVO: Referencia para el temporizador del tooltip (Anti-Flicker)
  const tooltipTimeoutRef = useRef(null);

  // --- OCLUSIÓN ---
  const isStickerOccluded = (targetIndex, targetPos) => {
    const OCCLUSION_THRESHOLD = 0.15; 
    for (let i = targetIndex + 1; i < savedStickers.length; i++) {
       const newerSticker = savedStickers[i];
       if (targetPos.distanceTo(newerSticker.position) < OCCLUSION_THRESHOLD) return true; 
    }
    return false;
  };

  // --- CARGA DE FIREBASE ---
  useEffect(() => {
    const fetchStickers = async () => {
      try {
        const q = query(collection(db, "visits"), orderBy("createdAt", "asc"), limit(60));
        const querySnapshot = await getDocs(q);
        const loaded = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          loaded.push({ 
            id: doc.id, 
            ...data,
            position: new THREE.Vector3(...data.position),
            rotation: new THREE.Euler(...data.rotation)
          });
        });
        setSavedStickers(loaded);
      } catch (error) {
        console.error("Error stickers:", error);
      }
    };
    fetchStickers();
  }, []);

  // --- 🔥 LOGICA DE REGRESAR (ESC) CORREGIDA ---
  // Extraemos la lógica a una función pura que no dependa de closures viejos
  const handleBack = () => {
    if (phase === 'pasting') {
      setPhase('rotating');
    } else if (phase === 'rotating') {
      setPhase('hover');
      setAnchorPoint(null);
      setRotationZ(0);
    } else if (phase === 'hover') {
      // Si tenemos sticker seleccionado, lo quitamos
      if (selectedStickerId) {
        if (onDeselect) onDeselect();
        setHoverPoint(null);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => { 
      if (e.key === 'Escape') handleBack(); 
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, onDeselect, selectedStickerId]);

  // Textos y Materiales
  const getInstructionText = () => {
    if (!selectedStickerId) return { title: "EXPLORAR", sub: "SELECCIONA UN STICKER DEL MENÚ" };

    if (phase === 'hover') return { title: "UBICACIÓN", sub: "CLIC PARA FIJAR POSICIÓN" };
    if (phase === 'rotating') return { title: "ROTACIÓN", sub: "MUEVE EL MOUSE PARA GIRAR • CLIC PARA CONFIRMAR" };
    if (phase === 'pasting') return { title: "PEGADO", sub: "DESLIZA EL SLIDER PARA PEGAR" };
    if (phase === 'completed') return { title: "LISTO", sub: "STICKER COLOCADO" };
    return { title: "", sub: "" };
  };
  const instruction = getInstructionText();

  const originalRoughness = useTexture("../../../../../public/fingerprints-rough.webp");
  const originalRoughness_rev = useTexture("../../../../../public/fingerprints-rough-rev.webp");

  // 1. MATERIAL DE METAL (Poste y borde) - Más metálico y rugoso
  const poleMaterial = new THREE.MeshStandardMaterial({ 
    color: '#2a2a2a', // Gris oscuro casi negro
    roughness: 0.1, 
    metalness: 0.9 
  });
  
  const borderMaterial = new THREE.MeshStandardMaterial({ 
    color: '#eeeeee', 
    roughness: 0.4, // Un poco brillante
    metalness: 0.7 
  });

  // 3. CREAMOS LA VERSIÓN PARA EL STOP (Patrón más denso/chiquito)
  const signTextureRoughness = React.useMemo(() => {
    const t = originalRoughness_rev.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    
    // Como el stop es grande, repetimos la textura más veces
    t.repeat.set(1, 1); 
    
    return t;
  }, [originalRoughness_rev]);

  const OriginalSignNormalMap = useTexture("stopsign-normal.png");

  const signNormalMap = React.useMemo(() => {
    const t = OriginalSignNormalMap.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    
    // Como el stop es grande, repetimos la textura más veces
    t.repeat.set(1, 1);
    
    return t;
  }, [OriginalSignNormalMap]);


  // 2. MATERIAL DEL STOP (Roja) - Rojo Físico
  // El rojo puro #ff0000 se ve falso. Usamos un rojo señalización.
  const signMaterial = new THREE.MeshStandardMaterial({ 
    color: '#c40202', // Rojo más profundo y realista
    normalMap:signNormalMap ,
    roughnessMap: signTextureRoughness,
    roughness: 0.3,
    metalness: 0.7,
  });

  const stickerBaseSize = 0.5; 
  const stickers = useTexture([
    '/stickers/s1.png', '/stickers/s2.png', '/stickers/s3.png', 
    '/stickers/s4.png', '/stickers/s5.png', '/stickers/s6.png', '/stickers/s7.png'
  ]);
  stickers.forEach(tex => { tex.colorSpace = THREE.SRGBColorSpace; tex.minFilter = THREE.LinearFilter; });


  // Eventos 3D
  const handlePointerMove = (e) => {
    e.stopPropagation();

    // Si hay tooltip activo, no movemos el fantasma para evitar conflictos
    if (activeTooltipData) {
      setHoverPoint(null); 
      return;
    }

    if (phase === 'hover') {
      const worldPoint = e.point.clone();
      if (signMeshRef.current) {
        const localPoint = signMeshRef.current.worldToLocal(worldPoint);
        setHoverPoint(localPoint);
      }
    } else if (phase === 'rotating') {
      setRotationZ(e.point.x * 2.5); 
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (activeTooltipData) return; 
    if (!selectedStickerId) return; // En modo exploración no hacemos nada al click

    if (phase === 'hover' && hoverPoint) {
      setAnchorPoint(hoverPoint);
      setPhase('rotating'); 
    } else if (phase === 'rotating') {
      setPhase('pasting'); 
    }
  };

  useEffect(() => {
    if (phase === 'completed' && anchorPoint && signMeshRef.current) {
        const localPos = anchorPoint.clone();
        const worldPos = signMeshRef.current.localToWorld(localPos.clone());
        const finalRotArray = [Math.PI / 2, 0, Math.PI + rotationZ];
        onStickerFixed(worldPos, finalRotArray, localPos);
    }
  }, [phase, anchorPoint, onStickerFixed, rotationZ]);

  let currentScale = stickerBaseSize;
  let currentOpacity = 1;
  if (phase === 'pasting') {
    currentScale = stickerBaseSize * (1 + (1 - pasteProgress) * 0.2);
    currentOpacity = 0.6 + (pasteProgress * 0.4);
  }
  const finalRotation = [Math.PI / 2, 0, Math.PI + rotationZ];

  const foilTexture = useTexture("/foil-normal.jpg");
  
  const [normalMap, roughnessMap] = useTexture([
  "/foil-normal.jpg",   // Tu normal map actual
  "/fingerprints-rough.webp" // Tu nuevo roughness map
]);



const stickerRoughness = React.useMemo(() => {
    const t = originalRoughness.clone(); 
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    
    // 🔥 AQUÍ EL TRUCO: Números pequeños = Textura GRANDE
    // Prueba con 1, 1 o incluso 0.5, 0.5 si la quieres enorme.
    t.repeat.set(0.2, 0.2); 
    
    return t;
  }, [originalRoughness]);

  // --- HELPER PARA MATERIAL HOLOGRÁFICO ---
  // Creamos un componente o props comunes para no repetir código
  const holographicProps = {
    transparent: true,
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    normalMap: foilTexture, // Esto crea las arrugas falsas
  normalScale: [0.01, 0.01],
  roughnessMap: stickerRoughness,
  roughness: 0.4,
    metalness: 0.6,       // Metálico
    iridescence: 1,       // Efecto arcoíris activado
    iridescenceIOR: 1.55,  // Índice de refracción
    iridescenceThicknessRange: [100, 600], // Rango de colores del arcoíris
  };

  return (
    <group dispose={null}>
      

      <Html fullscreen style={{ pointerEvents: 'none' }} zIndexRange={[100, 0]}>
        <div className="ui-overlay-container">
          {/* 🔥 BOTÓN ESC: Ahora visible también en HOVER, pero NO en Exploración (cuando no hay sticker) */}
          {selectedStickerId && phase !== 'completed' && (
             <div className="esc-button-wrapper" onClick={handleBack}><div className="esc-key">ESC</div><div className="esc-label">REGRESAR</div></div>
          )}
          
          {/* INSTRUCCIONES: Visibles siempre, incluso en exploración */}
          {phase !== 'completed' && (
            <div className="bottom-instructions">
              <motion.div key={selectedStickerId ? phase : 'explore'} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <h3>{instruction.title}</h3><p>{instruction.sub}</p>
              </motion.div>
            </div>
          )}
        </div>
      </Html>

      <motion3d.group
        initial={{ y: -10, rotateY: Math.PI * 4, scale: 0 }}
        animate={{ y: 0, rotateY: 0, scale: 1 }}
        transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
      >
        <mesh position={[0, -3, 0]} material={poleMaterial}><cylinderGeometry args={[0.1, 0.1, 6, 32]} /></mesh>
        

        <group position={[0, 0.5, 0.15]}>
         <mesh position={[0,0,-0.01]} material={borderMaterial} rotation={[Math.PI / 2, 0, Math.PI / 8]}><cylinderGeometry args={[1.55, 1.55, 0.1, 8]} /></mesh>
          <mesh 
            ref={signMeshRef}
            material={signMaterial} 
            rotation={[Math.PI / 2, 0, Math.PI / 8]}
            onPointerMove={handlePointerMove}
            onPointerOut={() => { setHoverPoint(null); setActiveTooltipData(null); }}
            onClick={handleClick}
          >
            <cylinderGeometry args={[1.5, 1.5, 0.1, 8]} />

            {savedStickers.map((sticker, index) => (
              <Decal 
                key={sticker.id}
                position={sticker.position}
                rotation={sticker.rotation}
                scale={[-stickerBaseSize, stickerBaseSize, stickerBaseSize]} 
                renderOrder={index + 1}
                onPointerOver={(e) => {
                   e.stopPropagation();
                   if (tooltipTimeoutRef.current) { clearTimeout(tooltipTimeoutRef.current); tooltipTimeoutRef.current = null; }
                   if (!selectedStickerId && !isStickerOccluded(index, sticker.position)) { setActiveTooltipData(sticker); }
                }}
                onPointerOut={(e) => {
                   tooltipTimeoutRef.current = setTimeout(() => { setActiveTooltipData(null); }, 55500); 
                }}
              >
                {/* 🔥 CAMBIO: Usamos meshPhysicalMaterial para iridiscencia */}
                <meshPhysicalMaterial 
                  map={stickers[sticker.stickerId - 1]} 
                  opacity={1} 
                  polygonOffsetFactor={-10 - (index * 10)} 
                  {...holographicProps} // Aplicamos efecto holográfico
                />
              </Decal>
            ))}

            <AnimatePresence>
              {activeTooltipData && (
                <Html position={activeTooltipData.position} zIndexRange={[1000, 0]} style={{ pointerEvents: 'none', width: '0', height: '0' }}>
                  <StickerInfoTooltip info={activeTooltipData} />
                </Html>
              )}
            </AnimatePresence>

            {/* STICKER ACTUAL (Solo si hay selectedStickerId) */}
            {selectedStickerId && (
              <>
                {phase === 'hover' && hoverPoint && (
                   <Decal 
                     position={hoverPoint} 
                     rotation={[Math.PI / 2, 0, Math.PI]} 
                     scale={[-stickerBaseSize, stickerBaseSize, stickerBaseSize]} 
                     renderOrder={980}
                   >
                     <meshPhysicalMaterial 
                        map={stickers[selectedStickerId - 1]} 
                        {...holographicProps} // <--- AQUI LA MAGIA
                        color="#ffffff"       // Base blanca importante
                        opacity={0.6}         // Sobrescribimos la opacidad del holograma para que sea fantasma
                        polygonOffsetFactor={-2000} 
                     />
                   </Decal>
                )}

                {phase === 'rotating' && anchorPoint && (
                   <Decal 
                     position={anchorPoint} 
                     rotation={[Math.PI / 2, 0, Math.PI + rotationZ]} 
                     scale={[-stickerBaseSize, stickerBaseSize, stickerBaseSize]} 
                     renderOrder={1000}
                   >
                     <meshPhysicalMaterial 
                        map={stickers[selectedStickerId - 1]} 
                        {...holographicProps} // <--- AQUI LA MAGIA
                        color="#ffffff"
                        opacity={1} 
                        polygonOffsetFactor={-2000} 
                     />
                   </Decal>
                )}

                {(phase === 'pasting' || phase === 'completed') && anchorPoint && (
                   <Decal 
                     position={anchorPoint} 
                     rotation={finalRotation} 
                     scale={[-currentScale, currentScale, currentScale]} 
                     renderOrder={1001}
                   >
                     <meshPhysicalMaterial 
                        map={stickers[selectedStickerId - 1]} 
                        {...holographicProps} // <--- AQUI LA MAGIA
                        color="#ffffff"
                        opacity={currentOpacity} // Usamos la opacidad de la animación
                        polygonOffsetFactor={-2000} 
                     />
                   </Decal>
                )}
              </>
            )}
          </mesh>
           
        </group>
      </motion3d.group>
    </group>
  );
};

export default StopSign;