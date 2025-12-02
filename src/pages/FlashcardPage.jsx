import React, { useState, useEffect, useCallback } from 'react';
import Flashcard from '../features/flashcards/Flashcard';
import Controls from '../features/flashcards/Controls';
import IpaModal from '../features/flashcards/IpaModal';
import PhonicsModal from '../features/flashcards/PhonicsModal';
import CategorySelector from '../features/flashcards/CategorySelector';

// Importación de la configuración centralizada
import { API_URL } from '../config/api';

const LAST_DECK_KEY_PREFIX = 'flashcards_last_deck_';

// --- CONFIGURACIÓN: Activar/Desactivar gestos de deslizamiento (Swipe) ---
const ENABLE_MOBILE_SWIPE = true;  // Para dispositivos táctiles (Touch)
const ENABLE_DESKTOP_SWIPE = false; // Para uso con ratón (Mouse)

export default function FlashcardPage({
    currentCategory,
    appMessage,
    setAppMessage,
    isAudioLoading,
    setIsAudioLoading,
    selectedTone,
    isLoadingCategories,
    categories,
    onCategoryChange,
    toneOptions,
    onToneChange,
    // Props de Modales
    isIpaModalOpen,
    onCloseIpaModal,
    onOpenIpaModal,
    isPhonicsModalOpen,
    onClosePhonicsModal,
    onOpenPhonicsModal,
    // Props de UI
    isCategorySelectorVisible,
    onCloseCategorySelector,
    language
}) {

    // --- ESTADOS LOCALES ---
    const [masterData, setMasterData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDeckLoading, setIsDeckLoading] = useState(true);
    const [deckNames, setDeckNames] = useState([]);
    const [currentDeckName, setCurrentDeckName] = useState(null);

    // --- SWIPE STATE ---
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // --- LÓGICA DE DATOS ---

    const fetchFlashcards = useCallback(async (category, deck) => {
        if (!category || !deck) return;

        setAppMessage({ text: `Cargando deck: ${deck}...`, isError: false });
        setIsDeckLoading(true);
        setCurrentIndex(0);
        setMasterData([]);
        setFilteredData([]);

        try {
            const response = await fetch(`${API_URL}/api/flashcards-data?category=${category}&deck=${deck}`);
            if (!response.ok) throw new Error('No se pudo cargar los datos desde la API.');

            let data = await response.json();
            if (!Array.isArray(data)) {
                data = [data];
            }

            const dataWithIds = data.map((card, index) => ({
                ...card,
                id: index,
                definitions: (Array.isArray(card.definitions) ? card.definitions : []).map(def => ({ ...def, imagePath: def.imagePath || null })),
                phonetic: card.phonetic || card.ipa_us || 'N/A',
                learned: card.learned || false,
                force_generation: card.force_generation !== undefined ? card.force_generation : false
            }));

            setMasterData(dataWithIds);
            const unlearnedCards = dataWithIds.filter(card => !card.learned);
            setFilteredData(unlearnedCards);

            if (unlearnedCards.length > 0) {
                setAppMessage({ text: `Deck '${deck}' listo.`, isError: false });
            } else if (dataWithIds.length > 0) {
                setAppMessage({ text: `¡Has completado '${deck}'!`, isError: false });
            } else {
                setAppMessage({ text: `El deck '${deck}' no tiene tarjetas.`, isError: true });
            }

        } catch (error) {
            console.error("Error fatal al cargar flashcards:", error);
            setAppMessage({ text: `Error al cargar ${deck}: ${error.message}`, isError: true });
            setMasterData([]);
            setFilteredData([]);
        } finally {
            setIsDeckLoading(false);
        }
    }, [setAppMessage]);


    useEffect(() => {
        if (!currentCategory) {
            setIsDeckLoading(false);
            setDeckNames([]);
            setFilteredData([]);
            setMasterData([]);
            return;
        };

        const fetchDeckNamesForCategory = async () => {
            setAppMessage({ text: `Buscando decks en ${currentCategory}...`, isError: false });
            setIsDeckLoading(true);
            setDeckNames([]);
            setCurrentDeckName(null);

            try {
                const response = await fetch(`${API_URL}/api/available-flashcards-files?category=${currentCategory}`);
                if (!response.ok) throw new Error('No se pudo cargar la lista de decks.');

                const result = await response.json();
                if (!result.success || !Array.isArray(result.files)) {
                    throw new Error('La respuesta de la API no es válida.');
                }

                const rawDeckNames = result.files.map(name => name.replace('.json', ''));
                setDeckNames(rawDeckNames);

                if (rawDeckNames.length > 0) {
                    // Lógica para cargar el deck guardado
                    let deckToLoad = rawDeckNames[0]; // Por defecto, el primero
                    try {
                        const storageKey = `${LAST_DECK_KEY_PREFIX}${currentCategory}`;
                        const savedDeck = localStorage.getItem(storageKey);

                        if (savedDeck && rawDeckNames.includes(savedDeck)) {
                            deckToLoad = savedDeck;
                        }
                    } catch (e) {
                        console.warn("No se pudo leer el deck de localStorage:", e);
                    }
                    setCurrentDeckName(deckToLoad);

                } else {
                    setAppMessage({ text: `No se encontraron decks en ${currentCategory}.`, isError: true });
                    setIsDeckLoading(false);
                    setMasterData([]);
                    setFilteredData([]);
                }

            } catch (error) {
                console.error("Error al cargar nombres de decks:", error);
                setAppMessage({ text: `Error al cargar lista de decks: ${error.message}`, isError: true });
                setIsDeckLoading(false);
            }
        };

        fetchDeckNamesForCategory();
    }, [currentCategory, setAppMessage]);


    useEffect(() => {
        if (currentCategory && currentDeckName) {
            fetchFlashcards(currentCategory, currentDeckName);
        }
    }, [currentCategory, currentDeckName, fetchFlashcards]);


    const handleDeckChange = useCallback((newDeck) => {
        if (newDeck !== currentDeckName) {
            setCurrentDeckName(newDeck);

            // Guardar el deck seleccionado
            try {
                const storageKey = `${LAST_DECK_KEY_PREFIX}${currentCategory}`;
                localStorage.setItem(storageKey, newDeck);
            } catch (e) {
                console.error("No se pudo guardar el deck en localStorage:", e);
            }

            setMasterData([]);
            setFilteredData([]);
            setIsDeckLoading(true);
        }
    }, [currentDeckName, currentCategory]);


    const handleNextCard = useCallback(() => {
        if (filteredData.length > 0) {
            setCurrentIndex(prev => (prev + 1) % filteredData.length);
        }
    }, [filteredData.length]);

    const handlePrevCard = useCallback(() => {
        if (filteredData.length > 0) {
            setCurrentIndex(prev => (prev - 1 + filteredData.length) % filteredData.length);
        }
    }, [filteredData.length]);


    const handleMarkAsLearned = useCallback(async () => {
        if (filteredData.length === 0 || !currentCategory || !currentDeckName) return;

        const cardToMark = filteredData[currentIndex];
        if (!cardToMark) return;

        try {
            const response = await fetch(`${API_URL}/api/update-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: currentCategory,
                    deck: currentDeckName,
                    index: cardToMark.id,
                    learned: true
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al actualizar estado en API.');
            }

            const updatedMasterData = masterData.map(card =>
                card.id === cardToMark.id ? { ...card, learned: true } : card
            );
            setMasterData(updatedMasterData);

            const newFilteredData = updatedMasterData.filter(card => !card.learned);
            setFilteredData(newFilteredData);

            if (newFilteredData.length === 0) {
                setCurrentIndex(0);
                setAppMessage({ text: `¡Deck '${currentDeckName}' completado! 🎉`, isError: false });
            } else if (currentIndex >= newFilteredData.length) {
                setCurrentIndex(newFilteredData.length - 1);
                setAppMessage({ text: `Tarjeta '${cardToMark.name}' marcada.`, isError: false });
            } else {
                setAppMessage({ text: `Tarjeta '${cardToMark.name}' marcada.`, isError: false });
            }

        } catch (error) {
            console.error("Error al marcar como aprendida:", error);
            setAppMessage({ text: `Error al guardar: ${error.message}`, isError: true });
        }
    }, [currentIndex, filteredData, masterData, currentCategory, currentDeckName, setAppMessage]);


    const handleReset = useCallback(async () => {
        if (!currentCategory || !currentDeckName) return;

        if (window.confirm(`¿Estás seguro de que quieres resetear el progreso de '${currentDeckName}'?`)) {
            try {
                setAppMessage({ text: 'Reseteando...', isError: false });
                const response = await fetch(`${API_URL}/api/reset-all`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        category: currentCategory,
                        deck: currentDeckName
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Error al resetear en API.');
                }

                fetchFlashcards(currentCategory, currentDeckName);
                setAppMessage({ text: `Progreso de '${currentDeckName}' reseteado.`, isError: false });

            } catch (error) {
                console.error("Error al resetear:", error);
                setAppMessage({ text: `Error al resetear: ${error.message}`, isError: true });
            }
        } else {
            setAppMessage({ text: 'Reseteo cancelado.', isError: false });
        }
    }, [currentCategory, currentDeckName, fetchFlashcards, setAppMessage]);


    const updateCardImagePath = useCallback((cardId, newPath, defIndex) => {

        setMasterData(prevMasterData =>
            prevMasterData.map(card => {
                if (card.id === cardId) {
                    const currentDefinitions = Array.isArray(card.definitions) ? card.definitions : [];
                    if (defIndex < 0 || defIndex >= currentDefinitions.length) {
                        console.error(`App: Índice de definición ${defIndex} fuera de rango para cardId=${cardId}.`);
                        return card;
                    }
                    const updatedDefinitions = currentDefinitions.map((def, i) => {
                        if (i === defIndex) {
                            return { ...def, imagePath: newPath };
                        }
                        return def;
                    });
                    return { ...card, definitions: updatedDefinitions };
                }
                return card;
            })
        );

        setFilteredData(prevFilteredData =>
            prevFilteredData.map(card => {
                if (card.id === cardId) {
                    const currentDefinitions = Array.isArray(card.definitions) ? card.definitions : [];
                    if (defIndex < 0 || defIndex >= currentDefinitions.length) {
                        return card;
                    }
                    const updatedDefinitions = currentDefinitions.map((def, i) => {
                        if (i === defIndex) {
                            return { ...def, imagePath: newPath };
                        }
                        return def;
                    });
                    return { ...card, definitions: updatedDefinitions };
                }
                return card;
            })
        );
    }, []);

    const currentCard = filteredData.length > 0 ? filteredData[currentIndex] : null;


    // --- KEYBOARD NAVIGATION ---
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'ArrowLeft') {
                handlePrevCard();
            } else if (event.key === 'ArrowRight') {
                handleNextCard();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Cleanup listener on unmount
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handlePrevCard, handleNextCard]);


    if (isLoadingCategories) {
        return <div className="loading-container"><img src="/loading.gif" alt="Cargando categorías..." /></div>;
    }

    // --- SWIPE LOGIC HANDLERS ---
    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    const onSwipeStart = (clientX) => {
        setTouchEnd(null); // Reset touch end
        setTouchStart(clientX);
    };

    const onSwipeMove = (clientX) => {
        setTouchEnd(clientX);
    };

    const onSwipeEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            handlePrevCard();
        } else if (isRightSwipe) {
            handleNextCard();
        }

        // Reset state
        setTouchStart(null);
        setTouchEnd(null);
    };

    // Touch Handlers
    const onTouchStart = (e) => onSwipeStart(e.targetTouches[0].clientX);
    const onTouchMove = (e) => onSwipeMove(e.targetTouches[0].clientX);
    const onTouchEnd = () => onSwipeEnd();

    // Mouse Handlers
    const onMouseDown = (e) => onSwipeStart(e.clientX);
    const onMouseMove = (e) => {
        if (touchStart !== null) {
            onSwipeMove(e.clientX);
        }
    };
    const onMouseUp = () => onSwipeEnd();
    const onMouseLeave = () => onSwipeEnd();



    // --- RENDERIZADO (JSX) ---
    return (
        <div className="flashcard-page-wrapper">

            {isCategorySelectorVisible && (
                <CategorySelector
                    categories={categories}
                    currentCategory={currentCategory}
                    onCategoryChange={onCategoryChange}
                    isDisabled={isAudioLoading}
                    onClose={onCloseCategorySelector}
                />
            )}

            <div className="app-container">
                <div
                    className="flashcard-main-area"
                    {...(ENABLE_MOBILE_SWIPE ? {
                        onTouchStart,
                        onTouchMove,
                        onTouchEnd
                    } : {})}
                    {...(ENABLE_DESKTOP_SWIPE ? {
                        onMouseDown,
                        onMouseMove,
                        onMouseUp,
                        onMouseLeave
                    } : {})}
                >

                    {isDeckLoading || !currentCard ? (
                        !currentCategory ? (
                            <div className="all-done-message">
                                Por favor, selecciona una categoría en el menú.
                            </div>
                        ) : (
                            <div className="loading-container"><img src="/loading.gif" alt="Cargando tarjeta..." /></div>
                        )
                    ) : (
                        filteredData.length === 0 && masterData.length > 0 ? (
                            <div className="all-done-message">
                                ¡Felicidades! Has completado el deck '{currentDeckName}'. 🎉
                            </div>
                        ) : (
                            <Flashcard
                                key={`${currentCategory}-${currentDeckName}-${currentCard.id}`}
                                cardData={currentCard}
                                onOpenIpaModal={onOpenIpaModal}
                                onOpenPhonicsModal={onOpenPhonicsModal}
                                setAppMessage={setAppMessage}
                                updateCardImagePath={updateCardImagePath}
                                currentCategory={currentCategory}
                                currentDeckName={currentDeckName}
                                setIsAudioLoading={setIsAudioLoading}
                                selectedTone={selectedTone}
                            />
                        )
                    )}

                    {appMessage && appMessage.text && (
                        <div id="message" className={appMessage.isError ? 'error-message' : 'info-message'} style={{
                            marginTop: '10px',
                            padding: '10px 10px 0px 10px',
                            borderRadius: '8px',
                            textAlign: 'center',
                            backgroundColor: appMessage.isError ? 'rgba(255, 0, 0, 0.2)' : 'transparent',
                            color: appMessage.isError ? '#ffcccc' : 'rgb(36 31 31 / 50%)',
                            border: appMessage.isError ? '1px solid rgba(255, 0, 0, 0.3)' : 'none',
                            marginBottom: '0px',
                            width: '100%',
                            maxWidth: '600px',
                            backdropFilter: appMessage.isError ? 'blur(4px)' : 'none'
                        }}>
                            {appMessage.text}
                        </div>
                    )}

                    <Controls
                        onNext={handleNextCard}
                        onPrev={handlePrevCard}
                        onMarkLearned={handleMarkAsLearned}
                        onReset={handleReset}
                        currentIndex={currentIndex}
                        totalCards={filteredData.length}
                        deckNames={deckNames}
                        currentDeckName={currentDeckName}
                        onDeckChange={handleDeckChange}
                        isAudioLoading={isAudioLoading}
                        language={language}
                    />
                </div>
            </div>

            {isIpaModalOpen && <IpaModal onClose={onCloseIpaModal} />}

            {isPhonicsModalOpen && (
                <PhonicsModal
                    onClose={onClosePhonicsModal}
                    setAppMessage={setAppMessage}
                    setIsAudioLoading={setIsAudioLoading}
                    currentCategory={currentCategory || 'phonics'}
                    currentDeckName={currentDeckName || 'phonics'}
                    selectedTone={selectedTone}
                />
            )}
        </div>
    );
}