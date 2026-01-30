// src/components/CircularTooltip.jsx
import React, { useState, useEffect, useRef } from 'react';
import './TooltipStyles.css'; // Importante: Asegúrate de importar el CSS aquí

const CircularTooltip = ({ mode = "pegado", mousePos }) => { // <--- OJO: Agregué mousePos aquí
  const IDLE_TIME = 7000;    
  const GRACE_TIME = 3000;   
  const RADIUS = 60;         
  
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const idleTimerRef = useRef(null);
  const graceTimerRef = useRef(null);
  const isGracePeriodActive = useRef(false);

  const baseText = mode === "pegado" ? "DESLIZAR PARA PEGAR " : "CLIC PARA FIJAR ";
  const circumference = 2 * Math.PI * RADIUS;
  const repeatCount = baseText.length < 15 ? 3 : 2; 
  const finalText = baseText.repeat(repeatCount).trim();

  useEffect(() => {
    const startIdleTimer = () => {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        setIsVisible(true);
        isGracePeriodActive.current = false; 
      }, IDLE_TIME);
    };

    const handleMouseMove = () => {
      if (!isVisible) {
        startIdleTimer();
      } 
      else if (isVisible && !isGracePeriodActive.current) {
        isGracePeriodActive.current = true;
        setIsFadingOut(true); 

        graceTimerRef.current = setTimeout(() => {
          setIsVisible(false);
          setIsFadingOut(false);
          isGracePeriodActive.current = false;
          startIdleTimer();
        }, GRACE_TIME);
      }
    };

    const handleClick = () => {
      setIsVisible(false);
      setIsFadingOut(false);
      isGracePeriodActive.current = false;
      clearTimeout(graceTimerRef.current);
      startIdleTimer();
    };

    startIdleTimer();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      clearTimeout(idleTimerRef.current);
      clearTimeout(graceTimerRef.current);
    };
  }, [isVisible]); 

  if (!isVisible && !isFadingOut) return null;

  // Actualización: Usamos la posición del mouse que entra por props
  const stylePosition = mousePos 
    ? { left: mousePos.x, top: mousePos.y } 
    : { left: '50%', top: '50%' };

  return (
    <div 
      className={`tooltip-container ${isFadingOut ? 'fade-out' : 'fade-in'}`}
      style={{ 
        position: 'fixed', 
        ...stylePosition, // Usamos la posición dinámica
        transform: 'translate(-50%, -50%)', // Para centrar el círculo en el puntero
        pointerEvents: 'none',
        zIndex: 9999
      }}
    >
      <svg width="200" height="200" viewBox="0 0 200 200" className="spinning-text">
        <defs>
          <path 
            id="circlePath" 
            d={`M 100, 100 m -${RADIUS}, 0 a ${RADIUS},${RADIUS} 0 1,1 ${RADIUS * 2},0 a ${RADIUS},${RADIUS} 0 1,1 -${RADIUS * 2},0`} 
          />
        </defs>

        <text dy="-5">
          <textPath 
            href="#circlePath" 
            startOffset="0%" 
            textLength={circumference} 
            lengthAdjust="spacing"    
            style={{
              fontSize: '14px',        
              fontWeight: 'bold',
              letterSpacing: '2px',    
              fill: 'white' // Cambia esto al color que quieras (ej: #000)
            }}
          >
            {finalText}
          </textPath>
        </text>
      </svg>
    </div>
  );
};

export default CircularTooltip;