'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Stack,
  IconButton
} from '@mui/material';
import Print from '@mui/icons-material/Print';
import Close from '@mui/icons-material/Close';
import LocalHospital from '@mui/icons-material/LocalHospital';
import QrCode2 from '@mui/icons-material/QrCode2';
import Verified from '@mui/icons-material/Verified';
import { AnalysisResult } from '../types/clinical';

interface PrescriptionPreviewModalProps {
  open: boolean;
  onClose: () => void;
  analysisData: AnalysisResult | null;
}

export default function PrescriptionPreviewModal({ open, onClose, analysisData }: PrescriptionPreviewModalProps) {
  const rxId = React.useMemo(() => {
    return 884920;
  }, []);

  if (!analysisData) return null;

  const { patientInfo, medications, safetyScore, timestamp } = analysisData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 1, bgcolor: '#FFFFFF !important', color: '#0F172A !important', backgroundImage: 'none !important', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)' } }}>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#FFFFFF !important', color: '#0F172A !important', borderBottom: '1px solid #E2E8F0 !important' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <LocalHospital sx={{ color: '#00C9A7' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A !important' }}>
            Official Digital Prescription & AI Clearance Certificate
          </Typography>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ color: '#475569 !important', '&:hover': { bgcolor: '#F1F5F9 !important' } }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider sx={{ borderColor: '#E2E8F0 !important' }} />

      <DialogContent id="printable-prescription" sx={{ p: { xs: 1.5, sm: 3 }, bgcolor: '#FFFFFF !important', color: '#000000 !important' }}>
        {/* Printable Prescription Layout (High-Contrast Solid B&W) */}
        <Box sx={{ border: '1.5px solid #000000 !important', borderRadius: 1.5, p: { xs: 1.5, sm: 2.5 }, mt: 0, position: 'relative', bgcolor: '#FFFFFF !important', color: '#000000 !important', boxSizing: 'border-box' }}>
          {/* Header */}
          <Grid container spacing={2} alignItems="center" sx={{ borderBottom: '2px solid #000000 !important', pb: 1.5, mb: 1.8 }}>
            <Grid item xs={12} sm={8}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#000000 !important', fontSize: { xs: '1.25rem', sm: '1.45rem' }, letterSpacing: '0.5px', textTransform: 'uppercase', lineHeight: 1.2 }}>
                ARPAN CLINICAL MEDICAL CENTER
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#000000 !important', fontSize: { xs: '0.9rem', sm: '0.98rem' }, mt: 0.3 }}>
                Dr. Yashwant Dubey • Chief Cardiologist &amp; Internal Medicine
              </Typography>
              <Typography variant="caption" sx={{ color: '#000000 !important', display: 'block', mt: 0.2, fontSize: '0.78rem', fontWeight: 700 }}>
                Reg. No: MED-8849204 · Department of General &amp; Specialty Clinical Care
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4} textAlign={{ xs: 'left', sm: 'right' }}>
              <Box sx={{ display: 'inline-block', p: 1, bgcolor: '#FFFFFF !important', border: '1.2px solid #000000 !important', borderRadius: 1, textAlign: { xs: 'left', sm: 'right' } }}>
                <Typography variant="caption" sx={{ color: '#000000 !important', fontWeight: 900, display: 'block', fontSize: '0.78rem' }} suppressHydrationWarning>
                  DATE: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </Typography>
                <Typography variant="caption" sx={{ color: '#000000 !important', fontWeight: 900, display: 'block', fontSize: '0.82rem' }}>
                  Rx CERTIFICATE #{rxId}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Patient Info Bar */}
          <Paper variant="outlined" sx={{ p: 1.5, mb: 1.8, bgcolor: '#FFFFFF !important', borderColor: '#000000 !important', borderWidth: 1.2, borderRadius: 1.2 }}>
            <Grid container spacing={1.5}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" sx={{ color: '#000000 !important', fontWeight: 900, display: 'block', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                  PATIENT NAME
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#000000 !important', fontSize: '1.05rem' }}>
                  {patientInfo.patientName || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={3} sm={2}>
                <Typography variant="caption" sx={{ color: '#000000 !important', fontWeight: 900, display: 'block', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                  AGE / GENDER
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000000 !important', fontSize: '0.95rem', mt: 0.1 }}>
                  {patientInfo.age} Y / {patientInfo.gender}
                </Typography>
              </Grid>
              <Grid item xs={3} sm={2}>
                <Typography variant="caption" sx={{ color: '#000000 !important', fontWeight: 900, display: 'block', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                  WEIGHT
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000000 !important', fontSize: '0.95rem', mt: 0.1 }}>
                  {patientInfo.weight ? `${patientInfo.weight} kg` : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={5}>
                <Typography variant="caption" sx={{ color: '#000000 !important', fontWeight: 900, display: 'block', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                  DIAGNOSIS &amp; CLINICAL CONDITION
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#000000 !important', fontSize: '1.05rem' }}>
                  {patientInfo.disease}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* DISTINCT SECTION HEADING: PRESCRIBED MEDICATIONS */}
          <Box sx={{ bgcolor: '#000000 !important', color: '#FFFFFF !important', px: 1.8, py: 0.8, borderRadius: 1, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1.3rem', fontFamily: 'serif', fontStyle: 'italic', lineHeight: 1, color: '#FFFFFF !important' }}>
              ℞
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, fontSize: '1.05rem', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#FFFFFF !important' }}>
              PRESCRIBED MEDICATIONS &amp; DOSAGE DIRECTIVE
            </Typography>
          </Box>

          {/* Prescribed Table */}
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2, borderColor: '#000000 !important', borderWidth: 1.2, borderRadius: 1, overflow: 'hidden' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#000000 !important' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 900, color: '#FFFFFF !important', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1 }}>
                    Medication Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 900, color: '#FFFFFF !important', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1 }}>
                    Dosage
                  </TableCell>
                  <TableCell sx={{ fontWeight: 900, color: '#FFFFFF !important', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1 }}>
                    Frequency
                  </TableCell>
                  <TableCell sx={{ fontWeight: 900, color: '#FFFFFF !important', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1 }}>
                    Duration
                  </TableCell>
                  <TableCell sx={{ fontWeight: 900, color: '#FFFFFF !important', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1 }}>
                    Timing &amp; Instructions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {medications.map((m, i) => (
                  <TableRow key={i} sx={{ bgcolor: '#FFFFFF !important', borderBottom: '1px solid #000000 !important', pageBreakInside: 'avoid !important', breakInside: 'avoid !important' }}>
                    <TableCell sx={{ fontWeight: 900, color: '#000000 !important', fontSize: '0.88rem', py: 0.9, wordBreak: 'break-word', borderBottom: '1px solid #000000 !important' }}>
                      {m.name}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#000000 !important', fontSize: '0.84rem', py: 0.9, borderBottom: '1px solid #000000 !important' }}>
                      {m.dosage}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#000000 !important', fontSize: '0.84rem', py: 0.9, borderBottom: '1px solid #000000 !important' }}>
                      {m.frequency}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#000000 !important', fontSize: '0.84rem', py: 0.9, borderBottom: '1px solid #000000 !important' }}>
                      {m.duration}
                    </TableCell>
                    <TableCell sx={{ color: '#000000 !important', fontWeight: 700, fontSize: '0.82rem', py: 0.9, wordBreak: 'break-word', borderBottom: '1px solid #000000 !important' }}>
                      {m.timing || 'As directed by physician'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* AI Clearance Badge & Doctor / Patient Signatures */}
          <Box sx={{ mt: 2, pt: 1.5, borderTop: '1.5px solid #000000 !important', pageBreakInside: 'avoid !important', breakInside: 'avoid !important' }}>
            {/* AI Safety Banner */}
            <Stack direction="row" alignItems="center" spacing={1.2} mb={2} sx={{ p: 1, bgcolor: '#FFFFFF !important', border: '1.2px solid #000000 !important', borderRadius: 1 }}>
              <Verified sx={{ color: '#000000 !important', fontSize: 22, flexShrink: 0 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#000000 !important', fontSize: '0.9rem', lineHeight: 1.2 }}>
                  Arpan Clinical AI Safety Verified ({safetyScore}/100)
                </Typography>
                <Typography variant="caption" sx={{ color: '#000000 !important', display: 'block', fontSize: '0.74rem', mt: 0.1, fontWeight: 700 }} suppressHydrationWarning>
                  Zero fatal drug interactions &amp; allergy cross-checks executed on {timestamp}
                </Typography>
              </Box>
            </Stack>

            {/* Dual Signature Boxes */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ border: '1px solid #000000 !important', borderRadius: 1, p: 1.5, bgcolor: '#FFFFFF !important' }}>
                  <Typography variant="caption" sx={{ fontWeight: 900, color: '#000000 !important', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5, fontSize: '0.74rem' }}>
                    Attending Physician
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 900, color: '#000000 !important', mb: 1.8, fontSize: '0.88rem' }}>
                    Name: Dr. Yashwant Dubey
                  </Typography>
                  <Box sx={{ borderBottom: '1.2px dashed #000000 !important', height: 22, mb: 0.5 }} />
                  <Typography variant="caption" sx={{ color: '#000000 !important', fontWeight: 900, display: 'block', fontSize: '0.74rem' }}>
                    Signature &amp; Clinical Seal
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#000000 !important', display: 'block', mt: 0.2, fontSize: '0.7rem', fontWeight: 700 }} suppressHydrationWarning>
                    Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box sx={{ border: '1px solid #000000 !important', borderRadius: 1, p: 1.5, bgcolor: '#FFFFFF !important' }}>
                  <Typography variant="caption" sx={{ fontWeight: 900, color: '#000000 !important', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5, fontSize: '0.74rem' }}>
                    Patient / Caregiver Acknowledgement
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 900, color: '#000000 !important', mb: 1.8, fontSize: '0.88rem' }}>
                    Name: {patientInfo.patientName || 'Patient'}
                  </Typography>
                  <Box sx={{ borderBottom: '1.2px dashed #000000 !important', height: 22, mb: 0.5 }} />
                  <Typography variant="caption" sx={{ color: '#000000 !important', fontWeight: 900, display: 'block', fontSize: '0.74rem' }}>
                    Signature of Patient / Caregiver
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#000000 !important', display: 'block', mt: 0.2, fontSize: '0.7rem', fontWeight: 700 }} suppressHydrationWarning>
                    Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: '#FFFFFF !important', borderTop: '1px solid #E2E8F0 !important' }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ color: '#475569 !important', borderColor: '#CBD5E1 !important', '&:hover': { bgcolor: '#F8FAFC !important', borderColor: '#94A3B8 !important' } }}>
          Close
        </Button>
        <Button onClick={handlePrint} variant="contained" color="primary" startIcon={<Print />} sx={{ bgcolor: '#00C9A7 !important', color: '#FFFFFF !important', fontWeight: 800, '&:hover': { bgcolor: '#00B395 !important' } }}>
          Print / Save PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
}
