'use client';

import React from 'react';
import { useFormik, FormikProvider, FieldArray, FormikErrors, FormikTouched } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import {
  Card, CardContent, Typography, Grid, TextField, Button, Box,
  MenuItem, IconButton, Stack, Divider, Paper, Alert, Chip,
  FormControlLabel, Checkbox
} from '@mui/material';
import {
  Person, Add, Delete, AutoAwesome, RestartAlt, Biotech,
  LocalPharmacy, MonitorHeart, Science, Warning
} from '@mui/icons-material';
import { SAMPLE_CLINICAL_CASE } from '../mockData/aiAnalysisData';
import { PatientInput, MedicationInput } from '../types/clinical';

const CLINICAL_COMPLAINTS = [
  'Loss of appetite', 'Lower-limb edema', 'Dizziness', 'Weakness',
  'Gastric discomfort', 'Hypoglycemia', 'Constipation', 'Postural hypotension',
  'Nausea/Vomiting', 'Palpitations', 'Dyspnea', 'Excessive thirst',
  'Frequent urination', 'Blurred vision'
];

const PrescriptionValidationSchema = Yup.object().shape({
  patientName: Yup.string().min(2, 'Name must be at least 2 characters').max(80, 'Name is too long').required('Patient full name is required'),
  age: Yup.number().typeError('Age must be a valid number').min(0).max(120).required('Age is required'),
  gender: Yup.string().required('Gender is required'),
  disease: Yup.string().min(3, 'Please describe diagnosis/disease').required('Diagnosis or clinical condition is required'),
  medications: Yup.array().of(Yup.object().shape({
    name: Yup.string().required('Drug name required'),
    dosage: Yup.string().required('Dosage required (e.g. 500mg)'),
    frequency: Yup.string().required('Frequency required'),
    duration: Yup.string().required('Duration required (e.g. 7 Days)'),
    timing: Yup.string()
  })).min(1, 'Prescription must contain at least 1 medication')
});

interface PatientPrescriptionFormProps {
  onAnalyze: (formData: PatientInput) => void;
  onReset?: () => void;
  isAnalyzing: boolean;
}

const INITIAL_VALUES: PatientInput = {
  patientName: '', age: '', gender: 'Male', weight: '',
  allergies: '', disease: '', comorbidities: '',
  medications: [{ name: '', dosage: '', frequency: 'Once Daily', duration: '7 Days', timing: 'After meals' }],
  bpSystolic: '', bpDiastolic: '', pulse: '', bmi: '',
  hba1c: '', fastingGlucose: '',
  creatinine: '', egfr: '', sodiumNa: '', potassiumK: '',
  sgptAlt: '', totalCholesterol: '', ldl: '',
  hasRetinopathy: false, hasNephropathy: false, hasNeuropathy: false, hasFootRisk: false,
  clinicalComplaints: []
};

