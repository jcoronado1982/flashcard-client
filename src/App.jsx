import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css'; 

import Sidebar from './components/layout/Sidebar'; 
import FlashcardPage from './pages/FlashcardPage';
import GrammarPage from './pages/GrammarPage';
import TestPage from './pages/TestPage';
import Header from './components/layout/Header';

const API_URL = 'http://127.0.0.1:8000';

// --- ¡CAMBIO 1: Definir la llave para localStorage! ---
const LAST_CATEGORY_KEY = 'flashcards_last_category';

const toneOptions = [
  { label: "Presentador", value: "Read this like a news anchor: " },
  { label: "Casual", value: "Read this casually, like talking to a friend: " },
  { label: "Claro", value: "Read clearly: " },
  { label: "Formal", value: "Say in a formal and informative tone: " },
  { label: "Rápido", value: "Say quickly and urgently: " }
];

const CATEGORY_ORDER = [
  'pronouns',
  'verbs',
  'nouns',
  'preposition',
  'adjectives',
  'adverbs',
  'connectors',
  'determinant',
  'phrasal_verbs'
];

const sortCategories = (categories) => {
  return [...categories].sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a);
    const indexB = CATEGORY_ORDER.indexOf(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
};


function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [isCatalogVisible, setIsCatalogVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // --- ¡CAMBIO 2: Inicializar el estado de la categoría! ---
  // Lo dejamos 'null' por ahora, se establecerá en el useEffect.
  const [currentCategory, setCurrentCategory] = useState(null); 
  
  const [isLoading, setIsLoading] = useState(true); 
  const [appMessage, setAppMessage] = useState({ text: 'Cargando aplicación...', isError: false });
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [selectedTone, setSelectedTone] = useState(toneOptions[0].value);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const enableCatalogView = useCallback(() => {
    setIsCatalogVisible(true);
    setIsSidebarOpen(false); 
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      setAppMessage({ text: 'Buscando categorías...', isError: false });
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/categories`);
        if (!response.ok) throw new Error('No se pudo cargar la lista de categorías.');
        
        const result = await response.json();
        if (!result.success || !Array.isArray(result.categories)) {
          throw new Error('La respuesta de categorías no es válida.');
        }
        
        const sortedCategories = sortCategories(result.categories);
        setCategories(sortedCategories);
        
        // --- ¡CAMBIO 3: Lógica para cargar la categoría guardada! ---
        if (sortedCategories.length > 0) {
          let categoryToLoad = sortedCategories[0]; // Por defecto, la primera
          let message = 'Categorías cargadas.';

          try {
            const savedCategory = localStorage.getItem(LAST_CATEGORY_KEY);
            
            // Comprobar si la categoría guardada es válida y existe en la lista actual
            if (savedCategory && sortedCategories.includes(savedCategory)) {
              categoryToLoad = savedCategory;
              message = `Continuando en: ${savedCategory.replace(/_/g, ' ')}`;
            }
          } catch (e) {
            console.warn("No se pudo leer la categoría de localStorage:", e);
          }

          setCurrentCategory(categoryToLoad); 
          setAppMessage({ text: message, isError: false });
        } else {
          setAppMessage({ text: 'No se encontraron categorías.', isError: true });
        }
      } catch (error) {
        console.error("Error al cargar categorías:", error);
        setAppMessage({ text: `Error al cargar categorías: ${error.message}`, isError: true });
      } finally {
        setIsLoading(false); 
      }
    };
    fetchCategories();
  }, []); // Este useEffect se ejecuta solo una vez al cargar

  // --- ¡CAMBIO 4: Lógica para guardar la categoría al cambiar! ---
  const handleCategoryChange = useCallback((newCategory) => {
    if (newCategory !== currentCategory) {
      setCurrentCategory(newCategory);
      try {
        // Guardamos la nueva categoría en localStorage
        localStorage.setItem(LAST_CATEGORY_KEY, newCategory);
      } catch (e) {
        console.error("No se pudo guardar la categoría en localStorage:", e);
      }
    }
  }, [currentCategory]); // Se dispara cada vez que 'currentCategory' cambia

  const handleToneChange = useCallback((newToneValue) => {
    setSelectedTone(newToneValue);
  }, []);

  return (
    <div className="app-layout">
      {/* --- 1. El Menú Lateral --- */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        categories={categories}
        currentCategory={currentCategory}
        onCategoryChange={handleCategoryChange}
        isLoadingCategories={isLoading}
        isAudioLoading={isAudioLoading}
        onEnableCatalogView={enableCatalogView}
      />

      {/* --- 2. El Contenido Principal --- */}
      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        
        <Header 
          onMenuClick={toggleSidebar} 
          appMessage={appMessage} 
          toneOptions={toneOptions}
          selectedTone={selectedTone}
          onToneChange={handleToneChange}
        />

        <main className="page-content">
          <Routes>
            <Route 
              path="/flashcard" 
              element={
                <FlashcardPage 
                  currentCategory={currentCategory} 
                  appMessage={appMessage}
                  setAppMessage={setAppMessage}
                  isAudioLoading={isAudioLoading}
                  setIsAudioLoading={setIsAudioLoading}
                  selectedTone={selectedTone}
                  isLoadingCategories={isLoading} 
                  categories={categories}
                  onCategoryChange={handleCategoryChange}
                  isCatalogVisible={isCatalogVisible}
                />
              } 
            />
            <Route path="/grammar" element={<GrammarPage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/" element={<Navigate to="/flashcard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
export default App;

