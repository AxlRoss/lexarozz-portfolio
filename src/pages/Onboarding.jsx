import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, runTransaction, collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

import '../styles/Onboarding.scss';
import '../styles/Experience.scss'; 

import Experience from '../components/3d/Experience';
import StickerMenu from '../components/ui/StickerMenu';
import GlobalPasteDrag from '../components/ui/GlobalPasteDrag';

// ========================================================
// 🔥 PREPARACIÓN DE CURSORES NATIVOS (Traídos desde Home)
// ========================================================
const svgToUrl = (svgString) => {
  const encoded = encodeURIComponent(svgString);
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

const CURSOR_CLICK = svgToUrl(`
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 502.89 541.68">
    <path fill="#fff" stroke="#000" stroke-width="20" d="M489.35,223.83L34.6,2.43C26.29-1.62,16.39-.55,9.14,5.19,1.89,10.93-1.44,20.31.58,29.33l110.6,493.54c2.29,10.22,10.92,17.78,21.36,18.71.72.06,1.43.09,2.14.09,9.62,0,18.4-5.76,22.18-14.75l91.87-218.75,234.04-38.97c10.33-1.72,18.36-9.92,19.87-20.29,1.5-10.36-3.87-20.51-13.28-25.09Z"/>
  </svg>
`);

const Onboarding = () => {
  const navigate = useNavigate();
  
  const [view, setView] = useState('intro'); 
  const [count, setCount] = useState(5); 

  const [showFinalGlitch, setShowFinalGlitch] = useState(false);

  const [visitorNumber, setVisitorNumber] = useState('...'); 
  const currentThemeColor = '#00ff88';

  const [isHoldingSkip, setIsHoldingSkip] = useState(false);
  const [skipProgress, setSkipProgress] = useState(0);

  const [isHoldingS1, setIsHoldingS1] = useState(false);
  const [advanceProgress, setAdvanceProgress] = useState(0); 
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, pixelX: null, pixelY: null });

  // 🔥 AQUÍ ESTABA EL ERROR: Esta variable se había borrado accidentalmente
  const scrollTimeoutRef = useRef(null); 
  const isTransitioningRef = useRef(false);

  const [selectedSticker, setSelectedSticker] = useState(null);
  const [stickerPhase, setStickerPhase] = useState('hover'); 
  const [pasteProgress, setPasteProgress] = useState(0); 
  const [finalStickerPosition, setFinalStickerPosition] = useState(null);
  const [dataToSave, setDataToSave] = useState(null);
  const [showExplorationHint, setShowExplorationHint] = useState(false);
  const [showFinalExit, setShowFinalExit] = useState(false);
  
  const hasSavedRef = useRef(false);
  const hasIncrementedRef = useRef(false);

  useEffect(() => {
    localStorage.setItem('userThemeColor', currentThemeColor);
    const hasCompleted = localStorage.getItem('hasCompletedOnboarding');
    if (hasCompleted) navigate('/home', { replace: true });
  }, [navigate]);

  useEffect(() => {
    const fetchAndIncrementVisitor = async () => {
      if (hasIncrementedRef.current) return;
      const localNum = localStorage.getItem('visitorNumber');
      if (localNum) {
        setVisitorNumber(String(localNum).padStart(3, '0'));
        return;
      }
      hasIncrementedRef.current = true;
      try {
        const docRef = doc(db, "metadata", "stats");
        const newNum = await runTransaction(db, async (transaction) => {
          const sfDoc = await transaction.get(docRef);
          if (!sfDoc.exists()) {
            transaction.set(docRef, { visitorCount: 1 });
            return 1;
          }
          const newCount = sfDoc.data().visitorCount + 1;
          transaction.update(docRef, { visitorCount: newCount });
          return newCount;
        });
        const formattedNum = String(newNum).padStart(3, '0');
        setVisitorNumber(formattedNum);
        localStorage.setItem('visitorNumber', newNum);
      } catch (error) {
        console.error("Error contador:", error);
        setVisitorNumber('001'); 
      }
    };
    fetchAndIncrementVisitor();
  }, []);

 // 🔥 LÓGICA DE SALTAR INTRO (Pase Temporal)
  useEffect(() => {
    let interval;
    if (isHoldingSkip) {
      interval = setInterval(() => {
        setSkipProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            // 🔥 CAMBIO CRÍTICO: Ya NO guardamos en localStorage aquí.
            // En su lugar, mandamos un estado temporal "skipped: true" al router.
            navigate('/home', { state: { skipped: true } }); 
            return 100;
          }
          return prev + 1;
        });
      }, 20); 
    } else {
      setSkipProgress(0);
    }
    return () => clearInterval(interval);
  }, [isHoldingSkip, navigate]);

  // ==========================================
  // BLOQUEO DE REBOTE EN SCROLL
  // ==========================================
  useEffect(() => {
    const preventBounce = (e) => {
      if (view === 'intro' || view === 'countdown') {
        e.preventDefault(); 
      }
    };
    window.addEventListener('wheel', preventBounce, { passive: false });
    return () => window.removeEventListener('wheel', preventBounce);
  }, [view]);

  // Efecto Parallax (Ahora funciona en intro y en countdown)
  const handleMouseMove = (e) => {
    if (view !== 'intro' && view !== 'countdown') return;
    
    // Coordenadas normalizadas para el Parallax (-1 a 1)
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    
    // Guardamos ambas cosas: el parallax y la posición exacta en píxeles
    setMousePos({ x, y, pixelX: e.clientX, pixelY: e.clientY });
  };

  const triggerTransition = () => {
    if (!isTransitioningRef.current) {
      isTransitioningRef.current = true;
      setTimeout(() => {
        setView('countdown');
      }, 400);
    }
  };

  // 1. CLIC SOSTENIDO (HOLD)
  useEffect(() => {
    let interval;
    if (isHoldingS1 && view === 'intro' && !isTransitioningRef.current) {
      interval = setInterval(() => {
        setAdvanceProgress((prev) => {
          const next = prev + 1.5; 
          if (next >= 100) {
            clearInterval(interval);
            setIsHoldingS1(false);
            triggerTransition();
            return 100; 
          }
          return next;
        });
      }, 20); 
    }
    return () => clearInterval(interval);
  }, [isHoldingS1, view]);

  const handlePointerRelease = () => {
    if (!isTransitioningRef.current) {
      setIsHoldingS1(false);
      setAdvanceProgress(0); // Reseteo instantáneo al soltar
    }
  };

  // 2. LÓGICA DE SCROLL (Restaurada al reseteo instantáneo)
  const handleWheelAdvance = (e) => {
    if (view !== 'intro' || isHoldingS1 || isTransitioningRef.current) return; 

    if (e.deltaY > 0) {
      setAdvanceProgress((prev) => {
        const scrollFactor = 0.05; 
        const next = Math.min(prev + (e.deltaY * scrollFactor), 100);
        
        if (next >= 100) {
          isTransitioningRef.current = true;
          setTimeout(() => { setView('countdown'); }, 500);
          return 100;
        }
        return next;
      });

      // Si deja de hacer scroll por 250ms, el progreso regresa a 0
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        if (!isTransitioningRef.current) setAdvanceProgress(0);
      }, 250);
    }
  };

  // ==========================================
  // LÓGICA DE COUNTDOWN Y TRASLAPE GLITCH
  // ==========================================
  useEffect(() => {
    let timer;
    if (view === 'countdown') {
      if (count > 1) {
        timer = setTimeout(() => setCount((c) => c - 1), 800);
      } else if (count === 1) {
        timer = setTimeout(() => {
          setView('experience');
          setShowFinalGlitch(true);
        }, 800);
      }
    }
    return () => clearTimeout(timer);
  }, [view, count]);

  useEffect(() => {
    let timer;
    if (showFinalGlitch) {
      timer = setTimeout(() => {
        setShowFinalGlitch(false);
      }, 5000); 
    }
    return () => clearTimeout(timer);
  }, [showFinalGlitch]);

  // ==========================================

  useEffect(() => {
    if (view === 'experience') {
      const timer = setTimeout(() => { setShowExplorationHint(true); }, 7000); 
      return () => clearTimeout(timer);
    }
  }, [view]);

  const handleBack3D = () => {
    if (stickerPhase === 'pasting') {
      setStickerPhase('rotating');
    } else if (stickerPhase === 'rotating') {
      setStickerPhase('hover');
    } else if (stickerPhase === 'hover') {
      setSelectedSticker(null);
      setStickerPhase('hover');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => { 
        if (e.key === 'Escape' && view === 'experience' && selectedSticker) {
            handleBack3D();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, selectedSticker, stickerPhase]);

  const onStickerFixed = useCallback((worldPos, rotationArray, localPos) => {
    setFinalStickerPosition(worldPos);
    if (!hasSavedRef.current) {
      const payload = {
        stickerId: selectedSticker,
        position: [localPos.x, localPos.y, localPos.z],
        rotation: rotationArray,
        createdAt: new Date() 
      };
      setDataToSave(payload);
    }
  }, [selectedSticker]); 

  const handlePasteComplete = () => {
    const audio = new Audio('/sounds/stick.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log(e));
    
    if (selectedSticker) {
      localStorage.setItem('lastStickerId', selectedSticker);
      
      // 🔥 NUEVO: Guardamos la fecha exacta formateada (Ej: "15 de Marzo, 2026")
      const today = new Date();
      const formattedDate = today.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
      localStorage.setItem('registrationDate', formattedDate);
    }
    
    setStickerPhase('completed');
  };

  // 🔥 LÓGICA DE GUARDADO Y TRANSICIÓN FINAL REFINADA
  useEffect(() => {
    const saveDataAndTransition = async () => {
      if (stickerPhase === 'completed' && dataToSave && !hasSavedRef.current) {
        hasSavedRef.current = true;
        try {
          await addDoc(collection(db, "visits"), dataToSave);
          setDataToSave(null); 
        } catch (error) { console.error(error); }

        // 1. Damos 1.5 segundos para que el usuario vea su sticker pegado en el disco duro
        setTimeout(() => {
            setShowFinalExit(true); // 2. Lanzamos la pantalla final "MUCHAS GRACIAS"
            
            // 3. Esperamos 3.5 segundos en la pantalla final antes de ir al /home
            setTimeout(() => { 
                localStorage.setItem('hasCompletedOnboarding', 'true');
                navigate('/home'); 
            }, 3500);
        }, 1500);
      }
    };
    saveDataAndTransition();
  }, [stickerPhase, dataToSave, navigate]);

  const getInstructionText = () => {
    if (!selectedSticker) return { title: "EXPLORAR", sub: "ARRASTRA PARA GIRAR • SCROLL PARA ZOOM" };
    if (stickerPhase === 'hover') return { title: "UBICACIÓN", sub: "CLIC SOBRE EL DISCO PARA PEGAR" };
    if (stickerPhase === 'rotating') return { title: "ROTACIÓN", sub: "MUEVE EL MOUSE IZQ/DER PARA AJUSTAR • CLIC CUALQUIER LADO" };
    if (stickerPhase === 'pasting') return { title: "PEGADO", sub: "DESLIZA EL SLIDER PARA PEGAR" };
    if (stickerPhase === 'completed') return { title: "LISTO", sub: "STICKER COLOCADO" };
    return { title: "", sub: "" };
  };
  const instruction = getInstructionText();

  return (
    <div 
      className="onboarding-viewport" 
      style={{ 
        '--theme-color': currentThemeColor,
        '--cursor-normal': CURSOR_NORMAL,
        '--cursor-hover': CURSOR_HOVER,
        '--cursor-click': CURSOR_CLICK,
        /* 🔥 APLICAMOS EL CURSOR MÁGICO CONDICIONALMENTE */
        cursor: (view === 'intro' || view === 'countdown') ? CURSOR_NORMAL : 'default'
      }}
      onWheel={handleWheelAdvance}
      onMouseMove={handleMouseMove} 
    >
      <AnimatePresence mode="wait">
        
        {/* === VISTA 1: INTRODUCCIÓN === */}
        {view === 'intro' && (
          <motion.div 
            key="intro-view" 
            className="intro-view-container" 
            style={{ 
              '--advance-progress': advanceProgress,
              '--mouse-x': mousePos.x,
              '--mouse-y': mousePos.y 
            }} 
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)", transition: { duration: 0.6 } }}
            
            // 🔥 CAMBIO 3: Si hace clic o toca la pantalla, aseguramos que capture la posición exacta
            onPointerDown={(e) => {
              setIsHoldingS1(true);
              setMousePos(prev => ({ ...prev, pixelX: e.clientX, pixelY: e.clientY }));
            }}
            
            onPointerUp={handlePointerRelease}
            onPointerLeave={handlePointerRelease}
            onPointerCancel={handlePointerRelease} 
          >
            <div className="intro-grid-overlay" />

            <div className="intro-complexity-layer">
              <div className="tech-mark mark-1">+</div>
              <div className="tech-mark mark-2">+</div>
              <div className="tech-mark mark-3">[ DATA ]</div>
              <div className="tech-mark mark-4">//</div>
              <div className="tech-mark mark-center">+</div>
            </div>

            <div className="onboarding-text-wrapper">
              <div className="neon-dot" />
              <h1>• HOLA, UN GUSTO CONOCERTE •</h1>
              <h2>• ERES EL VISITANTE #{visitorNumber} •</h2>
            </div>
            
            <AnimatePresence>
              {advanceProgress > 0 && (
                <motion.div 
                  /* 🔥 EL FIX: Le decimos a Framer Motion que anime la escala, pero que JAMÁS suelte el centro (-50%) */
                  initial={{ opacity: 0, scale: 0.8, x: "-50%", y: "-50%" }} 
                  animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }} 
                  exit={{ opacity: 0, scale: 0.8, x: "-50%", y: "-50%" }} 
                  
                  className="slide1-hold-progress"
                  style={{
                    left: mousePos.pixelX !== null ? mousePos.pixelX : '50%',
                    top: mousePos.pixelY !== null ? mousePos.pixelY : '50%',
                  }}
                >
                  <svg width="100" height="100">
                    <circle 
                      cx="50" cy="50" r="45" 
                      fill="rgba(0,0,0,0.6)" 
                      stroke="var(--theme-color)" 
                      strokeWidth="2"
                    />
                    <motion.circle 
                      cx="50" cy="50" r="45" 
                      fill="transparent" 
                      stroke="var(--theme-color)" 
                      strokeWidth="3"
                      strokeDasharray="283"
                      animate={{ strokeDashoffset: 283 - (283 * advanceProgress) / 100 }}
                      transition={{ type: "tween", ease: "linear", duration: 0.05 }}
                    />
                  </svg>
                  <span>AVANZAR</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="scroll-down-indicator">
              <span>SCROLL O MANTÉN PRESIONADO PARA CONTINUAR</span>
              <div className="arrow">↓</div>
            </div>
          </motion.div>
        )}

        {/* === VISTA 2: COUNTDOWN ANIMADO Y COMPLEJO === */}
        {/* === VISTA 2: COUNTDOWN SIMPLIFICADO Y BRUTALISTA === */}
        {view === 'countdown' && (
          <motion.div 
            key="countdown-view" 
            className="countdown-container" 
            exit={{ opacity: 0 }}
            /* 🔥 Inyectamos el mouse para la gravedad cero y la interactividad */
            style={{ 
              '--mouse-x': mousePos.x,
              '--mouse-y': mousePos.y 
            }}
          >
            
            {/* Grid estática de fondo (Ahora también reacciona al mouse en el CSS) */}
            <div className="intro-grid-overlay countdown-grid" style={{ '--advance-progress': 100 }} />
            
            {/* Elementos Glitch de fondo */}
            <div className="intro-complexity-layer countdown-complexity" style={{ '--advance-progress': 100 }}>
              {count === 5 && <><div className="tech-mark mark-1">[ INIT ]</div><div className="tech-mark mark-2">+</div></>}
              {count === 4 && <><div className="tech-mark mark-3">SYNC_</div><div className="tech-mark mark-4">//</div></>}
              {count === 3 && <><div className="tech-mark mark-1">+</div><div className="tech-mark mark-center" style={{opacity: 0.3}}>[ SYSTEM ]</div></>}
              {count === 2 && <><div className="tech-mark mark-2">L0AD1NG</div><div className="tech-mark mark-4">+</div></>}
              {count === 1 && <><div className="tech-mark mark-3">//</div><div className="tech-mark mark-1">READY</div></>}
            </div>

            <motion.div
              initial={{ opacity: 0.7, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1.05 }} 
              transition={{ duration: 4.8, delay: 0.2, ease: "easeOut" }} 
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <h1 className="countdown-number">
                {count}
              </h1>
            </motion.div>
            
          </motion.div>
        )}
        

        {/* === VISTA 3: EXPERIENCE 3D + TRASLAPE GLITCH === */}
        {view === 'experience' && (
          <motion.div 
            key="experience-view"
            className="home-container" 
            style={{ position: 'absolute', inset: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }} 
          >
            
            <AnimatePresence>
              {showFinalGlitch && (
                <motion.div 
                  className="glitch-overlay"
                  style={{ zIndex: 2 }} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, filter: "blur(20px)", transition: { duration: 1.5, ease: "easeOut" } }}
                >
                  <motion.div 
                    className="tech-grid"
                    initial={{ scale: 0.9, rotateZ: 3 }}
                    animate={{ scale: 1.1, rotateZ: 0 }}
                    transition={{ duration: 7, ease: "linear" }}
                  />
                  <div className="tech-cross cross-1">+</div>
                  <div className="tech-cross cross-2">+</div>
                  <div className="tech-cross cross-3">[ RUN ]</div>
                  <div className="tech-cross cross-4">+</div>
                  <div className="tech-cross cross-5">//</div>
                  <div className="tech-cross cross-6">+</div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="background-giant-text" style={{ zIndex: 3 }}> 
               <motion.h1
                 initial={{ opacity: 0, scale: 0.85 }}
                 animate={{ opacity: (stickerPhase === 'pasting' || stickerPhase === 'completed') ? 0 : 1, scale: 1 }}
                 transition={{ duration: 3.2, delay: 0.2, ease: "easeInOut" }}
               >
                 PERO ANTES<br/>REGISTREMOS TU VISITA
               </motion.h1>
            </div>

            <div className="ui-overlay-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50 }}>
                {selectedSticker && stickerPhase !== 'completed' && (
                    <div className="esc-button-wrapper" style={{ pointerEvents: 'auto' }} onClick={handleBack3D}>
                        <div className="esc-key">ESC</div><div className="esc-label">REGRESAR</div>
                    </div>
                )}
                {stickerPhase !== 'completed' && (
                    <div className="bottom-instructions">
                        <motion.div key={selectedSticker ? stickerPhase : 'explore'} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                            <h3>{instruction.title}</h3><p>{instruction.sub}</p>
                        </motion.div>
                    </div>
                )}
            </div>

            <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 5 }}>
              <Experience 
                selectedStickerId={selectedSticker} 
                stickerPhase={stickerPhase}
                setStickerPhase={setStickerPhase}
                pasteProgress={pasteProgress}
                onStickerFixed={onStickerFixed}
                onDeselect={null} 
              />
            </div>
            
            <AnimatePresence mode="wait"> 
              {!selectedSticker && showExplorationHint && (
                <motion.div key="hint-explore" className="hint-overlay-container" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                    <p className="hint-label">SELECCIONA UN STICKER</p><div className="arrow-icon">↓</div>
                  </motion.div>
                </motion.div>
              )}
              {selectedSticker && stickerPhase === 'hover' && (
                <motion.div key="hint-hover" className="hint-overlay-container" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }} style={{ display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', gap: '5px' }}>
                    <p className="hint-label">ELIGE UN LUGAR</p><div className="arrow-icon">↑</div>
                  </motion.div>
                </motion.div>
              )}
              {stickerPhase === 'rotating' && (
                <motion.div key="hint-rotate" className="hint-overlay-container" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                   <motion.svg viewBox="0 0 24 24" className="rotate-icon-svg" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></motion.svg>
                   <p className="hint-label" style={{ fontSize: '9px', padding: '4px 8px' }}>AJUSTA ROTACIÓN</p>
                </motion.div>
              )}
            </AnimatePresence>

            {stickerPhase !== 'pasting' && stickerPhase !== 'completed' && (
              <motion.div 
                  initial={{ opacity: 0, y: 50 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 6, duration: 0.8 }} 
                  style={{position: 'absolute', bottom: '2rem', width: '100%', zIndex: 100}}
              >
                  <StickerMenu selectedSticker={selectedSticker} onSelect={(id) => { setSelectedSticker(id); setStickerPhase('hover'); }} />
              </motion.div>
            )}

            {stickerPhase === 'pasting' && (
               <GlobalPasteDrag onProgress={setPasteProgress} onComplete={handlePasteComplete} />
            )}
            
            {/* 🔥 PANTALLA DE DESPEDIDA ÉPICA (Se activa al terminar de pegar) */}
            <AnimatePresence>
              {showFinalExit && (
                <motion.div 
                  className="final-exit-overlay"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ duration: 1 }} 
                >
                  {/* El grid de fondo flotante (reutilizando el estilo sutil) */}
                  <motion.div 
                    className="final-grid"
                    initial={{ scale: 0.9, rotateZ: 3 }}
                    animate={{ scale: 1.1, rotateZ: 0 }}
                    transition={{ duration: 5, ease: "linear" }}
                  />

                  {/* El texto con Dithering y Glow */}
                  <motion.h1 
                    className="final-exit-text"
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    transition={{ delay: 0.5, duration: 1 }}
                  >
                    MUCHAS GRACIAS,<br/>UN GUSTO
                  </motion.h1>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTÓN SALTAR INTRO */}
      {view !== 'experience' && (
        <div 
          className="skip-btn-container"
          onPointerDown={(e) => { e.stopPropagation(); setIsHoldingSkip(true); }}
          onPointerUp={(e) => { e.stopPropagation(); setIsHoldingSkip(false); }}
          onPointerLeave={(e) => { e.stopPropagation(); setIsHoldingSkip(false); }}
        >
          <div className="skip-text">SALTAR<br />INTRO</div>
          <svg className="progress-ring" width="100" height="100">
            <circle cx="50" cy="50" r="45" style={{ strokeDashoffset: 283 - (283 * skipProgress) / 100 }} />
          </svg>
        </div>
      )}
    </div>
  );
};

export default Onboarding;