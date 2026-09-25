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
import {
  Print,
  Close,
  LocalHospital,
  QrCode2,
  Verified
} from '@mui/icons-material';
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

      <DialogContent id="printable-prescription" sx={{ p: 4, bgcolor: '#FFFFFF !important', color: '#1E293B !important' }}>
        {/* Printable Prescription Layout */}
        <Box sx={{ border: '2px solid #00C9A7', borderRadius: 1, p: 3, position: 'relative' }}>
          {/* Header */}
          <Grid container spacing={2} alignItems="center" sx={{ borderBottom: '2px solid #E2E8F0', pb: 2, mb: 3 }}>
            <Grid item xs={8}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#00967D', letterSpacing: '-0.02em' }}>
                ARPAN CLINICAL MEDICAL CENTER
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#475569' }}>
                Dr. Yashwant Dubey • Chief Cardiologist & Internal Medicine
              </Typography>
              {/* <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                Reg. No: MED-8849204 • Tel: +1 (800) 555-0199 • Dept of General Clinical Care
              </Typography> */}
            </Grid>
            {/* <Grid item xs={4} textAlign="right">
              <QrCode2 sx={{ fontSize: 60, color: '#1E293B' }} />
              <Typography variant="caption" sx={{ display: 'block', color: '#64748B', fontSize: '0.65rem' }} suppressHydrationWarning>
                Verified Rx ID: #{rxId}
              </Typography>
            </Grid> */}
          </Grid>

          {/* Patient Info Bar */}
          <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#F8FAFC', borderColor: '#E2E8F0', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Patient Name</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  {patientInfo.patientName || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={3} sm={2}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Age / Gender</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  {patientInfo.age} Y / {patientInfo.gender}
                </Typography>
              </Grid>
              <Grid item xs={3} sm={2}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Weight</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  {patientInfo.weight ? `${patientInfo.weight} kg` : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={5}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Diagnosis / Condition</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00967D' }}>
                  {patientInfo.disease}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Rx Symbol */}
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#00C9A7', fontFamily: 'serif', fontStyle: 'italic', mb: 1 }}>
            ℞
          </Typography>

          {/* Prescribed Table */}
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, borderColor: '#E2E8F0', borderRadius: 1 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#F1F5F9' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#334155' }}>Medication Name</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#334155' }}>Dosage</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#334155' }}>Frequency</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#334155' }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#334155' }}>Instructions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {medications.map((m, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{m.name}</TableCell>
                    <TableCell>{m.dosage}</TableCell>
                    <TableCell>{m.frequency}</TableCell>
                    <TableCell>{m.duration}</TableCell>
                    <TableCell sx={{ color: '#475569' }}>{m.timing || 'As directed'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* AI Clearance Badge & Doctor Sign */}
          <Grid container spacing={2} alignItems="center" sx={{ mt: 3, pt: 2, borderTop: '2px dashed #E2E8F0' }}>
            <Grid item xs={7}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Verified sx={{ color: '#00C9A7', fontSize: 28 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00967D', lineHeight: 1.1 }}>
                    Arpan Clinical AI Safety Verified ({safetyScore}/100)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }} suppressHydrationWarning>
                    Multi-drug conflict & allergy scan executed on {timestamp}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={5} textAlign="right">
              <Box sx={{ borderBottom: '1px solid #94A3B8', width: 160, ml: 'auto', mb: 0.5, height: 30 }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block' }}>
                Physician Signature & Seal
              </Typography>
            </Grid>
          </Grid>
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
