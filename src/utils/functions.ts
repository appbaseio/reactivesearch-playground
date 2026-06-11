import {
  DEAFULT_STORE_PERSIST_KEY,
  PLAYGROUND_DOMAIN_NAME,
  REVERSE_SHORT_CONFIGURATION_NAME_ALIASES,
  SHORT_CONFIGURATION_NAME_ALIASES,
  METHODS,
} from './constants';

interface LooseObject {
  [key: string]: any;
}

export const convertNdJsonToJsonObject = (ndJsonText: string) => {
  const separatedViaNewLine = ndJsonText.split('\n');
  const objectsArray = separatedViaNewLine
    .slice(0, separatedViaNewLine.length - 1)
    .map(stringifiedJsonObj => JSON.parse(stringifiedJsonObj));
  return objectsArray;
};

export const hitApi = async (
  endpoint: string,
  method?: string,
  headers?: LooseObject,
  body?: string,
  abortController?: AbortController
) => {
  let response: any;
  try {
    response = await fetch(endpoint, {
      method: method,
      headers,
      ...(method !== METHODS.GET && body && { body: body }),
      ...(abortController && { signal: abortController.signal }),
    });
    const responseContentType = response.headers.get('content-type');
    const responseStatusCode = response.status;
    return response
      .clone()
      .json()
      .then((response: any) => {
        return { response, responseContentType, responseStatusCode };
      })
      .catch(() => {
        console.log('response type is not json');
        return response.text().then((text: any) => {
          return {
            response: convertNdJsonToJsonObject(text),
            responseContentType,
            responseStatusCode,
          };
        });
      });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log(error, 'Fetch request has been canceled');
    } else {
      console.error('Error:', error);
    }
    response = error;
    throw error;
  }
};

export const constructMappingsEndpoint = (
  clusterURL: string,
  indexName: string
) => {
  return clusterURL + '/' + indexName + '/_mapping/';
};
export const constructStoredQueriesEndpoint = (clusterURL: string) => {
  return clusterURL + '/_storedqueries';
};

export const constructSchemaEndpoint = (clusterURL: string) => {
  return clusterURL + '/_reactivesearch/schema';
};

export const getFields = (
  mappingsObject: Record<string, any>,
  prefix: string = '',
  fieldTypesToInclude: string[],
  fieldTypesToExclude: string[]
): string[] => {
  const fields: string[] = [];
  !!mappingsObject &&
    Object.keys(mappingsObject).forEach(propertyName => {
      if (fieldTypesToInclude.includes(mappingsObject[propertyName].type)) {
        fields.push(prefix + propertyName);
      }
      if (!fieldTypesToExclude.includes(mappingsObject[propertyName].type)) {
        if (
          mappingsObject[propertyName]?.fields &&
          Object.keys(mappingsObject[propertyName]?.fields)?.length
        ) {
          fields.push(
            ...getFields(
              mappingsObject[propertyName].fields,
              propertyName + '.',
              fieldTypesToInclude,
              fieldTypesToExclude
            )
          );
        }

        if (
          mappingsObject[propertyName]?.properties &&
          Object.keys(mappingsObject[propertyName]?.properties)?.length
        ) {
          fields.push(
            ...getFields(
              mappingsObject[propertyName].properties,
              propertyName + '.',
              fieldTypesToInclude,
              fieldTypesToExclude
            )
          );
        }
      }
    });
  return fields;
};

export const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

export const validateUrlHealth = async (clusterURL: string) => {
  try {
    return (await fetch(`${clusterURL}`)).status === 200 ? true : false;
  } catch (error) {
    console.log('URL_HEALTH_ERROR\n', error);
    return false;
  }
};

export const filterOutSingleFields = (fieldsArray: string[]) => {
  if (!fieldsArray.length) return [];
  return fieldsArray.filter(field => !field.includes('.'));
};

export const subtractOutFields = (
  minuendFieldsArray: string[],
  subtrahendFieldsArray: string[]
) => {
  if (!minuendFieldsArray.length || !subtrahendFieldsArray.length)
    return minuendFieldsArray;

  return minuendFieldsArray.filter(
    field => !subtrahendFieldsArray.includes(field)
  );
};

