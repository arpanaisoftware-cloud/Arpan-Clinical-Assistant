'use client';

import React, { useState } from 'react';
import * as Yup from 'yup';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  Chip,
  Stack,
  Paper,
  Divider,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  useTheme,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  PersonAdd,
  Badge,
  ContentCopy,
  Verified,
  Close,
  Shield,
  Key,
  Visibility,
  VisibilityOff,
  Edit,
  Delete
} from '@mui/icons-material';
import { StaffUser, UserRole, ModulePermission } from '../types/clinical';
import { toast } from 'react-toastify';

// ─── Yup Validation Schema ────────────────────────────────────────────────────
const staffSchema = Yup.object({
  name: Yup.string().trim().required('Full name is required'),
  email: Yup.string()
    .trim()
    .email('Enter a valid email address')
    .required('Registered clinical email is required'),
  department: Yup.string().required('Clinical department is required'),
  role: Yup.string().required('System role is required'),
  permission: Yup.string().when('role', {
    is: (val: string) => val !== 'Doctor',
    then: (schema) => schema.required('Module permissions are required'),
    otherwise: (schema) => schema.optional(),
  }),
});

type FormErrors = { name?: string; email?: string; department?: string; role?: string; permission?: string };

interface StaffManagementModuleProps {
  staffList: StaffUser[];
  onAddStaff: (newStaff: StaffUser) => Promise<any> | void;
  onUpdateStaff?: (staffId: string, updatedData: Partial<StaffUser>) => Promise<any> | void;
  onDeleteStaff?: (staffId: string) => Promise<any> | void;
  onToggleStatus: (staffId: string) => Promise<any> | void;
}

