// src/components/layout/FloatingMenu.jsx

import React, { useState } from "react";
import "./FloatingMenu.css";
// Importamos iconos más intuitivos
import {
  FaList,                 // Catálogo de categorías (listado/lista)
  FaMicrophoneAlt,        // Tabla IPA (escuchar fonética/sonidos)
  FaBookOpen,             // Reglas de Fonética (abrir un libro de reglas)
  FaCog,                  // Configuración
  FaEllipsisV,            // Menú de opciones (puntos verticales)
  FaVolumeUp,             // Icono para Vocales (sonido)
  FaBezierCurve,          // Icono para Diptongos (unión/curva de sonido)
  FaFont                  // Icono para Consonantes (letras/tipografía)
} from "react-icons/fa";

// Definimos los enlaces de YouTube para mayor claridad
const VOWELS_URL = "https://www.youtube.com/watch?v=JuFBtVFbtkA&t=60s";
const DIPHTHONGS_URL = "https://www.youtube.com/watch?v=JuFBtVFbtkA&t=421s";
const CONSONANTS_URL = "https://www.youtube.com/watch?v=JuFBtVFbtkA&t=600s";


import { translations } from '../../config/translations';

// ... (imports)

// Aceptamos las props para los modales
const FloatingMenu = ({
  onToggleCategories,
  onOpenIpaModal,
  onOpenPhonicsModal,
  language = 'en'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = translations[language].floatingMenu;


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
        <FaEllipsisV size={22} />
      </button>

      <div className={`floatingOptions ${isOpen ? "show" : ""}`}>

        {/* 1. Categorías: Usamos FaList (Catálogo) */}
        <button
          className="floatingOption"
          title={t.categories}
          onClick={handleCategoryClick}
        >
          <FaList size={18} />
          <span className="optionLabel">{t.categories}</span>
        </button>

        {/* 3. Modal Phonics: Usamos FaBookOpen (Reglas de Fonética) */}
        <button
          className="floatingOption"
          title={t.phonics}
          onClick={handleOpenPhonics}
        >
          <FaBookOpen size={18} />
          <span className="optionLabel">{t.phonics}</span>
        </button>

        {/* Vowels: Usamos FaVolumeUp */}
        <button
          className="floatingOption"
          title={t.vowels}
          onClick={() => openExternalLink(VOWELS_URL)}
        >
          <FaVolumeUp size={18} />
          <span className="optionLabel">{t.vowels}</span>
        </button>

        {/* Diphthongs: Usamos FaBezierCurve */}
        <button
          className="floatingOption"
          title={t.diphthongs}
          onClick={() => openExternalLink(DIPHTHONGS_URL)}
        >
          <FaBezierCurve size={18} />
          <span className="optionLabel">{t.diphthongs}</span>
        </button>

        {/* Consonants: Usamos FaFont */}
        <button
          className="floatingOption"
          title={t.consonants}
          onClick={() => openExternalLink(CONSONANTS_URL)}
        >
          <FaFont size={18} />
          <span className="optionLabel">{t.consonants}</span>
        </button>

        {/* 4. Configuración: Se mantiene FaCog */}
        <button className="floatingOption" title={t.settings} onClick={() => setIsOpen(false)}>
          <FaCog size={18} />
          <span className="optionLabel">{t.settings}</span>
        </button>

      </div>
    </div>
  );
};

export default FloatingMenu;