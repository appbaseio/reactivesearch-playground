import React, { useEffect, useRef, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import Editor from '@monaco-editor/react';

import { RootState } from '../store';
import { toggleEmbed } from '../store/slices/global';
import { updateCurrentTabConfig } from '../store/slices/tabs';
import {
  EmbedUrlInputWrapper,
  IframeCodeTextArea,
  IframeCodeTextAreaWrapper,
  PreviewFrame,
  PreviewPlaceHolder,
  Share,
  ShareConfigOptions,
  ShareConfigOptionsHeader,
  ShareLeftCol,
  ShareLinkProvider,
  ShareLinkProviderBody,
  ShareLinkProviderHeader,
  ShareRightCol,
} from '../styles/Share';
import { Button, EmbedCodeButton } from '../styles/shared/Buttons';
import { defaultEditorConfig } from '../utils/constants';
import {
  copyToClipBoard,
  debounce,
  fixTrailingCommas,
  generateEmbedCode,
  generateEmbedUrl,
  getEditorConfig,
} from '../utils/functions';
import ModalComponent from './shared/ModalComponent';
import EditIcon from './shared/EditIcon';
import CopyIcon from './shared/CopyIcon';
import { addPlaygroundState, updatePlaygroundState } from '../firebase';
import LoadingSpinner from './shared/LoadingSpinner';
import { Input } from '../styles/Input';

export interface ShareComponentProps {}

const ShareComponent: React.FC<ShareComponentProps> = () => {
  const editorRef = useRef(null);
  const dispatch = useDispatch();
  const [settingsString, setSettingsString] = useState('{}'); // stringified form
  const [docId, setDocId] = useState('');
  const [embedUrl, setEmbedUrl] = useState(''); // iframe src value
  const [embedCode, setEmbedCode] = useState(''); // embed code with iframe tag string
  const [inProgress, setInProgress] = useState(false); //
  const [embedCodeGenerated, setEmbedCodeGenerated] = useState(false);
  const [embedCodeCopied, setEmbedCodeCopied] = useState(false);
  const [embedURLCopied, setEmbedURLCopied] = useState(false);

  const { settings, tabs, activeTab, showShareComponent } = useSelector(
    ({
      global: { settings, showShareComponent },
      tabs: { tabs, activeTab },
    }: RootState) => ({
      settings,
      tabs,
      activeTab,
      showShareComponent,
    }),
    shallowEqual // source: https://dev.to/tkudlinski/react-redux-useselector-hook-and-equality-checks-2m1d
  );
  const settingsObj = (settingsString: string) =>
    JSON.parse(fixTrailingCommas(settingsString));

  const handleOnCLickGenerateEmbed = async () => {
    if (!!docId) {
      return;
    }
    setInProgress(true);
    const docIdResponse = await addPlaygroundState({
      tabs,
      settings: settingsObj(settingsString),
    });
    setDocId(docIdResponse);
  };

  const handleEditorDidMount = (editor: any, _monaco: any) => {
    editorRef.current = editor;
    editor.focus();
    setSettingsString(JSON.stringify(settings, null, 4));
  };

  const handleOnChange = debounce((newValue: string) => {
    setSettingsString(newValue);
  }, 500);

  const handleShareComponentClose = () => {
    dispatch(toggleEmbed());
  };

  const handleCopyGeneratedCode = () => {
    copyToClipBoard(embedCode);
    setEmbedCodeCopied(true);
  };

  const handleCopyEmbedUrl = () => {
    copyToClipBoard(embedUrl);
    setEmbedURLCopied(true);
  };

  useEffect(() => {
    setEmbedUrl(generateEmbedUrl(docId));
  }, []);

  useEffect(() => {
    try {
      embedCodeGenerated && setInProgress(true);
      setEmbedUrl(generateEmbedUrl(docId));
    } catch (error) {
      if (error instanceof Error) {
        dispatch(
          updateCurrentTabConfig({
            errorMessage: error.name + ': ' + error.message,
          })
        );
      }
    }
  }, [docId]);

  useEffect(() => {
    !!embedUrl && setEmbedCode(generateEmbedCode(embedUrl, docId));
  }, [embedUrl]);

  useEffect(() => {
    if (!!embedCode) {
      setInProgress(false);
      if (docId && !embedCodeGenerated) {
        setEmbedCodeGenerated(true);
      }
    }
  }, [embedCode]);

  useEffect(() => {
    setTimeout(() => {
      !!embedCodeCopied && setEmbedCodeCopied(false);
      !!embedURLCopied && setEmbedURLCopied(false);
    }, 1000);
  }, [embedCodeCopied, embedURLCopied]);

  useEffect(() => {
    const handleUpdateFirestoreDoc = async () => {
      if (!docId || !settingsString) {
        return;
      }
      setInProgress(true);
      await updatePlaygroundState(docId, {
        // updating settings
        settings: settingsObj(settingsString),
      });
      setInProgress(false);
    };

    handleUpdateFirestoreDoc();
  }, [settingsString]);

  useEffect(() => {
    if (!!docId || !!settingsString) {
      setEmbedUrl('');
      setEmbedCodeGenerated(false);
      setDocId('');
    }
  }, [tabs[activeTab].url, tabs[activeTab].body]);

  return (
    <ModalComponent
      isShown={showShareComponent}
      onClose={handleShareComponentClose}
    >
      <Share>
        <ShareLeftCol>
          <ShareConfigOptions>
            <ShareConfigOptionsHeader>
              Configure Embed Settings
              <EditIcon />
            </ShareConfigOptionsHeader>
            <Editor
              height="100%"
              width="100%"
              {...getEditorConfig(defaultEditorConfig, settings)}
              options={{
                wrappingStrategy: 'advanced',
                wrappingIndent: 'same',
                folding: 'false',
                wordWrap: 'on',
                scrollBeyondLastLine: true,
                ...getEditorConfig(defaultEditorConfig, settings).options,
                padding: {
                  top: 5,
                },
              }}
              onMount={handleEditorDidMount}
              onChange={handleOnChange}
              defaultValue={JSON.stringify(settings, null, 4)}
              value={settingsString}
            />
          </ShareConfigOptions>
          <ShareLinkProvider>
            <ShareLinkProviderHeader>
              Share {inProgress ? <LoadingSpinner /> : null}
            </ShareLinkProviderHeader>
            <ShareLinkProviderBody>
              {embedCodeGenerated && (
                <>
                  <IframeCodeTextAreaWrapper>
                    Use as Iframe
                    <IframeCodeTextArea readOnly value={embedCode} />
                    <Button onClick={handleCopyGeneratedCode}>
                      {embedCodeCopied ? (
                        'Copied '
                      ) : (
                        <>
                          <CopyIcon /> Copy
                        </>
                      )}
                    </Button>
                  </IframeCodeTextAreaWrapper>
                  <EmbedUrlInputWrapper>
                    Embed URL
                    <Input value={embedUrl} />{' '}
                    <Button onClick={handleCopyEmbedUrl}>
                      {embedURLCopied ? (
                        'Copied '
                      ) : (
                        <>
                          <CopyIcon /> Copy
                        </>
                      )}
                    </Button>
                  </EmbedUrlInputWrapper>
                </>
              )}
              {!embedCodeGenerated && (
                <EmbedCodeButton
                  onClick={handleOnCLickGenerateEmbed}
                  disabled={embedCodeGenerated}
                >
                  Generate Embed Code
                </EmbedCodeButton>
              )}
            </ShareLinkProviderBody>
          </ShareLinkProvider>
        </ShareLeftCol>
        <ShareRightCol>
          {embedCodeGenerated ? (
            <PreviewFrame key={'key' + inProgress} src={embedUrl} />
          ) : (
            <PreviewPlaceHolder>
              Generate Embed Code to see live preview
            </PreviewPlaceHolder>
          )}
        </ShareRightCol>
      </Share>
    </ModalComponent>
  );
};

export default ShareComponent;
