import { useState, useCallback } from 'react';

// --- ¡CAMBIO: Usamos la configuración centralizada! ---
import { API_URL } from '../../config/api';

const audioPlayer = new Audio();
const VOICE_POOL = ["Aoede", "Zephyr", "Charon", "Callirrhoe", "Iapetus", "Achernar", "Gacrux"];
const MAX_ATTEMPTS = 3;
const RETRY_DELAY = 5000;
const SYNC_OFFSET = 0.15; // Ajuste de sincronización de resaltado

export function useAudioPlayback({
    setAppMessage,
    setIsAudioLoading,
    currentCategory,
    currentDeckName,
    selectedTone,
    verbName
}) {
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [activeAudioText, setActiveAudioText] = useState(null);
    const [highlightedWordIndex, setHighlightedWordIndex] = useState(-1);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

    const playAudio = useCallback(async (originalText) => {
        if (!originalText || !currentCategory) return;

        const finalVerbName = currentDeckName === 'phonics' ? originalText : verbName;

        if (isAudioPlaying && audioPlayer.src) {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
            if (audioPlayer.src.startsWith('blob:')) {
                URL.revokeObjectURL(audioPlayer.src);
            }
        }

        setHighlightedWordIndex(-1);
        setActiveAudioText(originalText);
        setIsAudioPlaying(true);
        setIsAudioLoading(true);
        setIsGeneratingAudio(true);

        const randomVoice = VOICE_POOL[Math.floor(Math.random() * VOICE_POOL.length)];
        const toneToSend = selectedTone?.trim().replace(/:$/, '') || '';
        let audioUrl = null;
        let success = false;
        let res;

        try {
            for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
                try {
                    setAppMessage({ text: `⏳ Generando audio... (${attempt}/${MAX_ATTEMPTS})`, isError: false });

                    // Usamos la API_URL importada
                    res = await fetch(`${API_URL}/api/synthesize-speech`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            category: currentCategory,
                            deck: currentDeckName,
                            text: originalText,
                            voice_name: randomVoice,
                            model_name: 'gemini-2.5-pro-tts',
                            tone: toneToSend,
                            verb_name: finalVerbName
                        })
                    });

                    if (res.ok) {
                        success = true;
                        break;
                    }

                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.detail || `Error ${res.status}`);

                } catch (err) {
                    if (attempt === MAX_ATTEMPTS) throw err;
                    setAppMessage({ text: `Reintentando audio... (${attempt}/${MAX_ATTEMPTS})`, isError: true });
                    await new Promise((r) => setTimeout(r, RETRY_DELAY));
                }
            }

            if (!success) throw new Error('No se pudo generar el audio.');

            const data = await res.json();

            if (!data.audio_url) {
                throw new Error('No audio_url in response');
            }

            audioUrl = data.audio_url;
            audioPlayer.src = audioUrl;

            const words = originalText.trim().split(/\s+/);

            audioPlayer.ontimeupdate = () => {
                const { duration, currentTime } = audioPlayer;
                if (!duration || !isFinite(duration)) return;
                const tPerWord = duration / words.length;
                if (!tPerWord || !isFinite(tPerWord)) return;

                const idx = Math.min(
                    words.length - 1,
                    Math.floor((currentTime + SYNC_OFFSET) / tPerWord)
                );
                setHighlightedWordIndex((p) => (p !== idx ? idx : p));
            };

            audioPlayer.onended = () => {
                setIsAudioPlaying(false);
                setAppMessage({ text: 'Audio finalizado.', isError: false });
                setHighlightedWordIndex(-1);
                setActiveAudioText(null);
                setIsAudioLoading(false);
            };

            await audioPlayer.play();
            setAppMessage({ text: '▶️ Reproduciendo...', isError: false });

        } catch (err) {
            console.error('Error en playAudio:', err);
            setAppMessage({ text: `Error: ${err.message}`, isError: true });
            setIsAudioPlaying(false);
            setActiveAudioText(null);
            setHighlightedWordIndex(-1);
            setIsAudioLoading(false);
        } finally {
            setIsGeneratingAudio(false);
        }
    }, [
        isAudioPlaying,
        setAppMessage,
        setIsAudioLoading,
        currentCategory,
        currentDeckName,
        selectedTone,
        verbName,
    ]);

    return {
        playAudio,
        isAudioPlaying,
        activeAudioText,
        highlightedWordIndex,
        isGeneratingAudio
    };
}