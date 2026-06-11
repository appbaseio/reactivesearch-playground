export const PLAYGROUND_DOMAIN_NAME = 'https://play.reactivesearch.io';

export const FIRE_STORE_COLLECTION_NAME = 'rs-playground';

export const DEAFULT_STORE_PERSIST_KEY = 'rs-playground-root';

export const METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  COPY: 'COPY',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
};

export const INITIAL_TAB_CONFIG = {
  tabTitle: '',
  url: '', // usually reactivesearch url
  headers: '',
  query_variables: {}, // keep this empty for now as part of v2
  body: ['{', '    "query": [{\n\n\t}],', '    "settings": {\n\n\t}', '}'].join(
    '\n'
  ), // request body
  clusterURL: '',
  indexName: '',
  isValidUrl: false,
  errorMessage: '',
  response: '',
  responseContentType: '',
  method: METHODS.POST,
  responseStatusCode: '',
  isFetching: false,
  schema: null,
};

export const DEFAULT_CONFIGURATION_SETTINGS = {
  'components.showURLInput': true, // if false, don't show urlinput
  // 'components.showMethodDropdown': true, // if false, don't show method dropdown
  'components.showTabs': true,
  'components.showHeaders': true,
  'components.showMethod': true,
  // 'components.showQueryVariables': false,
  'components.showSettings': true,
  'components.showCopyCURL': true,
  'editor.cursorShape': 'line',
  'editor.fontFamily': 'Monaco, monospace',
  'editor.fontSize': 14,
  'editor.reuseHeaders': true,
  'editor.theme': 'dark',
  'general.betaUpdates': false,
  // 'prettier.printWidth': 80,
  // 'prettier.tabWidth': 2,
  // 'prettier.useTabs': false,
  'request.credentials': 'omit',
  'schema.polling.enable': false,
  'schema.polling.interval': 10000,
};

export const SHORT_CONFIGURATION_NAME_ALIASES: Record<string, any> = {
  'components.showURLInput': 'showUrl',
  // 'components.showMethodDropdown': 'showMethodDropdown',
  'components.showTabs': 'showTabs',
  'components.showHeaders': 'showHeaders',
  'components.showMethod': 'showMethod',
  // 'components.showQueryVariables': 'showQueryVariables',
  'components.showSettings': 'showSettings',
  'components.showCopyCURL': 'showCopyCURL',
  'editor.cursorShape': 'cursor',
  'editor.fontFamily': 'fontFamily',
  'editor.fontSize': 'fontSize',
  'editor.reuseHeaders': 'reuseHeaders',
  'editor.theme': 'theme',
  'general.betaUpdates': 'betaUpdates',
  // 'prettier.printWidth': 'printWidth',
  // 'prettier.tabWidth': 'tabWidth',
  // 'prettier.useTabs': 'useTabs',
  'request.credentials': 'credentials',
  'schema.polling.enable': 'enablePolling',
  'schema.polling.interval': 'pollingInterval',
};

export const REVERSE_SHORT_CONFIGURATION_NAME_ALIASES: Record<
  string,
  string
> = {
  showUrl: 'components.showURLInput',
  // showMethodDropdown: 'components.showMethodDropdown',
  showTabs: 'components.showTabs',
  showHeaders: 'components.showHeaders',
  showMethod: 'components.showMethod',
  // showQueryVariables: 'components.showQueryVariables',
  showSettings: 'components.showSettings',
  showCopyCURL: 'components.showCopyCURL',
  cursor: 'editor.cursorShape',
  fontFamily: 'editor.fontFamily',
  fontSize: 'editor.fontSize',
  reuseHeaders: 'editor.reuseHeaders',
  theme: 'editor.theme',
  betaUpdates: 'general.betaUpdates',
  // printWidth: 'prettier.printWidth',
  // tabWidth: 'prettier.tabWidth',
  // useTabs: 'prettier.useTabs',
  credentials: 'request.credentials',
  enablePolling: 'schema.polling.enable',
  pollingInterval: 'schema.polling.interval',
};

export const defaultEditorConfig = {
  defaultLanguage: 'json',
  defaultValue: '{}',
  theme: 'vs-dark',
  height: '100%',
  options: {
    cursorStyle: 'line',
    lineNumbersMinChars: 5,
    fontFamily: "Monaco', monospace",
    fontSize: 14,
    suggestFontSize: 14,
    padding: {
      top: 10,
      bottom: 10,
    },
    minimap: {
      enabled: false,
    },
  },
};

export const FIELDS_CONVERSION_MAP = {
  booleanFields: ['boolean'],
  numericFields: ['integer', 'long', 'float', 'double', 'date'],
  searchableFields: ['text', 'keyword', 'boolean'],
  rankFeatureFields: ['rank_feature'],
  rangeFields: ['text'],
  categoryFields: ['keyword'],
  nestedFields: ['nested'],
  geoFields: ['geo_point'],
  /* tslint:disable-next-line */
  get distinctFields() {
    return ['keyword', ...this.numericFields];
  },
  /* tslint:disable-next-line */
  get aggregatableFields() {
    return ['keyword', 'boolean', ...this.numericFields];
  },
};
