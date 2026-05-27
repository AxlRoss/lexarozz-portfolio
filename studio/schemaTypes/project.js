export default {
  name: 'project',
  title: 'Proyectos',
  type: 'document',
  fields: [
    // ==========================================
    // --- 1. DATOS BÁSICOS ---
    // ==========================================
    {
      name: 'title',
      title: 'Título del Proyecto',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      description: 'Esto será el final de la URL (ej: /projects/sr-taco). Dale al botón Generate.',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'projectType',
      title: 'Tipo de Proyecto',
      type: 'string',
      description: 'Define dónde y cómo aparecerá este proyecto.',
      options: {
        list: [
          { title: 'Selected Work (Detallado, Estilo Behance)', value: 'selected' },
          { title: 'All Work (Simple, solo video/imagen)', value: 'all' },
        ],
        layout: 'radio' 
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'client',
      title: 'Cliente / Marca',
      type: 'string',
    },
    {
      name: 'year',
      title: 'Año (Para ordenamiento interno)',
      type: 'number',
      description: 'Escribe solo el número (Ej: 2024 o 2023). El sistema usará esto para ordenar los proyectos de más nuevos a más viejos.'
    },
    {
      name: 'displayDate',
      title: 'Fecha Visible (Texto libre)',
      type: 'string',
      description: 'Esto es lo que leerá el usuario. Ej: "MAYO 2024", "2023 - 2024" o "Q3 2023".'
    },
    {
      name: 'tags',
      title: 'Tags / Categorías',
      type: 'array',
      description: 'Añade categorías existentes o crea una nueva escribiendo y seleccionando "Create new..."',
      of: [
        {
          type: 'reference',
          to: [{ type: 'category' }] // 🔥 Esto conecta los proyectos con tu nuevo archivo
        }
      ]
    },
    {
      name: 'credits',
      title: 'Data / Créditos',
      type: 'text',
      rows: 3,
      description: 'Roles, agradecimientos, premios...'
    },

    // ==========================================
    // --- 2. MEDIA PRINCIPAL ---
    // ==========================================
    {
      name: 'mainImage',
      title: 'Imagen de Portada (Thumbnail)',
      type: 'image',
      description: 'La imagen obligatoria que sale en los grids del portafolio.',
      options: { hotspot: true }, 
      validation: Rule => Rule.required()
    },
    {
      name: 'nativeVideo',
      title: 'Video Principal Nativo (Opcional)',
      type: 'file',
      description: 'Sube un video MP4 directo a Sanity (Max recomendado 30MB) para reproducción nativa y rápida.',
      options: {
        accept: 'video/mp4,video/webm'
      }
    },
    {
      name: 'mainCarousel',
      title: 'Carrusel de Imágenes Principal (Opcional)',
      type: 'array',
      description: 'Si prefieres un carrusel de imágenes al inicio de la página en lugar/además de un video.',
      of: [{ type: 'image', options: { hotspot: true } }],
      options: { layout: 'grid' }
    },

    // ==========================================
    // --- 3. CONTENIDO ESTILO BEHANCE ---
    // ==========================================
    {
      name: 'content',
      title: 'Contenido del Proyecto (Storytelling)',
      type: 'array',
      description: 'Aquí armas tu proyecto. Agrega bloques de texto, imágenes, videos embed o carruseles.',
      of: [
        // A. Bloque de Texto Rico
        {
          type: 'block', 
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2 (Subtítulo)', value: 'h2'},
            {title: 'H3 (Pequeño)', value: 'h3'},
            {title: 'Quote', value: 'blockquote'},
          ]
        },
        // B. Bloque de Imagen Full
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'caption', type: 'string', title: 'Pie de foto (Opcional)' },
            { name: 'alt', type: 'string', title: 'Texto alternativo (Para SEO)' }
          ]
        },
        // C. Bloque de Video (Embed de YouTube/Vimeo)
        {
            title: 'Video Embed (YouTube/Vimeo)',
            name: 'videoEmbed',
            type: 'object',
            fields: [
                { name: 'url', type: 'url', title: 'URL del Video' },
                { name: 'caption', type: 'string', title: 'Descripción del video' }
            ]
        },
        // 🔥 D. NUEVO: Carrusel Integrado en el texto
        {
          title: 'Carrusel de Imágenes (Inline)',
          name: 'inlineCarousel',
          type: 'object',
          fields: [
            {
              name: 'images',
              title: 'Sube las imágenes de este carrusel',
              type: 'array',
              of: [{ type: 'image', options: { hotspot: true } }],
              options: { layout: 'grid' }
            }
          ]
        }
      ]
    }
  ]
}