import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';

const ContactPaper = ({ onSuccess }) => {
  const groupRef = useRef();
  const [formStatus, setFormStatus] = useState('idle');

  // Parallax suave con el mouse
  useFrame((state) => {
    if (groupRef.current) {
      // Movimiento muy sutil para no marear
      const x = (state.mouse.x * 0.2);
      const y = (state.mouse.y * 0.2);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, x, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -y, 0.05);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');
    setTimeout(() => {
      onSuccess();
    }, 1000);
  };

  return (
    <motion.group
      ref={groupRef}
      // --- ANIMACIÓN DE ENTRADA TIPO RULETA/FLOTANTE ---
      initial={{ 
        y: 5,           // Empieza arriba
        z: -5,          // Empieza al fondo
        rotateX: 2,     // Rotación inicial loca
        rotateZ: 1, 
        scale: 0        // Empieza invisible
      }} 
      animate={{ 
        y: 0, 
        z: 0, 
        rotateX: 0, 
        rotateZ: 0, 
        scale: 1 
      }}
      exit={{ 
        y: -10,         // Se va hacia abajo al enviar
        rotateX: -1,
        transition: { duration: 0.8, ease: "easeIn" }
      }}
      transition={{ 
        duration: 2, 
        ease: [0.16, 1, 0.3, 1],
        scale: { duration: 1.2 }
      }}
    >
      {/* REDUCCIÓN DE ESCALA: 
          Reducimos el plano a 3x4 aprox para que no ocupe toda la pantalla 
      */}
      <mesh castShadow>
        <planeGeometry args={[3.2, 4.5]} />
        <meshStandardMaterial 
          color="#ffffff" 
          roughness={0.1} 
          metalness={0.1}
          side={THREE.DoubleSide} // Para que se vea por detrás si gira mucho
        />
      </mesh>

      {/* AJUSTE HTML:
          Bajamos el distanceFactor para que el contenido se ajuste al plano pequeño
      */}
      <Html
        transform
        distanceFactor={4} // Antes era 10, bajarlo lo hace "más pequeño" en el mundo 3D
        position={[0, 0, 0.02]}
        occlude // Esto permite que si algo pasa frente a la hoja, la oculte
      >
        <div className="paper-form-wrapper">
          <div className="form-header">
            <div className="green-dot" />
            <h2>CONTACTO</h2>
          </div>
          
          <p className="email-hint">contacto@lexarozz.com</p>
          
          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label>Identidad (Email)</label>
              <input type="email" required placeholder="tu@correo.com" />
            </div>

            <div className="field-group">
              <label>Mensaje</label>
              <textarea required placeholder="¿En qué puedo ayudarte?" />
            </div>

            <button type="submit" className="send-btn" disabled={formStatus === 'sending'}>
              {formStatus === 'sending' ? 'TRANSMITIENDO...' : 'ENVIAR DATOS'}
            </button>
          </form>
        </div>
      </Html>
    </motion.group>
  );
};

export default ContactPaper;