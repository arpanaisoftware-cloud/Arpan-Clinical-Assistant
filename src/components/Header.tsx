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
  PaletteMode,
  Tooltip
} from '@mui/material';
import {
  LocalHospital,
  Brightness4,
  Brightness7,
  Psychology,
  AddCircleOutline,
  CloudUpload,
  SupervisorAccount,
  Logout
} from '@mui/icons-material';
import { AuthUser } from '../types/clinical';

interface HeaderProps {
  mode: PaletteMode;
  onToggleMode: () => void;
  onNewRx: () => void;
  onUploadClick: () => void;
  onOpenCopilot: () => void;
  activeModuleTab: number;
  currentUser: AuthUser | null;
  onLogout: () => void;
  onOpenManageStaff: () => void;
}

export default function Header({
  mode,
  onToggleMode,
  onNewRx,
  onUploadClick,
  onOpenCopilot,
  activeModuleTab,
  currentUser,
  onLogout,
  onOpenManageStaff
}: HeaderProps) {
  const userRole = currentUser?.role || 'Doctor';

  return (
    <AppBar
      position="sticky"
      sx={{
        background: mode === 'dark' ? 'rgba(10, 15, 29, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: 'none',
        color: mode === 'dark' ? '#F0F4FC' : '#1E293B',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 70, py: 1 }}>
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
                  Arpan Clinical Assistant
                </Typography>
                <Chip
                  label="CARE OS v3.0"
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
                Intelligent Prescription, Counselling & Dietary Care Platform
              </Typography>
            </Box>
          </Stack>

          {/* User Role & Quick Actions */}
          {currentUser && (
            <Stack direction="row" alignItems="center" spacing={1.5}>
              {/* Doctor Manage Staff Button */}
              {(userRole === 'Doctor' || currentUser.modulePermissions === 'Full Access') && (
                <Tooltip title="Manage Staff Accounts & Module Access Permissions" arrow placement="bottom">
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<SupervisorAccount />}
                    onClick={onOpenManageStaff}
                    size="small"
                    sx={{ borderRadius: 2, fontWeight: 700, display: { xs: 'none', sm: 'inline-flex' } }}
                  >
                    Manage Staff
                  </Button>
                </Tooltip>
              )}

              {userRole === 'Doctor' && activeModuleTab === 0 && (
                <>
                  <Tooltip title="Create a new blank patient prescription template" arrow placement="bottom">
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<AddCircleOutline />}
                      onClick={onNewRx}
                      sx={{ display: { xs: 'none', md: 'inline-flex' } }}
                    >
                      New Rx
                    </Button>
                  </Tooltip>
                  <Tooltip title="Upload paper prescription photo or PDF for AI extraction" arrow placement="bottom">
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      startIcon={<CloudUpload />}
                      onClick={onUploadClick}
                      sx={{ display: { xs: 'none', lg: 'inline-flex' } }}
                    >
                      Scan Rx
                    </Button>
                  </Tooltip>
                </>
              )}

              <Tooltip title="Open AI Doctor Copilot Clinical Assistant Drawer" arrow placement="bottom">
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  startIcon={<Psychology />}
                  onClick={onOpenCopilot}
                  sx={{
                    boxShadow: '0 4px 15px rgba(108, 92, 231, 0.4)',
                    background: 'linear-gradient(135deg, #6C5CE7 0%, #4834D4 100%)',
                    fontWeight: 700
                  }}
                >
                  Copilot
                </Button>
              </Tooltip>

              <Tooltip title={mode === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'} arrow placement="bottom">
                <IconButton onClick={onToggleMode} color="inherit" size="small" sx={{ border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                  {mode === 'dark' ? <Brightness7 sx={{ color: '#FFB703' }} /> : <Brightness4 />}
                </IconButton>
              </Tooltip>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: userRole === 'Doctor' ? 'rgba(0, 201, 167, 0.12)' : 'rgba(108, 92, 231, 0.12)',
                  border: userRole === 'Doctor' ? '1px solid rgba(0, 201, 167, 0.4)' : '1px solid rgba(108, 92, 231, 0.4)',
                  borderRadius: 3,
                  px: 1,
                  py: 0.5
                }}
              >
                <Tooltip title={`Active Account: ${currentUser.name} (${currentUser.role})`} arrow placement="bottom">
                  <Avatar
                    sx={{
                      bgcolor: userRole === 'Doctor' ? '#00C9A7' : '#6C5CE7',
                      width: 30,
                      height: 30,
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      mr: 0.5,
                      cursor: 'pointer'
                    }}
                  >
                    {userRole === 'Doctor' ? 'DR' : 'ST'}
                  </Avatar>
                </Tooltip>

                <Tooltip title="Sign out of Arpan Clinical Assistant" arrow placement="bottom">
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    startIcon={<Logout fontSize="small" />}
                    onClick={onLogout}
                    sx={{ borderRadius: 2, px: 1.2, py: 0.3, fontSize: '0.75rem', fontWeight: 800, ml: 0.5 }}
                  >
                    Logout
                  </Button>
                </Tooltip>
              </Box>
            </Stack>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
