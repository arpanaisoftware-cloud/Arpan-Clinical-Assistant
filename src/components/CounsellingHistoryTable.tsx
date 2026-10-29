'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import TablePagination from '@mui/material/TablePagination';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import Search from '@mui/icons-material/Search';
import MedicalServices from '@mui/icons-material/MedicalServices';
import PlayArrow from '@mui/icons-material/PlayArrow';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import Refresh from '@mui/icons-material/Refresh';
import Print from '@mui/icons-material/Print';
import Person from '@mui/icons-material/Person';
import { toast } from 'react-toastify';
import { CounsellingHistoryRecord } from '../types/clinical';

interface CounsellingHistoryTableProps {
  onLoadRecord?: (record: CounsellingHistoryRecord) => void;
  onPrintRecord?: (record: CounsellingHistoryRecord) => void;
  refreshTrigger?: number;
}

export default function CounsellingHistoryTable({
  onLoadRecord,
  onPrintRecord,
  refreshTrigger,
}: CounsellingHistoryTableProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Search state with debounce
  const [searchInput, setSearchInput] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Pagination state
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [page, setPage] = useState<number>(0);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [records, setRecords] = useState<CounsellingHistoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Delete Confirmation Dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [recordToDelete, setRecordToDelete] = useState<CounsellingHistoryRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // ─── DEBOUNCE EFFECT FOR SEARCH (350ms) ───────────────────────────────────
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(0);
      setIsSearching(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // ─── FETCH COUNSELLING HISTORY FROM API ────────────────────────────────────
  const fetchHistory = async (
    targetPage: number = page,
    searchQuery: string = debouncedSearch,
    currentRowsPerPage: number = rowsPerPage
  ) => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('arpan_auth_token') : '';
      const apiPage = targetPage + 1;
      const queryParams = new URLSearchParams({
        page: apiPage.toString(),
        limit: currentRowsPerPage.toString(),
      });

      if (searchQuery) {
        queryParams.set('search', searchQuery);
      }

      const res = await fetch(`/api/counselling/history?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch counselling records');
      }

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRecords(json.data);
        setTotalRecords(json.pagination?.totalRecords ?? json.data.length);
      }
    } catch (err: any) {
      console.error('Error fetching counselling history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(page, debouncedSearch, rowsPerPage);
  }, [page, debouncedSearch, rowsPerPage, refreshTrigger]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newRows = parseInt(event.target.value, 10);
    setRowsPerPage(newRows);
    setPage(0);
  };

  const handleOpenDeleteConfirm = (record: CounsellingHistoryRecord) => {
    setRecordToDelete(record);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setRecordToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;

    setIsDeleting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('arpan_auth_token') : '';
      const targetId = recordToDelete.counsellingId || recordToDelete.id;
      const res = await fetch(`/api/counselling/history/${targetId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete record');
      }

      toast.success(`Counselling record ${targetId} for ${recordToDelete.patientName} deleted successfully.`);
      handleCloseDeleteConfirm();

      const remainingOnPage = records.length - 1;
      const nextTargetPage = remainingOnPage === 0 && page > 0 ? page - 1 : page;
      if (nextTargetPage !== page) {
        setPage(nextTargetPage);
      } else {
        fetchHistory(nextTargetPage, debouncedSearch, rowsPerPage);
      }
    } catch (err: any) {
      console.error('Error deleting counselling record:', err);
      toast.error(err.message || 'Failed to delete counselling record.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card sx={{ borderRadius: 1, mt: 4, position: 'relative' }}>
      {loading && (
        <LinearProgress
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 2,
            bgcolor: 'rgba(108, 92, 231, 0.2)',
            '& .MuiLinearProgress-bar': { bgcolor: '#6C5CE7' },
          }}
        />
      )}

      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          mb={3}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <MedicalServices sx={{ color: '#6C5CE7', fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Recent Patient Chronic Risk Counselling History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {rowsPerPage} records/page &bull; Max 2000 latest sessions retained automatically.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <TextField
              size="small"
              placeholder="Search patient, disease, CNS ID..."
              value={searchInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {isSearching ? (
                      <CircularProgress size={16} sx={{ color: '#6C5CE7' }} />
                    ) : (
                      <Search fontSize="small" />
                    )}
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: { xs: '100%', sm: 280 } }}
            />

            <Tooltip title="Refresh History" arrow>
              <IconButton
                size="small"
                onClick={() => fetchHistory(page, debouncedSearch)}
                sx={{
                  border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)',
                  borderRadius: 1,
                  p: 0.8,
                  '&:hover': { bgcolor: 'rgba(108, 92, 231, 0.1)', color: '#6C5CE7' },
                }}
              >
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 1, borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)' }}
        >
          <Table>
            <TableHead sx={{ bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>CNS ID</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Patient Name</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Demographics</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Clinical Vitals & Labs</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Diagnosis / Condition</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Risk Assessment</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Analysed By</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap', width: '1%' }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.length > 0 ? (
                records.map((row) => (
                  <TableRow key={row.counsellingId || row.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: '#6C5CE7', whiteSpace: 'nowrap' }}>
                      {row.counsellingId || row.id}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {row.patientName}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {row.age} Y / {row.gender}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                      <Stack spacing={0.3}>
                        {row.sbp && row.dbp && <span>BP: <strong>{row.sbp}/{row.dbp}</strong></span>}
                        {row.hba1c && <span>HbA1c: <strong>{row.hba1c}%</strong></span>}
                        {row.egfr && <span>eGFR: <strong>{row.egfr}</strong></span>}
                        {!row.sbp && !row.hba1c && !row.egfr && <span style={{ color: '#888' }}>Standard labs</span>}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>
                      <Typography variant="body2" noWrap title={row.disease}>
                        {row.disease}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Chip
                        label={`${row.overallRiskLevel || 'ASSESSED'}${row.riskCount ? ` • ${row.riskCount} Factors` : ''}`}
                        size="small"
                        sx={{ bgcolor: row.color || '#00C9A7', color: '#FFF', fontWeight: 800, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Chip
                        icon={<Person sx={{ fontSize: '0.9rem !important' }} />}
                        label={row.analysedBy || 'Dr. Yashwant Dubey'}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          borderColor: isDarkMode ? 'rgba(108, 92, 231, 0.35)' : 'rgba(108, 92, 231, 0.4)',
                          bgcolor: isDarkMode ? 'rgba(108, 92, 231, 0.08)' : 'rgba(108, 92, 231, 0.05)',
                          color: isDarkMode ? '#A29BFE' : '#6C5CE7',
                          '& .MuiChip-icon': {
                            color: isDarkMode ? '#A29BFE' : '#6C5CE7'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                      {row.date}
                    </TableCell>
                    <TableCell align="center" sx={{ whiteSpace: 'nowrap', width: '1%' }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                        alignItems="center"
                        sx={{ flexWrap: 'nowrap', whiteSpace: 'nowrap' }}
                      >
                        {/* Load Full Report Button */}
                        <Tooltip title="Load this counselling report onto active dashboard" arrow>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<PlayArrow fontSize="small" />}
                            onClick={() => onLoadRecord && onLoadRecord(row)}
                            sx={{
                              color: '#6C5CE7',
                              borderColor: '#6C5CE7',
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              px: 1.5,
                              whiteSpace: 'nowrap',
                              '&:hover': {
                                bgcolor: 'rgba(108, 92, 231, 0.08)',
                                borderColor: '#5a4bd1',
                              },
                            }}
                          >
                            Load Report
                          </Button>
                        </Tooltip>

                        {/* Print Preview Button */}
                        {onPrintRecord && (
                          <Tooltip title="Open Print Preview for this counselling report" arrow>
                            <IconButton
                              size="small"
                              onClick={() => onPrintRecord(row)}
                              sx={{
                                color: '#00C9A7',
                                border: '1px solid rgba(0, 201, 167, 0.3)',
                                borderRadius: 1,
                                p: 0.6,
                                flexShrink: 0,
                                '&:hover': {
                                  bgcolor: 'rgba(0, 201, 167, 0.1)',
                                  borderColor: '#00C9A7',
                                },
                              }}
                            >
                              <Print fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* Delete Record Button */}
                        <Tooltip title="Delete counselling record permanently" arrow>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteConfirm(row)}
                            sx={{
                              border: '1px solid rgba(255, 77, 109, 0.3)',
                              borderRadius: 1,
                              p: 0.6,
                              color: '#FF4D6D',
                              flexShrink: 0,
                              '&:hover': {
                                bgcolor: 'rgba(255, 77, 109, 0.1)',
                                borderColor: '#FF4D6D',
                              },
                            }}
                          >
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {loading
                        ? 'Loading counselling records...'
                        : debouncedSearch
                        ? `No counselling records found matching "${debouncedSearch}".`
                        : 'No counselling records found in MongoDB.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ─── MUI PAGINATION ─────────────────────────────────────────────── */}
        <TablePagination
          component="div"
          count={totalRecords}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 20, 50]}
          labelRowsPerPage="Per page:"
          sx={{
            mt: 1,
            borderTop: isDarkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.06)',
            '.MuiTablePagination-toolbar': { px: { xs: 1, sm: 2 } },
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              fontWeight: 600,
              fontSize: '0.85rem',
            },
          }}
        />
      </CardContent>

      {/* ─── DELETE CONFIRMATION DIALOG ──────────────────────────────────── */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        PaperProps={{
          sx: {
            borderRadius: 1.5,
            p: 1,
            bgcolor: isDarkMode ? '#1e1e2d' : '#FFFFFF',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#FF4D6D' }}>
          Delete Counselling Record?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.primary', mb: 1.5 }}>
            Are you sure you want to permanently delete chronic counselling consultation{' '}
            <strong>{recordToDelete?.counsellingId || recordToDelete?.id}</strong> for patient{' '}
            <strong>{recordToDelete?.patientName}</strong>?
          </DialogContentText>
          <Typography variant="caption" color="text.secondary">
            This action cannot be undone. The consultation will be permanently purged from MongoDB.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseDeleteConfirm}
            disabled={isDeleting}
            sx={{ fontWeight: 700, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteOutline />}
            sx={{
              bgcolor: '#FF4D6D',
              fontWeight: 800,
              textTransform: 'none',
              '&:hover': { bgcolor: '#e03756' },
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
