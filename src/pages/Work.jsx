import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import PortfolioScene from '../components/3d/PortfolioScene'; // Lo crearemos en el siguiente paso
import '../styles/Work.scss';
import MobileWork from './MobileWork';


const Work = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Listener para cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.div 
      className="work-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      {/* Fondo de degradado */}
      <div className="animated-gradient" />

      {/* --- MODO ESCRITORIO (3D) --- */}
      {!isMobile && (
        <div className="canvas-container">
          <Canvas camera={{ position: [0, 0, 8], fov: 35 }} dpr={[1, 2]}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <PortfolioScene />
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* --- MODO MÓVIL (SCROLL SNAP) --- */}
      {isMobile && <MobileWork />}
      
    </motion.div>
  );
};

export default Work;