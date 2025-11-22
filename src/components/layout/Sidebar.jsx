import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiLayers, FiCreditCard, FiCheckSquare, FiBook } from 'react-icons/fi'; // Importamos iconos Feather
import './Layout.css';

export default function Sidebar({ isOpen }) {
    // Utilizamos useLocation para saber qué ruta está activa
    const location = useLocation();

    // 🎯 Determina si la ruta actual es /flashcard o una subruta de flashcards
    const isFlashcardsPath = location.pathname.startsWith('/flashcard');

    // Función para determinar si el NavLink de Test principal está activo
    // (Esta variable ya no es necesaria, pero la dejamos para no modificar la lógica del NavLink)
    const isTestActive = location.pathname === '/test';


    return (
        <aside className={`app-sidebar ${isOpen ? 'open' : 'closed'}`}>
            <nav>
                <ul className="mainNav">

                    {/* 1. Item Principal: Flashcards (Expandible) - ¡Debe ir PRIMERO! */}
                    <li className="parentItem">
                        {/* Usa div para el padre. Se activa si alguna ruta de flashcard lo está. */}
                        <div className={`parentLink ${isFlashcardsPath ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', color: '#4A5568', fontWeight: '600' }}>
                            <FiLayers size={20} /> Flashcards
                        </div>

                        {/* Subcategorías de Flashcards: Card y Test */}
                        <ul className={`subCategory ${isFlashcardsPath ? 'open' : ''}`}>
                            <li>
                                <NavLink
                                    to="/flashcard"
                                    // La opción Card se activa si la ruta es /flashcard o /flashcard/card
                                    className={({ isActive }) => isActive || location.pathname === '/flashcard/card' ? 'nav-link active' : 'nav-link'}
                                    end
                                >
                                    <FiCreditCard /> Card
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/flashcard/test"
                                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                                >
                                    <FiCheckSquare /> Test
                                </NavLink>
                            </li>
                        </ul>
                    </li>

                    {/* 2. Item Principal: Grammar - ¡Al mismo nivel que Flashcards! */}
                    <li>
                        <NavLink
                            to="/grammar"
                            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                        >
                            <FiBook /> Grammar
                        </NavLink>
                    </li>

                    {/* ❌ ELIMINADO: La opción principal "Test" ya no existe según la estructura solicitada. */}
                </ul>
            </nav>
        </aside>
    );
}
