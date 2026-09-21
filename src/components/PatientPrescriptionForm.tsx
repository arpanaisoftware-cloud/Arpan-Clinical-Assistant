'use client';

import React from 'react';
import { useFormik, FormikProvider, FieldArray, FormikErrors, FormikTouched } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  MenuItem,
  IconButton,
  Stack,
  Divider,
  Paper,
  Alert
} from '@mui/material';
import {
  Person,
  Add,
  Delete,
  AutoAwesome,
  RestartAlt,
  Biotech,
  LocalPharmacy
} from '@mui/icons-material';
import { SAMPLE_CLINICAL_CASE } from '../mockData/aiAnalysisData';
import { PatientInput, MedicationInput } from '../types/clinical';

// Yup Validation Schema
const PrescriptionValidationSchema = Yup.object().shape({
  patientName: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name is too long')
    .required('Patient full name is required'),
  age: Yup.number()
    .typeError('Age must be a valid number')
    .min(0, 'Age cannot be negative')
    .max(120, 'Please enter a realistic age')
    .required('Age is required'),
  gender: Yup.string().required('Gender is required'),
  weight: Yup.number()
    .typeError('Weight must be a number')
    .positive('Weight must be positive')
    .nullable(),
  allergies: Yup.string(),
  disease: Yup.string()
    .min(3, 'Please describe diagnosis/disease')
    .required('Diagnosis or clinical condition is required'),
  medications: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required('Drug name required'),
        dosage: Yup.string().required('Dosage required (e.g. 500mg)'),
        frequency: Yup.string().required('Frequency required'),
        duration: Yup.string().required('Duration required (e.g. 7 Days)'),
        timing: Yup.string()
      })
    )
    .min(1, 'Prescription must contain at least 1 medication')
});

interface PatientPrescriptionFormProps {
  onAnalyze: (formData: PatientInput) => void;
  isAnalyzing: boolean;
}

