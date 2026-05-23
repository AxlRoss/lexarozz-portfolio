// =========================================================================
// 🔥 BASE DE DATOS LOCAL DEL PORTAFOLIO
// Aquí puedes editar, agregar o quitar proyectos cuando quieras.
// =========================================================================

export const ANIMATION_DATA = {
  heroProjects: [
    { 
      _id: "anim_hero_01", 
      title: "REPETITION", 
      slug: "repetition", // 🔥 NUEVO: Debe coincidir con el slug en Sanity
      role: "3D ANIMATION", 
      year: "2025", 
      videoUrl: "/videos/quantity.mp4"
    },
    { 
      _id: "anim_hero_02", 
      title: "CYRA", 
      slug: "cyra", // 🔥 NUEVO
      role: "MOTION GRAPHICS", 
      year: "2026", 
      videoUrl: "/videos/entropy.mp4"
    },
    { 
      _id: "anim_hero_03", 
      title: "MECHA_RIGGING", 
      slug: "mecha-rigging", // 🔥 NUEVO
      role: "CHARACTER ANIM", 
      year: "2024", 
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" 
    }
  ],
  
  archiveProjects: [
    { 
      _id: "anim_arch_01", 
      title: "CHARLY", 
      slug: "CHARLYMX-EDITS", // 🔥 NUEVO
      category: "MOTION", 
      year: "2023", 
      imgUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop" 
    },
    { 
      _id: "anim_arch_02", 
      title: "repetition", 
      slug: "repetition", // 🔥 NUEVO
      category: "CGI", 
      year: "2023", 
      imgUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop" 
    },
    { 
      _id: "anim_arch_03", 
      title: "HOLO_INTERFACE", 
      slug: "holo-interface", // 🔥 NUEVO
      category: "UI_ANIM", 
      year: "2022", 
      imgUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop" 
    },
    { 
      _id: "anim_arch_04", 
      title: "QUANTUM_SIM", 
      slug: "quantum-sim", // 🔥 NUEVO
      category: "SIMULATION", 
      year: "2024", 
      imgUrl: "https://images.unsplash.com/photo-1633412802994-5c058f151b66?q=80&w=800&auto=format&fit=crop" 
    }
  ]
};

// =========================================================================
// 🔥 PREPARAMOS LA DE VFX
// =========================================================================
export const VFX_DATA = {
  heroProjects: [
    { 
      _id: "vfx_hero_01", 
      title: "MATTE_PAINTING", 
      slug: "matte-painting", // 🔥 NUEVO
      role: "VFX COMPOSITING", 
      year: "2025", 
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" 
    },
  ],
  archiveProjects: [
    { 
      _id: "vfx_arch_01", 
      title: "GREEN_SCREEN", 
      slug: "green-screen", // 🔥 NUEVO
      category: "CHROMA", 
      year: "2023", 
      imgUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop" 
    }
  ]
};