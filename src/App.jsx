import { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import LanguageSwitcher from './components/LanguageSwitcher';
import QuizCardStack from './components/QuizCardStack';
import ResultsPanel from './components/ResultsPanel';
import PartyDatabase from './components/PartyDatabase';
import AdminDashboard from './components/AdminDashboard';
import AccessibilityWidget from './components/AccessibilityWidget';
import questionsData from './data/questions.json';
import partiesData from './data/parties.json';
import partyStances from './data/party-stances.json';
import { trackAction, startNewSession, submitSessionResults } from './utils/tracker';

function AppContent() {
  const { t, language } = useLanguage();
  const [screen, setScreen] = useState(() => {
    const savedScreen = localStorage.getItem('quiz_screen');
    const hash = window.location.hash.replace('#', '');
    if (['welcome', 'quiz', 'results', 'database', 'admin'].includes(hash)) return hash;
    return savedScreen || 'welcome';
  }); 
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    const saved = localStorage.getItem('quiz_currentQuestionIndex');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem('quiz_answers');
    return saved ? JSON.parse(saved) : {};
  }); 
  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem('quiz_scores');
    return saved ? JSON.parse(saved) : [];
  });

  const changeScreen = (newScreen) => {
    setScreen(newScreen);
    window.history.pushState(null, '', `#${newScreen}`);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['welcome', 'quiz', 'results', 'database', 'admin'].includes(hash)) {
        setScreen(hash);
      } else {
        setScreen('welcome');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Set initial hash if not present
    if (!window.location.hash) {
      window.history.replaceState(null, '', `#${screen}`);
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [screen]);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('quiz_screen', screen);
  }, [screen]);

  useEffect(() => {
    localStorage.setItem('quiz_currentQuestionIndex', currentQuestionIndex.toString());
  }, [currentQuestionIndex]);

  useEffect(() => {
    localStorage.setItem('quiz_answers', JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    localStorage.setItem('quiz_scores', JSON.stringify(scores));
  }, [scores]);


  const handleStartQuiz = () => {
    setAnswers({});
    setCurrentQuestionIndex(-1); // -1 signifies Name Selection (Slide Option 2)
    changeScreen('quiz');
  };

  const handleNameSubmit = (displayName) => {
    const newSessionId = startNewSession(displayName);
    trackAction('start_quiz', 'quiz_button', newSessionId, language);
    setCurrentQuestionIndex(0); // Proceed to first question card
  };

  const handleAnswer = (questionId, stanceValue) => {
    const isChange = answers[questionId] !== undefined;
    trackAction(isChange ? 'change_answer' : 'answer_question', questionId, stanceValue, language);

    const updatedAnswers = { ...answers, [questionId]: stanceValue };
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < questionsData.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Calculate scores
      calculateAlignment(updatedAnswers);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      const questionId = questionsData[currentQuestionIndex].id;
      trackAction('navigate_back', questionId, prevIndex, language);
      setCurrentQuestionIndex(prevIndex);
    } else if (currentQuestionIndex === 0) {
      setCurrentQuestionIndex(-1); // Go back to identity setup slide
    } else if (currentQuestionIndex === -1) {
      trackAction('navigate_home', 'quiz_back_button', null, language);
      changeScreen('welcome');
    }
  };

  const calculateAlignment = (finalAnswers) => {
    const calculatedScores = partiesData.map(party => {
      let totalMaxDistance = 0;
      let totalUserDistance = 0;
      let activeQuestionsCount = 0;

      const stances = partyStances[party.id] || {};
      questionsData.forEach(q => {
        const userStance = finalAnswers[q.id];
        // Only evaluate questions where the user did not choose "neutral/skip" (value 0)
        if (userStance !== undefined && userStance !== 0) {
          let dist;
          const maxDist = 4; // distance between +2 and -2 (used as normalized max distance)
          const partyStance = stances[q.id] !== undefined ? stances[q.id] : 0;

          if (q.type === 'multiple_choice') {
            if (userStance === partyStance) {
              dist = 0;
            } else if (partyStance === 0) {
              dist = 2; // neutral distance
            } else {
              dist = 4; // fully opposed
            }
          } else {
            // likert or statement_pair
            dist = Math.abs(userStance - partyStance);
          }
          
          totalMaxDistance += maxDist;
          totalUserDistance += dist;
          activeQuestionsCount++;
        }
      });

      // If user skipped/neutralized all questions, default to 0% alignment
      let percentage = 0;
      if (activeQuestionsCount > 0) {
        percentage = Math.round(((totalMaxDistance - totalUserDistance) / totalMaxDistance) * 100);
      }

      return {
        partyId: party.id,
        score: percentage
      };
    });

    // Sort descending by compatibility score
    calculatedScores.sort((a, b) => b.score - a.score);
    setScores(calculatedScores);
    changeScreen('results');

    // Finalize the quiz attempt session and submit results
    const topMatch = calculatedScores[0];
    if (topMatch) {
      submitSessionResults(topMatch.partyId, topMatch.score, language);
      trackAction('view_results', topMatch.partyId, topMatch.score, language);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <header className="brutalist-header">
        <h1 style={{ cursor: 'pointer' }} onClick={() => { trackAction('navigate_home', 'header_logo', null, language); changeScreen('welcome'); }}>
          {t('appTitle')}
        </h1>
        <div className="header-switcher-container">
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container">
        {screen === 'welcome' && (
          <div className="brutalist-card slide-in-up" style={{ maxWidth: '600px', textAlign: 'center', backgroundColor: 'var(--card-bg-color, #FFFFFF)' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.5px' }}>
              {t('welcomeHeader')}
            </h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '32px', color: 'var(--text-color)' }}>
              {t('appSubtitle')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '320px', margin: '0 auto' }}>
              <button onClick={handleStartQuiz} className="brutalist-button primary" style={{ fontSize: '1.1rem', padding: '14px' }}>
                {t('startQuiz')}
              </button>
              <button onClick={() => { trackAction('explore_parties', 'welcome_database_button', null, language); changeScreen('database'); }} className="brutalist-button" style={{ fontSize: '1.1rem', padding: '14px', backgroundColor: 'var(--card-bg-color, #FFFFFF)' }}>
                {t('exploreParties')}
              </button>
            </div>
          </div>
        )}

        {screen === 'quiz' && (
          <QuizCardStack
            questions={questionsData}
            currentIndex={currentQuestionIndex}
            onAnswer={handleAnswer}
            onBack={handleBack}
            answers={answers}
            onStartQuiz={handleNameSubmit}
          />
        )}

        {screen === 'results' && (
          <ResultsPanel
            scores={scores}
            answers={answers}
            questions={questionsData}
            parties={partiesData}
            partyStances={partyStances}
            onRetake={handleStartQuiz}
            onViewParties={() => { trackAction('explore_parties', 'results_database_button', null, language); changeScreen('database'); }}
          />
        )}

        {screen === 'database' && (
          <PartyDatabase
            parties={partiesData}
            questions={questionsData}
            partyStances={partyStances}
            onBack={() => { trackAction('navigate_home', 'database_back_button', null, language); changeScreen('welcome'); }}
          />
        )}

        {screen === 'admin' && (
          <AdminDashboard
            onClose={() => {
              window.location.hash = '';
              changeScreen('welcome');
            }}
          />
        )}
      </main>
      <AccessibilityWidget />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
