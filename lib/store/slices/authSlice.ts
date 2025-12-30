// lib/store/slices/authSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/api';

interface AuthState {
  user: User | null;
  workspaceId: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  workspaceId: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; workspaceId: string | null }>
    ) => {
      state.user = action.payload.user;
      state.workspaceId = action.payload.workspaceId;
      state.isAuthenticated = true;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.workspaceId = null;
      state.isAuthenticated = false;
      // No need to clear localStorage - tokens are in HTTP-only cookies
      // The backend clears them via the logout endpoint
    },
    setWorkspace: (state, action: PayloadAction<string>) => {
      state.workspaceId = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, setWorkspace } = authSlice.actions;

export default authSlice.reducer;
