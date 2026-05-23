import React, { useRef, useState, Suspense, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useTexture, useVideoTexture } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

// --- SUB-COMPONENTE MATERIAL (Con Glitch y B&W) ---
const CustomShaderMaterial = ({ texture, hovered }) => {
  const materialRef = useRef();

  // Actualizamos el tiempo para el efecto glitch
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  const uniforms = useMemo(() => ({
    uTexture: { value: texture },
    uGrayscale: { value: 1.0 },
    uTime: { value: 0 },
    uHover: { value: 0 }
  }), [texture]);

  // Sincronizamos el hover con el shader
  useFrame(() => {
    materialRef.current.uniforms.uGrayscale.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uGrayscale.value,
      hovered ? 0.0 : 1.0,
      0.1
    );
    materialRef.current.uniforms.uHover.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uHover.value,
      hovered ? 1.0 : 0.0,
      0.1
    );
  });

  return (
    <shaderMaterial
      ref={materialRef}
      transparent
      uniforms={uniforms}
      vertexShader={`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
      fragmentShader={`
        uniform sampler2D uTexture;
        uniform float uGrayscale;
        uniform float uTime;
        uniform float uHover;
        varying vec2 vUv;

        // Función para generar ruido del glitch
        float rand(vec2 co) {
          return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          vec2 uv = vUv;
          
          // --- EFECTO GLITCH (Solo en hover) ---
          if (uHover > 0.1) {
            float glitchAmount = 0.04 * uHover;
            if (rand(vec2(uTime * 0.1, floor(uv.y * 10.0))) > 0.95) {
              uv.x += rand(vec2(uTime, uv.y)) * glitchAmount - (glitchAmount * 0.5);
            }
          }

          // Separación RGB (Chromatic Aberration) en hover
          float r = texture2D(uTexture, uv + vec2(uHover * 0.005, 0.0)).r;
          float g = texture2D(uTexture, uv).g;
          float b = texture2D(uTexture, uv - vec2(uHover * 0.005, 0.0)).b;
          vec3 color = vec3(r, g, b);

          // Convertir a blanco y negro
          float gray = dot(color, vec3(0.299, 0.587, 0.114));
          vec3 finalColor = mix(color, vec3(gray), uGrayscale);

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `}
    />
  );
};

const InteractiveCube = ({ position, texturePath, label, link, scale = 1, index }) => {
  const meshRef = useRef();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const isVideo = texturePath.endsWith('.mp4');

  const texture = isVideo 
    ? useVideoTexture(texturePath, { muted: true, loop: true, start: true }) 
    : useTexture(texturePath);

  const entryDelay = 0.2 + index * 0.2;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.007;
      meshRef.current.rotation.x += 0.004;
      meshRef.current.position.y = position[1] + Math.sin(t + position[0]) * 0.12;
    }
  });

  return (
    <group position={position}>
      <motion.mesh
        ref={meshRef}
        // ESTADO INICIAL (Oculto y pequeño)
        initial={{ scale: 0, opacity: 0 }}
        // ESTADO FINAL (Aparece después del delay)
        animate={{ 
          scale: hovered ? scale * 1.1 : scale,
          opacity: 1 
        }}
        transition={{ 
          delay: entryDelay,
          type: "spring", 
          stiffness: 100, 
          damping: 20,
          opacity: { duration: 1.5 } // Fundido lento
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => navigate(link)}
        className="clickable"
      >
        <boxGeometry args={[1.4, 1.4, 1.4]} />
        <Suspense fallback={<meshStandardMaterial color="#050505" />}>
          <CustomShaderMaterial texture={texture} hovered={hovered} />
        </Suspense>
      </motion.mesh>

      <Html
        position={[0, 0, 0]} 
        center
        distanceFactor={10}
        style={{ pointerEvents: 'none' }}
      >
        <div 
          className="cube-label-v2"
          style={{
            opacity: hovered ? 1 : 0,
            // Movimiento hacia arriba más corto y elegante
            transform: hovered ? 'translateY(-70px)' : 'translateY(-50px)',
            transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)'
          }}
        >
          <div className="green-dot" />
          <span>{label}</span>
        </div>
      </Html>
    </group>
  );
};

export default InteractiveCube;