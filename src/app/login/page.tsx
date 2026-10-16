'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginScreen from '../../components/LoginScreen';
import { useAuth } from '../../context/AuthContext';
import { AuthUser } from '../../types/clinical';
import { toast } from 'react-toastify';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, staffList, login, updateStaffPassword } = useAuth();

  // Prevent hydration mismatch — only evaluate auth state after client mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && currentUser) {
      router.push('/');
    }
  }, [mounted, currentUser, router]);

  const handleLoginSuccess = (user: AuthUser) => {
    login(user);
    router.push('/');
  };

  // Consistent server+client render before hydration completes
  if (!mounted) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <LoginScreen
      staffList={staffList}
      onLoginSuccess={handleLoginSuccess}
      onUpdatePassword={updateStaffPassword}
    />
  );
}
