import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks for user operations
export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getUserCollections = createAsyncThunk(
  'user/getCollections',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/user/${userId}/collections`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToCollection = createAsyncThunk(
  'user/addToCollection',
  async ({ artworkId, collectionId }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/user/collections/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artworkId, collectionId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add to collection');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    collections: [],
    likedArtworks: [],
    purchaseHistory: [],
    preferences: {
      categories: [],
      priceRange: { min: 0, max: 100000 },
      artists: [],
    },
    settings: {
      notifications: true,
      darkMode: false,
      language: 'en',
    },
    loading: false,
    error: null,
  },
  reducers: {
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    addToLikedArtworks: (state, action) => {
      const artworkId = action.payload;
      if (!state.likedArtworks.includes(artworkId)) {
        state.likedArtworks.push(artworkId);
      }
    },
    removeFromLikedArtworks: (state, action) => {
      const artworkId = action.payload;
      state.likedArtworks = state.likedArtworks.filter(id => id !== artworkId);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = { ...state.profile, ...action.payload };
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get collections
      .addCase(getUserCollections.fulfilled, (state, action) => {
        state.collections = action.payload;
      })
      // Add to collection
      .addCase(addToCollection.fulfilled, (state, action) => {
        const { collectionId, artwork } = action.payload;
        const collection = state.collections.find(c => c.id === collectionId);
        if (collection) {
          collection.artworks.push(artwork);
        }
      });
  },
});

export const {
  updateSettings,
  updatePreferences,
  addToLikedArtworks,
  removeFromLikedArtworks,
  clearError,
} = userSlice.actions;

export default userSlice.reducer;