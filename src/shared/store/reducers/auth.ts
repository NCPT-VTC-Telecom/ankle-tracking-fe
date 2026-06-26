// action - state management
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// types
import { AuthProps, UserProfile } from 'shared/types/auth';

// initial state
export const initialState: AuthProps = {
  isLoggedIn: false,
  isInitialized: false,
  user: null,
  userSocial: null,
  currentSites: null,
  currentRegion: null,
  currentAds: []
};

// ==============================|| AUTH REDUCER ||============================== //

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStore: (state, action: PayloadAction<{ user: UserProfile; isLoggedIn: boolean }>) => {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.isInitialized = true;
      state.user = action.payload.user;
    },
    logoutStore: (state) => {
      state.isInitialized = true;
      state.isLoggedIn = false;
      state.user = null;
    },
    registerStore: (state, action: PayloadAction<{ userSocial: any }>) => {
      state.userSocial = action.payload.userSocial;
    },
    setCurrentSite: (state, action: PayloadAction<{ siteId: string | null }>) => {
      state.currentSites = action.payload.siteId;
      if (state.user) {
        state.user.currentSites = action.payload.siteId;
      }
    },
    setCurrentRegion: (state, action: PayloadAction<{ regionId: string | null }>) => {
      state.currentRegion = action.payload.regionId;
      if (state.user) {
        state.user.currentRegion = action.payload.regionId;
      }
    },
    setCurrentAds: (state, action: PayloadAction<{ adId: Array<Number> | null }>) => {
      state.currentAds = action.payload.adId;
      if (state.user) {
        state.user.currentAds = action.payload.adId;
      }
    }
  }
});

export default authSlice.reducer;

export const { loginStore, logoutStore, registerStore, setCurrentSite, setCurrentRegion, setCurrentAds } = authSlice.actions;
