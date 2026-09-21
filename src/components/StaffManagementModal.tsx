'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  IconButton,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Close,
  PersonAdd,
  Badge,
  SupervisorAccount,
  CheckCircle,
  LocalHospital,
  Lock,
  ContentCopy,
  Verified
} from '@mui/icons-material';
import { StaffUser, UserRole, ModulePermission } from '../types/clinical';
import { toast } from 'react-toastify';

interface StaffManagementModalProps {
  open: boolean;
  onClose: () => void;
  staffList: StaffUser[];
  onAddStaff: (newStaff: StaffUser) => void;
  onToggleStatus: (staffId: string) => void;
}

export default function StaffManagementModal({
  open,
  onClose,
  staffList,
  onAddStaff,
  onToggleStatus
}: StaffManagementModalProps) {
  const [name, setName] = useState('');
  const [staffIdInput, setStaffIdInput] = useState('');
  const [customPasscode, setCustomPasscode] = useState('');
  const [department, setDepartment] = useState('Diabetic & Chronic Care');
  const [role, setRole] = useState<UserRole>('Staff');
  const [permission, setPermission] = useState<ModulePermission>('Counselling + Diets');

  // Recently created user credential slip state
  const [issuedUser, setIssuedUser] = useState<StaffUser | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter staff member full name');
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedId = staffIdInput.trim() || `STAFF-${randomSuffix}`;
    const generatedPass = customPasscode.trim() || `staff${randomSuffix}`;
    const assignedPermissions = role === 'Doctor' ? 'Full Access' : permission;

    const newMember: StaffUser = {
      id: `ST-${Date.now()}`,
      name: name.trim(),
      staffId: generatedId,
      department: department.trim() || 'General Clinical Care',
      role,
      modulePermissions: assignedPermissions,
      active: true,
      createdAt: new Date().toISOString().split('T')[0],
      passcode: generatedPass
    };

    onAddStaff(newMember);
    setIssuedUser(newMember);
    toast.success(`Staff Account Issued! Login ID: ${generatedId} | Perms: ${assignedPermissions}`);

    // Reset form
    setName('');
    setStaffIdInput('');
    setCustomPasscode('');
    setDepartment('Diabetic & Chronic Care');
    setRole('Staff');
    setPermission('Counselling + Diets');
  };

  const handleCopyCredentials = (user: StaffUser) => {
    const text = `Arpan Clinical Assistant Login Credentials:\nName: ${user.name}\nRole: ${user.role}\nDepartment: ${user.department}\nPermissions: ${user.modulePermissions}\nLogin ID: ${user.staffId}\nPassword: ${user.passcode || 'staff123'}`;
    navigator.clipboard.writeText(text);
    toast.info('Credentials copied to clipboard!');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 1 } }}>
      <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(108, 92, 231, 0.08)' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <SupervisorAccount sx={{ color: '#6C5CE7', fontSize: 30 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Staff & User Management Center
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Doctor Access Panel: Issue Login IDs, Passwords & Granular Module Permissions.
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3.5 }}>
        {/* Issued Credential Slip Alert Banner if user just created */}
        {issuedUser && (
          <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: 'rgba(0, 201, 167, 0.08)', borderColor: '#00C9A7' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Verified sx={{ color: '#00C9A7', fontSize: 26 }} />
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#00C9A7' }}>
                  New Credentials Issued for {issuedUser.name}
                </Typography>
              </Stack>
              <IconButton size="small" onClick={() => setIssuedUser(null)}>
                <Close fontSize="small" />
              </IconButton>
            </Stack>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" display="block">Assigned Login ID</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#00C9A7' }}>
                  {issuedUser.staffId}
                </Typography>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" display="block">Assigned Password</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#FFB703' }}>
                  {issuedUser.passcode}
                </Typography>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" display="block">Module Permissions</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#6C5CE7' }}>
                  {issuedUser.modulePermissions}
                </Typography>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" display="block">Department</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {issuedUser.department}
                </Typography>
              </Grid>
            </Grid>

            <Stack direction="row" spacing={1.5}>
              <Button
                size="small"
                variant="contained"
                color="primary"
                startIcon={<ContentCopy />}
                onClick={() => handleCopyCredentials(issuedUser)}
              >
                Copy Credentials to Handover
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                onClick={() => setIssuedUser(null)}
              >
                Dismiss Slip
              </Button>
            </Stack>
          </Paper>
        )}

        {/* Create Staff Form Card */}
        <Paper variant="outlined" sx={{ p: 2.5, mb: 4, borderRadius: 3, bgcolor: 'rgba(0, 201, 167, 0.03)', borderColor: 'rgba(0, 201, 167, 0.3)' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#00C9A7', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <PersonAdd fontSize="small" /> Issue Login Credentials & Module Access
          </Typography>

          <form onSubmit={handleCreate}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Full Name"
                  placeholder="e.g. Nurse Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Login Staff ID (Optional)"
                  placeholder="Auto-generated if blank (e.g. STAFF-8921)"
                  value={staffIdInput}
                  onChange={(e) => setStaffIdInput(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="password"
                  label="Initial Password / Passcode (Optional)"
                  placeholder="Auto-generated if blank (e.g. staff123)"
                  value={customPasscode}
                  onChange={(e) => setCustomPasscode(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Clinical Department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <MenuItem value="Diabetic & Chronic Care">Diabetic & Chronic Care</MenuItem>
                  <MenuItem value="Cardiology & ASCVD Risk">Cardiology & ASCVD Risk</MenuItem>
                  <MenuItem value="Clinical Nutrition & Metabolic Health">Clinical Nutrition & Metabolic Health</MenuItem>
                  <MenuItem value="General Outpatient Department">General Outpatient Department</MenuItem>
                  <MenuItem value="Nephrology & Renal Care">Nephrology & Renal Care</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Assigned System Role"
                  value={role}
                  onChange={(e) => {
                    const r = e.target.value as UserRole;
                    setRole(r);
                    if (r === 'Doctor') setPermission('Full Access');
                    else setPermission('Counselling + Diets');
                  }}
                >
                  <MenuItem value="Staff">Staff (Granular Access)</MenuItem>
                  <MenuItem value="Doctor">Doctor (Full Access)</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Module Permissions"
                  value={role === 'Doctor' ? 'Full Access' : permission}
                  disabled={role === 'Doctor'}
                  onChange={(e) => setPermission(e.target.value as ModulePermission)}
                >
                  <MenuItem value="Counselling Only">1. Counselling Only</MenuItem>
                  <MenuItem value="Diets Only">2. Diets Only</MenuItem>
                  <MenuItem value="Counselling + Diets">3. Counselling + Diets</MenuItem>
                  <MenuItem value="Full Access">4. Full Access (Prescription + All)</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} textAlign="right" sx={{ mt: 1 }}>
                <Button variant="contained" color="primary" type="submit" startIcon={<PersonAdd />} sx={{ borderRadius: 2, height: 42, px: 3, fontWeight: 800 }}>
                  Issue Credentials & Access
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Existing Roster Directory */}
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge color="primary" /> Issued Accounts & Permissions Directory ({staffList.length})
        </Typography>

        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Login ID</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Password</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Module Permissions</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="center">Action / Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staffList.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell sx={{ fontWeight: 900, color: '#00C9A7' }}>{user.staffId}</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#FFB703', fontFamily: 'monospace' }}>
                    {user.passcode || 'staff123'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{user.name}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{user.department}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      size="small"
                      color={user.role === 'Doctor' ? 'primary' : 'secondary'}
                      sx={{ fontWeight: 800, height: 22 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.modulePermissions || (user.role === 'Doctor' ? 'Full Access' : 'Counselling + Diets')}
                      size="small"
                      variant="outlined"
                      color={user.modulePermissions === 'Full Access' ? 'primary' : 'secondary'}
                      sx={{ fontWeight: 800, fontSize: '0.72rem' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                      <IconButton
                        size="small"
                        color="primary"
                        title="Copy Credentials"
                        onClick={() => handleCopyCredentials(user)}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={user.active}
                            onChange={() => onToggleStatus(user.id)}
                            color="success"
                          />
                        }
                        label={user.active ? 'Active' : 'Disabled'}
                        sx={{ margin: 0, '& .MuiTypography-root': { fontSize: '0.75rem', fontWeight: 600 } }}
                      />
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} variant="contained" color="inherit">
          Close Directory
        </Button>
      </DialogActions>
    </Dialog>
  );
}
