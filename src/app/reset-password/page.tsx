'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ResetPasswordScreen from '../../components/ResetPasswordScreen';
import { Box, CircularProgress } from '@mui/material';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || undefined;

  return <ResetPasswordScreen token={token} />;
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress color="primary" />
        </Box>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
