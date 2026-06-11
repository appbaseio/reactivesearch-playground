import React, { useCallback, useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { ThemeProvider } from 'styled-components';

import { addPlaygroundState, getPlaygroundStateById } from '../firebase';
import { RootState } from '../store';
import { handleEmbedInit, saveSettings } from '../store/slices/global';
import { fetchMappingsForCurrentUrl } from '../store/slices/mappings';
import { fetchStoredQueriesForCurrentUrl } from '../store/slices/storedQueries';
import {
  replaceTabsArray,
  updateCurrentTabConfig,
  updateUrl,
} from '../store/slices/tabs';
import Container from '../styles/Container';
import { ContentWrappper, QueryArea, ResponseArea } from '../styles/Content';
import OpenInNewTab from '../styles/OpenInNewTab';
import GlobalStyle from '../styles/shared/globalStyles';
import getTheme from '../styles/theme';
import {
  METHODS,
  REVERSE_SHORT_CONFIGURATION_NAME_ALIASES,
} from '../utils/constants';
import {
  constructSettingsObjectFromCurrentUrl,
  debounce,
  getFirestoreKeyFromURL,
  isWindowEmbedded,
} from '../utils/functions';
import HeaderComponent from './HeaderComponent';
import MetaEditorComponent from './MetaEditorComponent';
import QueryEditorComponent from './QueryEditorComponent';
import ResponseEditorComponent from './ResponseEditorComponent';
import SettingsComponent from './SettingsComponent';
import ShareComponent from './ShareComponent';
import SplitViewComponent from './shared/SplitView';

export interface PlaygroundComponentProps {
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

let intervalId: ReturnType<typeof setInterval>;
const PlaygroundComponent: React.FC<PlaygroundComponentProps> = ({
  presets,
}) => {
  const dispatch = useDispatch();
  const { settings, tabsArray, activeTab } = useSelector(
    ({
      global: { settings },
      tabs: { tabs: tabsArray, activeTab },
    }: RootState) => ({
      settings,
      tabsArray,
      activeTab,
    }),
    shallowEqual // source: https://dev.to/tkudlinski/react-redux-useselector-hook-and-equality-checks-2m1d
  );
  const [externalLink, setExternalLink] = useState('');

  useEffect(() => {
    /****************************** HANDLING EMBED **************************************** */
    dispatch(handleEmbedInit());
    const { pathname } = window.location;
    const fireStoreDocKey = getFirestoreKeyFromURL(pathname);

    if (fireStoreDocKey) {
      const docId = fireStoreDocKey;
      const syncStateWithFireStore = async () => {
        const playgroundState = await getPlaygroundStateById(docId);

        !!playgroundState &&
          dispatch(replaceTabsArray(playgroundState.tabs)) &&
          dispatch(
            saveSettings({
              ...playgroundState.settings,
              ...constructSettingsObjectFromCurrentUrl(),
            })
          ) &&
          dispatch(fetchMappingsForCurrentUrl({ forceFetch: true })) &&
          dispatch(fetchStoredQueriesForCurrentUrl());
      };
      syncStateWithFireStore();
    } else {
      console.warn(
        'ReactiveSearch Playground: The entered URL seem faulty! Try entering a healthy URL.'
      );
      dispatch(fetchStoredQueriesForCurrentUrl());
      dispatch(fetchMappingsForCurrentUrl({ forceFetch: true }));
    }
    !presets?.showPlaygroundLink && isWindowEmbedded() && getExternalUrl();
  }, []);

  const debouncedUpdateCurrentTabConfig = useCallback(
    debounce((value: any) => {
      dispatch(updateCurrentTabConfig(value));
    }, 500),
    []
  );

  useEffect(() => {
    /***************** HANDLING PRESETS WHEN USED AS NPM PACKAGE ************************** */
    if (presets) {
      const { settingsPresets, url, editorPresets } = presets;
      if (settingsPresets) {
        const settingsPresetsKeys = Object.keys(settingsPresets);
        const settingsPresetsValues = Object.values(settingsPresets);

        const settingsObjectFromPresets = {};
        for (let i = 0; i < settingsPresetsKeys.length; i++) {
          let currentKey = settingsPresetsKeys[i];
          let settingsPropertyFullKey =
            REVERSE_SHORT_CONFIGURATION_NAME_ALIASES[currentKey];
          if (settingsPropertyFullKey) {
            Object.assign(settingsObjectFromPresets, {
              [settingsPropertyFullKey]: settingsPresetsValues[i],
            });
          }
        }
        dispatch(saveSettings(settingsObjectFromPresets));
      }
      const tabsArrayOverride = [
        {
          tabTitle: '',
          url: '', // usually reactivesearch url
          headers: '',
          query_variables: {}, // keep this empty for now as part of v2
          body: [
            '{',
            '    "query": [{\n\n\t}],',
            '    "settings": {\n\n\t}',
            '}',
          ].join('\n'), // request body
          clusterURL: '',
          indexName: '',
          isValidUrl: false,
          errorMessage: '',
          response: '',
          responseContentType: '',
          method: METHODS.POST,
          responseStatusCode: '',
        },
      ];
      if (url) {
        dispatch(updateUrl({ url }));

        let urlFinal: URL = new URL(url);
        let clusterURL: string = urlFinal.origin;
        let indexName: string = urlFinal.pathname.split('/')[1];

        tabsArrayOverride[0].url = url;
        tabsArrayOverride[0].clusterURL = clusterURL;
        tabsArrayOverride[0].indexName = indexName;
      }
      if (editorPresets) {
        const { queryEditorValue, responseEditorValue } = editorPresets;
        tabsArrayOverride[0] = {
          ...tabsArrayOverride[0],
          ...{
            ...(!!queryEditorValue && {
              body: queryEditorValue,
            }),
            ...(!!responseEditorValue && {
              response: responseEditorValue,
              errorMessage: '',
            }),
          },
        };
        debouncedUpdateCurrentTabConfig({
          ...(!!queryEditorValue && {
            body: queryEditorValue,
          }),
          ...(!!responseEditorValue && {
            response: responseEditorValue,
            errorMessage: '',
          }),
        });
      }
      presets?.showPlaygroundLink && getExternalUrl(tabsArrayOverride);
    }
  }, [presets]);

  useEffect(() => {
    const {
      'schema.polling.enable': enablePolling,
      'schema.polling.interval': pollingInterval,
    } = settings;
    if (enablePolling && tabsArray[activeTab].isValidUrl && !intervalId) {
      intervalId = setInterval(() => {
        dispatch(fetchMappingsForCurrentUrl({ forceFetch: true }));
      }, pollingInterval);
    }
    if ((!enablePolling || !tabsArray[activeTab].isValidUrl) && !!intervalId) {
      clearInterval(intervalId);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [settings['schema.polling.enable'], tabsArray[activeTab].isValidUrl]);

  const getExternalUrl = async (tabsArrayOverride?: any) => {
    const { pathname } = window.location;
    let fireStoreDocKey = getFirestoreKeyFromURL(pathname);

    if (!fireStoreDocKey) {
      fireStoreDocKey = await addPlaygroundState({
        tabs: tabsArrayOverride ? tabsArrayOverride : tabsArray,
        settings,
      });
    }
    setExternalLink(
      `https://play.reactivesearch.io/embed/${fireStoreDocKey}?${encodeURIComponent(
        'showUrl'
      )}=${encodeURIComponent(true)}&${encodeURIComponent(
        'showHeaders'
      )}=${encodeURIComponent(true)}&${encodeURIComponent(
        'showMethod'
      )}=${encodeURIComponent(true)}&${encodeURIComponent(
        'showSettings'
      )}=${encodeURIComponent(true)}&${encodeURIComponent(
        'showCopyCURL'
      )}=${encodeURIComponent(true)}&${encodeURIComponent(
        'showTabs'
      )}=${encodeURIComponent(true)}`
    );
  };

  return (
    <>
      <ThemeProvider theme={getTheme(settings['editor.theme'])}>
        <GlobalStyle />
        {(presets?.showPlaygroundLink || isWindowEmbedded()) && (
          <OpenInNewTab href={externalLink} target="_blank">
            Open Playground
          </OpenInNewTab>
        )}
        <Container>
          <HeaderComponent />
          <ContentWrappper>
            <SplitViewComponent
              firstPanel={
                <QueryArea>
                  <SplitViewComponent
                    firstPanel={<QueryEditorComponent />}
                    secondPanel={<MetaEditorComponent />}
                    collapsePanel={
                      !settings['components.showHeaders'] ? 'second' : undefined
                    }
                  />
                </QueryArea>
              }
              secondPanel={
                <ResponseArea>
                  <ResponseEditorComponent />
                </ResponseArea>
              }
              collapsePanel={undefined}
              orientation="horizontal"
            />
          </ContentWrappper>{' '}
          <SettingsComponent />
          <ShareComponent />
        </Container>
      </ThemeProvider>
    </>
  );
};

export default PlaygroundComponent;