export default function StaffManagementModule({
  staffList,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  onToggleStatus
}: StaffManagementModuleProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [staffIdInput, setStaffIdInput] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [permission, setPermission] = useState<ModulePermission | ''>('');
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Recently created user credential slip state
  const [issuedUser, setIssuedUser] = useState<StaffUser | null>(null);

  const totalUsers = staffList.length;
  const doctorCount = staffList.filter(u => u.role === 'Doctor').length;
  const isMaxUsersReached = !editingUserId && totalUsers >= 5;
  const isDoctorRoleDisabled = !editingUserId && doctorCount >= 1 && role !== 'Doctor';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formValues = { name, email, department, role, permission };

    try {
      await staffSchema.validate(formValues, { abortEarly: false });
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const fieldErrors: FormErrors = {};
        err.inner.forEach((ve) => {
          if (ve.path) fieldErrors[ve.path as keyof FormErrors] = ve.message;
        });
        setErrors(fieldErrors);
        toast.error('Please fix the highlighted fields before submitting.', {
          toastId: 'staff-form-validation-error',
        });
        return;
      }
    }

    const assignedRole: UserRole = role as UserRole;
    const assignedPermissions: ModulePermission =
      assignedRole === 'Doctor' ? 'Full Access' : (permission as ModulePermission);
    const assignedDept = department.trim();

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedId = staffIdInput.trim() || `STAFF-${randomSuffix}`;
    const generatedPass = customPassword.trim() || `staff${randomSuffix}`;
    const generatedEmail = email.trim();

    if (editingUserId && onUpdateStaff) {
      try {
        await onUpdateStaff(editingUserId, {
          name: name.trim(),
          email: generatedEmail,
          department: assignedDept,
          role: assignedRole,
          modulePermissions: assignedPermissions,
          ...(staffIdInput.trim() ? { staffId: staffIdInput.trim() } : {}),
          ...(customPassword.trim() ? { password: customPassword.trim() } : {})
        });
        toast.success('Staff Account Updated Successfully!', { toastId: 'staff-updated' });
        setEditingUserId(null);
        // Reset form
        setName('');
        setEmail('');
        setStaffIdInput('');
        setCustomPassword('');
        setDepartment('');
        setRole('');
        setPermission('');
        setErrors({});
      } catch (err: any) {
        toast.error(err.message || 'Failed to update staff account. Please try again.');
      }
      return;
    } else {
      const newMember: StaffUser = {
        id: `ST-${Date.now()}`,
        name: name.trim(),
        staffId: generatedId,
        email: generatedEmail,
        department: assignedDept,
        role: assignedRole,
        modulePermissions: assignedPermissions,
        active: true,
        createdAt: new Date().toISOString().split('T')[0],
        password: generatedPass
      };

      try {
        await onAddStaff(newMember);
        setIssuedUser(newMember);
        toast.success(
          `Staff Account Issued! Login ID: ${generatedId} | Password: ${generatedPass}`,
          { toastId: `staff-created-${newMember.id}` }
        );
        // Reset form
        setName('');
        setEmail('');
        setStaffIdInput('');
        setCustomPassword('');
        setDepartment('');
        setRole('');
        setPermission('');
        setErrors({});
      } catch (err: any) {
        toast.error(err.message || 'Failed to issue staff account. Please try again.');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setName('');
    setEmail('');
    setStaffIdInput('');
    setCustomPassword('');
    setDepartment('');
    setRole('');
    setPermission('');
    setErrors({});
  };

  const handleEditClick = (user: StaffUser) => {
    setEditingUserId(user.id);
    setName(user.name);
    setEmail(user.email || '');
    setStaffIdInput(user.staffId);
    setDepartment(user.department);
    setRole(user.role);
    setPermission(user.modulePermissions || (user.role === 'Doctor' ? 'Full Access' : 'Counselling + Diets'));
    setCustomPassword(user.password || (user.role === 'Doctor' ? 'doctor123' : 'staff123'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete && onDeleteStaff) {
      onDeleteStaff(userToDelete);
    }
    setDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  const handleCopyCredentials = (user: StaffUser) => {
    const effectivePass = user.password || (user.role === 'Doctor' ? 'doctor123' : 'staff123');
    const text = `Arpan Clinical Assistant Login Credentials:\nName: ${user.name}\nEmail: ${user.email || 'N/A'}\nRole: ${user.role}\nDepartment: ${user.department}\nPermissions: ${user.modulePermissions}\nLogin ID: ${user.staffId}\nPassword: ${effectivePass}`;
    navigator.clipboard.writeText(text);
    toast.info('Credentials copied to clipboard!', { toastId: 'copy-credentials' });
  };

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card
      sx={{
        borderRadius: 1,
        boxShadow: isDark ? '0 12px 40px rgba(0, 0, 0, 0.25)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
        background: isDark
          ? 'linear-gradient(180deg, rgba(16, 24, 44, 0.95) 0%, rgba(10, 15, 29, 0.98) 100%)'
          : 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
        color: 'text.primary',
        border: isDark ? '1px solid rgba(108, 92, 231, 0.3)' : '1px solid #E2E8F0'
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
        {/* Module Header Banner */}
        <Grid container spacing={3} alignItems="center" mb={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.125rem' } }}>
              Clinic Roster &amp; Staff Credential Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage clinical team access, issue secure credentials with registered email, and control granular module permissions.
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* Issued Credential Slip Alert Banner if user just created */}
        {issuedUser && (
          <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 1, bgcolor: 'rgba(0, 201, 167, 0.08)', borderColor: '#00C9A7' }}>
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
                  {issuedUser.password}
                </Typography>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" display="block">Registered Email</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#38BDF8' }}>
                  {issuedUser.email}
                </Typography>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" display="block">Module Permissions</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#6C5CE7' }}>
                  {issuedUser.modulePermissions}
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

        {/* Issue / Edit Credentials Form */}
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 1,
            bgcolor: editingUserId ? 'rgba(56, 189, 248, 0.05)' : 'rgba(0, 201, 167, 0.03)',
            borderColor: editingUserId ? 'rgba(56, 189, 248, 0.4)' : 'rgba(0, 201, 167, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: editingUserId ? '#38BDF8' : '#00C9A7', display: 'flex', alignItems: 'center', gap: 1 }}>
              {editingUserId ? <Edit fontSize="small" /> : <PersonAdd fontSize="small" />}
              {editingUserId ? `Edit Staff Account Credentials & Profile (${name || 'Selected Staff'})` : 'Issue Login Credentials & Access Level'}
            </Typography>
            {editingUserId && (
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                onClick={handleCancelEdit}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Cancel Edit
              </Button>
            )}
          </Stack>

          {isMaxUsersReached && (
            <Box sx={{ p: 2, mb: 3, borderRadius: 1, bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <Typography variant="body2" sx={{ color: '#EF4444', fontWeight: 800 }}>
                Note: Maximum limit of 5 users reached. You cannot add any more staff members or doctors.
              </Typography>
            </Box>
          )}

          <form onSubmit={handleCreate}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Full Name *"
                  placeholder="e.g. Nurse Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="email"
                  label="Registered Clinical Email *"
                  placeholder="e.g. alex.rivera@arpanclinical.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Login Staff ID (Optional)"
                  placeholder="Auto-generated if blank (e.g. STAFF-8921)"
                  value={staffIdInput}
                  onChange={(e) => setStaffIdInput(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  type={showPassword ? "text" : "password"}
                  label="Initial Password (Optional)"
                  placeholder="Auto-generated if blank (e.g. staff123)"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Clinical Department *"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  SelectProps={{ displayEmpty: true }}
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.department}
                  helperText={errors.department}
                >
                  <MenuItem value="">
                    <em>Select Clinical Department</em>
                  </MenuItem>
                  <MenuItem value="Diabetic & Chronic Care">Diabetic & Chronic Care</MenuItem>
                  <MenuItem value="Cardiology & ASCVD Risk">Cardiology & ASCVD Risk</MenuItem>
                  <MenuItem value="Clinical Nutrition & Metabolic Health">Clinical Nutrition & Metabolic Health</MenuItem>
                  <MenuItem value="General Outpatient Department">General Outpatient Department</MenuItem>
                  <MenuItem value="Nephrology & Renal Care">Nephrology & Renal Care</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Assigned System Role *"
                  value={role}
                  onChange={(e) => {
                    const r = e.target.value as UserRole;
                    setRole(r);
                    if (r === 'Doctor') setPermission('Full Access');
                    else if (r === 'Staff' && !permission) setPermission('Counselling + Diets');
                  }}
                  SelectProps={{ displayEmpty: true }}
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.role}
                  helperText={errors.role}
                >
                  <MenuItem value="">
                    <em>Select System Role</em>
                  </MenuItem>
                  <MenuItem value="Staff">Staff (Granular Access)</MenuItem>
                  <MenuItem value="Doctor" disabled={isDoctorRoleDisabled}>Doctor (Full Access) {isDoctorRoleDisabled ? '- Limit Reached' : ''}</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label={role === 'Doctor' ? 'Module Permissions' : 'Module Permissions *'}
                  value={role === 'Doctor' ? 'Full Access' : permission}
                  disabled={role === 'Doctor'}
                  onChange={(e) => setPermission(e.target.value as ModulePermission)}
                  SelectProps={{ displayEmpty: true }}
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.permission}
                  helperText={errors.permission}
                >
                  <MenuItem value="">
                    <em>Select Module Permissions</em>
                  </MenuItem>
                  <MenuItem value="Counselling Only">1. Counselling Only</MenuItem>
                  <MenuItem value="Diets Only">2. Diets Only</MenuItem>
                  <MenuItem value="Counselling + Diets">3. Counselling + Diets</MenuItem>
                  <MenuItem value="Full Access">4. Full Access (Prescription + All)</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Tooltip title={isMaxUsersReached ? "User limit reached" : editingUserId ? "Update existing staff member profile" : "Create staff user profile and issue Login ID with Password and Email"} arrow placement="top">
                    <span>
                      <Button
                        variant="contained"
                        color={editingUserId ? "info" : "primary"}
                        type="submit"
                        disabled={isMaxUsersReached}
                        startIcon={editingUserId ? <Edit /> : <PersonAdd />}
                        sx={{ borderRadius: 1, height: 42, px: 3, fontWeight: 800, width: { xs: '100%', sm: 'auto' } }}
                      >
                        {editingUserId ? "Update Credentials & Profile" : "Issue Credentials & Access Account"}
                      </Button>
                    </span>
                  </Tooltip>

                  {editingUserId && (
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={handleCancelEdit}
                      sx={{ borderRadius: 1, height: 42, px: 3, fontWeight: 700 }}
                    >
                      Cancel Edit
                    </Button>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Existing Roster Directory */}
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge color="primary" /> Clinic Roster & Account Directory ({staffList.length} Users)
        </Typography>

        {/* DESKTOP TABLE VIEW (md and up) */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
            <Table>
              <TableHead sx={{ bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Login ID</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Password</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Registered Email</TableCell>
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
                      {user.password || (user.role === 'Doctor' ? 'doctor123' : 'staff123')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{user.name}</TableCell>
                    <TableCell sx={{ fontSize: '0.82rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                      {user.email || `${user.name.toLowerCase().replace(/[^a-z]/g, '')}@arpanclinical.org`}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.88rem' }}>{user.department}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        color={user.role === 'Doctor' ? 'primary' : 'secondary'}
                        sx={{ fontWeight: 800 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.modulePermissions || (user.role === 'Doctor' ? 'Full Access' : 'Counselling + Diets')}
                        size="small"
                        variant="outlined"
                        color={user.modulePermissions === 'Full Access' ? 'primary' : 'secondary'}
                        sx={{ fontWeight: 800 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                        <Tooltip title="Copy staff Login ID, Email & Password to clipboard" arrow placement="top">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleCopyCredentials(user)}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit this staff account" arrow placement="top">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleEditClick(user)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete this staff account permanently" arrow placement="top">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(user.id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title={user.active ? "Click to suspend account access" : "Click to enable active account access"} arrow placement="top">
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
                            sx={{ margin: 0, '& .MuiTypography-root': { fontSize: '0.78rem', fontWeight: 600 } }}
                          />
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* MOBILE CARD VIEW (xs / sm - No Horizontal Scroll!) */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Stack spacing={2}>
            {staffList.map((user) => (
              <Paper
                key={user.id}
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  borderColor: isDark ? 'rgba(108, 92, 231, 0.25)' : 'rgba(0, 0, 0, 0.12)',
                  bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#FFFFFF',
                  boxShadow: isDark ? '0 4px 14px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                {/* Header: Name, Staff ID & Role Chip */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                      {user.name}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                      <Typography variant="caption" sx={{ color: '#00C9A7', fontWeight: 900, bgcolor: 'rgba(0, 201, 167, 0.1)', px: 1, py: 0.2, borderRadius: 1 }}>
                        ID: {user.staffId}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#FFB703', fontWeight: 800, fontFamily: 'monospace', bgcolor: 'rgba(255, 183, 3, 0.1)', px: 1, py: 0.2, borderRadius: 1 }}>
                        Pass: {user.password || (user.role === 'Doctor' ? 'doctor123' : 'staff123')}
                      </Typography>
                    </Stack>
                  </Box>
                  <Chip
                    label={user.role}
                    size="small"
                    color={user.role === 'Doctor' ? 'primary' : 'secondary'}
                    sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                  />
                </Stack>

                <Divider sx={{ my: 1.5, opacity: 0.6 }} />

                {/* Info Fields */}
                <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600 }}>
                      Registered Email
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-all', color: isDark ? '#94A3B8' : '#334155' }}>
                      {user.email || `${user.name.toLowerCase().replace(/[^a-z]/g, '')}@arpanclinical.org`}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600 }}>
                      Department
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                      {user.department}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600 }}>
                      Permissions
                    </Typography>
                    <Chip
                      label={user.modulePermissions || (user.role === 'Doctor' ? 'Full Access' : 'Counselling + Diets')}
                      size="small"
                      variant="outlined"
                      color={user.modulePermissions === 'Full Access' ? 'primary' : 'secondary'}
                      sx={{ fontWeight: 800, height: 22, fontSize: '0.68rem', mt: 0.3 }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 1, opacity: 0.6 }} />

                {/* Footer Action Bar & Status */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
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
                    sx={{ margin: 0, '& .MuiTypography-root': { fontSize: '0.78rem', fontWeight: 700 } }}
                  />

                  <Stack direction="row" spacing={0.5}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleCopyCredentials(user)}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => handleEditClick(user)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(user.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>
      </CardContent>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete this staff account? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="primary" sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" sx={{ fontWeight: 700 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
