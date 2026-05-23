import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function AdminDashboard({ onClose }) {
  const { t, language, dir } = useLanguage();
  const [token, setToken] = useState(() => sessionStorage.getItem('elections_admin_token') || '');
  const [inputToken, setInputToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // Dashboard Telemetry Stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');

  // SQL Console State
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM sessions ORDER BY created_at DESC LIMIT 10;');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResults, setQueryResults] = useState(null);
  const [queryError, setQueryError] = useState('');

  // Validate Token on Mount or Token Change
  useEffect(() => {
    verifyToken(token);
  }, [token]);

  const verifyToken = async (authToken) => {
    setStatsLoading(true);
    setStatsError('');
    try {
      const headers = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      const res = await fetch('/api/stats', { headers });

      if (res.status === 200) {
        const data = await res.json();
        setStats(data);
        setIsAuthenticated(true);
        if (authToken) {
          sessionStorage.setItem('elections_admin_token', authToken);
        }
        setAuthError('');
      } else if (res.status === 401) {
        setIsAuthenticated(false);
        sessionStorage.removeItem('elections_admin_token');
        if (authToken) {
          setAuthError(t('invalidToken'));
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setStatsError(errData.error || 'Failed to authenticate');
        setIsAuthenticated(false);
      }
    } catch (e) {
      setStatsError(e.message);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (inputToken.trim()) {
      setToken(inputToken.trim());
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout failed:', e);
    }
    sessionStorage.removeItem('elections_admin_token');
    setToken('');
    setInputToken('');
    setIsAuthenticated(false);
    setStats(null);
    setQueryResults(null);
    setQueryError('');
  };

  const runCustomQuery = async (queryText) => {
    setQueryLoading(true);
    setQueryError('');
    setQueryResults(null);
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/admin/query', {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: queryText })
      });

      const data = await res.json();
      if (res.status === 200) {
        setQueryResults(data.results || []);
      } else {
        setQueryError(data.error || 'Failed to execute query');
      }
    } catch (e) {
      setQueryError(e.message);
    } finally {
      setQueryLoading(false);
    }
  };

  const handleQuerySubmit = (e) => {
    e.preventDefault();
    if (sqlQuery.trim()) {
      runCustomQuery(sqlQuery);
    }
  };

  const loadQuickQuery = (queryText) => {
    setSqlQuery(queryText);
    runCustomQuery(queryText);
  };

  if (!isAuthenticated) {
    return (
      <div className="dotted-background" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div 
          className="brutalist-card slide-in-up" 
          style={{ 
            maxWidth: '450px', 
            width: '100%', 
            backgroundColor: 'var(--card-bg-color, #FFFFFF)', 
            padding: '32px',
            textAlign: 'center'
          }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.5px' }}>
            {t('adminDashboard')}
          </h2>
          <p className="monospace-label" style={{ fontSize: '0.85rem', color: '#666666', marginBottom: '24px' }}>
            {t('adminTokenPrompt')}
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="password"
              placeholder={t('adminTokenPlaceholder')}
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              className="monospace-label"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '1rem',
                border: '3px solid var(--border-color, #121212)',
                outline: 'none',
                backgroundColor: 'var(--card-bg-color, #FFFFFF)'
              }}
              required
            />
            {authError && (
              <div 
                style={{ 
                  color: 'var(--accent-coral, #FF5252)', 
                  fontWeight: 700, 
                  fontSize: '0.9rem',
                  border: '2px solid var(--accent-coral, #FF5252)',
                  padding: '8px',
                  backgroundColor: 'rgba(255, 82, 82, 0.1)'
                }}
              >
                {authError}
              </div>
            )}
            {statsError && (
              <div 
                style={{ 
                  color: 'var(--accent-coral, #FF5252)', 
                  fontWeight: 700, 
                  fontSize: '0.9rem',
                  border: '2px solid var(--accent-coral, #FF5252)',
                  padding: '8px',
                  backgroundColor: 'rgba(255, 82, 82, 0.1)'
                }}
              >
                {statsError}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button 
                type="submit" 
                className="brutalist-button primary" 
                style={{ flex: 1, padding: '12px', fontSize: '1rem' }}
                disabled={statsLoading}
              >
                {statsLoading ? '...' : t('submitToken')}
              </button>
              <button 
                type="button" 
                onClick={onClose} 
                className="brutalist-button" 
                style={{ flex: 1, padding: '12px', fontSize: '1rem', backgroundColor: '#FFFFFF' }}
              >
                {t('close')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="slide-in-up" style={{ width: '100%', maxWidth: '1000px', margin: '20px auto 60px auto' }}>
      
      {/* Header Panel */}
      <div 
        className="brutalist-card" 
        style={{ 
          borderColor: 'var(--border-color, #121212)',
          borderWidth: '4px',
          boxShadow: 'var(--shadow-x-card) var(--shadow-y-card) 0px #121212',
          marginBottom: '32px',
          backgroundColor: 'var(--accent-cyan, #00E5FF)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '24px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
            {t('adminDashboard')}
          </h2>
          <span className="monospace-label" style={{ fontSize: '0.85rem', opacity: 0.8 }}>
            SECURE REMOTE D1 DATABASE PORTAL
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleLogout} 
            className="brutalist-button" 
            style={{ padding: '8px 16px', fontSize: '0.9rem', backgroundColor: '#FFFFFF' }}
          >
            {language === 'he' ? 'התנתק' : 'Logout'}
          </button>
          <button 
            onClick={onClose} 
            className="brutalist-button primary" 
            style={{ padding: '8px 16px', fontSize: '0.9rem', backgroundColor: 'var(--border-color, #121212)', color: '#FFFFFF' }}
          >
            {t('closeAdmin')}
          </button>
        </div>
      </div>

      {/* Stats Loading/Error */}
      {statsError && (
        <div 
          style={{ 
            color: 'var(--accent-coral, #FF5252)', 
            fontWeight: 700, 
            fontSize: '1rem',
            border: '3px solid var(--accent-coral, #FF5252)',
            padding: '16px',
            backgroundColor: 'rgba(255, 82, 82, 0.1)',
            marginBottom: '32px'
          }}
        >
          {statsError}
        </div>
      )}

      {/* Telemetry Overview Cards */}
      {stats && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '16px' }}>
            {t('statsOverview')}
          </h3>
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
              gap: '16px',
              marginBottom: '24px'
            }}
          >
            <div className="brutalist-card" style={{ padding: '16px', backgroundColor: 'var(--card-bg-color, #FFFFFF)', textAlign: 'center' }}>
              <div className="monospace-label" style={{ fontSize: '0.75rem', opacity: 0.7 }}>{t('startedCount')}</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px' }}>{stats.summary.totalSessionsStarted}</div>
            </div>
            <div className="brutalist-card" style={{ padding: '16px', backgroundColor: 'var(--card-bg-color, #FFFFFF)', textAlign: 'center' }}>
              <div className="monospace-label" style={{ fontSize: '0.75rem', opacity: 0.7 }}>{t('completedCount')}</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px' }}>{stats.summary.totalSessionsCompleted}</div>
            </div>
            <div className="brutalist-card" style={{ padding: '16px', backgroundColor: 'var(--card-bg-color, #FFFFFF)', textAlign: 'center' }}>
              <div className="monospace-label" style={{ fontSize: '0.75rem', opacity: 0.7 }}>{t('conversionRateLabel')}</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px', color: 'var(--accent-cobalt, #2979FF)' }}>{stats.summary.completionRate}%</div>
            </div>
            <div className="brutalist-card" style={{ padding: '16px', backgroundColor: 'var(--card-bg-color, #FFFFFF)', textAlign: 'center' }}>
              <div className="monospace-label" style={{ fontSize: '0.75rem', opacity: 0.7 }}>{t('avgScoreLabel')}</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px', color: '#00B0FF' }}>{stats.summary.averageMatchScore}%</div>
            </div>
            <div className="brutalist-card" style={{ padding: '16px', backgroundColor: 'var(--card-bg-color, #FFFFFF)', textAlign: 'center' }}>
              <div className="monospace-label" style={{ fontSize: '0.75rem', opacity: 0.7 }}>{t('avgActionsLabel')}</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px' }}>{stats.summary.averageActionsPerSession}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* Considered Voting Feedback */}
            <div className="brutalist-card" style={{ padding: '20px', backgroundColor: 'var(--card-bg-color, #FFFFFF)' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 800 }}>
                {t('consideredVotingSummary')}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(stats.consideredVotingFeedback).map(([choice, count]) => {
                  const total = stats.summary.totalSessionsCompleted || 1;
                  const pct = Math.round((count / total) * 100);
                  const color = choice === 'yes' ? '#00E5FF' : choice === 'no' ? '#FF5252' : '#B0BEC5';
                  return (
                    <div key={choice}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                        <span className="monospace-label" style={{ textTransform: 'capitalize' }}>{t(choice) || choice}</span>
                        <strong className="monospace-label">{count} ({pct}%)</strong>
                      </div>
                      <div style={{ width: '100%', height: '16px', border: '2px solid #121212', backgroundColor: '#F0F0F0' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Language distribution */}
            <div className="brutalist-card" style={{ padding: '20px', backgroundColor: 'var(--card-bg-color, #FFFFFF)' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 800 }}>
                {language === 'he' ? 'חלוקת שפות' : 'Languages Used'}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.languageDistribution.map((row) => {
                  const total = stats.summary.totalSessionsStarted || 1;
                  const pct = Math.round((row.count / total) * 100);
                  return (
                    <div key={row.language}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                        <span className="monospace-label">{row.language === 'he' ? 'עברית (HE)' : row.language === 'en' ? 'English (EN)' : row.language}</span>
                        <strong className="monospace-label">{row.count} ({pct}%)</strong>
                      </div>
                      <div style={{ width: '100%', height: '16px', border: '2px solid #121212', backgroundColor: '#F0F0F0' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--accent-cobalt, #2979FF)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SQL Sandbox Section */}
      <div 
        className="brutalist-card" 
        style={{ 
          padding: '24px', 
          backgroundColor: 'var(--card-bg-color, #FFFFFF)'
        }}
      >
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '16px', borderBottom: '3px solid #121212', paddingBottom: '8px' }}>
          {language === 'he' ? 'הרצת שאילתות SQL (קריאה בלבד)' : 'SQL DB Query Console (Read-Only)'}
        </h3>

        {/* Quick Query Shortcuts */}
        <div style={{ marginBottom: '16px' }}>
          <span className="monospace-label" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '8px', opacity: 0.7 }}>
            {t('quickQueries')}:
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => loadQuickQuery('SELECT * FROM sessions ORDER BY created_at DESC LIMIT 50;')}
              className="brutalist-button half-shadow"
              style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: '#FFFFFF' }}
            >
              {t('sessionsTable')} (Latest 50)
            </button>
            <button
              onClick={() => loadQuickQuery('SELECT * FROM actions ORDER BY timestamp DESC LIMIT 100;')}
              className="brutalist-button half-shadow"
              style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: '#FFFFFF' }}
            >
              {t('actionsTable')} (Latest 100)
            </button>
            <button
              onClick={() => loadQuickQuery('SELECT top_party, COUNT(*) as count, AVG(top_score) as avg_score FROM sessions WHERE top_party IS NOT NULL GROUP BY top_party ORDER BY count DESC;')}
              className="brutalist-button half-shadow"
              style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: '#FFFFFF' }}
            >
              {t('topMatchesSummary')}
            </button>
            <button
              onClick={() => loadQuickQuery('SELECT action_type, COUNT(*) as count FROM actions GROUP BY action_type ORDER BY count DESC;')}
              className="brutalist-button half-shadow"
              style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: '#FFFFFF' }}
            >
              {t('actionDistributionSummary')}
            </button>
          </div>
        </div>

        {/* Custom SQL Input */}
        <form onSubmit={handleQuerySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <textarea
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            placeholder={t('sqlQueryPlaceholder')}
            className="monospace-label"
            style={{
              width: '100%',
              height: '100px',
              padding: '12px',
              fontSize: '0.9rem',
              border: '3px solid var(--border-color, #121212)',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              resize: 'vertical',
              backgroundColor: '#FAF9F6',
              direction: 'ltr',
              textAlign: 'left'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="monospace-label" style={{ fontSize: '0.75rem', color: '#777777' }}>
              * SQLite schema tables: `sessions`, `actions`. Modifying keywords are rejected.
            </span>
            <button
              type="submit"
              className="brutalist-button primary"
              style={{ padding: '10px 24px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              disabled={queryLoading}
            >
              {queryLoading ? '...' : t('runQuery')}
            </button>
          </div>
        </form>

        {/* Query Error Panel */}
        {queryError && (
          <div 
            style={{ 
              color: 'var(--accent-coral, #FF5252)', 
              fontWeight: 700, 
              fontSize: '0.9rem',
              border: '3px solid var(--accent-coral, #FF5252)',
              padding: '12px',
              backgroundColor: 'rgba(255, 82, 82, 0.05)',
              marginTop: '20px',
              fontFamily: 'var(--font-mono)'
            }}
          >
            ✕ {t('errorOccurred')}: {queryError}
          </div>
        )}

        {/* Query Results Display */}
        {queryResults && (
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="monospace-label" style={{ fontSize: '0.8rem', fontWeight: 800 }}>
                {language === 'he' ? `נמצאו ${queryResults.length} שורות` : `${queryResults.length} rows returned`}
              </span>
            </div>

            {queryResults.length === 0 ? (
              <div 
                className="monospace-label" 
                style={{ 
                  padding: '24px', 
                  border: '2px dashed var(--border-color, #121212)', 
                  textAlign: 'center',
                  backgroundColor: '#FAF9F6',
                  color: '#666666'
                }}
              >
                {t('noResults')}
              </div>
            ) : (
              <div style={{ overflowX: 'auto', border: '3px solid #121212', maxHeight: '400px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', direction: 'ltr', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--accent-cyan, #00E5FF)', borderBottom: '3px solid #121212' }}>
                      {Object.keys(queryResults[0]).map((key) => (
                        <th 
                          key={key} 
                          className="monospace-label" 
                          style={{ padding: '10px 12px', fontWeight: 800, borderRight: '2px solid #121212', whiteSpace: 'nowrap' }}
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResults.map((row, idx) => (
                      <tr 
                        key={idx} 
                        style={{ 
                          borderBottom: '2px solid #121212', 
                          backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAF9F6' 
                        }}
                      >
                        {Object.entries(row).map(([key, val]) => (
                          <td 
                            key={key} 
                            style={{ 
                              padding: '8px 12px', 
                              borderRight: '2px solid #121212', 
                              fontFamily: 'var(--font-mono)', 
                              wordBreak: 'break-all',
                              maxWidth: '300px'
                            }}
                          >
                            {val === null ? <em style={{ opacity: 0.5 }}>NULL</em> : typeof val === 'object' ? JSON.stringify(val) : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
