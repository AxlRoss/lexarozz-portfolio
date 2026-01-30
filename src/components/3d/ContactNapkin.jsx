import React, { useRef, useLayoutEffect, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber'; // 👈 Agregamos useThree
import { useGLTF, Float, Html } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';

const ContactNapkin = ({ onOpenForm }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const hoverTimer = useRef(null);
  const morphMeshes = useRef([]); 
  const prevMouse = useRef({ x: 0, y: 0 });

  // 🔥 DETECCIÓN DE PANTALLA
  const { viewport } = useThree();
  // Si el ancho es menor a 3 unidades de Three.js, es un móvil
  const isMobile = viewport.width < 3; 

  // Ajustamos la escala: 3.5 en PC, 2.2 en Móvil
  const responsiveScale = isMobile ? 2.2 : 3.5;
  // Ajustamos el tamaño del tooltip para que no se vea gigante o diminuto
  const tooltipDistance = isMobile ? 4 : 3;

  const { scene } = useGLTF('/models/servilleta_shapekeys.glb');

  const sharedUniforms = useMemo(() => ({
    uTime: { value: 0 }
  }), []);

  useEffect(() => {
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, []);

  useLayoutEffect(() => {
    morphMeshes.current = [];
    scene.traverse((object) => {
      if (object.isMesh && object.material) {
        if (object.morphTargetDictionary) morphMeshes.current.push(object);
        object.material.transparent = false;
        object.material.side = THREE.DoubleSide;
        object.material.castShadow = true;
        object.material.receiveShadow = true;
        
        const maps = [object.material.map, object.material.normalMap, object.material.roughnessMap];
        maps.forEach((texture) => {
          if (texture) {
            texture.flipY = false; 
            texture.offset.set(0, 0); 
            texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.needsUpdate = true;
          }
        });

        object.material.onBeforeCompile = (shader) => {
          shader.uniforms.uTime = sharedUniforms.uTime;
          shader.vertexShader = shader.vertexShader.replace('#include <common>', `#include <common>\nuniform float uTime;`);
          shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
            #include <begin_vertex>
            float speed = 3.0;
            float frequency = 25.0;
            float amplitude = 0.002; 
            float wave = sin(position.x * frequency + uTime * speed) * amplitude + cos(position.y * frequency * 0.5 + uTime * speed) * (amplitude * 0.5);
            transformed.z += wave;
          `);
        };
        object.material.needsUpdate = true;
      }
    });
  }, [scene, sharedUniforms]);

  useFrame((state) => {
    if (meshRef.current) {
      // Reducimos la sensibilidad de rotación en móvil para que no gire loco al hacer scroll
      const sensitivity = isMobile ? 1 : 2;
      
      const targetRotationY = state.mouse.x * sensitivity; 
      const targetRotationX = -state.mouse.y * 0.7;
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotationY, 0.05);
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotationX, 0.05);
    }
    sharedUniforms.uTime.value = state.clock.getElapsedTime();

    let velocityX = state.mouse.x - prevMouse.current.x;
    let velocityY = state.mouse.y - prevMouse.current.y;
    const MAX_VELOCITY = 0.5; 
    if (Math.abs(velocityX) > MAX_VELOCITY) velocityX = 0;
    if (Math.abs(velocityY) > MAX_VELOCITY) velocityY = 0;
    prevMouse.current.x = state.mouse.x;
    prevMouse.current.y = state.mouse.y;

    morphMeshes.current.forEach((mesh) => {
      const leftIndex = mesh.morphTargetDictionary['Bend_Left'];
      const rightIndex = mesh.morphTargetDictionary['Bend_Right'];
      const upIndex = mesh.morphTargetDictionary['Bend_Down'];     
      const downIndex = mesh.morphTargetDictionary['Bend_Up']; 
      if (leftIndex === undefined || rightIndex === undefined) return;
      const dragStrength = 25.0; 
      mesh.morphTargetInfluences[rightIndex] = THREE.MathUtils.lerp(mesh.morphTargetInfluences[rightIndex], Math.max(0, velocityX * dragStrength), 0.1);
      mesh.morphTargetInfluences[leftIndex] = THREE.MathUtils.lerp(mesh.morphTargetInfluences[leftIndex], Math.max(0, -velocityX * dragStrength), 0.1);
      mesh.morphTargetInfluences[upIndex] = THREE.MathUtils.lerp(mesh.morphTargetInfluences[upIndex], Math.max(0, velocityY * dragStrength - 1), 0.1);
      mesh.morphTargetInfluences[downIndex] = THREE.MathUtils.lerp(mesh.morphTargetInfluences[downIndex], Math.max(0, -velocityY * dragStrength - 1), 0.1);
    });
  });

  const handlePointerEnter = (e) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer'; 
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    
    hoverTimer.current = setTimeout(() => {
      setHovered(true);
    }, 200); 
  };

  const handlePointerLeave = () => {
    document.body.style.cursor = 'auto'; 
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    
    hoverTimer.current = setTimeout(() => {
      setHovered(false);
    }, 10);
  };

  return (
    <motion.group
      initial={{ scale: 0, rotateY: Math.PI * 2, rotateX: 1 }}
      animate={{ scale: 1, rotateY: 0, rotateX: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <Float speed={5.5} rotationIntensity={0.4} floatIntensity={0.2} >
        <group ref={meshRef}>
          {/* 🔥 USAMOS LA ESCALA RESPONSIVA */}
          <primitive object={scene} scale={responsiveScale} />

          <mesh 
            position={[0.02, -0.3, 0.06]} 
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onClick={(e) => { e.stopPropagation(); onOpenForm(); }}
          >
            {/* Ajustamos un poco el área de clic en base a la escala si es necesario, pero suele servir igual */}
            <planeGeometry args={[0.7, 0.5]} /> 
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>

          <Html
            position={[-0.27, -0.4, 0.1]} 
            center
            distanceFactor={tooltipDistance} // 🔥 Distancia adaptada
            style={{
              pointerEvents: 'none',
              transition: 'opacity 0.4s ease-out, transform 0.2s ease-out',
              opacity: hovered ? 1 : 0,
              transform: `scale(${hovered ? 1 : 0.85})`
            }}
          >
            <div className="napkin-tooltip">
              <div className="green-dot" />
              <span>Mandar correo</span>
            </div>
          </Html>
        </group>
      </Float>
    </motion.group>
  );
};

useGLTF.preload('/models/servilleta_shapekeys.glb');
export default ContactNapkin;