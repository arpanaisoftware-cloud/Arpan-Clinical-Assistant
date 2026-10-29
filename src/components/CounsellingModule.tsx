'use client';

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import * as Yup from 'yup';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Fade from '@mui/material/Fade';
import TablePagination from '@mui/material/TablePagination';
import { useTheme } from '@mui/material/styles';
import Favorite from '@mui/icons-material/Favorite';
import Psychology from '@mui/icons-material/Psychology';
import Visibility from '@mui/icons-material/Visibility';
import WaterDrop from '@mui/icons-material/WaterDrop';
import FlashOn from '@mui/icons-material/FlashOn';
import Pets from '@mui/icons-material/Pets';
import Print from '@mui/icons-material/Print';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Warning from '@mui/icons-material/Warning';
import Info from '@mui/icons-material/Info';
import MedicalServices from '@mui/icons-material/MedicalServices';
import Shield from '@mui/icons-material/Shield';
import Close from '@mui/icons-material/Close';
import Verified from '@mui/icons-material/Verified';
import LocalHospital from '@mui/icons-material/LocalHospital';
import Biotech from '@mui/icons-material/Biotech';
import ContentPaste from '@mui/icons-material/ContentPaste';
import FileUpload from '@mui/icons-material/FileUpload';
import History from '@mui/icons-material/History';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import Search from '@mui/icons-material/Search';
import TableRows from '@mui/icons-material/TableRows';
import ViewAgenda from '@mui/icons-material/ViewAgenda';
import SmartToy from '@mui/icons-material/SmartToy';
import Upload from '@mui/icons-material/Upload';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import Refresh from '@mui/icons-material/Refresh';
import Bolt from '@mui/icons-material/Bolt';
import Bloodtype from '@mui/icons-material/Bloodtype';
import AirlineSeatReclineNormal from '@mui/icons-material/AirlineSeatReclineNormal';
import Speed from '@mui/icons-material/Speed';
import MonitorWeight from '@mui/icons-material/MonitorWeight';
import { COUNSELLING_RISK_DATABASE } from '../mockData/clinicalModulesData';
import { RiskAssessmentItem, RiskCategoryType, HistoryRecord, CounsellingHistoryRecord, isSuperAdminUser } from '../types/clinical';
import confetti from 'canvas-confetti';
import { toast } from 'react-toastify';
import CounsellingAnalysisLoader from './CounsellingAnalysisLoader';
import CounsellingHistoryTable from './CounsellingHistoryTable';
import { useAppSelector } from '../redux/hooks';

// ─── Yup Validation Schema ────────────────────────────────────────────────────
const counsellingSchema = Yup.object({
  currPatientName: Yup.string().trim().required('Patient name is required'),
  currPatientAge: Yup.mixed()
    .test('required', 'Age is required', (v) => v !== '' && v !== null && v !== undefined)
    .test('positive', 'Enter a valid age', (v) => Number(v) > 0 && Number(v) < 130),
  currPatientGender: Yup.string().required('Gender is required'),
  currPatientDisease: Yup.string().trim().required('Diagnosis / condition is required'),
  sbp: Yup.mixed()
    .test('required', 'Systolic BP is required', (v) => v !== '' && v !== null && v !== undefined)
    .test('range', 'Enter a valid BP (60–300 mmHg)', (v) => Number(v) >= 60 && Number(v) <= 300),
  dbp: Yup.mixed()
    .test('required', 'Diastolic BP is required', (v) => v !== '' && v !== null && v !== undefined)
    .test('range', 'Enter a valid BP (40–180 mmHg)', (v) => Number(v) >= 40 && Number(v) <= 180),
  hba1c: Yup.mixed()
    .test('required', 'HbA1c is required', (v) => v !== '' && v !== null && v !== undefined)
    .test('range', 'Enter a valid HbA1c (3–20%)', (v) => Number(v) >= 3 && Number(v) <= 20),
  egfr: Yup.mixed()
    .test('required', 'eGFR is required', (v) => v !== '' && v !== null && v !== undefined)
    .test('range', 'Enter a valid eGFR (1–200)', (v) => Number(v) >= 1 && Number(v) <= 200),
});

type FormErrors = {
  currPatientName?: string;
  currPatientAge?: string;
  currPatientGender?: string;
  currPatientDisease?: string;
  sbp?: string;
  dbp?: string;
  hba1c?: string;
  egfr?: string;
};

type InputMode = 'manual' | 'prescription' | 'history';

interface CounsellingModuleProps {
  patientName?: string;
  patientAge?: number | string;
  patientDisease?: string;
}

