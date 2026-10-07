import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';
import { StaffUser } from '../../types/clinical';
import { INITIAL_STAFF_USERS } from '../../mockData/clinicalModulesData';

interface StaffState {
  staffList: StaffUser[];
  isLoading: boolean;
  error: string | null;
  lastActionSuccess: string | null;
}

const initialState: StaffState = {
  staffList: INITIAL_STAFF_USERS,
  isLoading: false,
  error: null,
  lastActionSuccess: null,
};

// Async Thunks
export const fetchStaffList = createAsyncThunk<
  StaffUser[],
  void,
  { rejectValue: string }
>('staff/fetchStaffList', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get('/api/staff/public');
    return response.data.staff || [];
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch staff list');
  }
});

export const addStaffMember = createAsyncThunk<
  StaffUser,
  any,
  { rejectValue: string }
>('staff/addStaffMember', async (staffData, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post('/api/staff', staffData);
    return response.data.user;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to create staff member');
  }
});

export const updateStaffMember = createAsyncThunk<
  StaffUser,
  { id: string; updatedData: Partial<StaffUser> },
  { rejectValue: string }
>('staff/updateStaffMember', async ({ id, updatedData }, { rejectWithValue }) => {
  try {
    const response = await axiosClient.put(`/api/staff/${id}`, updatedData);
    return response.data.user;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to update staff member');
  }
});

export const toggleStaffMemberStatus = createAsyncThunk<
  StaffUser,
  { id: string; currentActive: boolean },
  { rejectValue: string }
>('staff/toggleStaffMemberStatus', async ({ id, currentActive }, { rejectWithValue }) => {
  try {
    const response = await axiosClient.put(`/api/staff/${id}`, { active: !currentActive });
    return response.data.user;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to toggle staff status');
  }
});

export const deleteStaffMember = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('staff/deleteStaffMember', async (id, { rejectWithValue }) => {
  try {
    await axiosClient.delete(`/api/staff/${id}`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to delete staff member');
  }
});

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    clearStaffError: (state) => {
      state.error = null;
    },
    // Optimistic fallback reducers for instant local responsiveness
    localAddStaff: (state, action: PayloadAction<StaffUser>) => {
      state.staffList.unshift(action.payload);
    },
    localToggleStatus: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const target = state.staffList.find((s) => s.id === id || s.staffId === id);
      if (target) {
        target.active = !target.active;
      }
    },
    localDeleteStaff: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.staffList = state.staffList.filter((s) => s.id !== id && s.staffId !== id);
    },
    localUpdateStaff: (state, action: PayloadAction<{ id: string; updatedData: Partial<StaffUser> }>) => {
      const { id, updatedData } = action.payload;
      const index = state.staffList.findIndex((s) => s.id === id || s.staffId === id);
      if (index !== -1) {
        state.staffList[index] = { ...state.staffList[index], ...updatedData };
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Staff List
    builder.addCase(fetchStaffList.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchStaffList.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload && action.payload.length > 0) {
        state.staffList = action.payload;
      }
      state.error = null;
    });
    builder.addCase(fetchStaffList.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to fetch staff';
    });

    // Add Staff
    builder.addCase(addStaffMember.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(addStaffMember.fulfilled, (state, action) => {
      state.isLoading = false;
      // Replace if existing or add to start
      const idx = state.staffList.findIndex(
        (s) => s.id === action.payload.id || s.staffId === action.payload.staffId
      );
      if (idx !== -1) {
        state.staffList[idx] = action.payload;
      } else {
        state.staffList.unshift(action.payload);
      }
      state.lastActionSuccess = 'Staff added successfully';
    });
    builder.addCase(addStaffMember.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Failed to add staff';
    });

    // Update Staff
    builder.addCase(updateStaffMember.fulfilled, (state, action) => {
      const idx = state.staffList.findIndex(
        (s) => s.id === action.payload.id || s.staffId === action.payload.staffId
      );
      if (idx !== -1) {
        state.staffList[idx] = { ...state.staffList[idx], ...action.payload };
      }
    });

    // Toggle Staff Status
    builder.addCase(toggleStaffMemberStatus.fulfilled, (state, action) => {
      const idx = state.staffList.findIndex(
        (s) => s.id === action.payload.id || s.staffId === action.payload.staffId
      );
      if (idx !== -1) {
        state.staffList[idx].active = action.payload.active;
      }
    });

    // Delete Staff
    builder.addCase(deleteStaffMember.fulfilled, (state, action) => {
      const id = action.payload;
      state.staffList = state.staffList.filter((s) => s.id !== id && s.staffId !== id);
    });
  },
});

export const {
  clearStaffError,
  localAddStaff,
  localToggleStatus,
  localDeleteStaff,
  localUpdateStaff,
} = staffSlice.actions;

export default staffSlice.reducer;
