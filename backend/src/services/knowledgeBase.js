const knowledgeBase = {
  commonSymptoms: {
    headache: {
      en: {
        title: "Headache",
        causes: ["Stress or tension", "Dehydration", "Eye strain", "Migraine", "Sleep deprivation"],
        homeRemedies: [
          "Rest in a quiet, dark room",
          "Apply cold compress to forehead",
          "Stay hydrated — drink water",
          "Gently massage temples",
          "Over-the-counter pain relief if safe for you"
        ],
        whenToSeekHelp: "Seek immediate help if headache is sudden and severe, accompanied by fever, stiff neck, vision changes, confusion, or follows head injury.",
        urgency: "low"
      },
      hi: {
        title: "सिरदर्द",
        causes: ["तनाव", "पानी की कमी", "आंखों पर ज़ोर", "माइग्रेन", "नींद की कमी"],
        homeRemedies: [
          "शांत, अंधेरे कमरे में आराम करें",
          "माथे पर ठंडा सेक लगाएं",
          "पानी पिएं",
          "मंदिरों की मालिश करें"
        ],
        whenToSeekHelp: "तुरंत मदद लें यदि सिरदर्द अचानक और तेज़ है, बुखार, गर्दन में अकड़न, दृष्टि में बदलाव, या भ्रम के साथ हो।",
        urgency: "low"
      }
    },
    fever: {
      en: {
        title: "Fever",
        causes: ["Viral infection", "Bacterial infection", "Heat exhaustion", "Inflammation"],
        homeRemedies: [
          "Rest and stay hydrated",
          "Take paracetamol if appropriate",
          "Use light clothing and blankets",
          "Tepid sponging for high fever",
          "Monitor temperature regularly"
        ],
        whenToSeekHelp: "Seek help if fever exceeds 103°F (39.4°C), lasts more than 3 days, or is accompanied by severe headache, rash, stiff neck, difficulty breathing, or persistent vomiting.",
        urgency: "medium"
      },
      hi: {
        title: "बुखार",
        causes: ["वायरल संक्रमण", "बैक्टीरियल संक्रमण", "लू लगना", "सूजन"],
        homeRemedies: [
          "आराम करें और पानी पिएं",
          "पैरासिटामोल लें यदि उचित हो",
          "हल्के कपड़े पहनें",
          "नियमित रूप से तापमान जांचें"
        ],
        whenToSeekHelp: "मदद लें यदि बुखार 103°F से अधिक है, 3 दिनों से अधिक समय तक है, या गंभीर सिरदर्द, चकत्ते, गर्दन में अकड़न के साथ हो।",
        urgency: "medium"
      }
    },
    cough: {
      en: {
        title: "Cough",
        causes: ["Common cold", "Allergies", "Asthma", "Acid reflux", "Post-nasal drip"],
        homeRemedies: [
          "Drink warm fluids (honey lemon water, warm milk)",
          "Use honey (not for children under 1 year)",
          "Steam inhalation",
          "Stay hydrated",
          "Avoid smoke and dust"
        ],
        whenToSeekHelp: "Seek help if cough lasts more than 3 weeks, produces blood, causes difficulty breathing, or is accompanied by high fever.",
        urgency: "low"
      },
      hi: {
        title: "खांसी",
        causes: ["सर्दी-जुकाम", "एलर्जी", "दमा", "एसिड रिफ्लक्स"],
        homeRemedies: [
          "गर्म पेय पिएं (शहद नींबू पानी)",
          "शहद लें (1 साल से कम उम्र के बच्चों को नहीं)",
          "भाप लें",
          "पर्याप्त पानी पिएं"
        ],
        whenToSeekHelp: "मदद लें यदि खांसी 3 हफ्ते से अधिक है, खून आ रहा है, या सांस लेने में तकलीफ हो रही है।",
        urgency: "low"
      }
    },
    stomachPain: {
      en: {
        title: "Stomach Pain",
        causes: ["Indigestion", "Food poisoning", "Gastritis", "Constipation", "Menstrual cramps"],
        homeRemedies: [
          "Apply warm compress to abdomen",
          "Drink warm water or ginger tea",
          "Eat bland foods (rice, bananas)",
          "Avoid spicy or fatty foods",
          "Rest in comfortable position"
        ],
        whenToSeekHelp: "Seek immediate help if pain is severe and sudden, accompanied by bloody stool, persistent vomiting, high fever, or abdominal rigidity.",
        urgency: "medium"
      },
      hi: {
        title: "पेट दर्द",
        causes: ["अपच", "खाने का ज़हर", "गैस्ट्राइटिस", "कब्ज़", "मासिक धर्म में दर्द"],
        homeRemedies: [
          "पेट पर गर्म सेक लगाएं",
          "गर्म पानी या अदरक की चाय पिएं",
          "हल्का भोजन करें (चावल, केला)",
          "मसालेदार भोजन से बचें"
        ],
        whenToSeekHelp: "तुरंत मदद लें यदि दर्द बहुत तेज़ है, खूनी दस्त, उल्टी, या बुखार के साथ हो।",
        urgency: "medium"
      }
    },
    bodyPain: {
      en: {
        title: "Body Pain / Muscle Ache",
        causes: ["Physical overexertion", "Viral infection", "Stress", "Dehydration", "Poor posture"],
        homeRemedies: [
          "Rest the affected area",
          "Apply warm compress or ice pack",
          "Gentle stretching exercises",
          "Stay hydrated",
          "Over-the-counter pain relief if safe"
        ],
        whenToSeekHelp: "Seek help if pain is severe, lasts more than a week, is accompanied by swelling, redness, or joint stiffness.",
        urgency: "low"
      },
      hi: {
        title: "शरीर दर्द",
        causes: ["अधिक शारीरिक श्रम", "वायरल संक्रमण", "तनाव", "पानी की कमी"],
        homeRemedies: [
          "प्रभावित क्षेत्र को आराम दें",
          "गर्म या ठंडा सेक लगाएं",
          "हल्की स्ट्रेचिंग करें",
          "पर्याप्त पानी पिएं"
        ],
        whenToSeekHelp: "मदद लें यदि दर्द गंभीर है, 1 हफ्ते से अधिक है, या सूजन के साथ हो।",
        urgency: "low"
      }
    }
  },

  emergencyContacts: {
    india: {
      ambulance: "108",
      police: "100",
      fire: "101",
      disaster: "112",
      healthHelpline: "104",
      womenHelpline: "1091",
      childHelpline: "1098"
    }
  },

  emergencySymptoms: [
    "chest pain",
    "difficulty breathing",
    "sudden severe headache",
    "loss of consciousness",
    "severe bleeding",
    "stroke symptoms",
    "anaphylaxis",
    "seizure",
    "high fever with rash",
    "poisoning",
    "choking",
    "severe allergic reaction"
  ],

  firstAid: {
    choking: {
      en: "For choking adult: Stand behind the person, place fist above navel, thrust inward and upward. Call emergency services immediately.",
      hi: "गले में फंसने पर: व्यक्ति के पीछे खड़े हों, नाभि के ऊपर मुक्का रखें, अंदर और ऊपर धक्का दें। तुरंत आपातकालीन सेवाओं को कॉल करें।"
    },
    burns: {
      en: "For minor burns: Cool under running water for 10-20 minutes. Do not apply ice. Cover with clean cloth. Do not pop blisters.",
      hi: "मामूली जलन पर: 10-20 मिनट तक चलते पानी के नीचे ठंडा करें। बर्फ न लगाएं। साफ कपड़े से ढकें।"
    },
    bleeding: {
      en: "Apply firm pressure with clean cloth. Elevate the injured area. Call emergency services if bleeding doesn't stop.",
      hi: "साफ कपड़े से दबाव डालें। घायल क्षेत्र को ऊपर उठाएं। यदि खून बंद न हो तो आपातकालीन सेवाओं को कॉल करें।"
    }
  }
};

