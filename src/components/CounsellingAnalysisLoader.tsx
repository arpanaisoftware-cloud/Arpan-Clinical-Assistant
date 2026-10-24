'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Fade,
  Modal,
  useTheme
} from '@mui/material';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Favorite from '@mui/icons-material/Favorite';
import Psychology from '@mui/icons-material/Psychology';
import Visibility from '@mui/icons-material/Visibility';
import WaterDrop from '@mui/icons-material/WaterDrop';
import HealthAndSafety from '@mui/icons-material/HealthAndSafety';
import FactCheck from '@mui/icons-material/FactCheck';
import { motion } from 'framer-motion';

interface CounsellingAnalysisLoaderProps {
  open: boolean;
  onFinished?: () => void;
}

const COUNSELLING_STEPS = [
  {
    threshold: 15,
    title: 'Patient Intake & Vitals Calibration',
    description: 'Processing blood pressure, glycemic biomarkers, and physiological parameters...',
    icon: <HealthAndSafety sx={{ fontSize: 20 }} />
  },
  {
    threshold: 35,
    title: 'Coronary & Cerebrovascular Risk Scan',
    description: 'Analyzing separate Myocardial Infarction and Stroke risk vectors...',
    icon: <Favorite sx={{ fontSize: 20 }} />
  },
  {
    threshold: 60,
    title: 'Microvascular Retinal & Renal Assessment',
    description: 'Cross-referencing diabetic retinopathy stages and eGFR filtration trends...',
    icon: <Visibility sx={{ fontSize: 20 }} />
  },
  {
    threshold: 80,
    title: 'Neuropathic & Foot Complication Audit',
    description: 'Evaluating Semmes-Weinstein monofilament sensation & Wagner foot ulcer grade...',
    icon: <Psychology sx={{ fontSize: 20 }} />
  },
  {
    threshold: 95,
    title: 'Synthesizing Clinical & Patient Guidelines',
    description: 'Formulating evidence-based lifestyle changes and target clinical goals...',
    icon: <WaterDrop sx={{ fontSize: 20 }} />
  },
  {
    threshold: 100,
    title: '10-Factor Counselling Report Ready',
    description: 'Finalizing full chronic disease complication advisory report...',
    icon: <FactCheck sx={{ fontSize: 20 }} />
  }
];

