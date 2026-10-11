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
import { useRouter } from 'next/navigation';
import { Search, History, PlayArrow, Psychology, OpenInNew } from '@mui/icons-material';
import { Tooltip, IconButton } from '@mui/material';
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
  historyList?: HistoryRecord[];
  onLoadRecord?: (record: HistoryRecord) => void;
  onAskAi?: (record: HistoryRecord) => void;
}

export default function HistoryTable({ historyList, onLoadRecord, onAskAi }: HistoryTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState<string>('');

  const records = historyList && historyList.length > 0 ? historyList : INITIAL_HISTORY;

  const filteredHistory = records.filter(
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
                Search past clinical analyses, reload full patient dashboards, or consult with AI Copilot on analyzed records.
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
                <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap', width: '1%' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHistory.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: '#00C9A7', whiteSpace: 'nowrap' }}>{row.id}</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{row.patientName}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.age} Y / {row.gender}</TableCell>
                  <TableCell>{row.disease}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.medCount} Drugs</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Chip
                      label={`${row.safetyScore}/100 - ${row.risk}`}
                      size="small"
                      sx={{ bgcolor: row.color, color: '#FFF', fontWeight: 800, fontSize: '0.7rem' }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>{row.date}</TableCell>
                  <TableCell align="center" sx={{ whiteSpace: 'nowrap', width: '1%' }}>
                    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                      <Tooltip title={`Consult AI Doctor regarding ${row.patientName}'s analyzed profile (Quick Drawer)`} arrow>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Psychology fontSize="small" />}
                          onClick={() => onAskAi && onAskAi(row)}
                          sx={{
                            background: 'linear-gradient(135deg, #6C5CE7 0%, #4834D4 100%)',
                            color: '#FFF',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            textTransform: 'none',
                            px: 1.5,
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            boxShadow: '0 2px 8px rgba(108, 92, 231, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #5a4bd1 0%, #3b28b8 100%)',
                            }
                          }}
                        >
                          Ask AI
                        </Button>
                      </Tooltip>

                      <Tooltip title={`Open ${row.patientName} in Full-Page Clinical AI Workspace`} arrow>
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/ai-chat?patient=${row.id}`)}
                          sx={{
                            color: '#6C5CE7',
                            border: '1px solid rgba(108, 92, 231, 0.3)',
                            borderRadius: 1,
                            p: 0.6,
                            flexShrink: 0,
                            '&:hover': {
                              bgcolor: 'rgba(108, 92, 231, 0.1)',
                              borderColor: '#6C5CE7',
                            }
                          }}
                        >
                          <OpenInNew fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Reload full analysis dashboard for this patient" arrow>
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          startIcon={<PlayArrow fontSize="small" />}
                          onClick={() => onLoadRecord && onLoadRecord(row)}
                          sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, px: 1.5, whiteSpace: 'nowrap', flexShrink: 0 }}
                        >
                          Reload
                        </Button>
                      </Tooltip>
                    </Stack>
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
