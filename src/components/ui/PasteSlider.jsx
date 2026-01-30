import React from 'react';
import { motion, useMotionValue } from 'framer-motion';

const PasteSlider = ({ onProgress, onComplete }) => {
  // Eliminamos constraintsRef porque causaba conflictos de cálculo
  const x = useMotionValue(0); 
  const maxDrag = 250; // 300px de ancho total - 50px del botón = 250px de recorrido

  const handleDrag = () => {
    const currentX = x.get();
    
    // Calculamos porcentaje (0 a 1) usando matemáticas simples y seguras
    let progress = Math.max(0, Math.min(currentX / maxDrag, 1));
    
    onProgress(progress);

    if (progress >= 0.95) {
      onComplete();
    }
  };

  const handleDragEnd = () => {
    const currentX = x.get();
    // Si soltamos antes del final, regresamos a 0
    if (currentX < 200) { 
      onProgress(0);
      // Nota: Framer Motion animará el retorno visualmente gracias a 'dragElastic'
    }
  };

  return (
    <div className="paste-slider-container" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
      width: '100%', justifyContent: 'center',
      pointerEvents: 'auto' // Aseguramos que reciba clics
    }}>
      <h3 style={{
        fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)',
        textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px',
        userSelect: 'none'
      }}>
        Arrastra para pegar
      </h3>

      {/* TRACK (LA PISTA) */}
      <div 
        style={{
          width: '300px', height: '60px', 
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '30px', border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', padding: '5px', position: 'relative',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)'
        }}
      >
        {/* RELLENO VISUAL */}
        <motion.div 
          style={{
            position: 'absolute', left: '5px', top: '5px', bottom: '5px',
            borderRadius: '30px', background: 'rgba(255, 255, 255, 0.2)',
            width: x // Se estira visualmente con el valor X
          }}
        />

        {/* BOTÓN (KNOB) */}
        <motion.div
          drag="x" // Permitir arrastre horizontal
          
          // --- AQUÍ ESTÁ EL FIX ---
          // En lugar de una referencia, le damos números exactos.
          dragConstraints={{ left: 0, right: maxDrag }} 
          // ------------------------
          
          dragElastic={0.1} // Un poquito de rebote se siente bien
          dragMomentum={false} // Se detiene al soltar
          
          style={{
            x, // Vinculado al valor
            width: '50px', height: '50px', background: '#fff',
            borderRadius: '50%', cursor: 'grab',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 15px rgba(255,255,255,0.5)',
            zIndex: 10,
            touchAction: 'none' // CRUCIAL: Evita scroll en móviles y conflictos de touch
          }}
          
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          
          // Capturamos el evento para asegurarnos que nadie nos lo robe
          onPointerDownCapture={(e) => e.stopPropagation()}
          
          whileHover={{ scale: 1.1 }}
          whileTap={{ cursor: 'grabbing', scale: 0.95 }}
        >
          <span style={{color: 'black', fontSize: '20px', pointerEvents: 'none', userSelect: 'none'}}>➔</span>
        </motion.div>

        <span style={{
          position: 'absolute', right: '30px', color: 'rgba(255,255,255,0.3)',
          pointerEvents: 'none', fontWeight: 600, fontSize: '0.8rem', userSelect: 'none'
        }}>
          PEGAR
        </span>
      </div>
    </div>
  );
};

export default PasteSlider;