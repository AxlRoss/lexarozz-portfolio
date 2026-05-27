// Importamos el archivo que acabamos de crear
import project from './project'
import category from './category' // 🔥 1. Importamos el nuevo archivo

export const schemaTypes = [
  // Lo agregamos a la lista
  project,
  category
]