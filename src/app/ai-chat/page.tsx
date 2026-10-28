'use client';

import React, { useState, useEffect, useRef, useContext, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  TextField,
  Stack,
  Chip,
  Avatar,
  Divider,
  Tooltip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  Collapse,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Psychology,
  Send,
  ContentCopy,
  Check,
  DeleteOutline,
  AutoAwesome,
  VerifiedUser,
  Person,
  ExpandMore,
  ExpandLess,
  Speed,
  ArrowBack,
  MedicalServices,
  LocalHospital,
  Shield,
  HelpOutline,
  OpenInNew,
  Dashboard
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { ColorModeContext } from '../../theme/ThemeRegistry';
import { useAppSelector } from '../../redux/hooks';
import { PatientInput, AuthUser, AnalysisResult, HistoryRecord } from '../../types/clinical';
import AdminAiSwitcherDialog from '../../components/AdminAiSwitcherDialog';
import axiosClient from '../../redux/api/axiosClient';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp?: string;
  model?: string;
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <Box key={idx} sx={{ height: 4 }} />;

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
                mt: 1.2,
                mb: 0.2,
                fontSize: '0.98rem',
                letterSpacing: '-0.01em',
              }}
            >
              {formatInlineStyles(headingText)}
            </Typography>
          );
        }

        // Horizontal Dividers
        if (trimmed === '---' || trimmed === '***') {
          return <Divider key={idx} sx={{ my: 1, opacity: 0.4 }} />;
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
                gap: 1.2,
                pl: 0.5,
                bgcolor: isWarning ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                p: isWarning ? 1 : 0.2,
                borderRadius: isWarning ? 1.5 : 0,
                borderLeft: isWarning ? '3.5px solid #EF4444' : 'none',
              }}
            >
              <Typography
                sx={{
                  color: isWarning ? '#EF4444' : '#4F46E5',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  fontWeight: 900,
                }}
              >
                •
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                {formatInlineStyles(bulletText)}
              </Typography>
            </Box>
          );
        }

        // Standard Paragraph
        return (
          <Typography key={idx} variant="body2" sx={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
            {formatInlineStyles(trimmed)}
          </Typography>
        );
      })}
    </Box>
  );
}

