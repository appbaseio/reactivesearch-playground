import {
  constructMappingsEndpoint,
  fixTrailingCommas,
  getFields,
  hitApi,
} from '../../utils/functions';

import { AppDispatch } from '..';
import { FIELDS_CONVERSION_MAP } from '../../utils/constants';
import { createSlice } from '@reduxjs/toolkit';
import { updateCurrentTabConfig } from './tabs';

const mappings: Record<string, any> = {};

export const mappingsSlice = createSlice({
  name: 'mappings',
  initialState: {
    mappings,
  },
  reducers: {
    updateMappings: (state, action) => {
      Object.assign(state.mappings, action.payload);
    },
  },
});

export const { updateMappings } = mappingsSlice.actions;

export default mappingsSlice.reducer;

interface LooseObject {
  [key: string]: any;
}

interface fetchMappingsForCurrentUrlPayloadProps {
  forceFetch?: boolean;
}
// Define a thunk that dispatches action creators
export const fetchMappingsForCurrentUrl = ({
  forceFetch = false,
}: fetchMappingsForCurrentUrlPayloadProps) => async (
  dispatch: AppDispatch,
  getState: any
) => {
  try {
    // console.log('fetching mappings for current url...');
    const mappings = getState().mappings.mappings;
    const { tabs: tabsArray, activeTab } = getState().tabs;
    const activeTabObject = tabsArray[activeTab];
    const { url, headers: tabHeaders, clusterURL, indexName } = activeTabObject;
    const { username, password } = new URL(url) || {};
    if (!!mappings[url] && !forceFetch) {
      console.log('mappings for current url already exists... returning');
      dispatch(
        updateCurrentTabConfig({
          errorMessage: '',
        })
      );
      return;
    }

    // construct endpoint for mappings
    let mappingEndpoint: string = constructMappingsEndpoint(
      clusterURL,
      indexName
    );

    // console.log('headers in mappings', tabHeaders);
    // console.log('stringified headers in mappings', JSON.stringify(tabHeaders));
    // Authorization can be consumed either from
    // 1. headers editor section
    // 2. urlstruct username:password
    let headers: LooseObject = {
      // ...headers_from_HEADERS_sections,
      ...(typeof tabHeaders === 'string' && !!tabHeaders
        ? JSON.parse(fixTrailingCommas(tabHeaders))
        : tabHeaders),
    };

    // fetching Authorization from the url, if present
    if (!headers['Authorization'] && username && password) {
      headers['Authorization'] = `Basic ${btoa(`${username}:${password}`)}`;
    }
    // mappings response with following strucutre- roughly*
    //   {
    // "index1": {
    //   "mappings": {
    //      "properties":
    // ...

    // fetch mappings from url
    const { response: rawMappingsResponse } = await hitApi(
      mappingEndpoint,
      'GET',
      headers
    );
    if (rawMappingsResponse?.error) {
      throw new Error(
        rawMappingsResponse.error.code + ' ' + rawMappingsResponse.error.message
      );
    }
    // constructing index wise {mappings:{...}, searchableFields : string[], aggFields: string[], rankFeatureFields: string[]} object
    const indexWisePropertiesObj = {};

    Object.keys(rawMappingsResponse).forEach(indexName => {
      const mappingProperties =
        rawMappingsResponse[indexName]?.mappings?.properties;
      if (!mappingProperties) return;
      const topLevelFields = Object.keys(mappingProperties);
      Object.assign(indexWisePropertiesObj, {
        [indexName]: {
          mappings: {
            propertires: mappingProperties,
          },
          includeFields: topLevelFields,
          excludeFields: topLevelFields,
          booleanFields: getFields(
            mappingProperties,
            '',
            FIELDS_CONVERSION_MAP['booleanFields'],
            []
          ),
          searchableFields: getFields(
            mappingProperties,
            '',
            FIELDS_CONVERSION_MAP['searchableFields'],
            ['nested']
          ),
          aggregatableFields: getFields(
            mappingProperties,
            '',
            FIELDS_CONVERSION_MAP['aggregatableFields'],
            []
          ),
          rankFeatureFields: getFields(
            mappingProperties,
            '',
            FIELDS_CONVERSION_MAP['rankFeatureFields'],
            []
          ),
          rangeFields: getFields(
            mappingProperties,
            '',
            FIELDS_CONVERSION_MAP['rangeFields'],
            []
          ),
          geoFields: getFields(
            mappingProperties,
            '',
            FIELDS_CONVERSION_MAP['geoFields'],
            []
          ),
          nestedFields: getFields(
            mappingProperties,
            '',
            FIELDS_CONVERSION_MAP['nestedFields'],
            []
          ),
          distinctFields: getFields(
            mappingProperties,
            '',
            FIELDS_CONVERSION_MAP['distinctFields'],
            []
          ),
          numericFields: getFields(
            mappingProperties,
            '',
            FIELDS_CONVERSION_MAP['numericFields'],
            []
          ),
          categoryFields: getFields(
            mappingProperties,
            '',
            FIELDS_CONVERSION_MAP['categoryFields'],
            []
          ),
        },
      });
    });

    dispatch(updateMappings({ [url]: indexWisePropertiesObj }));
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      dispatch(
        updateCurrentTabConfig({
          errorMessage: '',
          // 'Failed to fetch mappings\n' + error.name + ': ' + error.message,
          // response: '',
        })
      );
    }
  }
};
