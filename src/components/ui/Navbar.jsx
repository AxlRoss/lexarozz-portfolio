import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/Navbar.scss';


const Navbar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [lastStickerId, setLastStickerId] = useState(localStorage.getItem('lastStickerId') || '1');
  const location = useLocation();

  // Actualizar el sticker si cambia en localStorage
  useEffect(() => {
    const handleStorage = () => {
      setLastStickerId(localStorage.getItem('lastStickerId') || '1');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <nav className="navbar-container">
        {/* 1. LOGO IZQUIERDA (PUNTO + RULETA) */}
        <div 
        className="logo-section-wrapper" // Cambiamos el nombre para el flex
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        >
        {/* El punto verde se queda fijo aquí */}
        <div className="green-dot" />

        <div className="logo-text-container">
            <motion.div
            animate={{ y: isHovered ? -30 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
            <span className="logo-text">L3XA R0ZZ</span>
            <span className="logo-text">EXTRAÑ@</span>
            </motion.div>
        </div>
        </div>

      {/* 2. MENÚS CENTRADOS */}
      <div className="nav-menus">
        <Link to="/work" className={location.pathname === '/work' ? 'active' : ''}>WORK</Link>
        <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>CONTACT</Link>
      </div>

      {/* 3. STICKER DERECHA */}
      <Link to="/" className="nav-sticker-section">
        <span>Añade otro sticker</span>
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
    </nav>
  );
};

export default Navbar;