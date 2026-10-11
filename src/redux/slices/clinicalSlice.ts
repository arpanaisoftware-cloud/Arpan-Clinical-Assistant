import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AnalysisResult, HistoryRecord, PatientInput } from '../../types/clinical';

interface ClinicalState {
  analysisResult: AnalysisResult | null;
  historyList: HistoryRecord[];
  activeModuleTab: number;
  currentPatientDraft: Partial<PatientInput> | null;
}

const INITIAL_HISTORY: HistoryRecord[] = [
  {
    id: 'RX-9041',
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
        },
        {
          drugA: 'Metformin',
          drugB: 'Borderline eGFR (58 mL/min)',
          severity: 'Moderate',
          effect: 'Approaching threshold of 45 mL/min where dose reduction is required.',
          recommendation: 'Monitor renal panel biannually; max dose 2000mg/day.'
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
    id: 'RX-9040',
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
    id: 'RX-9039',
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
        },
        {
          drugA: 'Rosuvastatin (40mg)',
          drugB: 'Renal Clearance (eGFR 38)',
          severity: 'High',
          effect: 'High-dose Rosuvastatin in Stage 3b CKD triples myopathy and rhabdomyolysis risk.',
          recommendation: 'Reduce Rosuvastatin dose to 10mg-20mg once daily.'
        }
      ],
      alternativesList: [
        {
          prescribedMed: 'Celecoxib',
          category: 'Analgesic / Anti-inflammatory',
          options: [
            { name: 'Paracetamol 650mg TDS', type: 'Analgesic', priceSavings: 'High Value', efficacy: 'Renally safe pain control', manufacturer: 'Generic', notes: 'First line in CKD patients' },
            { name: 'Topical Diclofenac Gel 1%', type: 'Topical NSAID', priceSavings: 'Moderate', efficacy: 'Localized joint relief', manufacturer: 'Generic', notes: 'Minimal systemic absorption' }
          ]
        }
      ],
      dosageTimeline: {
        morning: [
          { name: 'Enalapril 10mg', dose: '1 Tab', timing: 'Morning' },
          { name: 'Dapagliflozin 10mg', dose: '1 Tab', timing: 'Morning' },
          { name: 'Metformin 500mg', dose: '1 Tab', timing: 'After Breakfast' }
        ],
        afternoon: [],
        evening: [],
        bedtime: [
          { name: 'Celecoxib 200mg', dose: '1 Tab', timing: 'After Dinner' },
          { name: 'Metformin 500mg', dose: '1 Tab', timing: 'After Dinner' },
          { name: 'Rosuvastatin 40mg', dose: '1 Tab', timing: 'Bedtime' }
        ]
      },
      dietLifestyleDos: ['Renal-protective diabetic diet', 'Strict low-potassium diet counseling', 'Daily weight and edema monitoring'],
      dietLifestyleDonts: ['Never take oral NSAIDs or OTC pain relievers', 'Avoid potassium-rich salt substitutes'],
      aiClinicalOverview: '71yo male with high-risk drug interaction. Concurrent Celecoxib (NSAID) and Enalapril (ACEi) with eGFR 38 mL/min creates acute kidney injury risk. Rosuvastatin 40mg is overdosed for CKD 3b.',
      timestamp: '2026-09-14 11:00 AM'
    }
  }
];

const loadSavedHistory = (): HistoryRecord[] => {
  if (typeof window === 'undefined') return INITIAL_HISTORY;
  try {
    const saved = localStorage.getItem('arpan_history_list');
    if (saved) {
      const parsed: HistoryRecord[] = JSON.parse(saved);
      // Merge with INITIAL_HISTORY so pre-analyzed demo data is retained if older items lack it
      const enriched = parsed.map((item) => {
        const matchingInitial = INITIAL_HISTORY.find((init) => init.id === item.id);
        if (matchingInitial && (!item.analysisResult || !item.patientInput)) {
          return { ...matchingInitial, ...item, analysisResult: matchingInitial.analysisResult, patientInput: matchingInitial.patientInput };
        }
        return item;
      });
      return enriched;
    }
  } catch (e) {
    console.error('Failed to parse history list', e);
  }
  return INITIAL_HISTORY;
};

const initialState: ClinicalState = {
  analysisResult: null,
  historyList: loadSavedHistory(),
  activeModuleTab: 0,
  currentPatientDraft: null,
};

const clinicalSlice = createSlice({
  name: 'clinical',
  initialState,
  reducers: {
    setAnalysisResult: (state, action: PayloadAction<AnalysisResult | null>) => {
      state.analysisResult = action.payload;
    },
    setActiveModuleTab: (state, action: PayloadAction<number>) => {
      state.activeModuleTab = action.payload;
    },
    setCurrentPatientDraft: (state, action: PayloadAction<Partial<PatientInput> | null>) => {
      state.currentPatientDraft = action.payload;
    },
    addHistoryRecord: (state, action: PayloadAction<HistoryRecord>) => {
      state.historyList.unshift(action.payload);
      if (typeof window !== 'undefined') {
        localStorage.setItem('arpan_history_list', JSON.stringify(state.historyList));
      }
    },
    clearAnalysisResult: (state) => {
      state.analysisResult = null;
    },
  },
});

export const {
  setAnalysisResult,
  setActiveModuleTab,
  setCurrentPatientDraft,
  addHistoryRecord,
  clearAnalysisResult,
} = clinicalSlice.actions;

export default clinicalSlice.reducer;
