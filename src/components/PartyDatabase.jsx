import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function PartyDatabase({ parties, questions, onBack }) {
  const { t, language, dir } = useLanguage();
  const [expandedPartyId, setExpandedPartyId] = useState(null);
  const backArrow = dir === 'rtl' ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="square" strokeLinejoin="miter" style={{ display: 'inline-block', verticalAlign: 'middle', marginInlineEnd: '6px' }}><line x1="4" y1="12" x2="20" y2="12" /><polyline points="13 5 20 12 13 19" /></svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="square" strokeLinejoin="miter" style={{ display: 'inline-block', verticalAlign: 'middle', marginInlineEnd: '6px' }}><line x1="20" y1="12" x2="4" y2="12" /><polyline points="11 5 4 12 11 19" /></svg>
  );

  const getStanceLabel = (val) => {
    if (val === 2) return t('stronglyAgree');
    if (val === 1) return t('agree');
    if (val === -1) return t('disagree');
    if (val === -2) return t('stronglyDisagree');
    return t('noOpinion');
  };

  const getStanceStyle = (val) => {
    if (val > 0) return { backgroundColor: 'rgba(0, 229, 255, 0.15)', color: '#006064' };
    if (val < 0) return { backgroundColor: 'rgba(255, 82, 82, 0.15)', color: '#B71C1C' };
    return { backgroundColor: '#F0F0F0', color: '#666666' };
  };

  return (
    <div className="slide-in-up" style={{ width: '100%', maxWidth: '800px', margin: '20px auto 40px auto' }}>
      
      {/* Header Bar */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '32px',
          borderBottom: '3px solid #121212',
          paddingBottom: '16px'
        }}
      >
        <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>
          {t('partyDatabase')}
        </h2>
        <button 
          onClick={onBack} 
          className="brutalist-button"
          style={{ backgroundColor: 'var(--card-bg-color, #FFFFFF)', padding: '8px 16px', fontSize: '0.9rem' }}
        >
          {backArrow} {t('backToHome')}
        </button>
      </div>

      {/* Party list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {parties.map((party) => {
          const isExpanded = expandedPartyId === party.id;
          const partyName = language === 'he' ? party.nameHe : party.nameEn;
          const partyLeader = language === 'he' ? party.leaderHe : party.leaderEn;
          const partyDesc = language === 'he' ? party.descriptionHe : party.descriptionEn;

          return (
            <div 
              key={party.id}
              className="brutalist-card"
              style={{
                padding: '24px',
                borderColor: party.color || '#121212',
                borderLeftWidth: '12px',
                boxShadow: isExpanded 
                  ? 'calc(var(--shadow-x) * 1.5) calc(var(--shadow-y) * 1.5) 0px #121212' 
                  : 'var(--shadow-x) var(--shadow-y) 0px #121212',
                backgroundColor: 'var(--card-bg-color, #FFFFFF)'
              }}
            >
              {/* Row Header */}
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 4px 0' }}>
                    {partyName}
                  </h3>
                  <div className="monospace-label" style={{ color: 'var(--text-color)', opacity: 0.7, fontSize: '0.9rem' }}>
                    {t('leader')}: {partyLeader}
                  </div>
                </div>
                
                <button
                  onClick={() => setExpandedPartyId(isExpanded ? null : party.id)}
                  className={`brutalist-button half-shadow ${isExpanded ? 'active-profile' : ''}`}
                  style={{
                    backgroundColor: isExpanded ? 'var(--accent-cyan)' : '#FFFFFF',
                    padding: '8px 16px',
                    fontSize: '0.8rem'
                  }}
                >
                  {isExpanded ? (language === 'he' ? 'סגור פרופיל ▲' : 'Close Profile ▲') : t('viewPlatform')}
                </button>
              </div>

              {/* Collapsible Info */}
              {isExpanded && (
                <div style={{ marginTop: '24px', borderTop: '2px dashed var(--border-color, #121212)', paddingTop: '20px' }}>
                  <p style={{ fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '24px' }}>
                    {partyDesc}
                  </p>

                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px' }}>
                    {t('platformStances')}:
                  </h4>

                  {/* List of stances */}
                  <div 
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr', 
                      gap: '12px',
                      maxHeight: '400px',
                      overflowY: 'auto',
                      paddingInlineEnd: '8px',
                      border: '2px solid var(--border-color, #121212)',
                      padding: '16px',
                      backgroundColor: '#FAF9F6'
                    }}
                  >
                    {questions.map((q) => {
                      const stanceValue = party.stances[q.id] !== undefined ? party.stances[q.id] : 0;
                      const stanceStyle = getStanceStyle(stanceValue);
                      const questionText = language === 'he' ? q.textHe : q.textEn;

                      return (
                        <div 
                          key={q.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '16px',
                            paddingBottom: '10px',
                            borderBottom: '1px solid #E0E0E0'
                          }}
                        >
                          <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                            <span 
                              className="monospace-label" 
                              style={{ 
                                fontSize: '0.7rem', 
                                color: '#777777', 
                                display: 'block',
                                marginBottom: '2px'
                              }}
                            >
                              {language === 'he' ? q.categoryHe : q.categoryEn}
                            </span>
                            {questionText}
                          </div>
                          
                          <span 
                            className="monospace-label"
                            style={{
                              fontSize: '0.75rem',
                              padding: '4px 8px',
                              border: '1.5px solid #121212',
                              whiteSpace: 'nowrap',
                              ...stanceStyle
                            }}
                          >
                            {getStanceLabel(stanceValue)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
