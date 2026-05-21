/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    appTitle: "Elections 2026: Stance Alignment",
    appSubtitle: "Find out which party matches your stances on major national issues.",
    startQuiz: "Start Stance Quiz",
    exploreParties: "Explore Parties",
    questionProgress: "QUESTION {current} OF {total}",
    stronglyAgree: "Strongly Agree",
    agree: "Agree",
    disagree: "Disagree",
    stronglyDisagree: "Strongly Disagree",
    back: "Back",
    calculateResults: "Calculate Results",
    yourBestMatch: "YOUR BEST MATCH",
    stanceAlignment: "Stance-Alignment",
    detailedBreakdown: "Detailed Stance Comparison",
    issue: "Issue",
    yourStance: "Your Stance",
    partyStance: "Party Stance",
    compatibility: "Match",
    retakeQuiz: "Retake Quiz",
    backToHome: "Back to Home",
    partyDatabase: "Political Party Profiles",
    leader: "Leader",
    platformStances: "Platform Stances",
    noOpinion: "No Opinion / Neutral",
    neutralStance: "Neutral Stance",
    viewPlatform: "View Platform Stances",
    highlyAligned: "Highly Aligned",
    partialMatch: "Partial Match",
    opposedStance: "Opposed Stance",
    security: "Security & Draft",
    religion_state: "Religion & State",
    judicial: "Judicial System",
    economy: "Economy & Welfare",
    selectStatement: "Which statement aligns more with your views?",
    statementA: "Statement A",
    statementB: "Statement B",
    history: "History",
    pros: "Key Platforms & Strengths",
    challenges: "Criticisms & Challenges",
    compareWith: "Compare with:",
    compareStances: "Compare Stances"
  },
  he: {
    appTitle: "בחירות 2026: מפתח עמדות",
    appSubtitle: "גלה איזו מפלגה מתאימה ביותר לעמדות שלך בנושאי מפתח לאומיים.",
    startQuiz: "התחל בבוחן העמדות",
    exploreParties: "מאגר המפלגות",
    questionProgress: "שאלה {current} מתוך {total}",
    stronglyAgree: "מסכים מאוד",
    agree: "מסכים",
    disagree: "לא מסכים",
    stronglyDisagree: "מתנגד בתוקף",
    back: "חזור",
    calculateResults: "חשב תוצאות",
    yourBestMatch: "ההתאמה הטובה ביותר עבורך",
    stanceAlignment: "התאמה רעיונית",
    detailedBreakdown: "השוואת עמדות מפורטת",
    issue: "נושא",
    yourStance: "העמדה שלך",
    partyStance: "עמדת המפלגה",
    compatibility: "התאמה",
    retakeQuiz: "בצע בוחן מחדש",
    backToHome: "חזרה למסך הבית",
    partyDatabase: "פרופילי המפלגות בישראל",
    leader: "יושב ראש",
    platformStances: "עמדות רשמיות בנושאי מפתח",
    noOpinion: "ללא דעה / נייטרלי",
    neutralStance: "עמדה נייטרלית",
    viewPlatform: "הצג עמדות מפלגה",
    highlyAligned: "התאמה מלאה",
    partialMatch: "התאמה חלקית",
    opposedStance: "ניגוד עמדות",
    security: "ביטחון וגיוס",
    religion_state: "דת ומדינה",
    judicial: "מערכת המשפט",
    economy: "כלכלה וחברה",
    selectStatement: "איזו קביעה מתאימה יותר לעמדותיך?",
    statementA: "קביעה א'",
    statementB: "קביעה ב'",
    history: "רקע היסטורי",
    pros: "עמדות מפתח ונקודות חוזק",
    challenges: "אתגרים וביקורת ציבורית",
    compareWith: "השווה עם:",
    compareStances: "השוואת עמדות"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('israeli_elections_lang');
    return saved || 'he'; // Default to Hebrew
  });

  const dir = language === 'he' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('israeli_elections_lang', language);
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'he' ? 'en' : 'he'));
  };

  const t = (key, params = {}) => {
    let text = translations[language][key] || translations['en'][key] || key;
    Object.keys(params).forEach((param) => {
      text = text.replace(`{${param}}`, params[param]);
    });
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, dir, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
