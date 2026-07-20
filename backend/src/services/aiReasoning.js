const OpenAI = require('openai');
const { searchKnowledge, getEmergencyInfo } = require('./knowledgeBase');
const { calculateSafetyScore, buildSafetyDisclaimer, buildResponseTemplate } = require('./safetyEngine');

let groq = null;
if (process.env.GROQ_API_KEY) {
  groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });
} else {
  console.warn('GROQ_API_KEY not set — AI reasoning will use knowledge base fallback only');
}

function buildSymptomPrompt(inputText, userProfile, lang, safety) {
  const profileContext = userProfile.name
    ? `\nPatient Profile:\n- Age: ${userProfile.age || 'unknown'}\n- Gender: ${userProfile.gender || 'unknown'}\n- Blood Group: ${userProfile.blood_group || 'unknown'}\n- Known Conditions: ${Array.isArray(userProfile.conditions) ? userProfile.conditions.join(', ') : 'None known'}\n- Known Allergies: ${Array.isArray(userProfile.allergies) ? userProfile.allergies.join(', ') : 'None known'}`
    : '';

  const langInstruction = lang === 'hi'
    ? 'Respond entirely in Hindi (Devanagari script). Use simple, easy-to-understand language.'
    : 'Respond in English. Use simple, easy-to-understand language.';

  return `You are an AI health assistant for Indian families called "AI Arogya Sathi". You provide helpful, accurate, and safe health guidance.

IMPORTANT SAFETY RULES:
- You are NOT a doctor. Always make this clear.
- Never provide specific medication dosages or prescriptions.
- For serious or emergency symptoms, always advise seeing a doctor immediately.
- Never dismiss symptoms that could be serious.
- Always include a disclaimer that this is general information only.

${langInstruction}

A user has described their symptoms. Analyze them and provide a comprehensive response.

User's symptom description: "${inputText}"
${profileContext}

Safety pre-analysis severity: ${safety.severity} (score: ${safety.score})

Structure your response EXACTLY as follows using clear formatting with line breaks and bullet points:

## Symptom Analysis
Briefly describe what the symptoms might indicate (2-3 sentences). Be clear this is not a diagnosis.

## Possible Causes
- List 3-5 possible causes as bullet points
- Include both common and less common possibilities

## Indian Household Natural Remedies
- List 3-5 traditional Indian home remedies (dadi/nani ke nuskhe) that may help
- Include remedies using common Indian household ingredients like turmeric (haldi), tulsi, ginger (adrak), honey (shahad), ajwain, jeera, etc.
- Mention how to prepare/use each remedy briefly
- These should be safe, time-tested remedies that do NOT replace medical treatment

## Modern/General Remedies
- List 2-3 general over-the-counter or lifestyle remedies
- Include rest, hydration, OTC medication suggestions where appropriate

## When to See a Doctor
- Clearly state when professional medical help should be sought
- Be specific about warning signs

## Emergency Warning
If symptoms are potentially serious, add this section with URGENT advice.

Remember: Always err on the side of caution. If unsure, recommend seeing a doctor.`;
}

async function processSymptomQuery(inputText, userProfile = {}, language = 'en') {
  const lang = language || userProfile.language_preference || 'en';
  const safety = calculateSafetyScore(inputText, userProfile);
  const template = buildResponseTemplate(lang);

  if (safety.shouldEscalate) {
    const emergency = getEmergencyInfo(lang);
    return {
      response_content: `${template.emergency}\n\n${template.callEmergency}\n\n${template.disclaimer}`,
      safety_score: safety.score,
      escalation_flag: true,
      source: 'emergency_protocol',
      severity: safety.severity,
      flags: safety.flags,
      emergency_contacts: emergency.contacts
    };
  }

  if (!groq) {
    const matches = searchKnowledge(inputText);
    if (matches.length === 0) {
      return {
        response_content: `${template.greeting}\n\nI couldn't find specific information about your symptoms. The AI service is temporarily unavailable.\n\nPlease describe your symptoms in more detail, or consult a healthcare professional.\n\n${template.disclaimer}`,
        safety_score: safety.score,
        escalation_flag: false,
        source: 'knowledge_base_fallback',
        severity: safety.severity,
        flags: safety.flags
      };
    }
    const primary = matches[0];
    const langData = primary[lang] || primary.en;
    let response = `${template.greeting}\n\n`;
    response += `**${langData.title}**\n\n`;
    response += `**Causes:**\n`;
    langData.causes.forEach(cause => { response += `- ${cause}\n`; });
    response += `\n**Home Remedies:**\n`;
    langData.homeRemedies.forEach(remedy => { response += `- ${remedy}\n`; });
    response += `\n**When to Seek Medical Help:**\n`;
    response += `${langData.whenToSeekHelp}\n\n`;
    response += buildSafetyDisclaimer(safety.severity);
    return {
      response_content: response,
      safety_score: safety.score,
      escalation_flag: false,
      source: 'knowledge_base_fallback',
      severity: safety.severity,
      flags: safety.flags
    };
  }

  try {
    const prompt = buildSymptomPrompt(inputText, userProfile, lang, safety);

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const llmResponse = completion.choices[0].message.content;
    const disclaimer = buildSafetyDisclaimer(safety.severity);

    return {
      response_content: `${llmResponse}\n\n---\n\n${disclaimer}`,
      safety_score: safety.score,
      escalation_flag: false,
      source: 'groq_llama3',
      severity: safety.severity,
      flags: safety.flags
    };
  } catch (err) {
    console.error('Groq API error, falling back to knowledge base:', err.message);

    const matches = searchKnowledge(inputText);

    if (matches.length === 0) {
      return {
        response_content: `${template.greeting}\n\nI couldn't find specific information about your symptoms. The AI service is temporarily unavailable.\n\nPlease describe your symptoms in more detail, or consult a healthcare professional.\n\n${template.disclaimer}`,
        safety_score: safety.score,
        escalation_flag: false,
        source: 'knowledge_base_fallback',
        severity: safety.severity,
        flags: safety.flags
      };
    }

    const primary = matches[0];
    const langData = primary[lang] || primary.en;

    let response = `${template.greeting}\n\n`;
    response += `**${langData.title}**\n\n`;
    response += `**Causes:**\n`;
    langData.causes.forEach(cause => { response += `- ${cause}\n`; });
    response += `\n**Home Remedies:**\n`;
    langData.homeRemedies.forEach(remedy => { response += `- ${remedy}\n`; });
    response += `\n**When to Seek Medical Help:**\n`;
    response += `${langData.whenToSeekHelp}\n\n`;
    response += buildSafetyDisclaimer(safety.severity);

    return {
      response_content: response,
      safety_score: safety.score,
      escalation_flag: false,
      source: 'knowledge_base_fallback',
      severity: safety.severity,
      flags: safety.flags
    };
  }
}

module.exports = { processSymptomQuery };
