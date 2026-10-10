'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
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
  DocumentScanner,
  LocalPharmacy,
  Security,
  Medication,
  Psychology,
  FactCheck
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface FullPageAnalysisLoaderProps {
  open: boolean;
  onFinished?: () => void;
}

const ANALYSIS_STEPS = [
  {
    threshold: 15,
    title: 'Document & OCR Processing',
    description: 'Scanning prescription file and initializing AI parser engine...',
    icon: <DocumentScanner sx={{ fontSize: 20 }} />
  },
  {
    threshold: 35,
    title: 'Extraction of Active Ingredients',
    description: 'Parsing drug names, dosages, administration routes & frequencies...',
    icon: <Medication sx={{ fontSize: 20 }} />
  },
  {
    threshold: 60,
    title: 'Multi-Drug Interaction Scan',
    description: 'Cross-referencing contraindications, severe toxicity & synergy warnings...',
    icon: <Security sx={{ fontSize: 20 }} />
  },
  {
    threshold: 80,
    title: 'Patient Allergy & Organ Safety Guard',
    description: 'Evaluating patient clinical history, renal clearance & liver risk factors...',
    icon: <Psychology sx={{ fontSize: 20 }} />
  },
  {
    threshold: 95,
    title: 'Bio-Equivalents & Clinical Guidance',
    description: 'Formulating evidence-based generic alternatives & patient counselling points...',
    icon: <LocalPharmacy sx={{ fontSize: 20 }} />
  },
  {
    threshold: 100,
    title: 'Clinical Safety Report Ready',
    description: 'Finalizing full AI clinical safety breakdown & risk scores...',
    icon: <FactCheck sx={{ fontSize: 20 }} />
  }
];

export default function FullPageAnalysisLoader({ open, onFinished }: FullPageAnalysisLoaderProps) {
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

  // Determine current active step
  const currentStepIndex = ANALYSIS_STEPS.findIndex(
    (step) => displayProgress <= step.threshold
  );
  const activeStepIdx = currentStepIndex === -1 ? ANALYSIS_STEPS.length - 1 : currentStepIndex;
  const currentStep = ANALYSIS_STEPS[activeStepIdx];

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
          bgcolor: isDark ? 'rgba(10, 15, 29, 0.65)' : 'rgba(244, 247, 251, 0.75)',
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
            bgcolor: isDark ? 'rgba(16, 24, 44, 0.88)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            border: isDark ? '1px solid rgba(0, 201, 167, 0.35)' : '1px solid rgba(0, 201, 167, 0.3)',
            boxShadow: isDark
              ? '0 20px 60px rgba(0, 201, 167, 0.25), 0 0 100px rgba(108, 92, 231, 0.2)'
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
              width: 300,
              height: 120,
              borderRadius: '50%',
              background: isDark
                ? 'radial-gradient(circle, rgba(0, 201, 167, 0.4) 0%, rgba(108, 92, 231, 0) 70%)'
                : 'radial-gradient(circle, rgba(0, 201, 167, 0.22) 0%, rgba(108, 92, 231, 0) 70%)',
              filter: 'blur(30px)',
              pointerEvents: 'none'
            }}
          />

          {/* Central AI Pulse Graphic */}
          <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            {/* Pulsing Outer Rings */}
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
                border: isDark ? '2px solid rgba(0, 201, 167, 0.5)' : '2px solid rgba(0, 201, 167, 0.4)',
                boxShadow: '0 0 20px rgba(0, 201, 167, 0.3)'
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

            {/* Central Icon Avatar */}
            <Box
              sx={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00C9A7 0%, #6C5CE7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(0, 201, 167, 0.4)',
                zIndex: 2
              }}
            >
              <AutoAwesome sx={{ fontSize: 40, color: '#FFFFFF' }} />
            </Box>
          </Box>

          {/* Title & Headline */}
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em', mb: 0.5, color: isDark ? '#F0F4FC' : '#1E293B' }}>
            Analyzing Prescription with AI...
          </Typography>



          {/* Big Digital Percentage Counter (1% -> 100%) */}
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.5 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '3.2rem', sm: '4.2rem' },
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

          {/* Glowing Custom Linear Progress Bar */}
          <Box sx={{ position: 'relative', mb: 3.5, px: 1 }}>
            <Box
              sx={{
                height: 14,
                width: '100%',
                borderRadius: 7,
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 201, 167, 0.12)',
                overflow: 'hidden',
                position: 'relative',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 201, 167, 0.25)'
              }}
            >
              <motion.div
                initial={{ width: '1%' }}
                animate={{ width: `${displayProgress}%` }}
                transition={{ ease: 'easeOut', duration: 0.1 }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #00C9A7 0%, #6C5CE7 60%, #FFB703 100%)',
                  borderRadius: 7,
                  boxShadow: '0 0 16px rgba(0, 201, 167, 0.6)'
                }}
              />
            </Box>
          </Box>

          {/* Active Phase Card with Status Text */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC',
              borderColor: displayProgress === 100 ? '#00C9A7' : isDark ? 'rgba(0, 201, 167, 0.3)' : 'rgba(0, 201, 167, 0.25)',
              textAlign: 'left',
              mb: 3
            }}
          >
            <Stack direction="row" alignItems="flex-start" spacing={1.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  bgcolor: displayProgress === 100 ? 'rgba(0, 201, 167, 0.2)' : 'rgba(108, 92, 231, 0.15)',
                  color: displayProgress === 100 ? '#00C9A7' : '#6C5CE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  mt: 0.2
                }}
              >
                {displayProgress === 100 ? <CheckCircle sx={{ color: '#00C9A7' }} /> : currentStep.icon}
              </Box>

              <Box sx={{ flexGrow: 1 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.3}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isDark ? '#F0F4FC' : '#1E293B' }}>
                    {displayProgress === 100 ? 'Analysis Complete' : currentStep.title}
                  </Typography>
                  <Chip
                    label={`Step ${activeStepIdx + 1} of 6`}
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
                <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', display: 'block', lineHeight: 1.4 }}>
                  {displayProgress === 100 ? 'Generating full clinical report and safety summary...' : currentStep.description}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Mini Step Indicator Dots */}
          <Stack direction="row" spacing={1} justifyContent="center">
            {ANALYSIS_STEPS.map((step, idx) => {
              const isPassed = displayProgress >= step.threshold;
              const isCurrent = idx === activeStepIdx;
              return (
                <Box
                  key={idx}
                  sx={{
                    width: isCurrent ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    bgcolor: isPassed
                      ? '#00C9A7'
                      : isCurrent
                        ? '#6C5CE7'
                        : isDark
                          ? 'rgba(255, 255, 255, 0.18)'
                          : 'rgba(0, 0, 0, 0.12)',
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
