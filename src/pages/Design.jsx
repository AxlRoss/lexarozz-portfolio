import React, { useState, useEffect } from 'react';
import { client } from '../sanity';
import ProjectCard from '../components/ui/ProjectCard';
import { motion } from 'framer-motion';
import InteractiveHero from '../components/ui/InteractiveHero';
import '../styles/Design.scss';

const Design = () => {
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [heroScrollProgress, setHeroScrollProgress] = useState(0);

  useEffect(() => {
    const query = `*[_type == "project" && "Design" in tags]{
      title, client, year, mainImage, projectType,
      "hoverVideo": hoverVideo.asset->{url}, 
      slug
    }`;

    client.fetch(query).then((data) => {
      setSelectedProjects(data.filter(p => p.projectType === 'selected'));
      setAllProjects(data.filter(p => p.projectType === 'all'));
    });
  }, []);

  const handleScroll = (e) => {
    const element = e.target;
    const scrollTop = element.scrollTop;
    const viewportHeight = window.innerHeight;
    let progress = scrollTop / viewportHeight;
    if (progress > 1) progress = 1;
    if (progress < 0) progress = 0;
    setHeroScrollProgress(progress);
  };

  return (
    <motion.div 
      className="design-page-snap-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onScroll={handleScroll}
    >
      {/* 1. HERO */}
      <section className="snap-section hero-section" style={{ padding: 0 }}>
        <InteractiveHero scrollProgress={heroScrollProgress} />
        {/* Hint ya incluido dentro de InteractiveHero, pero si quieres uno extra lo puedes poner aquí */}
      </section>

      {/* 2. SELECTED WORK */}
      <section className="snap-section work-section">
        <div className="section-header-centered">
          <span className="code">[ 01_CASE_STUDIES ]</span>
          <h2 className="title-italic">SELECTED WORK</h2>
        </div>
        
        <div className="selected-grid-fixed">
          {selectedProjects.slice(0, 2).map((project) => (
            <div key={project.slug.current} className="grid-item">
               <ProjectCard project={project} />
            </div>
          ))}
        </div>

        {/* 🔥 HINT: SCROLL TO EXPLORE 🔥 */}
        <div className="scroll-indicator">

          <div className="scroll-line"></div>
        </div>
      </section>

      {/* 3. MARCAS */}
      <section className="snap-section brands-section">
        <div className="brands-text-center">
            <span className="tag-green">DATA_LOG</span>
            <h3>ALIANZAS ESTRATÉGICAS</h3>
            <p>He colaborado con marcas que entienden que el diseño es una herramienta de precisión, no un adorno.</p>
        </div>
        
        <div className="marquee-wrapper-compact">
          <div className="marquee-move">
            <div className="marquee-inner">
              <span className="brand">SR TACO</span>
              <span className="brand">NIKE</span>
              <span className="brand">REDFULL</span>
              <span className="brand">SAMSUNG</span>
              <span className="brand">ADIDAS</span>
              <span className="brand">APPLE</span>
              <span className="brand">PEPSI</span>
            </div>
            <div className="marquee-inner" aria-hidden="true">
              <span className="brand">SR TACO</span>
              <span className="brand">NIKE</span>
              <span className="brand">REDFULL</span>
              <span className="brand">SAMSUNG</span>
              <span className="brand">ADIDAS</span>
              <span className="brand">APPLE</span>
              <span className="brand">PEPSI</span>
            </div>
          </div>
        </div>

        {/* 🔥 HINT: SCROLL TO EXPLORE 🔥 */}
        <div className="scroll-indicator">

          <div className="scroll-line"></div>
        </div>
      </section>

      {/* 4. ARCHIVE */}
      <section className="snap-section archive-section">
        <div className="section-header-centered">
          <span className="code">[ 02_THE_ARCHIVE ]</span>
          <h2 className="title-italic">RECORRIDO EXPERIMENTAL</h2>
        </div>
        
        <div className="archive-grid-compact">
          {allProjects.map((project) => (
            <ProjectCard key={project.slug.current} project={project} />
          ))}
        </div>
        {/* Aquí NO ponemos hint porque es el final */}
      </section>
    </motion.div>
  );
};

export default Design;