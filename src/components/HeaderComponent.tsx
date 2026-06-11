import CopyCurlComponent from './CopyCurlComponent';
import Header, { ButtonContainer } from '../styles/Header';
import InputComponent from './InputComponent';
import React from 'react';
import { RootState } from '../store';
import SettingsButtonComponent from './SettingsButtonComponent';
import TabsComponent from './TabsComponent';
import UrlContainer from '../styles/UrlContainer';
import { useDispatch, useSelector } from 'react-redux';
import MethodDropdownComponent from './MethodDropdownComponent';
import { isWindowEmbedded } from '../utils/functions';
import { toggleEmbed } from '../store/slices/global';
import { ShareButton } from '../styles/shared/Buttons';
import ShareIcon from './shared/ShareIcon';
import Flex from '../styles/Flex';

interface HeaderComponentProps {}

const HeaderComponent: React.FC<HeaderComponentProps> = () => {
  const dispatch = useDispatch();
  const {
    global: {
      settings: {
        'components.showURLInput': showUrlInput,
        'components.showTabs': showTabs,
        'components.showSettings': showSettings,
        'components.showCopyCURL': showCopyCURL,
        'components.showMethod': showMethod,
      },
      showSettingsComponent,
      isEmbedded,
    },
  } = useSelector((state: RootState) => state);

  const handleClickShareButton = () => {
    dispatch(toggleEmbed());
  };

  const renderSettingsButtonClasses = () => {
    let classesString = '';
    if (showSettingsComponent) {
      return (classesString += 'convertToClose');
    }
    if (!showUrlInput) {
      classesString += ' hide-url';
    }
    if (!showTabs) {
      classesString += ' hide-tabs';
    }
    return classesString;
  };
  return (
    <Header>
      <Flex>
        {showTabs && <TabsComponent />}

        <ButtonContainer>
          {showSettings && (
            <SettingsButtonComponent classes={renderSettingsButtonClasses()} />
          )}

          {!isEmbedded && (
            <ShareButton onClick={handleClickShareButton}>
              <ShareIcon />
              Share
            </ShareButton>
          )}
        </ButtonContainer>
      </Flex>

      <UrlContainer showUrlInput={showUrlInput}>
        {!isWindowEmbedded() && showMethod && <MethodDropdownComponent />}
        {showUrlInput && <InputComponent />}
        {showCopyCURL && <CopyCurlComponent />}
      </UrlContainer>
    </Header>
  );
};

export default HeaderComponent;
