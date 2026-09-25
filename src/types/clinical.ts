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
  estimatedMonthlySavings: string;
  timestamp: string;
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
  passcode?: string;
  email?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  staffId: string;
  role: UserRole;
  modulePermissions: ModulePermission;
  department: string;
}

export type RiskCategoryType =
  | 'cardiovascular'
  | 'retinopathy'
  | 'nephropathy'
  | 'neuropathy'
  | 'footRisk';

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

