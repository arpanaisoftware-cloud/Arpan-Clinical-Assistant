export interface MedicationInput {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  timing?: string;
}

export interface PatientInput {
  patientName: string;
  age: number | string;
  gender: 'Male' | 'Female' | 'Other' | string;
  weight?: number | string;
  allergies?: string;
  disease: string;
  medications: MedicationInput[];

  // Vitals
  bpSystolic?: number | string;
  bpDiastolic?: number | string;
  pulse?: number | string;
  bmi?: number | string;

  // Lab Values — Glycemic
  hba1c?: number | string;
  fastingGlucose?: number | string;

  // Lab Values — Renal & Electrolytes
  creatinine?: number | string;
  egfr?: number | string;
  sodiumNa?: number | string;
  potassiumK?: number | string;

  // Lab Values — Hepatic & Lipids
  sgptAlt?: number | string;
  totalCholesterol?: number | string;
  ldl?: number | string;

  // Diabetes Complications (checkboxes)
  hasRetinopathy?: boolean;
  hasNephropathy?: boolean;
  hasNeuropathy?: boolean;
  hasFootRisk?: boolean;

  // Clinical Complaints (multi-select)
  clinicalComplaints?: string[];

  // Comorbidities
  comorbidities?: string;
}

export interface DrugAlternativeOption {
  name: string;
  type: string;
  priceSavings: string;
  efficacy: string;
  manufacturer: string;
  notes: string;
}

export interface DrugInteractionItem {
  drug: string;
  severity: 'High' | 'Moderate' | 'Low' | string;
  effect: string;
}

export interface DrugDatabaseEntry {
  name: string;
  category: string;
  genericName: string;
  standardDosage: string;
  alternatives: DrugAlternativeOption[];
  contraindications: string[];
  interactions: DrugInteractionItem[];
}

export interface FlaggedAllergy {
  medication: string;
  allergyMatch: string;
  severity: string;
  message: string;
}

export interface FlaggedInteraction {
  drugA: string;
  drugB: string;
  severity: 'High' | 'Moderate' | 'Low' | string;
  effect: string;
  recommendation: string;
}

export interface AlternativeItem {
  prescribedMed: string;
  category: string;
  options: DrugAlternativeOption[];
}

export interface DosageItem {
  name: string;
  dose: string;
  timing: string;
}

export interface DosageTimeline {
  morning: DosageItem[];
  afternoon: DosageItem[];
  evening: DosageItem[];
  bedtime: DosageItem[];
}

// Drug → Indication + Patient Suitability (Section A — AI output)
export interface DrugIndicationItem {
  drugName: string;
  dosage: string;
  // Drug → Indication
  indication: string;                    // Why prescribed
  indicationStatus: 'Appropriate' | 'Questionable' | 'Inappropriate';
  // Drug → Patient Suitability
  renalSuitability: string;
  hepaticSuitability: string;
  ageConsideration: string;
  cardiovascularConsideration: string;
  cognitiveFunction?: string;
  sexualDysfunction?: string;
  overallSuitability: 'Safe' | 'Caution' | 'Avoid';
}

// Dose & Frequency analysis per drug
export interface DoseFrequencyAnalysisItem {
  drugName: string;
  prescribedDose: string;
  standardDose: string;
  frequency: string;
  foodTiming: string;
  renalDoseNote: string;
  isCorrect: boolean;
  notes: string;
}

// Drug-induced Adverse Effect Analysis (Section B)
export interface AdverseEffectAnalysisItem {
  complaint: string;
  aiReview: string;
  implicatedDrugs: string[];
  severity: 'High' | 'Moderate' | 'Low';
}

export interface AnalysisResult {
  patientInfo: PatientInput;
  medications: MedicationInput[];
  safetyScore: number;
  riskCategory: string;
  statusColor: string;
  flaggedAllergies: FlaggedAllergy[];
  flaggedInteractions: FlaggedInteraction[];
  alternativesList: AlternativeItem[];
  dosageTimeline: DosageTimeline;
  dietLifestyleDos: string[];
  dietLifestyleDonts: string[];
  aiClinicalOverview: string;

