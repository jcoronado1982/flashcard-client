import { useState, useEffect, useCallback, useRef } from 'react';

// --- ¡CAMBIO CRÍTICO: Importamos la URL centralizada! ---
// Esto permite que funcione en local (localhost) y en producción (Cloud Run) automáticamente.
import { API_URL } from '../../config/api';

const MAX_IMAGE_ATTEMPTS = 3;
const IMAGE_RETRY_DELAY = 5000;

export function useImageGeneration({
    cardData,
    currentCategory,
    currentDeckName,
    setAppMessage,
    updateCardImagePath
}) {
    const [isImageLoading, setIsImageLoading] = useState(true);
    const [imageUrl, setImageUrl] = useState(null);
    const imageRef = useRef(null);
    const imageAttempts = useRef({});

    // Estado para saber qué índice de definición se está mostrando actualmente
    const [currentDefIndex, setCurrentDefIndex] = useState(0);

    // --- 1. GENERAR IMAGEN (IA) ---
    const generateAndLoadImage = useCallback(async (defIndex = 0) => {
        if (!cardData || !cardData.definitions?.[defIndex] || !currentCategory) return;

        setCurrentDefIndex(defIndex);

        // Inicializar contador de intentos
        if (!imageAttempts.current[defIndex]) {
            imageAttempts.current[defIndex] = 0;
        }

        // Límite de intentos
        if (imageAttempts.current[defIndex] >= MAX_IMAGE_ATTEMPTS) {
            setAppMessage({
                text: `Fallaron todos los intentos para imagen def ${defIndex + 1}`,
                isError: true
            });
            setIsImageLoading(false);
            return;
        }

        imageAttempts.current[defIndex]++;
        setIsImageLoading(true);
        setAppMessage({
            text: `⏳ Cargando imagen (Def ${defIndex + 1})...`,
            isError: false
        });

        try {
            const def = cardData.definitions[defIndex];
            const prompt = `Generate a single, clear, educational illustration for the word "${cardData.name}" meaning "${def.meaning}". Context: "${def.usage_example}". Style: Photorealistic, bright, daylight. No text or labels.`;

            const forceFlag = cardData.force_generation;

            // Usamos la API_URL importada
            const res = await fetch(`${API_URL}/api/generate-image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: currentCategory,
                    deck: currentDeckName,
                    index: cardData.id,
                    def_index: defIndex,
                    prompt,
                    force_generation: forceFlag
                })
            });

            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error("La generación de imagen está deshabilitada para esta tarjeta (force_generation=false).");
                }
                throw new Error(`Error HTTP ${res.status}`);
            }

            const data = await res.json();
            if (!data?.path) throw new Error("Sin ruta de imagen en la respuesta");

            // Añadimos timestamp para evitar caché vieja
            const fullPath = `${API_URL}${data.path}?t=${Date.now()}`;

            updateCardImagePath(cardData.id, data.path, defIndex);

            if (imageRef.current) {
                imageRef.current.src = fullPath;
            }

            setImageUrl(fullPath);

            setIsImageLoading(false);
            setAppMessage({
                text: `¡Imagen (Def ${defIndex + 1}) lista!`,
                isError: false
            });

        } catch (err) {
            console.warn(`Error imagen def ${defIndex}:`, err);

            const isDisabled = err.message.includes("deshabilitada");

            if (isDisabled || imageAttempts.current[defIndex] >= MAX_IMAGE_ATTEMPTS) {
                setAppMessage({
                    text: isDisabled ? err.message : `Error final al cargar imagen: ${err.message}`,
                    isError: !isDisabled
                });
                setIsImageLoading(false);
            } else {
                // Reintentar
                setTimeout(() => generateAndLoadImage(defIndex), IMAGE_RETRY_DELAY);
            }
        }
    }, [cardData, currentCategory, currentDeckName, setAppMessage, updateCardImagePath]);


    // --- 2. MOSTRAR IMAGEN (Lógica de visualización) ---
    const displayImageForIndex = useCallback((defIndex) => {
        if (!cardData || !cardData.definitions?.[defIndex]) return;

        setCurrentDefIndex(defIndex);
        setImageUrl(null);
        setIsImageLoading(true);

        const definition = cardData.definitions[defIndex];

        if (definition.imagePath) {
            const fullPath = `${API_URL}${definition.imagePath}?t=${Date.now()}`;
            const img = new Image();
            img.src = fullPath;
            img.onload = () => {
                if (imageRef.current) imageRef.current.src = fullPath;
                setImageUrl(fullPath);
                setIsImageLoading(false);
            };
            img.onerror = () => {
                console.warn(`No se pudo cargar la imagen existente en ${fullPath}. Generando una nueva.`);
                generateAndLoadImage(defIndex);
            };
        } else {
            generateAndLoadImage(defIndex);
        }
    }, [cardData, generateAndLoadImage]);


    // Carga inicial
    useEffect(() => {
        if (!cardData) return;
        setIsImageLoading(true);
        setImageUrl(null);
        imageAttempts.current = {};

        setCurrentDefIndex(0);

        const firstDefinition = cardData.definitions?.[0];
        if (firstDefinition?.imagePath) {
            const fullPath = `${API_URL}${firstDefinition.imagePath}?t=${Date.now()}`;
            const img = new Image();
            img.src = fullPath;
            img.onload = () => {
                if (imageRef.current) imageRef.current.src = fullPath;
                setImageUrl(fullPath);
                setIsImageLoading(false);
            };
            img.onerror = () => generateAndLoadImage(0);
        } else {
            generateAndLoadImage(0);
        }
    }, [cardData, generateAndLoadImage]);

    // --- 3. BORRAR IMAGEN ---
    const deleteImage = useCallback(async () => {
        if (!cardData || !cardData.definitions?.[currentDefIndex] || !currentCategory || !currentDeckName) {
            setAppMessage({ text: 'Error: No se puede eliminar la imagen (datos incompletos)', isError: true });
            return;
        }

        if (!imageUrl && !isImageLoading) {
            setAppMessage({ text: 'No hay imagen para eliminar', isError: false });
            return;
        }

        setAppMessage({ text: 'Eliminando imagen...', isError: false });
        setIsImageLoading(true);

        try {
            // Usamos la API_URL importada
            const res = await fetch(`${API_URL}/api/delete-image`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: currentCategory,
                    deck: currentDeckName,
                    index: cardData.id,
                    def_index: currentDefIndex
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || 'Error en el servidor al eliminar');
            }

            setImageUrl(null);
            updateCardImagePath(cardData.id, null, currentDefIndex);

            setAppMessage({ text: 'Imagen eliminada con éxito.', isError: false });

        } catch (err) {
            console.error('Error al eliminar imagen:', err);
            setAppMessage({ text: `Error: ${err.message}`, isError: true });
        } finally {
            setIsImageLoading(false);
        }
    }, [
        cardData,
        currentCategory,
        currentDeckName,
        currentDefIndex,
        imageUrl,
        isImageLoading,
        setAppMessage,
        updateCardImagePath
    ]);

    // --- 4. SUBIR IMAGEN ---
    const uploadImage = useCallback(async (file) => {
        if (!file || !cardData || !currentCategory || !currentDeckName) {
            setAppMessage({ text: 'Error: Faltan datos para subir la imagen.', isError: true });
            return;
        }

        setAppMessage({ text: 'Subiendo imagen...', isError: false });
        setIsImageLoading(true);
        setImageUrl(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', currentCategory);
        formData.append('deck', currentDeckName);
        formData.append('card_index', cardData.id);
        formData.append('def_index', currentDefIndex);

        try {
            // Usamos la API_URL importada
            const res = await fetch(`${API_URL}/api/upload-image`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || 'Error en el servidor al subir la imagen.');
            }

            const data = await res.json();
            if (!data?.path) throw new Error("Sin ruta de imagen en la respuesta de subida.");

            const fullPath = `${API_URL}${data.path}?t=${Date.now()}`;

            updateCardImagePath(cardData.id, data.path, currentDefIndex);

            if (imageRef.current) {
                imageRef.current.src = fullPath;
            }
            setImageUrl(fullPath);

            setAppMessage({ text: 'Imagen subida y guardada con éxito.', isError: false });

        } catch (err) {
            console.error('Error al subir imagen:', err);
            setAppMessage({ text: `Error al subir: ${err.message}`, isError: true });
            setImageUrl(null);

        } finally {
            setIsImageLoading(false);
        }
    }, [
        cardData,
        currentCategory,
        currentDeckName,
        currentDefIndex,
        setAppMessage,
        updateCardImagePath
    ]);


    return {
        isImageLoading,
        imageUrl,
        imageRef,
        displayImageForIndex,
        deleteImage,
        uploadImage
    };
}