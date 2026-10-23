import CounsellingHistory, { pruneOldCounsellingHistory } from '@/models/CounsellingHistory';

export const INITIAL_COUNSELLING_SEEDS = [
  {
    counsellingId: 'CNS-9120',
    patientName: 'Robert Vance',
    age: 58,
    gender: 'Male',
    disease: 'Hypertension & Type 2 Diabetes',
    sbp: '148',
    dbp: '92',
    hba1c: '8.4',
    egfr: '58',
    sensationLoss: 'no',
    footGrade: 'grade_0',
    riskCount: 3,
    highRiskCount: 2,
    moderateRiskCount: 1,
    overallRiskLevel: 'HIGH RISK',
    color: '#FF4D6D',
    date: '2026-09-16 10:45 AM',
    analysedBy: 'Dr. Yashwant Dubey',
    riskFactors: [
      {
        id: 'heart_attack',
        title: 'Heart Attack (CAD / MI)',
        subtitle: '10-Yr Atherosclerotic Cardiovascular Risk',
        riskLevel: 'HIGH RISK',
        score: 74,
        color: '#FF4D6D',
        keyIndicators: ['BP: 148/92 mmHg (Stage 2 HTN)', 'HbA1c: 8.4% (Uncontrolled Glycemia)', 'Age > 50 with dual metabolic disorder'],
        clinicalGuidance: ['Initiate high-intensity Statin therapy if not contraindicated.', 'Target systolic BP < 130 mmHg and diastolic < 80 mmHg.'],
        patientAdvice: ['Walk at moderate pace for 30 mins, 5 days a week.', 'Reduce dietary sodium to under 2000mg/day.'],
        screeningSchedule: 'Annual Stress Echo / ECG, Lipid panel every 3 months.'
      },
      {
        id: 'stroke',
        title: 'Stroke (CVA / TIA)',
        subtitle: 'Cerebrovascular Event Probability',
        riskLevel: 'HIGH RISK',
        score: 68,
        color: '#FF4D6D',
        keyIndicators: ['Systolic BP > 140 mmHg persistent elevation', 'Microvascular burden from elevated HbA1c'],
        clinicalGuidance: ['Strict BP titration with ARB/ACEi + Calcium Channel Blocker.', 'Screen for carotid bruit / transient neurological deficits.'],
        patientAdvice: ['Memorize B.E. F.A.S.T. warning signs of stroke.', 'Avoid abrupt cessation of anti-hypertensive medication.'],
        screeningSchedule: 'Carotid Doppler if neurological symptoms or persistent SBP > 160.'
      },
      {
        id: 'kidney_failure',
        title: 'Kidney Disease (CKD / ESRD)',
        subtitle: 'Diabetic Nephropathy & eGFR Deterioration',
        riskLevel: 'MODERATE CAUTION',
        score: 52,
        color: '#FFB703',
        keyIndicators: ['eGFR: 58 mL/min/1.73m² (CKD Stage 3a)', 'Concomitant Diabetes + Hypertension'],
        clinicalGuidance: ['Consider SGLT2 inhibitor for proven renal protection.', 'Monitor serum Creatinine and Potassium every 3-6 months.'],
        patientAdvice: ['Maintain daily hydration (2-2.5 liters unless fluid restricted).', 'Strictly avoid OTC NSAIDs (Ibuprofen, Diclofenac).'],
        screeningSchedule: 'Urine Albumin-to-Creatinine Ratio (uACR) and eGFR every 3-6 months.'
      }
    ]
  },
  {
    counsellingId: 'CNS-7402',
    patientName: 'Sunita Sharma',
    age: 46,
    gender: 'Female',
    disease: 'Type 2 Diabetes Mellitus',
    sbp: '128',
    dbp: '82',
    hba1c: '7.6',
    egfr: '82',
    sensationLoss: 'no',
    footGrade: 'grade_0',
    riskCount: 1,
    highRiskCount: 0,
    moderateRiskCount: 1,
    overallRiskLevel: 'MODERATE CAUTION',
    color: '#FFB703',
    date: '2026-09-17 11:15 AM',
    analysedBy: 'Dr. Yashwant Dubey',
    riskFactors: [
      {
        id: 'retinopathy',
        title: 'Diabetic Retinopathy',
        subtitle: 'Microvascular Retinal Capillary Integrity',
        riskLevel: 'MODERATE CAUTION',
        score: 45,
        color: '#FFB703',
        keyIndicators: ['HbA1c: 7.6% above optimal 6.5-7.0% target', 'Diabetes duration > 4 years'],
        clinicalGuidance: ['Achieve steady glycemic reduction without rapid hypoglycemia.', 'Schedule comprehensive dilated fundus examination.'],
        patientAdvice: ['Report sudden floaters, flashes, or blurry vision immediately.', 'Keep blood sugar logs for review.'],
        screeningSchedule: 'Annual Dilated Retinal Exam by Ophthalmologist.'
      }
    ]
  }
];

export async function ensureDefaultCounsellingHistory() {
  try {
    const count = await CounsellingHistory.countDocuments();
    if (count === 0) {
      console.log('Seeding initial default counselling analysis history into MongoDB...');
      await CounsellingHistory.insertMany(INITIAL_COUNSELLING_SEEDS);
      console.log('Counselling history records seeded successfully.');
    }
    // Enforce 2000 record maximum retention on boot
    await pruneOldCounsellingHistory();
  } catch (err: any) {
    console.warn('Counselling history auto-seed encountered non-fatal error:', err.message);
  }
}
