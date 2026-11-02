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
import Restaurant from '@mui/icons-material/Restaurant';
import MonitorHeart from '@mui/icons-material/MonitorHeart';
import FactCheck from '@mui/icons-material/FactCheck';
import Speed from '@mui/icons-material/Speed';
import { motion } from 'framer-motion';

interface DietRecalculateLoaderProps {
  open: boolean;
  onFinished?: () => void;
}

const RECALCULATE_STEPS = [
  {
    threshold: 25,
    title: 'Parsing Food Quantities & Kitchen Measures',
    description: 'Deconstructing meal schedule dishes, katoris, phulkas & cooked gram weights...',
    icon: <Restaurant sx={{ fontSize: 20 }} />
  },
  {
    threshold: 55,
    title: 'IFCT 2017 & USDA Food Database Calibration',
    description: 'Looking up authentic Indian food composition database values for macros & energy...',
    icon: <MonitorHeart sx={{ fontSize: 20 }} />
  },
  {
    threshold: 80,
    title: 'Bottom-Up Macronutrient Partitioning',
    description: 'Calculating clean protein, complex carbs, healthy fats & dietary fiber distribution...',
    icon: <Speed sx={{ fontSize: 20 }} />
  },
  {
    threshold: 100,
    title: 'Macronutrient Cards Updated & Verified',
    description: 'Finalizing clinically balanced energy targets, Atwater ratios & updated macro breakdown...',
    icon: <CheckCircle sx={{ fontSize: 20 }} />
  }
];

