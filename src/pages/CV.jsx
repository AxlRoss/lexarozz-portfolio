import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/ui/Navbar'; 
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../styles/CV.scss';

const CV = () => {
  const navigate = useNavigate();
  const [daysOld, setDaysOld] = useState(0);
  const [yearsOld, setYearsOld] = useState(0);
  
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const calculateAge = () => {
      const birthDate = new Date('2001-08-03T00:00:00');
      const today = new Date();
      const diffTime = Math.abs(today - birthDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffYears = Math.floor(diffDays / 365.25); 
      
      setDaysOld(diffDays);
      setYearsOld(diffYears);
    };
    calculateAge();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const hh = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${yyyy}.${mm}.${dd} // ${hh}:${min}:${ss}`);
    };
    
    updateTime(); 
    const interval = setInterval(updateTime, 1000); 
    return () => clearInterval(interval);
  }, []);

  const handleClientClick = (clientName) => {
    navigate(`/all?search=${encodeURIComponent(clientName)}`);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('cv-download-target');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#050505',
        width: element.offsetWidth,
        height: element.offsetHeight
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Axl_Rosas_CV.pdf');
    } catch (error) {
      console.error("Error al generar el PDF:", error);
    }
  };

  return (
    <>
      <Navbar /> 
      
      <div className="cv-page-container">
        
        <nav className="cv-minimal-nav">
          <button className="nav-action" onClick={() => navigate('/work')}>[ ← REGRESAR ]</button>
          <button className="nav-action download-btn" onClick={handleDownloadPDF}>[ DESCARGAR_PDF ↓ ]</button>
        </nav>

        <motion.div 
          className="cv-content-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div id="cv-download-target" className="cv-document">
            <div className="bento-cv-grid">
              
              {/* ==========================================
                  CAJA 1: ID Y FOTO
              ========================================== */}
              <div className="cv-box id-box">
                <div className="cv-photo-wrapper">
                  <div className="tech-corner top-left">+</div>
                  <div className="tech-corner top-right">+</div>
                  <div className="tech-corner bottom-left">+</div>
                  <div className="tech-corner bottom-right">+</div>
                  <div className="photo-clipper">
                    <img src="/tu-foto.jpg" alt="Axl Rosas" />
                  </div>
                  <div className="dither-overlay"></div>
                </div>
                <div className="cv-meta-info">
                  <h1>AXL ROSAS</h1>
                  <span className="cv-role">VISUAL ARTIST</span>
                  <span className="cv-age">{daysOld} DAYS ALIVE <br/>({yearsOld} YRS)</span>
                </div>
              </div>

              {/* ==========================================
                  CAJA 2: EXPERIENCIA LABORAL
              ========================================== */}
              <div className="cv-box exp-box">
                <h2 className="box-title">[ EXPERIENCE ]</h2>
                
                <div className="job-entry">
                  <div className="job-header">
                    <h3>
                      <span className="job-title-highlight">MOTION & GRAPHIC DESIGNER SR.</span> 
                      <span className="job-company"> — AGENCIA BE</span>
                    </h3>
                    <span className="job-date">2023—2026</span>
                  </div>
                  <p className="job-desc">
                    Development of visual assets, animations, and UGC content for a wide range of clients, with a focus on ads performance and PMAX campaigns.
                  </p>
                  <div className="job-clients">
                    Clients include: 
                    <span className="interactive-client" onClick={() => handleClientClick("CHARLY")}> CHARLY</span>, 
                    <span className="interactive-client" onClick={() => handleClientClick("SKECHERS")}> SKECHERS</span>, 
                    <span className="interactive-client" onClick={() => handleClientClick("ASADEROS GRILL")}> ASADEROS GRILL</span>, 
                    <span className="interactive-client" onClick={() => handleClientClick("SEÑOR TACO")}> SEÑOR TACO</span>, 
                    <span className="interactive-client" onClick={() => handleClientClick("DICKIES")}> DICKIES</span>, 
                    <span className="interactive-client" onClick={() => handleClientClick("URBANISTA")}> URBANISTA</span>, 
                    <span className="interactive-client" onClick={() => handleClientClick("LAS BARRICAS")}> LAS BARRICAS</span>, among many others.
                  </div>
                </div>

                <div className="job-entry">
                  <div className="job-header">
                    <h3>
                      <span className="job-title-highlight">MOTION GRAPHIC DESIGNER / ART DIRECTOR</span> 
                      <span className="job-company"> — FREELANCE</span>
                    </h3>
                    <span className="job-date">2020—PRESENT</span>
                  </div>
                  <p className="job-desc">
                    Responsible for developing and overseeing motion graphics, animations, and visual assets to deliver high-quality projects.
                  </p>
                  <div className="job-clients">
                    Clients include: 
                    <span className="interactive-client" onClick={() => handleClientClick("COMPARTAMOS BANCO")}>COMPARTAMOS BANCO</span>, 
                    <span className="interactive-client" onClick={() => handleClientClick("COCA COLA")}> COCA COLA</span>, 
                    <span className="interactive-client" onClick={() => handleClientClick("ACER")}> ACER</span>, 
                    <span className="interactive-client" onClick={() => handleClientClick("MATTEL")}> MATTEL</span>, 
                    <span className="interactive-client" onClick={() => handleClientClick("Ilusion")}> ILLUSION</span>, 
                    <span className="interactive-client" onClick={() => handleClientClick("BE GRAND")}> BE GRAND</span>, 
                    <span className="interactive-client" onClick={() => handleClientClick("BANCO AZTECA")}> BANCO AZTECA</span> as well as remote work in Canada with clients including 
                    <span className="interactive-client" onClick={() => handleClientClick("AXIIS")}> AXIIS</span>, 
                    <span className="interactive-client" onClick={() => handleClientClick("Choco4peace")}> CHOCO4PEACE</span> and 
                    <span className="interactive-client" onClick={() => handleClientClick("FAST international")}> FAST INTERNATIONAL</span>.
                  </div>
                </div>

                <div className="job-entry">
                  <div className="job-header">
                    <h3>
                      <span className="job-title-highlight">INTERN MOTION JR.</span> 
                      <span className="job-company"> — THE WIREDOG / TRUST 360</span>
                    </h3>
                    <span className="job-date">2020—2021</span>
                  </div>
                  <p className="job-desc">
                    Created visuals, graphics, motion graphics, and advanced animations 
                  </p>
                  <div className="job-clients">
                    For clients such as 
                    <span className="interactive-client" onClick={() => handleClientClick("DON JULIO")}> DON JULIO</span>, 
                    <span className="interactive-client" onClick={() => handleClientClick("PERLA NEGRA")}> PERLA NEGRA</span>, 
                    <span className="interactive-client" onClick={() => handleClientClick("NERDS")}> NERDS</span>, among others.
                  </div>
                </div>

                <div className="job-entry">
                  <div className="job-header">
                    <h3>
                      <span className="job-title-highlight">INTERN AS GRAPHIC DESIGNER</span> 
                      <span className="job-company"> — CONTACTO</span>
                    </h3>
                    <span className="job-date">2019—2020</span>
                  </div>
                  <p className="job-desc">
                    Professional Internship – Developed visual assets and social media posts 
                  </p>
                  <div className="job-clients">
                    For clients such as 
                    <span className="interactive-client" onClick={() => handleClientClick("GRISI FARMA")}> GRISI FARMA</span>, 
                    <span className="interactive-client" onClick={() => handleClientClick("FOLCAPS")}> FOLCAPS</span>, among others.
                  </div>
                </div>
              </div>

              {/* ==========================================
                  CAJA 3: EDUCACIÓN
              ========================================== */}
              <div className="cv-box edu-box">
                <h2 className="box-title">[ EDUCATION ]</h2>
                
                <div className="edu-entry">
                  <h3>
                    <a 
                      href="https://www.credential.net/48527035-23c4-4595-bbd0-575a89ccbb3a#acc.auzpR0Vq" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="gold-badge"
                    >
                      [ CERTIFIED ]
                    </a>
                    ANIMATION & WORLDBUILDING (UNREAL)
                  </h3>
                  <span className="edu-date">2023</span>
                  <p>Certified by Epic Games, mentorship from UT-HUB Spain.</p>
                </div>
                
                <div className="edu-entry">
                  <h3>CLOTH SIMULATION IN 3D (MAYA)</h3>
                  <span className="edu-date">2023</span>
                  <p>Masterclass by Cruz Contreras - Taller del Chucho.</p>
                </div>

                <div className="edu-entry">
                  <h3>B.A. MULTIMEDIA DESIGN & DIGITAL ART</h3>
                  <span className="edu-date">2020—2024</span>
                  <p>Universidad Del Valle De México.</p>
                </div>

                <div className="edu-entry">
                  <h3>TECH. CAREER IN GRAPHIC DESIGN</h3>
                  <span className="edu-date">2017—2020</span>
                  <p>Awarded for academic excellence.</p>
                </div>
              </div>

              {/* ==========================================
                  CAJA 4: CURRENT TOOLS 
              ========================================== */}
              <div className="cv-box tools-box">
                <div className="box-header">
                  <h2 className="box-title">[ TOOLS ]</h2>
                  <p className="box-subtitle">NAVIGATING THEM WITH FULL CONFIDENCE</p>
                </div>
                <div className="tool-tags">
                  <span>PHOTOSHOP</span>
                  <span>ILLUSTRATOR</span>
                  <span>AFTER EFFECTS</span>
                  <span>PREMIERE</span>
                  <span>DAVINCI RESOLVE</span>
                  <span>BLENDER</span>
                  <span>AUTODESK MAYA</span>
                  <span>UNREAL ENGINE</span>
                  <span>HTML/CSS</span>
                </div>
              </div>

              {/* ==========================================
                  CAJA 5: FUTURE TOOLS
              ========================================== */}
              <div className="cv-box future-box">
                <div className="box-header">
                  <h2 className="box-title">[ FUTURE_TOOLS ]</h2>
                  <p className="box-subtitle">OCCASIONALLY LEARNING THEM</p>
                </div>
                <div className="tool-tags">
                  <span>HOUDINI</span>
                  <span>MARVELOUS DESIGNER</span>
                  <span>REACT.JS</span>
                  <span>RIVE.APP</span>
                  <span>UNITY</span>
                </div>
              </div>

              {/* ==========================================
                  CAJA 6: USELESS INFO (Movida arriba)
              ========================================== */}
              <div className="cv-box useless-box">
                <h2 className="box-title">[ USELESS_INFO ]</h2>
                <ul className="useless-list">
                  <li>&gt; LOVES CATS BUT IS A LIL ALLERGIC TO THEM.</li>
                  <li>&gt; CASUAL SPACE LAUNCHES OBSERVER.</li>
                  <li>&gt; HARDWARE GEEK & TECH ENTHUSIAST.</li>
                  <li>&gt; MUSIC ENJOYER.</li>
                  <li>&gt; CHRONICALLY ONLINE.</li>
                  <li>&gt; NON BINARY.</li>
                  <li>&gt; LOVES VIDEOGAMES.</li>
                  <li>&gt; CURRENTLY PLAYING: VALORANT.</li>
                </ul>
              </div>

              {/* ==========================================
                  CAJA 7: CONNECT (Movida abajo)
              ========================================== */}
              <div className="cv-box contact-box">
                 <h2 className="box-title">[ CONNECT ]</h2>
                 <div className="contact-links">
                    <span>hi@axlrozz.com</span>
                    <div className="contact-divider"></div>
                    <span>55 6175 2628</span>
                    <div className="contact-divider"></div>
                    <span>@axlrozzshadow</span>
                 </div>
              </div>

              {/* ==========================================
                  CAJA 8: RELLENO VISUAL CON SVG REAL Y RELOJ EN VIVO
              ========================================== */}
              <div className="cv-box barcode-box">
                 <div className="barcode-visual">
                    <svg width="100%" height="30" preserveAspectRatio="none" viewBox="0 0 120 30" xmlns="http://www.w3.org/2000/svg">
                      <rect x="0" y="0" width="3" height="30" fill="rgba(255,255,255,0.2)"/>
                      <rect x="5" y="0" width="1" height="30" fill="rgba(255,255,255,0.2)"/>
                      <rect x="8" y="0" width="4" height="30" fill="rgba(255,255,255,0.2)"/>
                      <rect x="15" y="0" width="2" height="30" fill="rgba(255,255,255,0.2)"/>
                      <rect x="19" y="0" width="6" height="30" fill="rgba(255,255,255,0.2)"/>
                      <rect x="28" y="0" width="1" height="30" fill="rgba(255,255,255,0.2)"/>
                      <rect x="31" y="0" width="3" height="30" fill="rgba(255,255,255,0.2)"/>
                      <rect x="37" y="0" width="5" height="30" fill="rgba(255,255,255,0.2)"/>
                      <rect x="44" y="0" width="2" height="30" fill="rgba(255,255,255,0.2)"/>
                      <rect x="48" y="0" width="4" height="30" fill="rgba(255,255,255,0.2)"/>
                      <rect x="55" y="0" width="7" height="30" fill="rgba(255,255,255,0.2)"/>
                      <rect x="64" y="0" width="1" height="30" fill="rgba(255,255,255,0.2)"/>
                      <rect x="67" y="0" width="3" height="30" fill="rgba(255,255,255,0.2)"/>
                      <rect x="72" y="0" width="2" height="30" fill="rgba(255,255,255,0.2)"/>
                      <rect x="76" y="0" width="6" height="30" fill="rgba(255,255,255,0.2)"/>
                      <rect x="84" y="0" width="3" height="30" fill="rgba(255,255,255,0.2)"/>
                      <rect x="89" y="0" width="1" height="30" fill="rgba(255,255,255,0.2)"/>
                      <rect x="92" y="0" width="5" height="30" fill="rgba(255,255,255,0.2)"/>
                      <rect x="99" y="0" width="2" height="30" fill="rgba(255,255,255,0.2)"/>
                      <rect x="103" y="0" width="4" height="30" fill="rgba(255,255,255,0.2)"/>
                      <rect x="110" y="0" width="1" height="30" fill="rgba(255,255,255,0.2)"/>
                      <rect x="113" y="0" width="7" height="30" fill="rgba(255,255,255,0.2)"/>
                    </svg>
                 </div>
                 <div className="barcode-metadata">
                    <span>DOCUMENT ID: AXLR-2026-CV // VERIFIED BY ROZZ_OS</span>
                    <span className="timestamp-container">
                      <span className="live-time">{currentTime}</span><br/>
                      GENERATED IN REAL-TIME
                    </span>
                 </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default CV;