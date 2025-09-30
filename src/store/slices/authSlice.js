import { createSlice } from '@reduxjs/toolkit';

// Simple action creators for Firebase authentication
export const loginUser = (userData) => {
  return {
    type: 'auth/loginUser',
    payload: userData
  };
};

export const registerUser = (userData) => {
  return {
    type: 'auth/registerUser',
    payload: userData
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null, // Will contain: id, email, full_name, role, created_at
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token || null;
      state.isAuthenticated = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token || null;
      state.isAuthenticated = true;
      state.error = null;
    },
  }
});

export const { logout, clearError, setLoading, setError, loginSuccess, registerSuccess } = authSlice.actions;
export default authSlice.reducer;