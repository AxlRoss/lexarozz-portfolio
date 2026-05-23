import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import '../styles/home.scss'; 

// ========================================================
// 🔥 1. PREPARACIÓN DE CURSORES NATIVOS (Cero lag)
// ========================================================
const svgToUrl = (svgString) => {
  const encoded = encodeURIComponent(svgString);
  // El "2 2" le dice a la compu que la "Punta" del clic está casi en la esquina superior izquierda
  return `url("data:image/svg+xml;charset=utf-8,${encoded}") 2 2, auto`; 
};

const CURSOR_NORMAL = svgToUrl(`
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 502.89 541.68">
    <path fill="#000" stroke="#fff" stroke-width="20" d="M489.35,223.83L34.6,2.43C26.29-1.62,16.39-.55,9.14,5.19,1.89,10.93-1.44,20.31.58,29.33l110.6,493.54c2.29,10.22,10.92,17.78,21.36,18.71.72.06,1.43.09,2.14.09,9.62,0,18.4-5.76,22.18-14.75l91.87-218.75,234.04-38.97c10.33-1.72,18.36-9.92,19.87-20.29,1.5-10.36-3.87-20.51-13.28-25.09Z"/>
  </svg>
`);

const CURSOR_HOVER = svgToUrl(`
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="34" viewBox="0 0 502.89 541.68">
    <defs>
      <style>
        /* Separamos el estilo de la flecha y de las rayitas */
        .arrow-path { fill: #000; stroke: #fff; stroke-width: 20px; stroke-linejoin: round; }
        .action-lines { fill: none; stroke: #fff; stroke-linecap: round; stroke-width: 30px; }
      </style>
    </defs>
    
    <path class="arrow-path" d="M489.35,223.83L34.6,2.43C26.29-1.62,16.39-.55,9.14,5.19,1.89,10.93-1.44,20.31.58,29.33l110.6,493.54c2.29,10.22,10.92,17.78,21.36,18.71.72.06,1.43.09,2.14.09,9.62,0,18.4-5.76,22.18-14.75l91.87-218.75,234.04-38.97c10.33-1.72,18.36-9.92,19.87-20.29,1.5-10.36-3.87-20.51-13.28-25.09Z"/>
    
    <line class="action-lines" x1="293.34" y1="360.27" x2="478.11" y2="360.27"/>
    <line class="action-lines" x1="293.34" y1="423.4" x2="478.11" y2="423.4"/>
    <line class="action-lines" x1="293.34" y1="486.52" x2="478.11" y2="486.52"/>
  </svg>
`);

