import React, { useState, useEffect } from 'react';
import styles from './Flashcard.module.css';
import { useAudioPlayback } from './useAudioPlayback.jsx';
import { useImageGeneration } from './useImageGeneration.js';
import CardFront from './CardFront.jsx';
import CardBack from './CardBack.jsx';

function Flashcard({
    cardData, onOpenIpaModal, setAppMessage, updateCardImagePath,
    // --- ¡PROP NUEVA AÑADIDA! ---
    currentCategory,
    currentDeckName, setIsAudioLoading, selectedTone
}) {

    const [isFlipped, setIsFlipped] = useState(false);
    const [blurredState, setBlurredState] = useState({});

    // --- ¡HOOK MODIFICADO! ---
    const {
        playAudio,
        activeAudioText,
        highlightedWordIndex,
        isGeneratingAudio // <-- ¡AÑADIDO!
    } = useAudioPlayback({
        setAppMessage,
        setIsAudioLoading,
        currentCategory, // <-- ¡AÑADIDO!
        currentDeckName,
        selectedTone,
        verbName: cardData?.name
    });

    // --- ¡HOOK MODIFICADO: AÑADIMOS uploadImage! ---
    const {
        isImageLoading,
        imageUrl,
        imageRef,
        displayImageForIndex,
        deleteImage,
        uploadImage // <-- ¡Función AÑADIDA!
    } = useImageGeneration({
        cardData,
        currentCategory, // <-- ¡AÑADIDO!
        currentDeckName,
        setAppMessage,
        updateCardImagePath
    });

    // useEffect (sin cambios)
    useEffect(() => {
        if (!cardData) return;
        setIsFlipped(false);
        setBlurredState(
            cardData.definitions?.reduce((acc, _, i) => ({ ...acc, [i]: true }), {}) || {}
        );
        setAppMessage({ text: '', isError: false });
    }, [cardData, setAppMessage]);

    const toggleBlur = (index) => {
        setBlurredState((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    if (!cardData) {
        return <div className={styles.flashcardContainer}>Cargando datos...</div>;
    }

    return (
        <div className={styles.flashcardContainer}>
            <div
                className={`${styles.card} ${isFlipped ? styles.flipped : ''}`}
                onClick={() => setIsFlipped((p) => !p)}
            >
                {/* CardFront ahora recibe uploadImage */}
                <CardFront
                    cardData={cardData}
                    onOpenIpaModal={onOpenIpaModal}
                    playAudio={playAudio}
                    activeAudioText={activeAudioText}
                    highlightedWordIndex={highlightedWordIndex}
                    blurredState={blurredState}
                    toggleBlur={toggleBlur}
                    isImageLoading={isImageLoading}
                    imageUrl={imageUrl}
                    imageRef={imageRef}
                    displayImageForIndex={displayImageForIndex}
                    deleteImage={deleteImage}
                    uploadImage={uploadImage} // <-- ¡PROP PASADA A CardFront!
                    isGeneratingAudio={isGeneratingAudio} // <-- ¡PROP PASADA A CardFront!
                />

                <CardBack cardData={cardData} />

            </div>
        </div>
    );
}

export default Flashcard;
