import {
  CurlGenerator,
  copyToClipBoard,
  fixTrailingCommas,
} from '../utils/functions';

import { Button } from '../styles/shared/Buttons';
import CopyCurlWrapper from '../styles/CopyCurl';
import React from 'react';
import { RootState } from '../store';
import { useSelector } from 'react-redux';

export interface CopyCurlComponentProps {}

const CopyCurlComponent: React.FC<CopyCurlComponentProps> = () => {
  const {
    tabs: { tabs: tabsArray, activeTab },
    global: {
      settings: {
        'components.showURLInput': showUrlInput,
        'components.showTabs': showTabs,
        'components.showSettings': showSettings,
      },
      showSettingsComponent,
    },
  } = useSelector((state: RootState) => state);

  const onClickHandler = (event: React.MouseEvent) => {
    event.preventDefault();
    const { url, headers, body, method } = tabsArray[activeTab];
    const params = {
      url: url,
      method: method,
      headers: {
        'content-type': 'application/json',
        ...(headers && JSON.parse(headers)),
      },
      body: JSON.parse(fixTrailingCommas(body)),
    };
    copyToClipBoard(CurlGenerator(params));
  };

  return (
    <CopyCurlWrapper
      showUrlInput={showUrlInput}
      showTabs={showTabs}
      showSettings={showSettings}
      showSettingsComponent={showSettingsComponent}
    >
      <Button onClick={onClickHandler}>COPY CURL</Button>
    </CopyCurlWrapper>
  );
};

export default CopyCurlComponent;
