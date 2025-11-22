// src/features/flashcards/CategorySelector.jsx (AJUSTADO)

import React, { useRef, useEffect } from 'react';
import styles from './CategorySelector.module.css';

// Importa las imágenes (mantengo tus imports originales)
import phrasal_verbs from '../../assets/Phrasal Verbs.png';
import nouns from '../../assets/Nouns.png';
import adjectives from '../../assets/Adjectives.png';
import verbs from '../../assets/Verbs.png';
import adverbs from '../../assets/Adverb.png';
import preposition from '../../assets/Preposition.png';
import connectors from '../../assets/Connectors.png';
import determinant from '../../assets/Determinant.png';
import pronouns from '../../assets/Pronouns.png';
import empty from '../../assets/empty.png';

// Diccionario de imágenes por categoría
const categoryImages = {
  phrasal_verbs: phrasal_verbs,
  nouns: nouns,
  adjectives: adjectives,
  verbs: verbs,
  adverbs: adverbs,
  preposition: preposition,
  connectors: connectors,
  determinant: determinant,
  pronouns: pronouns, 
  default: empty,
};

// Normaliza nombres de categorías
const normalize = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/\s+/g, '_').replace(/-+/g, '_');
};

// Formatea nombre para mostrarlo en texto
const formatName = (name) => {
  if (!name) return '';
  const spacedName = name.replace(/[_-]/g, ' ');
  return spacedName.charAt(0).toUpperCase() + spacedName.slice(1);
};

function CategorySelector({ categories, currentCategory, onCategoryChange, isDisabled }) {
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // 🚀 FUNCIÓN AÑADIDA: Desplaza el contenedor para centrar el elemento (Mantenida)
  const scrollToCenter = (element) => {
    if (!scrollRef.current || !element) return;
    
    const container = scrollRef.current;
    const containerWidth = container.offsetWidth;
    const elementLeft = element.offsetLeft - container.offsetLeft; 
    const elementWidth = element.offsetWidth; 
    const newScrollLeft = elementLeft + (elementWidth / 2) - (containerWidth / 2);
    
    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  // --- Handlers de Interacción (Mantenidos) ---
  
  // Desplazamiento con la rueda del ratón → scroll horizontal
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollBy({ left: e.deltaY, behavior: 'smooth' });
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // Arrastrar con mouse o touch
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onPointerDown = (e) => {
      isDragging.current = true;
      el.classList.add(styles.dragging);
      startX.current = e.pageX || e.touches[0].pageX;
      scrollLeft.current = el.scrollLeft;
    };

    const onPointerMove = (e) => {
      if (!isDragging.current) return;
      const x = e.pageX || (e.touches && e.touches[0].pageX);
      const walk = startX.current - x;
      el.scrollLeft = scrollLeft.current + walk;
    };

    const stopDrag = () => {
      isDragging.current = false;
      el.classList.remove(styles.dragging);
    };
    
    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stopDrag);
    el.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', stopDrag);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', stopDrag);
      el.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', stopDrag);
    };
  }, []);
  
  // Efecto para centrar la tarjeta ACTIVA al cargar o cambiar la categoría
  useEffect(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current && currentCategory) {
        const activeElement = scrollRef.current.querySelector(`[data-category="${normalize(currentCategory)}"]`);
        if (activeElement) {
          scrollToCenter(activeElement);
        }
      }
    });
  }, [currentCategory]);


  if (!categories || categories.length === 0) {
    return <div className={styles.loading}>Cargando categorías...</div>;
  }
  
  // Handler de clic modificado
  const handleCardClick = (category, event) => {
    // Solo centramos si es un clic, no un arrastre fallido
    if (!isDragging.current) {
        scrollToCenter(event.currentTarget);
    }
    
    // Notifica el cambio de categoría
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  return (
    <div className={styles.categoryDeck}>
      <div className={styles.cardContainer} ref={scrollRef}>
        {categories.map((category) => {
          const normalized = normalize(category);
          const isActive = category === currentCategory;
          const imageUrl = categoryImages[normalized] || categoryImages.default;

          return (
            <button
              key={category}
               data-category={normalized} 
              className={`${styles.categoryCard} ${isActive ? styles.activeCard : ''}`}
              onClick={(e) => handleCardClick(category, e)} 
              disabled={isDisabled}
            >
              <div className={styles.imageWrapper}>
                <img src={imageUrl} alt={formatName(category)} />
                {/* ❌ ELIMINADO: Bloque del overlay "Seleccionado" ❌ */}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CategorySelector;