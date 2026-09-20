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
