'use client';

import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Stack,
  Avatar,
  Paper,
  Chip,
  Divider,
  Tooltip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  Collapse
} from '@mui/material';
import Close from '@mui/icons-material/Close';
import Send from '@mui/icons-material/Send';
import Psychology from '@mui/icons-material/Psychology';
import ContentCopy from '@mui/icons-material/ContentCopy';
import Check from '@mui/icons-material/Check';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import MedicalServices from '@mui/icons-material/MedicalServices';
import LocalHospital from '@mui/icons-material/LocalHospital';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import VerifiedUser from '@mui/icons-material/VerifiedUser';
import WarningAmberRounded from '@mui/icons-material/WarningAmberRounded';
import Person from '@mui/icons-material/Person';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import Speed from '@mui/icons-material/Speed';
import History from '@mui/icons-material/History';
import OpenInNew from '@mui/icons-material/OpenInNew';
import { toast } from 'react-toastify';
import { useAppSelector } from '../redux/hooks';
import { PatientInput, AuthUser, AnalysisResult, HistoryRecord } from '../types/clinical';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp?: string;
  model?: string;
}

interface DoctorCopilotChatProps {
  open: boolean;
  onClose: () => void;
  currentPatientData?: PatientInput;
  analysisData?: AnalysisResult | null;
  currentUser?: AuthUser | null;
  selectedPatientRecord?: HistoryRecord | null;
  onSelectPatientRecord?: (record: HistoryRecord | null) => void;
}

// ─── Inline Markdown Formatter for Clinical Depth ────────────────────────────
function formatInlineStyles(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ fontWeight: 800 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          style={{
            background: 'rgba(99, 102, 241, 0.12)',
            padding: '2px 5px',
            borderRadius: '4px',
            fontSize: '0.85em',
            fontWeight: 700,
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function ClinicalMessageContent({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.7 }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <Box key={idx} sx={{ height: 3 }} />;

        // Headings
        if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
          const headingText = trimmed.replace(/^#+\s*/, '');
          return (
            <Typography
              key={idx}
              variant="subtitle2"
              sx={{
                fontWeight: 900,
                color: '#4F46E5',
                mt: 1,
                mb: 0.2,
                fontSize: '0.94rem',
                letterSpacing: '-0.01em',
              }}
            >
              {formatInlineStyles(headingText)}
            </Typography>
          );
        }

        // Horizontal Dividers
        if (trimmed === '---' || trimmed === '***') {
          return <Divider key={idx} sx={{ my: 0.8, opacity: 0.4 }} />;
        }

        // Bullet Points
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const bulletText = trimmed.slice(2);
          const isWarning =
            bulletText.includes('⚠️') ||
            bulletText.toLowerCase().includes('contraindicated') ||
            bulletText.toLowerCase().includes('red flag') ||
            bulletText.toLowerCase().includes('hazard') ||
            bulletText.toLowerCase().includes('toxic');

          return (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                pl: 0.5,
                bgcolor: isWarning ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                p: isWarning ? 0.8 : 0,
                borderRadius: isWarning ? 1.5 : 0,
                borderLeft: isWarning ? '3px solid #EF4444' : 'none',
              }}
            >
              <Typography
                sx={{
                  color: isWarning ? '#EF4444' : '#4F46E5',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  fontWeight: 800,
                }}
              >
                •
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.87rem', lineHeight: 1.55 }}>
                {formatInlineStyles(bulletText)}
              </Typography>
            </Box>
          );
        }

        // Standard Paragraph
        return (
          <Typography key={idx} variant="body2" sx={{ fontSize: '0.87rem', lineHeight: 1.55 }}>
            {formatInlineStyles(trimmed)}
          </Typography>
        );
      })}
    </Box>
  );
}

