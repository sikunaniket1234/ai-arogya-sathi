const ESCALATION_KEYWORDS = [
  'chest pain', 'heart attack', 'stroke', 'cannot breathe', 'difficulty breathing',
  'choking', 'severe bleeding', 'unconscious', 'seizure', 'fits', 'anaphylaxis',
  'poisoning', 'overdose', 'suicide', 'self harm', 'severe allergic',
  'high fever', '104', '105', 'blood', 'vomit blood', 'cough blood',
  'severe headache', 'worst headache', 'sudden headache',
  'stiff neck', 'rash with fever', 'paralysis', 'numbness',
  'severe burn', 'electrical', 'drowning', 'accident'
];

const HIGH_RISK_CONDITIONS = [
  'pregnant', 'pregnancy', 'diabetes', 'heart disease', 'kidney disease',
  'liver disease', 'immunocompromised', 'cancer', 'hiv', 'blood disorder'
];

const AGE_RISK_GROUPS = ['infant', 'baby', 'newborn', 'elderly', 'old age', 'child'];

function calculateSafetyScore(text, userProfile = {}) {
  const lowerText = text.toLowerCase();
  let score = 1.0;
  let flags = [];

  for (const keyword of ESCALATION_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      score -= 0.3;
      flags.push(`emergency_keyword:${keyword}`);
    }
  }

  for (const condition of HIGH_RISK_CONDITIONS) {
    if (lowerText.includes(condition) || userProfile.conditions?.includes(condition)) {
      score -= 0.15;
      flags.push(`high_risk_condition:${condition}`);
    }
  }

  for (const group of AGE_RISK_GROUPS) {
    if (lowerText.includes(group)) {
      score -= 0.1;
      flags.push(`age_risk:${group}`);
    }
  }

  score = Math.max(0, Math.min(1, score));

  return {
    score: Math.round(score * 100) / 100,
    shouldEscalate: score < 0.6,
    flags,
    severity: score < 0.4 ? 'critical' : score < 0.6 ? 'high' : score < 0.8 ? 'medium' : 'low'
  };
}

function buildSafetyDisclaimer(severity) {
  const disclaimers = {
    low: "This is general wellness information only. It is not a substitute for professional medical advice. Please consult a healthcare provider for proper diagnosis and treatment.",
    medium: "This information is for general guidance only. Given your symptoms, consulting a healthcare professional is recommended.",
    high: "Based on your symptoms, we strongly recommend consulting a healthcare professional as soon as possible. This is not a medical diagnosis.",
    critical: "IMPORTANT: Your symptoms may indicate a serious condition. Please seek immediate medical attention or call emergency services (108 in India). Do not delay seeking professional help."
  };
  return disclaimers[severity] || disclaimers.medium;
}

function buildResponseTemplate(lang = 'en') {
  const templates = {
    en: {
      greeting: "Based on your symptoms, here is some general health information:",
      disclaimer: "⚕️ Important: This is not medical diagnosis. Always consult a doctor.",
      nextSteps: "Recommended next steps:",
      emergency: "🚨 EMERGENCY: Please seek immediate medical attention.",
      callEmergency: "Call emergency services: 108 (Ambulance)"
    },
    hi: {
      greeting: "आपके लक्षणों के आधार पर, यहां सामान्य स्वास्थ्य जानकारी है:",
      disclaimer: "⚕️ महत्वपूर्ण: यह चिकित्सा निदान नहीं है। हमेशा डॉक्टर से सलाह लें।",
      nextSteps: "अनुशंसित अगले कदम:",
      emergency: "🚨 आपातकाल: कृपया तुरंत चिकित्सा सहायता प्राप्त करें।",
      callEmergency: "आपातकालीन सेवाओं को कॉल करें: 108"
    }
  };
  return templates[lang] || templates.en;
}

module.exports = { calculateSafetyScore, buildSafetyDisclaimer, buildResponseTemplate };
