'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ResetPasswordScreen from '../../../components/ResetPasswordScreen';

export default function ResetPasswordTokenPage() {
  const params = useParams();
  const token = (params?.token as string) || 'ec7d83c2082486ed808146848a9247e8e4414409cf24f4d04af6bb4ff710acd7';

  return <ResetPasswordScreen token={token} />;
}
