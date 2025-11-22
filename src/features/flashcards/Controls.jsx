import React from 'react';
import styles from './Controls.module.css'; // Importa el CSS Module

function Controls({ 
    onPrev, onNext, onMarkLearned, onReset, 
    currentIndex, totalCards, 
    // --- ¡PROPS DE CATEGORÍA ELIMINADAS! ---
    // categories, currentCategory, onCategoryChange
    // ----------------------------------------
    deckNames, 
    onDeckChange, 
    currentDeckName,
    isAudioLoading
}) {
    
    const isDisabled = totalCards === 0;
    const isBusy = isDisabled || isAudioLoading;
    // --- ¡LÓGICA ACTUALIZADA! ---
    const isResetDisabled = isAudioLoading || !currentDeckName; 

    // --- HANDLER DE CATEGORÍA ELIMINADO ---
    // const handleCategoryChange = ... (eliminado)

    const handleDeckChange = (event) => {
        onDeckChange(event.target.value);
    };

    const formatName = (name) => {
        if (!name) return '';
        const spacedName = name.replace(/[_-]/g, ' '); 
        return spacedName.charAt(0).toUpperCase() + spacedName.slice(1);
    };

    return (
        <div className={styles.controlsWrapper}>
            
            {/* --- ¡SELECTOR DE CATEGORÍA ELIMINADO! --- */}
            {/* El div que estaba aquí (líneas 67-86) ha sido eliminado. */}

            {/* --- SELECTOR DE DECK (AHORA ES EL PRIMERO) --- */}
            <div className={styles.deckSelectorContainer}>
                <label htmlFor="deck-select" className={styles.deckSelectorLabel}>
                    Work:
                </label>
                <select
                    id="deck-select"
                    onChange={handleDeckChange}
                    value={currentDeckName || ''}
                    className={styles.deckSelectDropdown}
                    disabled={deckNames.length === 0 || isAudioLoading}
                >
                    {/* Texto dinámico si no hay decks */}
                    {deckNames.length === 0 && (
                        <option value="" disabled>
                            {/* ¡Lógica simplificada! */}
                            {isAudioLoading ? 'Cargando...' : 'Seleccione...'}
                        </option>
                    )}
                    {deckNames.map((name) => (
                        <option key={name} value={name}>
                            {formatName(name)}
                        </option>
                    ))}
                </select>
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

