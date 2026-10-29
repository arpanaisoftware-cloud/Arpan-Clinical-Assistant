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
import Restaurant from '@mui/icons-material/Restaurant';
import PlayArrow from '@mui/icons-material/PlayArrow';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import Refresh from '@mui/icons-material/Refresh';
import Print from '@mui/icons-material/Print';
import LocalFireDepartment from '@mui/icons-material/LocalFireDepartment';
import Person from '@mui/icons-material/Person';
import { toast } from 'react-toastify';
import { DietHistoryRecord } from '../types/clinical';

interface DietHistoryTableProps {
  onLoadRecord?: (record: DietHistoryRecord) => void;
  onPrintRecord?: (record: DietHistoryRecord) => void;
  refreshTrigger?: number;
}

export default function DietHistoryTable({
  onLoadRecord,
  onPrintRecord,
  refreshTrigger,
}: DietHistoryTableProps) {
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
  const [records, setRecords] = useState<DietHistoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Delete Confirmation Dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [recordToDelete, setRecordToDelete] = useState<DietHistoryRecord | null>(null);
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

  // ─── FETCH DIET HISTORY FROM API ──────────────────────────────────────────
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

      const res = await fetch(`/api/diet/history?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch diet history records');
      }

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRecords(json.data);
        setTotalRecords(json.pagination?.totalRecords ?? json.data.length);
      }
    } catch (err: any) {
      console.error('Error fetching diet history:', err);
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

  const handleOpenDeleteConfirm = (record: DietHistoryRecord) => {
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
      const targetId = recordToDelete.dietId || recordToDelete.id;
      const res = await fetch(`/api/diet/history/${targetId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete record');
      }

      toast.success(`Diet plan record ${targetId} for ${recordToDelete.patientName} deleted successfully.`);
      handleCloseDeleteConfirm();

      const remainingOnPage = records.length - 1;
      const nextTargetPage = remainingOnPage === 0 && page > 0 ? page - 1 : page;
      if (nextTargetPage !== page) {
        setPage(nextTargetPage);
      } else {
        fetchHistory(nextTargetPage, debouncedSearch, rowsPerPage);
      }
    } catch (err: any) {
      console.error('Error deleting diet plan record:', err);
      toast.error(err.message || 'Failed to delete diet plan record.');
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
            '& .MuiLinearProgress-bar': { bgcolor: '#00C9A7' },
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
            <Restaurant sx={{ color: '#00C9A7', fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Recent Patient Diet & Nutrition Plan History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {rowsPerPage} records/page &bull; Max 2000 latest nutrition plans retained automatically.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <TextField
              size="small"
              placeholder="Search patient, diagnosis, Diet ID..."
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
                  '&:hover': { bgcolor: 'rgba(0, 201, 167, 0.1)', color: '#00C9A7' },
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
                <TableCell sx={{ fontWeight: 800 }}>Diet ID</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Patient Name</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Demographics</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Diagnosis / Condition</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Preference & Energy</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Plan Title</TableCell>
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
                  <TableRow key={row.dietId || row.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: '#00C9A7', whiteSpace: 'nowrap' }}>
                      {row.dietId || row.id}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {row.patientName}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {row.age} Y / {row.gender}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography variant="body2" noWrap title={row.disease}>
                        {row.disease}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Stack direction="row" spacing={0.8} alignItems="center">
                        <Chip
                          label={row.dietaryPreference || 'Vegetarian'}
                          size="small"
                          sx={{
                            bgcolor: isDarkMode ? 'rgba(0, 201, 167, 0.15)' : 'rgba(0, 201, 167, 0.1)',
                            color: '#00C9A7',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            border: '1px solid rgba(0, 201, 167, 0.3)'
                          }}
                        />
                        <Chip
                          icon={<LocalFireDepartment sx={{ fontSize: '0.85rem !important' }} />}
                          label={`${row.targetCalories || 1750} kcal`}
                          size="small"
                          sx={{
                            bgcolor: isDarkMode ? 'rgba(255, 150, 113, 0.15)' : 'rgba(255, 150, 113, 0.1)',
                            color: '#FF9671',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            border: '1px solid rgba(255, 150, 113, 0.3)'
                          }}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>
                      <Typography variant="body2" noWrap title={row.planName}>
                        {row.planName || 'Indian Clinical Diet Plan'}
                      </Typography>
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
                          borderColor: isDarkMode ? 'rgba(0, 201, 167, 0.35)' : 'rgba(0, 201, 167, 0.4)',
                          bgcolor: isDarkMode ? 'rgba(0, 201, 167, 0.08)' : 'rgba(0, 201, 167, 0.05)',
                          color: isDarkMode ? '#00E5BD' : '#009F85',
                          '& .MuiChip-icon': {
                            color: isDarkMode ? '#00E5BD' : '#009F85'
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
                        {/* Load Full Plan Button */}
                        <Tooltip title="Load this diet plan onto active dashboard" arrow>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<PlayArrow fontSize="small" />}
                            onClick={() => onLoadRecord && onLoadRecord(row)}
                            sx={{
                              color: '#00C9A7',
                              borderColor: '#00C9A7',
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              px: 1.5,
                              whiteSpace: 'nowrap',
                              '&:hover': {
                                bgcolor: 'rgba(0, 201, 167, 0.08)',
                                borderColor: '#00a387',
                              },
                            }}
                          >
                            Load Plan
                          </Button>
                        </Tooltip>

                        {/* Print Preview Button */}
                        {onPrintRecord && (
                          <Tooltip title="Open Print Preview for this diet plan" arrow>
                            <IconButton
                              size="small"
                              onClick={() => onPrintRecord(row)}
                              sx={{
                                color: '#6C5CE7',
                                border: '1px solid rgba(108, 92, 231, 0.3)',
                                borderRadius: 1,
                                p: 0.6,
                                flexShrink: 0,
                                '&:hover': {
                                  bgcolor: 'rgba(108, 92, 231, 0.1)',
                                  borderColor: '#6C5CE7',
                                },
                              }}
                            >
                              <Print fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* Delete Record Button */}
                        <Tooltip title="Delete diet plan record permanently" arrow>
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
                        ? 'Loading diet plan records...'
                        : debouncedSearch
                        ? `No diet plan records found matching "${debouncedSearch}".`
                        : 'No diet plan records found in MongoDB.'}
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
          Delete Diet Plan Record?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.primary', mb: 1.5 }}>
            Are you sure you want to permanently delete nutrition plan{' '}
            <strong>{recordToDelete?.dietId || recordToDelete?.id}</strong> for patient{' '}
            <strong>{recordToDelete?.patientName}</strong>?
          </DialogContentText>
          <Typography variant="caption" color="text.secondary">
            This action cannot be undone. The diet record will be permanently purged from MongoDB.
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
