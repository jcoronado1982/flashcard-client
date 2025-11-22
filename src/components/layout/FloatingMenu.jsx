// src/components/layout/FloatingMenu.jsx

import React, { useState } from "react";
import "./FloatingMenu.css";
// Importamos iconos más intuitivos
import { 
    FaList,                 // Catálogo de categorías (listado/lista)
    FaMicrophoneAlt,        // Tabla IPA (escuchar fonética/sonidos)
    FaBookOpen,             // Reglas de Fonética (abrir un libro de reglas)
    FaCog,                  // Configuración
    FaBars,                 // Menú principal
    FaVolumeUp,             // Icono para Vocales (sonido)
    FaBezierCurve,          // Icono para Diptongos (unión/curva de sonido)
    FaFont                  // Icono para Consonantes (letras/tipografía)
} from "react-icons/fa"; 

// Definimos los enlaces de YouTube para mayor claridad
const VOWELS_URL = "https://www.youtube.com/watch?v=JuFBtVFbtkA&t=60s";
const DIPHTHONGS_URL = "https://www.youtube.com/watch?v=JuFBtVFbtkA&t=421s";
const CONSONANTS_URL = "https://www.youtube.com/watch?v=JuFBtVFbtkA&t=600s";


// Aceptamos las props para los modales
const FloatingMenu = ({ 
    onToggleCategories, 
    onOpenIpaModal,     
    onOpenPhonicsModal 
}) => { 
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Funciones handler (se mantienen)
  const handleCategoryClick = () => {
    if (onToggleCategories) {
      onToggleCategories(); 
      setIsOpen(false);   
    }
  };

  const handleOpenIpa = () => {
    if (onOpenIpaModal) {
        onOpenIpaModal();
        setIsOpen(false);
    }
  };

  const handleOpenPhonics = () => {
    if (onOpenPhonicsModal) {
        onOpenPhonicsModal();
        setIsOpen(false);
    }
  };

  // Función para abrir enlaces externos
  const openExternalLink = (url) => {
      window.open(url, '_blank');
      setIsOpen(false); // Cierra el menú flotante
  };


  return (
    <div className="floatingMenuContainer">
      <button className="floatingMainButton" onClick={toggleMenu}>
        <FaBars size={22} />
      </button>

      <div className={`floatingOptions ${isOpen ? "show" : ""}`}>
        
        {/* 1. Categorías: Usamos FaList (Catálogo) */}
        <button 
          className="floatingOption" 
          title="Catálogo de Categorías"
          onClick={handleCategoryClick} 
        >
          <FaList size={18} />
        </button>
        
    

        {/* 3. Modal Phonics: Usamos FaBookOpen (Reglas de Fonética) */}
        <button 
          className="floatingOption" 
          title="Reglas de Fonética (Pronunciación)"
          onClick={handleOpenPhonics} 
        >
          <FaBookOpen size={18} />
        </button>
        
        {/* Vowels: Usamos FaVolumeUp */}
        <button 
          className="floatingOption" 
          title="Vowels (Vocales)"
          onClick={() => openExternalLink(VOWELS_URL)} 
        >
          <FaVolumeUp size={18} /> {/* Nuevo icono */}
        </button>
        
        {/* Diphthongs: Usamos FaBezierCurve */}
        <button 
          className="floatingOption" 
          title="Diphthongs (Diptongos)"
          onClick={() => openExternalLink(DIPHTHONGS_URL)} 
        >
          <FaBezierCurve size={18} /> {/* Nuevo icono */}
        </button>
        
        {/* Consonants: Usamos FaFont */}
        <button 
      className="floatingOption" 
      title="Consonants (Consonantes)" // Corregido el title para más claridad
      onClick={() => openExternalLink(CONSONANTS_URL)} 
    >
      <FaFont size={18} /> 
    </button>
        
        {/* 4. Configuración: Se mantiene FaCog */}
        <button className="floatingOption" title="Configuración" onClick={() => setIsOpen(false)}>
          <FaCog size={18} />
        </button>
        
      </div>
    </div>
  );
};

export default FloatingMenu;