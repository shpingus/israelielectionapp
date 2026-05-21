import { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import LanguageSwitcher from './components/LanguageSwitcher';
import QuizCardStack from './components/QuizCardStack';
import ResultsPanel from './components/ResultsPanel';
import PartyDatabase from './components/PartyDatabase';
import AccessibilityWidget from './components/AccessibilityWidget';
import questionsData from './data/questions.json';
import partiesData from './data/parties.json';

function AppContent() {
  const { t } = useLanguage();
  const [screen, setScreen] = useState('welcome'); // 'welcome', 'quiz', 'results', 'database'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: stanceValue }
  const [scores, setScores] = useState([]); // Array of sorted { partyId, score }

  const handleStartQuiz = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setScreen('quiz');
  };

  const handleAnswer = (questionId, stanceValue) => {
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
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateAlignment = (finalAnswers) => {
    const calculatedScores = partiesData.map(party => {
      let totalMaxDistance = 0;
      let totalUserDistance = 0;
      let activeQuestionsCount = 0;

      questionsData.forEach(q => {
        const userStance = finalAnswers[q.id];
        // Only evaluate questions where the user did not choose "neutral/skip" (value 0)
        if (userStance !== undefined && userStance !== 0) {
          const partyStance = party.stances[q.id] !== undefined ? party.stances[q.id] : 0;
          const maxDist = 4; // distance between +2 and -2
          const dist = Math.abs(userStance - partyStance);
          
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
    setScreen('results');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <header className="brutalist-header">
        <h1 style={{ cursor: 'pointer' }} onClick={() => setScreen('welcome')}>
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
              {t('appTitle')}
            </h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '32px', color: 'var(--text-color)' }}>
              {t('appSubtitle')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '320px', margin: '0 auto' }}>
              <button onClick={handleStartQuiz} className="brutalist-button primary" style={{ fontSize: '1.1rem', padding: '14px' }}>
                {t('startQuiz')}
              </button>
              <button onClick={() => setScreen('database')} className="brutalist-button" style={{ fontSize: '1.1rem', padding: '14px', backgroundColor: 'var(--card-bg-color, #FFFFFF)' }}>
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
          />
        )}

        {screen === 'results' && (
          <ResultsPanel
            scores={scores}
            answers={answers}
            questions={questionsData}
            parties={partiesData}
            onRetake={handleStartQuiz}
            onViewParties={() => setScreen('database')}
          />
        )}

        {screen === 'database' && (
          <PartyDatabase
            parties={partiesData}
            questions={questionsData}
            onBack={() => setScreen('welcome')}
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
