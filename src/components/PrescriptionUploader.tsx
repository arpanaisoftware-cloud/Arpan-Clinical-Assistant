'use client';

import React, { useState, DragEvent, ChangeEvent } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  LinearProgress,
  Paper,
  Button,
  IconButton,
  Chip
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  DocumentScanner,
  AutoAwesome,
  InsertDriveFile,
  Close
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { PatientInput } from '../types/clinical';

interface PrescriptionUploaderProps {
  onAutoExtract?: (extractedData: PatientInput) => void;
  onAnalyzeDocument?: (file: File) => void;
  onReset?: () => void;
  isAnalyzing?: boolean;
}

export default function PrescriptionUploader({
  onAutoExtract,
  onAnalyzeDocument,
  onReset,
  isAnalyzing = false
}: PrescriptionUploaderProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedText, setScannedText] = useState<string>('');

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setScannedText('');
      toast.info(`Selected file: ${e.dataTransfer.files[0].name}`);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setScannedText('');
      toast.info(`Selected file: ${e.target.files[0].name}`);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setScannedText('');
    if (onReset) onReset();
    toast.info('Document removed & analysis reset.');
  };

  // ─── DOCUMENT AI ANALYZE HANDLER ──────────────────────────────────────────
  // 💡 API INTEGRATION POINT 1 (Document Upload AI Endpoint):
  // Integrate your Document AI API call here (e.g. POST /api/analyze-document with FormData)
  const handleAnalyzeDocument = () => {
    if (!file) {
      toast.warning('Please select a prescription document first.');
      return;
    }

    setIsScanning(true);
    toast.info(`Sending ${file.name} directly to Document AI API...`);

    if (onAnalyzeDocument) {
      onAnalyzeDocument(file);
    }

    // Simulate Document AI OCR & Extraction Process
    setTimeout(() => {
      setIsScanning(false);
      const simulatedExtraction: PatientInput = {
        patientName: "Eleanor Vance",
        age: 62,
        gender: "Female",
        weight: 68,
        allergies: "Penicillin",
        disease: "Acute Bronchitis & Essential Hypertension",
        medications: [
          { name: "Amoxicillin", dosage: "500mg", frequency: "Thrice Daily", duration: "7 Days", timing: "After meals" },
          { name: "Lisinopril", dosage: "10mg", frequency: "Once Daily", duration: "30 Days", timing: "Morning" },
          { name: "Omeprazole", dosage: "20mg", frequency: "Once Daily", duration: "14 Days", timing: "30 min before breakfast" }
        ]
      };

      setScannedText(
        `Patient: Eleanor Vance (62, Female)\nDiagnosis: Acute Bronchitis & Essential Hypertension\nRx Identified:\n1. Amoxicillin 500mg TID (7 Days)\n2. Lisinopril 10mg QD (30 Days)\n3. Omeprazole 20mg QD (14 Days)`
      );

      toast.success("Document AI OCR Extraction Complete!");

      if (onAutoExtract) {
        onAutoExtract(simulatedExtraction);
      }
    }, 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card sx={{ borderRadius: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        {/* Header Title */}
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <DocumentScanner sx={{ color: '#6C5CE7', fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Prescription Document Scanner
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" mb={2.5}>
          Upload a paper prescription image (PNG/JPG) or PDF. Click <strong>Analyze</strong> to send directly to Document AI API.
        </Typography>

        {/* Upload Drop Zone */}
        <Box
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          sx={{
            p: 3,
            border: isDragging ? '2px dashed #00C9A7' : '2px dashed rgba(108, 92, 231, 0.4)',
            borderRadius: 1.5,
            bgcolor: isDragging ? 'rgba(0, 201, 167, 0.08)' : 'rgba(108, 92, 231, 0.04)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="prescription-file-input"
          />

          {!file ? (
            <label htmlFor="prescription-file-input" style={{ width: '100%', cursor: 'pointer', display: 'block' }}>
              <Box sx={{ py: 1.5 }}>
                <CloudUpload sx={{ fontSize: 48, color: '#6C5CE7', mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Drag &amp; Drop Prescription Here
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Supports JPG, PNG, WEBP, or PDF (Max 15MB)
                </Typography>
              </Box>
            </label>
          ) : (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
                  <InsertDriveFile sx={{ color: '#6C5CE7', fontSize: 32 }} />
                  <Box sx={{ minWidth: 0, textAlign: 'left' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(file.size)} • Ready for AI Scan
                    </Typography>
                  </Box>
                </Stack>
                <IconButton size="small" onClick={handleRemoveFile} color="error">
                  <Close fontSize="small" />
                </IconButton>
              </Stack>
            </Paper>
          )}

          {isScanning && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography variant="caption" color="secondary" sx={{ fontWeight: 800, display: 'block', mb: 0.5 }}>
                ⚡ Scanning Rx handwriting &amp; sending directly to Document AI API...
              </Typography>
              <LinearProgress color="secondary" />
            </Box>
          )}
        </Box>

        {/* Dedicated Action Buttons for Document Upload */}
        <Stack direction="row" spacing={1.5} mt={2.5}>
          {file && (
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleRemoveFile}
              disabled={isScanning || isAnalyzing}
              sx={{ borderRadius: 1.5, px: 2.5, fontWeight: 700 }}
            >
              Reset
            </Button>
          )}

          <Button
            fullWidth
            variant="contained"
            color="secondary"
            size="large"
            disabled={!file || isScanning || isAnalyzing}
            onClick={handleAnalyzeDocument}
            startIcon={<AutoAwesome />}
            sx={{
              py: 1.3,
              fontWeight: 800,
              fontSize: '1rem',
              borderRadius: 1.5,
              background: 'linear-gradient(135deg, #6C5CE7 0%, #8C7AE6 100%)',
              boxShadow: '0 4px 16px rgba(108, 92, 231, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5b4bc4 0%, #7b69d6 100%)',
              }
            }}
          >
            {isScanning || isAnalyzing ? 'Analyzing Document with AI...' : 'Analyze'}
          </Button>
        </Stack>

        {/* OCR Result View */}
        {scannedText && (
          <Paper
            variant="outlined"
            sx={{
              mt: 2.5,
              p: 2,
              borderRadius: 1,
              borderColor: 'rgba(0, 201, 167, 0.3)',
              bgcolor: 'rgba(0, 201, 167, 0.05)'
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <CheckCircle sx={{ color: '#00C9A7', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00C9A7' }}>
                Document AI Extracted Result:
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-line', fontSize: '0.82rem' }}>
              {scannedText}
            </Typography>
          </Paper>
        )}
      </CardContent>
    </Card>
  );
}

