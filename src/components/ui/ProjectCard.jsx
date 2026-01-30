import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // 👈 1. Importar useNavigate
import { urlFor } from '../../sanity'; 
import '../../styles/ProjectCard.scss'; // 👈 Importamos los estilos nuevos

const ProjectCard = ({ project }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { title, client, year, mainImage, hoverVideo, slug } = project;

  const handleClick = () => {
    if (slug?.current) {
      navigate(`/project/${slug.current}`);
    }
  };

  return (
    <motion.div 
      className="project-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="card-media-wrapper">
        {hoverVideo && (
          <video src={hoverVideo.asset.url} autoPlay loop muted playsInline className="card-video" />
        )}

        {/* 🔥 PROTECCIÓN: Solo renderiza la imagen si mainImage existe */}
        {mainImage ? (
          <img 
            src={urlFor(mainImage).width(800).height(450).url()} 
            alt={title}
            className={`card-image ${hoverVideo && isHovered ? 'hidden' : ''}`}
          />
        ) : (
          <div className="card-image-placeholder bg-zinc-800 w-full h-full" />
        )}
      </div>

      <div className="card-overlay">
        <div className="card-info">
          <div className="card-meta">
            {client} — {year}
          </div>
          <h3 className="card-title">{title}</h3>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;