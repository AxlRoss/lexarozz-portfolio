import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Work from './pages/Work';
import Navbar from './components/ui/Navbar';
import Contact from './pages/Contact';
import ProjectDetail from './pages/ProjectDetail';
import Design from './pages/Design'; // La nueva página que crearemos

const AppContent = () => {
  const location = useLocation();
  const hideNavbarPaths = ['/'];

  return (
    <div className="min-h-screen bg-black text-white">
      {!hideNavbarPaths.includes(location.pathname) && <Navbar />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/work" element={<Work />} />
        <Route path="/design" element={<Design />} /> {/* 👈 Agregamos Diseño */}
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