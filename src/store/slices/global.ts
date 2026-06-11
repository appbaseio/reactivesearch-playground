import { createSlice } from '@reduxjs/toolkit';

import { DEFAULT_CONFIGURATION_SETTINGS } from '../../utils/constants';
import { isWindowEmbedded } from '../../utils/functions';

export const globalSlice = createSlice({
  name: ' global',
  initialState: {
    settings: { ...DEFAULT_CONFIGURATION_SETTINGS },
    showSettingsComponent: false,
    showShareComponent: false,
    isEmbedded: false,
  },
  reducers: {
    toggleSettings: state => {
      state.showSettingsComponent = !state.showSettingsComponent;
    },
    saveSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    toggleEmbed: state => {
      state.showShareComponent = !state.showShareComponent;
    },
    handleEmbedInit: state => {
      const isEmbedded = isWindowEmbedded();
      state.isEmbedded = isEmbedded;
      state.showShareComponent =
        isEmbedded && state.showShareComponent
          ? false
          : state.showShareComponent; // bydefault in anycase, we want sharecomponent to be initially closed
    },
  },
});

export const {
  saveSettings,
  toggleSettings,
  toggleEmbed,
  handleEmbedInit,
} = globalSlice.actions;

export default globalSlice.reducer;
