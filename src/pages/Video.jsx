import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/Video.scss';
import BrutalistFooter from '../components/ui/BrutalistFooter';
import { client, urlFor } from '../sanity';
import { VIDEO_DATA } from '../data/portfolioData';

// Array de subtítulos rotativos
const SUBTITLES = [
  "2D ANIMATION", "MOTION GRAPHICS", "VIDEO EDIT", 
  "AI VIDEO", "TRANSCODEC", "COLOR CORRECTION", "SFX"
];

const Video = () => {
  const navigate = useNavigate();
  
  const [subIndex, setSubIndex] = useState(0);
  const [selectedList, setSelectedList] = useState([]);

  // 1. LÓGICA DE ROTACIÓN DEL SUBTÍTULO
  useEffect(() => {
    const interval = setInterval(() => {
      setSubIndex((prev) => (prev + 1) % SUBTITLES.length);
    }, 1200); 
    return () => clearInterval(interval);
  }, []);

  // 2. LÓGICA DE OCULTAR NAVBAR GLOBAL
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

  // 3. FETCH A SANITY (MAGIA ALEATORIA Y AUTOMATIZADA - CORREGIDO PARA RELATIONAL DATA)
  useEffect(() => {
    // 🔥 FIX: Como ahora los tags son referencias, usamos la sintaxis de "match" cruzando la referencia.
    // Buscamos proyectos donde ALGUNO de sus tags referenciados tenga de título "Motion Graphics" o "2D ANIMATION"
    const query = `*[_type == "project" && defined(slug.current) && (
      count((tags[]->title)[@ match "Motion Graphics" || @ match "2D ANIMATION"]) > 0
    )]{
      _id,
      title,
      "slug": slug.current,
      mainImage,
      year,
      "tags": tags[]->title // Extraemos el texto del tag referenciado
    }`;

    client.fetch(query).then((sanityData) => {
      
      if (sanityData.length > 0) {
        const shuffledData = [...sanityData].sort(() => 0.5 - Math.random());
        const top6Projects = shuffledData.slice(0, 6);

        const formattedList = top6Projects.map(proj => ({
          _id: proj._id,
          title: proj.title,
          slug: proj.slug,
          imgUrl: proj.mainImage ? urlFor(proj.mainImage).width(800).url() : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
          year: proj.year || "N/A",
          category: (proj.tags && proj.tags.length > 0) ? proj.tags[0] : "VIDEO"
        }));

        setSelectedList(formattedList);
      }
    }).catch(err => console.error("Error conectando con Sanity:", err));
  }, []);

  // 4. CONTROL DE SCROLL PARA LA NAVBAR
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
    <div className="video-page-container" onScroll={handleScroll}>
      
      <section className="snap-section hero-section">
        <div className="video-background-wrapper">
          <video
            src={VIDEO_DATA.heroVideoUrl}
            autoPlay loop muted playsInline
            className="fullscreen-video"
          />
        </div>
        <div className="video-overlay-dither"></div>
        <div className="video-overlay-vignette"></div>

        <div className="ui-layer">
          <header className="page-header">
            <button className="back-btn" onClick={() => navigate('/work')}>[ ← VOLVER ]</button>
            <div className="directory-label">/ DIR: VIDEO_</div>
          </header>

          <div className="splash-center-content">
            <h1 className="milanesa-splash-text">VIDEO</h1>
            
            <div className="rotating-subtitle-container">
              <span className="static-bracket">[ </span>
              <div className="subtitle-mask">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={subIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="dynamic-subtitle"
                  >
                    {SUBTITLES[subIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="static-bracket"> ]</span>
            </div>
          </div>
          
          <div className="scroll-indicator">
            <span>SCROLL_DOWN</span>
            <div className="arrow">↓</div>
          </div>
        </div>
      </section>

      <section className="snap-section brands-section">
        <div className="archive-header brands-header">
          <h2>[ TRUSTED_BY ]</h2>
          <p>MARCAS Y ESTUDIOS CON LOS QUE HE TRABAJADO</p>
        </div>

        <div className="marquee-wrapper">
          <div className="marquee-track">
            {[...VIDEO_DATA.brands, ...VIDEO_DATA.brands].map((brand, i) => (
              <div key={`${brand.id}-${i}`} className="brand-item">
                <img src={brand.logoUrl} alt={brand.name} className="brand-logo" />
                <div className="brand-name">{brand.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="snap-section archive-section">
        <div className="archive-header">
          <h2>SELECTED WORK</h2>
          <p>PROYECTOS DESTACADOS // MOTION & VIDEO</p>
        </div>

        <div className="brutalist-grid">
          {selectedList.length === 0 ? (
            <p style={{ fontFamily: 'monospace', color: '#00ff88', gridColumn: '1 / -1', textAlign: 'center' }}>
              _BUSCANDO REGISTROS...
            </p>
          ) : (
            selectedList.map((proj) => (
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

      <BrutalistFooter />

    </div>
  );
};

export default Video;