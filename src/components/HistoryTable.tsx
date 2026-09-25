'use client';

import React, { useState, ChangeEvent } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Stack,
  Box
} from '@mui/material';
import { Search, History, PlayArrow } from '@mui/icons-material';
import { HistoryRecord } from '../types/clinical';

const INITIAL_HISTORY: HistoryRecord[] = [
  {
    id: 'RX-9041',
    patientName: 'Robert Vance',
    age: 58,
    gender: 'Male',
    disease: 'Hypertension & Type 2 Diabetes',
    medCount: 4,
    safetyScore: 65,
    risk: 'MODERATE CAUTION',
    color: '#FFB703',
    date: '2026-09-16 10:30 AM'
  },
  {
    id: 'RX-9040',
    patientName: 'Eleanor Vance',
    age: 62,
    gender: 'Female',
    disease: 'Acute Bronchitis & Hypertension',
    medCount: 3,
    safetyScore: 98,
    risk: 'OPTIMAL / LOW RISK',
    color: '#00C9A7',
    date: '2026-09-15 04:15 PM'
  },
  {
    id: 'RX-9039',
    patientName: 'Marcus Miller',
    age: 71,
    gender: 'Male',
    disease: 'Hyperlipidemia & Arthritis',
    medCount: 5,
    safetyScore: 45,
    risk: 'HIGH RISK ALERT',
    color: '#FF4D6D',
    date: '2026-09-14 11:00 AM'
  }
];

interface HistoryTableProps {
  onLoadRecord?: (record: HistoryRecord) => void;
}

export default function HistoryTable({ onLoadRecord }: HistoryTableProps) {
  const [search, setSearch] = useState<string>('');

  const filteredHistory = INITIAL_HISTORY.filter(
    h => h.patientName.toLowerCase().includes(search.toLowerCase()) ||
      h.disease.toLowerCase().includes(search.toLowerCase()) ||
      h.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card sx={{ borderRadius: 1, mt: 4 }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} mb={3}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <History sx={{ color: '#00C9A7', fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Recent Patient Prescription Analysis History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Search past clinical analyses and reload patient profiles with one click.
              </Typography>
            </Box>
          </Stack>

          <TextField
            size="small"
            placeholder="Search patient, disease..."
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 260 }}
          />
        </Stack>

        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Rx ID</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Patient Name</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Vitals</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Diagnosis / Condition</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Rx Count</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Safety Score</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHistory.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: '#00C9A7' }}>{row.id}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{row.patientName}</TableCell>
                  <TableCell>{row.age} Y / {row.gender}</TableCell>
                  <TableCell>{row.disease}</TableCell>
                  <TableCell>{row.medCount} Drugs</TableCell>
                  <TableCell>
                    <Chip
                      label={`${row.safetyScore}/100 - ${row.risk}`}
                      size="small"
                      sx={{ bgcolor: row.color, color: '#FFF', fontWeight: 800, fontSize: '0.7rem' }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{row.date}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      startIcon={<PlayArrow />}
                      onClick={() => onLoadRecord && onLoadRecord(row)}
                    >
                      Reload
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
