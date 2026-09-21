import {
  DrugDatabaseEntry,
  PatientInput,
  MedicationInput,
  AnalysisResult,
  FlaggedAllergy,
  FlaggedInteraction,
  AlternativeItem,
  DosageTimeline
} from '../types/clinical';

// Clinical drug database & AI analysis engine simulation
export const DRUG_DATABASE: DrugDatabaseEntry[] = [
  {
    name: "Amoxicillin",
    category: "Antibiotic",
    genericName: "Amoxicillin Trihydrate",
    standardDosage: "500mg",
    alternatives: [
      {
        name: "Generic Amoxicillin 500mg",
        type: "Generic Equivalent",
        priceSavings: "65%",
        efficacy: "99.8%",
        manufacturer: "Cipla Health / Sun Pharma",
        notes: "Identical active pharmaceutical ingredient (API), bio-equivalent."
      },
      {
        name: "Azithromycin 500mg",
        type: "Therapeutic Alternative",
        priceSavings: "40%",
        efficacy: "98.5%",
        manufacturer: "Zydus Healthcare",
        notes: "Shorter 3-day course option for penicillin-sensitive bacterial upper respiratory infections."
      },
      {
        name: "Cefalexin 500mg",
        type: "Cephalosporin Class Alternative",
        priceSavings: "30%",
        efficacy: "97.9%",
        manufacturer: "Torrent Pharma",
        notes: "Suitable alternative if patient tolerates non-penicillin beta-lactams."
      }
    ],
    contraindications: ["Penicillin Allergy"],
    interactions: [
      { drug: "Methotrexate", severity: "High", effect: "Reduces methotrexate renal excretion, increasing toxicity risk." },
      { drug: "Allopurinol", severity: "Moderate", effect: "Increased risk of cutaneous allergic rash." },
      { drug: "Warfarin", severity: "Moderate", effect: "May prolong prothrombin time and increase bleeding risk." }
    ]
  },
  {
    name: "Metformin",
    category: "Antidiabetic (Biguanide)",
    genericName: "Metformin Hydrochloride",
    standardDosage: "500mg - 1000mg",
    alternatives: [
      {
        name: "Metformin ER 500mg (Extended Release)",
        type: "Formulation Upgrade",
        priceSavings: "15%",
        efficacy: "99.9%",
        manufacturer: "Lupin / GlaxoSmithKline",
        notes: "Reduces gastrointestinal side effects like nausea & abdominal cramps compared to immediate release."
      },
      {
        name: "Generic Metformin HCl 500mg",
        type: "Generic Equivalent",
        priceSavings: "75%",
        efficacy: "100%",
        manufacturer: "Aurobindo Pharma",
        notes: "US FDA AB-rated bio-equivalent at significantly lower daily therapy cost."
      },
      {
        name: "Sitagliptin 50mg",
        type: "DPP-4 Inhibitor Alternative",
        priceSavings: "-10%",
        efficacy: "96.5%",
        manufacturer: "MSD India",
        notes: "Weight-neutral option if patient develops severe GI intolerance to Metformin."
      }
    ],
    contraindications: ["Severe Renal Impairment", "Metabolic Acidosis"],
    interactions: [
      { drug: "Cimetidine", severity: "Moderate", effect: "Competes for renal transport, raising plasma metformin concentrations." },
      { drug: "Furosemide", severity: "Moderate", effect: "Increases Metformin serum concentration." },
      { drug: "Iodinated Contrast", severity: "High", effect: "Risk of lactic acidosis; withhold metformin prior to imaging." }
    ]
  },
  {
    name: "Atorvastatin",
    category: "Statin (Lipid-Lowering)",
    genericName: "Atorvastatin Calcium",
    standardDosage: "10mg - 40mg",
    alternatives: [
      {
        name: "Rosuvastatin 10mg",
        type: "Potency Upgrade Alternative",
        priceSavings: "25%",
        efficacy: "102%",
        manufacturer: "AstraZeneca / Dr. Reddy's",
        notes: "Higher LDL-C reduction per mg ratio with lower risk of cytochrome P450 drug interactions."
      },
      {
        name: "Generic Atorvastatin 20mg",
        type: "Generic Equivalent",
        priceSavings: "70%",
        efficacy: "100%",
        manufacturer: "Sun Pharma",
        notes: "Cost-effective primary prevention choice for hyperlipidemia."
      }
    ],
    contraindications: ["Active Liver Disease", "Pregnancy"],
    interactions: [
      { drug: "Clarithromycin", severity: "High", effect: "Inhibits CYP3A4, significantly increasing atorvastatin concentration and risk of rhabdomyolysis." },
      { drug: "Gemfibrozil", severity: "High", effect: "Markedly increases risk of severe myopathy & breakdown of muscle tissue." },
      { drug: "Grapefruit Juice", severity: "Moderate", effect: "Inhibits intestinal CYP3A4 leading to elevated blood levels." }
    ]
  },
  {
    name: "Lisinopril",
    category: "ACE Inhibitor (Antihypertensive)",
    genericName: "Lisinopril Dihydrate",
    standardDosage: "5mg - 20mg",
    alternatives: [
      {
        name: "Enalapril 5mg",
        type: "Class Equivalent",
        priceSavings: "50%",
        efficacy: "98.0%",
        manufacturer: "Torrent Pharma",
        notes: "Established ACE inhibitor alternative with lower daily acquisition cost."
      },
      {
        name: "Telmisartan 40mg",
        type: "ARB Class Alternative (Cough-Free)",
        priceSavings: "20%",
        efficacy: "99.5%",
        manufacturer: "Boehringer Ingelheim",
        notes: "Ideal ARB alternative if Lisinopril causes persistent dry cough."
      }
    ],
    contraindications: ["Angioedema History", "Pregnancy", "Renal Artery Stenosis"],
    interactions: [
      { drug: "Spironolactone", severity: "High", effect: "Additive hyperkalemia risk; monitor serum potassium closely." },
      { drug: "Ibuprofen", severity: "High", effect: "NSAIDs diminish antihypertensive effect and risk acute renal deterioration." },
      { drug: "Lithium", severity: "Moderate", effect: "Increases serum lithium toxicity risk." }
    ]
  },
  {
    name: "Ibuprofen",
    category: "NSAID Analgesic",
    genericName: "Ibuprofen",
    standardDosage: "200mg - 400mg",
    alternatives: [
      {
        name: "Paracetamol (Acetaminophen) 650mg",
        type: "GI & Renal Friendly Alternative",
        priceSavings: "60%",
        efficacy: "95.0%",
        manufacturer: "GSK / Calpol",
        notes: "First-line pain reliever without gastric ulceration risk or renal constriction."
      },
      {
        name: "Naproxen 250mg",
        type: "Longer Acting NSAID",
        priceSavings: "15%",
        efficacy: "99.0%",
        manufacturer: "Abbott",
        notes: "Twice-daily dosing schedule for chronic inflammatory arthritis."
      }
    ],
    contraindications: ["Peptic Ulcer", "Severe Heart Failure", "NSAID Allergy"],
    interactions: [
      { drug: "Aspirin", severity: "Moderate", effect: "Ibuprofen interferes with antiplatelet cardioprotective effect of low-dose aspirin." },
      { drug: "Lisinopril", severity: "High", effect: "Attenuates blood pressure control and raises nephrotoxicity risk." },
      { drug: "Warfarin", severity: "High", effect: "Synergistic bleeding risk and stomach mucosal erosion." }
    ]
  },
  {
    name: "Omeprazole",
    category: "Proton Pump Inhibitor (PPI)",
    genericName: "Omeprazole Delayed-Release",
    standardDosage: "20mg",
    alternatives: [
      {
        name: "Pantoprazole 40mg",
        type: "Drug Interaction Friendly Alternative",
        priceSavings: "35%",
        efficacy: "99.2%",
        manufacturer: "Alkem Labs",
        notes: "Lower inhibition of CYP2C19 enzyme; safer when co-prescribed with Clopidogrel."
      },
      {
        name: "Generic Omeprazole 20mg",
        type: "Generic Equivalent",
        priceSavings: "70%",
        efficacy: "100%",
        manufacturer: "Dr. Reddy's",
        notes: "Cost-effective acid suppression for GERD & peptic ulcer healing."
      }
    ],
    contraindications: ["Hypersensitivity to PPIs"],
    interactions: [
      { drug: "Clopidogrel", severity: "High", effect: "Decreases active metabolite of clopidogrel, reducing antiplatelet efficacy." },
      { drug: "Ketoconazole", severity: "Moderate", effect: "Reduces absorption of antifungal due to increased gastric pH." }
    ]
  }
];

