import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { submitConsiderationFeedback, trackAction } from '../utils/tracker';
import { generateShareCanvas } from '../utils/shareImageGenerator';

export default function ResultsPanel({ scores, answers, questions, parties, partyStances, onRetake, onViewParties }) {
  const { t, language, dir } = useLanguage();
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Allow comparing with any party, default to the best match
  const [comparedPartyId, setComparedPartyId] = useState(() => {
    if (scores && scores.length > 0) {
      return scores[0].partyId;
    }
    return '';
  });

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isFallbackOpen, setIsFallbackOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fallbackData, setFallbackData] = useState({ filename: '', size: '', payload: '' });
  const canvasRef = useRef(null);
  const hiddenCanvasRef = useRef(null);

  const bestMatch = scores && scores.length > 0 ? scores[0] : null;
  const matchedParty = bestMatch ? parties.find(p => p.id === bestMatch.partyId) : null;
  const comparedParty = (bestMatch && parties.find(p => p.id === comparedPartyId)) || matchedParty;

  const matchedPartyName = matchedParty ? (language === 'he' ? matchedParty.nameHe : matchedParty.nameEn) : '';
  const matchedPartyLeader = matchedParty ? (language === 'he' ? matchedParty.leaderHe : matchedParty.leaderEn) : '';
  const matchedPartyDesc = matchedParty ? (language === 'he' ? matchedParty.descriptionHe : matchedParty.descriptionEn) : '';

  // Pre-draw the sharing card onto the hidden canvas as soon as the results load
  useEffect(() => {
    if (hiddenCanvasRef.current && matchedParty) {
      document.fonts.ready.then(async () => {
        try {
          await generateShareCanvas(
            hiddenCanvasRef.current,
            {
              partyName: matchedPartyName,
              leaderName: matchedPartyLeader,
              score: bestMatch.score,
              description: matchedPartyDesc,
              accentColor: matchedParty.color
            },
            language === 'he',
            t,
            'Cinzel'
          );
        } catch (err) {
          console.error("Failed to pre-generate canvas:", err);
        }
      });
    }
  }, [matchedPartyName, matchedPartyLeader, bestMatch, matchedPartyDesc, matchedParty, language, t]);

  // Render modal canvas on open
  useEffect(() => {
    if (isShareModalOpen && canvasRef.current && matchedParty) {
      document.fonts.ready.then(async () => {
        try {
          await generateShareCanvas(
            canvasRef.current,
            {
              partyName: matchedPartyName,
              leaderName: matchedPartyLeader,
              score: bestMatch.score,
              description: matchedPartyDesc,
              accentColor: matchedParty.color
            },
            language === 'he',
            t,
            'Cinzel'
          );
        } catch (err) {
          console.error("Failed to generate modal canvas:", err);
        }
      });
    }
  }, [isShareModalOpen, matchedPartyName, matchedPartyLeader, bestMatch, matchedPartyDesc, matchedParty, language, t]);

  const executeNativeShare = async (canvas) => {
    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) return reject(new Error("Failed to create blob"));
        const file = new File([blob], 'elections_match.png', { type: 'image/png' });
        const title = language === 'he' ? 'תוצאות התאמת הבחירות שלי' : 'My Election Match Result';
        const text = language === 'he' 
          ? `קיבלתי התאמה של ${bestMatch.score}% עם ${matchedPartyName}! גלו את המפלגה שלכם:`
          : `I matched ${bestMatch.score}% with ${matchedPartyName}! Find your match:`;
        const url = 'https://elections.ruppin.dev';

        const shareDataWithText = { files: [file], title, text, url };
        const shareDataFileOnly = { files: [file] };

        try {
          if (navigator.canShare && navigator.canShare(shareDataWithText)) {
            await navigator.share(shareDataWithText);
            resolve(true);
          } else if (navigator.canShare && navigator.canShare(shareDataFileOnly)) {
            await navigator.share(shareDataFileOnly);
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (err) {
          if (err.name === 'AbortError') {
            // User cancelled the share sheet, do not open modal
            resolve(true);
          } else {
            reject(err);
          }
        }
      }, 'image/png');
    });
  };

  const handleShareClick = async () => {
    trackAction('share_button_click', matchedParty.id, bestMatch.score, language);
    const canvas = hiddenCanvasRef.current;
    if (canvas) {
      try {
        const success = await executeNativeShare(canvas);
        if (!success) {
          setIsShareModalOpen(true);
        }
      } catch (err) {
        console.error("Direct native share failed, opening modal:", err);
        setIsShareModalOpen(true);
      }
    } else {
      setIsShareModalOpen(true);
    }
  };

  const handleNativeShare = async () => {
    const canvas = canvasRef.current || hiddenCanvasRef.current;
    if (canvas) {
      try {
        await executeNativeShare(canvas);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current || hiddenCanvasRef.current;
    if (!canvas || !matchedParty || !bestMatch) return;
    trackAction('download_image', matchedParty.id, bestMatch.score, language);
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `elections_match_${matchedParty.id}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToClipboard = async () => {
    const canvas = canvasRef.current || hiddenCanvasRef.current;
    if (!canvas || !matchedParty || !bestMatch) return;
    trackAction('copy_clipboard', matchedParty.id, bestMatch.score, language);
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }, 'image/png');
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  if (!scores || scores.length === 0 || !matchedParty) return null;

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
        
        <h2 style={{ fontSize: '3rem', fontWeight: 400, margin: '8px 0', letterSpacing: '-1px' }}>
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

        {/* Stylish Share Call-to-Action Box */}
        <div 
          className="brutalist-card" 
          style={{ 
            marginTop: '24px', 
            marginBottom: '12px',
            padding: '20px', 
            backgroundColor: '#FAF9F6', 
            border: '3px dashed var(--border-color, #121212)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            boxShadow: 'none',
            transform: 'none'
          }}
        >
          <div className="monospace-label" style={{ fontSize: '0.85rem', color: '#666666', fontWeight: '700' }}>
            {language === 'he' ? 'שתפו את ההתאמה שלכם בסטורי!' : 'SHARE YOUR MATCH TO STORIES!'}
          </div>
          
          <button 
            onClick={handleShareClick} 
            className="brutalist-button primary interactive" 
            style={{ 
              width: '100%', 
              maxWidth: '340px', 
              fontSize: '1.1rem', 
              fontWeight: 800, 
              backgroundColor: 'var(--accent-cyan, #00E5FF)', 
              padding: '12px 24px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '10px',
              cursor: 'pointer'
            }}
          >
            <span>{language === 'he' ? 'שתפו עכשיו' : 'SHARE NOW'}</span>
          </button>
        </div>

        {/* Post-quiz Voting Consideration Questionnaire */}
        <div 
          style={{ 
            marginTop: '32px', 
            paddingTop: '24px', 
            borderTop: '3px dashed var(--border-color, #121212)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
            {t('considerVotingQuestion')}
          </h4>
          
          {!feedbackSubmitted ? (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  submitConsiderationFeedback('yes');
                  setFeedbackSubmitted(true);
                }}
                className="brutalist-button half-shadow"
                style={{ padding: '8px 24px', fontSize: '1rem', backgroundColor: '#00E5FF', fontWeight: 800, cursor: 'pointer' }}
              >
                {t('yes')}
              </button>
              <button
                onClick={() => {
                  submitConsiderationFeedback('no');
                  setFeedbackSubmitted(true);
                }}
                className="brutalist-button half-shadow"
                style={{ padding: '8px 24px', fontSize: '1rem', backgroundColor: '#FF5252', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer' }}
              >
                {t('no')}
              </button>
              <button
                onClick={() => {
                  submitConsiderationFeedback('maybe');
                  setFeedbackSubmitted(true);
                }}
                className="brutalist-button half-shadow"
                style={{ padding: '8px 24px', fontSize: '1rem', backgroundColor: '#FFFFFF', fontWeight: 800, cursor: 'pointer' }}
              >
                {t('maybe')}
              </button>
            </div>
          ) : (
            <div 
              style={{ 
                fontSize: '1.1rem', 
                fontWeight: 700, 
                color: 'var(--accent-cobalt, #0D47A1)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px' 
              }}
            >
              <span>✓ {t('feedbackReceived')}</span>
            </div>
          )}
        </div>
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
          onClick={() => {
            trackAction('open_share_modal', matchedParty.id, bestMatch.score, language);
            setIsShareModalOpen(true);
          }} 
          className="brutalist-button" 
          style={{ fontSize: '1.05rem', padding: '14px 28px', backgroundColor: 'var(--accent-cyan)' }}
        >
          {t('shareResults')}
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
              onChange={(e) => {
                const val = e.target.value;
                setComparedPartyId(val);
                trackAction('compare_party', 'comparison_dropdown', val, language);
              }}
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
                const comparedStances = (partyStances && partyStances[comparedParty.id]) || {};
                const partyVal = comparedStances[q.id] !== undefined ? comparedStances[q.id] : 0;
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
                        trackAction('compare_party', 'ranking_compare_button', party.id, language);
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

      {/* Share Modal Dialog Overlay */}
      {isShareModalOpen && (
        <div 
          className="modal-overlay" 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(18, 18, 18, 0.45)', 
            backdropFilter: 'blur(6px)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            zIndex: 1000, 
            padding: '20px' 
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsShareModalOpen(false);
          }}
        >
          <div 
            className="brutalist-card slide-in-up" 
            style={{ 
              maxWidth: '440px', 
              backgroundColor: '#FFFFFF', 
              boxShadow: 'var(--shadow-x-card) var(--shadow-y-card) 0px #121212',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '24px',
              border: '3px solid #121212'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color, #121212)', paddingBottom: '8px' }}>
              <h3 style={{ fontSize: '1.4rem', margin: 0 }}>{t('shareModalTitle')}</h3>
              <button 
                onClick={() => setIsShareModalOpen(false)} 
                style={{ background: 'none', border: 'none', fontSize: '1.3rem', fontWeight: 'bold', cursor: 'pointer', padding: '0 6px' }}
              >
                ✕
              </button>
            </div>
            
            <p style={{ fontSize: '0.9rem', margin: 0, opacity: 0.8 }}>
              {t('shareModalSubtitle')}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
              <a 
                href="https://elections.ruppin.dev" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ display: 'block', cursor: 'pointer' }}
                title={language === 'he' ? 'לחצו למעבר לאתר' : 'Click to visit website'}
              >
                <canvas 
                  ref={canvasRef} 
                  width="1080" 
                  height="1920" 
                  style={{ 
                    width: '210px', 
                    height: '373.3px', 
                    border: '3px solid #121212', 
                    boxShadow: `${dir === 'rtl' ? '4px' : '-4px'} 4px 0px #121212`,
                    display: 'block'
                  }}
                />
              </a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={handleNativeShare} 
                className="brutalist-button primary" 
                style={{ width: '100%', fontSize: '0.95rem' }}
              >
                {t('shareImage')}
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={handleDownload} 
                  className="brutalist-button" 
                  style={{ flex: 1, fontSize: '0.85rem', padding: '10px', backgroundColor: '#FFFFFF' }}
                >
                  {t('downloadImage')}
                </button>
                <button 
                  onClick={handleCopyToClipboard} 
                  className="brutalist-button" 
                  style={{ flex: 1, fontSize: '0.85rem', padding: '10px', backgroundColor: '#FFFFFF' }}
                >
                  {copied ? (language === 'he' ? 'הועתק!' : 'Copied!') : t('copyImage')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fallback Simulation Modal Dialog Overlay */}
      {isFallbackOpen && (
        <div 
          className="modal-overlay" 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(18, 18, 18, 0.45)', 
            backdropFilter: 'blur(6px)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            zIndex: 1010, 
            padding: '20px' 
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFallbackOpen(false);
          }}
        >
          <div 
            className="brutalist-card" 
            style={{ 
              maxWidth: '460px', 
              backgroundColor: '#FFFFFF', 
              boxShadow: 'var(--shadow-x-card) var(--shadow-y-card) 0px #121212',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '24px',
              border: '3px solid #121212'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color, #121212)', paddingBottom: '8px' }}>
              <h3 style={{ fontSize: '1.3rem', margin: 0 }}>{t('fallbackModalTitle')}</h3>
              <button 
                onClick={() => setIsFallbackOpen(false)} 
                style={{ background: 'none', border: 'none', fontSize: '1.3rem', fontWeight: 'bold', cursor: 'pointer', padding: '0 6px' }}
              >
                ✕
              </button>
            </div>
            
            <p style={{ fontSize: '0.9rem', margin: 0, opacity: 0.8, lineHeight: '1.5' }}>
              {t('fallbackModalDesc')}
            </p>

            <div style={{ backgroundColor: '#FAF9F6', border: '2px dashed var(--border-color, #121212)', padding: '12px', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div><strong>File:</strong> {fallbackData.filename}</div>
              <div><strong>Size:</strong> {fallbackData.size}</div>
              <div><strong>Payload:</strong> <code style={{ wordBreak: 'break-all', background: '#eee', padding: '2px 4px' }}>{fallbackData.payload}</code></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => { handleDownload(); setIsFallbackOpen(false); }} 
                className="brutalist-button primary" 
                style={{ width: '100%' }}
              >
                📥 {t('downloadImage')}
              </button>
              <button 
                onClick={() => { handleCopyToClipboard(); setIsFallbackOpen(false); }} 
                className="brutalist-button" 
                style={{ width: '100%', backgroundColor: '#FFFFFF' }}
              >
                📋 {t('copyImage')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Canvas for Direct Web Share pre-generation */}
      <canvas 
        ref={hiddenCanvasRef} 
        width="1080" 
        height="1920" 
        style={{ position: 'absolute', left: '-9999px', top: '-9999px', visibility: 'hidden' }}
      />

    </div>
  );
}
