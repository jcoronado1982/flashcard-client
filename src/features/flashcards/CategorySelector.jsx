// src/features/flashcards/CategorySelector.jsx

import React, { useRef, useEffect } from 'react';
import styles from './CategorySelector.module.css';
import MTGCard from '../../components/MTGCard';

// Importa las imágenes
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

// Diccionario de colores por categoría (MTG color identity)
const categoryColors = {
  phrasal_verbs: 'red',
  nouns: 'blue',
  adjectives: 'green',
  verbs: 'red',
  adverbs: 'green',
  preposition: 'white',
  connectors: 'blue',
  determinant: 'white',
  pronouns: 'gold',
};

// Diccionario de descripciones por categoría
const categoryDescriptions = {
  phrasal_verbs: 'VERBS are words express express actions, or occurrence. They elicit convey to eloicate a smoke.',
  verbs: 'VERBS are words express express actions, or occurrence. They elicit convey to eloicate a smoke.',
  nouns: 'NOUNS are words that represent a person, place, thing, or idea. They can be singular or plural, and often serve as the subject or object in a sentence.',
  adjectives: 'ADJECTIVES are words that describe or modify nouns. They give more information about the qualities, quantities, or states of being of the noun.',
  adverbs: 'ADVERBS are words that modify verbs, adjectives, or other adverbs. They often describe how, when, where, or to what extent something happens.',
  preposition: 'PREPOSITIONS are words that show the relationship between a noun (or pronoun) and other words in a sentence. They often indicate location, direction, or time.',
  connectors: 'CONNECTORS are words that link clauses, sentences, or ideas together. They help establish logical relationships between different parts of text.',
  determinant: 'DETERMINANTS are words that introduce nouns and help clarify what the noun refers to. They include articles, demonstratives, possessives, and quantifiers.',
  pronouns: 'PRONOUNS are words that replace nouns in sentences. They help avoid repetition and make language more efficient and natural.',
};

// Diccionario de posiciones de imagen por categoría (para recortar adecuadamente)
const categoryImagePositions = {
  phrasal_verbs: 'center 30%',
  verbs: 'center 30%',
  nouns: 'center 25%',
  adjectives: 'center 25%',
  adverbs: 'center 30%',
  preposition: 'center 25%',
  connectors: 'center 25%',
  determinant: 'center 25%',
  pronouns: 'center 30%',
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

function CategorySelector({ categories, currentCategory, onCategoryChange, isDisabled, onClose }) {
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

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

  const handleCardClick = (category, event) => {
    if (!isDragging.current) {
      scrollToCenter(event.currentTarget);
    }

    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  return (
    <div className={styles.categoryDeck}>
      <button className={styles.closeButton} onClick={onClose} title="Cerrar categorías">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <div className={styles.cardContainer} ref={scrollRef}>
        {categories.map((category) => {
          const normalized = normalize(category);
          const isActive = category === currentCategory;
          const imageUrl = categoryImages[normalized] || categoryImages.default;
          const colorIdentity = categoryColors[normalized] || 'gold';
          const description = categoryDescriptions[normalized] || `Study ${formatName(category).toLowerCase()}.`;
          const imagePosition = categoryImagePositions[normalized] || 'center center';

          return (
            <button
              key={category}
              data-category={normalized}
              className={`${styles.categoryCard} ${isActive ? styles.activeCard : ''}`}
              onClick={(e) => handleCardClick(category, e)}
              disabled={isDisabled}
            >
              <MTGCard
                name={formatName(category)}
                manaCost={null}
                image={
                  <img
                    src={imageUrl}
                    alt={formatName(category)}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: imagePosition
                    }}
                  />
                }
                type=""
                setSymbol=""
                oracleText={description}
                colorIdentity={colorIdentity}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CategorySelector;