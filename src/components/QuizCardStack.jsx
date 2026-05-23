import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function QuizCardStack({ questions, currentIndex, onAnswer, onBack, answers, onStartQuiz }) {
  const { t, language, dir } = useLanguage();
  const [animationClass, setAnimationClass] = useState('');
  const prevIndexRef = useRef(currentIndex);
  const isAnimating = !!animationClass;

  const [displayName, setDisplayName] = useState(() => sessionStorage.getItem('israeli_elections_display_name') || '');

  useEffect(() => {
    if (currentIndex === -1) {
      setDisplayName(sessionStorage.getItem('israeli_elections_display_name') || '');
    }
  }, [currentIndex]);

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
 
  if (currentIndex !== -1 && (!questions || questions.length === 0)) return null;
 
  const currentQuestion = questions ? questions[currentIndex] : null;
  const total = questions ? questions.length : 0;
  const likertOptions = [
    { labelKey: 'stronglyAgree', value: 2, className: 'strongly-agree' },
    { labelKey: 'agree', value: 1, className: 'agree' },
    { labelKey: 'disagree', value: -1, className: 'disagree' },
    { labelKey: 'stronglyDisagree', value: -2, className: 'strongly-disagree' }
  ];
 
  const handleSelect = (val) => {
    if (isAnimating) return;
    const isRtl = dir === 'rtl';
    const directionClass = isRtl ? 'slide-out-left' : 'slide-out-right';
    
    setAnimationClass(directionClass);
    
    setTimeout(() => {
      onAnswer(currentQuestion.id, val);
      setAnimationClass('');
    }, 280);
  };
 
  const handleSkip = () => {
    if (isAnimating) return;
    const isRtl = dir === 'rtl';
    const directionClass = isRtl ? 'slide-out-left' : 'slide-out-right';
    
    setAnimationClass(directionClass);
    setTimeout(() => {
      onAnswer(currentQuestion.id, 0); // Neutral / Skip
      setAnimationClass('');
    }, 280);
  };

  const categoryName = currentIndex === -1
    ? (language === 'he' ? 'הגדרת זהות' : 'IDENTITY SETUP')
    : (language === 'he' ? currentQuestion.categoryHe : currentQuestion.categoryEn);
  
  // Define prompt text depending on question format
  let questionPrompt;
  if (currentIndex === -1) {
    questionPrompt = t('nameSelectionLabel');
  } else if (currentQuestion.type === 'statement_pair') {
    questionPrompt = t('selectStatement');
  } else {
    questionPrompt = language === 'he' ? currentQuestion.textHe : currentQuestion.textEn;
  }

  const nextQuestion = currentIndex === -1 ? questions[0] : (currentIndex + 1 < total ? questions[currentIndex + 1] : null);
  const nextCategoryName = nextQuestion ? (language === 'he' ? nextQuestion.categoryHe : nextQuestion.categoryEn) : '';
  
  let nextQuestionPrompt = '';
  if (nextQuestion) {
    if (nextQuestion.type === 'statement_pair') {
      nextQuestionPrompt = t('selectStatement');
    } else {
      nextQuestionPrompt = language === 'he' ? nextQuestion.textHe : nextQuestion.textEn;
    }
  }

  const offsetX = dir === 'rtl' ? 8 : -8;
  const transitionStyle = 'top 0.28s cubic-bezier(0.16, 1, 0.3, 1), left 0.28s cubic-bezier(0.16, 1, 0.3, 1), right 0.28s cubic-bezier(0.16, 1, 0.3, 1), bottom 0.28s cubic-bezier(0.16, 1, 0.3, 1)';

  // Helper to render choice stack for the preloaded next card
  const renderNextChoices = () => {
    if (!nextQuestion) return null;

    if (nextQuestion.type === 'statement_pair') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', opacity: 0.7 }}>
          <div className="brutalist-button small-shadow" style={{ width: '100%', textAlign: language === 'he' ? 'right' : 'left', justifyContent: 'flex-start', padding: '12px 16px', backgroundColor: '#FFFFFF', pointerEvents: 'none' }}>
            <span className="monospace-label" style={{ fontSize: '0.7rem', padding: '2px 6px', border: '1px solid #121212', backgroundColor: '#FAF9F6', display: 'inline-block', marginBottom: '4px' }}>{t('statementA')}</span>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {language === 'he' ? nextQuestion.statementAHe : nextQuestion.statementAEn}
            </div>
          </div>
          <div className="brutalist-button small-shadow" style={{ width: '100%', textAlign: language === 'he' ? 'right' : 'left', justifyContent: 'flex-start', padding: '12px 16px', backgroundColor: '#FFFFFF', pointerEvents: 'none' }}>
            <span className="monospace-label" style={{ fontSize: '0.7rem', padding: '2px 6px', border: '1px solid #121212', backgroundColor: '#FAF9F6', display: 'inline-block', marginBottom: '4px' }}>{t('statementB')}</span>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {language === 'he' ? nextQuestion.statementBHe : nextQuestion.statementBEn}
            </div>
          </div>
        </div>
      );
    }

    if (nextQuestion.type === 'multiple_choice') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', opacity: 0.7 }}>
          {nextQuestion.options && nextQuestion.options.slice(0, 4).map((opt, idx) => (
            <div
              key={idx}
              className="brutalist-button small-shadow"
              style={{
                width: '100%',
                textAlign: language === 'he' ? 'right' : 'left',
                justifyContent: 'flex-start',
                padding: '10px 16px',
                backgroundColor: '#FFFFFF',
                color: '#121212',
                fontWeight: 600,
                fontSize: '0.9rem',
                borderRadius: '0px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                pointerEvents: 'none'
              }}
            >
              <span style={{ display: 'inline-flex', width: '16px', height: '16px', border: '2px solid #121212', borderRadius: '50%', backgroundColor: 'transparent', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {language === 'he' ? opt.textHe : opt.textEn}
              </span>
            </div>
          ))}
        </div>
      );
    }

    // Likert Default
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', opacity: 0.7 }}>
        {likertOptions.map((opt) => (
          <div
            key={opt.value}
            className="brutalist-button small-shadow"
            style={{
              width: '100%',
              textAlign: language === 'he' ? 'right' : 'left',
              justifyContent: 'flex-start',
              padding: '10px 16px',
              backgroundColor: '#FFFFFF',
              color: '#121212',
              fontWeight: 600,
              fontSize: '0.9rem',
              borderRadius: '0px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              pointerEvents: 'none'
            }}
          >
            <span style={{ display: 'inline-flex', width: '16px', height: '16px', border: '2px solid #121212', backgroundColor: 'transparent', flexShrink: 0 }} />
            <span>{t(opt.labelKey)}</span>
          </div>
        ))}
      </div>
    );
  };

  // Helper to render choice stack for the primary top question card
  const handleStartIdentity = (nameVal) => {
    if (isAnimating) return;
    const isRtl = dir === 'rtl';
    const directionClass = isRtl ? 'slide-out-left' : 'slide-out-right';
    setAnimationClass(directionClass);
    
    setTimeout(() => {
      onStartQuiz(nameVal);
      setAnimationClass('');
    }, 280);
  };

  const renderCurrentChoices = () => {
    if (currentIndex === -1) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={t('nameSelectionPlaceholder')}
            maxLength={40}
            className="monospace-label"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '1.1rem',
              border: '3px solid var(--border-color, #121212)',
              borderRadius: '4px',
              outline: 'none',
              backgroundColor: '#FAF9F6',
              fontFamily: 'var(--font-mono)',
              textAlign: dir === 'rtl' ? 'right' : 'left'
            }}
          />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <button
              onClick={() => handleStartIdentity(displayName.trim() || null)}
              className="brutalist-button primary static-shadow"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                justifyContent: 'center',
                border: '3px solid #121212'
              }}
            >
              {language === 'he' ? 'התחילו בבוחן' : 'Start Quiz'}
            </button>
            
            <button
              onClick={() => handleStartIdentity(null)}
              className="brutalist-button static-shadow"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '0.9rem',
                backgroundColor: 'var(--card-bg-color, #FFFFFF)',
                justifyContent: 'center',
                border: '3px solid #121212'
              }}
            >
              {t('skipAnonymous')}
            </button>
          </div>
        </div>
      );
    }

    if (currentQuestion.type === 'statement_pair') {
      const isASelected = answers[currentQuestion.id] === 2;
      const isBSelected = answers[currentQuestion.id] === -2;

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          <button
            onClick={() => handleSelect(2)}
            className={`brutalist-button ${isASelected ? 'selected' : 'small-shadow'}`}
            style={{
              width: '100%',
              textAlign: language === 'he' ? 'right' : 'left',
              padding: '20px',
              backgroundColor: isASelected ? 'var(--accent-cyan)' : '#FFFFFF',
              color: '#121212',
              borderRadius: '0px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '8px',
              cursor: 'pointer',
              border: '3px solid #121212'
            }}
          >
            <span 
              className="monospace-label" 
              style={{ 
                fontSize: '0.75rem', 
                fontWeight: 800,
                border: '2.5px solid #121212', 
                backgroundColor: isASelected ? '#FFFFFF' : 'var(--accent-cyan)',
                padding: '3px 10px',
                color: '#121212',
                display: 'inline-block'
              }}
            >
              {t('statementA')}
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: '1.45', textAlign: language === 'he' ? 'right' : 'left', width: '100%' }}>
              {language === 'he' ? currentQuestion.statementAHe : currentQuestion.statementAEn}
            </div>
          </button>

          <button
            onClick={() => handleSelect(-2)}
            className={`brutalist-button ${isBSelected ? 'selected' : 'small-shadow'}`}
            style={{
              width: '100%',
              textAlign: language === 'he' ? 'right' : 'left',
              padding: '20px',
              backgroundColor: isBSelected ? 'var(--accent-cyan)' : '#FFFFFF',
              color: '#121212',
              borderRadius: '0px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '8px',
              cursor: 'pointer',
              border: '3px solid #121212'
            }}
          >
            <span 
              className="monospace-label" 
              style={{ 
                fontSize: '0.75rem', 
                fontWeight: 800,
                border: '2.5px solid #121212', 
                backgroundColor: isBSelected ? '#FFFFFF' : 'var(--accent-cyan)',
                padding: '3px 10px',
                color: '#121212',
                display: 'inline-block'
              }}
            >
              {t('statementB')}
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: '1.45', textAlign: language === 'he' ? 'right' : 'left', width: '100%' }}>
              {language === 'he' ? currentQuestion.statementBHe : currentQuestion.statementBEn}
            </div>
          </button>
        </div>
      );
    }

    if (currentQuestion.type === 'multiple_choice') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          {currentQuestion.options && currentQuestion.options.map((opt) => {
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
                  backgroundColor: isSelected ? 'var(--accent-cyan)' : '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '1.05rem',
                  borderRadius: '0px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  border: '3px solid #121212'
                }}
              >
                <span 
                  style={{
                    display: 'inline-flex',
                    width: '20px',
                    height: '20px',
                    border: '2px solid #121212',
                    borderRadius: '50%',
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
                <span>{language === 'he' ? opt.textHe : opt.textEn}</span>
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
        {likertOptions.map((opt) => {
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
                gap: '12px',
                border: '3px solid #121212'
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
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '540px', margin: '40px auto 0 auto' }}>
      
      <div 
        style={{
          position: 'absolute',
          top: isAnimating ? '8px' : '16px',
          left: isAnimating ? `${offsetX}px` : `${offsetX * 2}px`,
          right: isAnimating ? `${-offsetX}px` : `${-offsetX * 2}px`,
          bottom: isAnimating ? '-8px' : '-16px',
          border: '3px solid var(--border-color, #121212)',
          backgroundColor: 'var(--card-bg-color, #FFFFFF)',
          zIndex: 1,
          pointerEvents: 'none',
          transition: transitionStyle
        }}
      />
      
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
            backgroundColor: 'var(--card-bg-color, #FBFBF9)',
            boxShadow: 'none',
            padding: '24px 24px 32px 24px',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '520px',
            pointerEvents: 'none',
            transition: transitionStyle
          }}
        >
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
                color: 'var(--text-color)', opacity: 0.7,
                fontSize: '0.85rem'
              }}
            >
              {currentIndex === -1 ? (language === 'he' ? 'אתחול סשן' : 'INITIALIZATION') : t('questionProgress', { current: currentIndex + 2, total })}
            </span>
            <span 
              className="category-badge"
              style={{
                backgroundColor: 'var(--accent-cyan)',
                color: 'var(--text-color, #121212)',
                fontWeight: 800,
                fontSize: '0.75rem',
                letterSpacing: '0.5px'
              }}
            >
              {nextCategoryName}
            </span>
          </div>

          <h2 
            style={{ 
              fontSize: '1.5rem', 
              lineHeight: '1.35', 
              fontWeight: 800, 
              letterSpacing: '-0.5px',
              marginBottom: '28px',
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {nextQuestionPrompt}
          </h2>

          {renderNextChoices()}

          <div className="quiz-card-footer" style={{ opacity: 0.5 }}>
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
            border: '3px solid var(--border-color, #121212)',
            backgroundColor: 'var(--card-bg-color, #FFFFFF)',
            zIndex: 2,
            pointerEvents: 'none',
            transition: transitionStyle
          }}
        />
      )}

      <div
        className={`brutalist-card ${animationClass}`}
        style={{
          position: 'relative',
          zIndex: 3,
          backgroundColor: 'var(--card-bg-color, #FBFBF9)',
          boxShadow: 'none', 
          padding: '24px 24px 32px 24px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '520px'
        }}
      >
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
              color: 'var(--text-color)', opacity: 0.7,
              fontSize: '0.85rem'
            }}
          >
            {currentIndex === -1 ? (language === 'he' ? 'אתחול סשן' : 'INITIALIZATION') : t('questionProgress', { current: currentIndex + 1, total })}
          </span>
          <span 
            className="category-badge"
            style={{
              backgroundColor: 'var(--accent-cyan)',
              color: 'var(--text-color, #121212)',
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: '0.5px'
            }}
          >
            {categoryName}
          </span>
        </div>

        <h2 
          style={{ 
            fontSize: '1.5rem', 
            lineHeight: '1.35', 
            fontWeight: 800, 
            letterSpacing: '-0.5px',
            marginBottom: '28px',
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {questionPrompt}
        </h2>

        {renderCurrentChoices()}

        <div className="quiz-card-footer">
          <button
            onClick={onBack}
            disabled={isAnimating}
            className="brutalist-button small-shadow"
            style={{
              padding: '6px 16px',
              fontSize: '0.85rem',
              backgroundColor: 'var(--card-bg-color, #FFFFFF)'
            }}
          >
            {backArrow} {currentIndex === -1 ? (language === 'he' ? 'חזרה למסך הבית' : 'Back to Home') : t('back')}
          </button>
          
          {currentIndex !== -1 && (
            <button
              onClick={handleSkip}
              disabled={isAnimating}
              className="brutalist-button small-shadow"
              style={{
                padding: '6px 16px',
                fontSize: '0.85rem',
                backgroundColor: 'var(--card-bg-color, #FFFFFF)'
              }}
            >
              {t('noOpinion')} {nextArrow}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
