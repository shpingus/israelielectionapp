import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function PartyDatabase({ parties, questions, onBack }) {
  const { t, language, dir } = useLanguage();
  const [expandedPartyId, setExpandedPartyId] = useState(null);

  const toggleExpand = (id) => {
    if (expandedPartyId === id) {
      setExpandedPartyId(null);
    } else {
      setExpandedPartyId(id);
    }
  };

  const getStanceLabel = (q, val) => {
    if (!q) return '';
    
    if (q.type === 'statement_pair') {
      if (val === 2) return t('statementA');
      if (val === 1) return language === 'he' ? "נוטה לקביעה א'" : "Leans Statement A";
      if (val === -1) return language === 'he' ? "נוטה לקביעה ב'" : "Leans Statement B";
      if (val === -2) return t('statementB');
      return t('noOpinion');
    }
    
    if (q.type === 'multiple_choice') {
      if (val === 0) return t('noOpinion');
      const opt = q.options && q.options.find(o => o.value === val);
      if (opt) {
        return language === 'he' ? opt.textHe : opt.textEn;
      }
      return t('noOpinion');
    }
    
    // Default: likert
    if (val === 2) return t('stronglyAgree');
    if (val === 1) return t('agree');
    if (val === -1) return t('disagree');
    if (val === -2) return t('stronglyDisagree');
    return t('noOpinion');
  };

  const getStanceStyle = (val) => {
    if (val === 2 || val === 1) {
      return { bg: 'var(--accent-cyan)', color: '#121212' };
    } else if (val === -1 || val === -2) {
      return { bg: 'var(--accent-coral)', color: '#FFFFFF' };
    }
    // If multiple choice option chosen, color it with cyan (active stance)
    if (val > 0) {
      return { bg: 'var(--accent-cyan)', color: '#121212' };
    }
    return { bg: '#E0E0E0', color: '#666666' };
  };

  const backArrow = dir === 'rtl' ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="square" strokeLinejoin="miter" style={{ display: 'inline-block', verticalAlign: 'middle', marginInlineEnd: '6px' }}><line x1="4" y1="12" x2="20" y2="12" /><polyline points="13 5 20 12 13 19" /></svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="square" strokeLinejoin="miter" style={{ display: 'inline-block', verticalAlign: 'middle', marginInlineEnd: '6px' }}><line x1="20" y1="12" x2="4" y2="12" /><polyline points="11 5 4 12 11 19" /></svg>
  );

  return (
    <div className="slide-in-up" style={{ width: '100%', maxWidth: '800px', margin: '20px auto 40px auto' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
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

      {/* List of Parties */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {parties.map((party) => {
          const isExpanded = expandedPartyId === party.id;
          const partyName = language === 'he' ? party.nameHe : party.nameEn;
          const partyLeader = language === 'he' ? party.leaderHe : party.leaderEn;
          const partyDesc = language === 'he' ? party.descriptionHe : party.descriptionEn;
          const historyText = language === 'he' ? party.historyHe : party.historyEn;
          const prosList = language === 'he' ? party.prosHe : party.prosEn;
          const challengesList = language === 'he' ? party.challengesHe : party.challengesEn;

          return (
            <div 
              key={party.id}
              className="brutalist-card"
              style={{
                borderLeftWidth: '10px',
                borderLeftColor: party.color || '#121212',
                padding: '24px',
                boxShadow: isExpanded 
                  ? 'calc(var(--shadow-x) * 1.5) calc(var(--shadow-y) * 1.5) 0px #121212' 
                  : 'var(--shadow-x) var(--shadow-y) 0px #121212',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                backgroundColor: 'var(--card-bg-color, #FFFFFF)'
              }}
            >
              {/* Party Header Info */}
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 4px 0' }}>
                    {partyName}
                  </h3>
                  <div className="monospace-label" style={{ color: 'var(--text-color, #555555)', opacity: 0.7, fontSize: '0.9rem' }}>
                    {t('leader')}: {partyLeader}
                  </div>
                </div>
                
                <button 
                  onClick={() => toggleExpand(party.id)}
                  className="brutalist-button half-shadow"
                  style={{
                    backgroundColor: isExpanded ? 'var(--accent-cyan)' : '#FFFFFF',
                    padding: '6px 14px',
                    fontSize: '0.85rem'
                  }}
                >
                  {isExpanded ? (language === 'he' ? 'סגור פרופיל' : 'Close Profile') : t('viewPlatform')}
                </button>
              </div>

              {isExpanded && (
                <div style={{ marginTop: '24px', borderTop: '2.5px dashed var(--border-color, #121212)', paddingTop: '20px' }}>
                  <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '24px', fontWeight: 500 }}>
                    {partyDesc}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '28px' }}>
                    {/* History Section */}
                    {historyText && (
                      <div style={{ border: '3px solid var(--border-color, #121212)', padding: '20px', backgroundColor: 'var(--card-bg-color, #FFFFFF)', boxShadow: 'var(--shadow-x) var(--shadow-y) 0px var(--border-color, #121212)' }}>
                        <h4 className="monospace-label" style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 12px 0', display: 'inline-block', backgroundColor: 'var(--accent-cyan)', padding: '4px 8px', border: '2px solid var(--border-color, #121212)', color: 'var(--text-color, #121212)' }}>
                          {t('history')}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6' }}>
                          {historyText}
                        </p>
                      </div>
                    )}

                    {/* Pros and Challenges Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                      {/* Strengths */}
                      {prosList && prosList.length > 0 && (
                        <div style={{ border: '3px solid var(--border-color, #121212)', padding: '20px', backgroundColor: 'var(--card-bg-color, #FFFFFF)', boxShadow: 'var(--shadow-x) var(--shadow-y) 0px var(--border-color, #121212)' }}>
                          <h4 className="monospace-label" style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 12px 0', display: 'inline-block', backgroundColor: 'rgba(0, 229, 255, 0.2)', padding: '4px 8px', border: '2px solid var(--border-color, #121212)', color: 'var(--text-color, #121212)' }}>
                            {t('strengths')}
                          </h4>
                          <ul style={{ margin: 0, paddingInlineStart: '20px', fontSize: '0.95rem', lineHeight: '1.5' }}>
                            {prosList.map((pro, index) => (
                              <li key={index} style={{ marginBottom: '8px' }}>{pro}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Challenges */}
                      {challengesList && challengesList.length > 0 && (
                        <div style={{ border: '3px solid var(--border-color, #121212)', padding: '20px', backgroundColor: 'var(--card-bg-color, #FFFFFF)', boxShadow: 'var(--shadow-x) var(--shadow-y) 0px var(--border-color, #121212)' }}>
                          <h4 className="monospace-label" style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 12px 0', display: 'inline-block', backgroundColor: 'rgba(255, 82, 82, 0.2)', padding: '4px 8px', border: '2px solid var(--border-color, #121212)', color: 'var(--text-color, #121212)' }}>
                            {t('challenges')}
                          </h4>
                          <ul style={{ margin: 0, paddingInlineStart: '20px', fontSize: '0.95rem', lineHeight: '1.5' }}>
                            {challengesList.map((challenge, index) => (
                              <li key={index} style={{ marginBottom: '8px' }}>{challenge}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>
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
                      
                      const questionText = language === 'he' ? (q.type === 'statement_pair' ? t('selectStatement') : q.textHe) : (q.type === 'statement_pair' ? t('selectStatement') : q.textEn);

                      return (
                        <div 
                          key={q.id}
                          style={{
                            padding: '16px 0',
                            borderBottom: '1px solid #E0E0E0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '12px'
                          }}
                        >
                          <div style={{ flex: '1 1 300px' }}>
                            <div 
                              className="monospace-label"
                              style={{ 
                                fontSize: '0.7rem', 
                                color: '#777777', 
                                marginBottom: '4px' 
                              }}
                            >
                              {language === 'he' ? q.categoryHe : q.categoryEn}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{questionText}</span>
                            {q.type === 'statement_pair' && (
                              <div style={{ fontSize: '0.8rem', color: '#555555', marginTop: '6px', fontStyle: 'italic' }}>
                                <strong>{t('statementA')}:</strong> {language === 'he' ? q.statementAHe : q.statementAEn}
                                <br />
                                <strong>{t('statementB')}:</strong> {language === 'he' ? q.statementBHe : q.statementBEn}
                              </div>
                            )}
                          </div>
                          
                          <div style={{ flexShrink: 0 }}>
                            <span 
                              className="monospace-label"
                              style={{
                                fontSize: '0.8rem',
                                backgroundColor: stanceStyle.bg,
                                color: stanceStyle.color,
                                padding: '4px 10px',
                                border: '2px solid #121212',
                                display: 'inline-block',
                                maxWidth: '240px',
                                wordBreak: 'break-word',
                                textAlign: 'center'
                              }}
                            >
                              {getStanceLabel(q, stanceValue)}
                            </span>
                          </div>
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
