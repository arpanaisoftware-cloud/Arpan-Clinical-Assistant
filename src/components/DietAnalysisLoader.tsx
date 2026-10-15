'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Fade,
  useTheme
} from '@mui/material';
import {
  AutoAwesome,
  CheckCircle,
  Restaurant,
  MonitorHeart,
  WaterDrop,
  Spa,
  LocalDining,
  FactCheck
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface DietAnalysisLoaderProps {
  open: boolean;
  onFinished?: () => void;
}

const DIET_STEPS = [
  {
    threshold: 15,
    title: 'Clinical Vitals & Metabolic Intake',
    description: 'Calibrating BMI, glycemic biomarkers (HbA1c), blood pressure & eGFR renal clearance...',
    icon: <MonitorHeart sx={{ fontSize: 20 }} />
  },
  {
    threshold: 35,
    title: 'Caloric & Macronutrient Partitioning',
    description: 'Computing daily energy target, carbohydrate limits, lean protein & dietary fiber distribution...',
    icon: <Restaurant sx={{ fontSize: 20 }} />
  },
  {
    threshold: 55,
    title: 'Electrolyte & Organ Safety Guard',
    description: 'Enforcing strict sodium (Na), potassium (K), phosphorus & calcium thresholds for renal/cardiac health...',
    icon: <WaterDrop sx={{ fontSize: 20 }} />
  },
  {
    threshold: 75,
    title: 'Authentic Indian Meal Schedule',
    description: 'Structuring 6-slot meal timing (Nashta, Lunch, Evening Snack, Dinner) with calibrated katori portions...',
    icon: <LocalDining sx={{ fontSize: 20 }} />
  },
  {
    threshold: 90,
    title: 'Ayurvedic Spice Therapy & Contraindications',
    description: 'Formulating clinical spice protocols (Haldi, Methi, Dalchini) and disease-specific dietary avoidance alerts...',
    icon: <Spa sx={{ fontSize: 20 }} />
  },
  {
    threshold: 100,
    title: 'Personalized Clinical Diet Chart Ready',
    description: 'Finalizing patient-tailored multilingual nutritional care plan and lifestyle instructions...',
    icon: <FactCheck sx={{ fontSize: 20 }} />
  }
];

export default function DietAnalysisLoader({ open, onFinished }: DietAnalysisLoaderProps) {
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
          // If the parent has finished loading (open becomes false), speed up to 100%
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

          // While still waiting for API (open is true)
          if (prev < 20) {
            return prev + Math.random() * 2 + 1;
          } else if (prev < 50) {
            return prev + Math.random() * 1.5 + 0.8;
          } else if (prev < 80) {
            return prev + Math.random() * 1.2 + 0.5;
          } else if (prev < 95) {
            return prev + Math.random() * 0.4 + 0.2;
          } else if (prev < 99) {
            return prev + 0.05; // Slow crawl near 99% until API completes
          }
          return prev;
        });
      }, 70);

      return () => clearInterval(interval);
    } else {
      // When open turns false, if progress was already running, accelerate to 100
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
  const currentStepIndex = DIET_STEPS.findIndex(
    (step) => displayProgress <= step.threshold
  );
  const activeStepIdx = currentStepIndex === -1 ? DIET_STEPS.length - 1 : currentStepIndex;
  const currentStep = DIET_STEPS[activeStepIdx];

  return (
    <Fade in={isVisible} timeout={300}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: isDark ? 'rgba(10, 15, 29, 0.72)' : 'rgba(244, 247, 251, 0.82)',
          backdropFilter: 'blur(12px)',
          p: 2
        }}
      >
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
                border: isDark ? '2px solid rgba(0, 201, 167, 0.6)' : '2px solid rgba(0, 201, 167, 0.4)',
                boxShadow: '0 0 20px rgba(0, 201, 167, 0.35)'
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
                border: isDark ? '1.5px solid rgba(108, 92, 231, 0.5)' : '1.5px solid rgba(108, 92, 231, 0.35)'
              }}
            />

            <Box
              sx={{
                width: 76,
                height: 76,
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
              background: 'linear-gradient(135deg, #00C9A7 0%, #6C5CE7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.25rem', sm: '1.6rem' }
            }}
          >
            AI Clinical Indian Diet & Nutrition Analysis
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: isDark ? '#94A3B8' : '#64748B',
              mb: 3,
              fontWeight: 500,
              maxWidth: 500,
              mx: 'auto'
            }}
          >
            Formulating evidence-based Indian diet schedule, electrolyte thresholds & macro balance
          </Typography>

          {/* Big Digital Percentage Counter (1% -> 100%) */}
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.5 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '3.2rem', sm: '4rem' },
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
                height: 12,
                borderRadius: 6,
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
              }}
            >
              <motion.div
                style={{
                  height: '100%',
                  borderRadius: 6,
                  background: 'linear-gradient(90deg, #00C9A7 0%, #6C5CE7 65%, #FFB703 100%)',
                  boxShadow: '0 0 14px rgba(0, 201, 167, 0.5)'
                }}
                animate={{ width: `${displayProgress}%` }}
                transition={{ ease: 'easeOut', duration: 0.2 }}
              />
            </Box>

            <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
              <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600 }}>
                {activeStepIdx + 1} of {DIET_STEPS.length}: {currentStep.title}
              </Typography>
              <Chip
                label={`${displayProgress}%`}
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(0, 201, 167, 0.2)' : 'rgba(0, 201, 167, 0.1)',
                  color: '#00C9A7',
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
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 201, 167, 0.04)',
              border: displayProgress === 100
                ? '1px solid #00C9A7'
                : isDark
                  ? '1px solid rgba(255, 255, 255, 0.08)'
                  : '1px solid rgba(0, 201, 167, 0.2)',
              mb: 3,
              textAlign: 'left'
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  color: displayProgress === 100 ? '#00C9A7' : '#00C9A7',
                  bgcolor: displayProgress === 100 ? 'rgba(0, 201, 167, 0.2)' : isDark ? 'rgba(0, 201, 167, 0.15)' : '#FFF',
                  p: 1,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  flexShrink: 0
                }}
              >
                {displayProgress === 100 ? <CheckCircle sx={{ color: '#00C9A7', fontSize: 22 }} /> : currentStep.icon}
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.3}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.2 }}>
                    {displayProgress === 100 ? 'Diet Plan Generated Successfully' : currentStep.title}
                  </Typography>
                  <Chip
                    label={`Step ${activeStepIdx + 1} of ${DIET_STEPS.length}`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(0, 201, 167, 0.15)',
                      color: '#00C9A7',
                      fontWeight: 700,
                      fontSize: '0.65rem',
                      height: 20
                    }}
                  />
                </Stack>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.3 }}>
                  {displayProgress === 100
                    ? 'Personalized Indian Diet Plan & Electrolyte Guidelines are ready for review.'
                    : currentStep.description}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Stepper Dots Checklist */}
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
            {DIET_STEPS.map((step, idx) => {
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
  );
}
