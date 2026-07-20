const { getEmergencyInfo } = require('./knowledgeBase');

function getEmergencyData(lang = 'en') {
  const info = getEmergencyInfo(lang);

  return {
    contacts: info.contacts,
    firstAid: info.firstAid,
    nearbyFacilities: {
      note: "Location-based hospital search will be integrated in Phase 4 with Google Maps / OpenStreetMap API",
      sampleData: [
        { name: "District Hospital", type: "Government", distance: "2.5 km" },
        { name: "Primary Health Center", type: "PHC", distance: "1.2 km" }
      ]
    },
    sosWorkflow: {
      steps: [
        "Stay calm and assess the situation",
        "Call 108 (Ambulance) immediately",
        "Provide your location clearly",
        "Describe symptoms or condition",
        "Follow operator instructions",
        "Stay on the line until help arrives"
      ],
      emergencyNumber: "108"
    }
  };
}

function getOfflineFirstAid(lang = 'en') {
  const firstAidData = {
    en: [
      {
        condition: "Choking",
        steps: [
          "Stand behind the person",
          "Make a fist above the navel",
          " thrust inward and upward",
          "Repeat until object is expelled",
          "Call 108 if unsuccessful"
        ]
      },
      {
        condition: "Bleeding",
        steps: [
          "Apply firm pressure with clean cloth",
          "Elevate the injured area above heart level",
          "Do not remove the cloth if soaked — add more",
          "Call 108 if bleeding doesn't stop"
        ]
      },
      {
        condition: "Burns",
        steps: [
          "Cool under running water for 10-20 minutes",
          "Do not apply ice or toothpaste",
          "Cover loosely with clean cloth",
          "Do not pop blisters",
          "Seek help for severe burns"
        ]
      },
      {
        condition: "Fainting",
        steps: [
          "Lay the person flat on their back",
          "Elevate legs 12 inches",
          "Check breathing",
          "Call 108 if not recovered quickly"
        ]
      },
      {
        condition: "Fracture suspected",
        steps: [
          "Do not move the injured area",
          "Splint the area if trained",
          "Apply ice wrapped in cloth",
          "Call 108 for transport"
        ]
      }
    ],
    hi: [
      {
        condition: "गले में फंसना",
        steps: [
          "व्यक्ति के पीछे खड़े हों",
          "नाभि के ऊपर मुट्ठी रखें",
          "अंदर और ऊपर धक्का दें",
          "वस्तु बाहर निकलने तक दोहराएं",
          "108 कॉल करें"
        ]
      },
      {
        condition: "खून बहना",
        steps: [
          "साफ कपड़े से दबाव डालें",
          "घायल क्षेत्र को दिल से ऊपर उठाएं",
          "भीगा कपड़ा न हटाएं — और जोड़ें",
          "खून बंद न हो तो 108 कॉल करें"
        ]
      },
      {
        condition: "जलना",
        steps: [
          "10-20 मिनट चलते पानी के नीचे ठंडा करें",
          "बर्फ या टूथपेस्ट न लगाएं",
          "साफ कपड़े से ढकें",
          "फफोले न फोड़ें"
        ]
      }
    ]
  };

  return firstAidData[lang] || firstAidData.en;
}

module.exports = { getEmergencyData, getOfflineFirstAid };
