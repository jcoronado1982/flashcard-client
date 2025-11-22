import React from 'react';
import './Layout.css';
import ToneSelector from '../../features/flashcards/ToneSelector';
import FloatingMenu from '../../components/layout/FloatingMenu';

// Un simple SVG para el icono de hamburguesa
const HamburgerIcon = () => (
    <svg viewBox="0 0 100 80" width="24" height="24" fill="#838b9d">
        <rect width="100" height="15" rx="8"></rect>
        <rect y="30" width="100" height="15" rx="8"></rect>
        <rect y="60" width="100" height="15" rx="8"></rect>
    </svg>
);

// Icono de flecha para el handle
const ChevronDownIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

// Un logo simple
const AppLogo = () => (
    <div className="app-logo">
    </div>
);

// 2. Aceptamos las nuevas props (mensaje de app y selector de tono)
export default function Header({
    isSidebarOpen,
    onMenuClick,
    appMessage,
    toneOptions,
    selectedTone,
    onToneChange,
    onToggleCategories,
    onOpenIpaModal,
    onOpenPhonicsModal
}) {
    // Helper para mostrar el mensaje de estado de la app
    const AppMessageDisplay = ({ message }) => {
        if (!message || !message.text) return <div className="app-message-placeholder" />;
        return (
            <div id="message" className={message.isError ? 'error-message' : 'info-message'}>
                {message.text}
            </div>
        );
    };

    // Estado local para el toggle manual del handle
    const [isManualOpen, setIsManualOpen] = React.useState(false);

    const toggleHeader = () => {
        setIsManualOpen(!isManualOpen);
    };

    return (
        <header className={`app-header ${isSidebarOpen ? 'sidebar-open' : ''} ${isManualOpen ? 'manual-open' : ''}`}>
            <button onClick={onMenuClick} className="hamburger-btn">
                <HamburgerIcon />
            </button>

            {/* 3. El logo se mantiene a la izquierda */}
            <AppLogo />

            <div className="app-message-wrapper">
                <AppMessageDisplay message={appMessage} />
            </div>

            <div className="header-controls">
                <div className="tone-selector-wrapper">
                    <ToneSelector
                        toneOptions={toneOptions}
                        selectedTone={selectedTone}
                        onToneChange={onToneChange}
                    />
                </div>
                <div className="menu-wrapper">
                    <FloatingMenu
                        onToggleCategories={onToggleCategories}
                        onOpenIpaModal={onOpenIpaModal}
                        onOpenPhonicsModal={onOpenPhonicsModal}
                    />
                </div>
            </div>

            {/* Handle visual para indicar que la barra está ahí */}
            <div className="header-handle" onClick={toggleHeader}>
                <ChevronDownIcon />
            </div>

        </header>
    );
}
