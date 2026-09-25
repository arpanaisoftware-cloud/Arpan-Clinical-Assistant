'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginScreen from '../../components/LoginScreen';
import { useAuth } from '../../context/AuthContext';
import { AuthUser } from '../../types/clinical';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, staffList, login, updateStaffPasscode } = useAuth();

  useEffect(() => {
    if (currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

  const handleLoginSuccess = (user: AuthUser) => {
    login(user);
    toast.success(`Welcome back, ${user.name}! (${user.modulePermissions})`, {
      toastId: 'login-welcome',
    });
    router.push('/');
  };

  return (
    <LoginScreen
      staffList={staffList}
      onLoginSuccess={handleLoginSuccess}
      onUpdatePasscode={updateStaffPasscode}
    />
  );
}
