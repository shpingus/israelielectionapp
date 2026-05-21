import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="brutalist-button monospace-label"
      style={{
        padding: '6px 12px',
        fontSize: '0.85rem',
        backgroundColor: '#FFFFFF',
        borderColor: '#121212',
        boxShadow: 'var(--shadow-x) var(--shadow-y) 0px #121212',
        cursor: 'pointer'
      }}
      aria-label="Toggle language"
    >
      {language === 'he' ? '🇺🇸 EN' : '🇮🇱 עב'}
    </button>
  );
}
