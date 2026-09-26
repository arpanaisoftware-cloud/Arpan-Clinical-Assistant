'use client';

import React, { useState, useContext, useEffect } from 'react';
import {
  Container,
  Box,
  Grid,
  Typography,
  Stack,
  Chip,
  Paper,
  Button,
  Avatar,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  AutoAwesome,
  Lock,
  SwapHoriz,
  MedicalServices,
  Restaurant,
  LocalPharmacy,
  SupervisorAccount,
  Logout,
  VerifiedUser,
  CheckCircle,
  ArrowForward
} from '@mui/icons-material';
import Header from '../components/Header';
import PatientPrescriptionForm from '../components/PatientPrescriptionForm';
import PrescriptionUploader from '../components/PrescriptionUploader';
import AiAnalysisDashboard from '../components/AiAnalysisDashboard';
import PrescriptionPreviewModal from '../components/PrescriptionPreviewModal';
import DoctorCopilotChat from '../components/DoctorCopilotChat';
import HistoryTable from '../components/HistoryTable';
import CounsellingModule from '../components/CounsellingModule';
import DietsModule from '../components/DietsModule';
import StaffManagementModule from '../components/StaffManagementModule';
import LoginScreen from '../components/LoginScreen';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { ColorModeContext } from '../theme/ThemeRegistry';
import { analyzePrescription, SAMPLE_CLINICAL_CASE } from '../mockData/aiAnalysisData';
import { PatientInput, AnalysisResult, HistoryRecord, UserRole, StaffUser, AuthUser } from '../types/clinical';
import { toast } from 'react-toastify';

