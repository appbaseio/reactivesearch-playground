import styled from 'styled-components';
interface CopyCurlWrapperProps {
  showTabs?: boolean;
  showUrlInput?: boolean;
  showSettings?: boolean;
  showSettingsComponent?: boolean;
}

const CopyCurlWrapper = styled.div<CopyCurlWrapperProps>`
  margin-left: 0.375rem;
  width: 100px;
  height: 100%;

  ${({ showUrlInput, theme, showSettings, showSettingsComponent, showTabs }) =>
    !showUrlInput &&
    `
    position: absolute;
    top: 6px;
    right: ${!showTabs && showSettings ? '55px' : '20px'};
    z-index: 16;

    button{
      ${showSettingsComponent ? `display: none` : ''};
       box-shadow: 0 0px 1px ${theme.colors.textColor};
       background: ${theme.colors.backgroundColorAlt};
    }
  `}
`;

export default CopyCurlWrapper;
