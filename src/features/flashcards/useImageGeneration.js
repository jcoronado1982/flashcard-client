import { useState, useEffect, useCallback, useRef } from 'react';

const API_URL = 'http://127.0.0.1:8000';
const MAX_IMAGE_ATTEMPTS = 3;
const IMAGE_RETRY_DELAY = 5000;

export function useImageGeneration({ 
    cardData, 
    // --- ¡PROP AÑADIDA! ---
    currentCategory,
    currentDeckName, 
    setAppMessage, 
    updateCardImagePath 
}) {
    const [isImageLoading, setIsImageLoading] = useState(true);
    const [imageUrl, setImageUrl] = useState(null);
    const imageRef = useRef(null);
    const imageAttempts = useRef({});
    
    // --- ¡CAMBIO 1: Estado para saber qué índice de definición se está mostrando! ---
    // Esto es necesario para que la función de borrado/subida sepa qué definición actualizar.
    const [currentDefIndex, setCurrentDefIndex] = useState(0);

    const generateAndLoadImage = useCallback(async (defIndex = 0) => {
        // --- ¡CHECK AÑADIDO! ---
        if (!cardData || !cardData.definitions?.[defIndex] || !currentCategory) return;

        // --- ¡CAMBIO 2: Actualizar el índice actual! ---
        setCurrentDefIndex(defIndex);

        if (!imageAttempts.current[defIndex]) {
            imageAttempts.current[defIndex] = 0;
        }

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
            // --- Prompt actualizado para ser más genérico ---
            const prompt = `Generate a single, clear, educational illustration for the word "${cardData.name}" meaning "${def.meaning}". Context: "${def.usage_example}". Style: Photorealistic, bright, daylight. No text or labels.`;
            
            const forceFlag = cardData.force_generation;
            
            const res = await fetch(`${API_URL}/api/generate-image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // --- ¡CAMBIO APLICADO! ---
                    category: currentCategory,
                    deck: currentDeckName,
                    // -------------------------
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
            
            if (err.message.includes("deshabilitada") || imageAttempts.current[defIndex] >= MAX_IMAGE_ATTEMPTS) {
                setAppMessage({
                    text: err.message.includes("deshabilitada") ? err.message : `Error final al cargar imagen: ${err.message}`,
                    isError: true
                });
                setIsImageLoading(false); // <-- Importante: detener el spinner
            } else {
                setTimeout(() => generateAndLoadImage(defIndex), IMAGE_RETRY_DELAY);
            }
        }
    // --- ¡DEPENDENCIA AÑADIDA! ---
    }, [cardData, currentCategory, currentDeckName, setAppMessage, updateCardImagePath]);

    
    const displayImageForIndex = useCallback((defIndex) => {
        if (!cardData || !cardData.definitions?.[defIndex]) return;

        // --- ¡CAMBIO 3: Actualizar el índice actual! ---
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


    // useEffect de carga inicial
    useEffect(() => {
        if (!cardData) return;
        setIsImageLoading(true);
        setImageUrl(null);
        imageAttempts.current = {};

        // --- ¡CAMBIO 4: Actualizar el índice actual al cargar la tarjeta! ---
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

    // --- ¡CAMBIO 5: Añadir la función deleteImage! ---
    const deleteImage = useCallback(async () => {
        // Usamos currentDefIndex para saber qué imagen borrar
        if (!cardData || !cardData.definitions?.[currentDefIndex] || !currentCategory || !currentDeckName) {
            setAppMessage({ text: 'Error: No se puede eliminar la imagen (datos incompletos)', isError: true });
            return;
        }

        // Evitar que el usuario borre la imagen placeholder de "No Image"
        if (!imageUrl && !isImageLoading) {
            setAppMessage({ text: 'No hay imagen para eliminar', isError: false });
            return;
        }

        setAppMessage({ text: 'Eliminando imagen...', isError: false });
        setIsImageLoading(true); // Mostrar spinner mientras se borra

        try {
            const res = await fetch(`${API_URL}/api/delete-image`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: currentCategory,
                    deck: currentDeckName,
                    index: cardData.id,
                    def_index: currentDefIndex // Usamos el índice guardado
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || 'Error en el servidor al eliminar');
            }

            // Éxito: Limpiar el estado en el frontend
            setImageUrl(null); // Oculta la imagen
            updateCardImagePath(cardData.id, null, currentDefIndex); // Borra la ruta del estado maestro
            
            setAppMessage({ text: 'Imagen eliminada con éxito.', isError: false });

        } catch (err) {
            console.error('Error al eliminar imagen:', err);
            setAppMessage({ text: `Error: ${err.message}`, isError: true });
        } finally {
            setIsImageLoading(false); // Oculta el spinner (mostrará el placeholder de "No Image")
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
    
    // --- ¡NUEVA FUNCIÓN AÑADIDA: uploadImage! ---
    const uploadImage = useCallback(async (file) => {
        if (!file || !cardData || !currentCategory || !currentDeckName) {
            setAppMessage({ text: 'Error: Faltan datos para subir la imagen.', isError: true });
            return;
        }
        
        setAppMessage({ text: 'Subiendo imagen...', isError: false });
        setIsImageLoading(true);
        setImageUrl(null); // Limpiamos la URL anterior

        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', currentCategory);
        formData.append('deck', currentDeckName);
        formData.append('card_index', cardData.id);
        // Usamos el índice de definición actualmente seleccionado/mostrado
        formData.append('def_index', currentDefIndex); 
        
        try {
            const res = await fetch(`${API_URL}/api/upload-image`, {
                method: 'POST',
                // No establecemos 'Content-Type' aquí; el navegador lo hace automáticamente para FormData
                body: formData,
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || 'Error en el servidor al subir la imagen.');
            }

            const data = await res.json();
            if (!data?.path) throw new Error("Sin ruta de imagen en la respuesta de subida.");
            
            const fullPath = `${API_URL}${data.path}?t=${Date.now()}`;
            
            // 1. Actualiza el estado maestro de la aplicación
            updateCardImagePath(cardData.id, data.path, currentDefIndex); 
            
            // 2. Actualiza el estado local para mostrar la imagen
            if (imageRef.current) {
                imageRef.current.src = fullPath;
            }
            setImageUrl(fullPath);
            
            setAppMessage({ text: 'Imagen subida y guardada con éxito.', isError: false });

        } catch (err) {
            console.error('Error al subir imagen:', err);
            setAppMessage({ text: `Error al subir: ${err.message}`, isError: true });
            // Forzamos el placeholder si falla la subida
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


    // --- ¡CAMBIO 6: Exportar la nueva función! ---
    return { 
        isImageLoading, 
        imageUrl, 
        imageRef, 
        displayImageForIndex, 
        deleteImage,
        uploadImage // <-- ¡AÑADIDO!
    };
}
