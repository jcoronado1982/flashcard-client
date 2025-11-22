// src/pages/FlashcardPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import Flashcard from '../features/flashcards/Flashcard';
import Controls from '../features/flashcards/Controls';
import IpaModal from '../features/flashcards/IpaModal';
import PhonicsModal from '../features/flashcards/PhonicsModal'; 
// 1. Importamos el selector de categorías para restaurar el carrusel
import CategorySelector from '../features/flashcards/CategorySelector'; 
import FloatingMenu from '../components/layout/FloatingMenu';

const API_URL = 'http://127.0.0.1:8000';

// --- ¡CAMBIO 1: Definir la llave base para localStorage! ---
const LAST_DECK_KEY_PREFIX = 'flashcards_last_deck_';

// --- Aceptamos todas las props de App.jsx y del Carrusel ---
export default function FlashcardPage({
    currentCategory,     // Prop de App (categoría seleccionada actualmente)
    appMessage,          // Prop de App (para mensajes de feedback)
    setAppMessage,       // Prop de App (para enviar mensajes de feedback)
    isAudioLoading,      // Prop de App (estado de carga global de audio)
    setIsAudioLoading,   // Prop de App (para actualizar el estado de carga de audio)
    selectedTone,        // Prop de App (tono de voz seleccionado)
    isLoadingCategories, // Prop de App (la carga inicial de categorías)
    categories,          // Prop de App (lista de categorías)
    onCategoryChange     // Prop de App (handler para cambiar la categoría)
}) {
    
    // --- ESTADOS LOCALES (Solo para decks y tarjetas) ---
    const [masterData, setMasterData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    
    const [isDeckLoading, setIsDeckLoading] = useState(true); // Carga de decks/tarjetas
    
    // 🔴 ESTADO CLAVE: Visibilidad de los modales
    const [isIpaModalOpen, setIsIpaModalOpen] = useState(false);
    const [isPhonicsModalOpen, setIsPhonicsModalOpen] = useState(false);

    // 🔴 ESTADO CLAVE: Visibilidad del carrusel de categorías
    const [isCategorySelectorVisible, setIsCategorySelectorVisible] = useState(false);

    const [deckNames, setDeckNames] = useState([]);
    const [currentDeckName, setCurrentDeckName] = useState(null);

    // 🎯 FUNCIÓN AÑADIDA: Para alternar la visibilidad del carrusel
    const handleToggleCategorySelector = useCallback(() => {
      setIsCategorySelectorVisible(prev => !prev);
    }, []);


    // --- LÓGICA DE DATOS (Mantenida, basada en tu código) ---
    
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
                definitions: (Array.isArray(card.definitions) ? card.definitions : []).map(def => ({...def, imagePath: def.imagePath || null })),
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
                    
                    // --- ¡CAMBIO 2: Lógica para cargar el deck guardado! ---
                    let deckToLoad = rawDeckNames[0]; // Por defecto, el primero
                    try {
                        const storageKey = `${LAST_DECK_KEY_PREFIX}${currentCategory}`;
                        const savedDeck = localStorage.getItem(storageKey);
        
                        // Comprobar si el deck guardado es válido y existe en la lista actual
                        if (savedDeck && rawDeckNames.includes(savedDeck)) {
                            deckToLoad = savedDeck;
                        }
                    } catch (e) {
                        console.warn("No se pudo leer el deck de localStorage:", e);
                    }
                    setCurrentDeckName(deckToLoad); 
                    // --------------------------------------------------

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

            // --- ¡CAMBIO 3: Guardar el deck seleccionado! ---
            try {
                // Usamos la categoría actual para crear una llave única
                const storageKey = `${LAST_DECK_KEY_PREFIX}${currentCategory}`;
                localStorage.setItem(storageKey, newDeck);
            } catch (e) {
                console.error("No se pudo guardar el deck en localStorage:", e);
            }
            // ---------------------------------------------

            setMasterData([]);
            setFilteredData([]);
            setIsDeckLoading(true); 
        }
    // --- ¡CAMBIO 4: Añadir currentCategory a las dependencias! ---
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

        // --- ¡CAMBIO 5: Reemplazar window.confirm! ---
        // window.confirm no es fiable en todos los entornos (como este).
        // Usamos prompt como una alternativa simple que sí funciona.
        const confirmation = prompt(`Escribe 'RESET' para confirmar que quieres resetear el progreso de '${currentDeckName}'.`);

        if (confirmation === 'RESET') {
        // if (window.confirm(`¿Estás seguro de que quieres resetear el progreso de '${currentDeckName}'?`)) {
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
        // ... (Lógica de actualización de ruta de imagen sin cambios)
        console.log(`App: Actualizando imagePath para cardId=${cardId}, defIndex=${defIndex}, newPath=${newPath}`); 
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

    
    if (isLoadingCategories) {
        return <div className="loading-container"><img src="/loading.gif" alt="Cargando categorías..." /></div>;
    }

    // --- RENDERIZADO (JSX) ---
    return (
        <div className="flashcard-page-wrapper">
            
            {/* 🚀 FloatingMenu ahora recibe los handlers para los modales */}
            <FloatingMenu 
                onToggleCategories={handleToggleCategorySelector} 
                onOpenIpaModal={() => setIsIpaModalOpen(true)}         // <-- Handler para Modal IPA
                onOpenPhonicsModal={() => setIsPhonicsModalOpen(true)} // <-- Handler para Modal Phonics
            />

            {/* Renderizado Condicional del Carrusel */}
            {isCategorySelectorVisible && (
                <CategorySelector 
                    categories={categories}
                    currentCategory={currentCategory}
                    onCategoryChange={onCategoryChange}
                    isDisabled={isAudioLoading}
                />
            )}
            
            <div className="app-container">
                <div className="flashcard-main-area">
                    
                    {/* Lógica de Carga y Mensaje */}
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
                            // Componente Flashcard
                            <Flashcard
                                key={`${currentCategory}-${currentDeckName}-${currentCard.id}`}
                                cardData={currentCard}
                                // Handlers de Modales pasados al componente Flashcard
                                onOpenIpaModal={() => setIsIpaModalOpen(true)}
                                onOpenPhonicsModal={() => setIsPhonicsModalOpen(true)}
                                
                                setAppMessage={setAppMessage} 
                                updateCardImagePath={updateCardImagePath}
                                currentCategory={currentCategory} 
                                currentDeckName={currentDeckName}
                                setIsAudioLoading={setIsAudioLoading} 
                                selectedTone={selectedTone} 
                            />
                        )
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
                    />
                </div>
            </div>

            {/* Renderizado Condicional del Modal IPA */}
            {isIpaModalOpen && <IpaModal onClose={() => setIsIpaModalOpen(false)} />}
            
            {/* Renderizado Condicional del Modal Phonics */}
            {isPhonicsModalOpen && (
                <PhonicsModal 
                    onClose={() => setIsPhonicsModalOpen(false)} 
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

