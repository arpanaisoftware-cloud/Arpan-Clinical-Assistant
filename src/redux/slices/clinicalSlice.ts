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
  },
];

const loadSavedHistory = (): HistoryRecord[] => {
  if (typeof window === 'undefined') return INITIAL_HISTORY;
  try {
    const saved = localStorage.getItem('arpan_history_list');
    if (saved) return JSON.parse(saved);
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
