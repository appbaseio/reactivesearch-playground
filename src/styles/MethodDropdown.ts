import styled from 'styled-components';

interface SelectWrapperWrapperProps {
  showTabs: boolean;
  showUrlInput: boolean;
  showSettings: boolean;
  showCopyCURL: boolean;
}

const getRightOffset = (
  showSettings: boolean,
  showTabs: boolean,
  showCopyCURL: boolean
): string => {
  if (!showTabs) {
    if (showSettings && showCopyCURL) {
      return '170px';
    } else if (showSettings) {
      return '60px';
    } else if (showCopyCURL) {
      return '135px';
    } else {
      return '32px';
    }
  } else {
    if (showCopyCURL) {
      return '130px';
    } else {
      return '32px';
    }
  }
};

export const SelectWrapper = styled.div<SelectWrapperWrapperProps>`
  flex-basis: 90px;
  min-width: 70px;
  align-self: stretch;
  position: relative;
  background: ${({ theme }) => theme.colors.backgroundColor};
  border: 0;
  color: ${({ theme }) => theme.colors.textColor};
  font-size: 0.75rem;
  letter-spacing: 0.0625em;

  ${({ showUrlInput, showSettings, showTabs, showCopyCURL, theme }) =>
    !showUrlInput &&
    `
    height:30px;
    width:90px;
    position: absolute;
    top: 6px;
    right: ${getRightOffset(showSettings, showTabs, showCopyCURL)};
    z-index: 14;
    box-shadow: 0 0px 1px ${theme.colors.textColor};
    background: ${theme.colors.backgroundColorAlt};
    ul{
      right:0;
    }
  `}
`;

export const SelectHeader = styled.div`
  height: 100%;
  padding-left: 7px;
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  &:hover {
    filter: brightness(65%) grayscale(30%);
  }
  :active {
    filter: brightness(120%);
  }
  p.title {
    font-size: 0.8rem;
  }

  &::after {
    content: '⌄';
    position: absolute;
    top: 0%;
    right: 5px;
    font-size: 20px;
    color: ${({ theme }) => theme.colors.textColor};
    line-height: 1;
  }
`;

export const SelectListWrapper = styled.ul`
  position: absolute;
  z-index: 1;
  margin-top: 2px;
  width: 140%;
  list-style: none;
  border: 1px solid ${({ theme }) => theme.colors.backgroundColorAlt};
  li {
    &.selected {
      position: relative;

      &::after {
        content: '✔';
        position: absolute;
        top: 44%;
        right: 5px;
        transform: translateY(-50%);
        font-size: 20px;
        color: ${({ theme }) => theme.colors.textColor};
      }
    }

    button {
      text-align: left;
      padding: 5px 7px;
      width: 100%;
      height: 100%;
      outline: none;
      background: none;
      border: none;
      cursor: pointer;
      background: ${({ theme }) => theme.colors.backgroundColor};
      transition: all 0.1s ease-out;
      span {
        font-family: ${({ theme }) => theme.typography.fontFamily};
        color: ${({ theme }) => theme.colors.textColor};
      }
      &:hover {
        background: ${({ theme }) => theme.colors.backgroundColorAlt};
      }
    }
  }
`;

export const Option = styled.option`
  width: 100%;
  outline: 0;
  padding: 8px 10px;
  background: ${({ theme }) => theme.colors.backgroundColor};
  border: 0;
  color: ${({ theme }) => theme.colors.textColor};
  font-size: 0.75rem;
  letter-spacing: 0.0625em;
`;
