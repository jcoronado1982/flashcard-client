import React, { useState, useEffect } from 'react';
import styles from './PhonicsModal.module.css';
import { useAudioPlayback } from './useAudioPlayback.jsx'; // Importamos el hook de audio

// --- ¡CAMBIO: Importamos la URL centralizada! ---
// Esto permite que funcione en local y en Vercel automáticamente
import { API_URL } from '../../config/api';

function PhonicsModal({
    onClose,
    setAppMessage,
    setIsAudioLoading,
    // --- ¡NUEVAS PROPS ACEPTADAS! ---
    currentCategory, // La recibimos de App.jsx (aunque la ignoraremos)
    currentDeckName,
    selectedTone
}) {

    const [phonicsData, setPhonicsData] = useState([]); // Almacena los datos del JSON
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. Instanciamos el hook de audio con las props
    const {
        playAudio,
        isAudioPlaying,
        activeAudioText
    } = useAudioPlayback({
        setAppMessage,
        setIsAudioLoading,
        // --- ¡CAMBIOS APLICADOS! ---
        // Forzamos AMBOS a "phonics" para que el backend guarde
        // los audios en la carpeta /card_audio/phonics/phonics/
        currentCategory: "phonics",
        currentDeckName: "phonics",
        selectedTone: selectedTone,
        verbName: 'phonics_sample' // Un nombre genérico para la síntesis
    });

    // 3. Cargamos los datos del JSON desde nuestro nuevo endpoint
    useEffect(() => {
        const fetchPhonicsData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Llamamos al endpoint usando la API_URL importada
                const response = await fetch(`${API_URL}/api/phonics-data`);
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.detail || `Error ${response.status}`);
                }
                const data = await response.json();
                if (Array.isArray(data)) {
                    setPhonicsData(data); // Guardamos los datos en el estado
                } else {
                    throw new Error("El formato de los datos de fonética no es el esperado.");
                }
            } catch (err) {
                console.error("Error fetching phonics data:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPhonicsData();
    }, []); // El array vacío [] asegura que esto se ejecute solo una vez


    // 4. Función para reproducir el audio de un ejemplo
    const handleExampleClick = (exampleWord) => {
        // Simplemente llamamos al hook de audio con la palabra
        playAudio(exampleWord);
    };


    // 5. Lógica de renderizado
    const renderContent = () => {
        if (isLoading) {
            return <div className={styles.loading}>Cargando reglas de fonética...</div>;
        }

        if (error) {
            return <div className={styles.error}>{error}</div>;
        }

        if (phonicsData.length === 0) {
            return <div className={styles.error}>No se encontraron reglas de fonética.</div>;
        }

        // Mapeamos el array de reglas (cada objeto del JSON)
        return (
            <div className={styles.rulesContainer}>
                {phonicsData.map((ruleData, index) => (
                    <div key={index} className={styles.ruleBlock}>
                        {/* Título de la regla y cómo suena */}
                        <h3 className={styles.ruleTitle}>
                            <span className={styles.ruleText}>{ruleData.rule}</span>
                            <span className={styles.ruleSoundsLike}>{ruleData.sounds_like}</span>
                        </h3>
                        {/* Cuadrícula de ejemplos */}
                        <div className={styles.examplesGrid}>
                            {ruleData.examples.map((example, exIndex) => {
                                // --- ¡LÓGICA DE CLASE AÑADIDA AQUÍ! ---
                                const isThisButtonActive = isAudioPlaying && activeAudioText === example;
                                const buttonClass = `${styles.exampleButton} ${isThisButtonActive ? styles.activeButton : ''}`;

                                return (
                                    <button
                                        key={exIndex}
                                        // --- ¡CLASE MODIFICADA! ---
                                        className={buttonClass}
                                        onClick={() => handleExampleClick(example)}
                                        title={isThisButtonActive ? "Reproduciendo..." : `Reproducir ${example}`}
                                        // Deshabilita CUALQUIER botón si el audio está sonando.
                                        disabled={isAudioPlaying}
                                    >
                                        {/* Icono de audio */}
                                        <span className={styles.audioIcon}>
                                            {/* Mostramos '...' solo si ESTE botón es el que está activo */}
                                            {isThisButtonActive ? '...' : '🔊'}
                                        </span>
                                        {/* Contenedor para texto e IPA */}
                                        <div className={styles.exampleTextContainer}>
                                            <span className={styles.exampleText}>{example}</span>
                                            {/* Mostramos el IPA correspondiente por índice */}
                                            <span className={styles.exampleIpa}>{ruleData.ipa[exIndex]}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        // Contenedor del modal (fondo oscuro)
        <div className={styles.modal} onClick={onClose}>
            {/* Contenido del modal (caja blanca) */}
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>

                {/* Botón de cerrar */}
                <button className={styles.closeButton} onClick={onClose}>&times;</button>

                {/* --- CONTENIDO DEL POPUP --- */}
                {/* Usamos la función de renderizado */}
                {renderContent()}
                {/* --- FIN DEL CONTENIDO --- */}

            </div>
        </div>
    );
}

export default PhonicsModal;