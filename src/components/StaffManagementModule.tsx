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
  useTheme
} from '@mui/material';
import {
  PersonAdd,
  Badge,
  ContentCopy,
  Verified,
  Close,
  Shield,
  Key
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
  onAddStaff: (newStaff: StaffUser) => void;
  onToggleStatus: (staffId: string) => void;
}

export default function StaffManagementModule({
  staffList,
  onAddStaff,
  onToggleStatus
}: StaffManagementModuleProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [staffIdInput, setStaffIdInput] = useState('');
  const [customPasscode, setCustomPasscode] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [permission, setPermission] = useState<ModulePermission | ''>('');
  const [errors, setErrors] = useState<FormErrors>({});

  // Recently created user credential slip state
  const [issuedUser, setIssuedUser] = useState<StaffUser | null>(null);

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
    const generatedPass = customPasscode.trim() || `staff${randomSuffix}`;
    const generatedEmail = email.trim();

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
      passcode: generatedPass
    };

    onAddStaff(newMember);
    setIssuedUser(newMember);
    toast.success(
      `Staff Account Issued! Login ID: ${generatedId} | Password: ${generatedPass}`,
      { toastId: `staff-created-${newMember.id}` }
    );

    // Reset form
    setName('');
    setEmail('');
    setStaffIdInput('');
    setCustomPasscode('');
    setDepartment('');
    setRole('');
    setPermission('');
    setErrors({});
  };

  const handleCopyCredentials = (user: StaffUser) => {
    const text = `Arpan Clinical Assistant Login Credentials:\nName: ${user.name}\nEmail: ${user.email || 'N/A'}\nRole: ${user.role}\nDepartment: ${user.department}\nPermissions: ${user.modulePermissions}\nLogin ID: ${user.staffId}\nPassword: ${user.passcode || 'staff123'}`;
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
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
              Clinic Roster & Staff Credential Management
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
                  {issuedUser.passcode}
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

        {/* Issue Credentials Form */}
        <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 1, bgcolor: 'rgba(0, 201, 167, 0.03)', borderColor: 'rgba(0, 201, 167, 0.3)' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#00C9A7', display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
            <PersonAdd fontSize="small" /> Issue Login Credentials & Access Level
          </Typography>

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
                  type="password"
                  label="Initial Password (Optional)"
                  placeholder="Auto-generated if blank (e.g. staff123)"
                  value={customPasscode}
                  onChange={(e) => setCustomPasscode(e.target.value)}
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
                  <MenuItem value="Doctor">Doctor (Full Access)</MenuItem>
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

              <Grid item xs={12} textAlign="right">
                <Tooltip title="Create staff user profile and issue Login ID with Passcode and Email" arrow placement="top">
                  <Button variant="contained" color="primary" type="submit" startIcon={<PersonAdd />} sx={{ borderRadius: 1, height: 42, px: 3, fontWeight: 800 }}>
                    Issue Credentials &amp; Access Account
                  </Button>
                </Tooltip>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Existing Roster Directory */}
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge color="primary" /> Clinic Roster & Account Directory ({staffList.length} Users)
        </Typography>

        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)' }}>
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
                    {user.passcode || 'staff123'}
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
                      <Tooltip title="Copy staff Login ID, Email & Passcode to clipboard" arrow placement="top">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleCopyCredentials(user)}
                        >
                          <ContentCopy fontSize="small" />
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
      </CardContent>
    </Card>
  );
}
