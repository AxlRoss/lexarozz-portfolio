import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/Navbar.scss';

const Navbar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lastStickerId, setLastStickerId] = useState(localStorage.getItem('lastStickerId') || '1');
  const location = useLocation();

  const userThemeColor = localStorage.getItem('userThemeColor') || '#00ff88';
  const visitorNumber = localStorage.getItem('visitorNumber');
  const formattedVisitorNumber = visitorNumber ? String(visitorNumber).padStart(3, '0') : '000';

  useEffect(() => {
    const handleStorage = () => {
      setLastStickerId(localStorage.getItem('lastStickerId') || '1');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);


  // 🔥 LA NUEVA FUNCIÓN MÁGICA DE RESETEO
  const handleResetExperience = () => {
    // 1. Borramos el registro de que ya completó la intro
    localStorage.removeItem('hasCompletedOnboarding');
    // 2. Borramos su número para que Firebase le asigne uno nuevo
    localStorage.removeItem('visitorNumber');
    // 3. Borramos el color para que vuelva a elegir
    localStorage.removeItem('userThemeColor');
    
    // 4. Si el menú móvil estaba abierto, lo cerramos
    setIsMenuOpen(false);
  };


  const overlayVariants = {
    hidden: { opacity: 0, backdropFilter: 'blur(0px)' },
    visible: { opacity: 1, backdropFilter: 'blur(25px)', transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, backdropFilter: 'blur(0px)', transition: { duration: 0.5, delay: 0.2 } }
  };

  const linkContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
    exit: { opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } }
  };

  const linkItemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <>
      <nav className="navbar-container" style={{ '--nav-theme-color': userThemeColor }}>
        
        <Link 
          to="/home" 
          className="logo-section-wrapper" 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setIsMenuOpen(false)} 
        >
          <div className="green-dot" />
          <div className="logo-text-container">
            <motion.div
              animate={{ y: isHovered ? -35 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <span className="logo-text">ROZZ</span>
              <span className="logo-text visitor-text">VISITANTE #{formattedVisitorNumber}</span>
            </motion.div>
          </div>
        </Link>

        <div className="nav-menus">
          <Link to="/work" className={location.pathname === '/work' ? 'active' : ''}>WORK</Link>
          <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>CONTACT</Link>
        </div>

        <div className="nav-right-section">
          
          {/* 🔥 LE AGREGAMOS EL onClick AQUÍ (VERSIÓN ESCRITORIO) */}
          <Link to="/" className="nav-sticker-section" onClick={handleResetExperience}>
            <span className="sticker-text">Añade otro sticker</span>
            <div className="sticker-preview-box">
              <div className="sticker-glow" />
              <motion.img 
                src={`/stickers/s${lastStickerId}.png`} 
                alt="Last used sticker"
                animate={{ rotateY: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              />
            </div>
          </Link>

          <button 
            className={`hamburger-btn ${isMenuOpen ? 'open' : ''}`} 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="line line-1"></span>
            <span className="line line-2"></span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="mobile-menu-overlay"
            style={{ '--nav-theme-color': userThemeColor }}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div 
              className="mobile-links-container"
              variants={linkContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div variants={linkItemVariants}>
                <Link to="/home" className={location.pathname === '/home' ? 'active' : ''}>HOME</Link>
              </motion.div>
              <motion.div variants={linkItemVariants}>
                <Link to="/work" className={location.pathname === '/work' ? 'active' : ''}>WORK</Link>
              </motion.div>
              <motion.div variants={linkItemVariants}>
                <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>CONTACT</Link>
              </motion.div>

              <motion.div variants={linkItemVariants} className="mobile-sticker-link">
                
                {/* 🔥 Y TAMBIÉN LE AGREGAMOS EL onClick AQUÍ (VERSIÓN MÓVIL) */}
                <Link to="/" onClick={handleResetExperience}>
                  <span>AÑADIR STICKER</span>
                  <img src={`/stickers/s${lastStickerId}.png`} alt="Sticker" />
                </Link>
                
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;