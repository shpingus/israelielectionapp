import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function AccessibilityWidget() {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showStatement, setShowStatement] = useState(false);
  
  // State for accessibility options
  const [contrast, setContrast] = useState(() => localStorage.getItem('acc_contrast') || 'default');
  const [monochrome, setMonochrome] = useState(() => localStorage.getItem('acc_monochrome') === 'true');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('acc_font_size') || 'medium');
  const [dyslexiaFont, setDyslexiaFont] = useState(() => localStorage.getItem('acc_dyslexia_font') === 'true');
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('acc_reduced_motion') === 'true');
  const [isWidgetHidden, setIsWidgetHidden] = useState(() => localStorage.getItem('acc_widget_hidden') === 'true');

  const widgetRef = useRef(null);
  const statementModalRef = useRef(null);

  // Apply settings to document.documentElement
  useEffect(() => {
    const root = document.documentElement;

    // Contrast
    root.classList.remove('accessibility-high-contrast', 'accessibility-dark-contrast');
    if (contrast === 'high') {
      root.classList.add('accessibility-high-contrast');
    } else if (contrast === 'dark') {
      root.classList.add('accessibility-dark-contrast');
    }
    localStorage.setItem('acc_contrast', contrast);

    // Monochrome
    if (monochrome) {
      root.classList.add('accessibility-monochrome');
    } else {
      root.classList.remove('accessibility-monochrome');
    }
    localStorage.setItem('acc_monochrome', monochrome.toString());

    // Font size
    root.classList.remove('accessibility-font-small', 'accessibility-font-medium', 'accessibility-font-large');
    root.classList.add(`accessibility-font-${fontSize}`);
    localStorage.setItem('acc_font_size', fontSize);

    // Dyslexia Font
    if (dyslexiaFont) {
      root.classList.add('accessibility-dyslexia-font');
    } else {
      root.classList.remove('accessibility-dyslexia-font');
    }
    localStorage.setItem('acc_dyslexia_font', dyslexiaFont.toString());

    // Reduced motion
    if (reducedMotion) {
      root.classList.add('accessibility-reduced-motion');
    } else {
      root.classList.remove('accessibility-reduced-motion');
    }
    localStorage.setItem('acc_reduced_motion', reducedMotion.toString());
  }, [contrast, monochrome, fontSize, dyslexiaFont, reducedMotion]);

  // Handle keyboard events (e.g., closing drawer on Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showStatement) {
          setShowStatement(false);
          // Return focus to statement button after closing
          const statementBtn = document.getElementById('acc-statement-trigger');
          if (statementBtn) statementBtn.focus();
        } else if (isOpen) {
          setIsOpen(false);
          // Return focus to floating trigger button
          const triggerBtn = document.getElementById('acc-widget-trigger');
          if (triggerBtn) triggerBtn.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showStatement]);

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && widgetRef.current && !widgetRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle toggle via custom event (e.g. from footer link)
  useEffect(() => {
    const handleToggle = () => {
      setIsOpen(prev => !prev);
    };
    window.addEventListener('toggle-accessibility', handleToggle);
    return () => window.removeEventListener('toggle-accessibility', handleToggle);
  }, []);

  // Global Alt+A keyboard shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleReset = () => {
    setContrast('default');
    setMonochrome(false);
    setFontSize('medium');
    setDyslexiaFont(false);
    setReducedMotion(false);
    setIsWidgetHidden(false);
    localStorage.removeItem('acc_widget_hidden');
  };

  return (
    <div ref={widgetRef} style={{ position: 'relative', zIndex: 990 }}>
      {/* Floating Sticky Accessibility Trigger Button */}
      {!isWidgetHidden && (
        <button
          id="acc-widget-trigger"
          onClick={() => setIsOpen(!isOpen)}
          className="brutalist-button"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 995,
            borderRadius: '4px',
            width: '56px',
            height: '56px',
            padding: 0,
            backgroundColor: '#00E5FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '-4px 4px 0px #121212',
            cursor: 'pointer'
          }}
          aria-label={t('accessibilityButton')}
          aria-expanded={isOpen}
          aria-controls="accessibility-drawer"
        >
          <svg 
            width="30" 
            height="30" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#121212" 
            strokeWidth="2.5" 
            strokeLinecap="square"
            aria-hidden="true"
          >
            <circle cx="12" cy="5" r="2.5" />
            <path d="M4 11h16M12 7.5v8M8.5 21.5l3.5-6 3.5 6" />
          </svg>
        </button>
      )}

      {/* Drawer Panel */}
      {isOpen && (
        <div
          id="accessibility-drawer"
          role="region"
          aria-label={t('accessibilityTitle')}
          className="brutalist-card"
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            width: 'calc(100% - 48px)',
            maxWidth: '320px',
            backgroundColor: 'var(--card-bg-color, #FFFFFF)',
            boxShadow: '-6px 6px 0px #121212',
            padding: '20px',
            zIndex: 994,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            border: '3px solid var(--border-color, #121212)',
            borderRadius: '4px'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2.5px solid var(--border-color, #121212)', paddingBottom: '10px' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 800 }}>
              {t('accessibilityTitle')}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="brutalist-button half-shadow"
              style={{
                padding: '4px 8px',
                fontSize: '0.75rem',
                backgroundColor: 'var(--accent-coral, #FF5252)',
                color: '#FFFFFF',
                borderRadius: '0px'
              }}
              aria-label={t('close')}
            >
              ✕
            </button>
          </div>

          {/* Contrast Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="monospace-label" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
              {t('highContrast')} / {t('darkContrast')}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setContrast(contrast === 'high' ? 'default' : 'high')}
                className={`brutalist-button half-shadow ${contrast === 'high' ? 'selected' : ''}`}
                style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
                aria-pressed={contrast === 'high'}
              >
                {t('highContrast')}
              </button>
              <button
                onClick={() => setContrast(contrast === 'dark' ? 'default' : 'dark')}
                className={`brutalist-button half-shadow ${contrast === 'dark' ? 'selected' : ''}`}
                style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
                aria-pressed={contrast === 'dark'}
              >
                {t('darkContrast')}
              </button>
            </div>
          </div>

          {/* Monochrome Mode */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="monochrome-toggle" className="monospace-label" style={{ fontSize: '0.85rem' }}>
              {t('monochrome')}
            </label>
            <button
              id="monochrome-toggle"
              onClick={() => setMonochrome(!monochrome)}
              className={`brutalist-button half-shadow ${monochrome ? 'selected' : ''}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              aria-pressed={monochrome}
            >
              {monochrome ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Font Override */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="dyslexia-toggle" className="monospace-label" style={{ fontSize: '0.85rem' }}>
              {t('dyslexiaFont')}
            </label>
            <button
              id="dyslexia-toggle"
              onClick={() => setDyslexiaFont(!dyslexiaFont)}
              className={`brutalist-button half-shadow ${dyslexiaFont ? 'selected' : ''}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              aria-pressed={dyslexiaFont}
            >
              {dyslexiaFont ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Reduced Motion */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="reduced-motion-toggle" className="monospace-label" style={{ fontSize: '0.85rem' }}>
              {t('reducedMotion')}
            </label>
            <button
              id="reduced-motion-toggle"
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`brutalist-button half-shadow ${reducedMotion ? 'selected' : ''}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              aria-pressed={reducedMotion}
            >
              {reducedMotion ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Floating Widget Toggle (Hideable Button) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="hide-widget-toggle" className="monospace-label" style={{ fontSize: '0.85rem' }}>
              {language === 'he' ? 'כפתור נגישות צף' : 'Floating Button'}
            </label>
            <button
              id="hide-widget-toggle"
              onClick={() => {
                const nextHidden = !isWidgetHidden;
                setIsWidgetHidden(nextHidden);
                localStorage.setItem('acc_widget_hidden', nextHidden.toString());
              }}
              className={`brutalist-button half-shadow ${!isWidgetHidden ? 'selected' : ''}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              aria-pressed={!isWidgetHidden}
            >
              {!isWidgetHidden ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Font Sizing Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="monospace-label" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
              {t('fontSize')}
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['small', 'medium', 'large'].map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`brutalist-button half-shadow ${fontSize === size ? 'selected' : ''}`}
                  style={{ flex: 1, padding: '8px 4px', fontSize: '0.75rem' }}
                  aria-pressed={fontSize === size}
                >
                  {t(`fontSize${size.charAt(0).toUpperCase() + size.slice(1)}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '2px dashed var(--border-color, #121212)', paddingTop: '12px', marginTop: '4px' }}>
            <button
              id="acc-statement-trigger"
              onClick={() => setShowStatement(true)}
              className="brutalist-button half-shadow"
              style={{ padding: '8px', fontSize: '0.85rem', width: '100%', backgroundColor: 'var(--accent-cobalt, #2979FF)', color: '#FFFFFF' }}
            >
              {t('accessibilityStatement')}
            </button>
            <button
              onClick={handleReset}
              className="brutalist-button half-shadow"
              style={{ padding: '8px', fontSize: '0.85rem', width: '100%' }}
            >
              {t('resetSettings')}
            </button>
          </div>
        </div>
      )}

      {/* Accessibility Statement Modal */}
      {showStatement && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="acc-modal-title"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(18, 18, 18, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={(e) => {
            if (statementModalRef.current && !statementModalRef.current.contains(e.target)) {
              setShowStatement(false);
            }
          }}
        >
          <div
            ref={statementModalRef}
            className="brutalist-card"
            style={{
              maxWidth: '500px',
              width: '100%',
              backgroundColor: 'var(--card-bg-color, #FFFFFF)',
              border: '3px solid var(--border-color, #121212)',
              borderRadius: '4px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '8px 8px 0px #121212',
              position: 'relative'
            }}
          >
            <h2 id="acc-modal-title" style={{ fontSize: '1.8rem', margin: 0, fontWeight: 800 }}>
              {t('accStatementTitle')}
            </h2>
            
            <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.6' }}>
              {t('accStatementBody')}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <span className="monospace-label" style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                {t('accLastUpdated')}
              </span>
              <button
                onClick={() => {
                  setShowStatement(false);
                  const statementBtn = document.getElementById('acc-statement-trigger');
                  if (statementBtn) statementBtn.focus();
                }}
                className="brutalist-button small-shadow"
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--accent-cyan, #00E5FF)'
                }}
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