export default function DietRecalculateLoader({ open, onFinished }: DietRecalculateLoaderProps) {
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
          // If parent finished loading (open turned false), quickly accelerate to 100%
          if (!openRef.current) {
            if (prev >= 100) {
              clearInterval(interval);
              setTimeout(() => {
                setIsVisible(false);
                if (onFinished) onFinished();
              }, 300);
              return 100;
            }
            return Math.min(100, prev + 12);
          }

          // While still waiting for API (open is true)
          if (prev < 30) {
            return prev + Math.random() * 4 + 2;
          } else if (prev < 65) {
            return prev + Math.random() * 2.5 + 1.2;
          } else if (prev < 88) {
            return prev + Math.random() * 1.5 + 0.6;
          } else if (prev < 96) {
            return prev + 0.3; // Gentle crawl near completion
          }
          return prev;
        });
      }, 60);

      return () => clearInterval(interval);
    } else {
      // When open turns false, speed up to 100
      if (progress > 1 && progress < 100) {
        const finishInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              clearInterval(finishInterval);
              setTimeout(() => {
                setIsVisible(false);
                if (onFinished) onFinished();
              }, 300);
              return 100;
            }
            return Math.min(100, prev + 14);
          });
        }, 35);
        return () => clearInterval(finishInterval);
      } else {
        setIsVisible(false);
      }
    }
  }, [open]);

  if (!isVisible && !open) return null;

  const displayProgress = Math.min(100, Math.floor(progress));

  const currentStepIndex = RECALCULATE_STEPS.findIndex(
    (step, idx) =>
      progress <= step.threshold || idx === RECALCULATE_STEPS.length - 1
  );
  const activeStep =
    currentStepIndex !== -1 ? RECALCULATE_STEPS[currentStepIndex] : RECALCULATE_STEPS[0];

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
        bgcolor: isDark ? 'rgba(10, 15, 29, 0.82)' : 'rgba(244, 247, 251, 0.88)',
        backdropFilter: 'blur(12px)',
        outline: 'none',
        p: 2
      }}
    >
      <Fade in={isVisible} timeout={250}>
        <Box sx={{ outline: 'none', width: '100%', maxWidth: 640, mx: 'auto', my: 'auto' }}>
          <Paper
            elevation={isDark ? 24 : 12}
            sx={{
              width: '100%',
              maxWidth: 640,
              mx: 'auto',
              borderRadius: 3,
              p: { xs: 3, sm: 4 },
              bgcolor: isDark ? 'rgba(16, 24, 44, 0.94)' : 'rgba(255, 255, 255, 0.97)',
              backdropFilter: 'blur(16px)',
              border: isDark ? '1px solid rgba(0, 201, 167, 0.45)' : '1px solid rgba(0, 201, 167, 0.3)',
              boxShadow: isDark
                ? '0 20px 60px rgba(0, 201, 167, 0.3), 0 0 100px rgba(108, 92, 231, 0.2)'
                : '0 20px 60px rgba(0, 201, 167, 0.15), 0 10px 30px rgba(108, 92, 231, 0.1)',
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
                  ? 'radial-gradient(circle, rgba(0, 201, 167, 0.45) 0%, rgba(108, 92, 231, 0) 70%)'
                  : 'radial-gradient(circle, rgba(0, 201, 167, 0.25) 0%, rgba(108, 92, 231, 0) 70%)',
                filter: 'blur(30px)',
                pointerEvents: 'none'
              }}
            />

            {/* Central Rotating Pulse Graphic */}
            <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
              <motion.div
                animate={{
                  scale: [1, 1.25, 1],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                style={{
                  position: 'absolute',
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  border: isDark ? '2px solid rgba(0, 201, 167, 0.6)' : '2px solid rgba(0, 201, 167, 0.4)',
                  boxShadow: '0 0 20px rgba(0, 201, 167, 0.35)'
                }}
              />
              <motion.div
                animate={{
                  scale: [1.15, 1.45, 1.15],
                  opacity: [0.15, 0.4, 0.15]
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.25
                }}
                style={{
                  position: 'absolute',
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  border: isDark ? '1.5px solid rgba(108, 92, 231, 0.5)' : '1.5px solid rgba(108, 92, 231, 0.35)'
                }}
              />

              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00C9A7 0%, #6C5CE7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF',
                  boxShadow: '0 8px 24px rgba(0, 201, 167, 0.45)',
                  zIndex: 2
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Restaurant sx={{ fontSize: 34 }} />
                </motion.div>
              </Box>
            </Box>

            {/* Header */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                letterSpacing: '-0.02em',
                mb: 0.5,
                background: 'linear-gradient(135deg, #00C9A7 0%, #6C5CE7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.2rem', sm: '1.5rem' }
              }}
            >
              Recalculating Nutrition &amp; Macronutrients
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: isDark ? '#94A3B8' : '#64748B',
                mb: 2.5,
                fontWeight: 500,
                maxWidth: 480,
                mx: 'auto'
              }}
            >
              Calibrating bottom-up Indian Food Composition Tables (IFCT 2017) &amp; USDA macro values
            </Typography>

            {/* Digital Percentage Counter */}
            <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.5 }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '2.8rem', sm: '3.6rem' },
                  lineHeight: 1,
                  fontFamily: 'monospace, sans-serif',
                  background: 'linear-gradient(135deg, #00C9A7 0%, #6C5CE7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.03em'
                }}
              >
                {displayProgress}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: '#00C9A7',
                  fontFamily: 'monospace, sans-serif'
                }}
              >
                %
              </Typography>
            </Box>

            {/* Main Progress Bar */}
            <Box sx={{ width: '100%', mb: 2.5, px: 0.5 }}>
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
                    background: 'linear-gradient(90deg, #00C9A7 0%, #00B4D8 50%, #6C5CE7 100%)',
                    borderRadius: 5,
                    boxShadow: '0 0 12px rgba(0, 201, 167, 0.65)'
                  }}
                  animate={{ width: `${displayProgress}%` }}
                  transition={{ ease: 'linear', duration: 0.15 }}
                />
              </Box>
            </Box>

            {/* Current Active Step Card */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(0, 201, 167, 0.06)' : 'rgba(0, 201, 167, 0.04)',
                border: isDark ? '1px solid rgba(0, 201, 167, 0.25)' : '1px solid rgba(0, 201, 167, 0.2)',
                mb: 2.5,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(0, 201, 167, 0.15)',
                  color: '#00C9A7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {activeStep.icon}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={0.3}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isDark ? '#FFF' : '#0F172A', fontSize: '0.88rem' }}>
                    {activeStep.title}
                  </Typography>
                  <Chip
                    label={`Step ${currentStepIndex + 1} of ${RECALCULATE_STEPS.length}`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      bgcolor: 'rgba(0, 201, 167, 0.15)',
                      color: '#00C9A7'
                    }}
                  />
                </Stack>
                <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', display: 'block', lineHeight: 1.3 }}>
                  {activeStep.description}
                </Typography>
              </Box>
            </Paper>

            {/* Step Pills Along Bottom */}
            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" gap={0.8}>
              {RECALCULATE_STEPS.map((step, idx) => {
                const isPassed = progress > step.threshold;
                const isCurrent = currentStepIndex === idx;

                return (
                  <Chip
                    key={idx}
                    icon={
                      isPassed ? (
                        <CheckCircle sx={{ fontSize: '13px !important', color: '#00C9A7 !important' }} />
                      ) : undefined
                    }
                    label={step.title.split(' ')[0] + ' ' + (step.title.split(' ')[1] || '')}
                    size="small"
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      bgcolor: isPassed
                        ? 'rgba(0, 201, 167, 0.12)'
                        : isCurrent
                        ? isDark
                          ? 'rgba(108, 92, 231, 0.25)'
                          : 'rgba(108, 92, 231, 0.15)'
                        : isDark
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'rgba(0, 0, 0, 0.04)',
                      color: isPassed
                        ? '#00C9A7'
                        : isCurrent
                        ? '#8B5CF6'
                        : isDark
                        ? '#64748B'
                        : '#94A3B8',
                      border: isCurrent
                        ? '1px solid #8B5CF6'
                        : isPassed
                        ? '1px solid rgba(0, 201, 167, 0.4)'
                        : '1px solid transparent'
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

