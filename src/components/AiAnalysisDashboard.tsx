'use client';

import React, { useState, SyntheticEvent } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  Chip,
  Stack,
  Tabs,
  Tab,
  Paper,
  Divider,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  Shield,
  Warning,
  CompareArrows,
  Schedule,
  Restaurant,
  LocalPharmacy,
  Print,
  CheckCircle,
  Info,
  Psychology,
  MonetizationOn
} from '@mui/icons-material';
import confetti from 'canvas-confetti';
import { AnalysisResult } from '../types/clinical';

interface AiAnalysisDashboardProps {
  analysisResult: AnalysisResult | null;
  onOpenPrintModal: () => void;
  onOpenCopilot: () => void;
}

export default function AiAnalysisDashboard({
  analysisResult,
  onOpenPrintModal,
  onOpenCopilot
}: AiAnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState<number>(0);

  if (!analysisResult) return null;

  const {
    patientInfo,
    medications,
    safetyScore,
    riskCategory,
    statusColor,
    flaggedAllergies,
    flaggedInteractions,
    alternativesList,
    dosageTimeline,
    dietLifestyleDos,
    dietLifestyleDonts,
    aiClinicalOverview,
    estimatedMonthlySavings,
    timestamp
  } = analysisResult;

  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  const handleTabChange = (_e: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)',
        background: 'linear-gradient(180deg, rgba(16, 24, 44, 0.95) 0%, rgba(10, 15, 29, 0.98) 100%)',
        border: '1px solid rgba(0, 201, 167, 0.3)'
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
        {/* Header Summary Banner */}
        <Grid container spacing={3} alignItems="center" mb={3}>
          <Grid item xs={12} md={7}>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
              <Chip
                icon={<Shield sx={{ color: '#FFF !important' }} />}
                label={riskCategory}
                sx={{
                  bgcolor: statusColor,
                  color: '#FFF',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  px: 1
                }}
              />
              <Typography variant="caption" color="text.secondary" suppressHydrationWarning>
                Analysis Completed • {timestamp}
              </Typography>
            </Stack>

            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              AI Clinical Analysis & Recommendations
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Patient: <strong>{patientInfo.patientName || 'Patient'}</strong> ({patientInfo.age} y/o, {patientInfo.gender}) • Diagnosis: <strong>{patientInfo.disease}</strong>
            </Typography>
          </Grid>

          {/* Safety Score Meter Card */}
          <Grid item xs={12} md={5}>
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.03)',
                borderColor: statusColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>
                  Safety & Compatibility Score
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: statusColor }}>
                  {safetyScore}<Typography component="span" variant="h5" color="text.secondary">/100</Typography>
                </Typography>
                <Typography variant="caption" sx={{ color: statusColor, fontWeight: 600 }}>
                  {flaggedAllergies.length + flaggedInteractions.length === 0 ? "Perfect Compatibility" : `${flaggedAllergies.length + flaggedInteractions.length} Warning(s) Flagged`}
                </Typography>
              </Box>

              <Stack direction="column" spacing={1} alignItems="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  startIcon={<Print />}
                  onClick={() => {
                    triggerConfetti();
                    onOpenPrintModal();
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  Print Digital Rx
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  startIcon={<Psychology />}
                  onClick={onOpenCopilot}
                >
                  Ask Copilot
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* Dynamic Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<Info />} iconPosition="start" label="Overview & Insights" />
            <Tab icon={<CompareArrows />} iconPosition="start" label={`Alternatives & Generics (${alternativesList.length})`} />
            <Tab
              icon={<Warning sx={{ color: flaggedInteractions.length > 0 || flaggedAllergies.length > 0 ? '#FF4D6D' : undefined }} />}
              iconPosition="start"
              label={`Interactions & Risks (${flaggedInteractions.length + flaggedAllergies.length})`}
            />
            <Tab icon={<Schedule />} iconPosition="start" label="Dosage Schedule" />
            <Tab icon={<Restaurant />} iconPosition="start" label="Diet & Lifestyle" />
          </Tabs>
        </Box>

        {/* TAB 0: Clinical Overview */}
        {activeTab === 0 && (
          <Box>
            <Alert severity={flaggedAllergies.length > 0 ? "error" : flaggedInteractions.length > 0 ? "warning" : "success"} sx={{ mb: 3, borderRadius: 3 }}>
              <AlertTitle sx={{ fontWeight: 800 }}>Clinical Assessment Overview</AlertTitle>
              {aiClinicalOverview}
            </Alert>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}>
                  <MonetizationOn sx={{ color: '#00C9A7', fontSize: 36, mb: 0.5 }} />
                  <Typography variant="subtitle2" color="text.secondary">Est. Monthly Savings</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#00C9A7' }}>
                    {estimatedMonthlySavings}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}>
                  <LocalPharmacy sx={{ color: '#6C5CE7', fontSize: 36, mb: 0.5 }} />
                  <Typography variant="subtitle2" color="text.secondary">Prescribed Agents</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {medications.length} Drugs
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}>
                  <Warning sx={{ color: flaggedInteractions.length > 0 ? '#FFB703' : '#00C9A7', fontSize: 36, mb: 0.5 }} />
                  <Typography variant="subtitle2" color="text.secondary">Drug Conflicts</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: flaggedInteractions.length > 0 ? '#FFB703' : '#00C9A7' }}>
                    {flaggedInteractions.length} Flagged
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}>
                  <Shield sx={{ color: flaggedAllergies.length > 0 ? '#FF4D6D' : '#00C9A7', fontSize: 36, mb: 0.5 }} />
                  <Typography variant="subtitle2" color="text.secondary">Allergy Conflicts</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: flaggedAllergies.length > 0 ? '#FF4D6D' : '#00C9A7' }}>
                    {flaggedAllergies.length} Critical
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 1: Alternatives & Generic Suggestions */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Recommended Alternative & Generic Substitutions
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Compare original prescribed drugs with lower-cost generic bio-equivalents and safer therapeutic class alternatives.
            </Typography>

            <Stack spacing={3}>
              {alternativesList.map((item, idx) => (
                <Paper key={idx} variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#00C9A7' }}>
                        Prescribed: {item.prescribedMed}
                      </Typography>
                      <Chip label={`Category: ${item.category}`} size="small" sx={{ mt: 0.5 }} />
                    </Box>
                  </Stack>

                  <Grid container spacing={2}>
                    {item.options.map((alt, altIdx) => (
                      <Grid item xs={12} md={6} key={altIdx}>
                        <Card variant="outlined" sx={{ p: 2, borderRadius: 3, borderLeft: '4px solid #6C5CE7' }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {alt.name}
                              </Typography>
                              <Chip
                                label={alt.type}
                                size="small"
                                color="secondary"
                                sx={{ height: 20, fontSize: '0.7rem', mt: 0.5, mb: 1 }}
                              />
                            </Box>
                            <Chip
                              label={`Save ${alt.priceSavings}`}
                              size="small"
                              sx={{ bgcolor: 'rgba(0, 201, 167, 0.2)', color: '#00C9A7', fontWeight: 800 }}
                            />
                          </Stack>

                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', mb: 1 }}>
                            {alt.notes}
                          </Typography>

                          <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
                            <Typography variant="caption" color="text.secondary">
                              Mfr: {alt.manufacturer}
                            </Typography>
                            <Chip label={`Efficacy: ${alt.efficacy}`} size="small" variant="outlined" color="primary" />
                          </Stack>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}

        {/* TAB 2: Drug Interaction & Risk Scanner */}
        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Drug Interaction & Allergy Safety Checks
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Automated multi-drug conflict detection and patient allergy cross-referencing.
            </Typography>

            {flaggedAllergies.length === 0 && flaggedInteractions.length === 0 ? (
              <Alert severity="success" icon={<CheckCircle fontSize="inherit" />} sx={{ borderRadius: 3 }}>
                <AlertTitle sx={{ fontWeight: 800 }}>Clean Safety Record</AlertTitle>
                No harmful drug interactions or patient allergy conflicts detected in this prescription.
              </Alert>
            ) : (
              <Stack spacing={2}>
                {flaggedAllergies.map((alg, i) => (
                  <Alert severity="error" key={i} sx={{ borderRadius: 3 }}>
                    <AlertTitle sx={{ fontWeight: 800 }}>CRITICAL ALLERGY CONFLICT: {alg.medication}</AlertTitle>
                    {alg.message}
                  </Alert>
                ))}

                {flaggedInteractions.map((int, i) => (
                  <Paper key={i} variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderLeft: int.severity === 'High' ? '6px solid #FF4D6D' : '6px solid #FFB703' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        Conflict: {int.drugA} ⚡ {int.drugB}
                      </Typography>
                      <Chip
                        label={`${int.severity} Severity Risk`}
                        color={int.severity === 'High' ? 'error' : 'warning'}
                        size="small"
                        sx={{ fontWeight: 800 }}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" mb={1.5}>
                      <strong>Clinical Effect:</strong> {int.effect}
                    </Typography>
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      <strong>Recommendation:</strong> {int.recommendation}
                    </Alert>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        )}

        {/* TAB 3: Visual Dosage Schedule */}
        {activeTab === 3 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Visual Daily Dosage Matrix & Schedule
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Optimal administration times structured to maximize therapeutic efficacy and prevent gastric distress.
            </Typography>

            <Grid container spacing={2}>
              {/* Morning */}
              <Grid item xs={12} sm={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderTop: '4px solid #FFB703', minHeight: 180 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, color: '#FFB703', mb: 1.5 }}>
                    ☀️ Morning (Breakfast)
                  </Typography>
                  {dosageTimeline.morning.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">No morning doses</Typography>
                  ) : (
                    dosageTimeline.morning.map((d, i) => (
                      <Box key={i} sx={{ mb: 1.5, pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{d.name} ({d.dose})</Typography>
                        <Typography variant="caption" color="text.secondary">{d.timing}</Typography>
                      </Box>
                    ))
                  )}
                </Paper>
              </Grid>

              {/* Afternoon */}
              <Grid item xs={12} sm={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderTop: '4px solid #00B4D8', minHeight: 180 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, color: '#00B4D8', mb: 1.5 }}>
                    🌤️ Afternoon (Lunch)
                  </Typography>
                  {dosageTimeline.afternoon.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">No afternoon doses</Typography>
                  ) : (
                    dosageTimeline.afternoon.map((d, i) => (
                      <Box key={i} sx={{ mb: 1.5, pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{d.name} ({d.dose})</Typography>
                        <Typography variant="caption" color="text.secondary">{d.timing}</Typography>
                      </Box>
                    ))
                  )}
                </Paper>
              </Grid>

              {/* Evening */}
              <Grid item xs={12} sm={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderTop: '4px solid #6C5CE7', minHeight: 180 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, color: '#6C5CE7', mb: 1.5 }}>
                    🌙 Evening (Dinner)
                  </Typography>
                  {dosageTimeline.evening.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">No evening doses</Typography>
                  ) : (
                    dosageTimeline.evening.map((d, i) => (
                      <Box key={i} sx={{ mb: 1.5, pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{d.name} ({d.dose})</Typography>
                        <Typography variant="caption" color="text.secondary">{d.timing}</Typography>
                      </Box>
                    ))
                  )}
                </Paper>
              </Grid>

              {/* Bedtime */}
              <Grid item xs={12} sm={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderTop: '4px solid #00C9A7', minHeight: 180 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, color: '#00C9A7', mb: 1.5 }}>
                    💤 Bedtime (Night)
                  </Typography>
                  {dosageTimeline.bedtime.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">No night doses</Typography>
                  ) : (
                    dosageTimeline.bedtime.map((d, i) => (
                      <Box key={i} sx={{ mb: 1.5, pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{d.name} ({d.dose})</Typography>
                        <Typography variant="caption" color="text.secondary">{d.timing}</Typography>
                      </Box>
                    ))
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 4: Diet & Lifestyle Recommendations */}
        {activeTab === 4 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Dietary Guidelines & Lifestyle Restrictions
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Targeted nutritional and habit recommendations based on active pharmaceutical components.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderLeft: '5px solid #00C9A7' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#00C9A7', mb: 2 }}>
                    ✅ Recommended Dietary Habits (DOs)
                  </Typography>
                  <Stack spacing={1.5}>
                    {dietLifestyleDos.map((doItem, idx) => (
                      <Stack direction="row" alignItems="flex-start" spacing={1} key={idx}>
                        <CheckCircle sx={{ color: '#00C9A7', fontSize: 18, mt: 0.3 }} />
                        <Typography variant="body2">{doItem}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderLeft: '5px solid #FF4D6D' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FF4D6D', mb: 2 }}>
                    🚫 Foods & Activities to Avoid (DON'Ts)
                  </Typography>
                  <Stack spacing={1.5}>
                    {dietLifestyleDonts.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No severe dietary contraindications identified.</Typography>
                    ) : (
                      dietLifestyleDonts.map((dontItem, idx) => (
                        <Stack direction="row" alignItems="flex-start" spacing={1} key={idx}>
                          <Warning sx={{ color: '#FF4D6D', fontSize: 18, mt: 0.3 }} />
                          <Typography variant="body2">{dontItem}</Typography>
                        </Stack>
                      ))
                    )}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
