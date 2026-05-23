import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/Animation.scss';
import BrutalistFooter from '../components/ui/BrutalistFooter';

// 🔥 1. IMPORTAMOS SANITY
import { client, urlFor } from '../sanity';

// 🔥 IMPORTAMOS TU BASE DE DATOS CENTRAL
import { ANIMATION_DATA } from '../data/portfolioData';

const Animation = () => {
  const navigate = useNavigate();
  const [activeProject, setActiveProject] = useState(ANIMATION_DATA.heroProjects[0]);

  // 🔥 2. ESTADO PARA LOS PROYECTOS DE ARCHIVO (Inicia con la data local)
  const [archiveList, setArchiveList] = useState(ANIMATION_DATA.archiveProjects);

  // ==========================================
  // 🔥 LÓGICA DE OCULTAR/MOSTRAR NAVBAR GLOBAL
  // ==========================================
  useEffect(() => {
    const globalNavbar = document.querySelector('nav') || document.querySelector('.navbar');
    
    if (globalNavbar) {
      globalNavbar.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      globalNavbar.style.opacity = '0';
      globalNavbar.style.pointerEvents = 'none'; 
    }

    return () => {
      if (globalNavbar) {
        globalNavbar.style.opacity = '1';
        globalNavbar.style.pointerEvents = 'auto';
      }
    };
  }, []);

  // ==========================================
  // 🔥 FETCH A SANITY (MAGIA HÍBRIDA)
  // ==========================================
  useEffect(() => {
    // 1. Extraemos los slugs de tu portfolioData para saber qué buscar en Sanity
    const slugsArray = ANIMATION_DATA.archiveProjects.map(p => `"${p.slug}"`);
    const slugsString = slugsArray.join(',');

    if (slugsString) {
      // 2. Le preguntamos a Sanity solo por esos proyectos específicos
      const query = `*[slug.current in [${slugsString}]]{
        title,
        "slug": slug.current,
        mainImage,
        year,
        tags
      }`;

      client.fetch(query).then((sanityData) => {
        // 3. Mezclamos tus datos locales con los reales de Sanity
        const updatedArchive = ANIMATION_DATA.archiveProjects.map(localProj => {
          const sanityMatch = sanityData.find(s => s.slug === localProj.slug);

          if (sanityMatch) {
            return {
              ...localProj,
              // Si Sanity tiene título, lo usamos; si no, dejamos el local
              title: sanityMatch.title || localProj.title,
              // Si Sanity tiene foto, usamos urlFor; si no, dejamos el de unsplash
              imgUrl: sanityMatch.mainImage ? urlFor(sanityMatch.mainImage).width(800).url() : localProj.imgUrl,
              // Opcional: Actualizamos año y categoría desde Sanity
              year: sanityMatch.year || localProj.year,
              category: (sanityMatch.tags && sanityMatch.tags.length > 0) ? sanityMatch.tags[0] : localProj.category
            };
          }
          return localProj;
        });

        // 4. Actualizamos el estado con los datos reales
        setArchiveList(updatedArchive);
      }).catch(err => console.error("Error conectando con Sanity:", err));
    }
  }, []);

  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const windowHeight = window.innerHeight;
    const globalNavbar = document.querySelector('nav') || document.querySelector('.navbar');

    if (globalNavbar) {
      if (scrollTop > windowHeight * 0.3) {
        globalNavbar.style.opacity = '1';
        globalNavbar.style.pointerEvents = 'auto';
      } else {
        globalNavbar.style.opacity = '0';
        globalNavbar.style.pointerEvents = 'none';
      }
    }
  };

  return (
    <div className="animation-page-container" onScroll={handleScroll}>
      
      {/* ==========================================
          SECCIÓN 1: HERO (VIDEO FULLSCREEN MAGNÉTICO)
      ========================================== */}
      <section className="snap-section hero-section">
        
        <div className="video-background-wrapper">
          <AnimatePresence mode="wait">
            <motion.video
              key={activeProject._id}
              src={activeProject.videoUrl}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              autoPlay loop muted playsInline
              className="fullscreen-video"
            />
          </AnimatePresence>
        </div>

        <div className="video-overlay-dither"></div>
        <div className="video-overlay-vignette"></div>

        <div className="ui-layer">
          <header className="animation-header">
            <button className="back-btn" onClick={() => navigate('/work')}>[ ← VOLVER ]</button>
            <div className="directory-label">/ DIR: ANIMATION_</div>
          </header>

          <div className="projects-list-container">
            <ul className="projects-list">
              {ANIMATION_DATA.heroProjects.map((project, index) => (
                <li 
                  key={project._id}
                  className={`project-item ${activeProject._id === project._id ? 'active' : ''}`}
                  onMouseEnter={() => setActiveProject(project)}
                  onClick={() => navigate(`/project/${project.slug}`)}
                >
                  <span className="project-index">0{index + 1}</span>
                  <h1 className="project-title">{project.title}</h1>
                </li>
              ))}
            </ul>
          </div>

          <div className="project-details-terminal">
            <p>{`> ROL: ${activeProject.role}`}</p>
            <p>{`> AÑO: ${activeProject.year}`}</p>
            <p className="blinking-cursor">_CLICK_TO_ENTER</p> 
          </div>
          
          <div className="scroll-indicator">
            <span>SCROLL_DOWN</span>
            <div className="arrow">↓</div>
          </div>
        </div>
      </section>

      {/* ==========================================
          SECCIÓN 2: ARCHIVO (GRID BRUTALISTA)
      ========================================== */}
      <section className="snap-section archive-section">
        <div className="archive-header">
          <h2>OTHER WORK</h2>
          <p>REGISTROS SECUNDARIOS DE ANIMACIÓN Y RENDER</p>
        </div>

        <div className="brutalist-grid">
          {/* 🔥 USAMOS EL NUEVO ESTADO CON DATA DE SANITY */}
          {archiveList.map((proj) => (
            <div 
              key={proj._id} 
              className="grid-item"
              onClick={() => navigate(`/project/${proj.slug}`)}
            >
              <div className="grid-image-wrapper">
                <img src={proj.imgUrl} alt={proj.title} />
                <div className="dither-mask"></div>
              </div>
              <div className="grid-info">
                <h3>{proj.title}</h3>
                <span className="grid-meta">[{proj.category} // {proj.year}]</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================
          SECCIÓN 3: FOOTER GLOBAL
      ========================================== */}
      <BrutalistFooter />

    </div>
  );
};

export default Animation;