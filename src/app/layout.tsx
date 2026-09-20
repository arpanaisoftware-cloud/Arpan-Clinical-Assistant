import React, { ReactNode } from 'react';
import './globals.css';
import ThemeRegistry from '../theme/ThemeRegistry';

export const metadata = {
  title: 'DocPulse AI - Prescription Analyzer & Doctor Clinical Copilot',
  description: 'AI-Powered Prescription Analysis, Alternative Drug Recommendations, Interaction Warning System & Digital Rx Builder for Physicians.',
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
