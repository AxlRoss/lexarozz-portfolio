import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/Work.scss';

// 🔥 NUESTRA BASE DE DATOS LOCAL
const DIRECTORIES = [
  { 
    id: "video", 
    title: "VIDEO", 
    link: "/video", 
    videoUrl: "/mockups/Video.mp4", 
    meta: "[01] // MOTION & EDIT" 
  },
  { 
    id: "design", 
    title: "DESIGN", 
    link: "/design", 
    videoUrl: "/mockups/video1.mp4", 
    meta: "[02] // UI & BRANDING" 
  },
  { 
    id: "animation", 
    // 🔥 Control total: Rompemos la palabra EXACTAMENTE donde nosotros queremos
    title: "3D &\nVFX", 
    link: "/animation", 
    videoUrl: "/mockups/Animation.mp4", 
    meta: "[03] // CGI & VFX" 
  }
];

const Work = () => {
  const navigate = useNavigate();

  // Aseguramos que la Navbar global siempre esté visible en esta pantalla
  useEffect(() => {
    const globalNavbar = document.querySelector('nav') || document.querySelector('.navbar');
    if (globalNavbar) {
      globalNavbar.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      globalNavbar.style.opacity = '1'; 
      globalNavbar.style.pointerEvents = 'auto';
    }
  }, []);

  return (
    <motion.div 
      className="work-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      // Eliminamos el onScroll porque ya no hay footer
    >
      <div className="animated-gradient" />

      {/* ==========================================
          🔥 SECCIÓN ÚNICA: EL ACORDEÓN BRUTALISTA
      ========================================== */}
      <section className="snap-section work-hero-section">
        
        <div className="accordion-container">
          {DIRECTORIES.map((dir) => (
            <div 
              key={dir.id} 
              className="accordion-panel"
              onClick={() => navigate(dir.link)}
            >
              {/* VIDEO DE FONDO */}
              <div className="panel-bg-wrapper">
                <video 
                  src={dir.videoUrl} 
                  autoPlay loop muted playsInline 
                  className="panel-video"
                />
              </div>

              <div className="dither-mask"></div>
              <div className="vignette-mask"></div>

              {/* CONTENIDO UI */}
              <div className="panel-content">
                <div className="panel-meta">{dir.meta}</div>
                
                {/* 🔥 Hacemos split al \n para que React respete el salto de línea */}
                <h1 className="panel-title">
                  {dir.title.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}<br/>
                    </React.Fragment>
                  ))}
                </h1>
                
                <div className="panel-action">
                  <span>[ EXPLORE_DIRECTORY ]</span>
                  <div className="arrow">→</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>

    </motion.div>
  );
};

export default Work;