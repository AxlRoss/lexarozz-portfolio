import React, { useState, useRef } from 'react';
import MobileItem from '../components/ui/MobileItem';
import { motion, AnimatePresence } from 'framer-motion';

const MobileWork = () => {
  const containerRef = useRef(null);
  const [scrollPos, setScrollPos] = useState('top'); // 'top', 'middle', 'bottom'

  // 🔥 AQUÍ REORGANIZAMOS LA LISTA MÓVIL
  const projects = [
    { id: 1, label: "VIDEO", link: "/video", video: "/mockups/video1.mp4" },
    { id: 2, label: "DESIGN", link: "/design", video: "/mockups/video1.mp4" },
    { id: 3, label: "3D ANIMATION", link: "/animation", video: "/mockups/video1.mp4" }
  ];

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    
    // Margen de error pequeño para el cálculo
    const isAtTop = scrollTop < 50;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;

    if (isAtTop) setScrollPos('top');
    else if (isAtBottom) setScrollPos('bottom');
    else setScrollPos('middle');
  };

  return (
    <div className="mobile-work-wrapper" ref={containerRef} onScroll={handleScroll}>
      {projects.map((project) => (
        <MobileItem key={project.id} project={project} />
      ))}

      {/* --- INDICADORES DE SCROLL INTELIGENTES --- */}
      <AnimatePresence>
        {/* Flecha ARRIBA: Aparece si no estamos en el tope */}
        {(scrollPos === 'middle' || scrollPos === 'bottom') && (
          <motion.div 
            key="hint-scroll-up"
            className="scroll-hint up"
            initial={{ opacity: 0, y: 70, x: "-50%"}}
            animate={{ opacity: 1, y: 70, x: "-50%" }}
            exit={{ opacity: 0, y: 70, x: "-50%" }}
          >
            <div className="arrow-icon">↑</div>
            <span>SUBIR</span>
          </motion.div>
        )}

        {/* Flecha ABAJO: Aparece si no estamos al final */}
        {(scrollPos === 'top' || scrollPos === 'middle') && (
          <motion.div 
          key="hint-scroll-down"
            className="scroll-hint down"
            initial={{ opacity: 0, y: -10, x: "-50%" }}
            animate={{ opacity: 1, y: -10, x: "-50%" }}
            exit={{ opacity: 0, y: -10, x: "-50%" }}
          >
            <span>DESLIZAR</span>
            <div className="arrow-icon">↓</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileWork;