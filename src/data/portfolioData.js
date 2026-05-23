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
      year: "2024", 
      videoUrl: "/videos/quantity.mp4"
    },
    { 
      _id: "anim_hero_02", 
      title: "CYRA", 
      slug: "cyra", // 🔥 NUEVO
      role: "UE5 ANIMATION", 
      year: "2023", 
      videoUrl: "/videos/entropy.mp4"
    },
    { 
      _id: "anim_hero_03", 
      title: "PROXIMAMENTE...", 
      slug: "prox", // 🔥 NUEVO
      role: "CHARACTER ANIM", 
      year: "2024", 
      videoUrl: "/videos/entropy.mp4" 
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
      title: "CYRA", 
      slug: "cyra", // 🔥 NUEVO
      category: "UE5 ANIMATION", 
      year: "2023", 
      imgUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop" 
    },
    { 
      _id: "anim_arch_04", 
      title: "HUGHENEST", 
      slug: "hughesnet-2d", // 🔥 NUEVO
      category: "2D ANIMATION", 
      year: "2023", 
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

// =========================================================================
// 🔥 PREPARAMOS LA DE VIDEO (/video)
// =========================================================================
export const VIDEO_DATA = {
  // El video principal que corre de fondo en el Splash
  heroVideoUrl: "/videos/entropy.mp4", 
  
  // Aquí pones los slugs de los proyectos de Sanity que sean de Motion, Video Edit, etc.
  selectedWork: [
    { 
      _id: "vid_sw_01", 
      title: "NIKE AIR", 
      slug: "nike-air-motion", // Cambia por tu slug real de Sanity
      category: "MOTION GRAPHICS", 
      year: "2024", 
      imgUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop" 
    },
    { 
      _id: "vid_sw_02", 
      title: "PROMPT ENGINEERING", 
      slug: "ai-prompting-reel", // Cambia por tu slug real
      category: "AI PROMPTING", 
      year: "2025", 
      imgUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop" 
    },
    { 
      _id: "vid_sw_03", 
      title: "MUSIC FESTIVAL", 
      slug: "festival-edit", // Cambia por tu slug real
      category: "VIDEO EDIT", 
      year: "2023", 
      imgUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop" 
    }
  ],

  // Las marcas para el carrusel (Solo cambia la ruta por tus logos en public/logos/)
  brands: [
    { id: 1, name: "NIKE", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg" },
    { id: 2, name: "ADIDAS", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg" },
    { id: 3, name: "APPLE", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
    { id: 4, name: "SONY", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg" },
    { id: 5, name: "RED BULL", logoUrl: "https://upload.wikimedia.org/wikipedia/en/f/f5/RedBull_Energy_Drink_logo.svg" }
  ]
};