export const getSchema = (
  fieldsObj: Record<string, string[]>,
  storedQueries: Record<string, string[]>[],
  modelUri: string,
  schemaFromAPI?: Record<string, any> | null
) => {
  const {
    rankFeatureFields = [],
    searchableFields = [],
    aggregatableFields = [],
    // rangeFields = [],
    geoFields = [],
    nestedFields = [],
    distinctFields = [],
    numericFields = [],
    categoryFields = [],
    booleanFields = [],
    includeFields = [],
    excludeFields = [],
  } = fieldsObj;

  const storedQueriesIds = () => {
    return storedQueries.map(item => item.id);
  };

  const conditionalStoredQueryParamsObject = () => {
    const paramsObjectsArr: Object[] = [];
    storedQueries.forEach(({ id, params, description }) => {
      paramsObjectsArr.push({
        if: {
          properties: {
            id: {
              const: id,
            },
          },
          required: ['id'],
        },
        then: {
          properties: {
            params: {
              type: 'object',
              markdownDescription: 'Params accepted by the Stored Query.',
              default: params,
            },
            id: {
              markdownDescription: description,
            },
          },
        },
      });
    });

    return paramsObjectsArr;
  };

  const dataFieldSearchableFields = subtractOutFields(
    searchableFields,
    booleanFields
  );

  const dataFieldAggregatableFields = subtractOutFields(
    aggregatableFields,
    booleanFields
  );

  const querySchemaPropertiesFromApiSchema =
    schemaFromAPI?.properties?.query?.items?.properties ?? {};
  const rankFeatureProperties: Record<string, any> = {};
  for (const key of rankFeatureFields) {
    const rankFeaturePropertiesFromApi =
      querySchemaPropertiesFromApiSchema?.rankFeature?.patternProperties?.['.*']
        ?.properties ?? {};
    rankFeatureProperties[key] = {
      type: 'object',
      properties: {
        boost: {
          type: 'number',
          maximum: 1,
          minimum: 0,
          default: 1,
          markdownDescription:
            "`boost` [optional] A floating point number (shouldn't be negative) that is used to decrease (if the value is between 0 and 1) or increase relevance scores (if the value is greater than 1). Defaults to 1.",
          ...(rankFeaturePropertiesFromApi?.boost ?? {}),
        },
        saturation: {
          type: 'object',
          properties: {
            ...(rankFeaturePropertiesFromApi?.saturation?.properties ?? {}),
            pivot: {
              type: 'number',
              exclusiveMinimum: 0,
              markdownDescription:
                '- `function_object` The function object can be used to override the default values for functions. \n - `saturation` function supports the `pivot` property that must be greater than zero.',
              ...(rankFeaturePropertiesFromApi?.saturation?.properties?.pivot ??
                {}),
            },
          },
          markdownDescription:
            '`function_name` To calculate relevance scores based on rank feature fields, the rank_feature query supports the following mathematical functions: \n - [saturation](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-rank-feature-query.html#rank-feature-query-saturation) \n - [log](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-rank-feature-query.html#rank-feature-query-logarithm) \n -[sigmoid](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-rank-feature-query.html#rank-feature-query-sigmoid)',
          default: {
            pivot: 0.5,
          },
        },
        log: {
          type: 'object',
          properties: {
            ...(rankFeaturePropertiesFromApi?.log?.properties ?? {}),
            scaling_factor: {
              type: 'number',
              minimum: 1,
              default: 1,
              ...(rankFeaturePropertiesFromApi?.log?.properties
                ?.scaling_factor ?? {}),
            },
            markdownDescription:
              '- `function_object` The function object can be used to override the default values for functions. \n - `log` function supports the `scaling_factor` property',
          },
          markdownDescription:
            '`function_name` To calculate relevance scores based on rank feature fields, the rank_feature query supports the following mathematical functions: \n - [saturation](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-rank-feature-query.html#rank-feature-query-saturation) \n - [log](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-rank-feature-query.html#rank-feature-query-logarithm) \n -[sigmoid](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-rank-feature-query.html#rank-feature-query-sigmoid)',
        },
        sigmoid: {
          type: 'object',
          markdownDescription:
            '- `function_object` The function object can be used to override the default values for functions. \n - `sigmoid` function supports `pivot` and `exponent`[must be positive] properties',
          ...(rankFeaturePropertiesFromApi?.sigmoid?.properties ?? {}),
          properties: {
            pivot: {
              type: 'number',
              exclusiveMinimum: 0,
              default: 0.1,
              ...(rankFeaturePropertiesFromApi?.sigmoid?.properties?.pivot ??
                {}),
            },
            exponent: {
              type: 'number',
              exclusiveMinimum: 0,
              default: 0.1,
              ...(rankFeaturePropertiesFromApi?.sigmoid?.properties?.exponent ??
                {}),
            },
          },
        },
      },
      markdownDescription:
        '`field_name` It represents the `dataField` that has the `rank_feature` or `rank_features` mapping.',
    };
  }

  const DEFAULT = {
    ...(querySchemaPropertiesFromApiSchema ?? {}),
    aggregationField: {
      markdownDescription:
        '`aggregationField` enables you to get `DISTINCT` results (useful when you are dealing with sessions, events, and logs type data). It utilizes [composite aggregations](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-composite-aggregation.html) which are newly introduced in ES v6 and offer vast performance benefits over a traditional terms aggregation. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#aggregationfield)',
      default: '',
      ...(querySchemaPropertiesFromApiSchema.aggregationField ?? {}),
      enum: [...aggregatableFields],
    },
    highlightField: {
      type: 'array',
      uniqueItems: true,
      markdownDescription:
        'When highlighting is `enabled`, this property allows specifying the fields which should be returned with the matching highlights. When not specified, it defaults to apply highlights on the field(s) specified in the `dataField` prop. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#highlightfield)',
      default: [searchableFields?.[0] || ''],
      ...(querySchemaPropertiesFromApiSchema.highlightField ?? {}),
      items: {
        type: 'string',
        ...(querySchemaPropertiesFromApiSchema.highlightField?.items ?? {}),
        enum: searchableFields,
      },
    },

    includeFields: {
      type: 'array',
      uniqueItems: true,
      markdownDescription:
        'Data fields to be included in search results. Defaults to `[*]` which means all fields are included. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#includefields)',
      default: ['*'],
      ...(querySchemaPropertiesFromApiSchema?.includeFields ?? {}),
      items: {
        type: 'string',
        ...(querySchemaPropertiesFromApiSchema?.includeFields?.items ?? {}),
        enum: ['*', ...includeFields],
      },
    },
    excludeFields: {
      type: 'array',
      uniqueItems: true,
      markdownDescription:
        'Data fields to be excluded in search results. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#excludefields)',
      default: [''],
      ...(querySchemaPropertiesFromApiSchema?.excludeFields ?? {}),
      items: {
        type: 'string',
        ...(querySchemaPropertiesFromApiSchema?.excludeFields?.items ?? {}),
        enum: ['*', ...excludeFields],
      },
    },
    nestedField: {
      type: 'string',
      markdownDescription:
        'Set the path of the nested type under which the `dataField` is present. Only applicable only when the field(s) specified in the `dataField` is(are) present under a nested type mapping. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#nestedfield)',
      default: '',
      ...(querySchemaPropertiesFromApiSchema?.nestedField ?? {}),
      enum: nestedFields,
    },
    distinctField: {
      type: 'string',
      markdownDescription:
        'This property returns only the distinct value documents for the specified field. It is equivalent to the `DISTINCT` clause in SQL. It internally uses the collapse feature of Elasticsearch. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#distinctfield)',
      default: '',
      ...(querySchemaPropertiesFromApiSchema?.distinctField ?? {}),
      enum: distinctFields,
    },
    dataField: {
      // make enum of searchable fields based on mappings
      type: 'array',
      uniqueItems: true,
      items: {
        anyOf: [
          {
            type: 'object',
            properties: {
              field: {
                type: 'string',
                minLength: 2,
                enum: dataFieldSearchableFields,
                default: dataFieldSearchableFields?.[0] || '',
              },
              weight: {
                type: 'number',
                minimum: 0,
                default: 1,
              },
            },
          },
          {
            type: 'string',
            enum: dataFieldSearchableFields,
          },
        ],
      },
      markdownDescription:
        'database field(s) to be queried against. Accepts an `Array`, useful for applying search across multiple fields. \n > Note: \n > Multiple `dataFields` are not applicable for `term` and `geo` queries. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference#dataField)',
      default: [
        {
          field: '',
          weight: 1,
        },
      ],
      ...(querySchemaPropertiesFromApiSchema?.dataField ?? {}),
    },
  };
  return [
    {
      uri: 'http://myserver/root-schema.json', // id of the first schema
      fileMatch: [modelUri.toString()], // associate with our model
      schema: {
        ...(schemaFromAPI ?? {}),
        type: 'object',
        properties: {
          ...(schemaFromAPI?.properties ?? {}),
          query: {
            markdownDescription:
              'ReactiveSearch API request body can be divided into two parts, query and settings. The query key is an Array of objects where each object represents a ReactiveSearch query to retrieve the results. \n[Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#query-properties)',
            type: 'array',
            uniqueItems: true,
            default: [{}],
            ...(schemaFromAPI?.properties?.query ?? {}),
            items: {
              $ref: 'http://myserver/query-schema.json',
            },
          },
          settings: {
            markdownDescription:
              'ReactiveSearch API request body can be divided into two parts, query and settings. Settings(settings) is an optional key which can be used to control the search experience. Here is an example of the request body of ReactiveSearch API to get the results for which the title field matches with iphone. ',
            $ref: 'http://myserver/settings-schema.json',
          },
        },
        additionalProperties: false,
      },
    },
    {
      uri: 'http://myserver/query-schema.json',
      schema: {
        type: 'object',
        required: ['id'],
        properties: DEFAULT,

        oneOf: [
          {
            allOf: [
              {
                if: {
                  properties: {
                    type: {
                      const: 'search',
                    },
                  },
                },
                then: {
                  properties: {
                    dataField: {
                      // make enum of searchable fields based on mappings
                      type: 'array',
                      uniqueItems: true,
                      items: {
                        anyOf: [
                          {
                            type: 'object',
                            properties: {
                              field: {
                                type: 'string',
                                minLength: 2,
                                enum: dataFieldSearchableFields,
                                default: dataFieldSearchableFields?.[0] || '',
                              },
                              weight: {
                                type: 'number',
                                minimum: 0,
                                default: 1,
                              },
                            },
                          },
                          {
                            type: 'string',
                            enum: dataFieldSearchableFields,
                          },
                        ],
                      },
                      markdownDescription:
                        'database field(s) to be queried against. Accepts an `Array`, useful for applying search across multiple fields. \n > Note: \n > Multiple `dataFields` are not applicable for `term` and `geo` queries. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference#dataField)',
                      default: [
                        {
                          field: '',
                          weight: 1,
                        },
                      ],
                    },
                    fieldWeights: {
                      type: 'array',
                      uniqueItems: true,
                      items: {
                        type: 'number',
                        minimum: 0,
                      },
                      markdownDescription:
                        'To set the search weight for the database fields, useful when you are using more than one [dataField](/docs/search/reactivesearch-api/reference/#datafield). This prop accepts an array of `floats`. A higher number implies a higher relevance weight for the corresponding field in the search results. \n - Applicable on query of type : "search" \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference#feidlWeight)',
                      default: [1],
                    },
                    value: {
                      markdownDescription:
                        'Represents the value for a particular query [type](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#type), each kind of query has the different type of value format. \n 1. [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference#value) \n 2. You can check the value format for different type of queries: \n - #### format for `search` type \n The value can be a `string` or `int`. \n - #### format for `term` type \n The value can be a `string` or `Array<string>`. \n - #### format for `range/ geo` type \n The value should be an Object. ',
                      default: '',
                      ...(querySchemaPropertiesFromApiSchema?.value ?? {}),
                      type: ['string', 'integer'],
                    },
                    categoryField: {
                      type: 'string',
                      markdownDescription:
                        'Data field which has the category values mapped. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#categoryfield)',
                      default: '',
                      ...(querySchemaPropertiesFromApiSchema?.categoryField ??
                        {}),
                      enum: categoryFields,
                    },
                    categoryValue: {
                      type: 'string',
                      markdownDescription:
                        'This is the selected category value. It is used for informing the search result. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference#categoryvalue)',
                      default: '',
                      ...(querySchemaPropertiesFromApiSchema?.categoryValue ??
                        {}),
                    },
                    searchOperators: {
                      type: 'boolean',
                      markdownDescription:
                        'Defaults to `false`. If set to `true` then you can use special characters in the search query to enable an advanced search behavior. Read more about it [here](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-simple-query-string-query.html). \n - Note: \n >  If both properties `searchOperators` and `queryString` are set to true then `queryString` will have the priority over `searchOperators`. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#searchoperators)',
                      default: false,
                      ...(querySchemaPropertiesFromApiSchema?.searchOperators ??
                        {}),
                    },
                    queryString: {
                      type: 'boolean',
                      markdownDescription:
                        'Defaults to `false`. If set to `true` than it allows you to create a complex search that includes wildcard characters, searches across multiple fields, and more. Read more about it [here](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html). \n - Note: \n >  If both properties `searchOperators` and `queryString` are set to true then `queryString` will have the priority over `searchOperators`. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#querystring) \n - Note: If both properties `searchOperators` and `queryString` are set to `true` then `queryString` will have the priority over `searchOperators`.',
                      default: false,
                      ...(querySchemaPropertiesFromApiSchema?.queryString ??
                        {}),
                    },
                    enableSynonyms: {
                      type: 'boolean',
                      default: true,
                      markdownDescription:
                        'This property can be used to control (enable/disable) the synonyms behavior for a particular query. Defaults to true, if set to false then fields having .synonyms suffix will not affect the query. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#enablesynonyms)',
                      ...(querySchemaPropertiesFromApiSchema?.enableSynonyms ??
                        {}),
                    },
                    rankFeature: {
                      type: 'object',
                      markdownDescription:
                        'This property allows you to define the [Elasticsearch rank feature query](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-rank-feature-query.html#query-dsl-rank-feature-query) to boost the relevance score of documents based on the `rank_feature` fields. \n\nThe `rankFeature` object must be in the following shape: \n ```ts \n { \n \t"field_name": { \n  \t "boost": 1.0 // or <any number>, \n   \t"function_name": "function_object"\n \t} \n} \n ``` \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#rankfeature)',
                      default: {
                        '': {},
                      },
                      ...(querySchemaPropertiesFromApiSchema?.rankFeature ??
                        {}),
                      properties: {
                        ...rankFeatureProperties,
                      },
                    },
                  },
                },
              },
              {
                if: {
                  properties: {
                    type: {
                      const: 'term',
                    },
                  },
                  required: ['type'],
                },
                then: {
                  properties: {
                    dataField: {
                      // make enum of searchable fields based on mappings
                      type: 'array',
                      maxItems: 1,
                      uniqueItems: true,
                      markdownDescription:
                        'database field(s) to be queried against. Accepts an `Array`, useful for applying search across multiple fields. \n > Note: \n > Multiple `dataFields` are not applicable for `term` and `geo` queries. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference#dataField)',
                      default: [''],
                      ...(querySchemaPropertiesFromApiSchema?.dataField ?? {}),
                      items: {
                        type: 'string',
                        enum: dataFieldAggregatableFields,
                      },
                    },
                    value: {
                      markdownDescription:
                        'Represents the value for a particular query [type](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#type), each kind of query has the different type of value format. \n 1. [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference#value) \n 2. You can check the value format for different type of queries: \n - #### format for `search` type \n The value can be a `string` or `int`. \n - #### format for `term` type \n The value can be a `string` or `Array<string>`. \n - #### format for `range/ geo` type \n The value should be an Object. ',
                      default: [''],
                      ...(querySchemaPropertiesFromApiSchema?.value ?? {}),
                      oneOf: [
                        {
                          type: 'string',
                        },
                        {
                          type: 'array',
                          uniqueItems: true,
                          items: {
                            type: 'string',
                          },
                        },
                      ],
                    },
                    pagination: {
                      type: 'boolean',
                      default: false,
                      markdownDescription:
                        "This property allows you to implement the `pagination` for `term` type of queries. If `pagination` is set to `true` then appbase will use the [composite aggregations](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-composite-aggregation.html) of Elasticsearch instead of [terms aggregations](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html). \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#pagination) \n - Note: \n > 1. Sort by as `count` doesn't work with composite aggregations i.e when `pagination` is set to `true`. \n > 2. The [missingLabel](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#missinglabel) property also won't work when composite aggregations have been used.",
                      ...(querySchemaPropertiesFromApiSchema?.pagination ?? {}),
                    },
                    showMissing: {
                      type: 'boolean',
                      markdownDescription:
                        "Defaults to `false`. When set to `true` then it also retrieves the aggregations for missing fields. \n - [Docs Reference]('https://docs.appbase.io/docs/search/reactivesearch-api/reference/#showmissing')",
                      default: false,
                      ...(querySchemaPropertiesFromApiSchema?.showMissing ??
                        {}),
                    },
                    missingLabel: {
                      type: 'string',
                      markdownDescription:
                        'Defaults to `N/A`. It allows you to specify a custom label to show when [showMissing](/docs/search/reactivesearch-api/reference/#showmissing) is set to `true`. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#missinglabel)',
                      default: 'N/A',
                      ...(querySchemaPropertiesFromApiSchema?.missingLabel ??
                        {}),
                    },
                    selectAllLabel: {
                      type: 'string',
                      default: '',
                      markdownDescription:
                        'This property allows you to add a new property in the list with a particular value in such a way that when selected i.e `value` is similar/contains to that label(`selectAllLabel`) then `term` query will make sure that the `field` exists in the `results`. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#selectalllabel)',
                      ...(querySchemaPropertiesFromApiSchema?.selectAllLabel ??
                        {}),
                    },
                  },
                },
              },
              {
                if: {
                  properties: {
                    type: {
                      const: 'range',
                    },
                  },
                  required: ['type'],
                },
                then: {
                  properties: {
                    dataField: {
                      // make enum of searchable fields based on mappings
                      type: 'array',
                      uniqueItems: true,
                      markdownDescription:
                        'database field(s) to be queried against. Accepts an `Array`, useful for applying search across multiple fields. \n > Note: \n > Multiple `dataFields` are not applicable for `term` and `geo` queries. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference#dataField)',
                      default: [''],
                      ...(querySchemaPropertiesFromApiSchema?.dataField ?? {}),
                      items: {
                        // type: 'string',
                        enum: numericFields,
                      },
                    },
                    value: {
                      markdownDescription:
                        'Represents the value for a particular query [type](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#type), each kind of query has the different type of value format. \n 1. [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference#value) \n 2. You can check the value format for different type of queries: \n - #### format for `search` type \n The value can be a `string` or `int`. \n - #### format for `term` type \n The value can be a `string` or `Array<string>`. \n - #### format for `range/ geo` type \n The value should be an Object. ',
                      ...(querySchemaPropertiesFromApiSchema?.value ?? {}),
                      type: 'object',
                      required: ['boost'],
                      properties: {
                        oneOf: [
                          {
                            start: {
                              type: ['string', 'integer'],
                            },
                          },
                          {
                            end: {
                              type: ['string', 'integer'],
                            },
                          },
                        ],
                        boost: {
                          type: 'number',
                          default: 1,
                          markdownDescription:
                            "boost [optional] A floating point number (shouldn't be negative) that is used to decrease (if the value is between 0 and 1) or increase relevance scores (if the value is greater than 1). Defaults to 1.",
                        },
                      },
                      default: {
                        start: '', // optional
                        end: '', // optional
                        boost: 0,
                      },
                    },
                    from: {
                      type: 'number',
                      markdownDescription:
                        'Starting document offset. Defaults to 0. \n - Applicable on query of type: `search`, `geo`, `range`. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#from)',
                      default: 0,
                      ...(querySchemaPropertiesFromApiSchema?.from ?? {}),
                    },
                    includeNullValues: {
                      type: 'boolean',
                      default: false,
                      markdownDescription:
                        'If you have sparse data or documents or items not having the value in the specified field or mapping, then this prop enables you to show that data. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#includenullvalues)',
                      ...(querySchemaPropertiesFromApiSchema?.includeNullValues ??
                        {}),
                    },
                    aggregations: {
                      // arrays can't have unique items: https://stackoverflow.com/a/24990295/10822996
                      type: 'array',
                      markdownDescription:
                        'It helps you to utilize the built-in aggregations for `range` type of queries directly, valid values are: \n - `max`: to retrieve the maximum value for a `dataField`, \n - `min`: to retrieve the minimum value for a `dataField`, \n - `histogram`: to retrieve the histogram aggregations for a particular `interval` \n \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#aggregations)',
                      uniqueItems: true,
                      ...(querySchemaPropertiesFromApiSchema?.aggregations ??
                        {}),
                      items: {
                        type: 'string',
                        ...(querySchemaPropertiesFromApiSchema?.aggregations
                          ?.items ?? {}),
                        enum: ['max', 'min', 'histogram'],
                      },
                      default: ['max'],
                    },
                  },
                },
              },
              {
                if: {
                  properties: {
                    type: {
                      const: 'geo',
                    },
                  },
                  required: ['type'],
                },
                then: {
                  properties: {
                    dataField: {
                      // make enum of searchable fields based on mappings
                      type: 'array',
                      maxItems: 1,
                      uniqueItems: true,
                      markdownDescription:
                        'database field(s) to be queried against. Accepts an `Array`, useful for applying search across multiple fields. \n > Note: \n > Multiple `dataFields` are not applicable for `term` and `geo` queries. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference#dataField)',
                      ...(querySchemaPropertiesFromApiSchema?.dataField ?? {}),
                      items: {
                        type: 'string',
                        enum: geoFields,
                      },
                      default: [''],
                    },
                    value: {
                      ...(querySchemaPropertiesFromApiSchema?.value ?? {}),
                      type: 'object',
                      properties: {
                        distance: {
                          type: 'integer',
                          markdownDescription: '`distance` must be an integer',
                          default: 0,
                        },
                        location: {
                          type: 'string',
                          markdownDescription:
                            'must be in `{lat}, {lon}` format',
                          default: '',
                        },
                        geoBoundingBox: {
                          topLeft: {
                            type: 'string',
                            pattern:
                              '^()([-+]?)([d]{1,2})(((.)(d+)(,)))(s*)(([-+]?)([d]{1,3})((.)(d+))?())$',
                            markdownDescription:
                              'must be in `{lat}, {lon}` format',
                            default: '',
                          }, // required, must be in `{lat}, {lon}` format
                          bottomRight: {
                            type: 'string',
                            pattern:
                              '^()([-+]?)([d]{1,2})(((.)(d+)(,)))(s*)(([-+]?)([d]{1,3})((.)(d+))?())$',
                            markdownDescription:
                              'must be in `{lat}, {lon}` format',
                            default: '',
                          }, // required, must be in `{lat}, {lon}` format
                        },
                        unit: {
                          type: 'string',
                          default: '',
                          markdownDescription: 'must be a string',
                        },
                      },
                      markdownDescription:
                        '\n - Represents the value for a particular query [type](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#type), each kind of query has the different type of value format. - Note: \n > The `geoBoundingBox` property can not be used with `location` property, if both are defined than `geoBoundingBox` value will be ignored. \n 1. [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference#value) \n 2. You can check the value format for different type of queries: \n - #### format for `search` type \n The value can be a `string` or `int`. \n - #### format for `term` type \n The value can be a `string` or `Array<string>`. \n - #### format for `range/ geo` type \n The value should be an Object. \n ',
                      default: {
                        // The following properties can be used to get the results within a particular distance and location.
                        distance: 0,
                        location: '', // must be in `{lat}, {lon}` format
                        unit: '',
                      },
                    },
                    from: {
                      type: 'number',
                      markdownDescription:
                        'Starting document offset. Defaults to 0. \n - Applicable on query of type: `search`, `geo`, `range`. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#from)',
                      default: 0,
                      ...(querySchemaPropertiesFromApiSchema?.from ?? {}),
                    },
                  },
                },
              },
              {
                if: {
                  properties: {
                    type: {
                      const: 'suggestion',
                    },
                  },
                },
                then: {
                  properties: {
                    categoryField: {
                      type: 'string',
                      markdownDescription:
                        'Data field which has the category values mapped. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#categoryfield)',
                      default: '',
                      ...(querySchemaPropertiesFromApiSchema?.categoryField ??
                        {}),
                      enum: categoryFields,
                    },
                    categoryValue: {
                      type: 'string',
                      markdownDescription:
                        'This is the selected category value. It is used for informing the search result. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference#categoryvalue)',
                      default: '',
                      ...(querySchemaPropertiesFromApiSchema?.categoryValue ??
                        {}),
                    },
                    showDistinctSuggestions: {
                      type: 'boolean',
                      default: false,
                      markdownDescription:
                        'Defaults to `false`, when set to `true` all the suggestions shown are distinct. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference#showdistinctsuggestions)',
                      ...(querySchemaPropertiesFromApiSchema?.showDistinctSuggestions ??
                        {}),
                    },
                    customStopwords: {
                      type: 'array',
                      default: [''],
                      ...(querySchemaPropertiesFromApiSchema?.customStopwords ??
                        {}),
                      items: {
                        type: 'string',
                        ...(querySchemaPropertiesFromApiSchema?.customStopwords
                          ?.items ?? {}),
                      },
                    },
                    enablePredictiveSuggestions: {
                      type: 'boolean',
                      default: false,
                      markdownDescription:
                        "When set to true, it predicts the next relevant words from the value of a field based on the search query typed by the user. When set to false (default), the matching document field's value would be displayed. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#enablepredictivesuggestions)",
                      ...(querySchemaPropertiesFromApiSchema?.enablePredictiveSuggestions ??
                        {}),
                    },
                    applyStopwords: {
                      type: 'boolean',
                      default: false,
                      markdownDescription:
                        'When set to true, it would not predict a suggestion which starts or ends with a stopword. You can find the list of stopwords used by Appbase at [here](https://github.com/appbaseio/reactivesearch-api/blob/dev/plugins/querytranslate/stopwords.go). \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#applystopwords)',
                      ...(querySchemaPropertiesFromApiSchema?.applyStopwords ??
                        {}),
                    },
                    urlField: {
                      type: 'string',
                      default: '',
                      markdownDescription:
                        "Data field whose value contains a URL. This is a convenience prop that allows returning the URL value in the suggestion's response. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#urlfield)",
                      ...(querySchemaPropertiesFromApiSchema?.urlField ?? {}),
                    },
                    enableRecentSuggestions: {
                      type: 'boolean',
                      default: false,
                      markdownDescription:
                        'When set to `true`, recent searches are returned as suggestions as per the recent suggestions config (either defaults, or as set through `recentSuggestionsConfig` or via Recent Suggestions settings in the control plane). \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#enablerecentsuggestions)',
                      ...(querySchemaPropertiesFromApiSchema?.enableRecentSuggestions ??
                        {}),
                    },

                    enablePopularSuggestions: {
                      type: 'boolean',
                      default: false,
                      markdownDescription:
                        'When set to `true`, popular searches are returned as suggestions as per the popular suggestions config (either defaults, or as set through `popularSuggestionsConfig` or via Popular Suggestions settings in the control plane) \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#enablepopularsuggestions)',
                      ...(querySchemaPropertiesFromApiSchema?.enablePopularSuggestions ??
                        {}),
                    },
                  },
                },
              },
            ],
          },
        ],
        allOf: [
          {
            if: {
              oneOf: [
                {
                  properties: {
                    type: {
                      const: 'search',
                    },
                  },
                  required: ['aggregationField'],
                },
                {
                  properties: {
                    type: {
                      const: 'term',
                    },
                  },
                  required: ['type'],
                },
              ],
            },
            then: {
              properties: {
                aggregationSize: {
                  type: 'number',
                  markdownDescription:
                    'To set the number of buckets to be returned by aggregations. \n - Note: \n > This property can also be used for `search` type of queries when `aggregationField` is set.  \n  > This is a new feature and only available for appbase versions >= 7.41.0. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#aggregationsize)',
                  minimum: 1,
                  default: 5,
                  ...(querySchemaPropertiesFromApiSchema?.aggregationSize ??
                    {}),
                },
              },
            },
          },
          {
            if: {
              properties: {
                queryFormat: {
                  const: 'or',
                },
                type: {
                  const: 'search',
                },
              },
            },
            then: {
              properties: {
                fuzziness: {
                  type: ['string', 'integer'],
                  markdownDescription:
                    'Useful for showing the correct results for an incorrect search parameter by taking the fuzziness into account. For example, with a substitution of one character, `fox` can become `box`. Read more about it in the [elastic search doc ref](https://www.elastic.co/guide/en/elasticsearch/guide/current/fuzziness.html). \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#fuzziness) \n - Note: \n > \n > This property doesn\'t work when the value of [queryFormat](/docs/search/reactivesearch-api/reference/#queryformat) property is set to `and`."',
                  default: 'auto',
                  ...(querySchemaPropertiesFromApiSchema?.fuzziness ?? {}),
                },
              },
            },
          },
          {
            if: {
              properties: {
                pagination: {
                  const: true,
                },
              },
              required: ['pagination'],
            },
            then: {
              properties: {
                sortBy: {
                  enum: ['asc', 'desc'],
                  markdownDescription:
                    "This property can be used to sort the results in a particular format. The valid values are: \n - `asc`, sorts the results in ascending order, \n - `desc`, sorts the results in descending order, \n - `count`, sorts the aggregations by `count`. \n > Note: \n > \n > Please note that the `count` value can only be applied when the query type is of `term`. In addition, the [pagination](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#pagination) property for the query needs to be set to `false` (default behavior). When pagination is `true`, a composite aggregation is used under the hood, which doesn't support ordering by count.  \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#sortby)",
                  ...(querySchemaPropertiesFromApiSchema?.sortBy ?? {}),
                },
                after: {
                  type: 'object',
                  markdownDescription:
                    "This property can be used to implement the pagination for `aggregations`. We use the [composite aggregations](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-composite-aggregation.html) of `Elasticsearch` to execute the aggregations' query, the response of composite aggregations includes a key named `after_key` which can be used to fetch the next set of aggregations for the same query. You can read more about the pagination for composite aggregations at [here](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-composite-aggregation.html#_pagination). \n > You need to define the `after` property in the next request to retrieve the next set of aggregations. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#after)",
                  default: {},
                  ...(querySchemaPropertiesFromApiSchema?.after ?? {}),
                },
              },
            },
            else: {},
          },
          {
            if: {
              not: {
                properties: {
                  type: {
                    const: 'term',
                  },
                },
              },
              required: ['type'],
            },
            then: {
              properties: {
                sortBy: {
                  enum: ['asc', 'desc'],
                  markdownDescription:
                    "This property can be used to sort the results in a particular format. The valid values are: \n - `asc`, sorts the results in ascending order, \n - `desc`, sorts the results in descending order, \n - `count`, sorts the aggregations by `count`. \n > Note: \n > \n > Please note that the `count` value can only be applied when the query type is of `term`. In addition, the [pagination](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#pagination) property for the query needs to be set to `false` (default behavior). When pagination is `true`, a composite aggregation is used under the hood, which doesn't support ordering by count.  \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#sortby)",
                  ...(querySchemaPropertiesFromApiSchema?.sortBy ?? {}),
                },
              },
            },
          },
          {
            if: {
              properties: {
                aggregations: {
                  contains: { enum: ['histogram'] },
                },
                type: {
                  const: 'range',
                },
              },
              required: ['aggregations', 'type'],
            },
            then: {
              properties: {
                interval: {
                  type: 'integer',
                  markdownDescription:
                    'To set the histogram bar interval, applicable when [aggregations](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#aggregations) value is set to `["histogram"]`. Defaults to `Math.ceil((range.end - range.start) / 100) || 1`. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#interval)',
                  default: 0,
                  ...(querySchemaPropertiesFromApiSchema?.interval ?? {}),
                },
              },
            },
          },
          {
            if: {
              properties: {
                enablePredictiveSuggestions: {
                  const: true,
                },
              },
              required: ['enablePredictiveSuggestions'],
            },
            then: {
              properties: {
                maxPredictedWords: {
                  type: 'number',
                  default: 2,
                  maximum: 5,
                  minimum: 1,
                  markdownDescription:
                    'Defaults to 2. This property allows configuring the maximum number of relevant words that are predicted. Valid values are between [1, 5]. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#maxpredictedwords)',
                  ...(querySchemaPropertiesFromApiSchema?.maxPredictedWords ??
                    {}),
                },
              },
            },
          },
          {
            if: {
              properties: {
                applyStopwords: {
                  const: true,
                },
              },
              required: ['applyStopwords'],
            },
            then: {
              properties: {
                stopwords: {
                  type: 'array',
                  uniqueItems: true,
                  items: {
                    type: 'string',
                  },
                  default: [''],
                  markdownDescription:
                    'It allows you to define a list of custom stopwords. You can also set it through `Index` settings in the control plane. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#stopwords)',
                  ...(querySchemaPropertiesFromApiSchema?.stopwords ?? {}),
                },
              },
            },
          },
          {
            if: {
              properties: {
                enableRecentSuggestions: {
                  const: true,
                },
              },
              required: ['enableRecentSuggestions'],
            },
            then: {
              properties: {
                recentSuggestionsConfig: {
                  ...(querySchemaPropertiesFromApiSchema?.recentSuggestionsConfig ??
                    {}),
                  type: 'object',
                  properties: {
                    size: {
                      type: 'number',
                      default: 5,
                      markdownDescription:
                        'Maximum number of recent suggestions to return. Defaults to 5.',
                      ...(querySchemaPropertiesFromApiSchema
                        ?.recentSuggestionsConfig?.properties?.size ?? {}),
                    },
                    minHits: {
                      type: 'number',
                      default: 1,
                      markdownDescription:
                        'Return only recent searches that returned at least minHits results. There is no default minimum hits-based restriction.',
                      ...(querySchemaPropertiesFromApiSchema
                        ?.recentSuggestionsConfig?.properties?.minHits ?? {}),
                    },
                    minChars: {
                      type: 'number',
                      default: 1,
                      markdownDescription:
                        'Return only recent suggestions that have minimum characters, as set in this property. There is no default minimum character-based restriction.',
                      ...(querySchemaPropertiesFromApiSchema
                        ?.recentSuggestionsConfig?.properties?.minChars ?? {}),
                    },
                    index: {
                      type: 'string',
                      default: '',
                      markdownDescription:
                        'Index(es) from which to return the recent suggestions from. Defaults to the entire cluster.',
                      ...(querySchemaPropertiesFromApiSchema
                        ?.recentSuggestionsConfig?.properties?.index ?? {}),
                    },
                  },
                  default: {
                    size: 5,
                  },
                  markdownDescription:
                    'Specify additional options for fetching recent suggestions. It can accept the following keys: \n * `size`: number Maximum number of recent suggestions to return. Defaults to 5. \n * `minHits`: number Return only recent searches that returned at least `minHits` results. There is no default minimum hits-based restriction. \n * `minChars`: number Return only recent suggestions that have minimum characters, as set in this property. There is no default minimum character-based restriction. \n * `index`: string Index(es) from which to return the recent suggestions from. Defaults to the entire cluster. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#recentsuggestionsconfig)',
                },
              },
            },
          },
          {
            if: {
              properties: {
                enablePopularSuggestions: {
                  const: true,
                },
              },
              required: ['enablePopularSuggestions'],
            },
            then: {
              properties: {
                popularSuggestionsConfig: {
                  ...(querySchemaPropertiesFromApiSchema?.popularSuggestionsConfig ??
                    {}),
                  type: 'object',
                  properties: {
                    size: {
                      type: 'number',
                      default: 5,
                      markdownDescription:
                        'Maximum number of popular suggestions to return. Defaults to 5.',
                      ...(querySchemaPropertiesFromApiSchema
                        ?.popularSuggestionsConfig?.properties?.size ?? {}),
                    },
                    minHits: {
                      type: 'number',
                      default: 1,
                      markdownDescription:
                        'Return only popular suggestions that have been searched at least minCount times. There is no default minimum count-based restriction.',
                      ...(querySchemaPropertiesFromApiSchema
                        ?.popularSuggestionsConfig?.properties?.minHits ?? {}),
                    },
                    minChars: {
                      type: 'number',
                      default: 1,
                      markdownDescription:
                        'Return only popular suggestions that have minimum characters, as set in this property. There is no default minimum character-based restriction.',
                      ...(querySchemaPropertiesFromApiSchema
                        ?.popularSuggestionsConfig?.properties?.minChars ?? {}),
                    },
                    showGlobal: {
                      type: 'boolean',
                      default: true,
                      markdownDescription:
                        "When set to false, return popular suggestions only based on the current user's past searches.",
                      ...(querySchemaPropertiesFromApiSchema
                        ?.popularSuggestionsConfig?.properties?.showGlobal ??
                        {}),
                    },
                    index: {
                      type: 'string',
                      default: '',
                      markdownDescription:
                        'Index(es) from which to return the popular suggestions from. Defaults to searching the entire cluster.',
                      ...(querySchemaPropertiesFromApiSchema
                        ?.popularSuggestionsConfig?.properties?.index ?? {}),
                    },
                  },
                  default: {
                    size: 5,
                  },
                  markdownDescription:
                    "Specify additional options for fetching popular suggestions. It can accept the following keys: \n * `size`: `number` Maximum number of popular suggestions to return. Defaults to 5. \n * `minHits`: `number` Return only popular suggestions that have been searched at least minCount times. There is no default minimum count-based restriction. \n * `minChars`: `number` Return only popular suggestions that have minimum characters, as set in this property. There is no default minimum character-based restriction. \n * `showGlobal`: Boolean Defaults to true. When set to false, return popular suggestions only based on the current user's past searches. \n * `index`: `string` Index(es) from which to return the popular suggestions from. Defaults to the entire cluster. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#recentsuggestionsconfig)",
                },
              },
            },
          },
        ],

        dependencies: {
          // aggregationSize: ['aggregationField'],
          after: ['pagination'],
          distinctFieldConfig: ['distinctField'],
        },
        // additionalProperties: false,
      },
    },
    {
      uri: 'http://myserver/settings-schema.json',
      schema: {
        type: 'object',
        properties: {
          recordAnalytics: {
            type: 'boolean',
            markdownDescription:
              "`bool` defaults to `false`. If `true` then it'll enable the recording of Appbase.io analytics. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#recordanalytics)",
            default: false,
          },
          enableQueryRules: {
            type: 'boolean',
            markdownDescription:
              '`bool` defaults to `true`. It allows you to configure whether to apply the query rules for a particular query or not. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#enablequeryrules)',
            default: true,
          },
          customEvents: {
            type: 'object',
            markdownDescription:
              '`Object` It allows you to set the custom events which can be used to build your own analytics on top of the Appbase.io analytics. Further, these events can be used to filter the analytics stats from the Appbase.io dashboard. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#customevents)',
            default: {},
          },
          userId: {
            type: 'string',
            default: '',
            markdownDescription:
              '`String` It allows you to define the user id which will be used to record the Appbase.io analytics. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#userid)',
          },
          useCache: {
            type: 'boolean',
            default: false,
            markdownDescription:
              '`Boolean` This property when set allows you to cache the current search query. The `useCache` property takes precedence irrespective of whether caching is enabled or disabled via the dashboard. \n - [Docs Reference](https://docs.appbase.io/docs/search/reactivesearch-api/reference/#usecache)',
          },
          queryRule: {
            type: 'object',
            default: {},
            markdownDescription:
              '`Object` Set an inline query rule to preview side-effects prior to saving it. For reference, check the request body for [query rule object](https://arc-api.appbase.io/#7816fd01-9e40-4a47-b189-c7692db4fa3a).',
          },
        },
        default: {},
        ...(schemaFromAPI?.properties?.settings ?? {}),
      },
    },
    {
      uri: 'http://myserver/stored-query-schema.json',
      schema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            enum: [...storedQueriesIds()],
          },
        },
        allOf: [...conditionalStoredQueryParamsObject()],
      },
    },
  ];
};

