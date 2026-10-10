import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';
import { AuthUser, StaffUser } from '../../types/clinical';

interface AuthState {
  currentUser: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  resetLinkDispatched: boolean;
  resetResult: any | null;
}

const getInitialUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('arpan_auth_user');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse saved user', e);
  }
  return null;
};

const getInitialToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('arpan_auth_token');
};

const initialState: AuthState = {
  currentUser: getInitialUser(),
  token: getInitialToken(),
  isLoading: false,
  error: null,
  resetLinkDispatched: false,
  resetResult: null,
};

// Async Thunks
export const loginUser = createAsyncThunk<
  { user: AuthUser; token: string; message: string },
  { staffId?: string; email?: string; identifier?: string; password: string; forceLogout?: boolean },
  { rejectValue: string }
>('auth/loginUser', async ({ staffId, email, identifier, password, forceLogout }, { rejectWithValue }) => {
  try {
    const payload: { staffId?: string; email?: string; password: string; forceLogout?: boolean } = {
      password,
      forceLogout: !!forceLogout
    };
    if (staffId) {
      payload.staffId = staffId;
    }
    if (email) {
      payload.email = email;
    }
    if (!staffId && !email && identifier) {
      if (identifier.includes('@')) {
        payload.email = identifier;
      } else {
        payload.staffId = identifier;
      }
    }

    const response = await axiosClient.post('/api/auth/login', payload);
    const { user, token, message } = response.data;
    if (typeof window !== 'undefined') {
      localStorage.setItem('arpan_auth_token', token);
      localStorage.setItem('arpan_auth_user', JSON.stringify(user));
    }
    return { user, token, message };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk<
  { user: AuthUser; token?: string; message: string },
  Partial<StaffUser> & { password: string },
  { rejectValue: string }
>('auth/registerUser', async (staffData, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post('/api/auth/register', staffData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Registration failed');
  }
});

export const verifySession = createAsyncThunk<
  AuthUser,
  void,
  { rejectValue: string }
>('auth/verifySession', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get('/api/auth/me');
    const user = response.data.user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('arpan_auth_user', JSON.stringify(user));
    }
    return user;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Session verification failed');
  }
});

export const requestPasswordReset = createAsyncThunk<
  { message: string; resetUrl?: string; token?: string; emailSent?: boolean },
  string,
  { rejectValue: string }
>('auth/requestPasswordReset', async (email, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post('/api/auth/forgot-password', { email });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to dispatch reset link');
  }
});

export const confirmPasswordReset = createAsyncThunk<
  { message: string; success: boolean; user?: any },
  { token: string; newPassword: string },
  { rejectValue: string }
>('auth/confirmPasswordReset', async ({ token, newPassword }, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post(`/api/auth/reset-password/${token}`, { password: newPassword });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Password reset failed');
  }
});

export const logoutUser = createAsyncThunk<
  void,
  { userId?: string; email?: string; staffId?: string } | void,
  { rejectValue: string }
>(
  'auth/logoutUser',
  async (data, { getState }) => {
    try {
      const state: any = getState();
      const currentUser = state?.auth?.currentUser;
      const token = typeof window !== 'undefined' ? localStorage.getItem('arpan_auth_token') : null;

      const payload = {
        userId: data?.userId || currentUser?.id || currentUser?._id,
        email: data?.email || currentUser?.email,
        staffId: data?.staffId || currentUser?.staffId,
      };

      await axiosClient.post('/api/auth/logout', payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
    } catch (error: any) {
      console.warn('Logout API failed, proceeding with client cleanup', error);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('arpan_auth_user');
        localStorage.removeItem('arpan_auth_token');
      }
    }
  }
);

export const changePassword = createAsyncThunk<
  { message: string },
  { currentPassword: string; newPassword: string },
  { rejectValue: string }
>('auth/changePassword', async (passwords, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post('/api/auth/change-password', passwords);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Failed to change password');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.currentUser = action.payload;
      if (typeof window !== 'undefined') {
        if (action.payload) {
          localStorage.setItem('arpan_auth_user', JSON.stringify(action.payload));
        } else {
          localStorage.removeItem('arpan_auth_user');
          localStorage.removeItem('arpan_auth_token');
        }
      }
    },
    logout: (state) => {
      state.currentUser = null;
      state.token = null;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('arpan_auth_user');
        localStorage.removeItem('arpan_auth_token');
      }
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentUser = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Login failed';
    });

    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state) => {
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Registration failed';
    });

    // Verify Session
    builder.addCase(verifySession.fulfilled, (state, action) => {
      state.currentUser = action.payload;
    });
    builder.addCase(verifySession.rejected, (state) => {
      // If session expired or superseded, clear token and current user
      state.token = null;
      state.currentUser = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('arpan_auth_token');
        localStorage.removeItem('arpan_auth_user');
      }
    });

    // Forgot Password
    builder.addCase(requestPasswordReset.pending, (state) => {
      state.isLoading = true;
      state.error = null;
      state.resetLinkDispatched = false;
    });
    builder.addCase(requestPasswordReset.fulfilled, (state, action) => {
      state.isLoading = false;
      state.resetLinkDispatched = true;
      state.resetResult = action.payload;
      state.error = null;
    });
    builder.addCase(requestPasswordReset.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Request failed';
    });

    // Reset Password Confirm
    builder.addCase(confirmPasswordReset.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(confirmPasswordReset.fulfilled, (state) => {
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(confirmPasswordReset.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Password reset failed';
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.currentUser = null;
      state.token = null;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('arpan_auth_user');
        localStorage.removeItem('arpan_auth_token');
      }
    });
  },
});

export const { setCurrentUser, logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
