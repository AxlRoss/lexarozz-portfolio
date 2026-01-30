import React, { useState, useRef, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

const GlobalPasteDrag = ({ onProgress, onComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  
  // REFERENCIA DE AUDIO
  const audioRef = useRef(new Audio('/sounds/stick.mp3'));
  
  const dragProgress = useSpring(0, { stiffness: 300, damping: 30 });
  const TARGET_DISTANCE = 350; // Aumenté un poco la distancia para más control

  // CONFIGURACIÓN INICIAL DEL AUDIO
  useEffect(() => {
    const audio = audioRef.current;
    audio.preload = 'auto';
    audio.volume = 0.6;
    // IMPORTANTE: No le damos play(). Lo controlaremos manualmente.
    
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    startX.current = e.clientX; 
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;

    const currentX = e.clientX;
    const delta = currentX - startX.current;
    
    // Normalizamos de 0 a 1
    let progress = Math.max(0, Math.min(delta / TARGET_DISTANCE, 1));
    
    // 1. ACTUALIZAR UI
    dragProgress.set(progress * 100); 
    onProgress(progress);

    // 2. ACTUALIZAR SONIDO (SCRUBBING EFFECT)
    // El audio avanza exactamente lo que avanza tu mano.
    if (audioRef.current && Number.isFinite(audioRef.current.duration)) {
      const duration = audioRef.current.duration;
      // Mapeamos el progreso (0.0 - 1.0) a la duración del audio (0s - 0.5s)
      audioRef.current.currentTime = progress * duration;
    }

    if (progress >= 0.98) {
      onComplete();
      setIsDragging(false);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragProgress.set(0);
    onProgress(0);
    
    // Si sueltas, regresamos el sonido al inicio (opcional, o podrías dejarlo ahí)
    if(audioRef.current) audioRef.current.currentTime = 0;
  };

  const width = useTransform(dragProgress, value => `${value}%`);

  return (
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        zIndex: 9999, cursor: 'ew-resize', touchAction: 'none'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* UI VISUAL */}
      <div style={{
        position: 'absolute', bottom: '15%', left: '50%', transform: 'translateX(-50%)',
        width: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center',
        pointerEvents: 'none'
      }}>
        {/* Instrucciones animadas */}
        <motion.div 
          animate={{ x: [0, 20, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ marginBottom: '15px', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <span>🖱️ Click & Desliza</span> <span>➔</span>
        </motion.div>

        {/* Barra de Progreso */}
        <div style={{
          width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)',
          borderRadius: '10px', overflow: 'hidden'
        }}>
          <motion.div 
            style={{
              height: '100%', background: '#fff', width: width,
              boxShadow: '0 0 10px rgba(255,255,255,0.8)'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default GlobalPasteDrag;