export const getEditorConfig = (
  defaultEditorConfig: Record<string, any>,
  storeEditorConfig: Record<string, any>
) => {
  const computeValidTheme = () => {
    if (storeEditorConfig['editor.theme'] === 'dark') {
      return 'vs-dark';
    } else if (storeEditorConfig['editor.theme'] === 'hc-black') {
      return 'hc-black';
    } else {
      return 'vs';
    }
  };

  return {
    ...defaultEditorConfig,
    theme: computeValidTheme(),
    options: {
      ...defaultEditorConfig.options,
      cursorStyle: storeEditorConfig['editor.cursorShape'],
      fontFamily: storeEditorConfig['editor.fontFamily'],
      fontSize: storeEditorConfig['editor.fontSize'],
      suggestFontSize: storeEditorConfig['editor.fontSize'],
    },
  };
};

// declare global {
//   // source: https://stackoverflow.com/a/56458070/10822996
//   interface Window {
//     // somevar: any;
//   }
// }

// copy to clipboard
export const copyToClipBoard = (value: string) => {
  let storage = document.createElement('input');
  storage.value = value;
  document.body.appendChild(storage);
  storage.select();
  document.execCommand('copy');
  document.body.removeChild(storage);
};

// CURL GENERATION CODE SNIPPET
// SOURCE: https://github.com/albertodeago/curl-generator

type StringMap = { [key: string]: string };

/**
 * Additional options for curl command.
 *
 * --compressed        ->   Request compressed response
 * --compressed-ssh    ->   Enable SSH compression
 * --fail              ->   Fail silently (no output at all) on HTTP errors
 * --fail-early        ->   Fail on first transfer error, do not continue
 * --head              ->   Show document info only
 * --include           ->   Include protocol response headers in the output
 * --insecure          ->   Allow insecure server connections when using SSL
 * --ipv4              ->   Resolve names to IPv4 addresses
 * --ipv6              ->   Resolve names to IPv6 addresses
 * --list-only         ->   List only mode
 * --location          ->   Follow redirects
 * --location-trusted  ->   Like --location, and send auth to other hosts
 * --no-keepalive      ->   Disable TCP keepalive on the connection
 * --show-error        ->   Show error even when -s is used
 * --silent            ->   Silent mode
 * --ssl               ->   Try SSL/TLS
 * --sslv2             ->   Use SSLv2
 * --sslv3             ->   Use SSLv3
 * --verbose           ->   Make the operation more talkative
 */
type CurlAdditionalOptions = {
  compressed: boolean;
  compressedSsh: boolean;
  fail: boolean;
  failEarly: boolean;
  head: boolean;
  include: boolean;
  insecure: boolean;
  ipv4: boolean;
  ipv6: boolean;
  listOnly: boolean;
  location: boolean;
  locationTrusted: boolean;
  noKeepalive: boolean;
  output: string;
  showError: boolean;
  silent: boolean;
  ssl: boolean;
  sslv2: boolean;
  sslv3: boolean;
  verbose: boolean;
};

type CurlRequest = {
  method?: string;
  headers?: StringMap;
  body?: string;
  url: string;
};

/**
 * @param {string} [method]
 * @returns {string}
 */
const getCurlMethod = function(method?: string): string {
  let result: string = '';
  if (method) {
    const types: StringMap = {
      GET: '-X GET',
      POST: '-X POST',
      PUT: '-X PUT',
      PATCH: '-X PATCH',
      DELETE: '-X DELETE',
    };
    result = `${types[method.toUpperCase()]} `;
  }
  return result;
};

/**
 * @param {StringMap} headers
 * @returns {string}
 */
const getCurlHeaders = function(headers?: StringMap): string {
  let result = '';
  if (headers) {
    Object.keys(headers).forEach(val => {
      result += `-H "${val}: ${('' + headers[val]).replace(
        /(\\|")/g,
        '\\$1'
      )}" `;
    });
  }
  return result;
};

/**
 * @param {Object} body
 * @returns {string}
 */
const getCurlBody = function(body?: Object): string {
  let result = '';
  if (body) {
    result += `-d '${JSON.stringify(body)
      .replace(/(\\|")/g, '\\$1')
      .replace(/\\"/g, '"')}' `;
  }
  return result;
};

/**
 * Given the curl additional options, turn them into curl syntax
 * @param {CurlAdditionalOptions} [options]
 * @returns {string}
 */
const getCurlOptions = function(options?: CurlAdditionalOptions): string {
  let result = '';
  if (options) {
    (Object.keys(options) as Array<keyof CurlAdditionalOptions>).forEach(
      (key: keyof CurlAdditionalOptions) => {
        const kebabKey = key.replace(
          /[A-Z]/g,
          letter => `-${letter.toLowerCase()}`
        );

        if (!options[key]) {
          throw new Error(`Invalid Curl option ${key}`);
        } else if (typeof options[key] === 'boolean' && options[key]) {
          // boolean option, we just add --opt
          result += `--${kebabKey} `;
        } else if (typeof options[key] === 'string') {
          // string option, we have to add --opt=value
          result += `--${kebabKey} ${options[key]} `;
        }
      }
    );
  }
  return result;
};

/**
 * @param {CurlRequest} params
 * @param {CurlAdditionalOptions} [options]
 * @returns {string}
 */
export const CurlGenerator = function(
  params: CurlRequest,
  options?: CurlAdditionalOptions
): string {
  let curlSnippet = 'curl ';
  curlSnippet += `"${params.url}" `;
  curlSnippet += getCurlMethod(params.method);
  curlSnippet += getCurlHeaders(params.headers);
  curlSnippet += getCurlBody(params.body);
  curlSnippet += getCurlOptions(options);
  return curlSnippet.trim();
};

//for inserting text into monaco editor body
export const insertText = (
  pos: any,
  appendText: string,
  _monaco: any,
  editor: any,
  nextPositionObj?: any
) => {
  if (!pos) return;
  const range = new _monaco.Range(
    pos.lineNumber,
    pos.column + 1,
    pos.lineNumber,
    pos.column + 1
  );
  // console.log('appendText', appendText);
  editor.executeEdits('append-end-commas', [
    {
      identifier: 'append-end-comma',
      range,
      text: appendText,
    },
  ]);

  // Set position after comma text
  editor.setPosition(
    nextPositionObj || {
      lineNumber: pos.lineNumber,
      column: pos.column + appendText.length + 1,
    }
  );
  nextPositionObj && editor.trigger('', 'editor.action.triggerSuggest');
};

// function isJson(str: string) {
//   try {
//     JSON.parse(str);
//   } catch (e) {
//     return false;
//   }
//   return true;
// }
// source: https://stackoverflow.com/questions/30935292/removing-excess-comma-on-json-object
export const fixTrailingCommas = (jsonString: string) => {
  try {
    var jsonObj;
    eval('jsonObj = ' + jsonString);
    return JSON.stringify(jsonObj);
  } catch (error) {
    return jsonString;
  }
};

export const tidyCode = (editor: any) => {
  editor?.trigger('', 'editor.action.formatDocument');
};

export const generateUrlQueryStringfromSettingsObj = (
  settingsObj: Record<string, any>
) => {
  const esc = encodeURIComponent;
  const urlParamsString = Object.keys(settingsObj)
    .map(
      k => esc(SHORT_CONFIGURATION_NAME_ALIASES[k]) + '=' + esc(settingsObj[k])
    )
    .join('&');

  return urlParamsString;
};

export const isNumeric = (value: any) => {
  return /^-?\d+$/.test(value);
};

export const constructSettingsObjectFromCurrentUrl = () => {
  const url = window.location;
  const params = new URLSearchParams(url.search);
  let settingsObj: Record<string, any> = {};

  Object.keys(REVERSE_SHORT_CONFIGURATION_NAME_ALIASES).forEach(key => {
    const value = decodeURIComponent(params.get(key) || '');
    if (!!value) {
      settingsObj[REVERSE_SHORT_CONFIGURATION_NAME_ALIASES[key]] =
        value === 'true' || value === 'false'
          ? value === 'true'
          : isNumeric(value)
          ? +value
          : value;
    }
  });
  return settingsObj;
};

export const generateEmbedUrl = (docId: string) => {
  let embedUrl = PLAYGROUND_DOMAIN_NAME;
  if (docId) {
    embedUrl += `/embed/${docId}`;
  }
  return embedUrl;
};

export const generateEmbedCode = (embedUrl: string, docId: string) => {
  return `<iframe src=${embedUrl}
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title=${'rs-playground-' + docId}
   ></iframe>`;
};

export const isWindowEmbedded = () => {
  return !(window === window.parent);
};

export const getFirestoreKeyFromURL = (pathname: string) => {
  const pathnameElements = pathname.split('/');
  const indexOfEmbed = pathnameElements.indexOf('embed');
  const indexOfFirestoreKey = indexOfEmbed === -1 ? null : indexOfEmbed + 1;

  return indexOfFirestoreKey ? pathnameElements[indexOfFirestoreKey] : null;
};

export const getPersistKey = () => {
  try {
    if (window && window.location.pathname) {
      return (
        getFirestoreKeyFromURL(window.location.pathname) ||
        DEAFULT_STORE_PERSIST_KEY
      );
    }
    return DEAFULT_STORE_PERSIST_KEY;
  } catch (error) {
    console.warn(
      'ReactiveSearch Playground: getPersistKey - The entered URL seem faulty! Try entering a healthy URL.'
    );
    return 'rs-playground-root';
  }
};

export const findValueinObjectByLabel = (
  obj: LooseObject,
  label: String
): Number | null => {
  if (typeof obj !== 'object' || !obj) {
    return null;
  }
  if (obj.label === label) {
    return obj.label;
  }
  for (var i in obj) {
    if (i === label) {
      return obj[i];
    }
    if (obj.hasOwnProperty(i)) {
      var foundLabel = findValueinObjectByLabel(obj[i], label);
      if (foundLabel) {
        return foundLabel;
      }
    }
  }
  return null;
};
