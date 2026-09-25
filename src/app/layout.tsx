import React, { ReactNode } from 'react';
import './globals.css';
import ThemeRegistry from '../theme/ThemeRegistry';

export const metadata = {
  title: 'Arpan Clinical Assistant - Clinical Care & Patient Management OS',
  description: 'AI-Powered Clinical Care OS: Prescription Analysis, Patient Counselling, Clinical Diets & Nutrition Management for Physicians and Staff.',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
