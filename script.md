# AI Arogya Sathi - Exhibition Script

---

## PART 1: Introduction (30 seconds)

"Good morning/afternoon. We are [Team Name], and this is **AI Arogya Sathi** - which means **AI Health Companion**.

In India, many families - especially in villages - struggle with basic healthcare. They don't have a doctor nearby, they don't understand English medical information, and they often don't even know which government health schemes they can use.

We built AI Arogya Sathi to solve this. It is a **free, multilingual, AI-powered health companion** that works **even without internet** and is designed specifically for Indian households."

---

## PART 2: The Problem We Solve (45 seconds)

"Let me explain the problems we are solving:

**Problem 1 - No doctor nearby:** In rural India, the nearest doctor can be hours away. People end up ignoring symptoms or trusting unreliable sources on WhatsApp.

**Problem 2 - Language barrier:** Most health apps are in English. Our parents and grandparents cannot use them.

**Problem 3 - Medicine forgetfulness:** Elderly family members often forget to take their medicines on time. There is no one at home to remind them.

**Problem 4 - No health records:** Families have no single place to track everyone's health - blood pressure, sugar levels, medicines, allergies.

**Problem 5 - Government schemes go unused:** There are many government health programs like Ayushman Bharat, but most families don't know they exist or how to apply.

AI Arogya Sathi solves all of these problems in one app."

---

## PART 3: Key Features - Walk Through (2 minutes)

"Let me walk you through our key features:"

### Feature 1: AI Symptom Checker
"You can type or speak your symptoms - in English or Hindi - and our AI gives you a proper analysis in simple language. It tells you what might be wrong, what home remedies you can try using things from your kitchen - like turmeric, tulsi, ginger - and most importantly, **when you should see a doctor**. If it detects an emergency like chest pain or difficulty breathing, it immediately tells you to call 108 and shows emergency steps."

*Demo: Open the app, type "I have a headache and mild fever" in Hindi or English, and show the structured response.*

### Feature 2: Family Profiles
"You can create profiles for every family member - your parents, grandparents, children. Each profile stores their blood group, health conditions, allergies, and emergency contacts. This means the AI gives advice that is personalised - for example, it will give different advice for a 70-year-old diabetic patient versus a 22-year-old college student."

*Demo: Show the profiles page, open Savitri Devi's profile (has BP and diabetes), show her QR medical card.*

### Feature 3: Wearable Integration
"The app connects to smartwatches and fitness bands through Google Fit. So if your father wears a Noise watch or your sister has a Fitbit, their heart rate, steps, and sleep data automatically sync into the app. The health dashboard then shows trends and even detects if something is wrong - like if heart rate is too high and sleep is too low, it warns about possible health risks."

*Demo: Go to Devices page, show Google Fit connection option, show the health dashboard with vitals and health score.*

### Feature 4: Medicine Reminders
"You can add medicines for any family member with dosage and schedule times. The app automatically reminds them when it's time to take medicine. It also tracks adherence - so you can see if your parents are actually taking their medicines regularly."

*Demo: Go to Reminders page, show active medicines, mark one dose as taken.*

### Feature 5: Emergency Mode
"This works **completely offline** - no internet needed. It shows step-by-step first aid guides for situations like choking, bleeding, burns, and fainting. It also has all emergency numbers - 108 for ambulance, 104 for health helpline, 1091 for women helpline - in one place. This can save lives in critical moments."

*Demo: Go to Emergency page, show the SOS workflow, show a first-aid guide in Hindi.*

### Feature 6: Community Health
"We have a section that shows government health schemes, nearby blood banks, vaccination camps, and disease outbreak alerts. There's even an eligibility checker - you enter your age, state, and condition, and it tells you which government schemes you qualify for."

*Demo: Go to Community page, show the schemes list, use the eligibility checker.*

---

## PART 4: What Makes Us Different (30 seconds)

"Here's what makes AI Arogya Sathi special compared to other health apps:

1. **Made for India** - Supports Hindi, uses Indian emergency numbers, includes Indian household remedies, validates Indian phone numbers and states
2. **Works offline** - Emergency guides and first-aid work without internet
3. **For the whole family** - Not just one person, you manage health for your entire family
4. **Connects your wearable** - Your smartwatch data actually means something now
5. **Completely free** - Built on free tools, costs nothing to use
6. **Safe by design** - The AI clearly says 'see a doctor' when needed, it never pretends to replace a real doctor"

---

## PART 5: Technology - Simple Explanation (30 seconds)

