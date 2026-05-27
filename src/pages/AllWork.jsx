import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom'; // 🔥 1. Agregamos useLocation
import { client, urlFor } from '../sanity';
import '../styles/AllWork.scss';
import BrutalistFooter from '../components/ui/BrutalistFooter';

const AllWork = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 🔥 2. Activamos el lector de URL

  // ==========================================
  // 🔥 ESTADOS DE LA BASE DE DATOS Y UI
  // ==========================================
  const [projects, setProjects] = useState([]); 
  const [filteredProjects, setFilteredProjects] = useState([]); 
  const [availableTags, setAvailableTags] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  // ==========================================
  // 🔥 LECTURA INICIAL DE LA URL
  // ==========================================
  // Extraemos lo que venga en "?search=..." de la URL. Si no hay nada, usamos ""
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') || "";

  // 🔥 ESTADOS DE FILTROS (Iniciamos searchTerm con lo que leímos de la URL)
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeTag, setActiveTag] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("NEWEST"); 

  // ==========================================
  // 🔥 1. FETCH DE TODOS LOS PROYECTOS
  // ==========================================
  useEffect(() => {
    const query = `*[defined(slug.current)]{
      _id,
      title,
      "slug": slug.current,
      mainImage,
      year,
      "tags": tags[]->title
    }`;

    client.fetch(query)
      .then((data) => {
        setProjects(data);
        setFilteredProjects(data);
        
        const allTags = data.flatMap(project => project.tags || []);
        const uniqueTags = ["ALL", ...new Set(allTags)];
        setAvailableTags(uniqueTags);
        
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching all projects:", err);
        setIsLoading(false);
      });
      
      window.scrollTo(0, 0); 
  }, []);

  // ==========================================
  // 🔥 2. LÓGICA DE FILTRADO (El motor de búsqueda)
  // ==========================================
  useEffect(() => {
    let result = [...projects];

    // A. Filtro por Búsqueda de Texto
    if (searchTerm) {
      result = result.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // B. Filtro por Etiqueta (Tag)
    if (activeTag !== "ALL") {
      result = result.filter(p => p.tags && p.tags.includes(activeTag));
    }

    // C. Ordenamiento por Año
    result.sort((a, b) => {
      const yearA = parseInt(a.year) || 0;
      const yearB = parseInt(b.year) || 0;
      return sortOrder === "NEWEST" ? yearB - yearA : yearA - yearB;
    });

    setFilteredProjects(result);
  }, [searchTerm, activeTag, sortOrder, projects]);

  return (
    <div className="all-work-page">
      
      <div className="directory-header">
        <div className="title-wrapper">
          <h1>[ ALL MY WORK ]</h1>
          <p>Todxs mis proyectos // {filteredProjects.length} REGISTROS ENCONTRADOS</p>
        </div>

        {/* ==========================================
            🔥 PANEL DE CONTROL / FILTROS
        ========================================== */}
        <div className="control-panel">
          
          {/* BARRA DE BÚSQUEDA */}
          <div className="search-bar">
            <span className="prompt">{`>`}</span>
            <input 
              type="text" 
              placeholder="SEARCH_PROJECT..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-btn" onClick={() => setSearchTerm("")}>[X]</button>
            )}
          </div>

          {/* TOGGLES DE ETIQUETAS */}
          <div className="tags-container">
            {availableTags.map(tag => (
              <button 
                key={tag} 
                className={`tag-btn ${activeTag === tag ? 'active' : ''}`}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* ORDENAR POR FECHA */}
          <div className="sort-container">
            <span className="sort-label">SORT_BY:</span>
            <button 
              className="sort-btn"
              onClick={() => setSortOrder(sortOrder === "NEWEST" ? "OLDEST" : "NEWEST")}
            >
              [{sortOrder}]
            </button>
          </div>

        </div>
      </div>

      {/* ==========================================
          🔥 EL GRID MAESTRO DE PROYECTOS
      ========================================== */}
      <div className="master-grid-container">
        {isLoading ? (
          <div className="loading-state">
            <span className="blinking">ESTABLECIENDO CONEXIÓN CON SANITY...</span>
          </div>
        ) : (
          <motion.div layout className="master-grid">
            <AnimatePresence>
              {filteredProjects.map((proj) => (
                <motion.div 
                  key={proj._id} 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="grid-item"
                  onClick={() => navigate(`/project/${proj.slug}`)}
                >
                  <div className="grid-image-wrapper">
                    {proj.mainImage ? (
                      <img src={urlFor(proj.mainImage).width(800).url()} alt={proj.title} />
                    ) : (
                      <div className="placeholder-img">NO MEDIA</div>
                    )}
                    <div className="dither-mask"></div>
                  </div>
                  <div className="grid-info">
                    <h3>{proj.title}</h3>
                    <span className="grid-meta">
                      [{(proj.tags && proj.tags[0]) || 'UNTAGGED'} // {proj.year || 'N/A'}]
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredProjects.length === 0 && (
              <div className="no-results">
                <p>_NO SE ENCONTRARON COINCIDENCIAS.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ==========================================
          🔥 FOOTER GLOBAL
      ========================================== */}
      <BrutalistFooter />

    </div>
  );
};

export default AllWork;