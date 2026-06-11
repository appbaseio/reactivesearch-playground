import React, { useEffect, useRef, useState } from 'react';
import {
  ResponseEditor,
  ResponseEditorPlaceholder,
} from '../styles/ResponseEditor';

import Editor from '@monaco-editor/react';
import { RootState } from '../store';
import { defaultEditorConfig } from '../utils/constants';
import {
  findValueinObjectByLabel,
  getEditorConfig,
  tidyCode,
} from '../utils/functions';
import { useSelector } from 'react-redux';
import { Tag } from '../styles/shared/Tag';
import Tooltip from './shared/Tooltip';

function ResponseEditorComponent() {
  const editorRef = useRef<any>(null);
  const {
    global: { settings },
    tabs: { tabs: tabsArray, activeTab },
  } = useSelector((state: RootState) => state);
  const [tooltip, setTooltip] = useState({
    content: '',
    visible: false,
    position: { x: 0, y: 0 },
  });
  const maxLength = 50; // Set the maximum line length before showing the tooltip
  const tooltipClearTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (tooltip.visible) setTooltip({ ...tooltip, visible: false });
  }, [activeTab]);

  const showTooltip = (position: any, domElement: HTMLElement) => {
    if (!editorRef.current) {
      return;
    }
    const lineContent = editorRef.current
      ?.getModel()
      .getLineContent(position.lineNumber);

    if (lineContent.length > maxLength) {
      const rect = domElement.getBoundingClientRect();

      tooltipClearTimeout.current = window.setTimeout(() => {
        setTooltip({
          content: lineContent,
          visible: true,
          position: { x: rect.left, y: rect.top },
        });
      }, 2000);
    } else {
      setTooltip({ ...tooltip, visible: false });
    }
  };

  function handleEditorDidMount(editor: any, _monaco: any) {
    // console.log({ monaco });
    editorRef.current = editor;

    editor.onMouseMove(function({
      event,
      target,
    }: {
      event: any;
      target: any;
    }) {
      if (tooltipClearTimeout.current) {
        clearTimeout(tooltipClearTimeout.current);
        tooltipClearTimeout.current = null;
      }

      const eventType = event?.browserEvent?.type;

      if (eventType === 'mousemove') {
        showTooltip(target.position, target.element);
      } else {
        setTooltip({ ...tooltip, visible: false });
      }
    });

    setTimeout(() => {
      tidyCode(editor);
    }, 2000);
  }
  const renderPlaceholder = () => {
    if (!tabsArray[activeTab].errorMessage && tabsArray[activeTab].response) {
      return null;
    }

    return (
      <ResponseEditorPlaceholder>
        {tabsArray[activeTab].errorMessage ? (
          tabsArray[activeTab].errorMessage.split('\n').map(str => <p>{str}</p>)
        ) : tabsArray[activeTab].response ? (
          ''
        ) : (
          <>
            'Hit the Play Button to <br /> to get a response here'
          </>
        )}
      </ResponseEditorPlaceholder>
    );
  };
  const renderStatusAndTime = () => {
    let statusCode;
    let timeTook;
    try {
      if (tabsArray[activeTab].responseStatusCode) {
        statusCode = Number(tabsArray[activeTab].responseStatusCode);
      }
      if (tabsArray[activeTab].response) {
        timeTook = findValueinObjectByLabel(
          JSON.parse(tabsArray[activeTab].response),
          'took'
        );
      }
    } catch (err) {
      console.log(err);
    }
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'absolute',
          zIndex: 1,
          right: '25px',
          top: '11px',
        }}
      >
        {statusCode ? (
          // eslint-disable-next-line
          <Tag
            className={
              statusCode === 200 ? 'success' : statusCode >= 400 ? 'error' : ''
            }
          >
            {statusCode}
            {statusCode === 200 ? ' OK' : ''}
          </Tag>
        ) : null}

        {timeTook && timeTook >= 0 ? (
          <Tag className="time-status" style={{ marginRight: '0' }}>
            {timeTook} ms
          </Tag>
        ) : null}
      </div>
    );
  };
  return (
    <ResponseEditor>
      {renderStatusAndTime()}
      {renderPlaceholder()}
      <Editor
        {...getEditorConfig(defaultEditorConfig, settings)}
        defaultValue=""
        options={{
          ...getEditorConfig(defaultEditorConfig, settings).options,
          readOnly: true,
          padding: {
            top: 22,
          },
        }}
        onMount={handleEditorDidMount}
        value={tabsArray[activeTab].response}
        language="javascript"
      />{' '}
      <Tooltip
        content={tooltip.content}
        visible={tooltip.visible}
        position={tooltip.position}
      />
    </ResponseEditor>
  );
}

export default ResponseEditorComponent;
