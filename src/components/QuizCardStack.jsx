import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function QuizCardStack({ questions, currentIndex, onAnswer, onBack, answers }) {
  const { t, language, dir } = useLanguage();
  const [animationClass, setAnimationClass] = useState('');
  const prevIndexRef = useRef(currentIndex);

  useEffect(() => {
    if (prevIndexRef.current - currentIndex === 1) {
      const isRtl = dir === 'rtl';
      const directionClass = isRtl ? 'slide-in-left' : 'slide-in-right';
      
      setAnimationClass(directionClass);
      const timer = setTimeout(() => {
        setAnimationClass('');
      }, 280);
      
      return () => clearTimeout(timer);
    }
    prevIndexRef.current = currentIndex;
  }, [currentIndex, dir]);
  const backArrow = dir === 'rtl' ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="square" strokeLinejoin="miter" style={{ display: 'inline-block', verticalAlign: 'middle', marginInlineEnd: '6px' }}><line x1="4" y1="12" x2="20" y2="12" /><polyline points="13 5 20 12 13 19" /></svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="square" strokeLinejoin="miter" style={{ display: 'inline-block', verticalAlign: 'middle', marginInlineEnd: '6px' }}><line x1="20" y1="12" x2="4" y2="12" /><polyline points="11 5 4 12 11 19" /></svg>
  );
  const nextArrow = dir === 'rtl' ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="square" strokeLinejoin="miter" style={{ display: 'inline-block', verticalAlign: 'middle', marginInlineStart: '6px' }}><line x1="20" y1="12" x2="4" y2="12" /><polyline points="11 5 4 12 11 19" /></svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="square" strokeLinejoin="miter" style={{ display: 'inline-block', verticalAlign: 'middle', marginInlineStart: '6px' }}><line x1="4" y1="12" x2="20" y2="12" /><polyline points="13 5 20 12 13 19" /></svg>
  );

  if (!questions || questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];
  const total = questions.length;

  const options = [
    { labelKey: 'stronglyAgree', value: 2, className: 'strongly-agree' },
    { labelKey: 'agree', value: 1, className: 'agree' },
    { labelKey: 'disagree', value: -1, className: 'disagree' },
    { labelKey: 'stronglyDisagree', value: -2, className: 'strongly-disagree' }
  ];

  const handleSelect = (val) => {
    const isRtl = dir === 'rtl';
    const directionClass = isRtl ? 'slide-out-left' : 'slide-out-right';
    
    setAnimationClass(directionClass);
    
    setTimeout(() => {
      onAnswer(currentQuestion.id, val);
      setAnimationClass('');
    }, 280);
  };

  const handleSkip = () => {
    const isRtl = dir === 'rtl';
    const directionClass = isRtl ? 'slide-out-left' : 'slide-out-right';
    
    setAnimationClass(directionClass);
    setTimeout(() => {
      onAnswer(currentQuestion.id, 0); // Neutral / Skip
      setAnimationClass('');
    }, 280);
  };

  const categoryName = language === 'he' ? currentQuestion.categoryHe : currentQuestion.categoryEn;
  const questionText = language === 'he' ? currentQuestion.textHe : currentQuestion.textEn;

  const nextQuestion = currentIndex + 1 < total ? questions[currentIndex + 1] : null;
  const nextCategoryName = nextQuestion ? (language === 'he' ? nextQuestion.categoryHe : nextQuestion.categoryEn) : '';
  const nextQuestionText = nextQuestion ? (language === 'he' ? nextQuestion.textHe : nextQuestion.textEn) : '';

  const offsetX = dir === 'rtl' ? 8 : -8;
  const isAnimating = !!animationClass;
  const transitionStyle = 'top 0.28s cubic-bezier(0.16, 1, 0.3, 1), left 0.28s cubic-bezier(0.16, 1, 0.3, 1), right 0.28s cubic-bezier(0.16, 1, 0.3, 1), bottom 0.28s cubic-bezier(0.16, 1, 0.3, 1)';

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '520px', margin: '40px auto 0 auto' }}>
      
      {/* Decorative Stack Cards (Offset underneath) */}
      <div 
        style={{
          position: 'absolute',
          top: isAnimating ? '8px' : '16px',
          left: isAnimating ? `${offsetX}px` : `${offsetX * 2}px`,
          right: isAnimating ? `${-offsetX}px` : `${-offsetX * 2}px`,
          bottom: isAnimating ? '-8px' : '-16px',
          border: '3px solid #121212',
          backgroundColor: '#FFFFFF',
          zIndex: 1,
          pointerEvents: 'none',
          transition: transitionStyle
        }}
      />
      {/* Next Question Card (Preloaded Underneath) */}
      {nextQuestion ? (
        <div
          className="brutalist-card"
          style={{
            position: 'absolute',
            top: isAnimating ? '0px' : '8px',
            left: isAnimating ? '0px' : `${offsetX}px`,
            right: isAnimating ? '0px' : `${-offsetX}px`,
            bottom: isAnimating ? '0px' : '-8px',
            zIndex: 2,
            backgroundColor: '#FBFBF9',
            boxShadow: 'none',
            padding: '24px 24px 32px 24px',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '480px',
            pointerEvents: 'none',
            transition: transitionStyle
          }}
        >
          {/* Card Header Info */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <span 
              className="monospace-label" 
              style={{ 
                fontWeight: 700, 
                color: '#555555',
                fontSize: '0.85rem'
              }}
            >
              {t('questionProgress', { current: currentIndex + 2, total })}
            </span>
            <span 
              className="category-badge"
              style={{
                backgroundColor: 'var(--accent-cyan)',
                color: '#121212',
                fontWeight: 800,
                fontSize: '0.75rem',
                letterSpacing: '0.5px'
              }}
            >
              {nextCategoryName}
            </span>
          </div>

          {/* Question Text */}
          <h2 
            style={{ 
              fontSize: '1.65rem', 
              lineHeight: '1.3', 
              fontWeight: 800, 
              letterSpacing: '-0.5px',
              marginBottom: '28px',
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {nextQuestionText}
          </h2>

          {/* Choices Stack (Inactive) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', opacity: 0.8 }}>
            {options.map((opt) => (
              <div
                key={opt.value}
                className="brutalist-button small-shadow"
                style={{
                  width: '100%',
                  textAlign: language === 'he' ? 'right' : 'left',
                  justifyContent: 'flex-start',
                  padding: '14px 20px',
                  backgroundColor: '#FFFFFF',
                  color: '#121212',
                  fontWeight: 600,
                  fontSize: '1.05rem',
                  borderRadius: '0px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <span 
                  style={{
                    display: 'inline-flex',
                    width: '20px',
                    height: '20px',
                    border: '2px solid #121212',
                    backgroundColor: 'transparent',
                    flexShrink: 0
                  }}
                />
                <span>{t(opt.labelKey)}</span>
              </div>
            ))}
          </div>

          {/* Footer Spacer */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '28px',
              borderTop: '2px dashed #121212',
              paddingTop: '16px',
              opacity: 0.5
            }}
          >
            <span style={{ fontSize: '0.85rem' }}>{backArrow} {t('back')}</span>
            <span style={{ fontSize: '0.85rem' }}>{t('noOpinion')} {nextArrow}</span>
          </div>
        </div>
      ) : (
        <div 
          style={{
            position: 'absolute',
            top: isAnimating ? '0px' : '8px',
            left: isAnimating ? '0px' : `${offsetX}px`,
            right: isAnimating ? '0px' : `${-offsetX}px`,
            bottom: isAnimating ? '0px' : '-8px',
            border: '3px solid #121212',
            backgroundColor: '#FFFFFF',
            zIndex: 2,
            pointerEvents: 'none',
            transition: transitionStyle
          }}
        />
      )}

      {/* Primary Top Question Card */}
      <div
        className={`brutalist-card ${animationClass}`}
        style={{
          position: 'relative',
          zIndex: 3,
          backgroundColor: '#FBFBF9',
          boxShadow: 'none', // We have actual cards underneath for depth, no shadow needed
          padding: '24px 24px 32px 24px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '480px'
        }}
      >
        {/* Card Header Info */}
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <span 
            className="monospace-label" 
            style={{ 
              fontWeight: 700, 
              color: '#555555',
              fontSize: '0.85rem'
            }}
          >
            {t('questionProgress', { current: currentIndex + 1, total })}
          </span>
          <span 
            className="category-badge"
            style={{
              backgroundColor: 'var(--accent-cyan)',
              color: '#121212',
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: '0.5px'
            }}
          >
            {categoryName}
          </span>
        </div>

        {/* Question Text */}
        <h2 
          style={{ 
            fontSize: '1.65rem', 
            lineHeight: '1.3', 
            fontWeight: 800, 
            letterSpacing: '-0.5px',
            marginBottom: '28px',
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {questionText}
        </h2>

        {/* Action Choice Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          {options.map((opt) => {
            const isSelected = answers[currentQuestion.id] === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`brutalist-button ${isSelected ? 'selected' : 'small-shadow'}`}
                style={{
                  width: '100%',
                  textAlign: language === 'he' ? 'right' : 'left',
                  justifyContent: 'flex-start',
                  padding: '14px 20px',
                  color: '#121212',
                  fontWeight: 600,
                  fontSize: '1.05rem',
                  borderRadius: '0px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <span 
                  style={{
                    display: 'inline-flex',
                    width: '20px',
                    height: '20px',
                    border: '2px solid #121212',
                    backgroundColor: isSelected ? '#121212' : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    flexShrink: 0
                  }}
                >
                  {isSelected && '✓'}
                </span>
                <span>{t(opt.labelKey)}</span>
              </button>
            );
          })}
        </div>

        {/* Back and Skip Footer */}
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: '28px',
            borderTop: '2px dashed #121212',
            paddingTop: '16px'
          }}
        >
          <button
            onClick={onBack}
            disabled={currentIndex === 0}
            className="brutalist-button small-shadow"
            style={{
              padding: '6px 16px',
              fontSize: '0.85rem',
              backgroundColor: '#FFFFFF'
            }}
          >
            {backArrow} {t('back')}
          </button>
          
          <button
            onClick={handleSkip}
            className="brutalist-button small-shadow"
            style={{
              padding: '6px 16px',
              fontSize: '0.85rem',
              backgroundColor: '#FFFFFF'
            }}
          >
            {t('noOpinion')} {nextArrow}
          </button>
        </div>
      </div>
    </div>
  );
}
