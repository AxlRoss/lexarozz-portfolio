import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, Center } from '@react-three/drei';
import { AnimatePresence } from 'framer-motion';
import ContactNapkin from '../components/3d/ContactNapkin';
import ContactForm from '../components/ui/ContactForm'; // El nuevo popup
import '../styles/Contact.scss';

const Contact = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Función con log para verificar que el clic funciona
  const handleOpen = () => {
    console.log("Abriendo formulario..."); // Si ves esto en consola, el clic está bien
    setIsFormOpen(true);
  };

  return (
    <div className="contact-page-container relative w-full h-screen overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 35 }} shadows>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
        <Environment preset="city" />

        <Suspense fallback={null}>
          <Center>
            <ContactNapkin onOpenForm={handleOpen} />
          </Center>
        </Suspense>

        <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
      </Canvas>

      {/* PopUp del Formulario */}
      <AnimatePresence>
        {isFormOpen && (
          <ContactForm onClose={() => setIsFormOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contact;