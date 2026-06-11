import styled, { StyledComponent } from 'styled-components';

export const Button = styled.button`
  outline: none;
  border: none;
  height: 30px;
  width: 100%;
  background: ${({ theme }) => theme.colors.backgroundColor};
  color: ${({ theme }) => theme.colors.textColor};
  cursor: pointer;
  border-radius: 0;
  font-size: 0.75rem;
  padding: 8px 15px;
  text-align: center;
  line-height: 1;
  &:hover {
    filter: brightness(65%) grayscale(30%);
  }

  &:active {
    filter: unset;
  }
`;

export const SaveSettingsButton = styled(Button)`
  line-height: 0;
  width: 125px;
  position: absolute;
  z-index: 16;
  top: 0;
  right: 0;
  transform: translate(-20px, 169%);
  font-size: 0.9375rem;
  filter: brightness(85%);
  &:hover {
    filter: brightness(100%);
  }
  &:active {
    filter: brightness(120%);
  }
`;

export const SettingsButton = styled.button`
  z-index: 16;
  display: flex;
  height: 42px;
  width: 42px;
  align-items: center;
  justify-content: center;
  background: transparent;
  cursor: pointer;
  user-select: none;
  border-radius: 50%;
  border: none;
  overflow: hidden;

  &.hide-tabs {
    top: 48px;
    right: 11px;

    &.hide-url {
      top: 0px;
      right: 10px;
    }
  }

  svg {
    filter: brightness(0.7);
    position: relative;
    left: -1px;
    fill: ${({ theme }) => theme.colors.backgroundColorAlt};
  }

  svg:hover {
    filter: brightness(1);
  }

  &:active {
    svg {
      transform: scale(0.95);
    }
  }
`;

export const BeautifyButton = styled(Button)`
  position: absolute;
  top: 0;
  right: 18px;
  width: fit-content;
  height: fit-content;
  background: none;
  padding: 5px 2px;
  color: #75beff;
  text-decoration: underline;
  font-size: 0.75rem;
`;

export const ShareButton = styled(Button)`
  display: flex;
  align-items: center;
  width: fit-content;
  height: fit-content;
  align-self: center;
  background: ${({ theme }) => theme.colors.primaryColor};
  font-size: 0.8125rem;
  color: white;
  padding: 0 10px;
  height: 1.5625rem;
  line-height: 1.5625rem;
  filter: brightness(85%);

  svg {
    height: 12px;
    max-width: 10px;
    margin-right: 0.3125rem;
  }

  &:hover {
    filter: brightness(100%);
  }
  &:active {
    filter: brightness(120%);
  }
`;

export const ExecuteButton: StyledComponent<
  'button',
  any,
  {},
  never
> = styled.button`
  box-sizing: border-box;
  position: absolute;
  top: 0;
  right: 7px;
  z-index: 15;
  transform: translate(50%, 100%);
  display: flex;
  height: 60px;
  width: 60px;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.backgroundColor};
  cursor: pointer;
  user-select: none;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.colors.borderColor};

  svg {
    position: relative;
    left: -1px;
    fill: ${({ theme }) => theme.colors.textColor};
  }

  .loader-svg {
    stroke: ${({ theme }) => theme.colors.textColor};
  }
  &:active {
    box-shadow: inset 0 0 3px ${({ theme }) => theme.colors.borderColor};
    svg {
      top: 1px;
    }
  }
  &:disabled {
    cursor: not-allowed;
    box-shadow: none;
    filter: brightness(0.5);
    svg {
      top: unset;
    }
  }

  .cancel-btn {
    width: max-content;
    left: 110%;
    position: absolute;
    background-color: ${({ theme }) => theme.colors.borderColor};
    filter: brightness(0.9);

    &:hover,
    &:active {
      filter: brightness(1.1);
    }
  }
`;

export const EmbedCodeButton = styled(ShareButton)`
  width: 181.98px;
  position: static;
  transform: none;
  margin: 1rem auto;
  padding: 0.9375rem;
  font-size: 0.875rem;
  overflow: hidden;

  &:disabled {
    filter: grayscale(1);
    cursor: default;
  }
`;
