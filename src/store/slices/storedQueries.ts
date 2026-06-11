import {
  constructStoredQueriesEndpoint,
  fixTrailingCommas,
  hitApi,
} from '../../utils/functions';

import { AppDispatch } from '..';
import { createSlice } from '@reduxjs/toolkit';

const storedQueries: Array<{}> = [{}];

export const storedQueriesSlice = createSlice({
  name: 'storedQueries',
  initialState: {
    storedQueries,
  },
  reducers: {
    updateStoredQueries: (state, action) => {
      state.storedQueries = action.payload;
    },
  },
});

export const { updateStoredQueries } = storedQueriesSlice.actions;

export default storedQueriesSlice.reducer;

interface LooseObject {
  [key: string]: any;
}

// Define a thunk that dispatches action creators
export const fetchStoredQueriesForCurrentUrl = () => async (
  dispatch: AppDispatch,
  getState: any
) => {
  try {
    const { tabs: tabsArray, activeTab } = getState().tabs;
    const activeTabObject = tabsArray[activeTab];
    const { url, headers: tabHeaders, clusterURL } = activeTabObject;
    const { username, password } = new URL(url) || {};

    // construct endpoint for storedQueries
    let storedQueriesEndpoint: string = constructStoredQueriesEndpoint(
      clusterURL
    );

    // Authorization can be consumed either from
    // 1. headers editor section
    // 2. urlstruct username:password
    let headers: LooseObject = {
      // ...headers_from_HEADERS_sections,
      ...(typeof tabHeaders === 'string' && !!tabHeaders
        ? JSON.parse(fixTrailingCommas(tabHeaders))['Authorization']
        : tabHeaders['Authorization']),
    };

    // fetching Authorization from the url, if present
    if (!headers['Authorization'] && username && password) {
      headers['Authorization'] = `Basic ${btoa(`${username}:${password}`)}`;
    }
    // storedQueries response with following strucutre- roughly*
    //   {
    // "index1": {
    //   "storedQueries": {
    //      "properties":
    // ...

    // fetch storedQueries from url
    const { response: rawStoredQueriesResponse } = await hitApi(
      storedQueriesEndpoint,
      'GET',
      headers
    );

    if (Array.isArray(rawStoredQueriesResponse)) {
      const editorFriendlyStoredQueries = rawStoredQueriesResponse?.map(
        ({
          id,
          params,
          description,
        }: {
          id: string;
          params: object;
          description: string;
        }) => {
          return { id, params, description };
        }
      );
      dispatch(updateStoredQueries([...editorFriendlyStoredQueries]));
    }
  } catch (error) {
    if (error instanceof Error) {
      console.warn(error + ': ' + error.message);
    }
  }
};
