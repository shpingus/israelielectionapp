import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function FontTester({ fontPairing, setFontPairing }) {
  const { language, dir } = useLanguage();
  const [isOpen, setIsOpen] = useState(true);

  const tFont = {
    en: {
      title: "Typography Sandbox",
      subtitle: "Preview different Hebrew & English font pairings live:",
      close: "Collapse",
      open: "🔤 Font Options",
      vintageTitle: "1. Vintage Slab & Serif (Selected)",
      vintageHeading: "Suez One + Fraunces",
      vintageBody: "Heebo + Outfit",
      vintageDesc: "Your favorite combination: chunky Hebrew slab-serif and soft heritage English newspaper serif.",
      
      editorialTitle: "2. Literary Newspaper Serif",
      editorialHeading: "Frank Ruhl Libre + Fraunces",
      editorialBody: "Assistant + Plus Jakarta Sans",
      editorialDesc: "Traditional high-contrast newspaper typography. Classic editorial tone and elegant serifs.",
      
      hybridTitle: "3. Slab & Geometric Sans",
      hybridHeading: "Suez One + Space Grotesk",
      hybridBody: "Heebo + Plus Jakarta Sans",
      hybridDesc: "Chunky Hebrew slab-serif heading paired with high-precision modern English display sans.",
      
      headingLabel: "Headings",
      bodyLabel: "Body / UI",
      active: "Active Style"
    },
    he: {
      title: "ארגז חול טיפוגרפי",
      subtitle: "תצוגה מקדימה של שילובי גופנים לעברית ואנגלית:",
      close: "צמצם",
      open: "🔤 אפשרויות גופן",
      vintageTitle: "1. סריף ומורשת (נבחר)",
      vintageHeading: "Suez One + Fraunces",
      vintageBody: "Heebo + Outfit",
      vintageDesc: "השילוב המועדף עליך: כותרות סלאב-סריף כבדות בעברית וסריף אנגלי קלאסי ומלא אופי.",
      
      editorialTitle: "2. סריף ספרותי עיתונאי",
      editorialHeading: "Frank Ruhl Libre + Fraunces",
      editorialBody: "Assistant + Plus Jakarta Sans",
      editorialDesc: "טיפוגרפיית עיתונות קלאסית בעלת ניגודיות גבוהה. מקנה מראה סמכותי וספרותי מעודן.",
      
      hybridTitle: "3. סלאב וסנס-סריף גאומטרי",
      hybridHeading: "Suez One + Space Grotesk",
      hybridBody: "Heebo + Plus Jakarta Sans",
      hybridDesc: "כותרות סלאב-סריף כבדות בעברית בשילוב כותרות סנס-סריף מודרניות באנגלית.",
      
      headingLabel: "כותרות",
      bodyLabel: "טקסט / ממשק",
      active: "סגנון פעיל"
    }
  };

  const content = tFont[language] || tFont.en;

  const pairings = [
    {
      id: 'vintage',
      title: content.vintageTitle,
      heading: content.vintageHeading,
      body: content.vintageBody,
      desc: content.vintageDesc,
      bg: '#FCE8E6',
      accent: 'var(--accent-coral)'
    },
    {
      id: 'editorial',
      title: content.editorialTitle,
      heading: content.editorialHeading,
      body: content.editorialBody,
      desc: content.editorialDesc,
      bg: '#E8F0FE',
      accent: 'var(--accent-cobalt)',
      textColor: '#FFFFFF'
    },
    {
      id: 'hybrid',
      title: content.hybridTitle,
      heading: content.hybridHeading,
      body: content.hybridBody,
      desc: content.hybridDesc,
      bg: '#E3FAF2',
      accent: 'var(--accent-cyan)'
    }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="brutalist-button"
        style={{
          position: 'fixed',
          bottom: '20px',
          left: dir === 'rtl' ? '20px' : 'auto',
          right: dir === 'ltr' ? '20px' : 'auto',
          zIndex: 9999,
          backgroundColor: '#FFEE58',
          color: '#121212',
          borderWidth: '3px',
          fontWeight: 800,
          boxShadow: 'var(--shadow-x) var(--shadow-y) 0px #121212',
        }}
      >
        {content.open}
      </button>
    );
  }

  return (
    <div
      className="brutalist-card slide-in-up"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: dir === 'rtl' ? '20px' : 'auto',
        right: dir === 'ltr' ? '20px' : 'auto',
        maxWidth: '480px',
        width: 'calc(100% - 40px)',
        zIndex: 9999,
        backgroundColor: '#FFFFFF',
        padding: '20px',
        borderWidth: '3px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: 'var(--shadow-x-card) var(--shadow-y-card) 0px #121212',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #121212', paddingBottom: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🎨 {content.title}
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="brutalist-button"
          style={{
            padding: '2px 8px',
            fontSize: '0.75rem',
            boxShadow: 'var(--shadow-x) var(--shadow-y) 0px #121212',
            backgroundColor: '#FFEBEE',
            color: '#121212'
          }}
        >
          {content.close}
        </button>
      </div>

      <p style={{ margin: 0, fontSize: '0.85rem', color: '#555555', fontFamily: 'var(--font-body)' }}>
        {content.subtitle}
      </p>

      {/* Options Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {pairings.map((p) => {
          const isSelected = fontPairing === p.id;
          return (
            <div
              key={p.id}
              onClick={() => setFontPairing(p.id)}
              style={{
                border: '2px solid #121212',
                padding: '10px 14px',
                cursor: 'pointer',
                backgroundColor: isSelected ? p.bg : '#FFF',
                transition: 'all 0.1s ease',
                transform: isSelected ? 'translate(0px, 0px)' : 'none',
                boxShadow: isSelected 
                  ? 'none' 
                  : 'var(--shadow-x) var(--shadow-y) 0px #121212',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', fontFamily: 'var(--font-body)' }}>
                  {p.title}
                </span>
                {isSelected && (
                  <span 
                    className="monospace-label" 
                    style={{ 
                      fontSize: '0.7rem', 
                      backgroundColor: p.accent, 
                      color: p.textColor || '#121212',
                      padding: '2px 6px',
                      border: '1px solid #121212',
                    }}
                  >
                    ✓ {content.active}
                  </span>
                )}
              </div>
              
              <div style={{ fontSize: '0.75rem', color: '#121212', display: 'flex', flexDirection: 'column', gap: '2px', fontFamily: 'var(--font-body)' }}>
                <div><strong>{content.headingLabel}:</strong> <span style={{ fontFamily: 'var(--font-mono)' }}>{p.heading}</span></div>
                <div><strong>{content.bodyLabel}:</strong> <span style={{ fontFamily: 'var(--font-mono)' }}>{p.body}</span></div>
                <div style={{ color: '#666', fontStyle: 'italic', marginTop: '4px', fontSize: '0.7rem' }}>"{p.desc}"</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
