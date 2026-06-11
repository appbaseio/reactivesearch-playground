import React, { useRef, useState } from 'react';
import { fixTrailingCommas, getEditorConfig } from '../utils/functions';
import { saveSettings, toggleSettings } from '../store/slices/global';
import { useDispatch, useSelector } from 'react-redux';

import { SaveSettingsButton } from '../styles/shared/Buttons';
import Editor from '@monaco-editor/react';
import { RootState } from '../store';
import Settings from '../styles/Settings';
import { defaultEditorConfig } from '../utils/constants';

export interface SettingsComponentProps {}

const SettingsComponent: React.FC<SettingsComponentProps> = () => {
  const dispatch = useDispatch();
  const editorRef = useRef(null);
  const [settingsString, setSettingsString] = useState(''); // stringified form
  const {
    global: { settings, showSettingsComponent },
  } = useSelector((state: RootState) => state);

  function handleEditorDidMount(editor: any, _monaco: any) {
    editorRef.current = editor;
    setSettingsString(JSON.stringify(settings, null, 4));
  }

  const handleOnChange = (newValue: any, _event: any) => {
    setSettingsString(newValue);
  };

  const handleSaveSettingsClick = () => {
    // console.log('json', settingsString);
    // return;
    dispatch(saveSettings(JSON.parse(fixTrailingCommas(settingsString))));
    dispatch(toggleSettings());
  };

  if (!showSettingsComponent) return null;

  return (
    <Settings>
      <SaveSettingsButton onClick={handleSaveSettingsClick}>
        Save Settings
      </SaveSettingsButton>
      <Editor
        {...getEditorConfig(defaultEditorConfig, settings)}
        options={{
          ...getEditorConfig(defaultEditorConfig, settings).options,
          padding: {
            top: 40,
          },
        }}
        onMount={handleEditorDidMount}
        onChange={handleOnChange}
        defaultValue={JSON.stringify(settings, null, 4)}
        value={settingsString}
      />
    </Settings>
  );
};

export default SettingsComponent;
