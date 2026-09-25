'use client';

import React, { useState } from 'react';

import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  Chip,
  Stack,
  Paper,
  Divider,
  Alert,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Restaurant,
  Scale,
  Print,
  CheckCircle,
  Warning,
  Info,
  Schedule,
  FitnessCenter,
  Close,
  Verified,
  LocalHospital,
  Shield,
  Add,
  Delete,
  TableChart,
  Save,
  RestartAlt
} from '@mui/icons-material';
import { CLINICAL_DIET_PLANS } from '../mockData/clinicalModulesData';
import { DietPlanItem } from '../types/clinical';
import confetti from 'canvas-confetti';
import { toast } from 'react-toastify';

interface DietsModuleProps {
  patientName?: string;
  patientAge?: number | string;
  patientDisease?: string;
}

export default function DietsModule({
  patientName = 'Robert Vance',
  patientAge = 58,
  patientDisease = 'Essential Hypertension, Type 2 Diabetes'
}: DietsModuleProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [selectedDietId, setSelectedDietId] = useState<string>('DIET-01');

  // Patient Profile Form State
  const [currPatientName, setCurrPatientName] = useState<string>(patientName);
  const [currPatientAge, setCurrPatientAge] = useState<number | string>(patientAge);
  const [currPatientGender, setCurrPatientGender] = useState<string>('Male');
  const [currPatientDisease, setCurrPatientDisease] = useState<string>(patientDisease);

  // Interactive BMI Calculator state
  const [weightKg, setWeightKg] = useState<number>(82);
  const [heightCm, setHeightCm] = useState<number>(172);

  // Print modal state
  const [printOpen, setPrintOpen] = useState<boolean>(false);

  // Custom Nutrition Plan State
  const [customModalOpen, setCustomModalOpen] = useState<boolean>(false);
  const [customPlanTitle, setCustomPlanTitle] = useState<string>('Customized Clinical Nutrition Protocol');
  const [customCalories, setCustomCalories] = useState<number>(1800);
  const [customRows, setCustomRows] = useState<Array<{ time: string; mealName: string; portion: string; focus: string }>>([
    { time: '07:30 AM', mealName: 'Early Morning', portion: '1 Glass (200ml)', focus: 'Warm Lemon Water with Chia Seeds (Low Sodium)' },
    { time: '09:00 AM', mealName: 'Breakfast', portion: '1 Bowl (150g)', focus: 'Rolled Oats Porridge with Skimmed Milk & Flaxseeds' },
    { time: '01:00 PM', mealName: 'Lunch', portion: '2 Roti + 1 Bowl (150g)', focus: 'Multigrain Roti with Steamed Dal & Spinach Sabzi' },
    { time: '05:00 PM', mealName: 'Evening Snack', portion: '1 Cup (100g)', focus: 'Roasted Chana / Sprouts with Herbal Tea' },
    { time: '08:00 PM', mealName: 'Dinner', portion: '1 Bowl (200g)', focus: 'Vegetable Soup with Grilled Paneer / Tofu' },
  ]);
  const [isCustomActive, setIsCustomActive] = useState<boolean>(false);

  // Calculate BMI
  const heightMeters = heightCm / 100;
  const bmi = heightMeters > 0 ? (weightKg / (heightMeters * heightMeters)).toFixed(1) : '27.7';
  const bmiVal = parseFloat(bmi);

  let bmiStatus = 'Normal Weight';
  let bmiColor = '#00C9A7';
  if (bmiVal >= 30) {
    bmiStatus = 'Class I Obesity (Calorie Deficit Required)';
    bmiColor = '#FF4D6D';
  } else if (bmiVal >= 25) {
    bmiStatus = 'Overweight (Weight Loss Target)';
    bmiColor = '#FFB703';
  } else if (bmiVal < 18.5) {
    bmiStatus = 'Underweight (High Calorie Dense Target)';
    bmiColor = '#00B4D8';
  }

  const presetDiet: DietPlanItem = CLINICAL_DIET_PLANS.find(d => d.id === selectedDietId) || CLINICAL_DIET_PLANS[0];

  const activeDiet: DietPlanItem = isCustomActive ? {
    id: 'CUSTOM-NUTRITION-PLAN',
    name: customPlanTitle,
    diseaseCategory: 'Customized Staff Protocol',
    calories: customCalories,
    bmiCategory: presetDiet.bmiCategory,
    macroBreakdown: presetDiet.macroBreakdown,
    electrolyteLimits: presetDiet.electrolyteLimits,
    recommendedFoods: presetDiet.recommendedFoods,
    foodsToAvoid: presetDiet.foodsToAvoid,
    mealFrequency: {
      frequency: `${customRows.length} Customized Meals / Day`,
      schedule: customRows
    }
  } : presetDiet;

  const handleAddCustomRow = () => {
    setCustomRows([
      ...customRows,
      { time: '04:00 PM', mealName: 'Mid-Meal / Snack', portion: '1 Serving', focus: 'Fresh Fruit / Herbal Tea' }
    ]);
  };

  const handleRemoveCustomRow = (index: number) => {
    if (customRows.length <= 1) {
      toast.warning('Custom nutrition plan must have at least one meal row.');
      return;
    }
    setCustomRows(customRows.filter((_, idx) => idx !== index));
  };

  const handleCustomRowChange = (index: number, field: keyof typeof customRows[0], value: string) => {
    const updated = [...customRows];
    updated[index][field] = value;
    setCustomRows(updated);
  };

  const handlePopulateFromPreset = () => {
    setCustomPlanTitle(`Custom Plan (${presetDiet.name})`);
    setCustomCalories(presetDiet.calories);
    setCustomRows(presetDiet.mealFrequency.schedule.map(s => ({ ...s })));
    toast.info('Copied meal schedule from selected preset!');
  };

  const handleSaveCustomPlan = () => {
    setIsCustomActive(true);
    setCustomModalOpen(false);
    confetti({ particleCount: 35, spread: 60 });
    toast.success('Custom Nutrition Plan applied successfully!');
  };

  const handleResetToPreset = () => {
    setIsCustomActive(false);
    toast.info('Reverted to standard clinical preset.');
  };

  const handlePrint = () => {
    confetti({ particleCount: 40, spread: 50 });
    setPrintOpen(true);
  };

  const isDark = isDarkMode;

  return (
    <Card
      sx={{
        borderRadius: 1,
        boxShadow: isDark ? '0 12px 40px rgba(0, 0, 0, 0.25)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
        background: isDark
          ? 'linear-gradient(180deg, rgba(16, 24, 44, 0.95) 0%, rgba(10, 15, 29, 0.98) 100%)'
          : 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
        color: 'text.primary',
        border: isDark ? '1px solid rgba(0, 201, 167, 0.3)' : '1px solid #E2E8F0'
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
        {/* Module Header Banner */}
        <Grid container spacing={3} alignItems="center" mb={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>
              Clinical Diet Planner & Electrolyte Management
            </Typography>
          </Grid>

          <Grid item xs={12} md={6} textAlign={{ xs: 'left', md: 'right' }}>
            <Stack direction="row" spacing={1.5} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<TableChart />}
                onClick={() => setCustomModalOpen(true)}
                sx={{ borderRadius: 1, px: 2.5, py: 1.2, fontWeight: 800 }}
              >
                Make Custom Nutrition Plan
              </Button>
              <Tooltip title="Generate printable PDF/Paper Clinical Dietary & Electrolyte Prescription" arrow placement="top">
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<Print />}
                  onClick={handlePrint}
                  sx={{ borderRadius: 1, px: 3, py: 1.2, fontWeight: 800 }}
                >
                  Print Plan
                </Button>
              </Tooltip>
            </Stack>
          </Grid>
        </Grid>

        {/* Interactive Patient Information Form */}
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 1,
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
            borderColor: 'rgba(0, 201, 167, 0.3)'
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: '#00C9A7', letterSpacing: 0.5 }}>
            📋 PATIENT PROFILE & NUTRITION DIAGNOSIS FORM
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Patient Full Name"
                value={currPatientName}
                onChange={(e) => setCurrPatientName(e.target.value)}
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField
                fullWidth
                size="small"
                label="Age (Years)"
                type="number"
                value={currPatientAge}
                onChange={(e) => setCurrPatientAge(e.target.value)}
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField
                fullWidth
                select
                size="small"
                label="Gender"
                value={currPatientGender}
                onChange={(e) => setCurrPatientGender(e.target.value)}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Clinical Condition / Diagnosis"
                value={currPatientDisease}
                onChange={(e) => setCurrPatientDisease(e.target.value)}
              />
            </Grid>
          </Grid>
        </Paper>

        <Divider sx={{ mb: 3 }} />

        {/* Top Controls: Preset Select & BMI Calculator */}
        <Grid container spacing={3} mb={3}>
          {/* Preset Selector */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1, bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#F8FAFC' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00C9A7', mb: 1.5 }}>
                🥦 Disease-Based Diet Protocol
              </Typography>
              <TextField
                fullWidth
                select
                size="small"
                label="Select Clinical Diet Preset"
                value={selectedDietId}
                onChange={(e) => setSelectedDietId(e.target.value)}
              >
                {CLINICAL_DIET_PLANS.map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {plan.name} ({plan.diseaseCategory})
                  </MenuItem>
                ))}
              </TextField>
            </Paper>
          </Grid>

          {/* Weight-Based Goal & BMI Calculator */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1, bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#F8FAFC', borderColor: bmiColor }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: bmiColor, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Scale fontSize="small" /> Weight & BMI Caloric Goal
                </Typography>
                <Chip label={`BMI: ${bmi} kg/m²`} sx={{ bgcolor: bmiColor, color: '#FFF', fontWeight: 800 }} size="small" />
              </Stack>

              <Grid container spacing={1.5} alignItems="center">
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Weight (kg)"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Height (cm)"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                  />
                </Grid>
              </Grid>

              <Typography variant="caption" sx={{ color: bmiColor, fontWeight: 700, mt: 1, display: 'block' }}>
                Status: {bmiStatus} • Target Energy: {activeDiet.calories} kcal/day
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* 5 Core Dimensions Grid */}
        <Grid container spacing={3}>
          {/* Dimension 1: Nutritional Values & Macros */}
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1, bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#F8FAFC', height: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#00C9A7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                📊 1. Nutritional & Macro Values
              </Typography>

              <Stack spacing={1.5}>
                <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                  <Typography variant="caption" color="text.secondary">Target Daily Calories</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#00C9A7' }}>{activeDiet.calories} kcal</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                  <Typography variant="caption" color="text.secondary">Carbohydrates Focus</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{activeDiet.macroBreakdown.carbs}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                  <Typography variant="caption" color="text.secondary">Protein Allocation</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{activeDiet.macroBreakdown.protein}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                  <Typography variant="caption" color="text.secondary">Healthy Fats & Oils</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{activeDiet.macroBreakdown.fats}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                  <Typography variant="caption" color="text.secondary">Dietary Fiber</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{activeDiet.macroBreakdown.fiber}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Dimension 2 & 4: Electrolyte-Based Management */}
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1, bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#F8FAFC', height: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFB703', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                ⚡ 4. Electrolyte-Based Management
              </Typography>

              <Stack spacing={1.5} mb={2}>
                <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'rgba(255, 183, 3, 0.08)', borderLeft: '4px solid #FFB703' }}>
                  <Typography variant="caption" color="text.secondary">Sodium (Na) Threshold</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFB703' }}>{activeDiet.electrolyteLimits.sodium}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'rgba(0, 180, 216, 0.08)', borderLeft: '4px solid #00B4D8' }}>
                  <Typography variant="caption" color="text.secondary">Potassium (K) Goal</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00B4D8' }}>{activeDiet.electrolyteLimits.potassium}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'rgba(108, 92, 231, 0.08)', borderLeft: '4px solid #6C5CE7' }}>
                  <Typography variant="caption" color="text.secondary">Phosphorus (P) Limit</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#6C5CE7' }}>{activeDiet.electrolyteLimits.phosphorus}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'rgba(0, 201, 167, 0.08)', borderLeft: '4px solid #00C9A7' }}>
                  <Typography variant="caption" color="text.secondary">Calcium (Ca) Intake</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00C9A7' }}>{activeDiet.electrolyteLimits.calcium}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Recommended vs Avoided Foods */}
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 1, bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#F8FAFC', height: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#00C9A7', mb: 1.5 }}>
                ✅ Recommended Foods
              </Typography>
              <Stack spacing={0.8} mb={3}>
                {activeDiet.recommendedFoods.map((rf, i) => (
                  <Stack key={i} direction="row" alignItems="center" spacing={1}>
                    <CheckCircle sx={{ color: '#00C9A7', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{rf}</Typography>
                  </Stack>
                ))}
              </Stack>

              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FF4D6D', mb: 1.5 }}>
                🚫 Foods & Ingredients to Avoid
              </Typography>
              <Stack spacing={0.8}>
                {activeDiet.foodsToAvoid.map((fa, i) => (
                  <Stack key={i} direction="row" alignItems="center" spacing={1}>
                    <Warning sx={{ color: '#FF4D6D', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{fa}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Dimension 5: Frequency of Meals & Timeline */}
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 1, bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#F8FAFC', borderTop: '4px solid #6C5CE7' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
                <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, color: '#6C5CE7' }}>
                  <Schedule /> 5. Frequency of Meals & Daily Schedule Matrix
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={activeDiet.mealFrequency.frequency} color={isCustomActive ? 'warning' : 'secondary'} sx={{ fontWeight: 800 }} />
                  {isCustomActive && (
                    <Button size="small" variant="outlined" color="warning" startIcon={<RestartAlt />} onClick={handleResetToPreset}>
                      Reset to Preset
                    </Button>
                  )}
                  <Button size="small" variant="contained" color="secondary" startIcon={<TableChart />} onClick={() => setCustomModalOpen(true)}>
                    {isCustomActive ? 'Edit Custom Table' : 'Make Custom Nutrition Table'}
                  </Button>
                </Stack>
              </Stack>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Timing</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Meal Name</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Portion Size</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Clinical Focus & Ingredients</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeDiet.mealFrequency.schedule.map((item, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ fontWeight: 800, color: '#00C9A7' }}>{item.time}</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{item.mealName}</TableCell>
                        <TableCell>{item.portion}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{item.focus}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>

      {/* Printable Clinical Diet Guide Dialog */}
      <Dialog open={printOpen} onClose={() => setPrintOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 1, bgcolor: '#FFFFFF !important', color: '#0F172A !important', backgroundImage: 'none !important', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)' } }}>
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#FFFFFF !important', color: '#0F172A !important', borderBottom: '1px solid #E2E8F0 !important' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <LocalHospital sx={{ color: '#00C9A7' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A !important' }}>
              Official Clinical Dietary & Electrolyte Prescription
            </Typography>
          </Stack>
          <IconButton onClick={() => setPrintOpen(false)} size="small" sx={{ color: '#475569 !important', '&:hover': { bgcolor: '#F1F5F9 !important' } }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4, bgcolor: '#FFFFFF !important', color: '#1E293B !important' }}>
          <Box sx={{ border: '2px solid #00C9A7', borderRadius: 1, p: 3, bgcolor: '#FFFFFF !important', color: '#1E293B !important' }}>
            <Grid container spacing={2} sx={{ borderBottom: '2px solid #E2E8F0', pb: 2, mb: 3 }}>
              <Grid item xs={8}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#00967D !important' }}>
                  ARPAN CLINICAL NUTRITION CENTER
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#475569 !important' }}>
                  Personalized Metabolic & Electrolyte Prescription
                </Typography>
              </Grid>
              <Grid item xs={4} textAlign="right">
                <Typography variant="caption" sx={{ color: '#64748B !important', display: 'block' }} suppressHydrationWarning>
                  Date: {new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#00967D !important' }}>
                  Plan: {activeDiet.id}
                </Typography>
              </Grid>
            </Grid>

            {/* Patient Header */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#F8FAFC !important', borderColor: '#E2E8F0 !important', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A !important' }}>
                Patient: {currPatientName} ({currPatientAge} Y, {currPatientGender}) • Diagnosis: {currPatientDisease} • BMI: {bmi} kg/m² ({bmiStatus})
              </Typography>
              <Typography variant="caption" sx={{ color: '#475569 !important' }}>
                Assigned Protocol: <strong style={{ color: '#0F172A' }}>{activeDiet.name}</strong> ({activeDiet.calories} kcal/day)
              </Typography>
            </Paper>

            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00967D !important', mb: 1 }}>
              Electrolyte Restrictions:
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: '#1E293B !important' }}>
              Sodium: {activeDiet.electrolyteLimits.sodium} • Potassium: {activeDiet.electrolyteLimits.potassium} • Phosphorus: {activeDiet.electrolyteLimits.phosphorus}
            </Typography>

            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00967D !important', mb: 1 }}>
              Daily Meal Timeline:
            </Typography>
            <Box sx={{ pl: 2, mb: 3 }}>
              {activeDiet.mealFrequency.schedule.map((ms, i) => (
                <Typography key={i} variant="body2" sx={{ mb: 0.8, color: '#334155 !important' }}>
                  <strong style={{ color: '#0F172A' }}>{ms.time} ({ms.mealName}):</strong> {ms.focus}
                </Typography>
              ))}
            </Box>

            <Divider sx={{ mb: 2, borderColor: '#E2E8F0 !important' }} />

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={8}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Verified sx={{ color: '#00C9A7' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569 !important' }}>
                    Verified by Clinical Nutrition Specialist & Attending Physician
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={4} textAlign="right">
                <Typography variant="caption" sx={{ fontStyle: 'italic', display: 'block', color: '#64748B !important' }}>
                  Arpan Clinical Care OS
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#FFFFFF !important', borderTop: '1px solid #E2E8F0 !important' }}>
          <Button onClick={() => setPrintOpen(false)} variant="outlined" color="inherit" sx={{ color: '#475569 !important', borderColor: '#CBD5E1 !important', '&:hover': { bgcolor: '#F8FAFC !important', borderColor: '#94A3B8 !important' } }}>
            Close
          </Button>
          <Button onClick={() => window.print()} variant="contained" color="primary" startIcon={<Print />} sx={{ bgcolor: '#00C9A7 !important', color: '#FFFFFF !important', fontWeight: 800, '&:hover': { bgcolor: '#00B395 !important' } }}>
            Print Guide
          </Button>
        </DialogActions>
      </Dialog>

      {/* Custom Nutrition Table Builder Modal */}
      <Dialog open={customModalOpen} onClose={() => setCustomModalOpen(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 1, bgcolor: isDarkMode ? '#1E293B !important' : '#FFFFFF !important', color: isDarkMode ? '#F8FAFC !important' : '#0F172A !important', opacity: 1, backgroundImage: 'none !important', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' } }}>
        <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: isDarkMode ? 'rgba(0, 201, 167, 0.15) !important' : 'rgba(0, 201, 167, 0.08) !important' }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <TableChart sx={{ color: '#00C9A7', fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#00967D' }}>
                Create Custom Nutrition Table & Meal Protocol
              </Typography>
              <Typography variant="caption" color={isDarkMode ? 'grey.400' : 'text.secondary'}>
                Customize Timing, Meal Name, Portion Size & Clinical Focus for staff & patient dietary prescriptions.
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={() => setCustomModalOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <Divider sx={{ borderColor: isDarkMode ? '#334155' : '#E2E8F0' }} />

        <DialogContent sx={{ p: 3, bgcolor: isDarkMode ? '#1E293B !important' : '#FFFFFF !important' }}>
          {/* Metadata Controls */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                size="small"
                label="Custom Nutrition Plan Title"
                value={customPlanTitle}
                onChange={(e) => setCustomPlanTitle(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Target Daily Energy (kcal)"
                value={customCalories}
                onChange={(e) => setCustomCalories(Number(e.target.value))}
              />
            </Grid>
          </Grid>

          {/* Quick Actions bar */}
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={1.5} mb={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00C9A7' }}>
              Custom Daily Meal Schedule Table ({customRows.length} Meals)
            </Typography>

            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" startIcon={<RestartAlt />} onClick={handlePopulateFromPreset}>
                Copy From Preset ({presetDiet.name})
              </Button>
              <Button size="small" variant="contained" color="secondary" startIcon={<Add />} onClick={handleAddCustomRow}>
                + Add Meal Row
              </Button>
            </Stack>
          </Stack>

          {/* Custom Meal Table */}
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1, bgcolor: isDarkMode ? '#0F172A !important' : '#FFFFFF !important', borderColor: isDarkMode ? '#334155 !important' : '#E2E8F0 !important' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: isDarkMode ? 'rgba(0, 201, 167, 0.15) !important' : 'rgba(0, 201, 167, 0.08) !important' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, width: '18%' }}>Timing</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: '20%' }}>Meal Name</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: '22%' }}>Portion Size</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: '33%' }}>Clinical Focus & Ingredients</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: '7%', textAlign: 'center' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customRows.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="e.g. 07:30 AM"
                        value={row.time}
                        onChange={(e) => handleCustomRowChange(idx, 'time', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="e.g. Breakfast"
                        value={row.mealName}
                        onChange={(e) => handleCustomRowChange(idx, 'mealName', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="e.g. 1 Bowl (150g)"
                        value={row.portion}
                        onChange={(e) => handleCustomRowChange(idx, 'portion', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="e.g. Oats with flaxseeds"
                        value={row.focus}
                        onChange={(e) => handleCustomRowChange(idx, 'focus', e.target.value)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="error" onClick={() => handleRemoveCustomRow(idx)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: isDarkMode ? '#0F172A !important' : '#F8FAFC !important', borderTop: isDarkMode ? '1px solid #334155 !important' : '1px solid #E2E8F0 !important' }}>
          <Button onClick={() => setCustomModalOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSaveCustomPlan} variant="contained" color="secondary" startIcon={<Save />} sx={{ px: 3, fontWeight: 800 }}>
            Save & Apply Custom Nutrition Plan
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