export function analyzePrescription(patientData: PatientInput, medications: MedicationInput[], customTimestamp?: string): AnalysisResult {
  const patientAllergies = (patientData.allergies || "")
    .toLowerCase()
    .split(",")
    .map(a => a.trim())
    .filter(Boolean);

  const flaggedInteractions: FlaggedInteraction[] = [];
  const flaggedAllergies: FlaggedAllergy[] = [];
  const alternativesList: AlternativeItem[] = [];
  const dosageTimeline: DosageTimeline = {
    morning: [],
    afternoon: [],
    evening: [],
    bedtime: []
  };
  const dietLifestyleDos: string[] = [];
  const dietLifestyleDonts: string[] = [];

  // General healthy guidelines
  dietLifestyleDos.push("Stay hydrated with 2.5L to 3L of water daily to maintain renal clearance.");
  dietLifestyleDos.push("Take medications with a full glass of clean water unless instructed otherwise.");

  // Process each medication
  medications.forEach((med, index) => {
    const drugNameClean = (med.name || "").trim();
    if (!drugNameClean) return;

    // Check drug in database
    const matchedDbDrug = DRUG_DATABASE.find(
      db => db.name.toLowerCase() === drugNameClean.toLowerCase() ||
            db.genericName.toLowerCase().includes(drugNameClean.toLowerCase())
    );

    // Allergy check
    patientAllergies.forEach(allergy => {
      if (
        drugNameClean.toLowerCase().includes(allergy) ||
        (matchedDbDrug && matchedDbDrug.category.toLowerCase().includes(allergy)) ||
        (matchedDbDrug && matchedDbDrug.contraindications.some(c => c.toLowerCase().includes(allergy)))
      ) {
        flaggedAllergies.push({
          medication: drugNameClean,
          allergyMatch: allergy,
          severity: "CRITICAL",
          message: `Patient has documented allergy/contraindication to '${allergy}'. '${drugNameClean}' presents severe hypersensitivity risk.`
        });
      }
    });

    // Drug-Drug interactions among prescribed meds
    medications.forEach((otherMed, otherIndex) => {
      if (index >= otherIndex) return; // avoid duplicate pairs
      const otherClean = (otherMed.name || "").trim();
      if (!otherClean) return;

      if (matchedDbDrug && matchedDbDrug.interactions) {
        const foundInt = matchedDbDrug.interactions.find(
          int => int.drug.toLowerCase() === otherClean.toLowerCase()
        );
        if (foundInt) {
          flaggedInteractions.push({
            drugA: drugNameClean,
            drugB: otherClean,
            severity: foundInt.severity,
            effect: foundInt.effect,
            recommendation: `Consider spacing administration timing or replacing ${drugNameClean} with a non-interacting alternative.`
          });
        }
      }
    });

    // Provide alternatives
    if (matchedDbDrug && matchedDbDrug.alternatives) {
      alternativesList.push({
        prescribedMed: drugNameClean,
        category: matchedDbDrug.category,
        options: matchedDbDrug.alternatives
      });
    } else {
      // Fallback synthetic high quality generic alternative suggestion if drug not in static DB
      alternativesList.push({
        prescribedMed: drugNameClean,
        category: "General Therapeutic Agent",
        options: [
          {
            name: `Generic ${drugNameClean} ${med.dosage || "Standard Dose"}`,
            type: "Generic Bio-Equivalent",
            priceSavings: "50-70%",
            efficacy: "99.0%",
            manufacturer: "FDA Approved Generic Partner",
            notes: "Direct generic substitution with equal potency and lower financial cost."
          },
          {
            name: `Formulation Upgrade for ${drugNameClean}`,
            type: "Sustained Release Option",
            priceSavings: "20%",
            efficacy: "98.5%",
            manufacturer: "Clinical Standard Lab",
            notes: "Smoother absorption profile with reduced peak-trough GI sensitivity."
          }
        ]
      });
    }

    // Schedule map
    const freqLower = (med.frequency || "").toLowerCase();
    if (freqLower.includes("once") || freqLower.includes("qd") || freqLower.includes("morning")) {
      dosageTimeline.morning.push({ name: drugNameClean, dose: med.dosage, timing: med.timing || "After Breakfast" });
    } else if (freqLower.includes("twice") || freqLower.includes("bid")) {
      dosageTimeline.morning.push({ name: drugNameClean, dose: med.dosage, timing: med.timing || "After Breakfast" });
      dosageTimeline.evening.push({ name: drugNameClean, dose: med.dosage, timing: med.timing || "After Dinner" });
    } else if (freqLower.includes("thrice") || freqLower.includes("tid") || freqLower.includes("3 times")) {
      dosageTimeline.morning.push({ name: drugNameClean, dose: med.dosage, timing: med.timing || "Morning" });
      dosageTimeline.afternoon.push({ name: drugNameClean, dose: med.dosage, timing: med.timing || "Post Lunch" });
      dosageTimeline.evening.push({ name: drugNameClean, dose: med.dosage, timing: med.timing || "Night" });
    } else if (freqLower.includes("night") || freqLower.includes("sleep") || freqLower.includes("hs")) {
      dosageTimeline.bedtime.push({ name: drugNameClean, dose: med.dosage, timing: med.timing || "30 min before bed" });
    } else {
      dosageTimeline.morning.push({ name: drugNameClean, dose: med.dosage, timing: med.timing || "As directed" });
    }

    // Specific food / lifestyle guidelines
    if (drugNameClean.toLowerCase().includes("ibuprofen") || drugNameClean.toLowerCase().includes("nsaid")) {
      dietLifestyleDonts.push("Avoid alcohol consumption while taking NSAIDs to prevent severe stomach bleeding.");
      dietLifestyleDos.push("Always take Ibuprofen with meals, milk, or food to buffer gastric lining.");
    }
    if (drugNameClean.toLowerCase().includes("metformin")) {
      dietLifestyleDos.push("Maintain a high-fiber, low-glycemic complex carbohydrate diet.");
      dietLifestyleDonts.push("Limit excessive alcohol intake due to increased lactic acidosis risk with Metformin.");
    }
    if (drugNameClean.toLowerCase().includes("atorvastatin") || drugNameClean.toLowerCase().includes("statin")) {
      dietLifestyleDonts.push("Do not consume grapefruit or grapefruit juice as it increases statin toxicity.");
    }
    if (drugNameClean.toLowerCase().includes("amoxicillin") || drugNameClean.toLowerCase().includes("antibiotic")) {
      dietLifestyleDos.push("Complete the full course of antibiotics even if symptoms subside early.");
      dietLifestyleDos.push("Consider taking probiotic yogurt or supplements 2 hours after antibiotic dose.");
    }
  });

  // Default fallback if schedule empty
  if (dosageTimeline.morning.length === 0 && dosageTimeline.afternoon.length === 0 && dosageTimeline.evening.length === 0 && dosageTimeline.bedtime.length === 0) {
    medications.forEach(m => {
      if (m.name) dosageTimeline.morning.push({ name: m.name, dose: m.dosage || "1 Tab", timing: m.timing || "Morning after breakfast" });
    });
  }

  // Calculate Patient Risk & Safety Score
  let safetyScore = 98;
  if (flaggedAllergies.length > 0) safetyScore -= 35 * flaggedAllergies.length;
  if (flaggedInteractions.some(i => i.severity === "High")) safetyScore -= 25;
  if (flaggedInteractions.some(i => i.severity === "Moderate")) safetyScore -= 10;
  if (safetyScore < 20) safetyScore = 20;

  let riskCategory = "OPTIMAL / LOW RISK";
  let statusColor = "#00C9A7"; // teal
  if (safetyScore < 60) {
    riskCategory = "HIGH RISK ALERT";
    statusColor = "#FF4D6D"; // red
  } else if (safetyScore < 85) {
    riskCategory = "MODERATE CAUTION";
    statusColor = "#FFB703"; // amber
  }

  // Generate overall clinical overview
  const aiClinicalOverview = `Comprehensive evaluation of ${patientData.patientName || "Patient"} (${patientData.age || "N/A"} y/o, ${patientData.gender || "Gender N/A"}) with primary diagnosis of '${patientData.disease || "Specified Condition"}'. Formulated regimen contains ${medications.length} active therapeutic agent(s). ${
    flaggedAllergies.length > 0
      ? `CRITICAL ATTENTION: ${flaggedAllergies.length} allergy conflict(s) detected!`
      : flaggedInteractions.length > 0
      ? `CAUTION: ${flaggedInteractions.length} potential drug-drug interaction(s) flagged for review.`
      : "Regimen demonstrates strong safety profile with zero direct high-severity drug conflicts detected."
  }`;

  return {
    patientInfo: patientData,
    medications,
    safetyScore,
    riskCategory,
    statusColor,
    flaggedAllergies,
    flaggedInteractions,
    alternativesList,
    dosageTimeline,
    dietLifestyleDos: Array.from(new Set(dietLifestyleDos)),
    dietLifestyleDonts: Array.from(new Set(dietLifestyleDonts)),
    aiClinicalOverview,
    estimatedMonthlySavings: "$45.00 - $120.00 (via Generic Equivalents)",
    timestamp: customTimestamp || new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
  };
}

export const SAMPLE_CLINICAL_CASE: PatientInput = {
  patientName: "Robert Vance",
  age: 58,
  gender: "Male",
  weight: 82,
  allergies: "Penicillin, Sulfa",
  disease: "Essential Hypertension, Type 2 Diabetes Mellitus, Mild Hyperlipidemia",
  medications: [
    { name: "Metformin", dosage: "1000mg", frequency: "Twice Daily", duration: "30 Days", timing: "With meals" },
    { name: "Lisinopril", dosage: "10mg", frequency: "Once Daily", duration: "30 Days", timing: "Morning" },
    { name: "Ibuprofen", dosage: "400mg", frequency: "Twice Daily", duration: "7 Days", timing: "After meals (For knee pain)" },
    { name: "Atorvastatin", dosage: "20mg", frequency: "Once Daily", duration: "30 Days", timing: "At bedtime" }
  ]
};
