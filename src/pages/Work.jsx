import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import PortfolioScene from '../components/3d/PortfolioScene'; 
import MobileWork from './MobileWork';
import '../styles/Work.scss';
import BrutalistFooter from '../components/ui/BrutalistFooter';

const Work = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
      {/* Fondo de degradado (ahora se quedará fijo en el fondo) */}
      <div className="animated-gradient" />

      {/* ==========================================
          🔥 SECCIÓN 1: HERO (CUBOS 3D / MOBILE)
      ========================================== */}
      <section className="snap-section work-hero-section">
        
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

        {/* --- MODO MÓVIL --- */}
        {isMobile && <MobileWork />}

      </section>

      {/* ==========================================
          🔥 SECCIÓN 2: FOOTER GLOBAL MAGNÉTICO
      ========================================== */}
      <BrutalistFooter />

    </motion.div>
  );
};

export default Work;