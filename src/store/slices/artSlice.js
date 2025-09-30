import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks for art operations
export const fetchArtworks = createAsyncThunk(
  'art/fetchArtworks',
  async ({ page = 1, category = 'all', limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/artworks?page=${page}&category=${category}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch artworks');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchArtworks = createAsyncThunk(
  'art/searchArtworks',
  async ({ query, filters }, { rejectWithValue }) => {
    try {
      const searchParams = new URLSearchParams({
        q: query,
        ...filters,
      });
      
      const response = await fetch(`/api/artworks/search?${searchParams}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const likeArtwork = createAsyncThunk(
  'art/likeArtwork',
  async (artworkId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/artworks/${artworkId}/like`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to like artwork');
      }
      
      const data = await response.json();
      return { artworkId, liked: data.liked, likesCount: data.likesCount };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getRecommendations = createAsyncThunk(
  'art/getRecommendations',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/recommendations/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const artSlice = createSlice({
  name: 'art',
  initialState: {
    artworks: [],
    searchResults: [],
    recommendations: [],
    currentArtwork: null,
    isLoading: false,
    searchLoading: false,
    error: null,
    searchError: null,
    filters: {
      category: 'all',
      priceRange: 'any',
      sortBy: 'popular',
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      hasMore: true,
    },
  },
  reducers: {
    setCurrentArtwork: (state, action) => {
      state.currentArtwork = action.payload;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchError = null;
    },
    toggleArtworkLike: (state, action) => {
      const { artworkId } = action.payload;
      const artwork = state.artworks.find(art => art.id === artworkId);
      if (artwork) {
        artwork.isLiked = !artwork.isLiked;
        artwork.likes += artwork.isLiked ? 1 : -1;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch artworks
      .addCase(fetchArtworks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchArtworks.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.page === 1) {
          state.artworks = action.payload.artworks;
        } else {
          state.artworks.push(...action.payload.artworks);
        }
        state.pagination = {
          currentPage: action.payload.page,
          totalPages: action.payload.totalPages,
          hasMore: action.payload.hasMore,
        };
      })
      .addCase(fetchArtworks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Search artworks
      .addCase(searchArtworks.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchArtworks.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.artworks;
      })
      .addCase(searchArtworks.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload;
      })
      // Like artwork
      .addCase(likeArtwork.fulfilled, (state, action) => {
        const { artworkId, liked, likesCount } = action.payload;
        const artwork = state.artworks.find(art => art.id === artworkId);
        if (artwork) {
          artwork.isLiked = liked;
          artwork.likes = likesCount;
        }
      })
      // Get recommendations
      .addCase(getRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload;
      });
  },
});

export const {
  setCurrentArtwork,
  updateFilters,
  clearSearchResults,
  toggleArtworkLike,
  clearError,
} = artSlice.actions;

export default artSlice.reducer;
