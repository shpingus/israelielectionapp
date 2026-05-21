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
        <button onClick={onBack} className="brutalist-button" style={{ backgroundColor: '#FFFFFF', padding: '8px 16px' }}>
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

          return (
            <div 
              key={party.id}
              className="brutalist-card"
              style={{
                backgroundColor: '#FFFFFF',
                borderLeftWidth: '10px',
                borderLeftColor: party.color || '#121212',
                padding: '24px',
                boxShadow: isExpanded 
                  ? 'var(--shadow-x-card) var(--shadow-y-card) 0px #121212'
                  : '4px 4px 0px #121212',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease'
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
                  <div className="monospace-label" style={{ fontSize: '0.85rem', color: '#555555' }}>
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

              {/* Collapsible Info */}
              {isExpanded && (
                <div style={{ marginTop: '24px', borderTop: '2.5px dashed #121212', paddingTop: '20px' }}>
                  
                  {/* General Description */}
                  <p style={{ fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '24px' }}>
                    {partyDesc}
                  </p>

                  {/* History Section */}
                  {(language === 'he' ? party.historyHe : party.historyEn) && (
                    <div style={{ marginBottom: '24px' }}>
                      <h4 
                        style={{ 
                          fontSize: '1.2rem', 
                          fontWeight: 800, 
                          marginBottom: '8px', 
                          borderBottom: '2.5px solid #121212', 
                          paddingBottom: '4px', 
                          display: 'inline-block' 
                        }}
                      >
                        {t('history')}
                      </h4>
                      <p style={{ fontSize: '0.95rem', lineHeight: '1.6', margin: '0' }}>
                        {language === 'he' ? party.historyHe : party.historyEn}
                      </p>
                    </div>
                  )}

                  {/* Pros & Challenges */}
                  {(language === 'he' ? party.prosHe : party.prosEn) && (
                    <div 
                      style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                        gap: '20px', 
                        marginBottom: '28px' 
                      }}
                    >
                      {/* Pros / Strengths */}
                      <div 
                        style={{ 
                          border: '2.5px solid #121212', 
                          padding: '16px', 
                          backgroundColor: '#E8F5E9',
                          boxShadow: '4px 4px 0px #121212'
                        }}
                      >
                        <h5 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 12px 0', color: '#2E7D32', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>✓</span> {t('pros')}
                        </h5>
                        <ul style={{ margin: 0, paddingInlineStart: '20px', fontSize: '0.9rem', lineHeight: '1.55' }}>
                          {(language === 'he' ? party.prosHe : party.prosEn).map((pro, index) => (
                            <li key={index} style={{ marginBottom: '8px' }}>{pro}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Challenges / Criticisms */}
                      <div 
                        style={{ 
                          border: '2.5px solid #121212', 
                          padding: '16px', 
                          backgroundColor: '#FFEBEE',
                          boxShadow: '4px 4px 0px #121212'
                        }}
                      >
                        <h5 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 12px 0', color: '#C62828', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>⚠</span> {t('challenges')}
                        </h5>
                        <ul style={{ margin: 0, paddingInlineStart: '20px', fontSize: '0.9rem', lineHeight: '1.55' }}>
                          {(language === 'he' ? party.challengesHe : party.challengesEn).map((challenge, index) => (
                            <li key={index} style={{ marginBottom: '8px' }}>{challenge}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Platforms Title */}
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', borderBottom: '2.5px solid #121212', paddingBottom: '4px', display: 'inline-block' }}>
                    {t('platformStances')}:
                  </h4>

                  {/* Stance List */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
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
