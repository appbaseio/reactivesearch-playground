import React, { FC, HTMLAttributes, useEffect, useState } from 'react';

import { PersistGate } from 'redux-persist/integration/react';
import ErrorBoundaries from './components/base/ErrorBoundaries';
import PlaygroundComponent from './components/PlaygroundComponent';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { store } from './store';
import LoadingSpinner from './components/shared/LoadingSpinner';
import LoadingContainer from './styles/LoadingContainer';

export interface PlaygroundProps extends HTMLAttributes<HTMLDivElement> {
  presets?: {
    url?: string;
    editorPresets?: {
      queryEditorValue?: string;
      responseEditorValue?: string;
    };
    settingsPresets?: {
      showUrl?: boolean;
      theme?: 'light' | 'dark' | 'hc-dark';
      showTabs?: boolean;
      showHeaders?: boolean;
      showSettings?: boolean;
    };
    showPlaygroundLink?: boolean;
  };
}

let persistor = persistStore(store);

const Playground: FC<PlaygroundProps> = ({ presets }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    // Disable trackpad back navigation
    window.onbeforeunload = function() {
      // There is no way in modern browsers to set custom strings. But we can show a confirmation by showing a dialog like below.
      // https://stackoverflow.com/questions/38879742/is-it-possible-to-display-a-custom-message-in-the-beforeunload-popup
      return 'Are you sure you want to navigate away? Any unsaved changes will be lost.';
    };
  }, []);

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
      </LoadingContainer>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ErrorBoundaries>
          <PlaygroundComponent presets={presets} />
        </ErrorBoundaries>
      </PersistGate>
    </Provider>
  );
};

export default Playground;