// 🔥 CAMBIO 2: Cursor CLICK relleno de blanco con borde negro
const CURSOR_CLICK = svgToUrl(`
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 502.89 541.68">
    <path fill="#fff" stroke="#000" stroke-width="20" d="M489.35,223.83L34.6,2.43C26.29-1.62,16.39-.55,9.14,5.19,1.89,10.93-1.44,20.31.58,29.33l110.6,493.54c2.29,10.22,10.92,17.78,21.36,18.71.72.06,1.43.09,2.14.09,9.62,0,18.4-5.76,22.18-14.75l91.87-218.75,234.04-38.97c10.33-1.72,18.36-9.92,19.87-20.29,1.5-10.36-3.87-20.51-13.28-25.09Z"/>
  </svg>
`);

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 🔥 Leemos cómo llegó el usuario aquí
  const userThemeColor = localStorage.getItem('userThemeColor') || '#00ff88';

  const [showLoaderContent, setShowLoaderContent] = useState(true);
  const [showLoaderOverlay, setShowLoaderOverlay] = useState(true);

  const [userData, setUserData] = useState({
    visitorNum: '000',
    stickerId: null
  });

  // ==========================================
  // 🔥 SISTEMA DE SEGURIDAD Y ACCESO
  // ==========================================
  const hasCompleted = localStorage.getItem('hasCompletedOnboarding') === 'true';
  const justSkipped = location.state?.skipped || false;

  // Definimos quién es el usuario
  let userStatus = 'UNAUTHORIZED';
  if (hasCompleted) userStatus = 'COMPLETED';
  else if (justSkipped) userStatus = 'SKIPPED';

  // 🔥 TRUCO MAESTRO: Si saltó la intro, limpiamos su historial inmediatamente.
  // Así, si presiona F5 (Refrescar), pierde el pase temporal y se vuelve UNAUTHORIZED.
  useEffect(() => {
    if (justSkipped) {
      window.history.replaceState({}, document.title);
    }
  }, [justSkipped]);

  // 🔥 LÓGICA DE CARGA CINEMATOGRÁFICA Y REDIRECCIÓN
  useEffect(() => {
    const visitorNum = localStorage.getItem('visitorNumber') || '000';
    const stickerId = localStorage.getItem('lastStickerId');
    setUserData({ visitorNum, stickerId });

    // A los 3 segundos apagamos el contenido (se va a negro)
    const contentTimer = setTimeout(() => {
      setShowLoaderContent(false);
    }, 3000);

    // A los 4 segundos tomamos la decisión de dejarlo pasar o expulsarlo
    const overlayTimer = setTimeout(() => {
      if (userStatus === 'UNAUTHORIZED') {
        // 🚫 Lo expulsamos de regreso al inicio
        navigate('/');
      } else {
        // ✅ Le quitamos la cortina y lo dejamos ver el Home
        setShowLoaderOverlay(false);
      }
    }, 4000);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(overlayTimer);
    };
  }, [userStatus, navigate]);

  // --- LÓGICA DEL TEXTO ROTATIVO ---
  const roles = ["VISUAL ARTIST", "MOTION GRAPHICS", "HUMAN", "3D GENERALIST", "VFX & CFX"];
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRoleIndex((prevIndex) => (prevIndex + 1) % roles.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [roles.length]);


  // --- LÓGICA DEL OJO (PUPILA MÁGICA) ---
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
        const centerX = rect.left + (rect.width / 2);
        const centerY = rect.top + (rect.height * 0.62);

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const MAX_RADIUS = 60; 
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
        const MAX_IDLE_RADIUS = 80; 
        const randomAngle = Math.random() * Math.PI * 1;
        const randomDist = Math.random() * MAX_IDLE_RADIUS;
        
        mouseX.set(Math.cos(randomAngle) * randomDist);
        mouseY.set(Math.sin(randomAngle) * randomDist);
      }, 2800); 
    }
    return () => clearInterval(interval);
  }, [isIdle, mouseX, mouseY]);


  return (
    <>
      {/* 🔥 LA CORTINA NEGRA (Se apaga a los 4s) */}
      <AnimatePresence>
        {showLoaderOverlay && (
          <motion.div 
            key="home-loading-overlay"
            className="home-loading-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }} 
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            
            {/* 🔥 EL CONTENIDO: Ya no usamos AnimatePresence aquí. 
                 Simplemente animamos la opacidad basándonos en el estado. 
                 Esto GARANTIZA que el fade-out de 0.5s ocurra. */}
            <motion.div 
              className="loader-content-wrapper"
              initial={{ opacity: 1 }}
              animate={{ opacity: showLoaderContent ? 1 : 0 }} 
              transition={{ duration: 0.5, ease: "easeInOut" }} 
            >
              {/* 1. Logo GIF Centrado */}
              <div className="loader-logo-container">
                <img src="/logo-animado.gif" alt="System Logo" className="loading-gif" />
              </div>

              {/* 🔥 2. MENSAJES DINÁMICOS SEGÚN EL ESTATUS */}
                  
                  {userStatus === 'COMPLETED' && (
                    <div className="loader-user-info">
                      <h2 className="dither-text">BIENVENIDO, VISITANTE #{userData.visitorNum}</h2>
                      <div className="loader-details">
                        <p>[ REGISTRO CONCEDIDO ]</p>
                      </div>
                    </div>
                  )}

                  {userStatus === 'SKIPPED' && (
                    <div className="loader-user-info">
                      <h2 className="dither-text">USUARIO NO IDENTIFICADO</h2>
                      <div className="loader-details">
                        <p>[ RECUERDA REGISTRAR TU VISITA ]</p>
                      </div>
                    </div>
                  )}

                  {userStatus === 'UNAUTHORIZED' && (
                    <div className="loader-user-info">
                      <h2 className="dither-text" style={{ color: '#ff3366' }}>REGISTRO NO ENCONTRADO</h2>
                      <div className="loader-details">
                        <p style={{ color: '#ff3366' }}>[ REDIRECCIONANDO AL ACCESO... ]</p>
                      </div>
                    </div>
                  )}
              
              {/* Barra de progreso de 3 segundos exactos */}
              <div className="loading-bar-container">
                <motion.div 
                  className="loading-bar-fill"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "linear" }}
                />
              </div>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
      
    <motion.div 
        className="new-home-container" 
        initial={{ opacity: 0 }}
        animate={{ opacity: showLoaderOverlay ? 0 : 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        style={{ 
          '--theme-color': userThemeColor,
          '--cursor-normal': CURSOR_NORMAL,
          '--cursor-hover': CURSOR_HOVER,
          '--cursor-click': CURSOR_CLICK
        }}
    >
      
      <div className="hero-name-wrapper">
        <div className="hero-top-row">
          <div className="rotating-role-container">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentRoleIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                • {roles[currentRoleIndex]} •
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="first-name">Axl</div>
        </div>

        <div className="last-name">
          <span>R</span>
          <span className="letter-o" ref={letterORef}>
            O
            <div className="dot-center-wrapper">
              <motion.div 
                className="dot-moving-wrapper"
                style={{ x: pupilX, y: pupilY }} 
              >
                <div className="neon-dot" />
              </motion.div>
            </div>
          </span>
          <span>Z</span>
          <span>Z</span>
        </div>
      </div>

      <div className="home-actions">
        <button className="primary-btn" onClick={() => navigate('/work')}>
          VER TRABAJOS ✨
        </button>
        <button className="secondary-btn" onClick={() => navigate('/contact')}>
          PONERSE<br />EN CONTACTO
        </button>
      </div>
      
{/* 🔥 CERRAMOS EL MOTION.DIV DEL HOME */}
    </motion.div>

  {/* 🔥 CERRAMOS EL FRAGMENTO INVISIBLE */}
  </> 
  );
};

export default Home;