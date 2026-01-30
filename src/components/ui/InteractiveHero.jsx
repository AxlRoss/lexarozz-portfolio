import React, { useEffect, useRef } from 'react';
import paper from 'paper';

const InteractiveHero = ({ scrollProgress = 0 }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const wordGroupRef = useRef(null);
  const scrollProgressRef = useRef(scrollProgress);
  const isIntroCompleteRef = useRef(false);

  // Refs para limpieza (Fix del bug de navegación)
  const toolRef = useRef(null);
  const globalListenersRef = useRef(null);

  // EFECTO 1: SINCRONIZAR SCROLL
  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
    if (isIntroCompleteRef.current && wordGroupRef.current) {
      wordGroupRef.current.fillColor = new paper.Color(1, 1, 1, scrollProgress);
    }
  }, [scrollProgress]);

  // EFECTO 2: INICIALIZACIÓN Y LÓGICA
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    const svgToUrl = (svgString) => {
      const encoded = encodeURIComponent(svgString);
      return `url("data:image/svg+xml;charset=utf-8,${encoded}") 0 0, auto`;
    };

    // --- CURSORES ---
    const CURSOR_NORMAL = svgToUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 502.89 541.68">
        <path fill="#000" stroke="#fff" stroke-width="20" d="M489.35,223.83L34.6,2.43C26.29-1.62,16.39-.55,9.14,5.19,1.89,10.93-1.44,20.31.58,29.33l110.6,493.54c2.29,10.22,10.92,17.78,21.36,18.71.72.06,1.43.09,2.14.09,9.62,0,18.4-5.76,22.18-14.75l91.87-218.75,234.04-38.97c10.33-1.72,18.36-9.92,19.87-20.29,1.5-10.36-3.87-20.51-13.28-25.09Z"/>
      </svg>
    `);

    const CURSOR_HOVER = svgToUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="34" viewBox="0 0 502.89 541.68">
        <defs><style>.cls-1 { fill: none; stroke: #fff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 30px; }</style></defs>
        <path class="cls-1" d="M489.35,223.83L34.6,2.43C26.29-1.62,16.39-.55,9.14,5.19,1.89,10.93-1.44,20.31.58,29.33l110.6,493.54c2.29,10.22,10.92,17.78,21.36,18.71.72.06,1.43.09,2.14.09,9.62,0,18.4-5.76,22.18-14.75l91.87-218.75,234.04-38.97c10.33-1.72,18.36-9.92,19.87-20.29,1.5-10.36-3.87-20.51-13.28-25.09Z"/>
        <line class="cls-1" x1="293.34" y1="360.27" x2="478.11" y2="360.27"/>
        <line class="cls-1" x1="293.34" y1="423.4" x2="478.11" y2="423.4"/>
        <line class="cls-1" x1="293.34" y1="486.52" x2="478.11" y2="486.52"/>
      </svg>
    `);

    const CURSOR_DRAG = svgToUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 502.89 541.68">
        <defs><style>.cls-1 { fill: #fff; }</style></defs>
        <path class="cls-1" d="M489.35,223.83L34.6,2.43C26.29-1.62,16.39-.55,9.14,5.19,1.89,10.93-1.44,20.31.58,29.33l110.6,493.54c2.29,10.22,10.92,17.78,21.36,18.71.72.06,1.43.09,2.14.09,9.62,0,18.4-5.76,22.18-14.75l91.87-218.75,234.04-38.97c10.33-1.72,18.36-9.92,19.87-20.29,1.5-10.36-3.87-20.51-13.28-25.09Z"/>
      </svg>
    `);

    // --- DELAY DE SEGURIDAD ---
    const timer = setTimeout(() => {
      // 1. SETUP
      paper.setup(canvas);
      canvas.style.cursor = CURSOR_NORMAL;
      
      const mainLayer = new paper.Layer({ name: 'vectors' });
      const uiLayer = new paper.Layer({ name: 'ui' }); 

      const pathsData = [
        "M0,161.03V1.82h56.4c11.22,0,21.72,1.59,31.5,4.78,9.78,3.18,18.61,7.89,26.5,14.1,7.88,6.22,14.1,14.52,18.65,24.9,4.55,10.39,6.82,22.33,6.82,35.82s-2.27,25.44-6.82,35.82c-4.55,10.39-10.77,18.69-18.65,24.9-7.89,6.22-16.72,10.92-26.5,14.1-9.78,3.18-20.28,4.78-31.5,4.78H0ZM40.48,126.46h11.14c6.37,0,12.24-.76,17.63-2.27,5.38-1.51,10.38-3.9,15.01-7.16,4.62-3.26,8.26-7.92,10.92-13.99,2.65-6.06,3.98-13.27,3.98-21.61s-1.33-15.54-3.98-21.61c-2.65-6.06-6.29-10.72-10.92-13.99-4.63-3.26-9.63-5.65-15.01-7.16-5.38-1.51-11.26-2.27-17.63-2.27h-11.14v90.07Z",
        "M160.57,161.03V1.82h112.13v34.57h-71.64v26.38h56.4v34.57h-56.4v29.11h74.14v34.57h-114.63Z",
        "M392.33,149.31c-10.92,9.02-25.55,13.53-43.9,13.53s-33.17-5.15-44.46-15.47c-11.3-10.31-17.25-24.03-17.85-41.17h38.66c.46,6.67,2.8,12.02,7.05,16.03,4.24,4.02,9.78,6.03,16.6,6.03,6.06,0,10.88-1.33,14.44-3.98,3.56-2.65,5.35-6.18,5.35-10.58,0-3.64-1.44-6.56-4.32-8.76-2.88-2.2-6.6-3.9-11.14-5.12-4.55-1.21-9.63-2.35-15.24-3.41-5.61-1.06-11.18-2.65-16.72-4.78-5.54-2.12-10.58-4.85-15.12-8.19-4.55-3.33-8.27-8.15-11.14-14.44-2.88-6.29-4.32-13.83-4.32-22.63,0-13.49,5.23-24.6,15.69-33.32,10.46-8.72,23.8-13.08,40.03-13.08,17.74,0,32.03,4.66,42.87,13.99,10.84,9.33,16.34,21.8,16.49,37.41h-38.21c-.46-5.15-2.54-9.25-6.25-12.28-3.72-3.03-8.68-4.55-14.9-4.55-5,0-9.02,1.1-12.05,3.3-3.03,2.2-4.55,5.04-4.55,8.53,0,4.55,1.97,8.15,5.91,10.8,3.94,2.65,8.83,4.43,14.67,5.34,5.84.91,12.2,2.31,19.11,4.21,6.9,1.9,13.27,4.21,19.1,6.94,5.84,2.73,10.73,7.47,14.67,14.22,3.94,6.75,5.91,15.12,5.91,25.13,0,15.16-5.46,27.26-16.38,36.28Z",
        "M427.12,161.03V1.82h40.71v159.21h-40.71Z",
        "M567.68,162.85c-21.99,0-40.68-7.13-56.06-21.38-15.39-14.25-23.08-34.27-23.08-60.04,0-17.43,3.94-32.45,11.83-45.03,7.88-12.58,17.93-21.8,30.14-27.63,12.2-5.83,25.74-8.76,40.6-8.76,20.62,0,37.53,5.54,50.72,16.6,13.19,11.07,20.16,25.47,20.92,43.21h-39.57c-1.06-7.88-4.44-14.06-10.12-18.54-5.69-4.47-13.16-6.71-22.4-6.71-12.59,0-23.05,4.25-31.39,12.74-8.34,8.49-12.51,19.87-12.51,34.12s4.17,26.19,12.51,35.37c8.34,9.18,18.57,13.76,30.7,13.76,8.34,0,16.22-2.76,23.65-8.3,7.43-5.53,11.14-11.18,11.14-16.94,0-2.73-1.22-4.09-3.64-4.09h-28.43v-29.57h44.81c7.58,0,13.61,2.54,18.08,7.62,4.47,5.08,6.71,10.88,6.71,17.4v64.36h-35.48v-22.97c-2.27,7.43-6.98,13.42-14.1,17.97-7.13,4.55-15.47,6.82-25.02,6.82Z",
        "M666.62,161.03V1.82h42.53l56.18,95.07V1.82h40.48v159.21h-42.53l-56.18-95.07v95.07h-40.48Z"
      ];

      mainLayer.activate(); 
      
      const wordGroup = new paper.Group();
      wordGroupRef.current = wordGroup;

      const COLOR_DARK = new paper.Color('#333333');
      const COLOR_BLUE = new paper.Color('#007AFF');
      const COLOR_BLACK = new paper.Color('#000000');
      const COLOR_WHITE = new paper.Color('#FFFFFF');
      const COLOR_NEON = new paper.Color('#00ff88');

      pathsData.forEach((d) => {
        const path = new paper.CompoundPath(d);
        path.strokeColor = COLOR_DARK;
        path.strokeWidth = 2;
        path.fillColor = null; 
        wordGroup.addChild(path);
      });

      // --- ANIMACIÓN DE INTRO ---
      let startTime = null;
      const animationDuration = 2.0; 
      
      wordGroup.onFrame = (event) => {
        if (!startTime) startTime = event.time;
        const elapsed = event.time - startTime;
        const t = Math.min(elapsed / animationDuration, 1);
        const introOpacity = 1 - t;
        const scrollOpacity = scrollProgressRef.current;
        const finalOpacity = Math.max(introOpacity, scrollOpacity);
        
        wordGroup.fillColor = new paper.Color(1, 1, 1, finalOpacity);

        if (t >= 1) {
          wordGroup.onFrame = null;
          isIntroCompleteRef.current = true;
        }
      };

      // 3. HANDLES
      let handles = [];

      const createHandles = () => {
        uiLayer.activate();
        uiLayer.removeChildren(); 
        handles = [];

        const addHandlesForPath = (item) => {
            if (item.children) {
                item.children.forEach(child => addHandlesForPath(child));
            } else {
                item.segments.forEach((segment) => {
                    const handle = new paper.Path.Circle({
                        center: segment.point,
                        radius: 3.5,
                        fillColor: COLOR_BLACK, 
                        strokeColor: COLOR_BLUE, 
                        strokeWidth: 1.5
                    });
                    handle.data = { isHandle: true, segment: segment };
                    handles.push(handle);
                });
            }
        };

        wordGroup.children.forEach((item) => {
            addHandlesForPath(item);
        });
        
        mainLayer.activate(); 
      };

      // 4. LAYOUT
      const performLayout = () => {
        const { width, height } = container.getBoundingClientRect();
        if (width === 0 || height === 0) return;

        paper.view.viewSize = new paper.Size(width, height);
        wordGroup.matrix = new paper.Matrix();
        const scaleFactor = (width * 0.85) / wordGroup.bounds.width;
        wordGroup.scale(scaleFactor);
        wordGroup.position = paper.view.center;
        createHandles();
        paper.view.draw();
      };

      performLayout();

      // 5. INTERACCIÓN
      const tool = new paper.Tool();
      toolRef.current = tool; // 🔥 Guardamos referencia para limpiar después

      let draggedHandle = null;

      const releaseDrag = () => {
        if (draggedHandle) {
          try {
            draggedHandle.fillColor = COLOR_BLACK;
            draggedHandle.strokeColor = COLOR_BLUE;
            if (draggedHandle.data.segment) {
              draggedHandle.data.segment.path.strokeColor = COLOR_DARK;
            }
          } catch (e) {
            console.error("Error cleaning handle:", e);
          }
          draggedHandle = null;
          canvas.style.cursor = CURSOR_NORMAL;
        }
      };

      tool.onMouseMove = (event) => {
        if (draggedHandle && event.event.buttons === 0) {
            releaseDrag();
            return;
        }
        const hit = uiLayer.hitTest(event.point, {
          fill: true, stroke: true, tolerance: 8
        });

        if (hit && hit.item && hit.item.data.isHandle) {
          canvas.style.cursor = CURSOR_HOVER; 
          hit.item.fillColor = COLOR_WHITE; 
          hit.item.strokeColor = COLOR_WHITE;
        } else {
          canvas.style.cursor = CURSOR_NORMAL; 
          handles.forEach(h => {
             if (h !== draggedHandle) {
                 h.fillColor = COLOR_BLACK;
                 h.strokeColor = COLOR_BLUE;
             }
          });
        }
      };

      tool.onMouseDown = (event) => {
        const hit = uiLayer.hitTest(event.point, {
          fill: true, stroke: true, tolerance: 8
        });
        if (hit && hit.item && hit.item.data.isHandle) {
          draggedHandle = hit.item;
          draggedHandle.fillColor = COLOR_NEON; 
          draggedHandle.strokeColor = COLOR_NEON;
          canvas.style.cursor = CURSOR_DRAG; 
        }
      };

      tool.onMouseDrag = (event) => {
        if (draggedHandle) {
          canvas.style.cursor = CURSOR_DRAG; 
          draggedHandle.position = draggedHandle.position.add(event.delta);
          const segment = draggedHandle.data.segment;
          segment.point = draggedHandle.position;
          segment.path.strokeColor = COLOR_NEON;
        }
      };

      tool.onMouseUp = releaseDrag;

      // Listeners Globales
      window.addEventListener('mouseup', releaseDrag);
      window.addEventListener('mouseleave', releaseDrag);

      // Guardamos la función de limpieza de listeners para usarla en el return
      globalListenersRef.current = () => {
          window.removeEventListener('mouseup', releaseDrag);
          window.removeEventListener('mouseleave', releaseDrag);
      };

      paper.view.onResize = () => {
        performLayout();
      };

    }, 300); 

    // --- CLEANUP ROBUSTO (FIX DE NAVEGACIÓN) ---
    return () => {
      clearTimeout(timer);
      
      // 1. Limpiar Listeners Globales
      if (globalListenersRef.current) {
        globalListenersRef.current();
      }

      // 2. 🔥 ELIMINAR LA HERRAMIENTA (CRÍTICO)
      if (toolRef.current) {
        toolRef.current.remove();
      }

      // 3. Eliminar el proyecto completo
      if (paper.project) {
        paper.project.remove();
      }
    };
  }, []);

  return (
    <div className="interactive-hero-wrapper" ref={containerRef}>
      <canvas ref={canvasRef} className="vector-canvas" />
      
      <div className="ui-overlay">
        <div className="top-bar">
          <p className="hint-text">// ARRASTRA LOS PUNTOS DE ANCLA</p>
        </div>

        <div className="bottom-info">
          <div className="manifesto-mini">
            <p className="main-text">"DISEÑA ROMPIENDO LAS REGLAS"</p>
            <p className="sub-text">Porque </p>
          </div>
        </div>

        {/* Scroll Hint */}
        <div className="scroll-indicator">
          <span className="scroll-text">SCROLL TO SEE MORE</span>
          <div className="scroll-line"></div>
        </div>

      </div>
    </div>
  );
};

export default InteractiveHero;