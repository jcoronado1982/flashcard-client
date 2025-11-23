import React from 'react';
import './Layout.css';
import ToneSelector from '../../features/flashcards/ToneSelector';
import FloatingMenu from '../../components/layout/FloatingMenu';
import { FaBars } from 'react-icons/fa';
import LanguageSelector from '../common/LanguageSelector';

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

export default function Header({
    isSidebarOpen,
    onMenuClick,
    toneOptions,
    selectedTone,
    onToneChange,
    onToggleCategories,
    onOpenIpaModal,
    onOpenPhonicsModal,
    language,
    onLanguageChange
}) {
    // Estado local para el toggle manual del handle
    const [isManualOpen, setIsManualOpen] = React.useState(false);

    const toggleHeader = () => {
        setIsManualOpen(!isManualOpen);
    };

    return (
        <header className={`app-header ${isSidebarOpen ? 'sidebar-open' : ''} ${isManualOpen ? 'manual-open' : ''}`}>
            <button onClick={onMenuClick} className="hamburger-btn">
                <FaBars size={24} color="#4A5568" />
            </button>

            {/* 3. El logo se mantiene a la izquierda */}
            <AppLogo />

            <div className="header-controls">


                <div className="tone-selector-wrapper">
                    <ToneSelector
                        toneOptions={toneOptions}
                        selectedTone={selectedTone}
                        onToneChange={onToneChange}
                        language={language}
                    />
                </div>

                {/* Language Selector */}
                <div className="language-selector-wrapper">
                    <LanguageSelector
                        currentLanguage={language}
                        onLanguageChange={onLanguageChange}
                    />
                </div>
                <div className="menu-wrapper">
                    <FloatingMenu
                        key={language}
                        onToggleCategories={onToggleCategories}
                        onOpenIpaModal={onOpenIpaModal}
                        onOpenPhonicsModal={onOpenPhonicsModal}
                        language={language}
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
