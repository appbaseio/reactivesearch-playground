import {
  constructSchemaEndpoint,
  fixTrailingCommas,
  hitApi,
  // validateUrlHealth,
} from '../../utils/functions';

import { AppDispatch } from '..';
import { createSlice } from '@reduxjs/toolkit';

import { INITIAL_TAB_CONFIG, METHODS } from '../../utils/constants';

export const tabsSlice = createSlice({
  name: 'tabs',
  initialState: {
    tabs: [
      {
        ...INITIAL_TAB_CONFIG,
      },
    ],
    activeTab: 0,
  },
  reducers: {
    addNewTab: state => {
      const newTabConfig = {
        // ...state.tabs[state.activeTab],
        ...INITIAL_TAB_CONFIG,
        tabTitle: `Tab ${state.tabs.length} `,
        url: state.tabs[state.activeTab].url,
        clusterURL: state.tabs[state.activeTab].clusterURL,
        indexName: state.tabs[state.activeTab].indexName,
        headers: state.tabs[state.activeTab].headers,
        schema: state.tabs[state.activeTab].schema,
      };
      state.tabs.push(newTabConfig);
      state.activeTab = state.tabs.length - 1;
    },
    removeTab: (state, action) => {
      let tabIndex = action.payload;
      state.activeTab =
        state.tabs.length - 1 === tabIndex ? tabIndex - 1 : tabIndex;
      state.tabs.splice(tabIndex, 1);
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    updateCurrentTabConfig: (state, action) => {
      state.tabs[state.activeTab] = {
        ...state.tabs[state.activeTab],
        ...action.payload,
      };
    },
    replaceTabsArray: (state, action) => {
      state.tabs = action.payload;
      state.activeTab =
        state.tabs.length - 1 < state.activeTab ? 0 : state.activeTab;
    },
    updateTabs: (state, action) => {
      const { tabs: newTabs, activeTab: newActiveTab } = action.payload;
      state.tabs = newTabs;
      if (newActiveTab) {
        state.activeTab = newActiveTab;
      }
    },
  },
});

export const {
  addNewTab,
  removeTab,
  setActiveTab,
  updateCurrentTabConfig,
  replaceTabsArray,
  updateTabs,
} = tabsSlice.actions;

export default tabsSlice.reducer;

interface updateUrlPayloadProps {
  url: string;
}

// Define a thunk that dispatches action creators
export const fetchAPISchema = () => async (
  dispatch: AppDispatch,
  getState: any
) => {
  try {
    const { tabs: tabsArray, activeTab } = getState().tabs;
    const activeTabObject = tabsArray[activeTab];
    const { clusterURL } = activeTabObject;

    // construct endpoint for schema
    let schemaEndpoint: string = constructSchemaEndpoint(clusterURL);

    // fetch schema from url
    const { response } = await hitApi(schemaEndpoint, 'GET');

    dispatch(
      updateCurrentTabConfig({
        schema: response,
      })
    );
  } catch (error) {
    if (error instanceof Error) {
      console.warn(error + ': ' + error.message);
    }
  }
};

// Define a thunk that dispatches action creators
export const updateUrl = (payload: updateUrlPayloadProps) => async (
  dispatch: AppDispatch
) => {
  try {
    let url: URL = new URL(payload.url);
    let clusterURL: string = url.origin;
    let indexName: string = url.pathname.split('/')[1];

    // if (await validateUrlHealth(clusterURL)) {
    dispatch(
      updateCurrentTabConfig({
        url: payload.url,
        clusterURL,
        indexName,
        isValidUrl: true,
        // errorMessage: '',
        // response: '',
        // responseContentType: '',
        // responseStatusCode: '',
      })
    );
    fetchAPISchema();
    // } else {
    //   dispatch(
    //     updateCurrentTabConfig({
    //       errorMessage: '',
    //       // 'URL health not good!',
    //       isValidUrl: false,
    //       response: '',
    //       url: payload.url,
    //       clusterURL,
    //       indexName,
    //     })
    //   );
    // }
  } catch (error) {
    dispatch(
      updateCurrentTabConfig({
        errorMessage: 'Try entering a valid URL',
        isValidUrl: false,
        response: '',
        url: payload.url,
        responseContentType: '',
        responseStatusCode: '',
      })
    );
    // console.log('UPDATE_URL_ERROR\n', error);
  }
};

interface LooseObject {
  [key: string]: any;
}
export const fetchResponse = (abortController?: AbortController) => async (
  dispatch: AppDispatch,
  getState: any
) => {
  try {
    const { tabs: tabsArray, activeTab } = getState().tabs;
    const activeTabObject = tabsArray[activeTab];
    const {
      url,
      headers: tabHeaders,
      body,
      method = METHODS.POST,
    } = activeTabObject;
    dispatch(
      updateCurrentTabConfig({
        isFetching: true,
        response: '',
        errorMessage: '',
        responseStatusCode: '',
      })
    );
    const { username, password, origin, pathname, search } = new URL(url) || {};

    // console.log('headers in tabs', tabHeaders);
    // console.log('stringified headers n tabs', JSON.stringify(tabHeaders));
    // Authorization can be consumed either from
    // 1. headers editor section
    // 2. urlstruct username:password
    let _headers: LooseObject = {
      // ...headers_from_HEADERS_sections,
      ...(typeof tabHeaders === 'string' && !!tabHeaders
        ? JSON.parse(fixTrailingCommas(tabHeaders))
        : tabHeaders),
    };
    _headers['Content-Type'] = 'application/json';
    if (!_headers['Authorization'] && username && password) {
      _headers['Authorization'] = `Basic ${btoa(`${username}:${password}`)}`;
    }

    let endpoint = origin;
    if (pathname) {
      endpoint += pathname;
    }
    if (search) {
      endpoint += search;
    }
    const { response, responseContentType, responseStatusCode } = await hitApi(
      endpoint,
      method,
      _headers,
      fixTrailingCommas(body),
      abortController
    );
    // console.log(',updateCurrentTabConfig', responseStatusCode);
    dispatch(
      updateCurrentTabConfig({
        response: JSON.stringify(response, null, 4),
        responseContentType,
        errorMessage: '',
        responseStatusCode,
        isFetching: false,
      })
    );
  } catch (error) {
    if (error instanceof Error) {
      dispatch(
        updateCurrentTabConfig({
          errorMessage: error.name + ': ' + error.message,
          response: '',
          isFetching: false,
        })
      );
    }
  }
};
