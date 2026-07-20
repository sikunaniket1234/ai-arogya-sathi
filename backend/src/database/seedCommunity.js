require("dotenv").config();
const { pool } = require("../config/database");

async function seedCommunity() {
  console.log("Seeding community data...");

  const schemes = [
    {
      name: "Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PMJAY)",
      description: "Provides health cover of Rs 5 lakh per family per year for secondary and tertiary care hospitalisation to over 10 crore poor and vulnerable families.",
      eligibility_criteria: { max_income: 50000, max_age: 70, conditions: [] },
      scheme_type: "insurance",
      provider: "central",
      link: "https://mera.pmjay.gov.in",
      states: "{}"
    },
    {
      name: "Janani Suraksha Yojana (JSY)",
      description: "Safe motherhood intervention to reduce maternal and neonatal mortality among poor pregnant women. Cash incentive provided for institutional delivery.",
      eligibility_criteria: { conditions: ["pregnancy"], max_age: 49 },
      scheme_type: "subsidy",
      provider: "central",
      link: "https://nhm.gov.in",
      states: "{}"
    },
    {
      name: "Pradhan Mantri Jan Aushadhi Pariyojana",
      description: "Provides quality medicines at affordable prices through dedicated outlets (Jan Aushadhi Kendras). Generic medicines at 50-90% less than branded rates.",
      eligibility_criteria: {},
      scheme_type: "subsidy",
      provider: "central",
      link: "https://janaushadhi.gov.in",
      states: "{}"
    },
    {
      name: "National Digital Health Mission (NDHM)",
      description: "Creates a digital health ecosystem with unique health ID, health records, and consent framework. Free Ayushman Bharat Health Account (ABHA).",
      eligibility_criteria: {},
      scheme_type: "screening",
      provider: "central",
      link: "https://ndhm.gov.in",
      states: "{}"
    },
    {
      name: "Rashtriya Swasthya Bima Yojana (RSBY)",
      description: "Health insurance for BPL families covering hospitalisation up to Rs 30,000. Covers pre-existing diseases from day one.",
      eligibility_criteria: { bpl_only: true },
      scheme_type: "insurance",
      provider: "central",
      states: "{}"
    },
    {
      name: "National Programme for Prevention and Control of Cancer, Diabetes, CVD and Stroke (NPCDCS)",
      description: "Free screening for cancer, diabetes, cardiovascular diseases and stroke at government health facilities. Includes treatment at district hospitals.",
      eligibility_criteria: { min_age: 30 },
      scheme_type: "screening",
      provider: "central",
      states: "{}"
    },
    {
      name: "National Tuberculosis Elimination Programme (NTEP)",
      description: "Free TB diagnosis, treatment and nutrition support under National TB Elimination Programme. Includes Nikshay Poshan Yojana with Rs 1000/month nutrition support.",
      eligibility_criteria: {},
      scheme_type: "free_treatment",
      provider: "central",
      link: "https://nikshay.in",
      states: "{}"
    },
    {
      name: "Mission Indradhanush",
      description: "Universal immunisation programme covering children and pregnant women with vaccines against 12 preventable diseases including polio, tetanus, measles.",
      eligibility_criteria: { max_age: 5, conditions: ["pregnancy"] },
      scheme_type: "free_treatment",
      provider: "central",
      states: "{}"
    },
    {
      name: "National Mental Health Programme (NMHP)",
      description: "Free mental health services at district hospitals and community health centres. Includes psychiatric treatment, counselling and rehabilitation.",
      eligibility_criteria: {},
      scheme_type: "free_treatment",
      provider: "central",
      states: "{}"
    },
    {
      name: "Pradhan Mantri Dialysis Programme",
      description: "Free haemodialysis treatment for poor patients at private dialysis centres under PMJAY. Up to 3 sessions per week covered.",
      eligibility_criteria: { conditions: ["kidney failure", "renal disease", "dialysis"] },
      scheme_type: "free_treatment",
      provider: "central",
      states: "{}"
    },
    {
      name: "Ayushman Bharat Health Account (ABHA)",
      description: "Create your digital health ID to link all health records. Access OPD, prescription and discharge summaries digitally.",
      eligibility_criteria: {},
      scheme_type: "screening",
      provider: "central",
      link: "https://abdm.gov.in",
      states: "{}"
    },
    {
      name: "Rashtriya Bal Swasthya Karyakram (RBSK)",
      description: "Free health screening and treatment for children 0-18 years including birth defects, deficiencies, developmental delays and diseases.",
      eligibility_criteria: { max_age: 18 },
      scheme_type: "free_treatment",
      provider: "central",
      states: "{}"
    },
    {
      name: "National Programme for Control of Blindness (NPCB)",
      description: "Free cataract surgery and treatment for eye diseases at government hospitals. Includes school eye screening programme.",
      eligibility_criteria: {},
      scheme_type: "free_treatment",
      provider: "central",
      states: "{}"
    },
    {
      name: "National Leprosy Eradication Programme (NLEP)",
      description: "Free diagnosis and multi-drug therapy for leprosy. Covers deformity correction surgery and rehabilitation.",
      eligibility_criteria: {},
      scheme_type: "free_treatment",
      provider: "central",
      states: "{}"
    },
    {
      name: "Kayakalp - Swachh Bharat Mission Health",
      description: "Clean and infection-free public health facilities. Improved sanitation and hygiene at all public hospitals and health centres.",
      eligibility_criteria: {},
      scheme_type: "screening",
      provider: "central",
      states: "{}"
    },
    {
      name: "Mahatma Jyotiba Phule Jan Arogya Yojana (Maharashtra)",
      description: "Health cover up to Rs 2.5 lakh per family per year for BPL families in Maharashtra for secondary and tertiary hospitalisation.",
      eligibility_criteria: { bpl_only: true },
      scheme_type: "insurance",
      provider: "state",
      states: '{"Maharashtra"}'
    },
    {
      name: "Arogyasri (Telangana/Andhra Pradesh)",
      description: "Free treatment up to Rs 5 lakh per family per year for below poverty line families at network hospitals.",
      eligibility_criteria: { bpl_only: true },
      scheme_type: "insurance",
      provider: "state",
      states: '{"Telangana", "Andhra Pradesh"}'
    },
    {
      name: "Bhamashah Health Insurance (Rajasthan)",
      description: "Health cover of Rs 3 lakh per family for BPL families in Rajasthan. Cashless treatment at empanelled hospitals.",
      eligibility_criteria: { bpl_only: true },
      scheme_type: "insurance",
      provider: "state",
      states: '{"Rajasthan"}'
    },
    {
      name: "Chief Minister Comprehensive Health Insurance (Tamil Nadu)",
      description: "Health cover up to Rs 5 lakh per family per year for poor families in Tamil Nadu covering 1027 procedures.",
      eligibility_criteria: { bpl_only: true },
      scheme_type: "insurance",
      provider: "state",
      states: '{"Tamil Nadu"}'
    },
    {
      name: "Swasthya Sathi (West Bengal)",
      description: "Health cover of Rs 5 lakh per family per year for all state government employees and their families in West Bengal.",
      eligibility_criteria: {},
      scheme_type: "insurance",
      provider: "state",
      states: '{"West Bengal"}'
    }
  ];

  for (const s of schemes) {
    await pool.query(
      `INSERT INTO community_schemes (name, description, eligibility_criteria, scheme_type, provider, link, states)
       VALUES ($1, $2, $3, $4, $5, $6, $7::text[])
       ON CONFLICT DO NOTHING`,
      [s.name, s.description, JSON.stringify(s.eligibility_criteria), s.scheme_type, s.provider, s.link || null, s.states === '{}' ? '{}' : s.states]
    );
  }
  console.log(`  Inserted ${schemes.length} health schemes`);

  const bloodBanks = [
    { name: "Indian Red Cross Society Blood Bank", address: "Red Cross Building, Near Parliament Street", city: "New Delhi", state: "Delhi", phone: "011-23359379", blood: ["A+","A-","B+","B-","AB+","AB-","O+","O-"], lat: 28.6246, lng: 77.2167 },
    { name: "All India Institute of Medical Sciences Blood Bank", address: "AIIMS Campus, Ansari Nagar", city: "New Delhi", state: "Delhi", phone: "011-26593600", blood: ["A+","B+","AB+","O+","O-"], lat: 28.5672, lng: 77.2100 },
    { name: "Tata Memorial Hospital Blood Bank", address: "Dr E Borges Road, Parel", city: "Mumbai", state: "Maharashtra", phone: "022-24177000", blood: ["A+","A-","B+","B-","AB+","O+","O-"], lat: 19.0110, lng: 72.8448 },
    { name: "Jehangir Hospital Blood Bank", address: "32 Sassoon Road, Near Pune Railway Station", city: "Pune", state: "Maharashtra", phone: "020-66812000", blood: ["A+","B+","AB+","O+","O-"], lat: 18.5290, lng: 73.8750 },
    { name: "Apollo Hospitals Blood Bank", address: "21 Greams Road, Thousand Lights", city: "Chennai", state: "Tamil Nadu", phone: "044-28298281", blood: ["A+","A-","B+","B-","AB+","AB-","O+","O-"], lat: 13.0588, lng: 80.2533 },
    { name: "Fortis Hospital Blood Bank", address: "154/9, Bannerghatta Road, Near IIM", city: "Bangalore", state: "Karnataka", phone: "080-66214444", blood: ["A+","B+","AB+","O+"], lat: 12.8850, lng: 77.6000 },
    { name: "AMRI Hospitals Blood Bank", address: "Block AF, Sector 1, Salt Lake", city: "Kolkata", state: "West Bengal", phone: "033-23201111", blood: ["A+","A-","B+","O+","O-"], lat: 22.5726, lng: 88.4106 },
    { name: "Sanjay Gandhi PGIMS Blood Bank", address: "Raebareli Road, Lucknow", city: "Lucknow", state: "Uttar Pradesh", phone: "0522-2670301", blood: ["A+","B+","AB+","O+","O-"], lat: 26.8467, lng: 80.9462 },
    { name: "Sawai Man Singh Hospital Blood Bank", address: "SMS Hospital Compound, JLN Marg", city: "Jaipur", state: "Rajasthan", phone: "0141-2560291", blood: ["A+","A-","B+","B-","AB+","O+","O-"], lat: 26.8930, lng: 75.8080 },
    { name: "Nizam's Institute of Medical Sciences Blood Bank", address: "Punjagutta, Near Panjagutta Metro", city: "Hyderabad", state: "Telangana", phone: "040-23489000", blood: ["A+","B+","AB+","O+"], lat: 17.4239, lng: 78.4488 },
  ];

  for (const b of bloodBanks) {
    await pool.query(
      `INSERT INTO blood_banks (name, address, city, state, phone, blood_available, lat, lng)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT DO NOTHING`,
      [b.name, b.address, b.city, b.state, b.phone, b.blood, b.lat, b.lng]
    );
  }
  console.log(`  Inserted ${bloodBanks.length} blood banks`);

  const camps = [
    { name: "Free COVID-19 Vaccination Camp", address: "Community Hall, Sector 5, Dwarka", city: "New Delhi", state: "Delhi", date: "2026-08-01", vaccines: ["COVID-19"], age: "12+", free: true, link: null },
    { name: "Mission Indradhanush Drive", address: "Primary Health Centre, Andheri East", city: "Mumbai", state: "Maharashtra", date: "2026-08-05", vaccines: ["Polio","DPT","Measles","BCG","Hepatitis B"], age: "0-5 years", free: true, link: null },
    { name: "Free HPV Vaccination Camp for Girls", address: "Government Girls School, T Nagar", city: "Chennai", state: "Tamil Nadu", date: "2026-08-10", vaccines: ["HPV"], age: "9-14 years", free: true, link: null },
    { name: "Influenza Vaccination Camp", address: "Sadar Hospital Campus, Hazratganj", city: "Lucknow", state: "Uttar Pradesh", date: "2026-08-15", vaccines: ["Influenza"], age: "60+", free: true, link: null },
    { name: "Typhoid Vaccination Drive", address: "Municipal School Ground, Koramangala", city: "Bangalore", state: "Karnataka", date: "2026-08-20", vaccines: ["Typhoid"], age: "5-15 years", free: true, link: null },
  ];

  for (const c of camps) {
    await pool.query(
      `INSERT INTO vaccination_camps (name, address, city, state, camp_date, vaccines, age_group, is_free, registration_link)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT DO NOTHING`,
      [c.name, c.address, c.city, c.state, c.date, c.vaccines, c.age, c.free, c.link]
    );
  }
  console.log(`  Inserted ${camps.length} vaccination camps`);

  const outbreaks = [
    {
      disease: "Dengue Fever",
      region: "Delhi NCR",
      severity: "medium",
      message: "Rising dengue cases reported across Delhi NCR. Symptoms include high fever, severe headache, pain behind eyes, joint and muscle pain. Prevent mosquito breeding by not allowing stagnant water.",
      source: "Directorate of Health Services, Delhi",
    },
    {
      disease: "Cholera",
      region: "Mumbai, Maharashtra",
      severity: "low",
      message: "Isolated cholera cases reported in suburban Mumbai. Ensure safe drinking water, proper sanitation and hand hygiene. ORS is the primary treatment.",
      source: "Brihanmumbai Municipal Corporation",
    },
    {
      disease: "Malaria",
      region: "Eastern Uttar Pradesh",
      severity: "high",
      message: "Significant spike in malaria cases in eastern UP districts. Use mosquito nets, wear full sleeves, eliminate stagnant water. Seek immediate treatment for fever with chills.",
      source: "National Centre for Disease Control",
    },
    {
      disease: "Leptospirosis",
      region: "Kerala",
      severity: "medium",
      message: "Post-monsoon leptospirosis cases rising in Kerala. Avoid wading through floodwater. Symptoms: high fever, headache, muscle pain, vomiting. Early treatment with doxycycline is essential.",
      source: "Kerala Health Department",
    },
    {
      disease: "Seasonal Influenza (H3N2)",
      region: "Punjab, Haryana",
      severity: "low",
      message: "Increased H3N2 influenza cases in northern states. Most recover within a week. Vulnerable groups (elderly, children) should take flu vaccine. Mask indoors if symptomatic.",
      source: "Integrated Disease Surveillance Programme",
    },
  ];

  for (const o of outbreaks) {
    await pool.query(
      `INSERT INTO outbreak_alerts (disease, region, severity, message, source)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING`,
      [o.disease, o.region, o.severity, o.message, o.source]
    );
  }
  console.log(`  Inserted ${outbreaks.length} outbreak alerts`);

  console.log("\nCommunity seed completed!");
  await pool.end();
  process.exit(0);
}

seedCommunity().catch((err) => {
  console.error("Community seed failed:", err);
  process.exit(1);
});
