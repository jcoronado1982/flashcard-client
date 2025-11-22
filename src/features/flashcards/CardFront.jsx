import React, { useRef, useState } from 'react'; // <-- AGREGAMOS useState aquí
import styles from './Flashcard.module.css';
import HighlightedText from './HighlightedText';
// 🚀 Importamos los iconos necesarios, incluyendo FaUpload
import { FaHeadphones, FaTimes, FaUpload } from 'react-icons/fa'; // <-- Importamos FaUpload
import MTGCard from '../../components/MTGCard';

function CardFront({
    cardData,
    onOpenIpaModal,
    playAudio,
    activeAudioText,
    highlightedWordIndex,
    blurredState,
    toggleBlur,
    isImageLoading,
    imageUrl,
    imageRef,
    displayImageForIndex,
    // --- ¡NUEVAS PROPS RECIBIDAS! ---
    deleteImage,
    uploadImage // <-- ¡Recibimos la nueva función!
}) {
    // Necesitamos este estado para manejar si el archivo se está procesando
    const [isUploading, setIsUploading] = useState(false);
    const uploadInputRef = useRef(null);

    // Determinar si mostrar la imagen (y sus controles)
    const showImage = imageUrl && !isImageLoading && !isUploading; // No mostrar controles si estamos subiendo

    // Handler para cuando el usuario selecciona un archivo
    const handleFileChange = async (e) => {
        e.stopPropagation();
        const file = e.target.files[0];
        if (file) {
            setIsUploading(true); // Iniciamos el estado de subida
            try {
                await uploadImage(file);
            } finally {
                setIsUploading(false); // Finalizamos el estado de subida
            }
        }
        // Resetear el valor del input para permitir la subida del mismo archivo otra vez
        e.target.value = null;
    };

    // Deshabilitar botones si hay carga de IA o estamos subiendo
    const isDisabled = isImageLoading || isUploading;

    // Handler para activar el click del input file
    const triggerUpload = (e) => {
        e.stopPropagation();
        if (uploadInputRef.current) {
            uploadInputRef.current.click();
        }
    };

    return (
        <div className={styles.cardFront}>

            {/* Botón de sonido principal (altavoz grande) */}
            <button
                className={styles.soundButton}
                onClick={(e) => {
                    e.stopPropagation();
                    playAudio(cardData.name);
                    displayImageForIndex(0);
                }}
                disabled={isDisabled}
            >
                🔊
            </button>

            <h2 className={styles.name}>
                <HighlightedText
                    text={cardData.name}
                    activeAudioText={activeAudioText}
                    highlightedWordIndex={highlightedWordIndex}
                />
            </h2>

            {/* Contenedor de Fonética */}
            <div className={styles.phoneticContainer}>
                <p className={styles.phonetic}>{cardData.phonetic}</p>

                {/* 🎧 Botón de la tabla IPA */}
                <button
                    className={styles.ipaChartBtn}
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenIpaModal();
                    }}
                    disabled={isDisabled}
                >
                    <FaHeadphones size={16} />
                </button>
            </div>

            <div className={styles.allExamplesContainer}>
                <ul>
                    {cardData.definitions?.map((def, di) => (
                        <li key={di}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    playAudio(def.usage_example);
                                    displayImageForIndex(di);
                                }}
                                disabled={isDisabled}
                            >
                                🔊
                            </button>
                            <div
                                className={blurredState[di] ? styles.blurredText : ''}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleBlur(di);
                                }}
                            >
                                <HighlightedText
                                    text={def.usage_example}
                                    activeAudioText={activeAudioText}
                                    highlightedWordIndex={highlightedWordIndex}
                                />
                            </div>
                            {!blurredState[di] && (
                                <span className={styles.customTooltip}>
                                    {def.pronunciation_guide_es}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {/* --- Lógica de Imagen y Botones de Control --- */}
            <div className={styles.imagePlaceholder}>

                {/* Contenedor de botones de gestión de imagen (Subir/Eliminar) */}
                <div className={styles.imageControls}>

                    {/* Input de archivo oculto */}
                    <input
                        type="file"
                        ref={uploadInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        accept="image/*"
                        disabled={isDisabled}
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* ✅ LÓGICA CONDICIONAL CLAVE: Mostrar Borrar O Subir en la misma posición */}
                    {showImage ? (
                        // MOSTRAR BOTÓN DE BORRAR (FaTimes) si hay imagen visible
                        <button
                            className={`${styles.imageControlBtn} ${styles.deleteImageBtn}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteImage();
                            }}
                            title="Eliminar imagen actual"
                            disabled={isDisabled}
                        >
                            <FaTimes size={20} />
                        </button>
                    ) : (
                        // MOSTRAR BOTÓN DE SUBIR (FaUpload) si NO hay imagen visible
                        <button
                            className={`${styles.imageControlBtn} ${styles.uploadImageBtn}`}
                            onClick={triggerUpload}
                            title="Subir imagen desde el equipo"
                            disabled={isDisabled}
                        >
                            <FaUpload size={18} />
                        </button>
                    )}
                </div>
                {/* ----------------------------------------------------------------- */}

                {/* VISUALIZADOR DE IMAGEN / LOADING */}
                {isImageLoading || isUploading ? (
                    <img
                        src="/loading.gif"
                        alt="Loading..."
                        style={{ width: '100px', height: '100px' }}
                    />
                ) : imageUrl ? (
                    <img
                        ref={imageRef}
                        className={`${styles.image} ${styles.imageVisible}`}
                        src={imageUrl}
                        alt={cardData.name || 'Flashcard image'}
                    />
                ) : (
                    <img
                        src="https://placehold.co/600x400/e9ecef/6c757d?text=No+Image"
                        alt="Image not available"
                        className={styles.noImagePlaceholderImg}
                    />
                )}
            </div>

        </div>
    );
}

export default CardFront;
