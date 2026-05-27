import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/Animation.scss';
import BrutalistFooter from '../components/ui/BrutalistFooter';
import { client, urlFor } from '../sanity';
import { ANIMATION_DATA } from '../data/portfolioData';

const Animation = () => {
  const navigate = useNavigate();
  // El Hero sigue usando la data manual porque ahí están tus videos masivos
  const [activeProject, setActiveProject] = useState(ANIMATION_DATA.heroProjects[0]);

  // 🔥 FIX: Iniciamos la lista vacía para que Sanity la llene aleatoriamente
  const [archiveList, setArchiveList] = useState([]);

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
  // 🔥 FETCH A SANITY (MAGIA ALEATORIA: 3D, CFX, UE5)
  // ==========================================
  useEffect(() => {
    // 🔥 FIX: Consulta GROQ que cruza las referencias buscando exclusivamente los tags correctos
    const query = `*[_type == "project" && defined(slug.current) && (
      count((tags[]->title)[@ match "3D ANIMATION" || @ match "CFX" || @ match "UE5"]) > 0
    )]{
      _id,
      title,
      "slug": slug.current,
      mainImage,
      year,
      "tags": tags[]->title 
    }`;

    client.fetch(query).then((sanityData) => {
      if (sanityData.length > 0) {
        // Barajamos aleatoriamente todos los proyectos de animación encontrados
        const shuffledData = [...sanityData].sort(() => 0.5 - Math.random());
        // Tomamos los primeros 6 para no saturar la página
        const top6Projects = shuffledData.slice(0, 6);

        // Mapeamos los datos a la estructura que requiere nuestro frontend
        const formattedList = top6Projects.map(proj => ({
          _id: proj._id,
          title: proj.title,
          slug: proj.slug,
          imgUrl: proj.mainImage ? urlFor(proj.mainImage).width(800).url() : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
          year: proj.year || "N/A",
          category: (proj.tags && proj.tags.length > 0) ? proj.tags[0] : "ANIMATION"
        }));

        setArchiveList(formattedList);
      }
    }).catch(err => console.error("Error conectando con Sanity:", err));
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
          {/* 🔥 FIX: Mensaje de "Buscando Registros" mientras Sanity responde */}
          {archiveList.length === 0 ? (
            <p style={{ fontFamily: 'monospace', color: '#00ff88', gridColumn: '1 / -1', textAlign: 'center' }}>
              _BUSCANDO REGISTROS...
            </p>
          ) : (
            archiveList.map((proj) => (
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
            ))
          )}
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