"In simple terms:
- We use **AI (Groq's LLaMA model)** to understand symptoms and give health advice
- The app is built with **Angular** on the front and **Node.js** on the back
- Data is stored safely in **PostgreSQL** database
- It runs on **Render** (cloud hosting) with **Supabase** for the database
- We use **Google Fit API** to connect with wearable devices
- The whole thing is designed to work even on slow internet connections"

---

## PART 6: Who Benefits (20 seconds)

"AI Arogya Sathi is for:
- **Rural families** who don't have easy access to doctors
- **Elderly people** who need medicine reminders and emergency guides
- **College students** who want their smartwatch data to be useful
- **Working professionals** who manage their family's health remotely
- **Anyone** who wants to understand government health schemes they can use"

---

## PART 7: Future Scope (30 seconds)

"We have big plans for the future:

1. **More languages** - We want to add Tamil, Telugu, Bengali, Marathi and more regional languages
2. **Offline-first with service workers** - Make the entire app work without internet, not just emergency mode
3. **Mobile app** - Launch as a proper phone app using React Native or Flutter
4. **Hospital locator** - Find nearby hospitals and clinics using your location
5. **More wearable devices** - Direct Bluetooth connection to blood pressure monitors and glucometers
6. **AI model trained on Indian health data** - Make the AI even more accurate for Indian health conditions
7. **Integration with ABHA** - Connect with India's Ayushman Bharat Health Account for seamless health records"

---

## PART 8: Closing (20 seconds)

"To sum up - AI Arogya Sathi is not just an app, it's a **health companion for every Indian family**. It bridges the gap between technology and healthcare for people who need it the most. We believe that good health guidance should be available to everyone - regardless of language, location, or income.

Thank you. We'd be happy to show you a live demo or answer any questions."

---

## Q&A Preparation

### Likely Questions and Simple Answers:

**Q: How is this different from Google?**
A: Google gives you a list of links. Our app gives you a personalised, structured answer in your own language, considering your family's health conditions. And it knows when to say 'stop, go to a doctor.'

**Q: Is this safe? Can people rely on this instead of a doctor?**
A: No, and we are very clear about this. The app always says 'consult a doctor' and never claims to replace one. It's a **decision-support tool** - it helps you understand what might be wrong and when to get professional help.

**Q: What about data privacy?**
A: Health data stays private. We only store the last 4 digits of Aadhaar (not the full number). All data is encrypted. The Google Fit token is stored in the browser and can be revoked anytime.

**Q: How does the AI work?**
A: We use Groq's LLaMA 3.3 model - it's an open-source AI. When you type symptoms, our system first checks if it's an emergency, then sends your symptoms along with your profile to the AI, and formats the response in a structured way with remedies, warnings, and next steps.

**Q: What if there's no internet?**
A: The symptom checker needs internet (because AI runs online), but the emergency mode, first-aid guides, and emergency contacts work completely offline.

**Q: How much does it cost?**
A: Nothing. We built it using free tools and free hosting. The entire project costs $0 per month to run.

**Q: What did you build vs. what already existed?**
A: Everything is custom-built by our team. The symptom checker, health dashboard, wearable integration, medicine reminders, emergency mode, community features - all built from scratch. The only external services we use are the AI API (Groq), Google Fit for wearables, and Supabase for database hosting.

---

## Demo Checklist

Before the exhibition, make sure:
- [ ] App is deployed and accessible at `https://arogya-sathi-frontend.onrender.com`
- [ ] Demo accounts work (rajesh@demo.com / demo123)
- [ ] AI symptom checker responds (Groq API key is active)
- [ ] Google Fit connection works (OAuth redirect URI updated)
- [ ] Emergency mode works offline (test by disabling WiFi)
- [ ] Medicine reminders page loads
- [ ] QR medical card generates
- [ ] Community section loads with schemes data
- [ ] Hindi language works in symptom checker
- [ ] Have a backup video recording of the demo in case of internet issues

---

## Quick Reference - Key Numbers

| Stat | Value |
|------|-------|
| Features | 11 modules |
| API Endpoints | 35+ |
| Database Tables | 11 |
| Languages | 2 (English + Hindi) |
| Emergency Numbers | 8 (Indian) |
| First Aid Guides | 5 (offline) |
| Government Schemes | 3+ in database |
| Cost to Run | $0/month |
| Response Time | ~2-3 seconds (AI) |
| Works Offline | Emergency + First Aid |
