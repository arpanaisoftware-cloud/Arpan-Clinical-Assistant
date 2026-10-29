'use client';

import React, { useState, useEffect, DragEvent, ChangeEvent } from 'react';
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
  Chip,
  CircularProgress
} from '@mui/material';
import CloudUpload from '@mui/icons-material/CloudUpload';
import DocumentScanner from '@mui/icons-material/DocumentScanner';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import InsertDriveFile from '@mui/icons-material/InsertDriveFile';
import Close from '@mui/icons-material/Close';
import PictureAsPdf from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import { toast } from 'react-toastify';

interface PrescriptionUploaderProps {
  onAnalyzeDocument?: (file: File) => void;
  onReset?: () => void;
  isAnalyzing?: boolean;
}

export default function PrescriptionUploader({
  onAnalyzeDocument,
  onReset,
  isAnalyzing = false
}: PrescriptionUploaderProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [activeAiProvider, setActiveAiProvider] = useState<'gemini' | 'deepseek'>('gemini');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleAiChanged = (e: any) => {
        if (e.detail?.provider) {
          setActiveAiProvider(e.detail.provider);
        }
      };
      window.addEventListener('ai-provider-changed', handleAiChanged);
      fetch('/api/admin/ai-settings')
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.activeProvider) setActiveAiProvider(d.activeProvider);
        })
        .catch(() => { });
      return () => window.removeEventListener('ai-provider-changed', handleAiChanged);
    }
  }, []);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnalyzing) {
      setAnalysisProgress(12);
      timer = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 94) return prev;
          const inc = Math.floor(Math.random() * 7) + 5;
          return Math.min(prev + inc, 94);
        });
      }, 280);
    } else {
      setAnalysisProgress(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAnalyzing]);

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
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      toast.info(`Selected: ${droppedFile.name}`);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      toast.info(`Selected: ${selectedFile.name}`);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (onReset) onReset();
    toast.info('Document removed & analysis reset.');
  };

  // ─── SEND PDF/IMAGE DIRECTLY TO AI ────────────────────────────────────────
  const handleAnalyzeDocument = () => {
    if (!file) {
      toast.warning('Please select a prescription document first.');
      return;
    }
    if (onAnalyzeDocument) {
      onAnalyzeDocument(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isPdf = file?.type === 'application/pdf';

  return (
    <Card sx={{ borderRadius: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        {/* Header Title */}
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <DocumentScanner sx={{ color: '#6C5CE7', fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Prescription AI Scanner
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" mb={2.5}>
          Upload a prescription image (JPG/PNG) or PDF. Optical character reading &amp; document parsing is processed by <strong>Gemini Vision OCR</strong> (multimodal document engine).
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
                  {isPdf
                    ? <PictureAsPdf sx={{ color: '#FF4D6D', fontSize: 32 }} />
                    : <ImageIcon sx={{ color: '#6C5CE7', fontSize: 32 }} />
                  }
                  <Box sx={{ minWidth: 0, textAlign: 'left' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(file.size)} • {isPdf ? 'PDF Document' : 'Image File'} — Ready for Vision Scan
                    </Typography>
                  </Box>
                </Stack>
                <IconButton size="small" onClick={handleRemoveFile} color="error" disabled={isAnalyzing}>
                  <Close fontSize="small" />
                </IconButton>
              </Stack>
            </Paper>
          )}

          {isAnalyzing && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="caption" color="secondary" sx={{ fontWeight: 800 }}>
                  ⚡ Scanning &amp; extracting prescription with Gemini Vision OCR...
                </Typography>
                <Typography variant="caption" color="secondary" sx={{ fontWeight: 900 }}>
                  {analysisProgress}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={analysisProgress}
                color="secondary"
                sx={{ height: 8, borderRadius: 2 }}
              />
            </Box>
          )}
        </Box>

        {/* Info chips */}
        <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" gap={1}>
          <Chip label="✦ Direct PDF → AI" size="small" sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: 'rgba(108, 92, 231, 0.12)', color: '#6C5CE7' }} />
          <Chip label="✦ No Manual Typing" size="small" sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: 'rgba(0, 201, 167, 0.12)', color: '#00C9A7' }} />
          <Chip
            label="✦ Powered by Gemini Vision OCR"
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: '0.72rem',
              bgcolor: 'rgba(0, 201, 167, 0.12)',
              color: '#00C9A7',
              border: '1px solid rgba(0, 201, 167, 0.35)'
            }}
          />
        </Stack>



        {/* Dedicated Action Buttons */}
        <Stack direction="row" spacing={1.5} mt={2}>
          {file && (
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleRemoveFile}
              disabled={isAnalyzing}
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
            disabled={!file || isAnalyzing}
            onClick={handleAnalyzeDocument}
            startIcon={isAnalyzing ? <CircularProgress size={18} color="inherit" /> : <AutoAwesome />}
            sx={{
              py: 1.3,
              fontWeight: 800,
              fontSize: '0.95rem',
              borderRadius: 1.5,
              background: 'linear-gradient(135deg, #6C5CE7 0%, #8C7AE6 100%)',
              boxShadow: '0 4px 16px rgba(108, 92, 231, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5b4bc4 0%, #7b69d6 100%)',
              }
            }}
          >
            {isAnalyzing
              ? `Scanning with Gemini Vision... ${analysisProgress}%`
              : 'Scan & Analyze with Gemini Vision'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