function searchKnowledge(symptomText) {
  const text = symptomText.toLowerCase();
  const matches = [];

  for (const [key, data] of Object.entries(knowledgeBase.commonSymptoms)) {
    if (text.includes(key) || text.includes(key.replace(' ', ''))) {
      matches.push({ key, ...data });
    }
  }

  const keywords = {
    head: 'headache', migraine: 'headache', forehead: 'headache',
    fever: 'fever', temperature: 'fever', hot: 'fever', warm: 'fever',
    cough: 'cough', cold: 'cough', sneeze: 'cough',
    stomach: 'stomachPain', belly: 'stomachPain', abdominal: 'stomachPain',
    body: 'bodyPain', muscle: 'bodyPain', ache: 'bodyPain', joint: 'bodyPain'
  };

  for (const [keyword, symptomKey] of Object.entries(keywords)) {
    if (text.includes(keyword) && !matches.find(m => m.key === symptomKey)) {
      const data = knowledgeBase.commonSymptoms[symptomKey];
      if (data) matches.push({ key: symptomKey, ...data });
    }
  }

  return matches;
}

function getEmergencyInfo(lang = 'en') {
  return {
    contacts: knowledgeBase.emergencyContacts.india,
    firstAid: knowledgeBase.firstAid,
    symptoms: knowledgeBase.emergencySymptoms,
    lang
  };
}

module.exports = { knowledgeBase, searchKnowledge, getEmergencyInfo };
