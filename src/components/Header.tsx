'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Avatar,
  Chip,
  Container,
  Stack,
  PaletteMode
} from '@mui/material';
import {
  LocalHospital,
  Brightness4,
  Brightness7,
  Psychology,
  AddCircleOutline,
  CloudUpload,
  VerifiedUser
} from '@mui/icons-material';

interface HeaderProps {
  mode: PaletteMode;
  onToggleMode: () => void;
  onNewRx: () => void;
  onUploadClick: () => void;
  onOpenCopilot: () => void;
}

export default function Header({
  mode,
  onToggleMode,
  onNewRx,
  onUploadClick,
  onOpenCopilot
}: HeaderProps) {
  return (
    <AppBar
      position="sticky"
      sx={{
        background: mode === 'dark' ? 'rgba(10, 15, 29, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: 'none',
        color: mode === 'dark' ? '#F0F4FC' : '#1E293B',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 70 }}>
          {/* Logo & Brand */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #00C9A7 0%, #6C5CE7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(0, 201, 167, 0.4)',
              }}
            >
              <LocalHospital sx={{ color: '#FFF', fontSize: 26 }} />
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6" sx={{ fontWeight: 800, background: 'linear-gradient(90deg, #00C9A7, #6C5CE7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  DocPulse AI
                </Typography>
                <Chip
                  label="PRO CLINICAL v2.4"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    bgcolor: 'rgba(0, 201, 167, 0.15)',
                    color: '#00C9A7',
                    border: '1px solid rgba(0, 201, 167, 0.3)'
                  }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -0.5 }}>
                Intelligent Prescription Analysis & Clinical Decision Support
              </Typography>
            </Box>
          </Stack>

          {/* Quick Action Navigation */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddCircleOutline />}
              onClick={onNewRx}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              New Rx
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              startIcon={<CloudUpload />}
              onClick={onUploadClick}
              sx={{ display: { xs: 'none', md: 'inline-flex' } }}
            >
              Scan Prescription
            </Button>

            <Button
              variant="contained"
              color="secondary"
              startIcon={<Psychology />}
              onClick={onOpenCopilot}
              sx={{
                boxShadow: '0 4px 15px rgba(108, 92, 231, 0.4)',
                background: 'linear-gradient(135deg, #6C5CE7 0%, #4834D4 100%)'
              }}
            >
              AI Copilot
            </Button>

            <IconButton onClick={onToggleMode} color="inherit" sx={{ border: '1px solid rgba(255, 255, 255, 0.12)', ml: 1 }}>
              {mode === 'dark' ? <Brightness7 sx={{ color: '#FFB703' }} /> : <Brightness4 />}
            </IconButton>

            {/* Doctor Profile Badge */}
            <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', pl: 1.5, borderLeft: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Avatar
                sx={{
                  bgcolor: '#6C5CE7',
                  width: 38,
                  height: 38,
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  boxShadow: '0 2px 10px rgba(108, 92, 231, 0.3)'
                }}
              >
                SW
              </Avatar>
              <Box sx={{ ml: 1.2 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    Dr. Sarah Wright, MD
                  </Typography>
                  <VerifiedUser sx={{ fontSize: 16, color: '#00C9A7' }} />
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem' }}>
                  Senior Cardiologist • General Hospital
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
