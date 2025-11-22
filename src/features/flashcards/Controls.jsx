import React from 'react';
import Select from 'react-select';
import styles from './Controls.module.css'; // Importa el CSS Module

// Custom styles for react-select to match our design
const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        minHeight: '42px',
        height: '42px',
        borderRadius: '24px',
        border: state.isFocused ? '1.5px solid #A0AEC0' : '1.5px solid #CBD5E0',
        boxShadow: state.isFocused ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 2px 6px rgba(0, 0, 0, 0.06)',
        backgroundColor: '#ffffff',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        '&:hover': {
            borderColor: '#A0AEC0',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-1px)',
        },
    }),
    valueContainer: (provided) => ({
        ...provided,
        height: '42px',
        padding: '0 0 0 12px',
    }),
    input: (provided) => ({
        ...provided,
        margin: '0',
        padding: '0',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }),
    indicatorSeparator: () => ({
        display: 'none',
    }),
    indicatorsContainer: (provided) => ({
        ...provided,
        height: '42px',
    }),
    dropdownIndicator: (provided) => ({
        ...provided,
        color: '#4A5568',
        padding: '0 12px',
        '&:hover': {
            color: '#0066CC',
        },
    }),
    menu: (provided) => ({
        ...provided,
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        marginTop: '8px',
    }),
    menuList: (provided) => ({
        ...provided,
        padding: '8px',
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#0066CC' : state.isFocused ? '#EBF4FF' : '#ffffff',
        color: state.isSelected ? '#ffffff' : '#2D3748',
        padding: '12px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: state.isSelected ? 600 : 500,
        fontSize: '0.95em',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        transition: 'all 0.2s ease',
        '&:active': {
            backgroundColor: state.isSelected ? '#0066CC' : '#D6E9FF',
        },
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#2D3748',
        fontWeight: 600,
        fontSize: '0.95em',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#718096',
        fontWeight: 500,
        fontSize: '0.95em',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }),
};

function Controls({
    onPrev, onNext, onMarkLearned, onReset,
    currentIndex, totalCards,
    deckNames,
    onDeckChange,
    currentDeckName,
    isAudioLoading
}) {

    const isDisabled = totalCards === 0;
    const isBusy = isDisabled || isAudioLoading;
    const isResetDisabled = isAudioLoading || !currentDeckName;

    const formatName = (name) => {
        if (!name) return '';
        const spacedName = name.replace(/[_-]/g, ' ');
        return spacedName.charAt(0).toUpperCase() + spacedName.slice(1);
    };

    // Transform deckNames to react-select format
    const deckOptions = deckNames.map(name => ({
        value: name,
        label: formatName(name),
    }));

    // Find the currently selected deck
    const selectedDeck = deckOptions.find(opt => opt.value === currentDeckName);

    const handleDeckChange = (option) => {
        if (option && onDeckChange) {
            onDeckChange(option.value);
        }
    };

    return (
        <div className={styles.controlsWrapper}>

            {/* --- SELECTOR DE DECK (AHORA ES EL PRIMERO) --- */}
            {/* --- CONTROLES SUPERIORES: DECK --- */}
            <div className={styles.topControls}>
                <div className={styles.deckSelectorContainer}>
                    <label htmlFor="deck-select" className={styles.deckSelectorLabel}>
                        Work:
                    </label>
                    <div style={{ minWidth: '200px' }}>
                        <Select
                            inputId="deck-select"
                            value={selectedDeck}
                            onChange={handleDeckChange}
                            options={deckOptions}
                            styles={customSelectStyles}
                            isSearchable={false}
                            isDisabled={deckNames.length === 0 || isAudioLoading}
                            placeholder={isAudioLoading ? 'Cargando...' : 'Seleccione...'}
                        />
                    </div>
                </div>
            </div>

            {/* --- CONTROLES (SIN CAMBIOS) --- */}
            <div className={styles.controls}>
                <button className={styles.prevCardBtn} onClick={onPrev} disabled={isBusy} title="Anterior">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button className={styles.resetButton} onClick={onReset} disabled={isResetDisabled} title={`Resetear deck: ${currentDeckName ? formatName(currentDeckName) : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                </button>
                <div className={styles.cardCounter}>
                    {totalCards > 0 ? `${currentIndex + 1} / ${totalCards}` : '0 / 0'}
                </div>
                <button className={styles.correctButton} onClick={onMarkLearned} disabled={isBusy} title="Marcar como Aprendida">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>
                <button className={styles.nextCardBtn} onClick={onNext} disabled={isBusy} title="Siguiente">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
            </div>
        </div>
    );
}

export default Controls;

