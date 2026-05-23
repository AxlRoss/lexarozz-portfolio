import React, { useRef, useState, useEffect, useMemo } from 'react';
// 🔥 1. Recuperamos Html
import { useTexture, Decal, Html, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber'; 
import * as THREE from 'three';
import { motion as motion3d } from 'framer-motion-3d'; 
// 🔥 2. Recuperamos motion
import { motion, AnimatePresence } from 'framer-motion'; 
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from '../../lib/firebase';
import '../../styles/Experience.scss'; // 🔥 Cambiado!

const StickerInfoTooltip = ({ info }) => {
  if (!info) return null;
  let dateString = "--/--";
  if (info.createdAt) {
    const dateObj = info.createdAt.toDate ? info.createdAt.toDate() : new Date(info.createdAt);
    dateString = dateObj.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit', // Añade el año (ej. 26)
      hour: '2-digit', 
      minute: '2-digit' 
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
        <span className="info-label">REGISTRADO:</span><span className="info-date">{dateString}</span>
      </motion.div>
    </div>
  );
};

const HardDrive = ({ 
  selectedStickerId, 
  pasteProgress, 
  phase, 
  setPhase, 
  onStickerFixed, 
  onDeselect, 
  setCameraFocusPoint 
}) => {
  const { nodes } = useGLTF('/models/hard_drive.glb');

  const { mainMesh, decorativeMeshes } = useMemo(() => {
    const allMeshes = Object.values(nodes).filter(n => n.type === 'Mesh');
    let main = allMeshes.find(m => m.material && m.material.name.toLowerCase().includes('aluminum'));
    if (!main) main = allMeshes[0];
    const others = allMeshes.filter(m => m !== main);
    return { mainMesh: main, decorativeMeshes: others };
  }, [nodes]);

  if (!mainMesh) return null;

  const surfaceRef = useRef();
  const groupRef = useRef(); 
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Estados
  const [hoverPoint, setHoverPoint] = useState(null);
  const [anchorPoint, setAnchorPoint] = useState(null);
  const [hoverRotation, setHoverRotation] = useState(new THREE.Euler());
  const [anchorRotation, setAnchorRotation] = useState(new THREE.Euler());
  const [userRotationZ, setUserRotationZ] = useState(0);
  
  const [savedStickers, setSavedStickers] = useState([]);
  const [activeTooltipData, setActiveTooltipData] = useState(null);
  const tooltipTimeoutRef = useRef(null);

  const DECAL_DEPTH = 0.6; 

  // --- ANIMACIÓN DISCO ---
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      
      // Bobbing vertical
      groupRef.current.position.y = Math.sin(t / 1.5) * 0.1; 
      
      // Rotación automática lenta
      if (phase !== 'pasting') {
         // 🔥 CAMBIO 1: Sumamos Math.PI para que oscile mirando hacia el frente (180 grados)
         // Antes era: Math.sin(t / 4) * 0.1;
         groupRef.current.rotation.y = Math.PI + Math.sin(t / 4) * 0.1; 
      }

      // Parallax Sutil (Atenuado por distancia)
      const dist = state.camera.position.length();
      let parallaxIntensity = THREE.MathUtils.clamp((dist - 2.5) / 2.5, 0.1, 1.0);
      
      if (phase === 'rotating' || phase === 'pasting') {
          parallaxIntensity *= 0.2;
      }

      const targetRotationX = (state.pointer.y * 0.1 * parallaxIntensity) + (-Math.PI / 6);
      const targetRotationZ = (-state.pointer.x * 0.1 * parallaxIntensity);

      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.1);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotationZ, 0.1);
    }
  });

  const isStickerOccluded = (targetIndex, targetPos) => {
    const OCCLUSION_THRESHOLD = 0.2; 
    for (let i = targetIndex + 1; i < savedStickers.length; i++) {
       if (targetPos.distanceTo(savedStickers[i].position) < OCCLUSION_THRESHOLD) return true; 
    }
    return false;
  };

  useEffect(() => {
    const fetchStickers = async () => {
      try {
        const q = query(collection(db, "visits"), orderBy("createdAt", "asc"), limit(60));
        const querySnapshot = await getDocs(q);
        const loaded = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          loaded.push({ 
            id: doc.id, ...data,
            position: new THREE.Vector3(...data.position),
            rotation: new THREE.Euler(...data.rotation) 
          });
        });
        setSavedStickers(loaded);
      } catch (error) { console.error("Error stickers:", error); }
    };
    fetchStickers();
  }, []);

  // Eventos globales
  useEffect(() => {
    if (phase === 'rotating') {
      const handleGlobalMouseMove = (e) => {
        setUserRotationZ(prev => prev + e.movementX * 0.01);
      };
      
      const handleGlobalClick = (e) => {
        setPhase('pasting');
      };

      window.addEventListener('mousemove', handleGlobalMouseMove);
      const clickTimer = setTimeout(() => {
          window.addEventListener('pointerdown', handleGlobalClick);
      }, 100);
      
      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('pointerdown', handleGlobalClick);
        clearTimeout(clickTimer);
      };
    }
  }, [phase, setPhase]);

  const handleBack = () => {
    if (phase === 'pasting') { 
        setPhase('rotating'); 
    } else if (phase === 'rotating') { 
        setPhase('hover'); 
        setAnchorPoint(null); 
        setUserRotationZ(0); 
        if (setCameraFocusPoint) setCameraFocusPoint(new THREE.Vector3(0,0,0));
    } else if (phase === 'hover') {
      if (selectedStickerId) { 
          if (onDeselect) onDeselect(); 
          setHoverPoint(null); 
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') handleBack(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, onDeselect, selectedStickerId]);

  // --- TEXTURAS ---
  const stickerBaseSize = 0.46; 
  const stickers = useTexture([
    '/stickers/s1.png', '/stickers/s2.png', '/stickers/s3.png', 
    '/stickers/s4.png', '/stickers/s5.png', '/stickers/s6.png', '/stickers/s7.png'
  ]);
  
  stickers.forEach(tex => { tex.colorSpace = THREE.SRGBColorSpace; });

  const getStickerScale = (id, baseSize) => {
    const tex = stickers[id - 1];
    if (!tex || !tex.image) return [baseSize, baseSize, DECAL_DEPTH]; 
    const width = tex.image.naturalWidth || tex.image.width || 1;
    const height = tex.image.naturalHeight || tex.image.height || 1;
    const aspect = width / height;
    return [baseSize * aspect, baseSize, DECAL_DEPTH];
  };

  const foilTexture = useTexture("/foil-normal.jpg");
  const originalRoughness = useTexture("/fingerprints-rough.webp");
  
  const stickerRoughness = useMemo(() => {
    const t = originalRoughness.clone(); 
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(0.5, 0.5); 
    return t;
  }, [originalRoughness]);

  const holographicProps = {
    transparent: true, depthTest: true, depthWrite: false, polygonOffset: true,
    normalMap: foilTexture, normalScale: [0.05, 0.05],
    roughnessMap: stickerRoughness, roughness: 0.4, metalness: 0.6,
    iridescence: 1, iridescenceIOR: 1.6, iridescenceThicknessRange: [100, 400],
  };

  const handlePointerMove = (e) => {
    e.stopPropagation();
    
    if (phase === 'hover') {
      const point = e.point.clone();
      if (surfaceRef.current && e.face) {
        const localPoint = surfaceRef.current.worldToLocal(point.clone());
        const localNormal = e.face.normal.clone();
        setHoverPoint(localPoint);

        dummy.position.copy(new THREE.Vector3(0,0,0));
        dummy.lookAt(localNormal);
        dummy.rotation.z += 0; 
        setHoverRotation(dummy.rotation.clone());
      }
    }
  };

  const handleClick = (e) => {
    if (e.delta > 2) return; 
    e.stopPropagation();
    if (!selectedStickerId) return; 

    if (phase === 'hover' && hoverPoint) {
      setAnchorPoint(hoverPoint);
      setAnchorRotation(hoverRotation); 
      setPhase('rotating'); 
      
      if (surfaceRef.current && setCameraFocusPoint) {
          const worldFocus = surfaceRef.current.localToWorld(hoverPoint.clone());
          setCameraFocusPoint(worldFocus);
      }
    } 
  };

  useEffect(() => {
    if (phase === 'completed' && anchorPoint && surfaceRef.current) {
        const finalEuler = anchorRotation.clone();
        finalEuler.z += userRotationZ; 
        const finalRotArray = [finalEuler.x, finalEuler.y, finalEuler.z];
        const worldPos = surfaceRef.current.localToWorld(anchorPoint.clone());
        onStickerFixed(worldPos, finalRotArray, anchorPoint);
    }
  }, [phase, anchorPoint, onStickerFixed, userRotationZ, anchorRotation]);

  const currentStickerScaleVector = useMemo(() => {
      if (!selectedStickerId) return [stickerBaseSize, stickerBaseSize, DECAL_DEPTH];
      return getStickerScale(selectedStickerId, stickerBaseSize);
  }, [selectedStickerId, stickerBaseSize, stickers]);

  let animatedScale = [...currentStickerScaleVector];
  let currentOpacity = 1;
  
  if (phase === 'pasting') {
    const growFactor = 1 + (1 - pasteProgress) * 0.2;
    animatedScale[0] *= growFactor; 
    animatedScale[1] *= growFactor;
    currentOpacity = 0.6 + (pasteProgress * 0.4);
  }

  const dynamicPreviewRotation = anchorRotation.clone();
  if (phase === 'rotating' || phase === 'pasting' || phase === 'completed') {
      dynamicPreviewRotation.z += userRotationZ;
  }

  return (
    <group dispose={null}>
      <motion3d.group
        ref={groupRef} 
        initial={{ y: -10, rotateY: Math.PI * 4, scale: 0 }}
        animate={{ y: 0, rotateY: Math.PI, scale: 1 }}
        transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1], delay: 3.0 }}
        
        // 🔥 CAMBIO 1: ROTACIÓN (Tilt)
        // -Math.PI / 6: "Acuesta" el disco hacia atrás (parte de arriba lejos de la cámara).
        // Math.PI: Muestra el frente del disco.
        // 0: Sin rotación lateral extra.
        rotation={[-Math.PI / 6, Math.PI, 0]} 
      >
        
        {/* ... (Resto del código idéntico: decorativeMeshes, mesh principal, stickers...) */}
        
        {decorativeMeshes.map((mesh, i) => (
            <mesh key={i} geometry={mesh.geometry} material={mesh.material} scale={[1, 1, 1]} />
        ))}

        <mesh 
            ref={surfaceRef}
            geometry={mainMesh.geometry} 
            material={mainMesh.material}
            onPointerMove={handlePointerMove}
            onPointerOut={() => { setHoverPoint(null); }}
            onClick={handleClick}
            scale={[1, 1, 1]} 
        >
            {/* ... (Decals y lógica interna se mantienen igual) ... */}
            
            {savedStickers.map((sticker, index) => {
              const savedScale = getStickerScale(sticker.stickerId, stickerBaseSize);
              return (
                <Decal 
                  key={sticker.id}
                  position={sticker.position}
                  rotation={sticker.rotation}
                  scale={savedScale} 
                  renderOrder={index + 1}
                  onPointerOver={(e) => {
                    e.stopPropagation();
                    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
                    if (!selectedStickerId && !isStickerOccluded(index, sticker.position)) setActiveTooltipData(sticker);
                  }}
                  onPointerOut={(e) => {
                    tooltipTimeoutRef.current = setTimeout(() => { setActiveTooltipData(null); }, 500); 
                  }}
                >
                  <meshPhysicalMaterial 
                    map={stickers[sticker.stickerId - 1]} 
                    opacity={1} 
                    polygonOffsetFactor={-10 - (index * 2)} 
                    {...holographicProps}
                  />
                </Decal>
              );
            })}

            <AnimatePresence>
              {activeTooltipData && (
                <Html position={activeTooltipData.position} zIndexRange={[1000, 0]} style={{ pointerEvents: 'none', width: '0', height: '0' }}>
                  <StickerInfoTooltip info={activeTooltipData} />
                </Html>
              )}
            </AnimatePresence>

            {selectedStickerId && (
              <>
                {phase === 'hover' && hoverPoint && (
                   <Decal 
                     position={hoverPoint} 
                     rotation={hoverRotation} 
                     scale={currentStickerScaleVector} 
                     renderOrder={980}
                   >
                     <meshPhysicalMaterial 
                        map={stickers[selectedStickerId - 1]} 
                        {...holographicProps}
                        color="#ffffff"
                        opacity={0.6}
                        polygonOffsetFactor={-2000} 
                     />
                   </Decal>
                )}

                {(phase === 'rotating' || phase === 'pasting' || phase === 'completed') && anchorPoint && (
                   <Decal 
                     position={anchorPoint} 
                     rotation={dynamicPreviewRotation} 
                     scale={animatedScale} 
                     renderOrder={1001}
                   >
                     <meshPhysicalMaterial 
                        map={stickers[selectedStickerId - 1]} 
                        {...holographicProps}
                        color="#ffffff"
                        opacity={currentOpacity}
                        polygonOffsetFactor={-2000} 
                     />
                   </Decal>
                )}
              </>
            )}
        </mesh>
      </motion3d.group>
    </group>
  );
};

useGLTF.preload('/models/hard_drive.glb');

export default HardDrive;