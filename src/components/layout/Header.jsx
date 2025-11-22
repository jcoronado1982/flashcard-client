import React from 'react';
import './Layout.css';
// 1. ¡CORRECCIÓN DE RUTA! Ahora apunta correctamente a ToneSelector
import ToneSelector from '../../features/flashcards/ToneSelector'; 

// Un simple SVG para el icono de hamburguesa
const HamburgerIcon = () => (
  <svg viewBox="0 0 100 80" width="24" height="24" fill="#838b9d">
    <rect width="100" height="15" rx="8"></rect>
    <rect y="30" width="100" height="15" rx="8"></rect>
    <rect y="60" width="100" height="15" rx="8"></rect>
  </svg>
);

// Un logo simple
const AppLogo = () => (
  <div className="app-logo">
  </div>
);

// 2. Aceptamos las nuevas props (mensaje de app y selector de tono)
export default function Header({ onMenuClick, appMessage, toneOptions, selectedTone, onToneChange}) {
    // Helper para mostrar el mensaje de estado de la app
    const AppMessageDisplay = ({ message }) => {
        if (!message || !message.text) return <div className="app-message-placeholder" />;
        return (
            <div id="message" className={message.isError ? 'error-message' : 'info-message'}>
                {message.text}
            </div>
        );
    };

  return (
    <header className="app-header">
      <button onClick={onMenuClick} className="hamburger-btn">
        <HamburgerIcon />
      </button>
      
      {/* 3. El logo se mantiene a la izquierda */}
      <AppLogo />

      {/* 4. Mensaje de la aplicación (nueva ubicación) */}
      <div className="app-message-wrapper">
        <AppMessageDisplay message={appMessage} />
      </div>

      {/* 5. Selector de Tono (nueva ubicación) */}
      <div className="header-controls">
        <ToneSelector 
            toneOptions={toneOptions} 
            selectedTone={selectedTone} 
            onToneChange={onToneChange} 
        />
      </div>

    </header>
  );
}
