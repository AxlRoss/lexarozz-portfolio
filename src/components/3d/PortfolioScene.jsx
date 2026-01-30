import React from 'react';
import { useThree } from '@react-three/fiber';
import InteractiveCube from './InteractiveCube';

const PortfolioScene = () => {
  const { width } = useThree((state) => state.viewport);
  const isMobile = width < 4; 

  const cubes = [
    { pos: isMobile ? [0, 2, 0] : [-1.8, 0, 0], label: "AN1M4TI0N", link: "/animation", tex: "/mockups/video1.mp4" },
    { pos: isMobile ? [0, 0, 0] : [0, 0, 0], label: "D3S1GN", link: "/design", tex: "/mockups/gif2.jpg" },
    { pos: isMobile ? [0, -2, 0] : [1.8, 0, 0], label: "3D/2D VFX & CFX", link: "/VFX", tex: "/mockups/gif3.jpg" }
  ];

  return (
    <>
      {cubes.map((cube, i) => (
        <InteractiveCube 
          key={i}
          index={i} // 🔥 Pasamos el índice
          position={cube.pos}
          label={cube.label}
          link={cube.link}
          texturePath={cube.tex}
          scale={isMobile ? 0.6 : 0.75} 
        />
      ))}
    </>
  );
};

export default PortfolioScene;