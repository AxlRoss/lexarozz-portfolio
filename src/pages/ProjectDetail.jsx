import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { client, urlFor } from '../sanity';
import { PortableText } from '@portabletext/react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/ProjectDetail.scss';

// ==========================================
// 🔥 COMPONENTE: CARRUSEL "STACK" 3D
// ==========================================
const BrutalistImageStack = ({ images, onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);

  const nextSlide = (e) => { if (e) e.stopPropagation(); setCurrentIndex((prev) => (prev + 1) % images.length); };
  const prevSlide = (e) => { if (e) e.stopPropagation(); setCurrentIndex((prev) => (prev - 1 + images.length) % images.length); };

  const handleDragEnd = (e, { offset }) => {
    const swipe = offset.x;
    if (swipe < -50) nextSlide();
    else if (swipe > 50) prevSlide();
  };

  // 🔥 NUEVO: Función para rastrear el mouse y hacer el Parallax
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5; // Nos da un valor de -0.5 a 0.5
    const y = (e.clientY - top) / height - 0.5;
    
    containerRef.current.style.setProperty('--mouse-x', x);
    containerRef.current.style.setProperty('--mouse-y', y);
  };

  return (
    <div 
      className="hero-stack-container" 
      ref={containerRef}
      onMouseMove={handleMouseMove}
    >
      {images.map((img, i) => {
        const total = images.length;
        let diff = i - currentIndex;
        if (diff > total / 2) diff -= total;
        if (diff < -total / 2) diff += total;

        const isVisible = Math.abs(diff) <= 2; 

        return (
          <motion.div
            key={i}
            className="stack-card"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            initial={false}
            animate={{
              x: diff * 140, 
              scale: 1 - Math.abs(diff) * 0.15, 
              zIndex: 100 - Math.abs(diff), 
              opacity: isVisible ? (1 - Math.abs(diff) * 0.3) : 0,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
            onClick={(e) => {
              e.stopPropagation();
              if (diff === 0) onImageClick(i); 
              else if (diff > 0) nextSlide(); 
              else prevSlide(); 
            }}
          >
            <img src={urlFor(img).width(1200).url()} alt={`Slide ${i}`} draggable={false} />
          </motion.div>
        );
      })}
      
      <button className="stack-nav prev" onClick={prevSlide}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
      </button>
      <button className="stack-nav next" onClick={nextSlide}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
      </button>
    </div>
  );
};

const ProjectDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // 🔥 ESTADOS PARA EL VIDEO MODAL
  // ==========================================
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [feedbackIcon, setFeedbackIcon] = useState(null); 
  
  const inlineVideoRef = useRef(null);
  const modalVideoRef = useRef(null);

  // ==========================================
  // 🔥 ESTADOS PARA GRID Y LIGHTBOX
  // ==========================================
  const [gridModal, setGridModal] = useState({ isOpen: false, images: [] });
  const [lightbox, setLightbox] = useState({ isOpen: false, images: [], currentIndex: 0 });

  useEffect(() => {
    if (isVideoModalOpen || gridModal.isOpen || lightbox.isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isVideoModalOpen, gridModal.isOpen, lightbox.isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (lightbox.isOpen) closeLightbox();
        else if (gridModal.isOpen) closeGrid();
        else if (isVideoModalOpen) handleCloseVideo();
      }
      if (lightbox.isOpen) {
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox.isOpen, gridModal.isOpen, isVideoModalOpen]);

  // Funciones de Video
  const handleOpenVideo = () => {
    setIsVideoModalOpen(true); setIsPlaying(true); setIsMuted(false); 
    setTimeout(() => {
      if (modalVideoRef.current && inlineVideoRef.current) {
        modalVideoRef.current.currentTime = inlineVideoRef.current.currentTime;
        modalVideoRef.current.play();
      }
    }, 50);
  };
  const handleCloseVideo = () => {
    setIsVideoModalOpen(false);
    if (inlineVideoRef.current) { inlineVideoRef.current.muted = true; inlineVideoRef.current.play(); }
  };
  const triggerFeedback = (type) => { setFeedbackIcon(type); setTimeout(() => setFeedbackIcon(null), 500); };
  const togglePlay = () => {
    if (modalVideoRef.current) {
      if (isPlaying) { modalVideoRef.current.pause(); triggerFeedback('pause'); } 
      else { modalVideoRef.current.play(); triggerFeedback('play'); }
      setIsPlaying(!isPlaying);
    }
  };
  const toggleMute = () => { if (modalVideoRef.current) { modalVideoRef.current.muted = !isMuted; setIsMuted(!isMuted); } };
  const skipTime = (amount) => { if (modalVideoRef.current) modalVideoRef.current.currentTime += amount; };
  const handleFullscreen = () => {
    if (modalVideoRef.current) {
      if (modalVideoRef.current.requestFullscreen) modalVideoRef.current.requestFullscreen();
      else if (modalVideoRef.current.webkitRequestFullscreen) modalVideoRef.current.webkitRequestFullscreen();
    }
  };
  const handleTimeUpdate = () => { if (modalVideoRef.current) setCurrentTime(modalVideoRef.current.currentTime); };
  const handleLoadedMetadata = () => { if (modalVideoRef.current) setDuration(modalVideoRef.current.duration); };
  const handleSeek = (e) => {
    const time = Number(e.target.value);
    if (modalVideoRef.current) { modalVideoRef.current.currentTime = time; setCurrentTime(time); }
  };

  // Funciones de Imágenes
  const openGrid = (images) => setGridModal({ isOpen: true, images });
  const closeGrid = () => setGridModal({ ...gridModal, isOpen: false });
  const openLightbox = (images, index) => setLightbox({ isOpen: true, images, currentIndex: index });
  const closeLightbox = () => setLightbox({ ...lightbox, isOpen: false });
  const nextImage = () => setLightbox(prev => ({ ...prev, currentIndex: (prev.currentIndex + 1) % prev.images.length }));
  const prevImage = () => setLightbox(prev => ({ ...prev, currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length }));

  // ==========================================
  // 🔥 COMPONENTES PORTABLE TEXT
  // ==========================================
  const portableTextComponents = {
    types: {
      image: ({ value }) => (
        <div className="brutalist-block-image" onClick={() => openLightbox([value], 0)}>
          <div className="tech-corner top-left">+</div><div className="tech-corner top-right">+</div>
          <div className="tech-corner bottom-left">+</div><div className="tech-corner bottom-right">+</div>
          <img src={urlFor(value).width(1400).url()} alt={value.alt || ''} className="zoomable-img" />
          {value.caption && <p className="block-caption">_ {value.caption}</p>}
        </div>
      ),
      videoEmbed: ({ value }) => (
        <div className="brutalist-block-video">
          <iframe src={value.url.replace("watch?v=", "embed/")} title="Project Video" allowFullScreen />
        </div>
      ),
      inlineCarousel: ({ value }) => {
        if (!value?.images || value.images.length === 0) return null;
        return (
          <div className="brutalist-inline-carousel-wrapper">
            <div className="aspect-ratio-box">
              <div className="tech-corner top-left">+</div><div className="tech-corner top-right">+</div>
              <div className="tech-corner bottom-left">+</div><div className="tech-corner bottom-right">+</div>
              <BrutalistImageStack images={value.images} onImageClick={(index) => openLightbox(value.images, index)} />
            </div>
            
            <div className="carousel-hint-bar">
              {/* 🔥 CAMBIO A ESPAÑOL */}
              <span>[ MÚLTIPLES_ARCHIVOS_DETECTADOS ]</span>
              <button className="view-all-btn" onClick={() => openGrid(value.images)}>[ VER_TODO ]</button>
            </div>
          </div>
        );
      }
    },
    block: {
      h2: ({children}) => <h2 className="brutalist-h2">{children}</h2>,
      h3: ({children}) => <h3 className="brutalist-h3">[{children}]</h3>,
      normal: ({children}) => <p className="brutalist-p">{children}</p>,
      blockquote: ({children}) => <blockquote className="brutalist-quote">{children}</blockquote>,
    }
  };

  useEffect(() => {
    const query = `*[slug.current == "${slug}"][0]{
      title, client, year, displayDate, "tags": tags[]->title, credits, mainImage,
      "nativeVideoUrl": nativeVideo.asset->url, mainCarousel, content
    }`;
    client.fetch(query).then((data) => { setProject(data); setLoading(false); }).catch(console.error);
    window.scrollTo(0, 0); 
  }, [slug]);

  if (loading) return <div className="detail-loading"><span className="blinking">_ESTABLECIENDO_CONEXIÓN...</span></div>;
  if (!project) return <div className="detail-error">ERROR 404: FILE_NOT_FOUND.</div>;

  return (
    <>
      <motion.div className="project-detail-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        <div className="detail-container">
          
          <nav className="internal-nav">
            <button onClick={() => navigate(-1)} className="term-btn">[ ← REGRESAR ]</button>
          </nav>

          <header className="detail-header">
            <div className="title-area">
              <h1 className="project-title">{project.title}</h1>
              <div className="project-tags">
                {project.tags?.map(tag => (
                  <span key={tag} className="tag-capsule">[{tag}]</span>
                ))}
              </div>
            </div>
            
            <div className="header-meta-grid">
              <div className="meta-box"><span className="meta-key">_CLIENT</span><span className="meta-value">{project.client || 'N/A'}</span></div>
              <div className="meta-box"><span className="meta-key">_DATE</span><span className="meta-value">{project.displayDate || project.year || 'TBD'}</span></div>
            </div>
          </header>

          <div className="detail-hero-wrapper">
            <div className="aspect-ratio-box">
              <div className="tech-corner top-left">+</div><div className="tech-corner top-right">+</div>
              <div className="tech-corner bottom-left">+</div><div className="tech-corner bottom-right">+</div>
              
              {project.nativeVideoUrl ? (
                <div className="hero-video-trigger" onClick={handleOpenVideo}>
                  <video ref={inlineVideoRef} src={project.nativeVideoUrl} className="hero-media-element" autoPlay loop muted playsInline />
                  <div className="hover-play-overlay"><span className="blink">[ CLICK_TO_PLAY_WITH_AUDIO ]</span></div>
                </div>
              ) : project.mainCarousel && project.mainCarousel.length > 0 ? (
                <BrutalistImageStack images={project.mainCarousel} onImageClick={(index) => openLightbox(project.mainCarousel, index)} />
              ) : project.mainImage ? (
                <img src={urlFor(project.mainImage).width(1600).url()} alt={project.title} className="hero-media-element zoomable-img" onClick={() => openLightbox([project.mainImage], 0)} />
              ) : (
                <div className="no-media-fallback">[ NO MEDIA DATA ]</div>
              )}
            </div>
            
            {!project.nativeVideoUrl && project.mainCarousel && project.mainCarousel.length > 0 && (
              <div className="carousel-hint-bar">
                {/* 🔥 CAMBIO A ESPAÑOL */}
                <span>[ MÚLTIPLES_ARCHIVOS_DETECTADOS ]</span>
                <button className="view-all-btn" onClick={() => openGrid(project.mainCarousel)}>[ VER_TODO ]</button>
              </div>
            )}
          </div>

          <article className="detail-content">
            <PortableText value={project.content} components={portableTextComponents} />
          </article>

          {project.credits && (
            <footer className="detail-footer">
              <h4 className="label-credits">CRÉDITOS:</h4>
              <p className="credits-list">{project.credits}</p>
            </footer>
          )}
        </div>
      </motion.div>

      {/* MODAL 1: VIDEO FULLSCREEN */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div className="video-modal-overlay" onClick={handleCloseVideo} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="video-modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="video-modal-content">
                <video ref={modalVideoRef} src={project.nativeVideoUrl} className="modal-video-element interactive-vid" loop onClick={togglePlay} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} />
                <AnimatePresence>
                  {feedbackIcon && (
                    <motion.div className="video-feedback-icon" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1.2 }} exit={{ opacity: 0, scale: 1.5 }} transition={{ duration: 0.3 }}>
                      {feedbackIcon === 'play' ? '▶' : '||'}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="controls-wrapper">
                <div className="progress-bar-container">
                  <input type="range" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} className="minimal-progress-bar" style={{ '--progress': `${(currentTime / duration) * 100}%` }} />
                </div>
                <div className="controls-island">
                  <button onClick={() => skipTime(-3)} title="-3 Segundos" className="icon-btn"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg></button>
                  <button onClick={togglePlay} title={isPlaying ? "Pausar" : "Reproducir"} className="icon-btn">
                    {isPlaying ? <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}
                  </button>
                  <button onClick={() => skipTime(3)} title="+3 Segundos" className="icon-btn"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg></button>
                  <div className="island-divider"></div>
                  <button onClick={toggleMute}>[ {isMuted ? 'DESMUTEAR' : 'MUTE'} ]</button>
                  <button onClick={handleFullscreen}>[ PANTALLA COMPLETA ]</button>
                  <button onClick={handleCloseVideo} className="close-vid-btn">[ X_CERRAR ]</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 2: VER TODO (GRID) */}
      <AnimatePresence>
        {gridModal.isOpen && (
          <motion.div className="grid-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="grid-modal-header">
              <h2>[ ARCHIVOS_DEL_CARRUSEL ]</h2>
              <button onClick={closeGrid} className="close-grid-btn">[ X_CERRAR ]</button>
            </div>
            <div className="grid-modal-content">
              {gridModal.images.map((img, index) => (
                <div key={index} className="grid-item" onClick={() => openLightbox(gridModal.images, index)}>
                  <img src={urlFor(img).width(600).url()} alt={`Grid item ${index}`} />
                  <div className="grid-hover-overlay">+ VER</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 3: LIGHTBOX FULLSCREEN */}
      <AnimatePresence>
        {lightbox.isOpen && (
          <motion.div className="lightbox-overlay" onClick={closeLightbox} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <button className="lightbox-close-btn" onClick={closeLightbox}>[ X_CERRAR ]</button>
            {lightbox.images.length > 1 && (
              <>
                <button className="lightbox-nav-btn prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
                </button>
                <button className="lightbox-nav-btn next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
                </button>
                <div className="lightbox-counter">{lightbox.currentIndex + 1} / {lightbox.images.length}</div>
              </>
            )}
            <img src={urlFor(lightbox.images[lightbox.currentIndex]).width(1800).url()} alt="Expanded view" className="lightbox-img" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProjectDetail;