'use client';

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
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
import { useRouter } from 'next/navigation';
import {
  Search,
  History,
  PlayArrow,
  Psychology,
  OpenInNew,
  DeleteOutline,
  Refresh
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { HistoryRecord } from '../types/clinical';
import { useAppDispatch } from '../redux/hooks';
import { removeHistoryRecord, setHistoryList } from '../redux/slices/clinicalSlice';

interface HistoryTableProps {
  historyList?: HistoryRecord[];
  onLoadRecord?: (record: HistoryRecord) => void;
  onAskAi?: (record: HistoryRecord) => void;
  refreshTrigger?: number;
}

export default function HistoryTable({
  historyList,
  onLoadRecord,
  onAskAi,
  refreshTrigger
}: HistoryTableProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Search state with debounce
  const [searchInput, setSearchInput] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Pagination state (user selectable: 5, 10, 15, 20 items per page)
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [page, setPage] = useState<number>(0); // MUI 0-indexed page
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [records, setRecords] = useState<HistoryRecord[]>(historyList || []);
  const [loading, setLoading] = useState<boolean>(false);

  // Delete Confirmation Dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [recordToDelete, setRecordToDelete] = useState<HistoryRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // ─── DEBOUNCE EFFECT FOR SEARCH (350ms) ───────────────────────────────────
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(0); // Reset to first page on search query change
      setIsSearching(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // ─── FETCH PRESCRIPTION HISTORY FROM API WITH PAGINATION & SEARCH ────────
  const fetchHistory = async (
    targetPage: number = page,
    searchQuery: string = debouncedSearch,
    currentRowsPerPage: number = rowsPerPage
  ) => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('arpan_auth_token') : '';
      const apiPage = targetPage + 1; // 1-indexed for backend API
      const queryParams = new URLSearchParams({
        page: apiPage.toString(),
        limit: currentRowsPerPage.toString(),
      });

      if (searchQuery) {
        queryParams.set('search', searchQuery);
      }

      const res = await fetch(`/api/history?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 401 && typeof window !== 'undefined') {
          localStorage.removeItem('arpan_auth_token');
          localStorage.removeItem('arpan_auth_user');
          window.dispatchEvent(
            new CustomEvent('session-terminated-by-other-device', {
              detail: {
                loggedOutByOtherDevice: !!errorData.loggedOutByOtherDevice,
                message: errorData.message || 'Authentication required to view prescription history.',
              },
            })
          );
        }
        throw new Error(errorData.message || 'Failed to fetch history records');
      }

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRecords(json.data);
        setTotalRecords(json.pagination?.totalRecords ?? json.data.length);

        // Synchronize Redux store with latest loaded records
        if (!searchQuery && targetPage === 0) {
          dispatch(setHistoryList(json.data));
        }
      }
    } catch (err: any) {
      console.error('Error fetching prescription history:', err);
      // Fallback to local historyList if API fails
      if (historyList && historyList.length > 0) {
        setRecords(historyList);
        setTotalRecords(historyList.length);
      }
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when page, debounced search, rowsPerPage, or refreshTrigger changes
  useEffect(() => {
    fetchHistory(page, debouncedSearch, rowsPerPage);
  }, [page, debouncedSearch, rowsPerPage, refreshTrigger]);

  // ─── PAGINATION HANDLERS ──────────────────────────────────────────────────
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newRows = parseInt(event.target.value, 10);
    setRowsPerPage(newRows);
    setPage(0);
  };

  // ─── DELETE RECORD HANDLERS ──────────────────────────────────────────────
  const handleOpenDeleteConfirm = (record: HistoryRecord) => {
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
      const targetId = recordToDelete.id;
      const res = await fetch(`/api/history/${targetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 401 && typeof window !== 'undefined') {
          localStorage.removeItem('arpan_auth_token');
          localStorage.removeItem('arpan_auth_user');
          window.dispatchEvent(
            new CustomEvent('session-terminated-by-other-device', {
              detail: {
                loggedOutByOtherDevice: !!errorData.loggedOutByOtherDevice,
                message: errorData.message || 'Authentication required to delete prescription record.',
              },
            })
          );
        }
        throw new Error(errorData.message || 'Failed to delete record');
      }

      toast.success(`Prescription record ${targetId} for ${recordToDelete.patientName} deleted successfully.`);

      // Update Redux state
      dispatch(removeHistoryRecord(targetId));

      handleCloseDeleteConfirm();

      // If last item on current page was deleted, adjust page backwards if needed
      const remainingOnPage = records.length - 1;
      const nextTargetPage = remainingOnPage === 0 && page > 0 ? page - 1 : page;
      if (nextTargetPage !== page) {
        setPage(nextTargetPage);
      } else {
        fetchHistory(nextTargetPage, debouncedSearch, rowsPerPage);
      }
    } catch (err: any) {
      console.error('Error deleting prescription record:', err);
      toast.error(err.message || 'Failed to delete prescription history record.');
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
            bgcolor: 'rgba(0, 201, 167, 0.2)',
            '& .MuiLinearProgress-bar': { bgcolor: '#00C9A7' }
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
            <History sx={{ color: '#00C9A7', fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Recent Patient Prescription Analysis History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Paginated MongoDB archive ({rowsPerPage} records/page) &bull; Max 100 latest consultations retained automatically.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <TextField
              size="small"
              placeholder="Search patient, disease, Rx ID..."
              value={searchInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {isSearching ? (
                      <CircularProgress size={16} sx={{ color: '#00C9A7' }} />
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
                  '&:hover': { bgcolor: 'rgba(0, 201, 167, 0.1)', color: '#00C9A7' }
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
                <TableCell sx={{ fontWeight: 800 }}>Rx ID</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Patient Name</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Vitals</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Diagnosis / Condition</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Rx Count</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Safety Score</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap', width: '1%' }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.length > 0 ? (
                records.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: '#00C9A7', whiteSpace: 'nowrap' }}>
                      {row.id}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {row.patientName}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {row.age} Y / {row.gender}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>
                      <Typography variant="body2" noWrap title={row.disease}>
                        {row.disease}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {row.medCount} Drugs
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Chip
                        label={`${row.safetyScore}/100 - ${row.risk}`}
                        size="small"
                        sx={{ bgcolor: row.color, color: '#FFF', fontWeight: 800, fontSize: '0.7rem' }}
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
                        {/* Ask AI Copilot button */}
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

                        {/* Full-Page AI Workspace */}
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

                        {/* Reload Full Analysis */}
                        <Tooltip title="Reload full analysis dashboard for this patient" arrow>
                          <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                            startIcon={<PlayArrow fontSize="small" />}
                            onClick={() => onLoadRecord && onLoadRecord(row)}
                            sx={{
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              px: 1.5,
                              whiteSpace: 'nowrap',
                              flexShrink: 0
                            }}
                          >
                            Reload
                          </Button>
                        </Tooltip>

                        {/* Delete Record Button */}
                        <Tooltip title={`Delete ${row.id} from database archive`} arrow>
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
                              }
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
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {loading
                        ? 'Loading prescription analysis records...'
                        : debouncedSearch
                        ? `No prescription records found matching "${debouncedSearch}".`
                        : 'No prescription analysis records found in MongoDB.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ─── MUI PAGINATION (USER SELECTABLE: 5, 10, 15, 20 PER PAGE) ── */}
        <TablePagination
          component="div"
          count={totalRecords}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 15, 20]}
          labelRowsPerPage="Per page:"
          sx={{
            mt: 1,
            borderTop: isDarkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.06)',
            '.MuiTablePagination-toolbar': { px: { xs: 1, sm: 2 } },
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              fontWeight: 600,
              fontSize: '0.85rem'
            }
          }}
        />
      </CardContent>

      {/* ─── DELETE CONFIRMATION DIALOG ──────────────────────────────────── */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1,
            bgcolor: isDarkMode ? '#1E293B' : '#FFFFFF',
            color: isDarkMode ? '#F8FAFC' : '#1E293B',
            backgroundImage: 'none',
            border: isDarkMode
              ? '1px solid rgba(255, 77, 109, 0.3)'
              : '1px solid rgba(255, 77, 109, 0.25)',
            boxShadow: isDarkMode
              ? '0 20px 45px rgba(0, 0, 0, 0.5)'
              : '0 20px 45px rgba(15, 23, 42, 0.12)'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#FF4D6D', pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteOutline sx={{ color: '#FF4D6D', fontSize: 24 }} />
          Delete Prescription Analysis Record?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: isDarkMode ? 'text.secondary' : '#64748B', fontSize: '0.925rem' }}>
            Are you sure you want to permanently delete record{' '}
            <strong style={{ color: isDarkMode ? '#00C9A7' : '#009688' }}>{recordToDelete?.id}</strong> for patient{' '}
            <strong style={{ color: isDarkMode ? '#FFFFFF' : '#1E293B' }}>{recordToDelete?.patientName}</strong>?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
          <Button
            onClick={handleCloseDeleteConfirm}
            disabled={isDeleting}
            sx={{
              color: isDarkMode ? 'text.secondary' : '#64748B',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'
              }
            }}
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
              color: '#FFFFFF',
              '&:hover': { bgcolor: '#e03a5b' },
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(255, 77, 109, 0.35)'
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete Record'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
