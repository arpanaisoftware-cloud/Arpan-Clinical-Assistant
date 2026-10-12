import PrescriptionHistory, { pruneOldPrescriptionHistory } from '@/models/PrescriptionHistory';

export const INITIAL_PRESCRIPTION_SEEDS = [
  {
    rxId: 'RX-9041',
    patientName: 'Robert Vance',
    age: 58,
    gender: 'Male',
    disease: 'Hypertension & Type 2 Diabetes',
    medCount: 4,
    safetyScore: 65,
    risk: 'MODERATE CAUTION',
    color: '#FFB703',
    date: '2026-09-16 10:30 AM',
    patientInput: {
      patientName: 'Robert Vance',
      age: 58,
      gender: 'Male',
      weight: 84,
      disease: 'Hypertension & Type 2 Diabetes',
      allergies: 'Penicillin',
      bpSystolic: 148,
      bpDiastolic: 92,
      pulse: 76,
      bmi: 29.4,
      hba1c: 8.4,
      fastingGlucose: 164,
      creatinine: 1.3,
      egfr: 58,
      medications: [
        { name: 'Metformin', dosage: '1000mg', frequency: 'Twice daily', duration: 'Ongoing', timing: 'After meals' },
        { name: 'Glimepiride', dosage: '2mg', frequency: 'Once daily', duration: 'Ongoing', timing: 'Before breakfast' },
        { name: 'Telmisartan', dosage: '40mg', frequency: 'Once daily', duration: 'Ongoing', timing: 'Morning' },
        { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', duration: 'Ongoing', timing: 'Bedtime' }
      ]
    },
    analysisResult: {
      patientInfo: {
        patientName: 'Robert Vance',
        age: 58,
        gender: 'Male',
        weight: 84,
        disease: 'Hypertension & Type 2 Diabetes',
        allergies: 'Penicillin',
        bpSystolic: 148,
        bpDiastolic: 92,
        pulse: 76,
        bmi: 29.4,
        hba1c: 8.4,
        fastingGlucose: 164,
        creatinine: 1.3,
        egfr: 58,
        medications: [
          { name: 'Metformin', dosage: '1000mg', frequency: 'Twice daily', duration: 'Ongoing', timing: 'After meals' },
          { name: 'Glimepiride', dosage: '2mg', frequency: 'Once daily', duration: 'Ongoing', timing: 'Before breakfast' },
          { name: 'Telmisartan', dosage: '40mg', frequency: 'Once daily', duration: 'Ongoing', timing: 'Morning' },
          { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', duration: 'Ongoing', timing: 'Bedtime' }
        ]
      },
      medications: [
        { name: 'Metformin', dosage: '1000mg', frequency: 'Twice daily', duration: 'Ongoing', timing: 'After meals' },
        { name: 'Glimepiride', dosage: '2mg', frequency: 'Once daily', duration: 'Ongoing', timing: 'Before breakfast' },
        { name: 'Telmisartan', dosage: '40mg', frequency: 'Once daily', duration: 'Ongoing', timing: 'Morning' },
        { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', duration: 'Ongoing', timing: 'Bedtime' }
      ],
      safetyScore: 65,
      riskCategory: 'MODERATE CAUTION',
      statusColor: '#FFB703',
      flaggedAllergies: [
        { medication: 'Penicillin', allergyMatch: 'Penicillin', severity: 'Severe', message: 'Avoid beta-lactam antibiotics.' }
      ],
      flaggedInteractions: [
        {
          drugA: 'Telmisartan',
          drugB: 'Glimepiride',
          severity: 'Moderate',
          effect: 'Potential increased hypoglycemic response and BP fluctuation.',
          recommendation: 'Monitor pre-prandial blood glucose and renal parameters.'
        }
      ],
      alternativesList: [
        {
          prescribedMed: 'Glimepiride',
          category: 'Oral Antidiabetic',
          options: [
            { name: 'Empagliflozin 10mg', type: 'SGLT2 Inhibitor', priceSavings: 'High Value', efficacy: 'Cardiorenal protection & low hypo risk', manufacturer: 'Boehringer', notes: 'Preferred in T2D with HTN' }
          ]
        }
      ],
      dosageTimeline: {
        morning: [
          { name: 'Glimepiride 2mg', dose: '1 Tab', timing: 'Before Breakfast' },
          { name: 'Telmisartan 40mg', dose: '1 Tab', timing: 'With Breakfast' },
          { name: 'Metformin 1000mg', dose: '1 Tab', timing: 'After Breakfast' }
        ],
        afternoon: [],
        evening: [],
        bedtime: [
          { name: 'Metformin 1000mg', dose: '1 Tab', timing: 'After Dinner' },
          { name: 'Atorvastatin 20mg', dose: '1 Tab', timing: 'Bedtime' }
        ]
      },
      dietLifestyleDos: ['Carbohydrate consistency under 130g/day', 'Aerobic exercise 150 min/week', 'Home BP & BG monitoring log'],
      dietLifestyleDonts: ['Avoid sugary drinks and refined carbs', 'Limit sodium < 2000mg/day', 'Avoid OTC NSAIDs'],
      aiClinicalOverview: '58yo male with suboptimally controlled T2DM (HbA1c 8.4%) and Stage 1 Hypertension. Current dual OAD (Metformin + Glimepiride) carries hypoglycemia risk. eGFR at 58 mL/min requires periodic renal surveillance.',
      timestamp: '2026-09-16 10:30 AM'
    }
  },
  {
    rxId: 'RX-9040',
    patientName: 'Eleanor Vance',
    age: 62,
    gender: 'Female',
    disease: 'Acute Bronchitis & Hypertension',
    medCount: 3,
    safetyScore: 98,
    risk: 'OPTIMAL / LOW RISK',
    color: '#00C9A7',
    date: '2026-09-15 04:15 PM',
    patientInput: {
      patientName: 'Eleanor Vance',
      age: 62,
      gender: 'Female',
      weight: 64,
      disease: 'Acute Bronchitis & Hypertension',
      allergies: 'None',
      bpSystolic: 124,
      bpDiastolic: 80,
      pulse: 72,
      bmi: 24.2,
      hba1c: 5.6,
      fastingGlucose: 96,
      creatinine: 0.8,
      egfr: 92,
      medications: [
        { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: 'Ongoing', timing: 'Morning' },
        { name: 'Azithromycin', dosage: '500mg', frequency: 'Once daily', duration: '3 days', timing: 'Morning' },
        { name: 'Guaifenesin', dosage: '200mg', frequency: 'Three times daily', duration: '5 days', timing: 'After food' }
      ]
    },
    analysisResult: {
      patientInfo: {
        patientName: 'Eleanor Vance',
        age: 62,
        gender: 'Female',
        weight: 64,
        disease: 'Acute Bronchitis & Hypertension',
        allergies: 'None',
        bpSystolic: 124,
        bpDiastolic: 80,
        pulse: 72,
        bmi: 24.2,
        hba1c: 5.6,
        fastingGlucose: 96,
        creatinine: 0.8,
        egfr: 92,
        medications: [
          { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: 'Ongoing', timing: 'Morning' },
          { name: 'Azithromycin', dosage: '500mg', frequency: 'Once daily', duration: '3 days', timing: 'Morning' },
          { name: 'Guaifenesin', dosage: '200mg', frequency: 'Three times daily', duration: '5 days', timing: 'After food' }
        ]
      },
      medications: [
        { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: 'Ongoing', timing: 'Morning' },
        { name: 'Azithromycin', dosage: '500mg', frequency: 'Once daily', duration: '3 days', timing: 'Morning' },
        { name: 'Guaifenesin', dosage: '200mg', frequency: 'Three times daily', duration: '5 days', timing: 'After food' }
      ],
      safetyScore: 98,
      riskCategory: 'OPTIMAL / LOW RISK',
      statusColor: '#00C9A7',
      flaggedAllergies: [],
      flaggedInteractions: [],
      alternativesList: [],
      dosageTimeline: {
        morning: [
          { name: 'Amlodipine 5mg', dose: '1 Tab', timing: 'With Breakfast' },
          { name: 'Azithromycin 500mg', dose: '1 Tab', timing: 'After Breakfast' },
          { name: 'Guaifenesin 200mg', dose: '1 Tab', timing: 'After Breakfast' }
        ],
        afternoon: [
          { name: 'Guaifenesin 200mg', dose: '1 Tab', timing: 'After Lunch' }
        ],
        evening: [],
        bedtime: [
          { name: 'Guaifenesin 200mg', dose: '1 Tab', timing: 'After Dinner' }
        ]
      },
      dietLifestyleDos: ['Adequate oral hydration (>2.5 L/day)', 'Complete full antibiotic course', 'Rest and humidified air'],
      dietLifestyleDonts: ['Avoid smoking or exposure to respiratory irritants'],
      aiClinicalOverview: '62yo female with acute bronchitis and controlled hypertension. Regimen is safe, well-tolerated, with no critical drug-drug interactions detected.',
      timestamp: '2026-09-15 04:15 PM'
    }
  },
  {
    rxId: 'RX-9039',
    patientName: 'Marcus Miller',
    age: 71,
    gender: 'Male',
    disease: 'Hyperlipidemia & Arthritis',
    medCount: 5,
    safetyScore: 45,
    risk: 'HIGH RISK ALERT',
    color: '#FF4D6D',
    date: '2026-09-14 11:00 AM',
    patientInput: {
      patientName: 'Marcus Miller',
      age: 71,
      gender: 'Male',
      weight: 89,
      disease: 'Type 2 Diabetes, CKD Stage 3b & Osteoarthritis',
      allergies: 'Aspirin (Bronchospasm)',
      bpSystolic: 152,
      bpDiastolic: 96,
      pulse: 82,
      bmi: 31.1,
      hba1c: 9.2,
      fastingGlucose: 210,
      creatinine: 1.8,
      egfr: 38,
      potassiumK: 4.8,
      medications: [
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: 'Ongoing', timing: 'After meals' },
        { name: 'Rosuvastatin', dosage: '40mg', frequency: 'Once daily', duration: 'Ongoing', timing: 'Bedtime' },
        { name: 'Celecoxib', dosage: '200mg', frequency: 'Once daily', duration: '14 days', timing: 'After food' },
        { name: 'Enalapril', dosage: '10mg', frequency: 'Once daily', duration: 'Ongoing', timing: 'Morning' },
        { name: 'Dapagliflozin', dosage: '10mg', frequency: 'Once daily', duration: 'Ongoing', timing: 'Morning' }
      ]
    },
    analysisResult: {
      patientInfo: {
        patientName: 'Marcus Miller',
        age: 71,
        gender: 'Male',
        weight: 89,
        disease: 'Type 2 Diabetes, CKD Stage 3b & Osteoarthritis',
        allergies: 'Aspirin (Bronchospasm)',
        bpSystolic: 152,
        bpDiastolic: 96,
        pulse: 82,
        bmi: 31.1,
        hba1c: 9.2,
        fastingGlucose: 210,
        creatinine: 1.8,
        egfr: 38,
        potassiumK: 4.8,
        medications: [
          { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: 'Ongoing', timing: 'After meals' },
          { name: 'Rosuvastatin', dosage: '40mg', frequency: 'Once daily', duration: 'Ongoing', timing: 'Bedtime' },
          { name: 'Celecoxib', dosage: '200mg', frequency: 'Once daily', duration: '14 days', timing: 'After food' },
          { name: 'Enalapril', dosage: '10mg', frequency: 'Once daily', duration: 'Ongoing', timing: 'Morning' },
          { name: 'Dapagliflozin', dosage: '10mg', frequency: 'Once daily', duration: 'Ongoing', timing: 'Morning' }
        ]
      },
      medications: [
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: 'Ongoing', timing: 'After meals' },
        { name: 'Rosuvastatin', dosage: '40mg', frequency: 'Once daily', duration: 'Ongoing', timing: 'Bedtime' },
        { name: 'Celecoxib', dosage: '200mg', frequency: 'Once daily', duration: '14 days', timing: 'After food' },
        { name: 'Enalapril', dosage: '10mg', frequency: 'Once daily', duration: 'Ongoing', timing: 'Morning' },
        { name: 'Dapagliflozin', dosage: '10mg', frequency: 'Once daily', duration: 'Ongoing', timing: 'Morning' }
      ],
      safetyScore: 45,
      riskCategory: 'HIGH RISK ALERT',
      statusColor: '#FF4D6D',
      flaggedAllergies: [
        { medication: 'Celecoxib', allergyMatch: 'Aspirin', severity: 'High', message: 'Cross-sensitivity hazard in aspirin-exacerbated respiratory disease.' }
      ],
      flaggedInteractions: [
        {
          drugA: 'Celecoxib',
          drugB: 'Enalapril',
          severity: 'High',
          effect: 'Triple-whammy nephrotoxicity: acute renal hemodynamic failure and severe hyperkalemia in CKD 3b.',
          recommendation: 'Discontinue Celecoxib immediately; switch to topical NSAID or Paracetamol.'
        }
      ],
      alternativesList: [
        {
          prescribedMed: 'Celecoxib',
          category: 'Analgesic / Anti-inflammatory',
          options: [
            { name: 'Acetaminophen 650mg', type: 'Simple Analgesic', priceSavings: 'Moderate', efficacy: 'Safer renal profile', manufacturer: 'Various', notes: 'Preferred in CKD' }
          ]
        }
      ],
      dosageTimeline: {
        morning: [
          { name: 'Enalapril 10mg', dose: '1 Tab', timing: 'Morning' },
          { name: 'Dapagliflozin 10mg', dose: '1 Tab', timing: 'Morning' }
        ],
        afternoon: [],
        evening: [],
        bedtime: [
          { name: 'Rosuvastatin 40mg', dose: '1 Tab', timing: 'Bedtime' }
        ]
      },
      dietLifestyleDos: ['Renal-protective low-protein diet (0.8g/kg/day)', 'Daily weights and edema monitoring'],
      dietLifestyleDonts: ['Avoid potassium-containing salt substitutes', 'Avoid NSAIDs'],
      aiClinicalOverview: '71yo male with CKD 3b, hypertension, and T2D. Regimen includes high risk NSAID + ACEi combination that threatens renal function.',
      timestamp: '2026-09-14 11:00 AM'
    }
  },
  {
    rxId: 'RX-9038',
    patientName: 'Sophia Chen',
    age: 44,
    gender: 'Female',
    disease: 'Generalized Anxiety & Insomnia',
    medCount: 2,
    safetyScore: 92,
    risk: 'OPTIMAL / LOW RISK',
    color: '#00C9A7',
    date: '2026-09-13 02:45 PM',
    patientInput: {
      patientName: 'Sophia Chen',
      age: 44,
      gender: 'Female',
      disease: 'Generalized Anxiety & Insomnia',
      medications: [
        { name: 'Escitalopram', dosage: '10mg', frequency: 'Once daily', duration: 'Ongoing', timing: 'Morning' },
        { name: 'Melatonin', dosage: '3mg', frequency: 'Once daily', duration: 'Ongoing', timing: 'Bedtime' }
      ]
    }
  },
  {
    rxId: 'RX-9037',
    patientName: 'Arthur Morgan',
    age: 67,
    gender: 'Male',
    disease: 'Chronic Obstructive Pulmonary Disease',
    medCount: 3,
    safetyScore: 88,
    risk: 'OPTIMAL / LOW RISK',
    color: '#00C9A7',
    date: '2026-09-12 09:20 AM',
    patientInput: {
      patientName: 'Arthur Morgan',
      age: 67,
      gender: 'Male',
      disease: 'Chronic Obstructive Pulmonary Disease',
      medications: [
        { name: 'Tiotropium Inhaler', dosage: '18mcg', frequency: 'Once daily', duration: 'Ongoing', timing: 'Morning' },
        { name: 'Albuterol Inhaler', dosage: '90mcg', frequency: 'As needed', duration: 'Ongoing', timing: 'PRN' }
      ]
    }
  },
  {
    rxId: 'RX-9036',
    patientName: 'Anita Sharma',
    age: 52,
    gender: 'Female',
    disease: 'Hypothyroidism & GERD',
    medCount: 2,
    safetyScore: 78,
    risk: 'MODERATE CAUTION',
    color: '#FFB703',
    date: '2026-09-11 11:15 AM',
    patientInput: {
      patientName: 'Anita Sharma',
      age: 52,
      gender: 'Female',
      disease: 'Hypothyroidism & GERD',
      medications: [
        { name: 'Levothyroxine', dosage: '75mcg', frequency: 'Once daily', duration: 'Ongoing', timing: 'Empty Stomach' },
        { name: 'Pantoprazole', dosage: '40mg', frequency: 'Once daily', duration: '30 days', timing: 'Before Breakfast' }
      ]
    }
  },
  {
    rxId: 'RX-9035',
    patientName: 'David Miller',
    age: 39,
    gender: 'Male',
    disease: 'Essential Hypertension',
    medCount: 1,
    safetyScore: 95,
    risk: 'OPTIMAL / LOW RISK',
    color: '#00C9A7',
    date: '2026-09-10 03:30 PM',
    patientInput: {
      patientName: 'David Miller',
      age: 39,
      gender: 'Male',
      disease: 'Essential Hypertension',
      medications: [
        { name: 'Telmisartan', dosage: '20mg', frequency: 'Once daily', duration: 'Ongoing', timing: 'Morning' }
      ]
    }
  }
];

export async function ensureDefaultPrescriptionHistory() {
  try {
    const count = await PrescriptionHistory.countDocuments();
    if (count === 0) {
      console.log('Seeding initial default prescription analysis history into MongoDB...');
      await PrescriptionHistory.insertMany(INITIAL_PRESCRIPTION_SEEDS);
      console.log('Prescription history records seeded successfully.');
    }
    // Also enforce 100 record maximum retention on boot
    await pruneOldPrescriptionHistory();
  } catch (err: any) {
    console.warn('Prescription history auto-seed encountered non-fatal error:', err.message);
  }
}
