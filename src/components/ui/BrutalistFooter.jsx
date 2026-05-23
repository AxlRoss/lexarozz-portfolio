import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import '../../styles/BrutalistFooter.scss';

const BrutalistFooter = () => {
  const navigate = useNavigate();

  // 🔥 1. ESTADO PARA EL GIRO 3D DE LA FOTO
  const [isFlipped, setIsFlipped] = useState(false);

  // 🔥 2. LÓGICA DE LA PUPILA MÁGICA (Importada de tu Home)
  const letterORef = useRef(null); 
  const [isIdle, setIsIdle] = useState(true);
  const idleTimeoutRef = useRef(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 22, stiffness: 150, mass: 0.7 };
  const pupilX = useSpring(mouseX, springConfig);
  const pupilY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setIsIdle(false);
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = setTimeout(() => setIsIdle(true), 3000);

      if (letterORef.current) {
        const rect = letterORef.current.getBoundingClientRect();
        const centerX = rect.left + (rect.width / 0.5);
        const centerY = rect.top + (rect.height * 0.5);

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const MAX_RADIUS = 20; // Radio un poco más pequeño para el footer
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_RADIUS) {
          mouseX.set(dx);
          mouseY.set(dy);
        } else {
          mouseX.set((dx / dist) * MAX_RADIUS);
          mouseY.set((dy / dist) * MAX_RADIUS);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(idleTimeoutRef.current);
    };
  }, [mouseX, mouseY]);

  useEffect(() => {
    let interval;
    if (isIdle) {
      interval = setInterval(() => {
        const MAX_IDLE_RADIUS = 40; 
        const randomAngle = Math.random() * Math.PI * 2;
        const randomDist = Math.random() * MAX_IDLE_RADIUS;
        mouseX.set(Math.cos(randomAngle) * randomDist);
        mouseY.set(Math.sin(randomAngle) * randomDist);
      }, 2800); 
    }
    return () => clearInterval(interval);
  }, [isIdle, mouseX, mouseY]);

  return (
    <footer className="snap-section brutalist-system-footer">
      
      <div className="footer-bento-grid">
        
        {/* ==========================================
            🔥 CAJA 1: ID CARD 3D + METADATA
        ========================================== */}
        <div className="bento-box id-box">
          <div className="id-content-wrapper">
            
            {/* EL CONTENEDOR 3D (Click para girar) */}
            <div className="id-card-3d-wrapper" onClick={() => setIsFlipped(!isFlipped)}>
              <motion.div 
                className="id-card-flipper"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                
                {/* CARA FRONTAL (Tu Foto) */}
                <div className="id-card-face id-card-front">
                  <div className="tech-corner top-left">+</div>
                  <div className="tech-corner top-right">+</div>
                  <div className="tech-corner bottom-left">+</div>
                  <div className="tech-corner bottom-right">+</div>
                  <img src="/tu-foto.jpg" alt="Axl Rozz" className="author-photo" />
                  <div className="dither-overlay"></div>
                </div>

                {/* CARA TRASERA (Redes Sociales Ocultas) */}
                <div className="id-card-face id-card-back">
                  <p className="back-title">[ CONECTAR ]</p>
                  <div className="social-links-container">
                    {/* INSTAGRAM */}
                    <a href="https://instagram.com/axlrozzshadow" target="_blank" rel="noreferrer" className="social-btn" onClick={(e) => e.stopPropagation()}>
                      <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    </a>
                    {/* YOUTUBE */}
                    <a href="https://www.youtube.com/@AxlRozz" target="_blank" rel="noreferrer" className="social-btn" onClick={(e) => e.stopPropagation()}>
                      <svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    </a>
                    {/* THREADS */}
                    <a href="https://threads.net/@tu_usuario" target="_blank" rel="noreferrer" className="social-btn" onClick={(e) => e.stopPropagation()}>
                      <svg viewBox="0 0 24 24"><path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm0-22C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.5 6.5h-7a1.5 1.5 0 0 0-1.5 1.5v6a1.5 1.5 0 0 0 1.5 1.5h7a1.5 1.5 0 0 0 1.5-1.5v-6a1.5 1.5 0 0 0-1.5-1.5zm-3.5 7.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>
                    </a>
                  </div>
                </div>

              </motion.div>
            </div>

            {/* LA METADATA (Ahora del mismo ancho exacto que la foto) */}
            <div className="id-meta-data">
              <div className="meta-row"><span className="meta-key">_AUTH_USER</span><span className="meta-value">AXL ROZZ</span></div>
              <div className="meta-row"><span className="meta-key">_SYS_ROLE</span><span className="meta-value">DIRECTOR / ARTIST</span></div>
              <div className="meta-row"><span className="meta-key">_LOC</span><span className="meta-value">CDMX, MEXICO</span></div>
            </div>
          </div>
        </div>

        {/* ==========================================
            🔥 CAJA 2: LOGO INTERACTIVO "Axl Rozz"
        ========================================== */}
        <div className="bento-box logo-box">
          <div className="zone-label">[ IDENTIFICACIÓN DE SISTEMA ]</div>
          
          <div className="footer-hero-name">
            <div className="first-name">Axl</div>
            <div className="last-name">
            <span>R</span>
            {/* 🔥 LE QUITAMOS EL REF AL SPAN */}
            <span className="letter-o">
              O
              {/* 🔥 LE PONEMOS EL REF AL WRAPPER. Ahora las matemáticas y lo visual son 100% lo mismo */}
              <div className="dot-center-wrapper" ref={letterORef}>
                <motion.div className="dot-moving-wrapper" style={{ x: pupilX, y: pupilY }}>
                  <div className="neon-dot" />
                </motion.div>
              </div>
            </span>
            <span>Z</span>
            <span>Z</span>
          </div>
          </div>
        </div>

        {/* ==========================================
            🔥 CAJAS 3, 4 Y 5 (Enlaces y Acción)
        ========================================== */}
        <div className="bento-box link-box" onClick={() => navigate('/cv')}>
          <div className="zone-label">[01]</div>
          <button className="term-btn">{`> /DESCUBRE_MI_TRAYECTORIA`}</button>
        </div>

        <div className="bento-box link-box" onClick={() => navigate('/contact')}>
          <div className="zone-label">[02]</div>
          <button className="term-btn">{`> /CONTÁCTAME_AHORA`}</button>
        </div>

        <div className="bento-box action-box" onClick={() => navigate('/all')}>
          <div className="action-content">
            <span className="action-label">[ DATABASE ]</span>
            <h2>ALL MY WORK</h2>
            <div className="action-arrow">→</div>
          </div>
          <div className="barcode-pattern"></div>
        </div>

      </div>

      <div className="footer-status-bar">
        <div className="status-left">
          <span className="status-dot"></span>
          <span>SYSTEM_ONLINE // MEXICO_CITY</span>
        </div>
        <div className="status-right">
          <span>© 2026 // ALL_RIGHTS_RESERVED</span>
        </div>
      </div>

    </footer>
  );
};

export default BrutalistFooter;