export default function CounsellingModule({
  patientName = 'Robert Vance',
  patientAge = 58,
  patientDisease = 'Essential Hypertension, Type 2 Diabetes'
}: CounsellingModuleProps) {
  // 3 Modes Selection: Manual, Prescription Upload, From Analysed Data
  const [inputMode, setInputMode] = useState<InputMode>('manual');

  // Patient Profile Form State — start empty, show placeholders only
  const [currPatientName, setCurrPatientName] = useState<string>('');
  const [currPatientAge, setCurrPatientAge] = useState<number | string>('');
  const [currPatientGender, setCurrPatientGender] = useState<string>('');
  const [currPatientDisease, setCurrPatientDisease] = useState<string>('');

  // Custom patient parameters state — start empty
  const [sbp, setSbp] = useState<number | string>('');
  const [dbp, setDbp] = useState<number | string>('');
  const [hba1c, setHba1c] = useState<number | string>('');
  const [egfr, setEgfr] = useState<number | string>('');
  const [sensationLoss, setSensationLoss] = useState<string>('');
  const [footGrade, setFootGrade] = useState<string>('');

  // Separated Analysed History Patient (does NOT overwrite Manual Entry)
  interface CounsellingPatientProfile {
    name: string;
    age: number | string;
    gender: string;
    disease: string;
    sbp: number | string;
    dbp: number | string;
    hba1c: number | string;
    egfr: number | string;
    sensationLoss?: string;
    footGrade?: string;
  }
  const [historyPatient, setHistoryPatient] = useState<CounsellingPatientProfile | null>(null);

  // Active Analysed Patient Data for Care Sheet & Report
  const [counsellingPatient, setCounsellingPatient] = useState<CounsellingPatientProfile | null>(null);

  // Prescription Parsed Patient Data (does NOT overwrite Manual Entry)
  const [rxParsedPatient, setRxParsedPatient] = useState<CounsellingPatientProfile | null>(null);

  // Prescription Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [isParsingRx, setIsParsingRx] = useState<boolean>(false);
  const [rxParsed, setRxParsed] = useState<boolean>(false);
  const [rxProgress, setRxProgress] = useState<number>(0);

  // Redux: Active analysis & History records
  const authUser = useAppSelector((s: any) => s.auth?.currentUser || s.auth?.user);
  const isSuperAdmin = isSuperAdminUser(authUser);
  const activeAnalysis = useAppSelector((s: any) => s.clinical.analysisResult);
  const historyList: HistoryRecord[] = useAppSelector((s: any) => s.clinical.historyList) ?? [];
  const [historySearch, setHistorySearch] = useState<string>('');
  const [debouncedHistorySearch, setDebouncedHistorySearch] = useState<string>('');
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>('');
  const [historyView, setHistoryView] = useState<'cards' | 'table'>('table');

  // Paginated History Patient state (fetches full archive with 5, 10, 15, 20 per page)
  const [historyPatients, setHistoryPatients] = useState<HistoryRecord[]>(historyList);
  const [historyTotalRecords, setHistoryTotalRecords] = useState<number>(historyList.length);
  const [historyPage, setHistoryPage] = useState<number>(0);
  const [historyRowsPerPage, setHistoryRowsPerPage] = useState<number>(5);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedHistorySearch(historySearch.trim());
      setHistoryPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [historySearch]);

  const fetchHistoryPatients = useCallback(async (
    targetPage: number = historyPage,
    searchQuery: string = debouncedHistorySearch,
    currentLimit: number = historyRowsPerPage
  ) => {
    setHistoryLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('arpan_auth_token') : '';
      const apiPage = targetPage + 1;
      const params = new URLSearchParams({
        page: apiPage.toString(),
        limit: currentLimit.toString(),
      });
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/history?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setHistoryPatients(json.data);
          setHistoryTotalRecords(json.pagination?.totalRecords ?? json.data.length);
        }
      }
    } catch (err) {
      console.error('Error fetching patients for counselling:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [historyPage, debouncedHistorySearch, historyRowsPerPage]);

  useEffect(() => {
    fetchHistoryPatients(historyPage, debouncedHistorySearch, historyRowsPerPage);
  }, [historyPage, debouncedHistorySearch, historyRowsPerPage, fetchHistoryPatients]);

  const filteredHistory = historyPatients;

  // Dynamic Risk factors from API (defaults to 6 factors from database)
  const [riskFactors, setRiskFactors] = useState<RiskAssessmentItem[]>(COUNSELLING_RISK_DATABASE);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Print modal state
  const [printOpen, setPrintOpen] = useState<boolean>(false);
  const [counsellingRefreshKey, setCounsellingRefreshKey] = useState<number>(0);

  // Controls whether the risk section is visible (only after form submit)
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [activeAiProvider, setActiveAiProvider] = useState<'gemini' | 'deepseek'>('deepseek');
  const [counsellingAiProvider, setCounsellingAiProvider] = useState<string>('deepseek');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleAiChanged = (e: any) => {
        if (e.detail?.provider) {
          setActiveAiProvider(e.detail.provider);
          setCounsellingAiProvider(e.detail.provider);
        }
      };
      window.addEventListener('ai-provider-changed', handleAiChanged);
      fetch('/api/admin/ai-settings')
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.activeProvider) {
            setActiveAiProvider(d.activeProvider);
            setCounsellingAiProvider(d.activeProvider);
          }
        })
        .catch(() => { });
      return () => window.removeEventListener('ai-provider-changed', handleAiChanged);
    }
  }, []);

  // Field-level validation errors
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const executeAnalysis = async (formData: {
    currPatientName: string;
    currPatientAge: number | string;
    currPatientGender: string;
    currPatientDisease: string;
    sbp: number | string;
    dbp: number | string;
    hba1c: number | string;
    egfr: number | string;
    sensationLoss?: string;
    footGrade?: string;
  }, forcedProvider?: 'gemini' | 'deepseek') => {
    setIsAnalyzing(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('arpan_auth_token') : '';

      const res = await fetch('/api/counselling/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 401 && typeof window !== 'undefined') {
          localStorage.removeItem('arpan_auth_token');
          localStorage.removeItem('arpan_auth_user');
          window.dispatchEvent(
            new CustomEvent('session-terminated-by-other-device', {
              detail: {
                loggedOutByOtherDevice: !!errorData.loggedOutByOtherDevice,
                message: errorData.message || 'Authentication required to generate counselling analysis.',
              },
            })
          );
        }
        throw new Error(errorData.message || 'Failed to generate counselling report');
      }

      const json = await res.json();
      const updatedRiskFactors = (json.success && Array.isArray(json.data) && json.data.length > 0)
        ? json.data
        : riskFactors;

      if (forcedProvider) {
        setCounsellingAiProvider(forcedProvider);
      } else if (json.provider) {
        setCounsellingAiProvider(json.provider);
      } else if (json.source?.includes('deepseek')) {
        setCounsellingAiProvider('deepseek');
      } else if (json.source?.includes('gemini')) {
        setCounsellingAiProvider('gemini');
      } else {
        setCounsellingAiProvider(activeAiProvider);
      }

      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setRiskFactors(json.data);
      }

      setCounsellingPatient({
        name: formData.currPatientName,
        age: formData.currPatientAge,
        gender: formData.currPatientGender,
        disease: formData.currPatientDisease,
        sbp: formData.sbp,
        dbp: formData.dbp,
        hba1c: formData.hba1c,
        egfr: formData.egfr,
        sensationLoss: formData.sensationLoss,
        footGrade: formData.footGrade
      });

      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      setSubmitted(true);
      setActiveTab(0);
      toast.success('Patient Chronic Risk Counselling Report Generated Successfully!');

      // Persist to MongoDB archive via /api/counselling/history (auto prunes to latest 2000 records)
      try {
        await fetch('/api/counselling/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || ''}`,
          },
          body: JSON.stringify({
            patientName: formData.currPatientName,
            age: formData.currPatientAge,
            gender: formData.currPatientGender,
            disease: formData.currPatientDisease,
            sbp: formData.sbp,
            dbp: formData.dbp,
            hba1c: formData.hba1c,
            egfr: formData.egfr,
            sensationLoss: formData.sensationLoss,
            footGrade: formData.footGrade,
            riskFactors: updatedRiskFactors,
            analysedBy: authUser?.name || 'Dr. Yashwant Dubey',
          })
        });
        setCounsellingRefreshKey((prev) => prev + 1);
      } catch (saveErr) {
        console.warn('Failed to save counselling history to MongoDB:', saveErr);
      }

      setTimeout(() => {
        const el = document.getElementById('counselling-risk-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } catch (err: any) {
      console.error('Error generating counselling analysis:', err);
      toast.error(err.message || 'Failed to generate counselling analysis. Using baseline clinical guidelines.');
      // Keep fallback baseline
      setSubmitted(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load full counselling report from MongoDB history table
  const handleLoadCounsellingRecord = (record: CounsellingHistoryRecord) => {
    setCounsellingPatient({
      name: record.patientName,
      age: record.age,
      gender: record.gender,
      disease: record.disease,
      sbp: record.sbp || '',
      dbp: record.dbp || '',
      hba1c: record.hba1c || '',
      egfr: record.egfr || '',
      sensationLoss: record.sensationLoss || 'no',
      footGrade: record.footGrade || 'grade_0'
    });
    setCurrPatientName(record.patientName);
    setCurrPatientAge(record.age);
    setCurrPatientGender(record.gender);
    setCurrPatientDisease(record.disease);
    setSbp(record.sbp ? String(record.sbp) : '');
    setDbp(record.dbp ? String(record.dbp) : '');
    setHba1c(record.hba1c ? String(record.hba1c) : '');
    setEgfr(record.egfr ? String(record.egfr) : '');
    setSensationLoss(record.sensationLoss || 'no');
    setFootGrade(record.footGrade || 'grade_0');
    if (record.riskFactors && record.riskFactors.length > 0) {
      setRiskFactors(record.riskFactors);
      setCounsellingAiProvider((record as any).aiProvider || activeAiProvider);
    }
    setSubmitted(true);
    setActiveTab(0);
    toast.success(`Loaded chronic counselling report for: ${record.patientName}`);
    setTimeout(() => {
      const el = document.getElementById('counselling-risk-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  // Open printable report directly for a history record
  const handlePrintCounsellingRecord = (record: CounsellingHistoryRecord) => {
    setCounsellingPatient({
      name: record.patientName,
      age: record.age,
      gender: record.gender,
      disease: record.disease,
      sbp: record.sbp || '',
      dbp: record.dbp || '',
      hba1c: record.hba1c || '',
      egfr: record.egfr || '',
      sensationLoss: record.sensationLoss || 'no',
      footGrade: record.footGrade || 'grade_0'
    });
    if (record.riskFactors && record.riskFactors.length > 0) {
      setRiskFactors(record.riskFactors);
    }
    setPrintOpen(true);
  };

  const handleSubmitForm = async () => {
    setFormErrors({});
    try {
      await counsellingSchema.validate(
        { currPatientName, currPatientAge, currPatientGender, currPatientDisease, sbp, dbp, hba1c, egfr },
        { abortEarly: false }
      );
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const errs: FormErrors = {};
        err.inner.forEach((e) => { if (e.path) errs[e.path as keyof FormErrors] = e.message; });
        setFormErrors(errs);
        toast.error('Please fill in all required fields before generating the report.', {
          toastId: 'counselling-form-validation',
        });
        return;
      }
    }

    await executeAnalysis({
      currPatientName,
      currPatientAge,
      currPatientGender,
      currPatientDisease,
      sbp,
      dbp,
      hba1c,
      egfr,
      sensationLoss,
      footGrade
    });
  };


  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload JPEG, PNG, WebP, or PDF.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB.');
      return;
    }
    setUploadedFile(file);
    setRxParsed(false);
    if (file.type !== 'application/pdf') {
      setUploadedPreviewUrl(URL.createObjectURL(file));
    } else {
      setUploadedPreviewUrl(null);
    }
  };

  const handleParseRx = async () => {
    if (!uploadedFile) {
      toast.error('Please upload a prescription file first.');
      return;
    }
    setIsParsingRx(true);
    setRxProgress(10);
    const progressTimer = setInterval(() => {
      setRxProgress((prev) => {
        if (prev >= 94) return prev;
        const inc = Math.floor(Math.random() * 8) + 6;
        return Math.min(prev + inc, 94);
      });
    }, 280);

    const reader = new FileReader();
    reader.readAsDataURL(uploadedFile);
    reader.onload = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('arpan_auth_token') : '';
        const base64 = (reader.result as string).split(',')[1];
        const res = await fetch('/api/diet/parse-rx', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: uploadedFile.type,
          })
        });
        const json = await res.json();
        clearInterval(progressTimer);
        setRxProgress(100);
        if (!res.ok || !json.success) {
          toast.error(json.message || 'Failed to parse prescription.');
          setIsParsingRx(false);
          return;
        }
        const d = json.data;
        const p = d.patientInfo || d;
        const parsedName = p.patientName || 'Patient';
        const parsedAge = p.age ? Number(p.age) : 50;
        const parsedGender = p.gender || 'Male';
        const parsedDisease = p.disease || 'Hypertension, Type 2 Diabetes';
        const parsedSbp = p.bpSystolic ? Number(p.bpSystolic) : 140;
        const parsedDbp = p.bpDiastolic ? Number(p.bpDiastolic) : 90;
        const parsedHba1c = p.hba1c ? Number(p.hba1c) : 7.5;
        const parsedEgfr = p.egfr ? Number(p.egfr) : 65;

        setRxParsedPatient({
          name: parsedName,
          age: parsedAge,
          gender: parsedGender,
          disease: parsedDisease,
          sbp: parsedSbp,
          dbp: parsedDbp,
          hba1c: parsedHba1c,
          egfr: parsedEgfr,
          sensationLoss: sensationLoss || 'Mild Loss',
          footGrade: footGrade || 'Grade 0 (Intact Skin)'
        });
        setRxParsed(true);

        await executeAnalysis({
          currPatientName: parsedName,
          currPatientAge: parsedAge,
          currPatientGender: parsedGender,
          currPatientDisease: parsedDisease,
          sbp: parsedSbp,
          dbp: parsedDbp,
          hba1c: parsedHba1c,
          egfr: parsedEgfr,
          sensationLoss: sensationLoss || 'Mild Loss',
          footGrade: footGrade || 'Grade 0 (Intact Skin)'
        }, 'gemini');
      } catch (err: any) {
        clearInterval(progressTimer);
        toast.error(err.message || 'Error reading prescription.');
      } finally {
        setIsParsingRx(false);
      }
    };
    reader.onerror = () => {
      clearInterval(progressTimer);
      toast.error('Failed to read file.');
      setIsParsingRx(false);
    };
  };

  const loadPatientRecord = (record: HistoryRecord) => {
    const pi = record.patientInput || record.analysisResult?.patientInfo;
    if (!pi) {
      toast.error('No clinical patient details found in this record.');
      return;
    }
    setSelectedHistoryId(record.id);
    setHistoryPatient({
      name: record.patientName || pi.patientName || '',
      age: record.age || pi.age || '',
      gender: record.gender || pi.gender || 'Male',
      disease: record.disease || pi.disease || '',
      sbp: pi.bpSystolic || 140,
      dbp: pi.bpDiastolic || 90,
      hba1c: pi.hba1c || 7.2,
      egfr: pi.egfr || 70,
      sensationLoss: 'Mild Loss',
      footGrade: 'Grade 0 (Intact Skin)'
    });
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.5 } });
    toast.success(`Loaded patient: ${record.patientName} (${record.id})`);
  };

  const loadFromActiveAnalysis = () => {
    if (!activeAnalysis?.patientInfo) {
      toast.error('No active patient analysis on dashboard.');
      return;
    }
    const pi = activeAnalysis.patientInfo;
    setSelectedHistoryId('ACTIVE-SESSION');
    setHistoryPatient({
      name: pi.patientName || '',
      age: pi.age || '',
      gender: pi.gender || 'Male',
      disease: pi.disease || '',
      sbp: pi.bpSystolic || 140,
      dbp: pi.bpDiastolic || 90,
      hba1c: pi.hba1c || 7.2,
      egfr: pi.egfr || 70,
      sensationLoss: 'Mild Loss',
      footGrade: 'Grade 0 (Intact Skin)'
    });
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.5 } });
    toast.success(`Loaded active patient: ${pi.patientName}`);
  };

  const handleResetAll = () => {
    setCurrPatientName('');
    setCurrPatientAge('');
    setCurrPatientGender('');
    setCurrPatientDisease('');
    setSbp('');
    setDbp('');
    setHba1c('');
    setEgfr('');
    setSensationLoss('');
    setFootGrade('');
    setUploadedFile(null);
    setUploadedPreviewUrl(null);
    setIsParsingRx(false);
    setRxParsed(false);
    setRxProgress(0);
    setRxParsedPatient(null);
    setSelectedHistoryId('');
    setHistoryPatient(null);
    setCounsellingPatient(null);
    setHistorySearch('');
    setFormErrors({});
    setSubmitted(false);
    setRiskFactors(COUNSELLING_RISK_DATABASE);
    toast.info('Counselling module reset. You can now start fresh.');
  };

  const handleLoadDemo = () => {
    // Fill all fields with a realistic demo patient only — do not trigger AI analysis
    const demoData = {
      currPatientName: 'Robert Vance',
      currPatientAge: 58,
      currPatientGender: 'Male',
      currPatientDisease: 'Essential Hypertension, Type 2 Diabetes, Dyslipidaemia',
      sbp: 152,
      dbp: 92,
      hba1c: 8.4,
      egfr: 61,
      sensationLoss: 'Mild Loss',
      footGrade: 'Grade 1 (Superficial Ulcer)'
    };

    setCurrPatientName(demoData.currPatientName);
    setCurrPatientAge(demoData.currPatientAge);
    setCurrPatientGender(demoData.currPatientGender);
    setCurrPatientDisease(demoData.currPatientDisease);
    setSbp(demoData.sbp);
    setDbp(demoData.dbp);
    setHba1c(demoData.hba1c);
    setEgfr(demoData.egfr);
    setSensationLoss(demoData.sensationLoss);
    setFootGrade(demoData.footGrade);
    setFormErrors({});
    setSubmitted(false);

    toast.info('Demo patient profile loaded. Click "Generate Counselling Report" to analyze.', {
      toastId: 'demo-patient-loaded',
    });
  };

  const handlePrint = () => {
    confetti({ particleCount: 40, spread: 50 });
    setPrintOpen(true);
  };

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const modeConfigs = [
    {
      value: 'manual' as InputMode,
      label: '1. Manual Entry',
      icon: <ContentPaste fontSize="small" />,
      color: '#00C9A7',
      desc: 'Fill in patient health details & vitals by hand'
    },
    {
      value: 'prescription' as InputMode,
      label: '2. Prescription Upload',
      icon: <FileUpload fontSize="small" />,
      color: '#6C5CE7',
      desc: 'Upload Rx image / PDF for instant AI extraction'
    },
    {
      value: 'history' as InputMode,
      label: '3. From Analysed Data',
      icon: <History fontSize="small" />,
      color: '#FFB703',
      desc: 'Pick a patient from previously analysed cases'
    }
  ];

  return (
    <Box>
      <Card
        sx={{
          borderRadius: 1,
          boxShadow: isDark ? '0 12px 40px rgba(0, 0, 0, 0.25)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
          background: isDark
            ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 15, 29, 0.98) 100%)'
            : 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
          color: 'text.primary',
          border: isDark ? '1px solid rgba(108, 92, 231, 0.3)' : '1px solid #E2E8F0'
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          {/* Module Header Banner */}
          <Grid container spacing={2} alignItems="center" mb={2}>
            <Grid item xs={12} md={7}>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5, fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.125rem' } }}>
                Patient Chronic Risk Counselling &amp; Education Center
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Evidence-based complication risk stratification &amp; patient education across 10 major chronic &amp; clinical risk factors
              </Typography>
            </Grid>

            <Grid item xs={12} md={5} textAlign={{ xs: 'left', md: 'right' }}>
              {submitted && (
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} flexWrap="wrap">
                  <Tooltip title="Generate printable PDF/Paper Patient Education & Care Sheet" arrow placement="top">
                    <Button
                      variant="contained"
                      color="secondary"
                      size="large"
                      startIcon={<Print />}
                      onClick={handlePrint}
                      sx={{ borderRadius: 1.5, px: 3, py: 1.2, fontWeight: 800, width: { xs: '100%', sm: 'auto' } }}
                    >
                      Print Patient Care Sheet
                    </Button>
                  </Tooltip>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Refresh />}
                    onClick={handleResetAll}
                    sx={{
                      borderRadius: 1.5,
                      px: 2.2,
                      py: 1.1,
                      fontWeight: 800,
                      borderWidth: 1.5,
                      whiteSpace: 'nowrap',
                      '&:hover': { borderWidth: 1.5, bgcolor: 'rgba(255, 77, 109, 0.08)' }
                    }}
                  >
                    Reset
                  </Button>
                </Stack>
              )}
            </Grid>
          </Grid>

          {/* 3 Source Selection Cards */}
          <Grid container spacing={2} mb={3}>
            {modeConfigs.map((mode) => (
              <Grid item xs={12} sm={4} key={mode.value}>
                <Paper
                  variant="outlined"
                  onClick={() => setInputMode(mode.value)}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: inputMode === mode.value ? `2px solid ${mode.color}` : isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E2E8F0',
                    bgcolor: inputMode === mode.value ? `${mode.color}14` : isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF',
                    transition: 'all 0.2s ease',
                    transform: inputMode === mode.value ? 'translateY(-2px)' : 'none',
                    boxShadow: inputMode === mode.value ? `0 8px 24px ${mode.color}25` : 'none',
                    '&:hover': { border: `2px solid ${mode.color}`, bgcolor: `${mode.color}0A` }
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        color: mode.color,
                        display: 'flex',
                        p: 1.1,
                        bgcolor: `${mode.color}18`,
                        borderRadius: 1.5
                      }}
                    >
                      {mode.icon}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 800,
                          color: inputMode === mode.value ? mode.color : 'text.primary',
                          fontSize: '0.9rem'
                        }}
                      >
                        {mode.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.74rem' }}>
                        {mode.desc}
                      </Typography>
                    </Box>
                    {inputMode === mode.value && (
                      <CheckCircle sx={{ color: mode.color, fontSize: 20, flexShrink: 0 }} />
                    )}
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* 1. MANUAL ENTRY */}
          {inputMode === 'manual' && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                mb: 3.5,
                borderRadius: 1,
                background: isDark
                  ? 'linear-gradient(135deg, rgba(108, 92, 231, 0.08) 0%, rgba(0, 201, 167, 0.06) 100%)'
                  : 'linear-gradient(135deg, rgba(108, 92, 231, 0.04) 0%, rgba(0, 201, 167, 0.03) 100%)',
                border: isDark ? '1px solid rgba(108, 92, 231, 0.35)' : '1px solid #CBD5E1',
                boxShadow: isDark ? '0 12px 32px rgba(108, 92, 231, 0.1)' : '0 4px 16px rgba(0, 0, 0, 0.04)'
              }}
            >
              {/* Header Badge & Title */}
              <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" mb={2.5} gap={1.5}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 1.5,
                      background: 'linear-gradient(135deg, #6C5CE7 0%, #00C9A7 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF',
                      boxShadow: '0 4px 14px rgba(108, 92, 231, 0.35)',
                      flexShrink: 0
                    }}
                  >
                    <MedicalServices sx={{ fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.01em', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                      Patient Intake &amp; Clinical Vitals Risk Calculator
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                      Integrated Demographics, Diagnosis &amp; Diagnostic Vitals Calculator
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    startIcon={<Biotech />}
                    onClick={handleLoadDemo}
                    sx={{ borderStyle: 'dashed', fontWeight: 700, borderRadius: 1 }}
                  >
                    Load Demo Patient
                  </Button>
                  {/* <Chip
                icon={<Verified sx={{ fontSize: '14px !important', color: '#FFF !important' }} />}
                label="UNIFIED CLINICAL INTAKE"
                size="small"
                color="secondary"
                sx={{ fontWeight: 800, fontSize: '0.65rem', px: 1, height: 26 }}
              /> */}
                </Stack>
              </Stack>

              {/* Section 1: Demographics & Diagnosis */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 1,
                  bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0'
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#00C9A7', display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5, letterSpacing: 0.5 }}>
                  <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#00C9A7' }} />
                  1. PATIENT DEMOGRAPHICS & PRIMARY DIAGNOSIS
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Patient Full Name *"
                      placeholder="e.g. Robert Vance"
                      value={currPatientName}
                      onChange={(e) => setCurrPatientName(e.target.value)}
                      error={!!formErrors.currPatientName}
                      helperText={formErrors.currPatientName}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Age (Years) *"
                      type="number"
                      placeholder="e.g. 58"
                      value={currPatientAge}
                      onChange={(e) => setCurrPatientAge(e.target.value)}
                      error={!!formErrors.currPatientAge}
                      helperText={formErrors.currPatientAge}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <TextField
                      fullWidth
                      select
                      size="small"
                      label="Gender *"
                      value={currPatientGender}
                      onChange={(e) => setCurrPatientGender(e.target.value)}
                      SelectProps={{ displayEmpty: true }}
                      InputLabelProps={{ shrink: true }}
                      error={!!formErrors.currPatientGender}
                      helperText={formErrors.currPatientGender}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    >
                      <MenuItem value=""><em>Select Patient Gender</em></MenuItem>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Clinical Condition / Diagnosis *"
                      placeholder="e.g. Essential Hypertension, Type 2 Diabetes"
                      value={currPatientDisease}
                      onChange={(e) => setCurrPatientDisease(e.target.value)}
                      error={!!formErrors.currPatientDisease}
                      helperText={formErrors.currPatientDisease}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Section 2: Clinical Vitals & Risk Score Input Parameters */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0'
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#6C5CE7', display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5, letterSpacing: 0.5 }}>
                  <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#6C5CE7' }} />
                  2. CLINICAL VITALS & RISK SCORE INPUT PARAMETERS
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4} md={2}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Systolic BP (mmHg) *"
                      placeholder="e.g. 142"
                      value={sbp}
                      onChange={(e) => setSbp(e.target.value)}
                      error={!!formErrors.sbp}
                      helperText={formErrors.sbp}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Diastolic BP (mmHg) *"
                      placeholder="e.g. 92"
                      value={dbp}
                      onChange={(e) => setDbp(e.target.value)}
                      error={!!formErrors.dbp}
                      helperText={formErrors.dbp}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      inputProps={{ step: 0.1 }}
                      label="HbA1c (%) *"
                      placeholder="e.g. 7.8"
                      value={hba1c}
                      onChange={(e) => setHba1c(e.target.value)}
                      error={!!formErrors.hba1c}
                      helperText={formErrors.hba1c}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="eGFR (mL/min) *"
                      placeholder="e.g. 68"
                      value={egfr}
                      onChange={(e) => setEgfr(e.target.value)}
                      error={!!formErrors.egfr}
                      helperText={formErrors.egfr}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      select
                      size="small"
                      label="Monofilament Sensation"
                      value={sensationLoss}
                      onChange={(e) => setSensationLoss(e.target.value)}
                      SelectProps={{ displayEmpty: true }}
                      InputLabelProps={{ shrink: true }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    >
                      <MenuItem value=""><em>Select Monofilament Sensation Level</em></MenuItem>
                      <MenuItem value="Normal">Normal (10/10 points)</MenuItem>
                      <MenuItem value="Mild Loss">Mild Loss (7-9 points)</MenuItem>
                      <MenuItem value="Severe Loss">Severe Numbness (&lt;6 points)</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      select
                      size="small"
                      label="Wagner Foot Grade"
                      value={footGrade}
                      onChange={(e) => setFootGrade(e.target.value)}
                      SelectProps={{ displayEmpty: true }}
                      InputLabelProps={{ shrink: true }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                    >
                      <MenuItem value=""><em>Select Wagner Foot Grade</em></MenuItem>
                      <MenuItem value="Grade 0 (Intact Skin)">Grade 0 (Intact Skin)</MenuItem>
                      <MenuItem value="Grade 1 (Superficial Ulcer)">Grade 1 (Superficial Ulcer)</MenuItem>
                      <MenuItem value="Grade 2 (Deep Ulcer)">Grade 2 (Deep Ulcer)</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </Paper>

              {/* Submit Button */}
              <Box sx={{ mt: 2.5, textAlign: 'right' }}>
                <Button
                  variant="contained"
                  color={activeAiProvider === 'deepseek' ? 'secondary' : 'primary'}
                  size="large"
                  disabled={isAnalyzing}
                  startIcon={isAnalyzing ? <CircularProgress size={20} color="inherit" /> : (activeAiProvider === 'deepseek' ? <Psychology /> : <Shield />)}
                  onClick={handleSubmitForm}
                  sx={{
                    borderRadius: 1,
                    px: 4,
                    py: 1.2,
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    bgcolor: activeAiProvider === 'deepseek' ? '#4F46E5' : undefined,
                    '&:hover': {
                      bgcolor: activeAiProvider === 'deepseek' ? '#4338CA' : undefined,
                    }
                  }}
                >
                  {isAnalyzing
                    ? (isSuperAdmin
                        ? `Generating with ${activeAiProvider === 'deepseek' ? 'DeepSeek AI' : 'Gemini AI'}...`
                        : 'Generating Clinical Counselling Analysis...')
                    : (isSuperAdmin
                        ? (activeAiProvider === 'deepseek' ? 'Generate Counselling with DeepSeek AI' : 'Generate Counselling with Gemini AI')
                        : 'Generate Clinical Counselling Report')}
                </Button>
              </Box>
            </Paper>
          )}

          {/* 2. PRESCRIPTION UPLOAD */}
          {inputMode === 'prescription' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 2,
                mb: 3,
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF',
                borderColor: 'rgba(108, 92, 231, 0.3)'
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <FileUpload sx={{ color: '#6C5CE7', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#6C5CE7' }}>
                  Upload Prescription — AI Vision Extracts Vitals &amp; Generates Chronic Risk Advisory
                </Typography>
              </Stack>

              <Alert severity="info" sx={{ mb: 2, borderRadius: 1.5 }} icon={<SmartToy fontSize="small" />}>
                Take a clear picture of your doctor&apos;s prescription or upload a PDF. Our AI vision instantly reads the diagnosis, medications, and clinical vitals to build your comprehensive 6-point chronic risk evaluation.
              </Alert>

              <Box
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleFileSelect({ target: { files: [file] } } as any);
                }}
                sx={{
                  border: `2px dashed ${uploadedFile ? '#6C5CE7' : isDark ? 'rgba(108, 92, 231, 0.4)' : '#CBD5E1'}`,
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: uploadedFile ? 'rgba(108, 92, 231, 0.06)' : isDark ? 'rgba(255, 255, 255, 0.02)' : '#FAFAFA',
                  transition: 'all 0.2s ease',
                  '&:hover': { border: '2px dashed #6C5CE7', bgcolor: 'rgba(108, 92, 231, 0.06)' },
                  mb: 2
                }}
              >
                <input ref={fileInputRef} type="file" hidden accept="image/*,.pdf" onChange={handleFileSelect} />
                {uploadedFile ? (
                  <Stack alignItems="center" spacing={1}>
                    {uploadedPreviewUrl && (
                      <Box
                        component="img"
                        src={uploadedPreviewUrl}
                        alt="Prescription Preview"
                        sx={{ maxHeight: 220, maxWidth: '100%', borderRadius: 1.5, objectFit: 'contain', mb: 1 }}
                      />
                    )}
                    {!uploadedPreviewUrl && <LocalHospital sx={{ fontSize: 52, color: '#6C5CE7' }} />}
                    <Chip label={uploadedFile.name} color="secondary" size="small" sx={{ fontWeight: 700, maxWidth: '80%' }} />
                    <Typography variant="caption" color="text.secondary">
                      {(uploadedFile.size / 1024).toFixed(1)} KB · Ready to scan
                    </Typography>
                    {rxParsed && (
                      <Chip
                        icon={<CheckCircleOutline />}
                        label="Successfully scanned & counselling generated"
                        color="success"
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    )}
                  </Stack>
                ) : (
                  <Stack alignItems="center" spacing={1}>
                    <Upload sx={{ fontSize: 48, color: isDark ? 'rgba(108, 92, 231, 0.6)' : '#94A3B8' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      Click or drag prescription photo here
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Supports JPG, PNG, PDF (Up to 10MB)
                    </Typography>
                  </Stack>
                )}
              </Box>

              {/* Action Button: Extract & Generate Counselling Report */}
              <Box sx={{ textAlign: 'center', my: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleParseRx}
                  disabled={!uploadedFile || isParsingRx}
                  startIcon={isParsingRx ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
                  sx={{
                    borderRadius: '50px',
                    px: { xs: 4, sm: 6 },
                    py: 1.6,
                    fontSize: { xs: '0.95rem', sm: '1.05rem' },
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #00C9A7 0%, #6C5CE7 100%)',
                    boxShadow: '0 8px 32px rgba(0, 201, 167, 0.35)',
                    '&:hover': { background: 'linear-gradient(135deg, #00B395 0%, #5a4bd1 100%)' },
                    '&:disabled': { background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)' }
                  }}
                >
                  {isParsingRx ? `Analysing Prescription... ${rxProgress}%` : isAnalyzing ? 'Generating Report...' : 'Extract & Generate Counselling Report'}
                </Button>
                {!uploadedFile && (
                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    * Please upload a prescription image or PDF to start AI extraction
                  </Typography>
                )}
              </Box>

              {/* Progress Bar during Analysis */}
              {isParsingRx && (
                <Box sx={{ width: '100%', maxWidth: 640, mx: 'auto', mt: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#6C5CE7' }}>
                      {rxProgress < 40
                        ? 'Reading prescription text & medications...'
                        : rxProgress < 75
                          ? 'Extracting clinical vitals (BP, HbA1c, eGFR)...'
                          : 'Generating personalized 10-point chronic risk evaluation...'}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#6C5CE7' }}>
                      {rxProgress}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={rxProgress}
                    sx={{
                      height: 9,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(108, 92, 231, 0.2)' : '#EDE9FE',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 2,
                        background: 'linear-gradient(90deg, #6C5CE7 0%, #00C9A7 100%)'
                      }
                    }}
                  />
                </Box>
              )}

              {/* Extracted Details Summary */}
              {rxParsed && rxParsedPatient && (
                <Fade in>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      mt: 2,
                      borderRadius: 2,
                      borderColor: '#00C9A7',
                      bgcolor: isDark ? 'rgba(0, 201, 167, 0.08)' : 'rgba(0, 201, 167, 0.04)'
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <CheckCircle sx={{ color: '#00C9A7', fontSize: 20 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00C9A7' }}>
                        Extracted Prescription Vitals: {rxParsedPatient.name} ({rxParsedPatient.age}Y, {rxParsedPatient.gender})
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Diagnosis: {rxParsedPatient.disease}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                      {rxParsedPatient.sbp && rxParsedPatient.dbp && (
                        <Chip label={`BP: ${rxParsedPatient.sbp}/${rxParsedPatient.dbp} mmHg`} size="small" sx={{ fontWeight: 700 }} />
                      )}
                      {rxParsedPatient.hba1c && (
                        <Chip label={`HbA1c: ${rxParsedPatient.hba1c}%`} size="small" sx={{ fontWeight: 700 }} />
                      )}
                      {rxParsedPatient.egfr && (
                        <Chip label={`eGFR: ${rxParsedPatient.egfr} mL/min`} size="small" sx={{ fontWeight: 700 }} />
                      )}
                    </Stack>
                  </Paper>
                </Fade>
              )}
            </Paper>
          )}

          {/* 3. FROM ANALYSED DATA */}
          {inputMode === 'history' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 2,
                mb: 3,
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF',
                borderColor: 'rgba(255, 183, 3, 0.3)'
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                mb={2}
                gap={1.5}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <History sx={{ color: '#FFB703', fontSize: 22 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFB703' }}>
                      Select an Already Analysed Patient
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {historyTotalRecords} patient record{historyTotalRecords === 1 ? '' : 's'} available &bull; Page {historyPage + 1} of {Math.max(1, Math.ceil(historyTotalRecords / historyRowsPerPage))}
                    </Typography>
                  </Box>
                </Stack>

                {/* View Switcher: Table vs Cards */}
                <ToggleButtonGroup
                  size="small"
                  value={historyView}
                  exclusive
                  onChange={(_, val) => val && setHistoryView(val)}
                  sx={{ bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9', borderRadius: 2 }}
                >
                  <ToggleButton value="table" sx={{ fontWeight: 700, px: 1.8, fontSize: '0.75rem' }}>
                    <TableRows sx={{ fontSize: 16, mr: 0.8 }} /> Table
                  </ToggleButton>
                  <ToggleButton value="cards" sx={{ fontWeight: 700, px: 1.8, fontSize: '0.75rem' }}>
                    <ViewAgenda sx={{ fontSize: 16, mr: 0.8 }} /> Cards
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>

              {/* Option A: Active Session Patient Card (if available) */}
              {activeAnalysis?.patientInfo && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 2.5,
                    borderRadius: 2,
                    borderColor: '#00C9A7',
                    bgcolor: isDark ? 'rgba(0, 201, 167, 0.08)' : 'rgba(0, 201, 167, 0.04)'
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={1.5}
                  >
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <Bolt sx={{ color: '#00C9A7' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#00C9A7' }}>
                          Currently Active Patient on Screen
                        </Typography>
                        <Chip label="Current Session" color="success" size="small" sx={{ fontWeight: 800, height: 20 }} />
                      </Stack>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {activeAnalysis.patientInfo.patientName} ({activeAnalysis.patientInfo.age}Y,{' '}
                        {activeAnalysis.patientInfo.gender}) — {activeAnalysis.patientInfo.disease}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Safety Score: {activeAnalysis.safetyScore}/100 · {activeAnalysis.medications?.length || 0} Prescribed Medicines
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AutoAwesome />}
                      onClick={loadFromActiveAnalysis}
                      sx={{
                        borderRadius: 1.5,
                        fontWeight: 800,
                        whiteSpace: 'nowrap',
                        bgcolor: '#00C9A7',
                        '&:hover': { bgcolor: '#00967D' }
                      }}
                    >
                      Select Active Patient
                    </Button>
                  </Stack>
                </Paper>
              )}

              {/* Search Filter for Analysed History */}
              <Stack direction="row" spacing={1.5} mb={2}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search patient by name, Rx ID, or health condition..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Stack>

              {filteredHistory.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 1.5 }}>
                  {historyList.length === 0
                    ? 'No previous prescriptions found. Analyze one on the dashboard or enter details manually.'
                    : 'No patients matched your search.'}
                </Alert>
              ) : historyView === 'cards' ? (
                <Grid container spacing={1.5} mb={2}>
                  {filteredHistory.map((rec) => {
                    const isSelected = selectedHistoryId === rec.id;
                    return (
                      <Grid item xs={12} sm={6} md={4} key={rec.id}>
                        <Paper
                          variant="outlined"
                          onClick={() => loadPatientRecord(rec)}
                          sx={{
                            p: 1.8,
                            borderRadius: 2,
                            cursor: 'pointer',
                            borderColor: isSelected ? rec.color || '#FFB703' : isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
                            borderWidth: isSelected ? 2 : 1,
                            bgcolor: isSelected
                              ? isDark
                                ? 'rgba(255, 183, 3, 0.12)'
                                : 'rgba(255, 183, 3, 0.08)'
                              : isDark
                                ? 'rgba(255, 255, 255, 0.02)'
                                : '#FFFFFF',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: rec.color || '#FFB703',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                            }
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                            <Chip
                              label={rec.id}
                              size="small"
                              sx={{ fontWeight: 800, bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9', fontSize: '0.72rem' }}
                            />
                            <Chip
                              label={`${rec.safetyScore}/100`}
                              size="small"
                              sx={{
                                bgcolor: rec.color || '#00C9A7',
                                color: '#FFF',
                                fontWeight: 800,
                                fontSize: '0.72rem'
                              }}
                            />
                          </Stack>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.2 }}>
                            {rec.patientName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {rec.age}Y · {rec.gender} · {rec.date}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: isDark ? '#94A3B8' : '#475569',
                              display: 'block',
                              fontWeight: 600,
                              mt: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {rec.disease}
                          </Typography>
                          {isSelected && (
                            <Chip
                              icon={<CheckCircle sx={{ fontSize: '14px !important' }} />}
                              label="Selected"
                              size="small"
                              color="success"
                              sx={{ fontWeight: 800, mt: 1, width: '100%' }}
                            />
                          )}
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    mb: 2,
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
                    overflowX: 'auto'
                  }}
                >
                  <Table size="small">
                    <TableHead sx={{ bgcolor: isDark ? 'rgba(255, 255, 0.05)' : '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, fontSize: '0.78rem' }}>Rx ID &amp; Date</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: '0.78rem' }}>Patient Details</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: '0.78rem' }}>Medical Condition</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, fontSize: '0.78rem' }}>Safety Score</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, fontSize: '0.78rem' }}>Medicines</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.78rem' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredHistory.map((rec) => {
                        const isSelected = selectedHistoryId === rec.id;
                        return (
                          <TableRow
                            key={rec.id}
                            hover
                            onClick={() => loadPatientRecord(rec)}
                            sx={{
                              cursor: 'pointer',
                              bgcolor: isSelected
                                ? isDark
                                  ? 'rgba(255, 183, 3, 0.12) !important'
                                  : 'rgba(255, 183, 3, 0.08) !important'
                                : 'inherit',
                              '&:hover': {
                                bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F1F5F9'
                              }
                            }}
                          >
                            <TableCell>
                              <Chip
                                label={rec.id}
                                size="small"
                                sx={{
                                  fontWeight: 800,
                                  fontSize: '0.72rem',
                                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0'
                                }}
                              />
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.3 }}>
                                {rec.date}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.85rem' }}>
                                {rec.patientName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {rec.age}Y · {rec.gender}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ maxWidth: 220 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: '0.82rem',
                                  color: isDark ? '#E2E8F0' : '#334155',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {rec.disease}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={`${rec.safetyScore}/100`}
                                size="small"
                                sx={{
                                  bgcolor: rec.color || '#00C9A7',
                                  color: '#FFF',
                                  fontWeight: 800,
                                  fontSize: '0.72rem'
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={`${rec.medCount || 0} Meds`}
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              {isSelected ? (
                                <Chip
                                  icon={<CheckCircle sx={{ fontSize: '14px !important' }} />}
                                  label="Selected"
                                  color="success"
                                  size="small"
                                  sx={{ fontWeight: 800 }}
                                />
                              ) : (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="warning"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    loadPatientRecord(rec);
                                  }}
                                  sx={{
                                    borderRadius: 1.5,
                                    fontWeight: 700,
                                    fontSize: '0.72rem',
                                    textTransform: 'none',
                                    px: 1.5
                                  }}
                                >
                                  Select
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Pagination Controls with selectable per-page (5, 10, 15, 20) */}
              <TablePagination
                component="div"
                count={historyTotalRecords}
                page={historyPage}
                onPageChange={(_, newPage) => setHistoryPage(newPage)}
                rowsPerPage={historyRowsPerPage}
                onRowsPerPageChange={(e) => {
                  setHistoryRowsPerPage(parseInt(e.target.value, 10));
                  setHistoryPage(0);
                }}
                rowsPerPageOptions={[5, 10, 15, 20]}
                labelRowsPerPage="Per page:"
                sx={{
                  mt: 1,
                  borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0',
                  '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }
                }}
              />

              {/* Loaded Patient Confirmation & Generate Counselling Button */}
              {selectedHistoryId && historyPatient && (
                <Fade in>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2.5, md: 3 },
                      mt: 2.5,
                      borderRadius: 2,
                      background: isDark
                        ? 'linear-gradient(135deg, rgba(0, 201, 167, 0.12) 0%, rgba(108, 92, 231, 0.08) 100%)'
                        : 'linear-gradient(135deg, rgba(0, 201, 167, 0.06) 0%, rgba(108, 92, 231, 0.04) 100%)',
                      border: '1.5px solid',
                      borderColor: isDark ? 'rgba(0, 201, 167, 0.4)' : '#00C9A7',
                      boxShadow: '0 6px 20px rgba(0, 201, 167, 0.08)'
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                      flexWrap="wrap"
                      gap={1}
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            bgcolor: '#00C9A7',
                            color: '#FFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0, 201, 167, 0.4)'
                          }}
                        >
                          <CheckCircle sx={{ fontSize: 18 }} />
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 900,
                            color: '#00C9A7',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            fontSize: '0.76rem'
                          }}
                        >
                          Loaded Patient for Counselling
                        </Typography>
                        <Chip
                          label="Ready for Risk Analysis"
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            height: 22,
                            bgcolor: isDark ? 'rgba(0, 201, 167, 0.18)' : 'rgba(0, 201, 167, 0.12)',
                            color: isDark ? '#00E0BA' : '#00967D'
                          }}
                        />
                      </Stack>

                      <Button
                        size="small"
                        variant="text"
                        onClick={() => {
                          setSelectedHistoryId('');
                          setHistoryPatient(null);
                        }}
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          '&:hover': { color: '#FF4D6D', bgcolor: 'rgba(255, 77, 109, 0.08)' }
                        }}
                      >
                        ✕ Change Patient
                      </Button>
                    </Stack>

                    <Box sx={{ mb: 2 }}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        spacing={1.5}
                        mb={1}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                          {historyPatient.name}
                        </Typography>
                        <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap">
                          <Chip
                            label={`${historyPatient.age} Years`}
                            size="small"
                            sx={{ fontWeight: 800, height: 24, fontSize: '0.75rem' }}
                          />
                          <Chip
                            label={historyPatient.gender}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 700, height: 24, fontSize: '0.75rem' }}
                          />
                          <Chip
                            label={historyPatient.disease}
                            size="small"
                            color="secondary"
                            sx={{ fontWeight: 800, height: 24, fontSize: '0.75rem' }}
                          />
                        </Stack>
                      </Stack>

                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5} mt={1}>
                        {historyPatient.sbp && historyPatient.dbp && (
                          <Chip label={`BP: ${historyPatient.sbp}/${historyPatient.dbp} mmHg`} size="small" sx={{ fontWeight: 700, bgcolor: 'rgba(108, 92, 231, 0.12)' }} />
                        )}
                        {historyPatient.hba1c && (
                          <Chip label={`HbA1c: ${historyPatient.hba1c}%`} size="small" sx={{ fontWeight: 700, bgcolor: 'rgba(255, 183, 3, 0.12)' }} />
                        )}
                        {historyPatient.egfr && (
                          <Chip label={`eGFR: ${historyPatient.egfr} mL/min`} size="small" sx={{ fontWeight: 700, bgcolor: 'rgba(0, 201, 167, 0.12)' }} />
                        )}
                      </Stack>
                    </Box>

                    <Box sx={{ textAlign: 'center', mt: 2.5 }}>
                      <Button
                        variant="contained"
                        size="large"
                        disabled={isAnalyzing || !historyPatient}
                        onClick={() =>
                          executeAnalysis({
                            currPatientName: historyPatient.name,
                            currPatientAge: historyPatient.age,
                            currPatientGender: historyPatient.gender,
                            currPatientDisease: historyPatient.disease,
                            sbp: historyPatient.sbp || 140,
                            dbp: historyPatient.dbp || 90,
                            hba1c: historyPatient.hba1c || 7.2,
                            egfr: historyPatient.egfr || 70,
                            sensationLoss: historyPatient.sensationLoss || 'Mild Loss',
                            footGrade: historyPatient.footGrade || 'Grade 0 (Intact Skin)'
                          })
                        }
                        startIcon={isAnalyzing ? <CircularProgress size={20} color="inherit" /> : (activeAiProvider === 'deepseek' ? <Psychology /> : <Shield />)}
                        sx={{
                          borderRadius: '50px',
                          px: { xs: 4, sm: 6 },
                          py: 1.5,
                          fontSize: { xs: '0.95rem', sm: '1.05rem' },
                          fontWeight: 900,
                          background: activeAiProvider === 'deepseek'
                            ? 'linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)'
                            : 'linear-gradient(135deg, #00C9A7 0%, #6C5CE7 100%)',
                          boxShadow: activeAiProvider === 'deepseek'
                            ? '0 8px 32px rgba(79, 70, 229, 0.35)'
                            : '0 8px 32px rgba(0, 201, 167, 0.35)',
                          '&:hover': {
                            background: activeAiProvider === 'deepseek'
                              ? 'linear-gradient(135deg, #4338CA 0%, #1D4ED8 100%)'
                              : 'linear-gradient(135deg, #00B395 0%, #5a4bd1 100%)'
                          }
                        }}
                      >
                        {isAnalyzing
                          ? (isSuperAdmin
                              ? `Generating with ${activeAiProvider === 'deepseek' ? 'DeepSeek AI' : 'Gemini AI'}...`
                              : 'Generating Clinical Counselling Analysis...')
                          : (isSuperAdmin
                              ? (activeAiProvider === 'deepseek' ? 'Generate Counselling with DeepSeek AI' : 'Generate Counselling with Gemini AI')
                              : 'Generate Clinical Counselling Report')}
                      </Button>
                    </Box>
                  </Paper>
                </Fade>
              )}
            </Paper>
          )}

          {/* 6 Risk Category Tabs — shown only after form is submitted */}
          {!submitted && (
            <Paper
              variant="outlined"
              sx={{
                p: 4,
                borderRadius: 1,
                textAlign: 'center',
                mt: 2,
                bgcolor: isDark ? 'rgba(108, 92, 231, 0.05)' : 'rgba(108, 92, 231, 0.03)',
                borderColor: isDark ? 'rgba(108, 92, 231, 0.2)' : '#E2E8F0',
                borderStyle: 'dashed'
              }}
            >
              <Shield sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>
                Counselling Report Not Generated Yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fill in the patient details and vitals above, then click <strong>Generate Counselling Report</strong> to view all 10 risk category assessments.
              </Typography>
            </Paper>
          )}

          {submitted && (
            <Box id="counselling-risk-section">
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5} flexWrap="wrap" gap={1}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  10-Factor Chronic Risk Advisory
                </Typography>
                {isSuperAdmin ? (
                  counsellingAiProvider === 'deepseek' ? (
                    <Chip
                      icon={<Psychology sx={{ fontSize: '15px !important', color: '#FFF !important' }} />}
                      label="DeepSeek AI (DeepSeek-V3)"
                      size="small"
                      sx={{ bgcolor: '#4F46E5', color: '#FFF', fontWeight: 800, fontSize: '0.74rem' }}
                    />
                  ) : (
                    <Chip
                      icon={<AutoAwesome sx={{ fontSize: '14px !important', color: '#FFF !important' }} />}
                      label={counsellingAiProvider === 'gemini' && inputMode === 'prescription' ? "Gemini Vision OCR" : "Google Gemini (3.8 Flash)"}
                      size="small"
                      sx={{ bgcolor: '#00C9A7', color: '#FFF', fontWeight: 800, fontSize: '0.74rem' }}
                    />
                  )
                ) : (
                  <Chip
                    icon={<Shield sx={{ fontSize: '14px !important', color: '#FFF !important' }} />}
                    label="Clinical Counselling Advisory Engine"
                    size="small"
                    sx={{ bgcolor: '#00C9A7', color: '#FFF', fontWeight: 800, fontSize: '0.74rem' }}
                  />
                )}
              </Stack>
              {/* Tabs for 10 Risk Categories */}
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  mb: 3,
                  borderBottom: 1,
                  borderColor: 'divider',
                  '& .MuiTab-root': { fontWeight: 800, textTransform: 'none', fontSize: '0.9rem', minHeight: 64 },
                  '& .Mui-selected': { color: riskFactors[activeTab]?.color }
                }}
                TabIndicatorProps={{ style: { backgroundColor: riskFactors[activeTab]?.color } }}
              >
                {riskFactors.map((risk, idx) => {
                  const getRiskIcon = (riskId: string) => {
                    switch (riskId) {
                      case 'heartAttack': return Favorite;
                      case 'stroke': return Psychology;
                      case 'retinopathy': return Visibility;
                      case 'nephropathy': return WaterDrop;
                      case 'neuropathy': return FlashOn;
                      case 'footRisk': return Pets;
                      case 'bleedingRisk': return Bloodtype;
                      case 'giddinessRisk': return AirlineSeatReclineNormal;
                      case 'hypoglycaemiaRisk': return Speed;
                      case 'weightGainObesityRisk': return MonitorWeight;
                      default: {
                        const allIcons = [Favorite, Psychology, Visibility, WaterDrop, FlashOn, Pets, Bloodtype, AirlineSeatReclineNormal, Speed, MonitorWeight];
                        return allIcons[idx] || Shield;
                      }
                    }
                  };
                  const IconComponent = getRiskIcon(risk.id);
                  return (
                    <Tab
                      key={risk.id}
                      icon={<IconComponent />}
                      iconPosition="start"
                      label={`${idx + 1}. ${risk.title.split('(')[0].trim()}`}
                      sx={{ color: activeTab === idx ? risk.color : 'text.secondary' }}
                    />
                  );
                })}
              </Tabs>

              {/* Selected Risk Category Overview */}
              <Box>
                {[riskFactors[activeTab]].filter(Boolean).map((risk) => (
                  <Grid container spacing={3} key={risk.id}>
                    {/* Left Column: Risk Score & Key Indicators */}
                    <Grid item xs={12} md={5}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 3,
                          borderRadius: 1,
                          bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#F8FAFC',
                          borderColor: risk.color,
                          height: '100%'
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                          <Chip
                            label={risk.riskLevel}
                            sx={{ bgcolor: risk.color, color: '#FFF', fontWeight: 800, fontSize: '0.85rem' }}
                          />
                          <Typography variant="h4" sx={{ fontWeight: 900, color: risk.color }}>
                            {risk.score}<Typography component="span" variant="h6" color="text.secondary">/100 Risk</Typography>
                          </Typography>
                        </Stack>

                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                          {risk.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" mb={2.5}>
                          {risk.subtitle}
                        </Typography>

                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00C9A7', mb: 1 }}>
                          🔍 Primary Risk Factors Flagged:
                        </Typography>
                        <Stack spacing={1} mb={3}>
                          {risk.keyIndicators.map((ind, i) => (
                            <Stack key={i} direction="row" alignItems="flex-start" spacing={1}>
                              <Warning sx={{ color: risk.color, fontSize: 18, mt: 0.2 }} />
                              <Typography variant="body2" sx={{ fontSize: '0.88rem' }}>{ind}</Typography>
                            </Stack>
                          ))}
                        </Stack>

                        <Alert severity="info" sx={{ borderRadius: 1 }}>
                          <strong>Screening Protocol:</strong> {risk.screeningSchedule}
                        </Alert>
                      </Paper>
                    </Grid>

                    {/* Right Column: Physician Guidelines & Patient Advice */}
                    <Grid item xs={12} md={7}>
                      <Stack spacing={2.5}>
                        {/* Clinical Guidelines for Staff & Doctor */}
                        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1, borderLeft: '5px solid #6C5CE7' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#6C5CE7', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                            🩺 Clinical Decision Support & Target Thresholds
                          </Typography>
                          <Stack spacing={1.2}>
                            {risk.clinicalGuidance.map((cg, i) => (
                              <Stack key={i} direction="row" alignItems="flex-start" spacing={1}>
                                <CheckCircle sx={{ color: '#6C5CE7', fontSize: 18, mt: 0.3 }} />
                                <Typography variant="body2">{cg}</Typography>
                              </Stack>
                            ))}
                          </Stack>
                        </Paper>

                        {/* Patient Education & Counselling Points */}
                        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1, borderLeft: '5px solid #00C9A7' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#00C9A7', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                            💡 Patient Counselling & Take-Home Instructions
                          </Typography>
                          <Stack spacing={1.2}>
                            {risk.patientAdvice.map((pa, i) => (
                              <Stack key={i} direction="row" alignItems="flex-start" spacing={1}>
                                <Info sx={{ color: '#00C9A7', fontSize: 18, mt: 0.3 }} />
                                <Typography variant="body2">{pa}</Typography>
                              </Stack>
                            ))}
                          </Stack>
                        </Paper>
                      </Stack>
                    </Grid>
                  </Grid>
                ))}
              </Box>

              {/* Reset button */}
              <Box sx={{ textAlign: 'right', mt: 3 }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setSubmitted(false);
                    setRiskFactors(COUNSELLING_RISK_DATABASE);
                    setCurrPatientName('');
                    setCurrPatientAge('');
                    setCurrPatientGender('');
                    setCurrPatientDisease('');
                    setSbp('');
                    setDbp('');
                    setHba1c('');
                    setEgfr('');
                    setSensationLoss('');
                    setFootGrade('');
                  }}
                  sx={{ fontWeight: 700, borderRadius: 1 }}
                >
                  ↺ Reset &amp; Edit Patient Info
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>

        {/* Printable Patient Counselling Sheet Dialog */}
        <Dialog
          open={printOpen}
          onClose={() => setPrintOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              bgcolor: '#FFFFFF !important',
              color: '#0F172A !important',
              backgroundImage: 'none !important',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
              m: { xs: 1, sm: 2 },
              width: { xs: 'calc(100% - 16px)', sm: 'auto' },
              maxWidth: 850,
              maxHeight: { xs: 'calc(100% - 24px)', sm: 'calc(100% - 48px)' },
              display: 'flex',
              flexDirection: 'column'
            }
          }}
        >
          <DialogTitle
            sx={{
              m: 0,
              p: { xs: 2, sm: 2.5 },
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 1.5,
              bgcolor: '#F8FAFC !important',
              color: '#0F172A !important',
              borderBottom: '1px solid #E2E8F0 !important'
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
              <LocalHospital sx={{ color: '#6C5CE7', flexShrink: 0 }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A !important', fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                  Official Patient Chronic Care &amp; Risk Counselling Sheet
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B !important', display: { xs: 'none', sm: 'block' } }}>
                  Verified clinical care protocol sheet for patient and caregivers
                </Typography>
              </Box>
            </Stack>
            <IconButton
              onClick={() => setPrintOpen(false)}
              size="small"
              sx={{ flexShrink: 0, color: '#475569 !important', '&:hover': { bgcolor: '#F1F5F9 !important' } }}
            >
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent
            id="printable-counselling"
            dividers
            sx={{ p: { xs: 2, sm: 4 }, bgcolor: '#FFFFFF !important', color: '#1E293B !important', overflowY: 'auto' }}
          >
            <Box sx={{ border: '2px solid #6C5CE7', borderRadius: 1.5, p: { xs: 2, sm: 3 }, bgcolor: '#FFFFFF !important', color: '#1E293B !important' }}>
              {/* Header */}
              <Grid container spacing={2} sx={{ borderBottom: '2px solid #E2E8F0', pb: 2, mb: 3 }}>
                <Grid item xs={12} sm={8}>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#4C1D95 !important', fontSize: { xs: '1.15rem', sm: '1.5rem' } }}>
                    ARPAN CLINICAL COUNSELLING CENTER
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#475569 !important' }}>
                    Patient Education &amp; Complication Prevention Advisory
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4} textAlign={{ xs: 'left', sm: 'right' }}>
                  <Typography variant="caption" sx={{ color: '#64748B !important', display: 'block' }} suppressHydrationWarning>
                    Date: {new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </Typography>
                </Grid>
              </Grid>

              {/* Patient Header */}
              <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#F8FAFC !important', borderColor: '#E2E8F0 !important', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A !important' }}>
                  Patient: {counsellingPatient?.name || currPatientName} ({counsellingPatient?.age || currPatientAge} Y, {counsellingPatient?.gender || currPatientGender}) • Diagnosis: {counsellingPatient?.disease || currPatientDisease}{(counsellingPatient?.sbp || sbp) && (counsellingPatient?.dbp || dbp) ? ` • BP: ${counsellingPatient?.sbp || sbp}/${counsellingPatient?.dbp || dbp} mmHg` : ''}
                </Typography>
                <Typography variant="caption" sx={{ color: '#475569 !important' }}>
                  Comprehensive 10-Point Clinical Complication &amp; Chronic Risk Evaluation
                </Typography>
              </Paper>

              {/* Content List */}
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#4C1D95 !important', mb: 2 }}>
                Key Health Action Steps For Patient (10 Chronic &amp; Clinical Risk Factors):
              </Typography>
              <Box sx={{ pl: 1, mb: 3 }}>
                {riskFactors.map((risk) => (
                  <Box key={risk.id} sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: risk.color }}>
                      {risk.title} ({risk.riskLevel})
                    </Typography>
                    {risk.patientAdvice.map((adv, idx) => (
                      <Typography key={idx} variant="body2" sx={{ mb: 0.5, color: '#334155 !important' }}>
                        • {adv}
                      </Typography>
                    ))}
                  </Box>
                ))}
              </Box>

              <Divider sx={{ mb: 2, borderColor: '#E2E8F0 !important' }} />

              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={8}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Verified sx={{ color: '#6C5CE7' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569 !important' }}>
                      Verified by Clinical Care Team &amp; Doctor
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={4} textAlign={{ xs: 'left', sm: 'right' }}>
                  <Typography variant="caption" sx={{ fontStyle: 'italic', display: 'block', color: '#64748B !important' }}>
                    Arpan Clinical Care OS
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2, bgcolor: '#FFFFFF !important', borderTop: '1px solid #E2E8F0 !important', flexWrap: 'wrap', gap: 1 }}>
            <Button onClick={() => setPrintOpen(false)} variant="outlined" color="inherit" sx={{ color: '#475569 !important', borderColor: '#CBD5E1 !important', '&:hover': { bgcolor: '#F8FAFC !important', borderColor: '#94A3B8 !important' } }}>
              Close
            </Button>
            <Button onClick={() => window.print()} variant="contained" color="secondary" startIcon={<Print />} sx={{ bgcolor: '#6C5CE7 !important', color: '#FFFFFF !important', fontWeight: 800, '&:hover': { bgcolor: '#5B4BC4 !important' } }}>
              Print Document
            </Button>
          </DialogActions>
        </Dialog>

        {/* Full Page Analysis Loader for Counselling Generation */}
        <CounsellingAnalysisLoader open={isAnalyzing} />
      </Card>

      {/* Dynamic Counselling Consultation History Table */}
      <CounsellingHistoryTable
        onLoadRecord={handleLoadCounsellingRecord}
        onPrintRecord={handlePrintCounsellingRecord}
        refreshTrigger={counsellingRefreshKey}
      />
    </Box>
  );
}
