import React, { useState, useEffect } from 'react';
import { client, urlFor } from '../sanity';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import InteractiveHero from '../components/ui/InteractiveHero';
import BrutalistFooter from '../components/ui/BrutalistFooter';
import '../styles/Design.scss';

// 🔥 IMPORTAMOS TU BASE DE DATOS LOCAL PARA LAS MARCAS
import { VIDEO_DATA } from '../data/portfolioData'; 

const Design = () => {
  const navigate = useNavigate();
  const [selectedList, setSelectedList] = useState([]);
  const [heroScrollProgress, setHeroScrollProgress] = useState(0);

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
  // 🔥 FETCH A SANITY (MAGIA ALEATORIA: DESIGN & SOCIAL MEDIA)
  // ==========================================
  useEffect(() => {
    const query = `*[_type == "project" && defined(slug.current) && ("Design" in tags || "Social Media" in tags)]{
      _id,
      title,
      "slug": slug.current,
      mainImage,
      year,
      tags
    }`;

    client.fetch(query).then((sanityData) => {
      if (sanityData.length > 0) {
        // Barajamos aleatoriamente
        const shuffledData = [...sanityData].sort(() => 0.5 - Math.random());
        // Tomamos máximo 6
        const top6Projects = shuffledData.slice(0, 6);

        const formattedList = top6Projects.map(proj => ({
          _id: proj._id,
          title: proj.title,
          slug: proj.slug,
          imgUrl: proj.mainImage ? urlFor(proj.mainImage).width(800).url() : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
          year: proj.year || "N/A",
          category: (proj.tags && proj.tags.length > 0) ? proj.tags[0] : "DESIGN"
        }));

        setSelectedList(formattedList);
      }
    }).catch(err => console.error("Error conectando con Sanity:", err));
  }, []);

  // ==========================================
  // 🔥 CONTROL DE SCROLL (PARA CANVAS Y NAVBAR)
  // ==========================================
  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const viewportHeight = window.innerHeight;
    
    // 1. Control del Canvas interactivo (Opacidad)
    let progress = scrollTop / viewportHeight;
    if (progress > 1) progress = 1;
    if (progress < 0) progress = 0;
    setHeroScrollProgress(progress);

    // 2. Control de la Navbar Global
    const globalNavbar = document.querySelector('nav') || document.querySelector('.navbar');
    if (globalNavbar) {
      if (scrollTop > viewportHeight * 0.3) {
        globalNavbar.style.opacity = '1';
        globalNavbar.style.pointerEvents = 'auto';
      } else {
        globalNavbar.style.opacity = '0';
        globalNavbar.style.pointerEvents = 'none';
      }
    }
  };

  return (
    <div className="design-page-container" onScroll={handleScroll}>
      
      {/* ==========================================
          SECCIÓN 1: HERO (CANVAS INTERACTIVO + IMAGEN ESTÁTICA)
      ========================================== */}
      <section className="snap-section hero-section" style={{ padding: 0 }}>
        
        {/* 🔥 FIX: Cambiamos <video> por <img> pero mantenemos la clase para heredar el estilo B&N y Cover */}
        <div className="video-background-wrapper">
          <img
            src="/Design_Splash.jpg" 
            alt="Design Splash Background"
            className="fullscreen-video" 
          />
        </div>
        <div className="video-overlay-dither"></div>
        <div className="video-overlay-vignette"></div>

        {/* El Canvas de Paper.js pasa por encima */}
        <InteractiveHero scrollProgress={heroScrollProgress} />

        {/* Header UI (Volver y Directorio) */}
        <div className="ui-layer">
          <header className="page-header">
            <button className="back-btn" onClick={() => navigate('/work')}>[ ← VOLVER ]</button>
            <div className="directory-label">/ DIR: DESIGN_</div>
          </header>
        </div>
      </section>

      {/* ==========================================
          SECCIÓN 2: SELECTED WORK (GRID SANITY)
      ========================================== */}
      <section className="snap-section archive-section">
        <div className="archive-header">
          <h2>SELECTED WORK</h2>
          <p>PROYECTOS DESTACADOS // DESIGN & SOCIAL MEDIA</p>
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

      {/* ==========================================
          SECCIÓN 3: MARCAS (CARRUSEL BRUTALISTA)
      ========================================== */}
      <section className="snap-section brands-section">
        <div className="archive-header brands-header">
          <h2>[ TRUSTED_BY ]</h2>
          <p>ALIANZAS ESTRATÉGICAS Y COLABORACIONES</p>
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

      {/* ==========================================
          SECCIÓN 4: FOOTER GLOBAL
      ========================================== */}
      <BrutalistFooter />

    </div>
  );
};

export default Design;