// ─── Main AI Chat Page Component with Suspense Boundary ─────────────────────
function AiChatView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPatientParam = searchParams.get('patient');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const { mode, toggleColorMode } = useContext(ColorModeContext);
  const { currentUser, logout } = useAuth();

  const historyList = useAppSelector((state) => state.clinical.historyList);
  const analysisResult = useAppSelector((state) => state.clinical.analysisResult);
  const currentPatientDraft = useAppSelector((state) => state.clinical.currentPatientDraft);
  const currentPatientInput = (analysisResult?.patientInfo || currentPatientDraft) as PatientInput | undefined;

  const [selectedPatientId, setSelectedPatientId] = useState<string>('active');
  const [showPatientDetails, setShowPatientDetails] = useState<boolean>(false);
  const [mobileContextOpen, setMobileContextOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const latestMessageRef = useRef<HTMLDivElement>(null);

  // Set patient from query param or fallback (only initialize once)
  const initializedPatientRef = useRef<boolean>(false);
  useEffect(() => {
    if (initializedPatientRef.current) return;
    if (initialPatientParam) {
      setSelectedPatientId(initialPatientParam);
      initializedPatientRef.current = true;
    } else if (!currentPatientInput?.patientName && historyList.length > 0) {
      setSelectedPatientId(historyList[0].id);
      initializedPatientRef.current = true;
    } else if (currentPatientInput?.patientName) {
      setSelectedPatientId('active');
      initializedPatientRef.current = true;
    }
  }, [initialPatientParam, currentPatientInput, historyList]);

  // Derive active patient record
  const selectedHistoryRecord = historyList.find((h) => h.id === selectedPatientId);

  const activePatientName = selectedPatientId === 'general'
    ? null
    : (selectedPatientId === 'active'
      ? (currentPatientInput?.patientName || analysisResult?.patientInfo?.patientName)
      : selectedHistoryRecord?.patientName);

  const activePatientInput: PatientInput | undefined = selectedPatientId === 'general'
    ? undefined
    : (selectedPatientId === 'active'
      ? (currentPatientInput || analysisResult?.patientInfo)
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
      ? analysisResult
      : selectedHistoryRecord?.analysisResult);

  const activeSafetyScore = selectedHistoryRecord?.safetyScore ?? activeAnalysis?.safetyScore;
  const activeRiskCategory = selectedHistoryRecord?.risk ?? activeAnalysis?.riskCategory;
  const activeStatusColor = selectedHistoryRecord?.color ?? activeAnalysis?.statusColor ?? '#00C9A7';

  // Salutation and Initial Greeting
  const greeting = (() => {
    if (!currentUser) return 'Hello Doctor. I am Prof. Dr. Arpan AI.';
    const title = currentUser.role === 'Doctor' ? 'Dr.' : '';
    const firstName = currentUser.name.replace(/^(Dr\.|Nurse|Dietitian)\s*/i, '').split(' ')[0];
    const salutation = title ? `${title} ${firstName}` : firstName;
    return `Doctor, welcome to the Dedicated Clinical AI Consultation Workspace (${salutation}). I am Prof. Dr. Arpan AI, your Senior Clinical Pharmacologist.`;
  })();

  const initialGreeting = `${greeting} ${activePatientName
    ? `I have correlated the pre-analyzed clinical record for **${activePatientName}** (${activePatientInput?.disease || 'Metabolic Case'}). Pre-analyzed Safety Score: ${activeSafetyScore !== undefined ? `${activeSafetyScore}/100` : 'Assessed'}.`
    : 'Ready to assist with your diabetic & metabolic pharmacotherapy, glycemic titration, and organ protection cases colleague-to-colleague.'
    }\n\nWhat clinical dilemma would you like to review?`;

  const [activeAiProvider, setActiveAiProvider] = useState<'gemini' | 'deepseek'>('gemini');
  const [aiSwitcherOpen, setAiSwitcherOpen] = useState(false);
  const isAdmin = currentUser?.role === 'Doctor' || currentUser?.modulePermissions === 'Full Access';

  useEffect(() => {
    const fetchAiStatus = async () => {
      try {
        const res = await axiosClient.get('/api/admin/ai-settings');
        if (res.data?.success && res.data.activeProvider) {
          setActiveAiProvider(res.data.activeProvider);
        }
      } catch (e) {
        // silent
      }
    };
    fetchAiStatus();

    const handleAiChanged = (e: any) => {
      if (e.detail?.provider) {
        setActiveAiProvider(e.detail.provider);
      }
    };
    window.addEventListener('ai-provider-changed', handleAiChanged);
    return () => window.removeEventListener('ai-provider-changed', handleAiChanged);
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: 'gemini-3.8-flash'
    }
  ]);

  // Context-aware dynamic quick prompts
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

  // Controlled Chat Scroll:
  // - When sending: scroll to bottom to show sent user message
  // - When AI responds: scroll smoothly to top of new AI response so physician can read from the start
  useEffect(() => {
    if (messages.length <= 1) return;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg.sender === 'user') {
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 40);
    } else if (lastMsg.sender === 'ai') {
      setTimeout(() => {
        if (latestMessageRef.current && chatContainerRef.current) {
          const containerRect = chatContainerRef.current.getBoundingClientRect();
          const messageRect = latestMessageRef.current.getBoundingClientRect();
          const offset = messageRect.top - containerRect.top;
          const targetScroll = chatContainerRef.current.scrollTop + offset - 16;

          chatContainerRef.current.scrollTo({
            top: Math.max(0, targetScroll),
            behavior: 'smooth',
          });
        }
      }, 40);
    }
  }, [messages]);

  const handleSelectPatient = (newId: string) => {
    setSelectedPatientId(newId);

    if (newId === 'general') {
      const switchMsg: Message = {
        sender: 'ai',
        text: `🌐 **General Clinical Consultation Mode Enabled**\n\nNo specific patient record attached. You have complete room to explore diabetic pharmacotherapy, molecular pharmacology, bio-equivalents, renal adjustments, or adverse interactions freely.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'gemini-3.8-flash'
      };
      setMessages((prev) => [...prev, switchMsg]);
      toast.info('Switched to General Consultation mode.');
    } else {
      const rec = historyList.find((h) => h.id === newId);
      const name = newId === 'active' ? (currentPatientInput?.patientName || 'Current Patient') : (rec?.patientName || 'Patient');
      const disease = newId === 'active' ? (currentPatientInput?.disease || 'Metabolic Case') : (rec?.disease || 'Metabolic Case');
      const score = newId === 'active' ? (analysisResult?.safetyScore ?? 85) : (rec?.safetyScore ?? 80);
      const risk = newId === 'active' ? (analysisResult?.riskCategory ?? 'Assessed') : (rec?.risk ?? 'Assessed');
      const medList = newId === 'active'
        ? (analysisResult?.medications || currentPatientInput?.medications || [])
        : (rec?.analysisResult?.medications || rec?.patientInput?.medications || []);

      const switchMsg: Message = {
        sender: 'ai',
        text: `🔄 **Consultation Context Switched: ${name}**\n\n* 📋 **Diagnosis**: ${disease}\n* 🛡️ **Pre-analyzed Safety Score**: ${score}/100 (${risk})\n* 💊 **Prescribed Drugs**: ${medList.length} medications loaded.\n\nAll pre-analyzed patient parameters (vitals, lab biomarkers, flagged drug interactions) are now active in context. What would you like to review or modify regarding this patient?`,
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
          text: `⚠️ **Clinical Communication Error**: ${err.message || 'Could not reach AI engine'}. Please verify connection or active token.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: 'error'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success('Clinical note copied to clipboard');
      setTimeout(() => setCopiedIndex(null), 2500);
    }
  };

  const handleResetChat = () => {
    setSelectedPatientId('general');
    setShowPatientDetails(false);
    setMobileContextOpen(false);
    try {
      router.replace('/ai-chat', { scroll: false });
    } catch (e) { }
    const generalGreeting = `${greeting} 🌐 **General Clinical Consultation Mode Enabled**\n\nNo specific patient record attached. You have complete room to explore diabetic pharmacotherapy, molecular pharmacology, bio-equivalents, organ-adjusted dosing, or drug interactions freely.\n\nWhat clinical dilemma would you like to review?`;
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderPatientDossierAndControls = () => (
    <Stack spacing={2}>
      {/* Patient Selector & Collapsible Clinical Data */}
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: 1.5,
          bgcolor: 'background.paper',
          borderColor: 'divider',
          boxShadow: mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.05)',
        }}
      >
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={0.5}>
            <Stack direction="row" alignItems="center" spacing={0.8}>
              <Person sx={{ color: '#6366F1', fontSize: 18 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.74rem', letterSpacing: '0.04em' }}>
                Select Patient from History:
              </Typography>
            </Stack>

            {activePatientName && (
              <Button
                size="small"
                onClick={() => setShowPatientDetails(!showPatientDetails)}
                endIcon={showPatientDetails ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                sx={{
                  fontSize: '0.74rem',
                  py: 0.2,
                  px: 1,
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
              onChange={(e) => {
                handleSelectPatient(e.target.value);
                if (isMobile) setMobileContextOpen(false);
              }}
              sx={{
                bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                fontSize: '0.85rem',
                borderRadius: 1.5,
                fontWeight: 700,
                '& .MuiSelect-select': { py: 0.9, display: 'flex', alignItems: 'center', gap: 1 }
              }}
            >
              {/* Active on-screen patient (if exists) */}
              {currentPatientInput?.patientName && (
                <MenuItem value="active">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Chip label="Current Screen" size="small" color="primary" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800 }} />
                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.84rem' }}>
                      {currentPatientInput.patientName} ({currentPatientInput.disease || 'Active Session'})
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
                      <Typography variant="body2" noWrap sx={{ fontWeight: 700, fontSize: '0.84rem' }}>
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
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.84rem' }}>
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
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: mode === 'dark' ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
                  border: '1px solid',
                  borderColor: activeStatusColor ? `${activeStatusColor}55` : 'divider',
                  mt: 1,
                }}
              >
                <Stack spacing={1.2}>
                  {/* Patient Name, Condition & Safety Score */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, fontSize: '0.92rem', lineHeight: 1.2 }}>
                        {activePatientName} {activePatientInput?.age ? `(${activePatientInput.age}Y ${activePatientInput.gender || ''})` : ''}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.76rem' }}>
                        {activePatientInput?.disease || 'Metabolic Case'}
                      </Typography>
                    </Box>
                    {activeSafetyScore !== undefined && (
                      <Chip
                        icon={<Speed sx={{ fontSize: '13px !important', color: '#FFF !important' }} />}
                        label={`Score: ${activeSafetyScore}/100 • ${activeRiskCategory || 'Assessed'}`}
                        size="small"
                        sx={{
                          bgcolor: activeStatusColor,
                          color: '#FFF',
                          fontWeight: 800,
                          fontSize: '0.7rem',
                          height: 24,
                        }}
                      />
                    )}
                  </Box>

                  {/* Quick Biomarkers & Vitals row */}
                  <Stack direction="row" spacing={0.6} flexWrap="wrap" sx={{ gap: 0.6 }}>
                    {activePatientInput?.bpSystolic && (
                      <Chip
                        label={`BP: ${activePatientInput.bpSystolic}/${activePatientInput.bpDiastolic || '?'}`}
                        size="small"
                        sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700 }}
                      />
                    )}
                    {activePatientInput?.hba1c && (
                      <Chip
                        label={`HbA1c: ${activePatientInput.hba1c}%`}
                        size="small"
                        color="warning"
                        variant="outlined"
                        sx={{ height: 22, fontSize: '0.72rem', fontWeight: 800 }}
                      />
                    )}
                    {activePatientInput?.egfr && (
                      <Chip
                        label={`eGFR: ${activePatientInput.egfr} mL/min`}
                        size="small"
                        color={Number(activePatientInput.egfr) < 45 ? 'error' : 'info'}
                        variant="outlined"
                        sx={{ height: 22, fontSize: '0.72rem', fontWeight: 800 }}
                      />
                    )}
                    {activePatientInput?.allergies && activePatientInput.allergies !== 'None' && (
                      <Chip
                        label={`Allergy: ${activePatientInput.allergies}`}
                        size="small"
                        color="error"
                        sx={{ height: 22, fontSize: '0.72rem', fontWeight: 800 }}
                      />
                    )}
                  </Stack>

                  <Divider sx={{ my: 0.5 }} />

                  {/* Pre-Analyzed Medications & Flagged Interactions */}
                  <Stack spacing={0.8}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.72rem' }}>
                      PRE-ANALYZED MEDICATIONS ({(activeAnalysis?.medications || activePatientInput?.medications || []).length}):
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(activeAnalysis?.medications || activePatientInput?.medications || []).map((m: any, idx: number) => (
                        <Chip
                          key={idx}
                          label={`${m.name || m.drugName} ${m.dosage || m.dose || ''}`}
                          size="small"
                          variant="outlined"
                          sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700 }}
                        />
                      ))}
                    </Box>

                    {activeAnalysis?.flaggedInteractions && activeAnalysis.flaggedInteractions.length > 0 && (
                      <Box sx={{ mt: 0.5, p: 1, bgcolor: 'rgba(239, 68, 68, 0.08)', borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#EF4444', fontSize: '0.72rem', display: 'block', mb: 0.3 }}>
                          FLAGGED DRUG INTERACTIONS:
                        </Typography>
                        {activeAnalysis.flaggedInteractions.map((item, idx) => (
                          <Typography key={idx} variant="caption" sx={{ display: 'block', fontSize: '0.72rem', color: '#EF4444', lineHeight: 1.4 }}>
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
      </Paper>

      {/* Dynamic Quick Consultation Prompts */}
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: 1.5,
          bgcolor: 'background.paper',
          borderColor: 'divider',
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', fontSize: '0.72rem', letterSpacing: '0.04em', display: 'block', mb: 1.2 }}>
          Clinical Query Quick Select ({activePatientName || 'General'}):
        </Typography>
        <Stack spacing={1}>
          {dynamicQuickPrompts.map((promptText, idx) => (
            <Button
              key={idx}
              variant="outlined"
              size="small"
              onClick={() => {
                handleSend(promptText);
                if (isMobile) setMobileContextOpen(false);
              }}
              disabled={isTyping}
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                textTransform: 'none',
                borderRadius: 1.5,
                fontSize: '0.78rem',
                fontWeight: 700,
                py: 0.8,
                px: 1.2,
                color: 'text.primary',
                borderColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                '&:hover': {
                  borderColor: '#4F46E5',
                  bgcolor: mode === 'dark' ? 'rgba(79, 70, 229, 0.15)' : 'rgba(79, 70, 229, 0.08)',
                  color: '#4F46E5',
                }
              }}
            >
              <AutoAwesome sx={{ fontSize: 14, mr: 1, color: '#6366F1', flexShrink: 0 }} />
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.78rem' }} noWrap>
                {promptText}
              </Typography>
            </Button>
          ))}
        </Stack>
      </Paper>

      {/* Physician Profile Card */}
      {currentUser && (
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: currentUser.role === 'Doctor' ? '#00C9A7' : '#6C5CE7',
                fontWeight: 800,
                fontSize: '0.9rem'
              }}
            >
              {currentUser.name.replace(/^(Dr\.|Nurse|Dietitian)\s*/i, '').slice(0, 2).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.84rem' }} noWrap>
                {currentUser.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                {currentUser.role} • {currentUser.department}
              </Typography>
            </Box>
            <Chip
              icon={<Shield sx={{ fontSize: '11px !important', color: '#10B981 !important' }} />}
              label="Active Session"
              size="small"
              sx={{ height: 20, fontSize: '0.64rem', fontWeight: 800, bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}
            />
          </Stack>
        </Paper>
      )}
    </Stack>
  );

  return (
    <Box sx={{ minHeight: '100vh', pb: { xs: 2, md: 4 }, bgcolor: 'background.default', color: 'text.primary' }}>
      {/* Top Header */}
      {currentUser && (
        <Header
          mode={mode}
          onToggleMode={toggleColorMode}
          onNewRx={() => router.push('/')}
          onUploadClick={() => router.push('/')}
          onOpenCopilot={() => { }}
          activeModuleTab={-1}
          currentUser={currentUser}
          onLogout={async () => {
            await logout();
            router.push('/login');
          }}
          onOpenManageStaff={() => router.push('/staff-management')}
          onHomeClick={() => router.push('/')}
        />
      )}

      <Container maxWidth="xl" sx={{ pt: { xs: '76px', sm: '96px' }, px: { xs: 1.5, sm: 3 } }}>
        {/* Top Hero Breadcrumb Banner */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.2, sm: 2 },
            mb: { xs: 1.5, sm: 2.5 },
            borderRadius: 1.5,
            bgcolor: mode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(241, 245, 249, 0.95)',
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 1.5 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBack />}
              onClick={() => router.push('/')}
              sx={{
                borderRadius: 1,
                fontWeight: 700,
                borderColor: 'divider',
                color: 'text.primary',
                fontSize: { xs: '0.74rem', sm: '0.8rem' },
                px: { xs: 1, sm: 1.5 },
                py: 0.4
              }}
            >
              Dashboard
            </Button>
            <Divider orientation="vertical" flexItem sx={{ height: 22, alignSelf: 'center', display: { xs: 'none', sm: 'block' } }} />
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: { xs: 32, sm: 38 },
                  height: { xs: 32, sm: 38 },
                  borderRadius: 1.2,
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                  flexShrink: 0
                }}
              >
                <Psychology sx={{ fontSize: { xs: 19, sm: 24 } }} />
              </Box>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2, fontSize: { xs: '0.88rem', sm: '1.05rem' } }}>
                    Prof. Dr. Arpan AI
                  </Typography>
                  <Tooltip title={isAdmin ? "Admin: Click to switch between Google Gemini and DeepSeek AI" : `Active Engine: ${activeAiProvider === 'deepseek' ? 'DeepSeek AI' : 'Google Gemini'}`} arrow>
                    <Chip
                      icon={
                        activeAiProvider === 'deepseek' ? (
                          <Psychology sx={{ fontSize: '13px !important', color: '#818CF8 !important' }} />
                        ) : (
                          <AutoAwesome sx={{ fontSize: '11px !important', color: '#10B981 !important' }} />
                        )
                      }
                      label={activeAiProvider === 'deepseek' ? 'DeepSeek-V3 • Extreme Medical AI' : 'Gemini 3.8 Flash • Extreme Medical AI'}
                      size="small"
                      onClick={() => isAdmin && setAiSwitcherOpen(true)}
                      sx={{
                        bgcolor: activeAiProvider === 'deepseek' ? 'rgba(79, 70, 229, 0.18)' : 'rgba(16, 185, 129, 0.15)',
                        color: activeAiProvider === 'deepseek' ? '#A5B4FC' : '#10B981',
                        fontWeight: 800,
                        fontSize: '0.64rem',
                        height: 22,
                        border: activeAiProvider === 'deepseek' ? '1px solid rgba(79, 70, 229, 0.35)' : '1px solid rgba(16, 185, 129, 0.3)',
                        cursor: isAdmin ? 'pointer' : 'default',
                        display: { xs: 'none', md: 'flex' }
                      }}
                    />
                  </Tooltip>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  Diabetic &amp; Metabolic Pharmacotherapy Colleague • Organ Dosing • Interactions
                </Typography>
              </Box>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            {isAdmin && (
              <Tooltip title="Admin: Switch between Google Gemini and DeepSeek AI" arrow>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  startIcon={activeAiProvider === 'deepseek' ? <Psychology /> : <AutoAwesome />}
                  onClick={() => setAiSwitcherOpen(true)}
                  sx={{
                    borderRadius: 1,
                    fontWeight: 700,
                    fontSize: { xs: '0.72rem', sm: '0.75rem' },
                    px: { xs: 1, sm: 1.5 },
                    py: 0.4,
                    whiteSpace: 'nowrap'
                  }}
                >
                  AI: {activeAiProvider === 'deepseek' ? 'DeepSeek' : 'Gemini'}
                </Button>
              </Tooltip>
            )}

            <Tooltip title="Reset consultation to General Clinical Mode" arrow>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                startIcon={<DeleteOutline />}
                onClick={handleResetChat}
                sx={{
                  borderRadius: 1,
                  fontWeight: 700,
                  fontSize: { xs: '0.72rem', sm: '0.75rem' },
                  px: { xs: 1, sm: 1.5 },
                  py: 0.4,
                  whiteSpace: 'nowrap'
                }}
              >
                Reset Chat
              </Button>
            </Tooltip>
          </Stack>
        </Paper>

        {/* ─── Mobile Collapsible Patient Context Card ─── */}
        <Paper
          variant="outlined"
          sx={{
            display: { xs: 'block', lg: 'none' },
            mb: 1.5,
            borderRadius: 1.5,
            bgcolor: 'background.paper',
            borderColor: 'divider',
            overflow: 'hidden'
          }}
        >
          <Box
            onClick={() => setMobileContextOpen(!mobileContextOpen)}
            sx={{
              p: 1.2,
              px: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(79, 70, 229, 0.04)',
              '&:hover': { bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(79, 70, 229, 0.08)' }
            }}
          >
            <Stack direction="row" alignItems="center" spacing={0.8} sx={{ minWidth: 0, overflow: 'hidden' }}>
              {activePatientName ? (
                <Person sx={{ color: '#6366F1', fontSize: 18, flexShrink: 0 }} />
              ) : (
                <LocalHospital sx={{ color: '#10B981', fontSize: 18, flexShrink: 0 }} />
              )}
              <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', fontSize: '0.7rem', flexShrink: 0 }}>
                {activePatientName ? 'Patient:' : 'Mode:'}
              </Typography>
              <Typography
                variant="body2"
                noWrap
                sx={{
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  color: activePatientName ? 'text.primary' : '#10B981'
                }}
              >
                {activePatientName || 'General Clinical Consultation'}
              </Typography>
              {activeSafetyScore !== undefined && (
                <Chip
                  label={`${activeSafetyScore}/100`}
                  size="small"
                  sx={{ height: 18, fontSize: '0.64rem', fontWeight: 800, bgcolor: activeStatusColor, color: '#FFF', flexShrink: 0 }}
                />
              )}
            </Stack>

            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0, ml: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#4F46E5', fontSize: '0.72rem' }}>
                {mobileContextOpen ? 'Hide' : (activePatientName ? 'Change / Vitals' : 'Select Patient')}
              </Typography>
              {mobileContextOpen ? <ExpandLess sx={{ fontSize: 18, color: '#4F46E5' }} /> : <ExpandMore sx={{ fontSize: 18, color: '#4F46E5' }} />}
            </Stack>
          </Box>

          <Collapse in={mobileContextOpen}>
            <Box sx={{ p: 1.5, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
              {renderPatientDossierAndControls()}
            </Box>
          </Collapse>
        </Paper>

        {/* ─── Two-Column Full-Page Layout ────────────────────────────────────────── */}
        <Grid container spacing={{ xs: 1.5, lg: 3 }}>
          {/* ─── LEFT COLUMN: Visible on Desktop (lg+) ─── */}
          <Grid item xs={12} lg={4.2} xl={3.8} sx={{ display: { xs: 'none', lg: 'block' } }}>
            {renderPatientDossierAndControls()}
          </Grid>

          {/* ─── RIGHT COLUMN: Spacious Conversation Arena ─── */}
          <Grid item xs={12} lg={7.8} xl={8.2}>
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: { xs: 'calc(100dvh - 210px)', sm: 'calc(100vh - 225px)', lg: 'calc(100vh - 180px)' },
                minHeight: { xs: 440, sm: 500, md: 560 },
                bgcolor: 'background.paper',
                borderColor: 'divider',
                boxShadow: mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.06)',
              }}
            >
              {/* Arena Header */}
              <Box
                sx={{
                  px: { xs: 1.5, sm: 2.5 },
                  py: { xs: 1, sm: 1.5 },
                  bgcolor: mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : '#ffffff',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 1.5 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      sx={{
                        width: { xs: 32, sm: 38 },
                        height: { xs: 32, sm: 38 },
                        bgcolor: '#4F46E5',
                        boxShadow: '0 2px 10px rgba(79, 70, 229, 0.4)',
                      }}
                    >
                      <Psychology sx={{ fontSize: { xs: 20, sm: 24 }, color: '#FFF' }} />
                    </Avatar>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        bgcolor: '#10B981',
                        border: '2px solid #FFF',
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1.15, fontSize: { xs: '0.88rem', sm: '0.98rem' } }}>
                      Prof. Dr. Arpan AI
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.66rem', sm: '0.72rem' } }}>
                      Chief Physician • Clinical Pharmacologist
                    </Typography>
                  </Box>
                </Stack>

                {activePatientName ? (
                  <Chip
                    icon={<VerifiedUser sx={{ fontSize: '11px !important', color: '#4F46E5 !important' }} />}
                    label={`Context: ${activePatientName}`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(79, 70, 229, 0.1)',
                      color: '#4F46E5',
                      fontWeight: 800,
                      fontSize: { xs: '0.66rem', sm: '0.72rem' },
                      height: 22,
                      border: '1px solid rgba(79, 70, 229, 0.25)',
                    }}
                  />
                ) : (
                  <Chip
                    icon={<LocalHospital sx={{ fontSize: '11px !important', color: '#10B981 !important' }} />}
                    label="General Clinical Mode"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(16, 185, 129, 0.12)',
                      color: '#10B981',
                      fontWeight: 800,
                      fontSize: { xs: '0.66rem', sm: '0.72rem' },
                      height: 22,
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                    }}
                  />
                )}
              </Box>

              {/* Chat Messages Body with Smooth Scrolling */}
              <Box
                ref={chatContainerRef}
                sx={{
                  flex: 1,
                  p: { xs: 1.5, sm: 2, md: 3 },
                  overflowY: 'auto',
                  bgcolor: mode === 'dark' ? '#0b1120' : '#f8fafc',
                }}
              >
                <Stack spacing={{ xs: 2, sm: 3 }}>
                  {messages.map((m, i) => {
                    const isLatest = i === messages.length - 1;
                    return (
                      <Box
                        key={i}
                        ref={isLatest ? latestMessageRef : null}
                        sx={{
                          alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                          maxWidth: m.sender === 'user' ? { xs: '90%', sm: '82%', md: '75%' } : { xs: '100%', sm: '96%', md: '90%' },
                          width: 'auto',
                        }}
                      >
                        {/* Header Label */}
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
                                sx={{ p: 0.3, ml: 1, color: 'text.secondary' }}
                              >
                                {copiedIndex === i ? <Check sx={{ fontSize: 14, color: '#10B981' }} /> : <ContentCopy sx={{ fontSize: 13 }} />}
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>

                        {/* Message Bubble */}
                        <Paper
                          elevation={m.sender === 'user' ? 2 : 1}
                          sx={{
                            p: { xs: 1.5, sm: 2.2 },
                            borderRadius: m.sender === 'user' ? '16px 16px 3px 16px' : '16px 16px 16px 3px',
                            background:
                              m.sender === 'user'
                                ? 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%) !important'
                                : undefined,
                            bgcolor:
                              m.sender === 'user'
                                ? '#4F46E5 !important'
                                : mode === 'dark' ? '#1e293b' : '#ffffff',
                            color: m.sender === 'user' ? '#FFFFFF !important' : 'text.primary',
                            border:
                              m.sender === 'user'
                                ? '1px solid #4338CA'
                                : `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
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
                                fontSize: { xs: '0.88rem', sm: '0.94rem' },
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
                    );
                  })}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <Box sx={{ alignSelf: 'flex-start', maxWidth: '92%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, px: 0.5 }}>
                        <MedicalServices sx={{ fontSize: 13, color: '#4F46E5' }} />
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#4F46E5', fontSize: '0.72rem' }}>
                          Prof. Dr. Arpan AI
                        </Typography>
                      </Box>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          borderRadius: '16px 16px 16px 3px',
                          bgcolor: mode === 'dark' ? '#1e293b' : '#ffffff',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <CircularProgress size={15} sx={{ color: '#4F46E5' }} />
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary', fontStyle: 'italic' }}>
                            Prof. Dr. Arpan is evaluating pharmacokinetics, organ load &amp; interaction pathways...
                          </Typography>
                        </Stack>
                      </Paper>
                    </Box>
                  )}
                </Stack>
              </Box>

              {/* Horizontal Quick Prompts Bar on Mobile */}
              <Box
                sx={{
                  display: { xs: 'flex', lg: 'none' },
                  overflowX: 'auto',
                  py: 0.8,
                  px: 1,
                  gap: 0.8,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  bgcolor: mode === 'dark' ? 'rgba(15, 23, 42, 0.4)' : '#f1f5f9',
                  '&::-webkit-scrollbar': { display: 'none' },
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none',
                }}
              >
                {dynamicQuickPrompts.map((promptText, idx) => (
                  <Chip
                    key={idx}
                    icon={<AutoAwesome sx={{ fontSize: '11px !important', color: '#6366F1 !important' }} />}
                    label={promptText}
                    size="small"
                    onClick={() => handleSend(promptText)}
                    disabled={isTyping}
                    sx={{
                      flexShrink: 0,
                      height: 24,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#ffffff',
                      border: '1px solid',
                      borderColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(79, 70, 229, 0.15)',
                        borderColor: '#4F46E5',
                        color: '#4F46E5'
                      }
                    }}
                  />
                ))}
              </Box>

              {/* Bottom Consultation Input Bar */}
              <Box
                sx={{
                  p: { xs: 1, sm: 1.5, md: 2 },
                  bgcolor: mode === 'dark' ? '#0f172a' : '#ffffff',
                  borderTop: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="flex-end">
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    size="small"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Prof. Dr. Arpan about pharmacology, dosing..."
                    disabled={isTyping}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
                        borderRadius: 2,
                        fontSize: { xs: '0.86rem', sm: '0.92rem' },
                        py: 0.5,
                        '& fieldset': {
                          borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
                        },
                        '&:hover fieldset': {
                          borderColor: '#4F46E5',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#4F46E5',
                          borderWidth: '2px',
                        },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isTyping}
                    sx={{
                      height: { xs: 38, sm: 44 },
                      minWidth: { xs: 40, sm: 48 },
                      px: { xs: 1.2, sm: 2.2 },
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
                      boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                      fontWeight: 800,
                      textTransform: 'none',
                      '&:disabled': {
                        background: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      },
                    }}
                  >
                    {isTyping ? <CircularProgress size={18} sx={{ color: '#FFF' }} /> : <Send sx={{ fontSize: { xs: 18, sm: 22 } }} />}
                  </Button>
                </Stack>
                {/* <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 0.6, color: 'text.disabled', fontSize: { xs: '0.62rem', sm: '0.68rem' } }}>
                  Arpan Clinical AI provides peer-level clinical decision support. Always correlate with primary assessment.
                </Typography> */}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Admin AI Engine Switcher Modal */}
      {isAdmin && (
        <AdminAiSwitcherDialog
          open={aiSwitcherOpen}
          onClose={() => setAiSwitcherOpen(false)}
          onProviderChanged={(newP) => setActiveAiProvider(newP)}
        />
      )}
    </Box>
  );
}

export default function AiChatPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
          <CircularProgress color="primary" sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">Loading Clinical AI Workspace...</Typography>
        </Box>
      }
    >
      <AiChatView />
    </Suspense>
  );
}
