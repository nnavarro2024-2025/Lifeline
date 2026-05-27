// Multi-language crisis keyword dictionary
const CRISIS_KEYWORDS = {
  high: [
    // English
    'suicide', 'kill myself', 'end my life', 'want to die', 'better off dead',
    'no reason to live', 'harm myself', 'cut myself', 'overdose',
    // Tagalog
    'mamatay', 'papatayin', 'magpakamatay', 'pumatay', 'mamamatay',
    // Bisaya
    'patay', 'kinabuhi', 'mamatay',
    // Taglish patterns
    'gusto kong mamatay', 'ayaw ko na', 'pagod na ako sa buhay',
  ],
  moderate: [
    // English
    'depressed', 'hopeless', 'worthless', 'alone', 'scared', 'anxiety',
    'panic', 'hurt', 'pain', 'struggle', 'cant take it', 'give up',
    // Tagalog
    'malungkot', 'takot', 'sakit', 'hirap', 'problema', 'suko na',
    // Bisaya
    'kasubo', 'hadlok', 'sakit', 'lisud',
    // Taglish
    'wala na akong pag-asa', 'ang hirap', 'pagod na',
  ],
  low: [
    // General distress
    'stressed', 'worried', 'confused', 'sad', 'upset', 'frustrated',
    'tired', 'overwhelmed',
    // Tagalog
    'stressed', 'nalilito', 'nakakapagod',
  ],
};

export type RiskLevel = 'high' | 'moderate' | 'low';

export interface AnalysisResult {
  riskLevel: RiskLevel;
  matchedKeywords: string[];
  messageVelocity?: number;
}

export function analyzeMessage(message: string, previousMessageCount = 0): AnalysisResult {
  const lowerMessage = message.toLowerCase();
  const matchedKeywords: string[] = [];

  // Check for high-risk keywords
  for (const keyword of CRISIS_KEYWORDS.high) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword);
    }
  }

  if (matchedKeywords.length > 0) {
    return { riskLevel: 'high', matchedKeywords };
  }

  // Check for moderate-risk keywords
  for (const keyword of CRISIS_KEYWORDS.moderate) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword);
    }
  }

  if (matchedKeywords.length > 0) {
    return { riskLevel: 'moderate', matchedKeywords };
  }

  // Check for low-risk keywords
  for (const keyword of CRISIS_KEYWORDS.low) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword);
    }
  }

  // Check message velocity (rapid messaging can indicate distress)
  if (previousMessageCount > 5) {
    return {
      riskLevel: 'moderate',
      matchedKeywords: ['rapid messaging pattern'],
      messageVelocity: previousMessageCount
    };
  }

  return {
    riskLevel: matchedKeywords.length > 0 ? 'low' : 'low',
    matchedKeywords
  };
}