export default function PatientPrescriptionForm({ onAnalyze, onReset, isAnalyzing }: PatientPrescriptionFormProps) {
  const formik = useFormik<PatientInput>({
    initialValues: INITIAL_VALUES,
    validationSchema: PrescriptionValidationSchema,
    // API INTEGRATION POINT 2: POST /api/analyze-form with JSON body
    onSubmit: (values) => {
      toast.info('Executing AI Clinical Analysis...', { autoClose: 2000 });
      onAnalyze(values);
    }
  });

  const handleLoadSample = () => {
    formik.setValues(SAMPLE_CLINICAL_CASE);
    toast.success('Loaded sample clinical case: Robert Vance (Multi-Drug Risk Scenario)');
  };

  const toggleComplaint = (complaint: string) => {
    const current = formik.values.clinicalComplaints || [];
    const updated = current.includes(complaint) ? current.filter(c => c !== complaint) : [...current, complaint];
    formik.setFieldValue('clinicalComplaints', updated);
  };

  const SL = ({ color, children }: { color: string; children: React.ReactNode }) => (
    <Typography variant="caption" sx={{ fontWeight: 800, mb: 1.5, color, display: 'flex', alignItems: 'center', gap: 0.8, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.76rem' }}>
      {children}
    </Typography>
  );

  return (
    <Card sx={{ borderRadius: 1, height: '100%' }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={2} gap={1.5}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Person sx={{ color: '#00C9A7', fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
                Patient Details &amp; Prescription Form
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Complete clinical profile for AI-assisted prescription suitability analysis.
            </Typography>
          </Box>
          <Button variant="outlined" size="small" color="secondary" startIcon={<Biotech />} onClick={handleLoadSample} sx={{ borderStyle: 'dashed', flexShrink: 0 }}>
            Load Demo Case
          </Button>
        </Stack>
        <Divider sx={{ mb: 2.5 }} />
        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit}>

            {/* SECTION 1: Patient Demographics */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 1.5, borderColor: 'rgba(0,201,167,0.25)', bgcolor: 'rgba(0,201,167,0.02)' }}>
              <SL color="#00C9A7"><Person sx={{ fontSize: 14 }} /> 1. Patient Demographics</SL>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" id="patientName" name="patientName" label="Patient Full Name *" placeholder="e.g. John Doe"
                    value={formik.values.patientName} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    error={formik.touched.patientName && Boolean(formik.errors.patientName)}
                    helperText={formik.touched.patientName && formik.errors.patientName} />
                </Grid>
                <Grid item xs={4} sm={2}>
                  <TextField fullWidth size="small" id="age" name="age" label="Age *" type="number" placeholder="e.g. 45"
                    value={formik.values.age} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    error={formik.touched.age && Boolean(formik.errors.age)} helperText={formik.touched.age && formik.errors.age} />
                </Grid>
                <Grid item xs={4} sm={2}>
                  <TextField fullWidth size="small" select id="gender" name="gender" label="Gender *" value={formik.values.gender} onChange={formik.handleChange}>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={4} sm={2}>
                  <TextField fullWidth size="small" id="weight" name="weight" label="Weight (kg)" placeholder="e.g. 70" value={formik.values.weight} onChange={formik.handleChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" id="disease" name="disease" label="Primary Diagnosis / Disease *" placeholder="e.g. Type 2 Diabetes, Hypertension, CKD"
                    value={formik.values.disease} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    error={formik.touched.disease && Boolean(formik.errors.disease)} helperText={formik.touched.disease && formik.errors.disease} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" id="comorbidities" name="comorbidities" label="Comorbidities" placeholder="e.g. Dyslipidemia, Obesity, NAFLD"
                    value={formik.values.comorbidities} onChange={formik.handleChange} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" id="allergies" name="allergies" label="Known Drug Allergies & Hypersensitivities" placeholder="e.g. Penicillin, Sulfa, Latex (comma separated)"
                    value={formik.values.allergies} onChange={formik.handleChange} helperText="Crucial for AI allergy conflict scanning" />
                </Grid>
              </Grid>
            </Paper>

            {/* SECTION 2: Vitals */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 1.5, borderColor: 'rgba(108,92,231,0.25)', bgcolor: 'rgba(108,92,231,0.02)' }}>
              <SL color="#6C5CE7"><MonitorHeart sx={{ fontSize: 14 }} /> 2. Vitals — BP, Pulse, BMI</SL>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth size="small" id="bpSystolic" name="bpSystolic" label="Systolic BP (mmHg)" placeholder="e.g. 130" type="number" value={formik.values.bpSystolic} onChange={formik.handleChange} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth size="small" id="bpDiastolic" name="bpDiastolic" label="Diastolic BP (mmHg)" placeholder="e.g. 85" type="number" value={formik.values.bpDiastolic} onChange={formik.handleChange} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth size="small" id="pulse" name="pulse" label="Pulse (bpm)" placeholder="e.g. 78" type="number" value={formik.values.pulse} onChange={formik.handleChange} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth size="small" id="bmi" name="bmi" label="BMI (kg/m2)" placeholder="e.g. 27.5" type="number" value={formik.values.bmi} onChange={formik.handleChange} />
                </Grid>
              </Grid>
            </Paper>

            {/* SECTION 3: Lab Values */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 1.5, borderColor: 'rgba(255,183,3,0.25)', bgcolor: 'rgba(255,183,3,0.02)' }}>
              <SL color="#FFB703"><Science sx={{ fontSize: 14 }} /> 3. Lab Values — Glycemic / Renal / Hepatic / Lipids</SL>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth size="small" id="hba1c" name="hba1c" label="HbA1c (%)" placeholder="e.g. 8.2" type="number" value={formik.values.hba1c} onChange={formik.handleChange} helperText="Glycated Hemoglobin" />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth size="small" id="fastingGlucose" name="fastingGlucose" label="Fasting Glucose (mg/dL)" placeholder="e.g. 145" type="number" value={formik.values.fastingGlucose} onChange={formik.handleChange} helperText="Fasting blood glucose" />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth size="small" id="creatinine" name="creatinine" label="Creatinine (mg/dL)" placeholder="e.g. 1.2" type="number" value={formik.values.creatinine} onChange={formik.handleChange} helperText="Serum Creatinine" />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth size="small" id="egfr" name="egfr" label="eGFR (mL/min/1.73m2)" placeholder="e.g. 55" type="number" value={formik.values.egfr} onChange={formik.handleChange} helperText="Estimated GFR" />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth size="small" id="sodiumNa" name="sodiumNa" label="Sodium Na+ (mEq/L)" placeholder="e.g. 138" type="number" value={formik.values.sodiumNa} onChange={formik.handleChange} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth size="small" id="potassiumK" name="potassiumK" label="Potassium K+ (mEq/L)" placeholder="e.g. 4.1" type="number" value={formik.values.potassiumK} onChange={formik.handleChange} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth size="small" id="sgptAlt" name="sgptAlt" label="SGPT / ALT (U/L)" placeholder="e.g. 42" type="number" value={formik.values.sgptAlt} onChange={formik.handleChange} helperText="Liver function" />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth size="small" id="totalCholesterol" name="totalCholesterol" label="Total Cholesterol (mg/dL)" placeholder="e.g. 210" type="number" value={formik.values.totalCholesterol} onChange={formik.handleChange} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField fullWidth size="small" id="ldl" name="ldl" label="LDL (mg/dL)" placeholder="e.g. 130" type="number" value={formik.values.ldl} onChange={formik.handleChange} helperText="LDL Cholesterol" />
                </Grid>
              </Grid>
            </Paper>

            {/* SECTION 4: Complications + Clinical Complaints */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 1.5, borderColor: 'rgba(255,77,109,0.25)', bgcolor: 'rgba(255,77,109,0.02)' }}>
              <SL color="#FF4D6D"><Warning sx={{ fontSize: 14 }} /> 4. Diabetes Complications & Clinical Complaints</SL>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={5}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>Diabetes Complications (if applicable):</Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.5}>
                    {[
                      { key: 'hasRetinopathy', label: 'Retinopathy' },
                      { key: 'hasNephropathy', label: 'Nephropathy' },
                      { key: 'hasNeuropathy', label: 'Neuropathy' },
                      { key: 'hasFootRisk', label: 'Foot Risk' }
                    ].map(({ key, label }) => (
                      <FormControlLabel
                        key={key}
                        control={<Checkbox size="small" checked={Boolean(formik.values[key as keyof PatientInput])} onChange={(e) => formik.setFieldValue(key, e.target.checked)} sx={{ p: 0.5 }} />}
                        label={<Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>}
                      />
                    ))}
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={7}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>Current Clinical Complaints (for adverse-effect analysis):</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7 }}>
                    {CLINICAL_COMPLAINTS.map((complaint) => {
                      const active = (formik.values.clinicalComplaints || []).includes(complaint);
                      return (
                        <Chip key={complaint} label={complaint} size="small" onClick={() => toggleComplaint(complaint)}
                          variant={active ? 'filled' : 'outlined'} color={active ? 'error' : 'default'}
                          sx={{ cursor: 'pointer', fontWeight: active ? 800 : 500, fontSize: '0.72rem' }} />
                      );
                    })}
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* SECTION 5: Prescribed Medications */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 1.5, borderColor: 'rgba(108,92,231,0.25)', bgcolor: 'rgba(108,92,231,0.02)' }}>
              <SL color="#6C5CE7"><LocalPharmacy sx={{ fontSize: 14 }} /> 5. Prescribed Medications (Rx)</SL>
              <FieldArray name="medications">
                {({ push, remove }) => (
                  <Box>
                    {formik.values.medications.map((med: MedicationInput, index: number) => {
                      const errors = (Array.isArray(formik.errors.medications) ? formik.errors.medications[index] : {}) as FormikErrors<MedicationInput> || {};
                      const touched = (Array.isArray(formik.touched.medications) ? formik.touched.medications[index] : {}) as FormikTouched<MedicationInput> || {};
                      return (
                        <Paper key={index} variant="outlined" sx={{ p: 1.5, mb: 1.5, borderRadius: 1, borderColor: 'rgba(255,255,255,0.08)', bgcolor: 'rgba(255,255,255,0.02)' }}>
                          <Grid container spacing={1.5} alignItems="center">
                            <Grid item xs={12} sm={3}>
                              <TextField fullWidth size="small" name={`medications.${index}.name`} label={`Drug ${index + 1} Name *`} placeholder="e.g. Amoxicillin"
                                value={med.name} onChange={formik.handleChange} onBlur={formik.handleBlur} error={touched.name && Boolean(errors.name)} helperText={touched.name && errors.name} />
                            </Grid>
                            <Grid item xs={6} sm={2}>
                              <TextField fullWidth size="small" name={`medications.${index}.dosage`} label="Dosage *" placeholder="e.g. 500mg"
                                value={med.dosage} onChange={formik.handleChange} onBlur={formik.handleBlur} error={touched.dosage && Boolean(errors.dosage)} helperText={touched.dosage && errors.dosage} />
                            </Grid>
                            <Grid item xs={6} sm={2.5}>
                              <TextField fullWidth select size="small" name={`medications.${index}.frequency`} label="Frequency *" value={med.frequency} onChange={formik.handleChange}>
                                <MenuItem value="Once Daily">Once Daily (QD)</MenuItem>
                                <MenuItem value="Twice Daily">Twice Daily (BID)</MenuItem>
                                <MenuItem value="Thrice Daily">Thrice Daily (TID)</MenuItem>
                                <MenuItem value="Every 8 Hours">Every 8 Hours</MenuItem>
                                <MenuItem value="At Bedtime">At Bedtime (HS)</MenuItem>
                                <MenuItem value="As Needed (PRN)">As Needed (PRN)</MenuItem>
                              </TextField>
                            </Grid>
                            <Grid item xs={6} sm={2}>
                              <TextField fullWidth size="small" name={`medications.${index}.duration`} label="Duration *" placeholder="e.g. 7 Days"
                                value={med.duration} onChange={formik.handleChange} error={touched.duration && Boolean(errors.duration)} />
                            </Grid>
                            <Grid item xs={5} sm={2}>
                              <TextField fullWidth size="small" name={`medications.${index}.timing`} label="Instructions" placeholder="e.g. After meals" value={med.timing} onChange={formik.handleChange} />
                            </Grid>
                            <Grid item xs={1} sm={0.5} textAlign="right">
                              {formik.values.medications.length > 1 && (
                                <IconButton color="error" onClick={() => remove(index)} size="small"><Delete fontSize="small" /></IconButton>
                              )}
                            </Grid>
                          </Grid>
                        </Paper>
                      );
                    })}
                    <Button variant="outlined" startIcon={<Add />} size="small" onClick={() => push({ name: '', dosage: '', frequency: 'Once Daily', duration: '7 Days', timing: 'After meals' })} sx={{ mb: 1, textTransform: 'none', borderRadius: 1 }}>
                      Add Another Medication
                    </Button>
                  </Box>
                )}
              </FieldArray>
              {typeof formik.errors.medications === 'string' && (<Alert severity="error" sx={{ mt: 1 }}>{formik.errors.medications}</Alert>)}
            </Paper>

            {/* Submit Controls */}
            <Stack direction="row" spacing={2} mt={2} justifyContent="flex-end">
              <Button variant="outlined" color="inherit" startIcon={<RestartAlt />} onClick={() => { formik.resetForm(); if (onReset) onReset(); toast.info('Form cleared & analysis reset.'); }}>
                Reset
              </Button>
              <Button type="submit" variant="contained" color="primary" size="large" disabled={isAnalyzing} startIcon={<AutoAwesome />}
                sx={{ px: 4, py: 1.5, fontSize: '1.05rem', boxShadow: '0 6px 20px rgba(0, 201, 167, 0.4)' }}>
                {isAnalyzing ? 'Analyzing AI Engine...' : 'Analyze'}
              </Button>
            </Stack>
          </form>
        </FormikProvider>
      </CardContent>
    </Card>
  );
}
