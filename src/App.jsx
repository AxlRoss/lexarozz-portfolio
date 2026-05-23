import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Onboarding from './pages/Onboarding'; 
import Home from './pages/Home';
import Work from './pages/Work';
import Navbar from './components/ui/Navbar';
import Contact from './pages/Contact';
import ProjectDetail from './pages/ProjectDetail';
import Design from './pages/Design'; 
import Animation from './pages/Animation'; 

const AppContent = () => {
  const location = useLocation();
  const hideNavbarPaths = ['/']; 

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* 🔥 Eliminamos la etiqueta <GlobalCursor /> de aquí */}

      {!hideNavbarPaths.includes(location.pathname) && <Navbar />}
      
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/home" element={<Home />} />
        <Route path="/work" element={<Work />} />
        <Route path="/design" element={<Design />} />
        <Route path="/animation" element={<Animation />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/project/:slug" element={<ProjectDetail />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;