import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url'

export const client = createClient({
  projectId: 'f7870k5h', // ⚠️ Asegúrate de que siga tu ID aquí
  dataset: 'production',
  useCdn: true, 
  apiVersion: '2023-05-03', 
});

// Corrección: Usamos la función constructora correctamente
const builder = createImageUrlBuilder(client);

export const urlFor = (source) => {
  return builder.image(source);
}