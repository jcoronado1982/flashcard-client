// src/features/flashcards/ToneSelector.jsx
import React from 'react';
import Select from 'react-select';
import styles from './ToneSelector.module.css';

// Custom styles for react-select to match our design
const customStyles = {
    control: (provided, state) => ({
        ...provided,
        minHeight: '42px',
        height: '42px',
        borderRadius: '24px',
        border: state.isFocused ? '1.5px solid #A0AEC0' : '1.5px solid #CBD5E0',
        boxShadow: state.isFocused ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 2px 6px rgba(0, 0, 0, 0.06)',
        backgroundColor: '#ffffff',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        '&:hover': {
            borderColor: '#A0AEC0',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-1px)',
        },
    }),
    valueContainer: (provided) => ({
        ...provided,
        height: '42px',
        padding: '0 0 0 12px',
    }),
    input: (provided) => ({
        ...provided,
        margin: '0',
        padding: '0',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }),
    indicatorSeparator: () => ({
        display: 'none',
    }),
    indicatorsContainer: (provided) => ({
        ...provided,
        height: '42px',
    }),
    dropdownIndicator: (provided) => ({
        ...provided,
        color: '#4A5568',
        padding: '0 12px',
        '&:hover': {
            color: '#0066CC',
        },
    }),
    menu: (provided) => ({
        ...provided,
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        marginTop: '8px',
    }),
    menuList: (provided) => ({
        ...provided,
        padding: '8px',
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#0066CC' : state.isFocused ? '#EBF4FF' : '#ffffff',
        color: state.isSelected ? '#ffffff' : '#2D3748',
        padding: '12px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: state.isSelected ? 600 : 500,
        fontSize: '0.95em',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        transition: 'all 0.2s ease',
        '&:active': {
            backgroundColor: state.isSelected ? '#0066CC' : '#D6E9FF',
        },
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#2D3748',
        fontWeight: 600,
        fontSize: '0.95em',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#718096',
        fontWeight: 500,
        fontSize: '0.95em',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }),
};

import { translations } from '../../config/translations';

// ... (customStyles)

function ToneSelector({ toneOptions, selectedTone, onToneChange, language = 'en' }) {
    const t = translations[language].toneSelector;

    // Transform toneOptions to react-select format with translated labels
    const options = toneOptions.map(option => ({
        value: option.value,
        label: t.options[option.id] || option.label, // Fallback to original label if translation missing
    }));

    // Find the currently selected option
    const selectedOption = options.find(opt => opt.value === selectedTone);

    const handleChange = (option) => {
        if (option && onToneChange) {
            onToneChange(option.value);
        }
    };

    return (
        <div className={styles.toneSelectorContainer}>
            <label htmlFor="tone-select" className={styles.toneSelectorLabel}>
                {t.label}
            </label>
            <div className={styles.selectWrapper}>
                <Select
                    inputId="tone-select"
                    value={selectedOption}
                    onChange={handleChange}
                    options={options}
                    styles={customStyles}
                    isSearchable={false}
                    placeholder={language === 'es' ? "Selecciona tono..." : "Select tone..."}
                />
            </div>
        </div>
    );
}

export default ToneSelector;