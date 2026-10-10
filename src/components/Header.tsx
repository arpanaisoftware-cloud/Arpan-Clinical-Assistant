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
import { useRouter } from 'next/navigation';
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
  onHomeClick?: () => void;
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
  onOpenManageStaff,
  onHomeClick
}: HeaderProps) {
  const router = useRouter();
  const userRole = currentUser?.role || 'Doctor';

  const handleLogoClick = () => {
    if (onHomeClick) {
      onHomeClick();
    }
    router.push('/');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
        background: mode === 'dark' ? 'rgba(10, 15, 29, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: mode === 'dark' ? '0 4px 24px rgba(0,0,0,0.4)' : '0 2px 12px rgba(0,0,0,0.06)',
        color: mode === 'dark' ? '#F0F4FC' : '#1E293B',

      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 70, py: 1 }}>
          {/* Logo & Brand (Clickable, redirects to Home page) */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            onClick={handleLogoClick}
            sx={{ cursor: 'pointer', userSelect: 'none' }}
          >
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
                flexShrink: 0
              }}
            >
              <LocalHospital sx={{ color: '#FFF', fontSize: 26 }} />
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6" sx={{ fontWeight: 800, background: 'linear-gradient(90deg, #00C9A7, #6C5CE7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Arpan Clinical Assistant
                </Typography>
                <Chip
                  label="CARE OS v7.0"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    bgcolor: 'rgba(0, 201, 167, 0.15)',
                    color: '#00C9A7',
                    border: '1px solid rgba(0, 201, 167, 0.3)',
                    display: { xs: 'none', md: 'flex' }
                  }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' }, mt: -0.5 }}>
                Intelligent Prescription, Counselling &amp; Dietary Care Platform
              </Typography>
            </Box>
          </Stack>

          {/* User Role & Quick Actions */}
          {currentUser && (
            <Stack direction="row" alignItems="center" spacing={{ xs: 0.8, sm: 1.5 }}>

              {/* Doctor Manage Staff Button — icon-only on mobile, full button on sm+ */}
              {(userRole === 'Doctor' || currentUser.modulePermissions === 'Full Access') && (
                <Tooltip title="Manage Staff Accounts & Module Access Permissions" arrow placement="bottom">
                  <>
                    {/* Icon-only on xs */}
                    <IconButton
                      onClick={onOpenManageStaff}
                      size="small"
                      color="primary"
                      sx={{
                        display: { xs: 'inline-flex', sm: 'none' },
                        border: '1px solid rgba(0, 201, 167, 0.4)',
                        borderRadius: 1,
                        p: 0.75
                      }}
                    >
                      <SupervisorAccount fontSize="small" />
                    </IconButton>
                    {/* Full button on sm+ */}
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<SupervisorAccount />}
                      onClick={onOpenManageStaff}
                      size="small"
                      sx={{ borderRadius: 1, fontWeight: 700, display: { xs: 'none', sm: 'inline-flex' } }}
                    >
                      Manage Staff
                    </Button>
                  </>
                </Tooltip>
              )}

              {/* Ask AI — icon-only on mobile, full button on sm+ */}
              <Tooltip title="Open AI Clinical Assistant" arrow placement="bottom">
                <>
                  {/* Icon-only on xs */}
                  <IconButton
                    onClick={onOpenCopilot}
                    size="small"
                    sx={{
                      display: { xs: 'inline-flex', sm: 'none' },
                      background: 'linear-gradient(135deg, #6C5CE7 0%, #4834D4 100%)',
                      color: '#FFF',
                      borderRadius: 1,
                      p: 0.75,
                      boxShadow: '0 4px 15px rgba(108, 92, 231, 0.4)',
                      '&:hover': { background: 'linear-gradient(135deg, #5a4bd1 0%, #3b28b8 100%)' }
                    }}
                  >
                    <Psychology fontSize="small" />
                  </IconButton>
                  {/* Full button on sm+ */}
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    startIcon={<Psychology />}
                    onClick={onOpenCopilot}
                    sx={{
                      display: { xs: 'none', sm: 'inline-flex' },
                      boxShadow: '0 4px 15px rgba(108, 92, 231, 0.4)',
                      background: 'linear-gradient(135deg, #6C5CE7 0%, #4834D4 100%)',
                      fontWeight: 700
                    }}
                  >
                    Ask AI
                  </Button>
                </>
              </Tooltip>

              <Tooltip title={mode === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'} arrow placement="bottom">
                <IconButton onClick={onToggleMode} color="inherit" size="small" sx={{ border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                  {mode === 'dark' ? <Brightness7 sx={{ color: '#FFB703' }} /> : <Brightness4 />}
                </IconButton>
              </Tooltip>

              {/* User pill — icon-only logout on xs, full pill on sm+ */}
              {/* xs: just a red logout icon button */}
              <Tooltip title="Sign out of Arpan Clinical Assistant" arrow placement="bottom">
                <IconButton
                  onClick={onLogout}
                  size="small"
                  sx={{
                    display: { xs: 'inline-flex', sm: 'none' },
                    bgcolor: 'rgba(255, 77, 109, 0.15)',
                    color: '#FF4D6D',
                    borderRadius: 1,
                    border: '1px solid rgba(255, 77, 109, 0.4)',
                    p: 0.75,
                    '&:hover': { bgcolor: 'rgba(255, 77, 109, 0.25)' }
                  }}
                >
                  <Logout fontSize="small" />
                </IconButton>
              </Tooltip>

              {/* sm+: full avatar + logout pill */}
              <Box
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  bgcolor: userRole === 'Doctor' ? 'rgba(0, 201, 167, 0.12)' : 'rgba(108, 92, 231, 0.12)',
                  border: userRole === 'Doctor' ? '1px solid rgba(0, 201, 167, 0.4)' : '1px solid rgba(108, 92, 231, 0.4)',
                  borderRadius: 1,
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
                    sx={{ borderRadius: 1, px: 1.2, py: 0.3, fontSize: '0.75rem', fontWeight: 800, ml: 0.5 }}
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
