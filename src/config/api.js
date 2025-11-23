// src/config/api.js

// Lógica inteligente de selección de URL:
// 1. Si existe la variable de entorno VITE_API_URL (Producción/Vercel), usa esa.
// 2. Si no, usa localhost (Desarrollo local).

export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Para depuración (puedes quitarlo luego si molesta en la consola)
console.log('🔌 API conectada a:', API_URL);