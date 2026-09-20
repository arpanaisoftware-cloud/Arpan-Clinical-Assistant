'use client';

import React, { useState, useContext } from 'react';
import {
  Container,
  Box,
  Grid,
  Typography,
  Stack,
  Chip,
  Paper
} from '@mui/material';
import { AutoAwesome } from '@mui/icons-material';
import Header from '../components/Header';
import PatientPrescriptionForm from '../components/PatientPrescriptionForm';
import PrescriptionUploader from '../components/PrescriptionUploader';
import AiAnalysisDashboard from '../components/AiAnalysisDashboard';
import PrescriptionPreviewModal from '../components/PrescriptionPreviewModal';
import DoctorCopilotChat from '../components/DoctorCopilotChat';
import HistoryTable from '../components/HistoryTable';
import { ColorModeContext } from '../theme/ThemeRegistry';
import { analyzePrescription, SAMPLE_CLINICAL_CASE } from '../mockData/aiAnalysisData';
import { PatientInput, AnalysisResult, HistoryRecord } from '../types/clinical';
import { toast } from 'react-toastify';

export default function Home() {
  const { mode, toggleColorMode } = useContext(ColorModeContext);

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(() =>
    analyzePrescription(SAMPLE_CLINICAL_CASE, SAMPLE_CLINICAL_CASE.medications)
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [printModalOpen, setPrintModalOpen] = useState<boolean>(false);
  const [copilotOpen, setCopilotOpen] = useState<boolean>(false);

  const handleAnalyze = (formData: PatientInput) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const result = analyzePrescription(formData, formData.medications);
      setAnalysisResult(result);
      setIsAnalyzing(false);
      toast.success('AI Prescription Analysis Complete! View breakdown below.');

      // Smooth scroll to analysis dashboard
      const elem = document.getElementById('analysis-dashboard-section');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }, 1000);
  };

  const handleAutoExtract = (extractedData: PatientInput) => {
    handleAnalyze(extractedData);
  };

  const handleNewRx = () => {
    setAnalysisResult(null);
    toast.info('New prescription template loaded.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadHistoryRecord = (record: HistoryRecord) => {
    const mockCase: PatientInput = {
      patientName: record.patientName,
      age: record.age,
      gender: record.gender,
      weight: 70,
      allergies: 'Penicillin',
      disease: record.disease,
      medications: SAMPLE_CLINICAL_CASE.medications
    };
    handleAnalyze(mockCase);
    toast.info(`Loaded record ${record.id} for ${record.patientName}`);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  return (
    <Box sx={{ minHeight: '100vh', pb: 8, bgcolor: 'background.default', color: 'text.primary' }}>
      {/* Header Bar */}
      <Header
        mode={mode}
        onToggleMode={toggleColorMode}
        onNewRx={handleNewRx}
        onUploadClick={() => {
          const el = document.getElementById('uploader-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenCopilot={() => setCopilotOpen(true)}
      />

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        {/* Top Hero Banner */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 4,
            borderRadius: 4,
            background: mode === 'dark'
              ? 'linear-gradient(135deg, rgba(0, 201, 167, 0.15) 0%, rgba(108, 92, 231, 0.2) 100%)'
              : 'linear-gradient(135deg, rgba(0, 201, 167, 0.1) 0%, rgba(108, 92, 231, 0.1) 100%)',
            border: '1px solid rgba(0, 201, 167, 0.25)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <Chip icon={<AutoAwesome sx={{ color: '#FFF !important' }} />} label="AI CLINICAL INTELLIGENCE" color="primary" size="small" sx={{ fontWeight: 800 }} />
                <Typography variant="caption" color="text.secondary">FDA/WHO Drug Interaction Engine Active</Typography>
              </Stack>
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: '-0.02em' }}>
                Doctor's AI Prescription Analyzer & Clinical Copilot
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 750, fontSize: '1.05rem', lineHeight: 1.6 }}>
                Fill patient details, prescribe drugs, or upload paper prescription documents. Our deep clinical AI detects <strong>drug-drug conflicts</strong>, cross-references <strong>patient allergies</strong>, suggests <strong>generic cost savings</strong>, and builds <strong>visual dosage matrixes</strong>.
              </Typography>
            </Grid>

            {/* Quick Live Stats Badge */}
            <Grid item xs={12} md={4}>
              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, textAlign: 'center', bgcolor: 'background.paper' }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#00C9A7' }}>12,840+</Typography>
                    <Typography variant="caption" color="text.secondary">Prescriptions Analyzed</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, textAlign: 'center', bgcolor: 'background.paper' }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#6C5CE7' }}>99.4%</Typography>
                    <Typography variant="caption" color="text.secondary">Interaction Accuracy</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        {/* Section 1: Form + Document Scanner */}
        <Grid container spacing={3.5} mb={4}>
          <Grid item xs={12} lg={8}>
            <PatientPrescriptionForm onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
          </Grid>

          <Grid item xs={12} lg={4} id="uploader-section">
            <PrescriptionUploader onAutoExtract={handleAutoExtract} />
          </Grid>
        </Grid>

        {/* Section 2: AI Analysis Dashboard */}
        {analysisResult && (
          <Box id="analysis-dashboard-section" sx={{ mt: 4 }}>
            <AiAnalysisDashboard
              analysisResult={analysisResult}
              onOpenPrintModal={() => setPrintModalOpen(true)}
              onOpenCopilot={() => setCopilotOpen(true)}
            />
          </Box>
        )}

        {/* Section 3: History Table */}
        <HistoryTable onLoadRecord={handleLoadHistoryRecord} />
      </Container>

      {/* Prescription Print Modal */}
      <PrescriptionPreviewModal
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        analysisData={analysisResult}
      />

      {/* AI Doctor Copilot Drawer */}
      <DoctorCopilotChat
        open={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        currentPatientData={analysisResult?.patientInfo}
      />
    </Box>
  );
}
