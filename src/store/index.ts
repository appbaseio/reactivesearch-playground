// import RootReducer from './slices';
import { combineReducers } from 'redux';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
// import logger from 'redux-logger';
import storage from 'redux-persist/lib/storage';

import { configureStore, EnhancedStore } from '@reduxjs/toolkit';

import { getPersistKey } from '../utils/functions';
import RootReducer from './slices';

const reducers = combineReducers(RootReducer);

const persistConfig = {
  key: getPersistKey(),
  version: 1,
  storage,
};
const persistedReducer = persistReducer(persistConfig, reducers);

export type RootState = ReturnType<typeof persistedReducer>;
export type AppDispatch = EnhancedStore<RootState>['dispatch'];

export const store: EnhancedStore<RootState> = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  // .concat(logger),
});
