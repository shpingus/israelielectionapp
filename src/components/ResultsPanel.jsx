import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function ResultsPanel({ scores, answers, questions, parties, onRetake, onViewParties }) {
  const { t, language, dir } = useLanguage();

  // Allow comparing with any party, default to the best match
  const [comparedPartyId, setComparedPartyId] = useState(() => {
    if (scores && scores.length > 0) {
      return scores[0].partyId;
    }
    return '';
  });

  if (!scores || scores.length === 0) return null;

  // Best match is the first element since scores are pre-sorted descending
  const bestMatch = scores[0];
  const matchedParty = parties.find(p => p.id === bestMatch.partyId);
  const comparedParty = parties.find(p => p.id === comparedPartyId) || matchedParty;

  // Helper to translate stance values into user-friendly text based on question type
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

  // Helper to determine match compatibility rating based on question type
  const getCompatibilityInfo = (q, userVal, partyVal) => {
    if (userVal === 0) {
      return { 
        label: t('neutralStance'), 
        color: '#E0E0E0', 
        textColor: '#666666'
      };
    }
    
    if (q && q.type === 'multiple_choice') {
      if (userVal === partyVal) {
        return { 
          label: t('highlyAligned'), 
          color: 'var(--accent-cyan)', 
          textColor: '#121212' 
        };
      } else if (partyVal === 0) {
        return { 
          label: t('partialMatch'), 
          color: '#E0E0E0', 
          textColor: '#666666'
        };
      } else {
        return { 
          label: t('opposedStance'), 
          color: 'var(--accent-coral)', 
          textColor: '#FFFFFF' 
        };
      }
    }
    
    // Likert and statement-pair
    const diff = Math.abs(userVal - partyVal);
    if (diff === 0) {
      return { 
        label: t('highlyAligned'), 
        color: 'var(--accent-cyan)', 
        textColor: '#121212' 
      };
    } else if (diff <= 1) {
      return { 
        label: t('partialMatch'), 
        color: 'var(--accent-cobalt)', 
        textColor: '#FFFFFF' 
      };
    } else {
      return { 
        label: t('opposedStance'), 
        color: 'var(--accent-coral)', 
        textColor: '#FFFFFF' 
      };
    }
  };

  const matchedPartyName = language === 'he' ? matchedParty.nameHe : matchedParty.nameEn;
  const matchedPartyLeader = language === 'he' ? matchedParty.leaderHe : matchedParty.leaderEn;
  const matchedPartyDesc = language === 'he' ? matchedParty.descriptionHe : matchedParty.descriptionEn;

  return (
    <div className="slide-in-up" style={{ width: '100%', maxWidth: '800px', margin: '20px auto 40px auto' }}>
      
      {/* Top Banner: Best Match */}
      <div 
        className="brutalist-card" 
        style={{ 
          borderColor: matchedParty.color || '#121212',
          borderWidth: '4px',
          boxShadow: 'var(--shadow-x-card) var(--shadow-y-card) 0px #121212',
          marginBottom: '40px',
          backgroundColor: 'var(--card-bg-color, #FFFFFF)',
          textAlign: 'center'
        }}
      >
        <div 
          className="monospace-label"
          style={{
            fontSize: '0.9rem',
            backgroundColor: matchedParty.color || 'var(--accent-cyan)',
            color: '#FFFFFF',
            padding: '6px 16px',
            display: 'inline-block',
            marginBottom: '16px',
            border: '2px solid var(--border-color, #121212)'
          }}
        >
          {t('yourBestMatch')}
        </div>
        
        <h2 style={{ fontSize: '3rem', fontWeight: 800, margin: '8px 0', letterSpacing: '-1px' }}>
          {matchedPartyName}
        </h2>
        
        <div className="monospace-label" style={{ fontSize: '1.1rem', color: 'var(--text-color)', opacity: 0.7, marginBottom: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span>{t('leader')}: {matchedPartyLeader}</span>
          {matchedParty.website && (
            <>
              <span style={{ opacity: 0.5 }}>|</span>
              <a 
                href={matchedParty.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  color: 'var(--accent-cobalt, #0D47A1)', 
                  textDecoration: 'underline', 
                  fontWeight: 700 
                }}
              >
                {language === 'he' ? 'אתר רשמי' : 'Official Website'}
              </a>
            </>
          )}
        </div>
 
        {/* Scoring circle box */}
        <div 
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 32px',
            border: '3px solid var(--border-color, #121212)',
            backgroundColor: 'var(--accent-cyan)',
            boxShadow: 'var(--shadow-x) var(--shadow-y) 0px #121212',
            marginBottom: '24px'
          }}
        >
          <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>
            {bestMatch.score}%
          </span>
          <span className="monospace-label" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
            {t('stanceAlignment')}
          </span>
        </div>

        <p style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 16px auto', lineHeight: '1.6' }}>
          {matchedPartyDesc}
        </p>
      </div>

      {/* Action Navigation */}
      <div 
        style={{ 
          display: 'flex', 
          gap: '16px', 
          justifyContent: 'center', 
          marginBottom: '40px',
          flexWrap: 'wrap'
        }}
      >
        <button 
          onClick={onRetake} 
          className="brutalist-button primary" 
          style={{ fontSize: '1.05rem', padding: '14px 28px' }}
        >
          {t('retakeQuiz')}
        </button>
        <button 
          onClick={onViewParties} 
          className="brutalist-button" 
          style={{ fontSize: '1.05rem', padding: '14px 28px', backgroundColor: 'var(--card-bg-color, #FFFFFF)' }}
        >
          {t('exploreParties')}
        </button>
      </div>

      {/* Detail Comparative Table Section */}
      <div 
        id="comparison-breakdown-section"
        className="brutalist-card" 
        style={{ 
          padding: '24px', 
          backgroundColor: 'var(--card-bg-color, #FFFFFF)',
          scrollMarginTop: '20px'
        }}
      >
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '16px',
            marginBottom: '24px',
            borderBottom: '3px solid var(--border-color, #121212)',
            paddingBottom: '16px'
          }}
        >
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
            {t('detailedBreakdown')}
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <label htmlFor="compare-party-select" className="monospace-label" style={{ fontSize: '0.85rem' }}>
              {t('compareWith')}
            </label>
            <select
              id="compare-party-select"
              value={comparedPartyId}
              onChange={(e) => setComparedPartyId(e.target.value)}
              className="monospace-label"
              style={{
                padding: '8px 12px',
                fontSize: '0.85rem',
                border: '3px solid var(--border-color, #121212)',
                backgroundColor: 'var(--card-bg-color, #FFFFFF)',
                color: 'var(--text-color, #121212)',
                boxShadow: `${dir === 'rtl' ? '3px' : '-3px'} 3px 0px var(--border-color, #121212)`,
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)'
              }}
            >
              {scores.map((s) => {
                const party = parties.find(p => p.id === s.partyId);
                const name = language === 'he' ? party.nameHe : party.nameEn;
                return (
                  <option key={s.partyId} value={s.partyId}>
                    {name} ({s.score}%)
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table 
            style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              textAlign: language === 'he' ? 'right' : 'left'
            }}
          >
            <thead>
              <tr style={{ borderBottom: '3px solid #121212' }}>
                <th style={{ padding: '12px 8px', fontWeight: 800 }}>{t('issue')}</th>
                <th style={{ padding: '12px 8px', fontWeight: 800, width: '150px' }}>{t('yourStance')}</th>
                <th style={{ padding: '12px 8px', fontWeight: 800, width: '150px' }}>{t('partyStance')}</th>
                <th style={{ padding: '12px 8px', fontWeight: 800, width: '120px', textAlign: 'center' }}>{t('compatibility')}</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => {
                const userVal = answers[q.id] || 0;
                const partyVal = comparedParty.stances[q.id] !== undefined ? comparedParty.stances[q.id] : 0;
                const compat = getCompatibilityInfo(q, userVal, partyVal);
                
                const questionText = language === 'he' ? (q.type === 'statement_pair' ? t('selectStatement') : q.textHe) : (q.type === 'statement_pair' ? t('selectStatement') : q.textEn);

                return (
                  <tr 
                    key={q.id} 
                    style={{ 
                      borderBottom: '2px solid #121212',
                      backgroundColor: userVal === 0 ? '#FAF9F6' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '16px 8px', fontWeight: 500, fontSize: '0.95rem' }}>
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
                      {questionText}
                      {q.type === 'statement_pair' && (
                        <div style={{ fontSize: '0.8rem', color: '#555555', marginTop: '6px', fontStyle: 'italic' }}>
                          <strong>{t('statementA')}:</strong> {language === 'he' ? q.statementAHe : q.statementAEn}
                          <br />
                          <strong>{t('statementB')}:</strong> {language === 'he' ? q.statementBHe : q.statementBEn}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px 8px', fontSize: '0.9rem', fontWeight: 600 }}>
                      {getStanceLabel(q, userVal)}
                    </td>
                    <td style={{ padding: '16px 8px', fontSize: '0.9rem', color: '#444444' }}>
                      {getStanceLabel(q, partyVal)}
                    </td>
                    <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                      <span 
                        className="monospace-label"
                        style={{
                          fontSize: '0.75rem',
                          backgroundColor: compat.color,
                          color: compat.textColor,
                          padding: '4px 8px',
                          border: '2px solid var(--border-color, #121212)',
                          display: 'inline-block',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {compat.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rank of other parties */}
      {scores.length > 1 && (
        <div 
          className="brutalist-card" 
          style={{ 
            marginTop: '40px',
            padding: '24px',
            backgroundColor: 'var(--card-bg-color, #FFFFFF)'
          }}
        >
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '20px', textAlign: 'center' }}>
            {language === 'he' ? 'דירוג ההתאמה המלא' : 'Full Compatibility Ranking'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {scores.map((s) => {
              const party = parties.find(p => p.id === s.partyId);
              const partyName = language === 'he' ? party.nameHe : party.nameEn;
              const partyLeader = language === 'he' ? party.leaderHe : party.leaderEn;
              const isCurrentlyCompared = comparedPartyId === party.id;
              
              return (
                <div 
                  key={s.partyId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 18px',
                    border: '2px solid var(--border-color, #121212)',
                    backgroundColor: isCurrentlyCompared ? 'rgba(0, 229, 255, 0.1)' : 'var(--card-bg-color, #FFFFFF)',
                    borderLeft: `8px solid ${party.color || '#121212'}`,
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ flexGrow: 1 }}>
                    <strong style={{ fontSize: '1.1rem' }}>{partyName}</strong>
                    <span style={{ fontSize: '0.85rem', color: '#666666', marginInlineStart: '12px' }}>
                      ({t('leader')}: {partyLeader})
                    </span>
                    {s.partyId === bestMatch.partyId && (
                      <span 
                        className="monospace-label" 
                        style={{ 
                          fontSize: '0.7rem', 
                          backgroundColor: 'var(--accent-cyan)', 
                          padding: '2px 6px', 
                          border: '1px solid #121212',
                          marginInlineStart: '8px'
                        }}
                      >
                        {t('yourBestMatch')}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span 
                      className="monospace-label"
                      style={{
                        backgroundColor: 'var(--accent-cyan)',
                        padding: '4px 10px',
                        border: '2px solid #121212',
                        fontSize: '0.85rem'
                      }}
                    >
                      {s.score}%
                    </span>
                    <button
                      onClick={() => {
                        setComparedPartyId(party.id);
                        const compareSection = document.getElementById('comparison-breakdown-section');
                        if (compareSection) {
                          compareSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="brutalist-button half-shadow"
                      style={{
                        padding: '4px 12px',
                        fontSize: '0.75rem',
                        backgroundColor: isCurrentlyCompared ? 'var(--accent-cyan)' : '#FFFFFF',
                        fontWeight: 800,
                        textTransform: 'none'
                      }}
                    >
                      {t('compareStances')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