// ─── Main AI Doctor Copilot Component ─────────────────────────────────────────
export default function DoctorCopilotChat({
  open,
  onClose,
  currentPatientData,
  analysisData,
  currentUser,
  selectedPatientRecord,
  onSelectPatientRecord
}: DoctorCopilotChatProps) {
  const router = useRouter();
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const latestMessageRef = useRef<HTMLDivElement>(null);
  const historyList = useAppSelector((state) => state.clinical.historyList);

  const [selectedPatientId, setSelectedPatientId] = useState<string>('active');
  const [showPatientDetails, setShowPatientDetails] = useState<boolean>(false);

  // Sync external selected patient or fallback to first available
  useEffect(() => {
    if (selectedPatientRecord?.id) {
      setSelectedPatientId(selectedPatientRecord.id);
    } else if (!currentPatientData?.patientName && historyList.length > 0 && selectedPatientId === 'active') {
      setSelectedPatientId(historyList[0].id);
    }
  }, [selectedPatientRecord, open, currentPatientData, historyList]);

  // Derive active patient record and analyzed clinical data
  const selectedHistoryRecord = historyList.find((h) => h.id === selectedPatientId);

  const activePatientName = selectedPatientId === 'general'
    ? null
    : (selectedPatientId === 'active'
      ? (currentPatientData?.patientName || analysisData?.patientInfo?.patientName)
      : selectedHistoryRecord?.patientName);

  const activePatientInput: PatientInput | undefined = selectedPatientId === 'general'
    ? undefined
    : (selectedPatientId === 'active'
      ? (currentPatientData || analysisData?.patientInfo)
      : (selectedHistoryRecord?.patientInput || (selectedHistoryRecord ? {
        patientName: selectedHistoryRecord.patientName,
        age: selectedHistoryRecord.age,
        gender: selectedHistoryRecord.gender,
        disease: selectedHistoryRecord.disease,
        medications: []
      } : undefined)));

  const activeAnalysis: AnalysisResult | null | undefined = selectedPatientId === 'general'
    ? null
    : (selectedPatientId === 'active'
      ? analysisData
      : selectedHistoryRecord?.analysisResult);

  const activeSafetyScore = selectedHistoryRecord?.safetyScore ?? activeAnalysis?.safetyScore;
  const activeRiskCategory = selectedHistoryRecord?.risk ?? activeAnalysis?.riskCategory;
  const activeStatusColor = selectedHistoryRecord?.color ?? activeAnalysis?.statusColor ?? '#00C9A7';

  const greeting = (() => {
    if (!currentUser) return 'Hello Doctor. I am Prof. Dr. Arpan AI.';
    const title = currentUser.role === 'Doctor' ? 'Dr.' : '';
    const firstName = currentUser.name.replace(/^(Dr\.|Nurse|Dietitian)\s*/i, '').split(' ')[0];
    const salutation = title ? `${title} ${firstName}` : firstName;
    return `Doctor, good to confer with you (${salutation}). I am Prof. Dr. Arpan AI, your Senior Clinical Pharmacologist.`;
  })();

  const initialGreeting = `${greeting} ${activePatientName
    ? `I have correlated the pre-analyzed clinical record for **${activePatientName}** (${activePatientInput?.disease || 'Metabolic Case'}). Pre-analyzed Safety Score: ${activeSafetyScore !== undefined ? `${activeSafetyScore}/100` : 'Assessed'}.`
    : 'Ready to assist with your diabetic & metabolic pharmacotherapy, glycemic titration, and organ protection cases colleague-to-colleague.'
    }\n\nWhat clinical dilemma would you like to review?`;

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: 'gemini-3.8-flash'
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Dynamic quick prompts adapted to the selected patient's pre-analyzed conditions
  const dynamicQuickPrompts = (() => {
    if (!activePatientName || selectedPatientId === 'general') {
      return [
        "Pregabalin vs Duloxetine for diabetic neuropathy on DOAC?",
        "Metformin renal titration protocols at eGFR 45 mL/min",
        "SGLT2 inhibitor eGFR threshold & sick-day rules",
        "Atorvastatin CYP3A4 inhibitors & diabetic dyslipidemia",
        "Safe analgesic alternative in diabetic nephropathy on ACEi"
      ];
    }
    const d = (activePatientInput?.disease || '').toLowerCase();
    const meds = activeAnalysis?.medications || activePatientInput?.medications || [];
    const medNames = meds.map((m: any) => (m.name || m.drugName || '').toLowerCase());
    const prompts: string[] = [];

    if (medNames.some(m => m.includes('metformin')) || d.includes('diabetes')) {
      prompts.push(`Assess Metformin & glycemic dosing for ${activePatientName}`);
    }
    if (activePatientInput?.egfr && Number(activePatientInput.egfr) < 60) {
      prompts.push(`Renal safety & dosing at eGFR ${activePatientInput.egfr} mL/min`);
    }
    if (activeAnalysis?.flaggedInteractions && activeAnalysis.flaggedInteractions.length > 0) {
      prompts.push(`Review flagged drug interactions in ${activePatientName}'s regimen`);
    }
    if (medNames.some(m => m.includes('celecoxib') || m.includes('nsaid') || m.includes('enalapril') || m.includes('losartan') || m.includes('telmisartan'))) {
      prompts.push(`Check NSAID + ACEi/ARB renal hemodynamic risks`);
    }
    if (activePatientInput?.allergies && activePatientInput.allergies !== 'None') {
      prompts.push(`Safe antibiotic alternatives for ${activePatientInput.allergies} allergy`);
    }
    if (prompts.length < 5) {
      prompts.push(`Cardiorenal-protective add-ons (SGLT2i / GLP-1 RA)?`);
      prompts.push(`How can we optimize ${activePatientName}'s safety score?`);
    }
    return prompts.slice(0, 5);
  })();

  // Controlled chat scrolling:
  // - When user sends: scroll down so the user sees their sent message & typing status
  // - When AI responds: scroll to the TOP of the new AI message so the doctor can read the verdict immediately without it scrolling past it!
  useEffect(() => {
    if (!open || messages.length === 0) return;

    if (messages.length <= 1) {
      if (chatBodyRef.current) chatBodyRef.current.scrollTop = 0;
      return;
    }

    const lastMsg = messages[messages.length - 1];

    if (lastMsg.sender === 'user') {
      setTimeout(() => {
        if (chatBodyRef.current) {
          chatBodyRef.current.scrollTo({
            top: chatBodyRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 40);
    } else if (lastMsg.sender === 'ai') {
      setTimeout(() => {
        if (latestMessageRef.current && chatBodyRef.current) {
          const containerRect = chatBodyRef.current.getBoundingClientRect();
          const messageRect = latestMessageRef.current.getBoundingClientRect();
          const offset = messageRect.top - containerRect.top;
          const targetScroll = chatBodyRef.current.scrollTop + offset - 12;

          chatBodyRef.current.scrollTo({
            top: Math.max(0, targetScroll),
            behavior: 'smooth',
          });
        }
      }, 40);
    }
  }, [messages, open]);

  useEffect(() => {
    if (isTyping && chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [isTyping]);

  const handleCopy = (text: string, index: number) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success('Clinical assessment copied to clipboard', { autoClose: 2000 });
      setTimeout(() => setCopiedIndex(null), 2500);
    }
  };

  const handleResetChat = () => {
    setSelectedPatientId('general');
    setShowPatientDetails(false);
    if (onSelectPatientRecord) {
      onSelectPatientRecord(null);
    }
    const generalGreeting = `${greeting} 🌐 **General Clinical Consultation Mode Enabled**\n\nNo specific patient record attached. You can ask any question regarding diabetic pharmacotherapy, drug mechanisms, generic bio-equivalents, organ-adjusted dosing, or drug interactions.\n\nWhat clinical dilemma would you like to review?`;
    setMessages([
      {
        sender: 'ai',
        text: generalGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'gemini-3.8-flash'
      }
    ]);
    toast.info('Consultation reset to General Clinical Consultation Mode.');
  };

  const handleSelectPatient = (newId: string) => {
    setSelectedPatientId(newId);
    if (onSelectPatientRecord) {
      const rec = historyList.find((h) => h.id === newId) || null;
      onSelectPatientRecord(rec);
    }

    if (newId === 'general') {
      const switchMsg: Message = {
        sender: 'ai',
        text: `🌐 **General Clinical Consultation Mode Enabled**\n\nNo specific patient record attached. You can ask any question regarding diabetic pharmacotherapy, drug mechanisms, generic bio-equivalents, organ-adjusted dosing, or drug interactions.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'gemini-3.8-flash'
      };
      setMessages((prev) => [...prev, switchMsg]);
      toast.info('Switched to General Consultation mode.');
    } else {
      const rec = historyList.find((h) => h.id === newId);
      const name = newId === 'active' ? (currentPatientData?.patientName || 'Current Patient') : (rec?.patientName || 'Patient');
      const disease = newId === 'active' ? (currentPatientData?.disease || 'Metabolic Case') : (rec?.disease || 'Metabolic Case');
      const score = newId === 'active' ? (analysisData?.safetyScore ?? 85) : (rec?.safetyScore ?? 80);
      const risk = newId === 'active' ? (analysisData?.riskCategory ?? 'Assessed') : (rec?.risk ?? 'Assessed');
      const medList = newId === 'active'
        ? (analysisData?.medications || currentPatientData?.medications || [])
        : (rec?.analysisResult?.medications || rec?.patientInput?.medications || []);

      const switchMsg: Message = {
        sender: 'ai',
        text: `🔄 **Consultation Context Switched: ${name}**\n\n* 📋 **Diagnosis**: ${disease}\n* 🛡️ **Pre-analyzed Safety Score**: ${score}/100 (${risk})\n* 💊 **Prescribed Drugs**: ${medList.length} medications loaded.\n\nAll pre-analyzed patient data (vitals, lab biomarkers, flagged drug interactions) is now active in context. What would you like to review or modify regarding this patient?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'gemini-3.8-flash'
      };
      setMessages((prev) => [...prev, switchMsg]);
      toast.info(`AI context loaded for ${name}`);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isTyping) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { sender: 'user', text: query.trim(), timestamp: timeString };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Build comprehensive patient profile from patientInfo, analysisResult, and history record
    const patientContextPayload: any = activePatientName ? {
      patientName: activePatientName,
      age: activePatientInput?.age,
      gender: activePatientInput?.gender,
      disease: activePatientInput?.disease,
      allergies: activePatientInput?.allergies,
      vitals: {
        bpSystolic: activePatientInput?.bpSystolic,
        bpDiastolic: activePatientInput?.bpDiastolic,
        pulse: activePatientInput?.pulse,
        bmi: activePatientInput?.bmi,
      },
      biomarkers: {
        hba1c: activePatientInput?.hba1c,
        fastingGlucose: activePatientInput?.fastingGlucose,
        creatinine: activePatientInput?.creatinine,
        egfr: activePatientInput?.egfr,
        potassiumK: activePatientInput?.potassiumK,
      },
      medications: activeAnalysis?.medications || activePatientInput?.medications || [],
      safetyScore: activeSafetyScore,
      riskCategory: activeRiskCategory,
      flaggedInteractions: activeAnalysis?.flaggedInteractions || [],
      flaggedAllergies: activeAnalysis?.flaggedAllergies || [],
      aiClinicalOverview: activeAnalysis?.aiClinicalOverview,
    } : null;

    // Get Auth token for single active session enforcement
    const token = typeof window !== 'undefined' ? localStorage.getItem('arpan_auth_token') : '';

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          message: query.trim(),
          history: messages.slice(1).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            content: m.text,
          })),
          patientContext: patientContextPayload,
          doctorName: currentUser?.name || 'Attending Physician',
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        if (response.status === 401) {
          // Trigger global session termination modal if session was invalidated
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('session-terminated-by-other-device', {
                detail: {
                  loggedOutByOtherDevice: !!errJson.loggedOutByOtherDevice,
                  message: errJson.message || 'Your account was logged into on another device.',
                },
              })
            );
          }
        }
        throw new Error(errJson.message || 'Consultation request failed');
      }

      const resData = await response.json();
      const aiReply = resData.reply || 'Clinical consultation review complete.';

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: resData.model || 'gemini-3.8-flash',
        },
      ]);
    } catch (err: any) {
      console.error('Chat error:', err);
      toast.error(err.message || 'AI consultation engine error');
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `⚠️ **Clinical Engine Warning**: Unable to retrieve remote medical guidance (${err.message}). Please re-verify network or credentials.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 470 },
          maxWidth: '100vw',
          p: 0,
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 35px rgba(0, 0, 0, 0.25)',
        },
      }}
    >
      {/* ─── Premium Header ─── */}
      <Box
        sx={{
          p: 2.2,
          background: 'linear-gradient(135deg, #3730A3 0%, #4F46E5 50%, #6366F1 100%)',
          color: '#FFF',
          boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.35)',
                width: 44,
                height: 44,
              }}
            >
              <Psychology sx={{ color: '#FFF', fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1.15, fontSize: '1.02rem' }}>
                Prof. Dr. Arpan AI
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.74rem', display: 'block' }}>
                Senior Chief Physician & Clinical Pharmacologist
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Expand to Dedicated Full-Page Workspace" arrow>
              <IconButton
                onClick={() => {
                  onClose();
                  router.push(`/ai-chat?patient=${selectedPatientId}`);
                }}
                size="small"
                sx={{ color: 'rgba(255, 255, 255, 0.85)', '&:hover': { color: '#FFF' } }}
              >
                <OpenInNew fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reset Consultation History" arrow>
              <IconButton onClick={handleResetChat} size="small" sx={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                <DeleteOutline fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose} size="small" sx={{ color: '#FFF' }}>
              <Close fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        {/* Status & Capabilities Pill */}
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Chip
            icon={<AutoAwesome sx={{ fontSize: '12px !important', color: '#10B981 !important' }} />}
            label="Gemini 3.8 Flash • Extreme Medical AI"
            size="small"
            sx={{
              bgcolor: 'rgba(16, 185, 129, 0.2)',
              color: '#A7F3D0',
              fontWeight: 800,
              fontSize: '0.7rem',
              height: 22,
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          />
          {activePatientName && (
            <Chip
              icon={<VerifiedUser sx={{ fontSize: '12px !important', color: '#FBBF24 !important' }} />}
              label={`Active: ${activePatientName}`}
              size="small"
              sx={{
                bgcolor: 'rgba(251, 191, 36, 0.2)',
                color: '#FDE68A',
                fontWeight: 800,
                fontSize: '0.7rem',
                height: 22,
                border: '1px solid rgba(251, 191, 36, 0.3)',
              }}
            />
          )}
        </Stack>
      </Box>

      {/* ─── Patient Consultation Context Switcher & Pre-Analyzed Data Card ─── */}
      <Box
        sx={{
          p: 1.5,
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(241, 245, 249, 0.95)'),
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1} justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={0.8} sx={{ flex: 1, minWidth: 0 }}>
              <Person sx={{ color: '#6366F1', fontSize: 18 }} />
              <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                Select Patient from History:
              </Typography>
            </Stack>
            {activePatientName && (
              <Button
                size="small"
                onClick={() => setShowPatientDetails(!showPatientDetails)}
                endIcon={showPatientDetails ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                sx={{
                  fontSize: '0.72rem',
                  py: 0.1,
                  px: 0.8,
                  textTransform: 'none',
                  fontWeight: 700,
                  color: showPatientDetails ? '#4F46E5' : 'text.secondary',
                  '&:hover': { color: '#4F46E5' }
                }}
              >
                {showPatientDetails ? 'Hide Clinical Data' : 'View Clinical Data'}
              </Button>
            )}
          </Stack>

          {/* Dropdown Selector */}
          <FormControl fullWidth size="small">
            <Select
              value={selectedPatientId}
              onChange={(e) => handleSelectPatient(e.target.value)}
              sx={{
                bgcolor: 'background.paper',
                fontSize: '0.82rem',
                borderRadius: 1.5,
                fontWeight: 700,
                '& .MuiSelect-select': { py: 0.85, display: 'flex', alignItems: 'center', gap: 1 }
              }}
            >
              {/* Active on-screen patient (if exists) */}
              {currentPatientData?.patientName && (
                <MenuItem value="active">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Chip label="Current Screen" size="small" color="primary" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800 }} />
                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.82rem' }}>
                      {currentPatientData.patientName} ({currentPatientData.disease || 'Active Session'})
                    </Typography>
                  </Stack>
                </MenuItem>
              )}

              {/* History patients */}
              {historyList.map((record) => (
                <MenuItem key={record.id} value={record.id}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                      <Chip
                        label={record.id}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800, borderColor: record.color, color: record.color }}
                      />
                      <Typography variant="body2" noWrap sx={{ fontWeight: 700, fontSize: '0.82rem' }}>
                        {record.patientName} ({record.age}Y {record.gender?.charAt(0)}) • {record.disease}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${record.safetyScore}/100`}
                      size="small"
                      sx={{ height: 18, fontSize: '0.66rem', fontWeight: 800, bgcolor: record.color, color: '#FFF' }}
                    />
                  </Stack>
                </MenuItem>
              ))}

              {/* General Option */}
              <MenuItem value="general">
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.82rem' }}>
                  🌐 General Clinical Consultation (No Patient Attached)
                </Typography>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Collapsible Clinical Summary & Vitals (Only visible when 'View Clinical Data' is clicked) */}
          <Collapse in={showPatientDetails && Boolean(activePatientName)}>
            {activePatientName && (
              <Paper
                variant="outlined"
                sx={{
                  p: 1.2,
                  borderRadius: 1.5,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.6)' : '#ffffff'),
                  border: '1px solid',
                  borderColor: activeStatusColor ? `${activeStatusColor}55` : 'divider',
                  mt: 0.5,
                }}
              >
                <Stack spacing={0.8}>
                  {/* Patient Name, Condition & Safety Score */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.86rem', lineHeight: 1.2 }}>
                        {activePatientName} {activePatientInput?.age ? `(${activePatientInput.age}Y ${activePatientInput.gender || ''})` : ''}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.73rem' }}>
                        {activePatientInput?.disease || 'Metabolic Case'}
                      </Typography>
                    </Box>
                    {activeSafetyScore !== undefined && (
                      <Chip
                        icon={<Speed sx={{ fontSize: '12px !important', color: '#FFF !important' }} />}
                        label={`Score: ${activeSafetyScore}/100 • ${activeRiskCategory || 'Assessed'}`}
                        size="small"
                        sx={{
                          bgcolor: activeStatusColor,
                          color: '#FFF',
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          height: 22,
                        }}
                      />
                    )}
                  </Box>

                  {/* Quick Biomarkers & Vitals row */}
                  <Stack direction="row" spacing={0.6} flexWrap="wrap" sx={{ gap: 0.5 }}>
                    {activePatientInput?.bpSystolic && (
                      <Chip
                        label={`BP: ${activePatientInput.bpSystolic}/${activePatientInput.bpDiastolic || '?'}`}
                        size="small"
                        sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
                      />
                    )}
                    {activePatientInput?.hba1c && (
                      <Chip
                        label={`HbA1c: ${activePatientInput.hba1c}%`}
                        size="small"
                        color="warning"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800 }}
                      />
                    )}
                    {activePatientInput?.egfr && (
                      <Chip
                        label={`eGFR: ${activePatientInput.egfr} mL/min`}
                        size="small"
                        color={Number(activePatientInput.egfr) < 45 ? 'error' : 'info'}
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800 }}
                      />
                    )}
                    {activePatientInput?.allergies && activePatientInput.allergies !== 'None' && (
                      <Chip
                        label={`Allergy: ${activePatientInput.allergies}`}
                        size="small"
                        color="error"
                        sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800 }}
                      />
                    )}
                  </Stack>

                  <Divider sx={{ my: 0.8 }} />

                  {/* Pre-Analyzed Medications & Flagged Interactions */}
                  <Stack spacing={0.8}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.7rem' }}>
                      PRE-ANALYZED MEDICATIONS ({(activeAnalysis?.medications || activePatientInput?.medications || []).length}):
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(activeAnalysis?.medications || activePatientInput?.medications || []).map((m: any, idx: number) => (
                        <Chip
                          key={idx}
                          label={`${m.name || m.drugName} ${m.dosage || m.dose || ''}`}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
                        />
                      ))}
                    </Box>

                    {activeAnalysis?.flaggedInteractions && activeAnalysis.flaggedInteractions.length > 0 && (
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#EF4444', fontSize: '0.7rem' }}>
                          FLAGGED DRUG INTERACTIONS:
                        </Typography>
                        {activeAnalysis.flaggedInteractions.map((item, idx) => (
                          <Typography key={idx} variant="caption" sx={{ display: 'block', fontSize: '0.7rem', color: '#EF4444' }}>
                            • <strong>{item.drugA} + {item.drugB}</strong> ({item.severity}): {item.effect}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            )}
          </Collapse>
        </Stack>
      </Box>

      {/* ─── Chat Messages Body ─── */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          overflowY: 'auto',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0f172a' : '#f8fafc'),
        }}
      >
        <Stack spacing={2.5}>
          {messages.map((m, i) => (
            <Box
              key={i}
              sx={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: m.sender === 'user' ? '82%' : '95%',
                width: 'auto',
              }}
            >
              {/* Message Header (Doctor label or user label) */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: m.sender === 'user' ? 'flex-end' : 'space-between',
                  mb: 0.5,
                  px: 0.5,
                }}
              >
                {m.sender === 'ai' ? (
                  <Stack direction="row" spacing={0.8} alignItems="center">
                    <MedicalServices sx={{ fontSize: 13, color: '#4F46E5' }} />
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#4F46E5', fontSize: '0.74rem' }}>
                      Prof. Dr. Arpan AI
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                      {m.timestamp}
                    </Typography>
                  </Stack>
                ) : (
                  <Stack direction="row" spacing={0.8} alignItems="center">
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#4F46E5', fontSize: '0.74rem' }}>
                      {currentUser?.name || 'You'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                      {m.timestamp || ''}
                    </Typography>
                  </Stack>
                )}

                {m.sender === 'ai' && (
                  <Tooltip title={copiedIndex === i ? 'Copied!' : 'Copy Clinical Note'} arrow>
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(m.text, i)}
                      sx={{ p: 0.2, ml: 1, color: 'text.secondary' }}
                    >
                      {copiedIndex === i ? <Check sx={{ fontSize: 14, color: '#10B981' }} /> : <ContentCopy sx={{ fontSize: 13 }} />}
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              <Paper
                elevation={m.sender === 'user' ? 3 : 1}
                sx={{
                  p: 2,
                  borderRadius: m.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  background:
                    m.sender === 'user'
                      ? 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%) !important'
                      : undefined,
                  bgcolor:
                    m.sender === 'user'
                      ? '#4F46E5 !important'
                      : (theme) => (theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff'),
                  color: m.sender === 'user' ? '#FFFFFF !important' : 'text.primary',
                  border:
                    m.sender === 'user'
                      ? '1px solid #4338CA'
                      : (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
                  boxShadow:
                    m.sender === 'user'
                      ? '0 4px 14px rgba(79, 70, 229, 0.35)'
                      : '0 2px 10px rgba(0, 0, 0, 0.04)',
                }}
              >
                {m.sender === 'user' ? (
                  <Typography
                    variant="body2"
                    sx={{
                      lineHeight: 1.55,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#FFFFFF !important',
                      wordBreak: 'break-word',
                    }}
                  >
                    {m.text}
                  </Typography>
                ) : (
                  <ClinicalMessageContent text={m.text} />
                )}
              </Paper>
            </Box>
          ))}

          {/* Typing State */}
          {isTyping && (
            <Box sx={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.8)' : '#FFFFFF'),
                  borderColor: '#6366F1',
                }}
              >
                <CircularProgress size={16} sx={{ color: '#4F46E5' }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#4F46E5', fontStyle: 'italic' }}>
                  Consulting pharmacology protocols & Gemini 3.8 Flash engine...
                </Typography>
              </Paper>
            </Box>
          )}
        </Stack>

        {/* ─── Suggested Quick Clinical Inquiries ─── */}
        <Box sx={{ mt: 3.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              display: 'block',
              mb: 1.2,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              fontSize: '0.72rem',
            }}
          >
            Clinical Query Quick Select ({activePatientName || 'General'}):
          </Typography>
          <Stack direction="column" spacing={1}>
            {dynamicQuickPrompts.map((qp, idx) => (
              <Chip
                key={idx}
                label={qp}
                onClick={() => handleSend(qp)}
                size="small"
                variant="outlined"
                clickable
                icon={<AutoAwesome sx={{ fontSize: '13px !important', color: '#6366F1 !important' }} />}
                sx={{
                  justifyContent: 'flex-start',
                  fontSize: '0.78rem',
                  py: 1.8,
                  px: 1,
                  borderRadius: 2,
                  fontWeight: 600,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.06)' : '#ffffff'),
                  borderColor: 'rgba(99, 102, 241, 0.25)',
                  '&:hover': {
                    bgcolor: 'rgba(99, 102, 241, 0.12)',
                    borderColor: '#6366F1',
                  },
                }}
              />
            ))}
          </Stack>
        </Box>
      </Box>

      <Divider />

      {/* ─── Input Toolbar ─── */}
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Stack direction="row" spacing={1.2} alignItems="center">
          <TextField
            fullWidth
            size="small"
            multiline
            maxRows={3}
            placeholder="Ask Dr. Arpan about pharmacology, dosing, contraindications..."
            value={input}
            disabled={isTyping}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            InputProps={{
              sx: {
                borderRadius: 2.5,
                fontSize: '0.88rem',
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : '#ffffff'),
                color: (theme) => (theme.palette.mode === 'dark' ? '#f8fafc' : '#0f172a'),
                '& .MuiInputBase-input': {
                  color: (theme) => (theme.palette.mode === 'dark' ? '#f8fafc' : '#0f172a'),
                }
              },
            }}
          />
          <Button
            variant="contained"
            disabled={!input.trim() || isTyping}
            onClick={() => handleSend()}
            sx={{
              minWidth: 46,
              height: 42,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
            }}
          >
            {isTyping ? <CircularProgress size={18} sx={{ color: '#FFF' }} /> : <Send fontSize="small" />}
          </Button>
        </Stack>

        {/* <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            color: 'text.secondary',
            fontSize: '0.68rem',
            mt: 1,
            opacity: 0.8,
          }}
        >
          Clinical Decision Support powered by Gemini 3.8 Flash • Designed for licensed healthcare practitioners
        </Typography> */}
      </Box>
    </Drawer>
  );
}
