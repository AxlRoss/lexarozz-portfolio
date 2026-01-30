import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import { Turnstile } from '@marsidev/react-turnstile'; // 👈 Importamos Cloudflare

const ContactForm = ({ onClose }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [status, setStatus] = useState('idle'); 
  // Estado para saber si el captcha está resuelto
  const [captchaToken, setCaptchaToken] = useState(null); 
  const formRef = useRef();

  const sendEmail = (e) => {
    e.preventDefault();
    
    // 🔥 SEGURIDAD EXTRA: Si no hay token, no enviamos nada.
    if (!captchaToken) return;

    setStatus('sending');

    emailjs.sendForm(
      'service_1eartlv',     
      'template_t5hpkhg',    
      formRef.current,       
      'pdJYXeSE8QhmC40mi'      
    )
    .then((result) => {
        console.log(result.text);
        setStatus('success');
        setTimeout(() => {
          onClose();
          setStatus('idle');
        }, 2000);
    }, (error) => {
        console.log(error.text);
        setStatus('error');
    });
  };

  const getButtonText = () => {
    if (status === 'sending') return 'TRANSMITIENDO...';
    if (status === 'success') return 'TRANSMISIÓN COMPLETADA';
    if (status === 'error') return 'ERROR DE CONEXIÓN';
    if (!captchaToken) return 'VERIFICACIÓN PENDIENTE'; // Texto cuando falta captcha
    return 'ENVIAR MENSAJE';
  };

  const getButtonColor = () => {
    if (status === 'success') return '#00ff88'; 
    if (status === 'error') return '#ff3333';
    if (!captchaToken) return '#27272a'; // Color gris apagado si falta captcha
    if (isHovered) return '#00ff88';            
    return '#ffffff';                           
  };

  const modalContent = (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="contact-form-overlay"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 30, opacity: 0 }} 
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="contact-form-card"
        onClick={(e) => e.stopPropagation()} 
      >
        <button onClick={onClose} className="close-button">✕</button>
        
        {/* 🔥 1. PUNTITO VERDE EN SUBTÍTULO */}
        <div className="subtitle-wrapper">
          <div className="status-dot-mini" />
          <p className="form-subtitle">Inicia una transmisión segura.</p>
        </div>
        
        <form ref={formRef} onSubmit={sendEmail} className="main-form">
          <div className="input-group">
            <label>Nombre</label>
            <input required type="text" name="user_name" placeholder="Tu identificación..." />
          </div>

          <div className="input-group">
            <label>Correo de Contacto</label>
            <input required type="email" name="user_email" placeholder="nombre@correo.com" />
          </div>

          <div className="input-group">
            <label>Mensaje / Data</label>
            <textarea required name="message" placeholder="Escribe tu mensaje aquí..." />
          </div>

          {/* 🔥 2. WIDGET REAL DE CLOUDFLARE (Reemplaza la caja falsa) */}
          <div className="verification-box-real">
            <Turnstile 
              siteKey="0x4AAAAAACJgDmH7EQV1yPQy" // 👈 PEGA TU KEY AQUÍ
              theme="dark" // Se adapta perfecto a tu diseño
              onSuccess={(token) => setCaptchaToken(token)} // Activa el botón
              onError={() => setCaptchaToken(null)}
              onExpire={() => setCaptchaToken(null)}
            />
          </div>

          <div className="button-container">
            <button 
              type="submit" 
              className="submit-button"
              // Deshabilitamos si está enviando O si no hay captcha
              disabled={status === 'sending' || status === 'success' || !captchaToken}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{ 
                backgroundColor: getButtonColor(),
                color: (status === 'success' || status === 'sending' || (!captchaToken)) ? 'black' : 'black',
                opacity: !captchaToken ? 0.5 : 1, // Visualmente deshabilitado
                cursor: (!captchaToken || status === 'sending') ? 'not-allowed' : 'pointer'
              }}
            >
              {getButtonText()}
            </button>
            
            {status !== 'success' && (
              <button type="button" onClick={onClose} className="cancel-button">
                CANCELAR PROCESO
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ContactForm;