export default function CounsellingAnalysisLoader({ open, onFinished }: CounsellingAnalysisLoaderProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [progress, setProgress] = useState<number>(1);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setProgress(1);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (!openRef.current) {
            if (prev >= 100) {
              clearInterval(interval);
              setTimeout(() => {
                setIsVisible(false);
                if (onFinished) onFinished();
              }, 400);
              return 100;
            }
            return Math.min(100, prev + 6);
          }

          if (prev < 20) {
            return prev + Math.random() * 2 + 1;
          } else if (prev < 50) {
            return prev + Math.random() * 1.5 + 0.8;
          } else if (prev < 80) {
            return prev + Math.random() * 1.2 + 0.5;
          } else if (prev < 95) {
            return prev + Math.random() * 0.4 + 0.2;
          } else if (prev < 99) {
            return prev + 0.05;
          }
          return prev;
        });
      }, 70);

      return () => clearInterval(interval);
    } else {
      if (progress > 1 && progress < 100) {
        const finishInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              clearInterval(finishInterval);
              setTimeout(() => {
                setIsVisible(false);
                if (onFinished) onFinished();
              }, 400);
              return 100;
            }
            return Math.min(100, prev + 8);
          });
        }, 40);
        return () => clearInterval(finishInterval);
      } else {
        setIsVisible(false);
      }
    }
  }, [open]);

  if (!isVisible && !open) return null;

  const displayProgress = Math.min(100, Math.max(1, Math.floor(progress)));
  const currentStepIndex = COUNSELLING_STEPS.findIndex(
    (step) => displayProgress <= step.threshold
  );
  const activeStepIdx = currentStepIndex === -1 ? COUNSELLING_STEPS.length - 1 : currentStepIndex;
  const currentStep = COUNSELLING_STEPS[activeStepIdx];

  return (
    <Modal
      open={isVisible}
      closeAfterTransition
      disableAutoFocus
      disableEnforceFocus
      sx={{
        zIndex: 999999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: isDark ? 'rgba(10, 15, 29, 0.78)' : 'rgba(244, 247, 251, 0.85)',
        backdropFilter: 'blur(12px)',
        outline: 'none',
        p: 2
      }}
    >
      <Fade in={isVisible} timeout={300}>
        <Box sx={{ outline: 'none', width: '100%', maxWidth: 680, mx: 'auto', my: 'auto' }}>
          <Paper
            elevation={isDark ? 24 : 12}
            sx={{
              width: '100%',
              maxWidth: 680,
              mx: 'auto',
              my: 'auto',
              borderRadius: 3,
              p: { xs: 3, sm: 4.5 },
              bgcolor: isDark ? 'rgba(16, 24, 44, 0.92)' : 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(16px)',
              border: isDark ? '1px solid rgba(108, 92, 231, 0.45)' : '1px solid rgba(108, 92, 231, 0.3)',
              boxShadow: isDark
                ? '0 20px 60px rgba(108, 92, 231, 0.3), 0 0 100px rgba(0, 201, 167, 0.2)'
                : '0 20px 60px rgba(108, 92, 231, 0.15), 0 10px 30px rgba(0, 201, 167, 0.1)',
              color: isDark ? '#F0F4FC' : '#1E293B',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Top Decorative Ambient Glow */}
            <Box
              sx={{
                position: 'absolute',
                top: -60,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 320,
                height: 120,
                borderRadius: '50%',
                background: isDark
                  ? 'radial-gradient(circle, rgba(108, 92, 231, 0.45) 0%, rgba(0, 201, 167, 0) 70%)'
                  : 'radial-gradient(circle, rgba(108, 92, 231, 0.25) 0%, rgba(0, 201, 167, 0) 70%)',
                filter: 'blur(30px)',
                pointerEvents: 'none'
              }}
            />

            {/* Central AI Pulse Graphic */}
            <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                style={{
                  position: 'absolute',
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  border: isDark ? '2px solid rgba(108, 92, 231, 0.6)' : '2px solid rgba(108, 92, 231, 0.4)',
                  boxShadow: '0 0 20px rgba(108, 92, 231, 0.35)'
                }}
              />
              <motion.div
                animate={{
                  scale: [1.2, 1.5, 1.2],
                  opacity: [0.15, 0.4, 0.15]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.3
                }}
                style={{
                  position: 'absolute',
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  border: isDark ? '1.5px solid rgba(0, 201, 167, 0.5)' : '1.5px solid rgba(0, 201, 167, 0.35)'
                }}
              />

              <Box
                sx={{
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #00C9A7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF',
                  boxShadow: '0 8px 24px rgba(108, 92, 231, 0.45)',
                  zIndex: 2
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <AutoAwesome sx={{ fontSize: 38 }} />
                </motion.div>
              </Box>
            </Box>

            {/* Heading */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                letterSpacing: '-0.02em',
                mb: 0.5,
                background: 'linear-gradient(135deg, #6C5CE7 0%, #00C9A7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.25rem', sm: '1.6rem' }
              }}
            >
              AI Patient Chronic Risk Analysis
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: isDark ? '#94A3B8' : '#64748B',
                mb: 3,
                fontWeight: 500,
                maxWidth: 480,
                mx: 'auto'
              }}
            >
              Evaluating 6 Chronic Risk Factors & formulating personalized clinical counseling guidance
            </Typography>

            {/* Main Progress Bar */}
            <Box sx={{ width: '100%', mb: 2 }}>
              <Box
                sx={{
                  width: '100%',
                  height: 10,
                  borderRadius: 5,
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
                }}
              >
                <motion.div
                  style={{
                    height: '100%',
                    borderRadius: 5,
                    background: 'linear-gradient(90deg, #6C5CE7 0%, #00C9A7 100%)',
                    boxShadow: '0 0 12px rgba(108, 92, 231, 0.5)'
                  }}
                  animate={{ width: `${displayProgress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.2 }}
                />
              </Box>

              <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
                <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600 }}>
                  {activeStepIdx + 1} of {COUNSELLING_STEPS.length}: {currentStep.title}
                </Typography>
                <Chip
                  label={`${displayProgress}%`}
                  size="small"
                  sx={{
                    bgcolor: isDark ? 'rgba(108, 92, 231, 0.2)' : 'rgba(108, 92, 231, 0.1)',
                    color: '#6C5CE7',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    height: 22
                  }}
                />
              </Stack>
            </Box>

            {/* Active Step Card */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(108, 92, 231, 0.04)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(108, 92, 231, 0.15)',
                mb: 3,
                textAlign: 'left'
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    color: '#6C5CE7',
                    bgcolor: isDark ? 'rgba(108, 92, 231, 0.15)' : '#FFF',
                    p: 1,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}
                >
                  {currentStep.icon}
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.2 }}>
                    {currentStep.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.3 }}>
                    {currentStep.description}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Stepper Dots Checklist */}
            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
              {COUNSELLING_STEPS.map((step, idx) => {
                const isDone = displayProgress >= step.threshold;
                const isCurrent = activeStepIdx === idx;
                return (
                  <Box
                    key={idx}
                    sx={{
                      width: isCurrent ? 24 : 8,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: isDone
                        ? '#00C9A7'
                        : isCurrent
                          ? '#6C5CE7'
                          : isDark
                            ? 'rgba(255, 255, 255, 0.12)'
                            : 'rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                );
              })}
            </Stack>
          </Paper>
        </Box>
      </Fade>
    </Modal>
  );
}