  timestamp: string;
  // New SOP-mandated outputs
  drugIndicationAnalysis?: DrugIndicationItem[];
  doseFrequencyAnalysis?: DoseFrequencyAnalysisItem[];
  adverseEffectAnalysis?: AdverseEffectAnalysisItem[];
}

export interface HistoryRecord {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  disease: string;
  medCount: number;
  safetyScore: number;
  risk: string;
  color: string;
  date: string;
  analysedBy?: string;
  analysisResult?: AnalysisResult;
  patientInput?: PatientInput;
}

export type UserRole = 'Doctor' | 'Staff';

export type ModulePermission =
  | 'Counselling Only'
  | 'Diets Only'
  | 'Counselling + Diets'
  | 'Full Access';

export interface StaffUser {
  id: string;
  name: string;
  staffId: string;
  department: string;
  role: UserRole;
  modulePermissions: ModulePermission;
  active: boolean;
  createdAt: string;
  password?: string;
  email?: string;
}

export interface PublicStaffItem {
  id: string;
  name: string;
  email: string;
}

export interface PublicStaffData {
  dr: PublicStaffItem[];
  staff: PublicStaffItem[];
}

export interface PublicStaffResponse {
  success: boolean;
  data: PublicStaffData;
}

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  staffId: string;
  role: UserRole;
  modulePermissions: ModulePermission;
  department: string;
}

export type RiskCategoryType =
  | 'heartAttack'
  | 'stroke'
  | 'retinopathy'
  | 'nephropathy'
  | 'neuropathy'
  | 'footRisk'
  | 'bleedingRisk'
  | 'giddinessRisk'
  | 'hypoglycaemiaRisk'
  | 'weightGainObesityRisk'
  | 'cardiovascular'
  | string;

export interface RiskAssessmentItem {
  id: RiskCategoryType;
  title: string;
  subtitle: string;
  riskLevel: 'OPTIMAL / LOW' | 'MODERATE CAUTION' | 'HIGH RISK';
  score: number;
  color: string;
  keyIndicators: string[];
  clinicalGuidance: string[];
  patientAdvice: string[];
  screeningSchedule: string;
}

export interface MealScheduleItem {
  time: string;
  mealName: string;
  portion: string;
  focus: string;
}

export interface DietPlanItem {
  id: string;
  name: string;
  diseaseCategory: string;
  calories: number;
  bmiCategory: string;
  macroBreakdown: {
    carbs: string;
    protein: string;
    fats: string;
    fiber: string;
  };
  electrolyteLimits: {
    sodium: string;
    potassium: string;
    phosphorus: string;
    calcium: string;
  };
  mealFrequency: {
    frequency: string;
    schedule: MealScheduleItem[];
  };
  recommendedFoods: string[];
  foodsToAvoid: string[];
}

export interface CounsellingHistoryRecord {
  id: string; // e.g. CNS-8421
  _id?: string;
  counsellingId: string;
  patientName: string;
  age: number | string;
  gender: string;
  disease: string;
  sbp?: number | string;
  dbp?: number | string;
  hba1c?: number | string;
  egfr?: number | string;
  sensationLoss?: string;
  footGrade?: string;
  riskFactors: RiskAssessmentItem[];
  highRiskCount?: number;
  moderateRiskCount?: number;
  riskCount?: number;
  overallRiskLevel?: string;
  color?: string;
  date: string;
  analysedBy?: string;
  createdBy?: string;
  createdAt?: string | Date;
}

export interface DietHistoryRecord {
  id: string; // e.g. DT-3819
  _id?: string;
  dietId: string;
  patientName: string;
  age: number | string;
  gender: string;
  disease: string;
  dietaryPreference: string;
  targetCalories: number;
  language: string;
  planName: string;
  summary: string;
  dietPlan: any;
  patientForm?: any;
  date: string;
  analysedBy?: string;
  createdBy?: string;
  createdAt?: string | Date;
}