export default function PatientPrescriptionForm({ onAnalyze, isAnalyzing }: PatientPrescriptionFormProps) {
  const formik = useFormik<PatientInput>({
    initialValues: {
      patientName: '',
      age: '',
      gender: 'Male',
      weight: '',
      allergies: '',
      disease: '',
      medications: [
        { name: '', dosage: '', frequency: 'Once Daily', duration: '7 Days', timing: 'After meals' }
      ]
    },
    validationSchema: PrescriptionValidationSchema,
    onSubmit: (values) => {
      toast.info('⚡ Executing AI Clinical Analysis...', { autoClose: 2000 });
      onAnalyze(values);
    }
  });

  const handleLoadSample = () => {
    formik.setValues(SAMPLE_CLINICAL_CASE);
    toast.success('Loaded sample clinical case: Robert Vance (Multi-Drug Risk Scenario)');
  };

  return (
    <Card sx={{ borderRadius: 1, height: '100%' }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Person sx={{ color: '#00C9A7', fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Patient Details & Prescription Form
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Enter clinical information below. Formik & Yup validation active.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            size="small"
            color="secondary"
            startIcon={<Biotech />}
            onClick={handleLoadSample}
            sx={{ borderStyle: 'dashed' }}
          >
            Load Demo Case
          </Button>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit}>
            {/* Section 1: Patient Details */}
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: '#00C9A7', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person fontSize="small" /> 1. Patient Demographics & Health Profile
            </Typography>

            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="patientName"
                  name="patientName"
                  label="Patient Full Name *"
                  placeholder="e.g. John Doe"
                  value={formik.values.patientName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.patientName && Boolean(formik.errors.patientName)}
                  helperText={formik.touched.patientName && formik.errors.patientName}
                />
              </Grid>

              <Grid item xs={6} sm={2}>
                <TextField
                  fullWidth
                  id="age"
                  name="age"
                  label="Age *"
                  type="number"
                  placeholder="e.g. 45"
                  value={formik.values.age}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.age && Boolean(formik.errors.age)}
                  helperText={formik.touched.age && formik.errors.age}
                />
              </Grid>

              <Grid item xs={6} sm={2}>
                <TextField
                  fullWidth
                  select
                  id="gender"
                  name="gender"
                  label="Gender *"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  id="weight"
                  name="weight"
                  label="Weight (kg)"
                  placeholder="e.g. 70"
                  value={formik.values.weight}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="allergies"
                  name="allergies"
                  label="Known Drug Allergies & Hypersensitivities"
                  placeholder="e.g. Penicillin, Sulfa, Latex (Comma separated)"
                  value={formik.values.allergies}
                  onChange={formik.handleChange}
                  helperText="Crucial for AI allergy conflict scanning"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="disease"
                  name="disease"
                  label="Diagnosis / Disease / Primary Symptoms *"
                  placeholder="e.g. Type 2 Diabetes, Hypertension, Bronchitis"
                  value={formik.values.disease}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.disease && Boolean(formik.errors.disease)}
                  helperText={formik.touched.disease && formik.errors.disease}
                />
              </Grid>
            </Grid>

            {/* Section 2: Prescribed Medications Array */}
            <Divider sx={{ my: 2 }} />

            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#6C5CE7', display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalPharmacy fontSize="small" /> 2. Prescribed Medications (Rx Table)
              </Typography>
            </Stack>

            <FieldArray name="medications">
              {({ push, remove }) => (
                <Box>
                  {formik.values.medications.map((med: MedicationInput, index: number) => {
                    const errors = (Array.isArray(formik.errors.medications) ? formik.errors.medications[index] : {}) as FormikErrors<MedicationInput> || {};
                    const touched = (Array.isArray(formik.touched.medications) ? formik.touched.medications[index] : {}) as FormikTouched<MedicationInput> || {};

                    return (
                      <Paper
                        key={index}
                        variant="outlined"
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: 3,
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          bgcolor: 'rgba(255, 255, 255, 0.02)'
                        }}
                      >
                        <Grid container spacing={1.5} alignItems="center">
                          <Grid item xs={12} sm={3}>
                            <TextField
                              fullWidth
                              size="small"
                              name={`medications.${index}.name`}
                              label={`Drug ${index + 1} Name *`}
                              placeholder="e.g. Amoxicillin"
                              value={med.name}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={touched.name && Boolean(errors.name)}
                              helperText={touched.name && errors.name}
                            />
                          </Grid>

                          <Grid item xs={6} sm={2}>
                            <TextField
                              fullWidth
                              size="small"
                              name={`medications.${index}.dosage`}
                              label="Dosage *"
                              placeholder="e.g. 500mg"
                              value={med.dosage}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={touched.dosage && Boolean(errors.dosage)}
                              helperText={touched.dosage && errors.dosage}
                            />
                          </Grid>

                          <Grid item xs={6} sm={2.5}>
                            <TextField
                              fullWidth
                              select
                              size="small"
                              name={`medications.${index}.frequency`}
                              label="Frequency *"
                              value={med.frequency}
                              onChange={formik.handleChange}
                            >
                              <MenuItem value="Once Daily">Once Daily (QD)</MenuItem>
                              <MenuItem value="Twice Daily">Twice Daily (BID)</MenuItem>
                              <MenuItem value="Thrice Daily">Thrice Daily (TID)</MenuItem>
                              <MenuItem value="Every 8 Hours">Every 8 Hours</MenuItem>
                              <MenuItem value="At Bedtime">At Bedtime (HS)</MenuItem>
                              <MenuItem value="As Needed (PRN)">As Needed (PRN)</MenuItem>
                            </TextField>
                          </Grid>

                          <Grid item xs={6} sm={2}>
                            <TextField
                              fullWidth
                              size="small"
                              name={`medications.${index}.duration`}
                              label="Duration *"
                              placeholder="e.g. 7 Days"
                              value={med.duration}
                              onChange={formik.handleChange}
                              error={touched.duration && Boolean(errors.duration)}
                            />
                          </Grid>

                          <Grid item xs={5} sm={2}>
                            <TextField
                              fullWidth
                              size="small"
                              name={`medications.${index}.timing`}
                              label="Instructions"
                              placeholder="e.g. After meals"
                              value={med.timing}
                              onChange={formik.handleChange}
                            />
                          </Grid>

                          <Grid item xs={1} sm={0.5} textAlign="right">
                            {formik.values.medications.length > 1 && (
                              <IconButton
                                color="error"
                                onClick={() => remove(index)}
                                size="small"
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            )}
                          </Grid>
                        </Grid>
                      </Paper>
                    );
                  })}

                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    size="small"
                    onClick={() => push({ name: '', dosage: '', frequency: 'Once Daily', duration: '7 Days', timing: 'After meals' })}
                    sx={{ mb: 2, textTransform: 'none', borderRadius: 2 }}
                  >
                    Add Another Medication
                  </Button>
                </Box>
              )}
            </FieldArray>

            {/* Error summary alert if any */}
            {typeof formik.errors.medications === 'string' && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formik.errors.medications}
              </Alert>
            )}

            {/* Submit Action Controls */}
            <Stack direction="row" spacing={2} mt={3} justifyContent="flex-end">
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<RestartAlt />}
                onClick={() => {
                  formik.resetForm();
                  toast.info('Form cleared.');
                }}
              >
                Reset
              </Button>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={isAnalyzing}
                startIcon={<AutoAwesome />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.05rem',
                  boxShadow: '0 6px 20px rgba(0, 201, 167, 0.4)',
                }}
              >
                {isAnalyzing ? 'Analyzing AI Engine...' : 'Analyze Prescription & Generate Recommendations'}
              </Button>
            </Stack>
          </form>
        </FormikProvider>
      </CardContent>
    </Card>
  );
}
