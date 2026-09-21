'use client';

import React, { useState, DragEvent, ChangeEvent } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  LinearProgress,
  Paper
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  DocumentScanner
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { PatientInput } from '../types/clinical';

interface PrescriptionUploaderProps {
  onAutoExtract?: (extractedData: PatientInput) => void;
}

export default function PrescriptionUploader({ onAutoExtract }: PrescriptionUploaderProps) {
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
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (uploadedFile: File) => {
    setFile(uploadedFile);
    setIsScanning(true);
    toast.info(`Scanning prescription file: ${uploadedFile.name}`);

    // Simulate OCR Scanning laser process
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
      setScannedText(`Patient: Eleanor Vance (62, Female)\nDiagnosis: Acute Bronchitis & Essential Hypertension\nRx Identified:\n1. Amoxicillin 500mg TID (7 Days)\n2. Lisinopril 10mg QD (30 Days)\n3. Omeprazole 20mg QD (14 Days)`);
      toast.success("Prescription OCR Extraction Successful!");
      if (onAutoExtract) {
        onAutoExtract(simulatedExtraction);
      }
    }, 2200);
  };

  return (
    <Card sx={{ borderRadius: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <DocumentScanner sx={{ color: '#6C5CE7', fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Prescription Document Scanner & OCR
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Upload a paper prescription image (PNG/JPG) or PDF. The AI OCR will extract patient vitals and medications automatically.
        </Typography>

        <Box
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          sx={{
            p: 3,
            border: isDragging ? '2px dashed #00C9A7' : '2px dashed rgba(108, 92, 231, 0.4)',
            borderRadius: 3,
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

          <label htmlFor="prescription-file-input" style={{ width: '100%', cursor: 'pointer', display: 'block' }}>
            <Box sx={{ py: 1 }}>
              <CloudUpload sx={{ fontSize: 48, color: '#6C5CE7', mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {file ? file.name : "Drag & Drop Prescription Here"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Supports JPG, PNG, WEBP, or PDF (Max 15MB)
              </Typography>
            </Box>
          </label>

          {isScanning && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography variant="caption" color="primary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                ⚡ Scanning Rx handwriting & extracting active ingredients...
              </Typography>
              <LinearProgress color="secondary" />
            </Box>
          )}
        </Box>

        {scannedText && (
          <Paper
            variant="outlined"
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 3,
              borderColor: 'rgba(0, 201, 167, 0.3)',
              bgcolor: 'rgba(0, 201, 167, 0.05)'
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <CheckCircle sx={{ color: '#00C9A7', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#00C9A7' }}>
                AI OCR Auto-Extracted Content:
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
