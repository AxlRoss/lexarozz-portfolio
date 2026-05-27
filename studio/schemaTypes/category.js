export default {
  name: 'category',
  title: 'Categorías / Tags',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Nombre de la Categoría',
      type: 'string',
      description: 'El nombre exacto que aparecerá en tu portafolio (Ej: 3D ANIMATION, VFX, ART DIRECTION)',
      validation: Rule => Rule.required()
    }
  ]
}