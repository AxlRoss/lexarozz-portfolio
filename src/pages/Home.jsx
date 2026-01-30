import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.scss';
import avatarImg from '../assets/images/avatar.gif'; 
import Experience from '../components/3d/Experience';
import StickerMenu from '../components/ui/StickerMenu';
import GlobalPasteDrag from '../components/ui/GlobalPasteDrag';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const Home = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState('intro');
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [stickerPhase, setStickerPhase] = useState('hover'); 
  const [pasteProgress, setPasteProgress] = useState(0); 
  
  // Posiciones visuales
  const [finalStickerPosition, setFinalStickerPosition] = useState(null);
  
  // NUEVO: Datos temporales para guardar en DB
  const [dataToSave, setDataToSave] = useState(null);

  const [showExplorationHint, setShowExplorationHint] = useState(false);

  const [showFinalExit, setShowFinalExit] = useState(false);

  const hasSavedRef = useRef(false);

  // --- LÓGICA MAESTRA DE TIEMPOS ---
  const handleStart = () => {
    // 1. Inmediatamente mostramos el texto gigante y ocultamos la intro
    setStage('reading-text'); 
    
    // 2. Esperamos 4 SEGUNDOS exactos antes de cargar NADA de la experiencia (3D o UI)
    setTimeout(() => {
      setStage('experience');
    }, 1500);
  };

  // 3. Timer secundario para el Hint de "Selecciona un sticker"
  useEffect(() => {
    if (stage === 'experience') {
      // Esperamos 5 segundos ADICIONALES después de que entra el 3D
      const timer = setTimeout(() => {
        setShowExplorationHint(true);
      }, 3000); 
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // NUEVO: Función para cancelar selección (volver a exploración)
  const handleDeselectSticker = () => {
    setSelectedSticker(null);
    setStickerPhase('hover'); // Reseteamos fase por si acaso
  };

  // --- 1. ENVOLVER ESTO EN useCallback ---
  // Esto evita que la función cambie de identidad en cada render
  const onStickerFixed = useCallback((worldPos, rotationArray, localPos) => {
    setFinalStickerPosition(worldPos);

    // Solo preparamos datos si NO hemos guardado ya en esta sesión
    if (!hasSavedRef.current) {
      const payload = {
        stickerId: selectedSticker,
        position: [localPos.x, localPos.y, localPos.z],
        rotation: rotationArray,
        createdAt: new Date() 
      };
      
      setDataToSave(payload);
      console.log("📍 Datos preparados (Una sola vez)");
    }
  }, [selectedSticker]); // Dependencia mínima

  const handlePasteComplete = () => {
  const audio = new Audio('/sounds/stick.mp3');
  audio.volume = 0.5;
  audio.play().catch(e => console.log(e));
  
  // 🔥 NUEVO: Guardamos el ID para la Navbar
  if (selectedSticker) {
    localStorage.setItem('lastStickerId', selectedSticker);
  }
  
  setStickerPhase('completed');
};  

// --- WATCHER DE GUARDADO + SECUENCIA FINAL ---
  useEffect(() => {
    const saveDataAndTransition = async () => {
      if (stickerPhase === 'completed' && dataToSave && !hasSavedRef.current) {
        
        hasSavedRef.current = true;

        try {
          console.log("🚀 Subiendo a Firebase...");
          await addDoc(collection(db, "visits"), dataToSave);
          console.log("✅ Guardado exitoso.");
          setDataToSave(null); 
        } catch (error) {
          console.error("❌ Error de Firebase:", error);
        }

        // --- INICIA SECUENCIA FASE 3 ---
        
        // 1. Dejar que el usuario vea "Grax por registrar..." y el Zoom (4 segundos)
        setTimeout(() => {
            // 2. Activar transición a negro con el mensaje final
            setShowFinalExit(true);
            
            // 3. Esperar 4 segundos leyendo el mensaje final "Gr4ci4s..."
            setTimeout(() => {
                // 4. Redireccionar
                navigate('/work');
            }, 4000);

        }, 4000);
      }
    };

    saveDataAndTransition();
  }, [stickerPhase, dataToSave, navigate]);

  return (
    <div className="home-container">
      
      {/* 1. INTRO UI (Sin cambios) */}
      <AnimatePresence mode='wait'>
        {stage === 'intro' && (
          <motion.div 
            className="intro-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50, filter: "blur(5px)", transition: { duration: 0.8 } }}
          >
            <motion.div className="greeting-row" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
              <div className="avatar-circle"><img src={avatarImg} alt="Avatar" /></div>
              <h2>Hola, un gusto conocerte</h2>
            </motion.div>
            <motion.h1 className="big-cta" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1, duration: 0.8 }}>¿Empezamos?</motion.h1>
            <motion.button className="magic-button" onClick={handleStart} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} whileTap={{ scale: 0.95 }}>Iniciar Experiencia ✨</motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {(stage === 'reading-text' || stage === 'experience') && (
         <div className="background-giant-text" style={{ zIndex: 0 }}>
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: (stickerPhase === 'pasting' || stickerPhase === 'completed') ? 0 : 1, 
                scale: 1 
              }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              PERO ANTES<br/>REGISTREMOS TU VISITA
            </motion.h1>
         </div>
      )}

      {/* 2. EXPERIENCIA 3D */}
      {stage === 'experience' && (
        <motion.div 
          style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 1 }}
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 1 }} 
        >
          <Experience 
            selectedStickerId={selectedSticker} 
            stickerPhase={stickerPhase}
            setStickerPhase={setStickerPhase}
            pasteProgress={pasteProgress}
            onStickerFixed={onStickerFixed}
            zoomTarget={finalStickerPosition}
            onDeselect={handleDeselectSticker}
          />
        </motion.div>
      )}
      
      {/* --- SISTEMA DE HINTS CONTEXTUALES --- */}
      <AnimatePresence mode="wait"> 
        {/* CASO 1: FASE EXPLORACIÓN (Sin sticker seleccionado) */}
        {stage === 'experience' && !selectedSticker && showExplorationHint && (
          <motion.div 
            key="hint-explore"
            className="hint-overlay-container"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              animate={{ y: [0, -5, 0] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}
            >
              <p className="hint-label">SELECCIONA UN STICKER</p>
              <div className="arrow-icon">↓</div>
            </motion.div>
          </motion.div>
        )}

        {/* CASO 2: FASE HOVER (Sticker seleccionado, buscando lugar) */}
        {stage === 'experience' && selectedSticker && stickerPhase === 'hover' && (
          <motion.div 
            key="hint-hover"
            className="hint-overlay-container"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              animate={{ y: [0, -5, 0] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              style={{ display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', gap: '5px' }}
            >
               {/* Flecha hacia ARRIBA porque el StopSign está arriba */}
              <p className="hint-label">ELIGE UN LUGAR</p>
              <div className="arrow-icon">↑</div>
            </motion.div>
          </motion.div>
        )}

        {/* CASO 3: FASE ROTATING (Girando el sticker) */}
        {stage === 'experience' && stickerPhase === 'rotating' && (
          <motion.div 
            key="hint-rotate"
            className="hint-overlay-container"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
             {/* Icono de rotación girando infinitamente */}
             <motion.svg 
               viewBox="0 0 24 24" 
               className="rotate-icon-svg"
               animate={{ rotate: 360 }}
               transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
             >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
             </motion.svg>
             
             {/* Opcional: Texto pequeño debajo si quieres ser explícito, si no, bórralo */}
             <p className="hint-label" style={{ fontSize: '9px', padding: '4px 8px' }}>AJUSTA ROTACIÓN</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI FLOTANTE (Menú de Stickers existente) */}
      {stage === 'experience' && stickerPhase !== 'pasting' && stickerPhase !== 'completed' && (
         <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            // Delay de 0.5s para sincronizar con la entrada del 3D
            transition={{ delay: 2, duration: 0.8, ease: "easeOut" }} 
            style={{position: 'absolute', bottom: '2rem', width: '100%', zIndex: 100}}
         >
            <StickerMenu 
              selectedSticker={selectedSticker} 
              onSelect={(id) => {
                 setSelectedSticker(id);
                 setStickerPhase('hover'); 
              }} 
            />
         </motion.div>
      )}

      {/* B. GLOBAL DRAG */}
      {stage === 'experience' && stickerPhase === 'pasting' && (
         <GlobalPasteDrag 
            onProgress={setPasteProgress}
            onComplete={handlePasteComplete}
         />
      )}
      
      {/* MENSAJE "GRAX POR REGISTRAR" (Fase 2 final) */}
      {stickerPhase === 'completed' && !showFinalExit && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            style={{
                position: 'absolute', inset: 0, zIndex: 300,
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)',
                pointerEvents: 'none' 
            }}
        >
           <motion.h1 initial={{ y: 50, scale: 0.9 }} animate={{ y: 0, scale: 1 }} transition={{ delay: 0.8, type: "spring" }} style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontFamily: 'var(--font-title)', textAlign: 'center', color: 'white', maxWidth: '80%', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>Geni4l...</motion.h1>
        </motion.div>
      )}

      {/* --- FASE 3: TRANSICIÓN FINAL ABSTRACTA --- */}
      <AnimatePresence>
        {showFinalExit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }} // Fade lento a negro
            style={{
               position: 'fixed', inset: 0, zIndex: 9999,
               background: 'black',
               display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}
          >
             {/* TEXTO FINAL GLITCHY */}
             <motion.h1
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ delay: 0.5, duration: 1 }}
               style={{
                 fontSize: 'clamp(2rem, 5vw, 4rem)', 
                 fontFamily: 'var(--font-title)', 
                 textAlign: 'center',
                 color: 'white',
                 maxWidth: '90%',
                 letterSpacing: '2px'
               }}
             >
               Gr4ci4s p0r tu v1sita, extrañ@...
             </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Home;