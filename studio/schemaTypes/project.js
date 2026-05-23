export default {
  name: 'project',
  title: 'Proyectos',
  type: 'document',
  fields: [
    // --- DATOS BÁSICOS ---
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
        layout: 'radio' // Aparecerán como botones de opción
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
      title: 'Año',
      type: 'number',
    },
    {
      name: 'tags',
      title: 'Tags / Categorías',
      type: 'array',
      description: 'Importante para los filtros (Animation, VFX, Design...)',
      of: [{ type: 'string' }],
      // 🔥 AQUÍ ACTUALIZAMOS TU LISTA EXACTA DE ETIQUETAS
      options: {
        list: [
          { title: '3D ANIMATION', value: '3D ANIMATION' },
          { title: '2D ANIMATION', value: '2D ANIMATION' },
          { title: 'VFX', value: 'VFX' },
          { title: 'CFX', value: 'CFX' },
          { title: 'Design', value: 'Design' },
          { title: 'Social Media', value: 'Social Media' },
          { title: 'Motion Graphics', value: 'Motion Graphics' },
          { title: 'Art direction', value: 'Art direction' },
          { title: 'Director', value: 'Director' },
          { title: 'AI prompting', value: 'AI prompting' },
        ]
      }
    },
    {
      name: 'credits',
      title: 'Créditos',
      type: 'text',
      rows: 3,
      description: 'Nombres, roles, agradecimientos...'
    },

    // --- MEDIA PRINCIPAL (Para la Card y el Hover) ---
    {
      name: 'mainImage',
      title: 'Imagen de Portada (Thumbnail)',
      type: 'image',
      options: { hotspot: true }, // Permite elegir qué parte de la foto recortar
      validation: Rule => Rule.required()
    },
    {
      name: 'hoverVideo',
      title: 'Video Hover (Loop)',
      type: 'file',
      description: 'Sube un video corto (MP4/WebM) que se reproducirá al pasar el mouse por encima.',
    },

    // --- CONTENIDO ESTILO BEHANCE ---
    {
      name: 'content',
      title: 'Contenido del Proyecto (Storytelling)',
      type: 'array',
      description: 'Aquí armas tu proyecto. Agrega bloques de texto, imágenes o videos en el orden que quieras.',
      of: [
        // 1. Bloque de Texto Rico
        {
          type: 'block', 
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2 (Subtítulo)', value: 'h2'},
            {title: 'H3 (Pequeño)', value: 'h3'},
            {title: 'Quote', value: 'blockquote'},
          ]
        },
        // 2. Bloque de Imagen Full
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'caption',
              type: 'string',
              title: 'Pie de foto (Opcional)',
            },
            {
              name: 'alt',
              type: 'string',
              title: 'Texto alternativo (Para SEO)',
            }
          ]
        },
        // 3. Bloque de Video (Embed de YouTube/Vimeo)
        {
            title: 'Video Embed (YouTube/Vimeo)',
            name: 'videoEmbed',
            type: 'object',
            fields: [
                {
                    name: 'url',
                    type: 'url',
                    title: 'URL del Video'
                },
                {
                    name: 'caption',
                    type: 'string',
                    title: 'Descripción del video'
                }
            ]
        }
      ]
    }
  ]
}