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
    selectPartyCompare: "Compare Stances With:",
    issue: "Issue",
    yourStance: "Your Stance",
    partyStance: "Party Stance",
    compatibility: "Match",
    retakeQuiz: "Retake Quiz",
    backToHome: "Back to Home",
    partyDatabase: "Political Party Profiles",
    leader: "Leader",
    platformStances: "Platform Stances",
    history: "History",
    strengths: "Strengths & Platform",
    challenges: "Challenges & Criticisms",
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
    compareWith: "Compare with:",
    compareStances: "Compare Stances",
    accessibilityTitle: "Accessibility Settings",
    accessibilityButton: "Accessibility Settings Menu",
    highContrast: "High Contrast",
    darkContrast: "Dark Contrast",
    monochrome: "Monochrome Mode",
    fontSize: "Font Size",
    fontSizeSmall: "Small",
    fontSizeMedium: "Medium",
    fontSizeLarge: "Large",
    dyslexiaFont: "Dyslexia-Friendly Font",
    reducedMotion: "Reduced Motion / Animations",
    accessibilityStatement: "Accessibility Statement",
    close: "Close",
    resetSettings: "Reset Settings",
    accStatementTitle: "Accessibility Statement",
    accStatementBody: "We are committed to making this platform accessible to all users, in accordance with the Equal Rights for Persons with Disabilities Law in Israel. We have made every effort to ensure that the site meets level AA criteria of the Web Content Accessibility Guidelines (WCAG 2.1).",
    accCoordinator: "Accessibility Coordinator",
    accCoordinatorName: "David Cohen",
    accCoordinatorEmail: "accessibility@ballotbox2026.org.il",
    accCoordinatorPhone: "+972-3-555-0199",
    accLastUpdated: "Last Updated: May 2026"
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
    selectPartyCompare: "השווה עמדות עם:",
    issue: "נושא",
    yourStance: "העמדה שלך",
    partyStance: "עמדת המפלגה",
    compatibility: "התאמה",
    retakeQuiz: "בצע בוחן מחדש",
    backToHome: "חזרה למסך הבית",
    partyDatabase: "פרופילי המפלגות בישראל",
    leader: "יושב ראש",
    platformStances: "עמדות רשמיות בנושאי מפתח",
    history: "היסטוריה",
    strengths: "חוזקות ומצע מרכזי",
    challenges: "אתגרים וביקורת ציבורית",
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
    compareWith: "השווה עם:",
    compareStances: "השוואת עמדות",
    accessibilityTitle: "הגדרות נגישות",
    accessibilityButton: "תפריט הגדרות נגישות",
    highContrast: "ניגודיות גבוהה",
    darkContrast: "ניגודיות כהה",
    monochrome: "גווני אפור (מונוכרום)",
    fontSize: "גודל גופן",
    fontSizeSmall: "קטן",
    fontSizeMedium: "רגיל",
    fontSizeLarge: "גדול",
    dyslexiaFont: "גופן מותאם לדיסלקציה",
    reducedMotion: "הפחתת אנימציות ותנועה",
    accessibilityStatement: "הצהרת נגישות",
    close: "סגור",
    resetSettings: "איפוס הגדרות",
    accStatementTitle: "הצהרת נגישות",
    accStatementBody: "אנו מחויבים להנגיש את הפלטפורמה לכלל המשתמשים, בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות בישראל. השקענו מאמצים רבים כדי להבטיח שהאתר יעמוד בקריטריונים של רמה AA של ההנחיות לנגישות תכנים באינטרנט (WCAG 2.1).",
    accCoordinator: "רכז נגישות",
    accCoordinatorName: "דוד כהן",
    accCoordinatorEmail: "accessibility@ballotbox2026.org.il",
    accCoordinatorPhone: "03-555-0199",
    accLastUpdated: "עודכן לאחרונה: מאי 2026"
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
