import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { client, urlFor } from '../sanity';
import { PortableText } from '@portabletext/react';
import { motion } from 'framer-motion';
import '../styles/ProjectDetail.scss';

const ProjectDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const portableTextComponents = {
    types: {
      image: ({ value }) => (
        <div className="block-image-wrapper">
          <img src={urlFor(value).width(1400).url()} alt={value.alt || ''} />
          {value.caption && <p className="block-caption">{value.caption}</p>}
        </div>
      ),
      videoEmbed: ({ value }) => (
        <div className="block-video-wrapper">
          <iframe 
            src={value.url.replace("watch?v=", "embed/")} 
            title="Project Video" 
            allowFullScreen
          />
        </div>
      ),
    },
    block: {
      h2: ({children}) => <h2 className="block-h2">{children}</h2>,
      h3: ({children}) => <h3 className="block-h3">{children}</h3>,
      normal: ({children}) => <p className="block-p">{children}</p>,
      blockquote: ({children}) => <blockquote className="block-quote">{children}</blockquote>,
    }
  };

  useEffect(() => {
    const query = `*[slug.current == "${slug}"][0]{
      title, client, year, tags, credits, mainImage, content
    }`;
    client.fetch(query).then((data) => {
      setProject(data);
      setLoading(false);
    }).catch(console.error);
    window.scrollTo(0, 0); // Reset scroll al entrar
  }, [slug]);

  if (loading) return <div className="detail-loading"><span>Estableciendo conexión...</span></div>;
  if (!project) return <div className="detail-error">Error: Data no encontrada.</div>;

  return (
    <motion.div 
      className="project-detail-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="detail-container">
        {/* HEADER DE NAVEGACIÓN INTEGRADO */}
        <nav className="internal-nav">
          <button onClick={() => navigate(-1)} className="back-btn-modern">
            <span className="dot-blink"></span>
            <span className="txt">VOLVER A PROYECTOS</span>
          </button>
          <div className="nav-line"></div>
        </nav>

        <header className="detail-header">
          <div className="title-area">
            <h1 className="project-title">{project.title}</h1>
            <div className="project-tags">
              {project.tags?.map(tag => (
                <span key={tag} className="tag-capsule">{tag}</span>
              ))}
            </div>
          </div>
          
          <div className="header-meta">
            <div className="meta-box">
              <span className="label">CLIENTE</span>
              <span className="value">{project.client}</span>
            </div>
            <div className="meta-box">
              <span className="label">AÑO</span>
              <span className="value">{project.year}</span>
            </div>
          </div>
        </header>

        {/* HERO IMAGE CON RATIO 16:9 FORZADO */}
<div className="detail-hero-wrapper">
  <div className="aspect-ratio-box">
    {/* 🔥 PROTECCIÓN AQUÍ TAMBIÉN */}
    {project.mainImage ? (
      <img src={urlFor(project.mainImage).width(1600).url()} alt={project.title} />
    ) : (
      <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700 text-xs">
        [ NO MEDIA DATA ]
      </div>
    )}
  </div>
</div>

        {/* CUERPO DEL PROYECTO */}
        <article className="detail-content">
          <PortableText value={project.content} components={portableTextComponents} />
        </article>

        {/* FOOTER DE CRÉDITOS */}
        {project.credits && (
          <footer className="detail-footer">
            <div className="footer-content">
              <h4 className="label-credits">DATA / CRÉDITOS</h4>
              <p className="credits-list">{project.credits}</p>
            </div>
          </footer>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectDetail;