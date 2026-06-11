import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Editor from '@monaco-editor/react';

import { RootState } from '../store';
import { fetchResponse, updateCurrentTabConfig } from '../store/slices/tabs';
import QueryEditor, {
  AutoCompletionTriggerFooter,
  KeyImpression,
} from '../styles/QueryEditor';
import { BeautifyButton } from '../styles/shared/Buttons';
import { defaultEditorConfig } from '../utils/constants';
import {
  debounce,
  getEditorConfig,
  getSchema,
  insertText,
  tidyCode,
} from '../utils/functions';
import ExecuteButtonComponent from './ExecuteButtonComponent';

let QUERY_EDITOR_MODEL_PATH = 'a://b/foo.json';
let previousCursorPosition: any;

const QueryEditorComponent = () => {
  const dispatch = useDispatch();
  const {
    global: { settings },
    mappings: { mappings },
    tabs: { tabs: tabsArray, activeTab },
    storedQueries: { storedQueries },
  } = useSelector((state: RootState) => state);
  const editorRef = useRef<any>();
  const [monacoInstance, setMonacoInstance] = useState<any>();

  // const [hasErrors, setHasErrors] = useState<boolean | undefined>(true);

  function handleEditorDidMount(editor: any, _monaco: any) {
    editor.addAction({
      contextMenuOrder: 1,
      id: 'execute-query',
      label: 'Play Request',
      keybindings: [_monaco.KeyMod.WinCtrl | _monaco.KeyCode.Enter],
      contextMenuGroupId: 'navigation',
      run: () => {
        dispatch(fetchResponse());
      },
    });
    editor.addAction({
      contextMenuOrder: 2,
      id: 'trigger-suggest',
      label: 'Get next suggestion',
      keybindings: [_monaco.KeyMod.WinCtrl | _monaco.KeyCode.Space],
      contextMenuGroupId: 'navigation',
      run: () => {
        editor.trigger('', 'editor.action.triggerSuggest');
      },
    });

    editorRef.current = editor;
    setMonacoInstance(_monaco);
    editor.onDidChangeModelContent((_e: any) => {
      previousCursorPosition = editor.getPosition();
    });
    // ***  START  *** : Snippet for setting the initial cursor position //
    // if (!isWindowEmbedded() && !!tabsArray[activeTab].body) {
    //   editor.focus();
    //   editor.setPosition({
    //     column: 10,
    //     lineNumber: 3,
    //   });
    //   const position = editor.getPosition();
    //   insertText(position, '           ', _monaco, editor);
    //   editor.setSelection(new _monaco.Range(3, 9, 3, 9));
    // }
    // ***  END  *** : Snippet for setting the initial cursor position //

    // source : https://stackoverflow.com/a/57753206/10822996

    editor.onKeyUp((e: any) => {
      // https://stackoverflow.com/a/66284545/10822996 : main source of code snippet
      // https://stackoverflow.com/a/38735948/10822996 : workaround incase you need to detect a new line
      if (e.keyCode === _monaco.KeyCode.Enter && !e.ctrlKey) {
        const model = editor.getModel();
        const position = editor.getPosition();
        const currentLine = model.getLineContent(position.lineNumber);
        const cursorInsertionPositionObj = () => {
          const rangeObject = [
            ...(model.findMatches('""').length && model.findMatches('""')),
            ...(model.findMatches('{}').length && model.findMatches('{}')),
          ];
          let rangeLocalityLineNumber = -1;
          if (rangeObject) {
            for (let i = 0; i < rangeObject.length; i++) {
              if (
                rangeObject?.[i]?.range?.startLineNumber >=
                  previousCursorPosition?.lineNumber &&
                rangeObject?.[i]?.range?.startLineNumber <= position?.lineNumber
              ) {
                rangeLocalityLineNumber = i;
                break;
              }
            }
          }

          if (rangeLocalityLineNumber !== -1) {
            return {
              lineNumber:
                rangeObject?.[rangeLocalityLineNumber]?.range.startLineNumber,
              column:
                rangeObject?.[rangeLocalityLineNumber]?.range.startColumn + 1,
            };
          }
          return null;
        };
        if (
          !currentLine.trim() ||
          position.column < currentLine.trim().length
        ) {
          editor.trigger('', 'editor.action.triggerSuggest');
        } else {
          let whatToInsert = ',';
          if (
            currentLine.trim()[currentLine.trim().length - 1] === ',' ||
            currentLine.trim()[currentLine.trim().length - 1] === ':' ||
            (!currentLine.includes(':') &&
              !currentLine.includes('}') &&
              !currentLine.includes(']'))
          ) {
            whatToInsert = '';
          }
          insertText(
            {
              lineNumber: position.lineNumber,
              column: Math.max(position.column, currentLine.length),
            },
            whatToInsert,
            _monaco,
            editor,
            cursorInsertionPositionObj()
          );
        }
      }
    });
  }
  const handleBodyChangeDebounced = debounce((value: any) => {
    dispatch(updateCurrentTabConfig(value));
  }, 500);

  const onChange = (newValue: any, _event: any) => {
    if (tabsArray[activeTab].body !== newValue) {
      handleBodyChangeDebounced({
        body: newValue,
      });
    }
  };

  useEffect(() => {
    try {
      if (!monacoInstance) {
        return;
      }

      //url-indexwise wise stored mappings
      let url = tabsArray[activeTab]['url'];
      let fieldsToCompute = [
        'searchableFields',
        'aggregatableFields',
        'rankFeatureFields',
        'rangeFields',
        'geoFields',
        'nestedFields',
        'distinctFields',
        'numericFields',
        'categoryFields',
        'booleanFields',
        'includeFields',
        'excludeFields',
      ];

      const computedFieldsObj: Record<string, any> = {};
      if (typeof mappings?.[url] !== 'object') {
        return;
      }
      Object.values(mappings?.[url]).map(mappingObj => {
        fieldsToCompute.forEach(fieldName => {
          if (!Array.isArray(computedFieldsObj[fieldName])) {
            computedFieldsObj[fieldName] = [];
          }
          computedFieldsObj[fieldName] = [
            ...computedFieldsObj[fieldName],
            ...(mappingObj as Record<string, any>)[fieldName],
          ];
        });
      });

      const {
        searchableFields,
        aggregatableFields,
        rankFeatureFields,
        rangeFields,
        geoFields,
        nestedFields,
        distinctFields,
        numericFields,
        categoryFields,
        booleanFields,
        includeFields,
        excludeFields,
      } = computedFieldsObj;
      if (monacoInstance) {
        // fetched schema from API for a cluster URL
        // the API schema would be smartly merged with the static schema used
        // in this project
        const schemaFromAPI = tabsArray[activeTab].schema ?? {};

        // 'executing schema assignment...'
        console.log('executing schema assignment...');
        monacoInstance.languages.json.jsonDefaults.setDiagnosticsOptions({
          validate: true,
          schemas: getSchema(
            {
              searchableFields,
              aggregatableFields,
              rankFeatureFields,
              rangeFields,
              geoFields,
              nestedFields,
              distinctFields,
              numericFields,
              categoryFields,
              booleanFields,
              includeFields,
              excludeFields,
            },
            storedQueries,
            monacoInstance.Uri.parse(QUERY_EDITOR_MODEL_PATH),
            schemaFromAPI
          ),
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
      }
    }
  }, [monacoInstance, mappings, tabsArray[activeTab]['indexName'], activeTab]);

  // programatically setting the initial value on tab update
  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        const currentValue = model.getValue();
        const incomingValue = tabsArray[activeTab].body;

        if (currentValue !== incomingValue) {
          editorRef.current.getModel().setValue(tabsArray[activeTab].body);
        }
      }
    }
  }, [tabsArray[activeTab].body]);

  return (
    <QueryEditor className="query-editor">
      <Editor
        path={QUERY_EDITOR_MODEL_PATH}
        language="json"
        {...getEditorConfig(defaultEditorConfig, settings)}
        options={{
          ...getEditorConfig(defaultEditorConfig, settings).options,
          padding: {
            top: 22,
          },
          autoClosingBrackets: true,
          codeLens: false,
          contextmenu: true,
          cursorBlinking: 'blink',
          cursorStyle: 'line',
          disableLayerHinting: false,
          disableMonospaceOptimizations: false,
          fixedOverflowWidgets: false,
          formatOnType: true,
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
          wordBasedSuggestions: false,
          snippetSuggestions: 'top',
          suggest: {
            showEnums: true,
            showEnumMembers: true,
            showConstants: true,
            showStructs: true,
            showFields: true,
            showProperties: true,
            snippetsPreventQuickSuggestions: false,
            insertMode: 'insert',
            shareSuggestSelections: false,
            showFunctions: true,
            showSnippets: true,
            showValues: true,
          },
          inlineSuggest: { enabled: true },
          EditorAutoClosingStrategy: 'always',
        }}
        onMount={handleEditorDidMount}
        onChange={onChange}
        defaultValue={tabsArray[activeTab].body}
      />

      <ExecuteButtonComponent
        disableButton={false}
        // disableButton={hasErrors}
      />

      <BeautifyButton onClick={() => tidyCode(editorRef.current)}>
        Beautify
      </BeautifyButton>

      <AutoCompletionTriggerFooter>
        Use <KeyImpression>Control</KeyImpression> +{' '}
        <KeyImpression>Space</KeyImpression> to trigger autocomplete.
      </AutoCompletionTriggerFooter>
    </QueryEditor>
  );
};

export default QueryEditorComponent;
