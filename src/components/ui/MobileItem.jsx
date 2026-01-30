import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MobileItem = ({ project }) => {
  const ref = useRef(null);
  const navigate = useNavigate();
  
  // Detecta cuando el 60% del elemento está en el centro de la pantalla
  const isInView = useInView(ref, { amount: 0.6 });

  return (
    <section ref={ref} className="mobile-section" onClick={() => navigate(project.link)}>
      <div className={`video-container-mobile ${isInView ? 'in-focus' : ''}`}>
        <video 
          src={project.video} 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="mobile-video"
        />
        
        {/* Tooltip reutilizando tus clases de desktop */}
        <motion.div 
          className="cube-label-v2 mobile-label"
          initial={{ opacity: 0, y: 0, x: "-50%", scale: 2 }} // 🔥 X fija el centrado desde el inicio
          animate={{ 
            opacity: isInView ? 1 : 0, 
            y: isInView ? -30 : -100, // Un movimiento un poco más amplio
            x: "-50%" // 🔥 Mantenemos el centrado durante la animación
          }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="green-dot" />
          <span>{project.label}</span>
        </motion.div>
      </div>
    </section>
  );
};

export default MobileItem;