export default function Home() {
  const router = useRouter();
  const { mode, toggleColorMode } = useContext(ColorModeContext);
  const {
    currentUser,
    staffList,
    login,
    logout,
    addStaffUser,
    toggleStaffStatus,
    updateStaffPermissions
  } = useAuth();

  // Active Module Tab: 0 = Prescription, 1 = Counselling, 2 = Diets, 3 = Staff Management
  const [activeModuleTab, setActiveModuleTab] = useState<number>(0);

  // Prescription Analysis State
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [printModalOpen, setPrintModalOpen] = useState<boolean>(false);
  const [copilotOpen, setCopilotOpen] = useState<boolean>(false);

  // Redirect to dedicated login page if not authenticated
  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    }
  }, [currentUser, router]);

  // If we are redirecting, don't render the dashboard to prevent flash
  if (!currentUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <CircularProgress color="primary" sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">Redirecting to login portal...</Typography>
      </Box>
    );
  }

  const handleLoginSuccess = (user: AuthUser) => {
    login(user);
    // Auto navigate to the first allowed tab based on permissions
    const perm = user.modulePermissions;
    if (perm === 'Full Access' || user.role === 'Doctor') {
      setActiveModuleTab(0);
    } else if (perm === 'Diets Only') {
      setActiveModuleTab(2);
    } else {
      setActiveModuleTab(1); // Counselling Only or Counselling + Diets
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('Logged out from Arpan Clinical Assistant.');
    router.push('/login');
  };

  const handleAnalyze = (formData: PatientInput) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const result = analyzePrescription(formData, formData.medications);
      setAnalysisResult(result);
      setIsAnalyzing(false);
      toast.success('AI Prescription Analysis Complete! View breakdown below.');

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

  const handleAddStaff = (newStaff: StaffUser) => {
    addStaffUser(newStaff);
  };

  const handleToggleStaffStatus = (staffId: string) => {
    toggleStaffStatus(staffId);
    toast.info('Staff status updated.');
  };

  const userRole = currentUser?.role || 'Doctor';
  const userPerm = currentUser?.modulePermissions || 'Full Access';

  // Permission Checkers
  const canAccessPrescriptions = userPerm === 'Full Access' || userRole === 'Doctor';
  const canAccessCounselling = userPerm === 'Counselling Only' || userPerm === 'Counselling + Diets' || userPerm === 'Full Access' || userRole === 'Doctor';
  const canAccessDiets = userPerm === 'Diets Only' || userPerm === 'Counselling + Diets' || userPerm === 'Full Access' || userRole === 'Doctor';
  const canAccessStaffMgmt = userPerm === 'Full Access' || userRole === 'Doctor';

  // Workspace Clinical Modules (Locked modules automatically move to last)
  const modulesList = [
    {
      id: 0,
      name: 'Prescription',
      desc: 'AI Drug Interaction Scan, Allergy Guard & Bio-Equivalents.',
      icon: <LocalPharmacy />,
      canAccess: canAccessPrescriptions,
      activeColor: '#00C9A7',
      bgActive: 'rgba(0, 201, 167, 0.12)',
      bgIcon: 'rgba(0, 201, 167, 0.15)',
      chipColor: 'primary' as const
    },
    {
      id: 1,
      name: 'Counselling',
      desc: 'Cardio, Retinopathy, Nephropathy, Neuropathy & Foot Risk.',
      icon: <MedicalServices />,
      canAccess: canAccessCounselling,
      activeColor: '#6C5CE7',
      bgActive: 'rgba(108, 92, 231, 0.12)',
      bgIcon: 'rgba(108, 92, 231, 0.15)',
      chipColor: 'secondary' as const
    },
    {
      id: 2,
      name: 'Diets & Nutrition',
      desc: 'BMI Targets, Electrolytes (Na, K, P) & 5-Meal Timeline.',
      icon: <Restaurant />,
      canAccess: canAccessDiets,
      activeColor: '#FFB703',
      bgActive: 'rgba(255, 183, 3, 0.12)',
      bgIcon: 'rgba(255, 183, 3, 0.15)',
      chipColor: 'warning' as const
    }
  ];

  // Sort: Accessible/unlocked modules first, locked modules last
  const sortedModules = [...modulesList].sort((a, b) => {
    if (a.canAccess === b.canAccess) return a.id - b.id;
    return a.canAccess ? -1 : 1;
  });

  return (
    <Box sx={{ minHeight: '100vh', pb: 8, bgcolor: 'background.default', color: 'text.primary' }}>
      {/* Header Bar (Clean top bar without inner tabs) - only show when logged in */}
      {currentUser && (
        <Header
          mode={mode}
          onToggleMode={toggleColorMode}
          onNewRx={handleNewRx}
          onUploadClick={() => {
            const el = document.getElementById('uploader-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenCopilot={() => setCopilotOpen(true)}
          activeModuleTab={activeModuleTab}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenManageStaff={() => router.push('/staff-management')}
        />
      )}

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        {/* LOGGED IN STATE: Render Modules & Dashboards */}
        <>
          {/* Top Hero Banner */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                mb: 3.5,
                borderRadius: 1,
                background: mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(0, 201, 167, 0.12) 0%, rgba(108, 92, 231, 0.18) 100%)'
                  : 'linear-gradient(135deg, rgba(0, 201, 167, 0.08) 0%, rgba(108, 92, 231, 0.08) 100%)',
                border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 201, 167, 0.25)',
                boxShadow: mode === 'dark' ? '0 12px 32px rgba(0, 0, 0, 0.3)' : '0 12px 32px rgba(0, 201, 167, 0.08)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Grid container spacing={3} alignItems="center" justifyContent="space-between">
                {/* Left Title & OS Identifier */}
                <Grid item xs={12} md={7}>
                  <Stack direction="row" alignItems="center" spacing={2}>

                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: 'text.primary' }}>
                        Welcome to Arpan Clinical Assistant
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.3 }}>
                        <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#00C9A7', display: 'inline-block' }} />
                        Patient Care & Clinical Management OS
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                {/* Right Profile & Active Permissions Card */}
                <Grid item xs={12} md={5}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid',
                      borderColor: userRole === 'Doctor' ? 'rgba(0, 201, 167, 0.35)' : 'rgba(108, 92, 231, 0.35)',
                      boxShadow: userRole === 'Doctor' ? '0 4px 20px rgba(0, 201, 167, 0.1)' : '0 4px 20px rgba(108, 92, 231, 0.1)'
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: userRole === 'Doctor' ? '#00C9A7' : '#6C5CE7',
                          color: '#FFF',
                          fontWeight: 800,
                          fontSize: '1.05rem',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                      >
                        {currentUser.name.replace('Dr. ', '').replace('Nurse ', '').slice(0, 2).toUpperCase()}
                      </Avatar>

                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.3}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {currentUser.name}
                          </Typography>
                          <Chip
                            label={currentUser.role}
                            size="small"
                            color={userRole === 'Doctor' ? 'primary' : 'secondary'}
                            sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20 }}
                          />
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                            ID: <strong>{currentUser.staffId}</strong>
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>•</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            {currentUser.department}
                          </Typography>
                        </Stack>

                        <Box sx={{ pt: 0.8, borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: userRole === 'Doctor' ? '#00C9A7' : '#6C5CE7', letterSpacing: 0.5 }}>
                            PERMISSIONS:
                          </Typography>
                          <Chip
                            icon={<VerifiedUser sx={{ fontSize: '12px !important' }} />}
                            label={userPerm}
                            size="small"
                            variant="outlined"
                            color={userRole === 'Doctor' ? 'primary' : 'secondary'}
                            sx={{ fontWeight: 800, fontSize: '0.7rem', height: 22 }}
                          />
                        </Box>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>

            {/* MAIN WORKSPACE MODULE SELECTOR CARDS (3 CLINICAL MODULES) - Only show when NOT in Staff Management */}
            {activeModuleTab !== 3 && (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Clinical Workspaces & Active Modules:
                </Typography>

                <Grid container spacing={2.5} mb={4}>
                  {sortedModules.map((mod, index) => (
                    <Grid item xs={12} sm={4} key={mod.id}>
                      <Tooltip
                        title={mod.canAccess ? `Switch to ${mod.name} module workspace` : `${mod.name} module is locked for '${userPerm}' permissions`}
                        arrow
                        placement="top"
                      >
                        <Paper
                          variant="outlined"
                          onClick={() => mod.canAccess && setActiveModuleTab(mod.id)}
                          sx={{
                            p: 2.5,
                            borderRadius: 1.5,
                            cursor: mod.canAccess ? 'pointer' : 'not-allowed',
                            bgcolor: activeModuleTab === mod.id ? mod.bgActive : 'background.paper',
                            borderColor: activeModuleTab === mod.id ? mod.activeColor : mod.canAccess ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 77, 109, 0.3)',
                            borderWidth: activeModuleTab === mod.id ? 2 : 1,
                            transition: 'all 0.2s ease-in-out',
                            opacity: mod.canAccess ? 1 : 0.6,
                            '&:hover': {
                              borderColor: mod.canAccess ? mod.activeColor : 'rgba(255, 77, 109, 0.5)',
                              transform: mod.canAccess ? 'translateY(-3px)' : 'none'
                            }
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                            <Box sx={{ width: 42, height: 42, borderRadius: 1.5, bgcolor: mod.bgIcon, color: mod.activeColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {mod.icon}
                            </Box>
                            <Chip
                              label={mod.canAccess ? (activeModuleTab === mod.id ? 'ACTIVE' : 'READY') : 'LOCKED'}
                              size="small"
                              color={mod.canAccess ? (activeModuleTab === mod.id ? mod.chipColor : 'default') : 'error'}
                              sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                            />
                          </Stack>
                          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', mb: 0.5 }}>
                            {index + 1}. {mod.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
                            {mod.desc}
                          </Typography>
                        </Paper>
                      </Tooltip>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {/* MODULE 0: PRESCRIPTION MODULE */}
            {activeModuleTab === 0 && (
              <Box>
                {canAccessPrescriptions ? (
                  <>
                    {/* Prescription Form + Scanner */}
                    <Grid container spacing={3.5} mb={4}>
                      <Grid item xs={12} lg={8}>
                        <PatientPrescriptionForm onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
                      </Grid>

                      <Grid item xs={12} lg={4} id="uploader-section">
                        <PrescriptionUploader onAutoExtract={handleAutoExtract} />
                      </Grid>
                    </Grid>

                    {/* AI Analysis Dashboard */}
                    {analysisResult && (
                      <Box id="analysis-dashboard-section" sx={{ mt: 4 }}>
                        <AiAnalysisDashboard
                          analysisResult={analysisResult}
                          onOpenPrintModal={() => setPrintModalOpen(true)}
                          onOpenCopilot={() => setCopilotOpen(true)}
                        />
                      </Box>
                    )}

                    {/* History Table */}
                    {/* <HistoryTable onLoadRecord={handleLoadHistoryRecord} /> */}
                  </>
                ) : (
                  /* Module Permission Restricted Card */
                  <Paper variant="outlined" sx={{ p: 5, borderRadius: 1, textAlign: 'center', bgcolor: 'rgba(255, 77, 109, 0.04)', borderColor: 'rgba(255, 77, 109, 0.3)', my: 4 }}>
                    <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'rgba(255, 77, 109, 0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <Lock sx={{ color: '#FF4D6D', fontSize: 36 }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#FF4D6D' }}>
                      Prescription Module Access Restricted
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
                      Logged in as <strong>{currentUser.name}</strong> with <strong>'{userPerm}'</strong> permissions. Prescription creation is restricted.
                    </Typography>

                    <Stack direction="row" spacing={2} justifyContent="center">
                      {canAccessCounselling && (
                        <Button variant="contained" color="secondary" startIcon={<MedicalServices />} onClick={() => setActiveModuleTab(1)}>
                          Open Counselling Module
                        </Button>
                      )}
                      {canAccessDiets && (
                        <Button variant="outlined" color="primary" startIcon={<Restaurant />} onClick={() => setActiveModuleTab(2)}>
                          Open Diets Module
                        </Button>
                      )}
                    </Stack>
                  </Paper>
                )}
              </Box>
            )}

            {/* MODULE 1: COUNSELLING MODULE */}
            {activeModuleTab === 1 && (
              <Box sx={{ mt: 2 }}>
                {canAccessCounselling ? (
                  <CounsellingModule
                    patientName={analysisResult?.patientInfo?.patientName || 'Robert Vance'}
                    patientAge={analysisResult?.patientInfo?.age || 58}
                    patientDisease={analysisResult?.patientInfo?.disease || 'Essential Hypertension, Type 2 Diabetes'}
                  />
                ) : (
                  <Paper variant="outlined" sx={{ p: 5, borderRadius: 1, textAlign: 'center', bgcolor: 'rgba(255, 77, 109, 0.04)', borderColor: 'rgba(255, 77, 109, 0.3)', my: 4 }}>
                    <Lock sx={{ color: '#FF4D6D', fontSize: 40, mb: 1 }} />
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#FF4D6D' }}>
                      Counselling Module Access Restricted
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 2 }}>
                      Your account <strong>{currentUser.name}</strong> is currently assigned <strong>'{userPerm}'</strong> permissions.
                    </Typography>
                    {canAccessDiets && (
                      <Button variant="contained" color="primary" startIcon={<Restaurant />} onClick={() => setActiveModuleTab(2)}>
                        Switch to Diets Module
                      </Button>
                    )}
                  </Paper>
                )}
              </Box>
            )}

            {/* MODULE 2: DIETS MODULE */}
            {activeModuleTab === 2 && (
              <Box sx={{ mt: 2 }}>
                {canAccessDiets ? (
                  <DietsModule
                    patientName={analysisResult?.patientInfo?.patientName || 'Robert Vance'}
                    patientAge={analysisResult?.patientInfo?.age || 58}
                    patientDisease={analysisResult?.patientInfo?.disease || 'Essential Hypertension, Type 2 Diabetes'}
                  />
                ) : (
                  <Paper variant="outlined" sx={{ p: 5, borderRadius: 1, textAlign: 'center', bgcolor: 'rgba(255, 77, 109, 0.04)', borderColor: 'rgba(255, 77, 109, 0.3)', my: 4 }}>
                    <Lock sx={{ color: '#FF4D6D', fontSize: 40, mb: 1 }} />
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#FF4D6D' }}>
                      Diets Module Access Restricted
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 2 }}>
                      Your account <strong>{currentUser.name}</strong> is currently assigned <strong>'{userPerm}'</strong> permissions.
                    </Typography>
                    {canAccessCounselling && (
                      <Button variant="contained" color="secondary" startIcon={<MedicalServices />} onClick={() => setActiveModuleTab(1)}>
                        Switch to Counselling Module
                      </Button>
                    )}
                  </Paper>
                )}
              </Box>
            )}

            {/* STAFF & USER MANAGEMENT CENTER PAGE (ACCESSED VIA HEADER BUTTON) */}
            {activeModuleTab === 3 && (
              <Box sx={{ mt: 2 }}>
                <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 1, bgcolor: 'rgba(108, 92, 231, 0.08)', borderColor: '#6C5CE7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#6C5CE7' }}>
                    Admin Staff & User Management Workspace
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ArrowForward sx={{ transform: 'rotate(180deg)' }} />}
                    onClick={() => setActiveModuleTab(0)}
                    sx={{ borderRadius: 1, fontWeight: 800 }}
                  >
                    Return to Patient Clinical Workspaces
                  </Button>
                </Paper>

                {canAccessStaffMgmt ? (
                  <StaffManagementModule
                    staffList={staffList}
                    onAddStaff={handleAddStaff}
                    onToggleStatus={handleToggleStaffStatus}
                  />
                ) : (
                  <Paper variant="outlined" sx={{ p: 5, borderRadius: 1, textAlign: 'center', bgcolor: 'rgba(255, 77, 109, 0.04)', borderColor: 'rgba(255, 77, 109, 0.3)', my: 4 }}>
                    <Lock sx={{ color: '#FF4D6D', fontSize: 40, mb: 1 }} />
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#FF4D6D' }}>
                      Staff & User Management Restricted to Doctor Access
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 2 }}>
                      Your account <strong>{currentUser.name}</strong> has <strong>'{userPerm}'</strong> permissions. Admin staff management is reserved for attending Physicians.
                    </Typography>
                  </Paper>
                )}
              </Box>
            )}
          </>
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
