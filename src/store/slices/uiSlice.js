import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light',
  language: 'en',
  isLoading: false,
  notifications: [],
  modal: {
    isVisible: false,
    type: null,
    data: null,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    showModal: (state, action) => {
      state.modal = {
        isVisible: true,
        ...action.payload,
      };
    },
    hideModal: (state) => {
      state.modal = {
        isVisible: false,
        type: null,
        data: null,
      };
    },
  },
});

export const {
  setTheme,
  setLanguage,
  setLoading,
  addNotification,
  removeNotification,
  showModal,
  hideModal,
} = uiSlice.actions;
export default uiSlice.reducer;
