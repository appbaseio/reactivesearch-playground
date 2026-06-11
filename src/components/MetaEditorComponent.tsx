import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Editor from '@monaco-editor/react';

import { RootState } from '../store';
import { fetchMappingsForCurrentUrl } from '../store/slices/mappings';
import { updateCurrentTabConfig } from '../store/slices/tabs';
import MetaEditor from '../styles/MetaEditor';
import { defaultEditorConfig } from '../utils/constants';
import { getEditorConfig } from '../utils/functions';
import { useDebounce } from '../utils/hooks';

// editor for entering query variables / http headers
function MetaEditorComponent() {
  const editorRef = useRef(null);
  const {
    global: { settings },
    tabs: { tabs: tabsArray, activeTab },
  } = useSelector((state: RootState) => state);

  const dispatch = useDispatch();
  const handleEditorDidMount = (editor: any, _monaco: any) => {
    editorRef.current = editor;
  };
  const [headersInput, setHeadersInput] = useState(
    tabsArray[activeTab].headers
  );
  const debouncedHeadersInput: string = useDebounce<string>(headersInput, 500);

  const onChange = (newValue: any, _event: any) => {
    setHeadersInput(newValue);
  };

  useEffect(() => {
    if (tabsArray[activeTab].headers !== headersInput) {
      try {
        dispatch(
          updateCurrentTabConfig({
            headers: headersInput,
          })
        );
        dispatch(fetchMappingsForCurrentUrl({}));
      } catch (error) {
        console.log(error);
      }
    }
  }, [debouncedHeadersInput]);

  useEffect(() => {
    if (tabsArray[activeTab].headers !== headersInput) {
      setHeadersInput(tabsArray[activeTab].headers);
    }
  }, [tabsArray[activeTab].headers]);

  // currently we just have headers tab
  if (!settings['components.showHeaders']) {
    return null;
  }
  return (
    <MetaEditor className="meta-editor">
      <div className="meta-editor__content">
        <header className="tabbed-header">
          <button>HTTP HEADERS</button>
        </header>
        <Editor
          {...getEditorConfig(defaultEditorConfig, settings)}
          options={{
            ...getEditorConfig(defaultEditorConfig, settings).options,
            padding: {
              top: 40,
            },
          }}
          onMount={handleEditorDidMount}
          onChange={onChange}
          value={headersInput}
        />
      </div>
    </MetaEditor>
  );
}

export default MetaEditorComponent;
