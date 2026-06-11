import styled from 'styled-components';

export const Share = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
`;

export const ShareLeftCol = styled.div`
  height: 100%;
  width: 30%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${({ theme }) => theme.colors.backgroundColorAlt};
`;

export const ShareConfigOptions = styled.div`
  width: 100%;
  height: 65%;
  overflow: hidden;
  position: relative;
  border-bottom: 1px solid ${({ theme }) => theme.colors.backgroundColorAlt};
`;

export const ShareConfigOptionsHeader = styled.h2`
  padding: 0.625rem;
  width: 100%;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.backgroundColorAlt};
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8125rem;
`;

export const ShareLinkProvider = styled.div`
  width: 100%;
  height: 35%;
  position: relative;
`;

export const ShareLinkProviderHeader = styled.h2`
  padding: 0.625rem;
  width: 100%;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.backgroundColorAlt};
  height: 36px;
  font-size: 0.8125rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  svg {
    height: 42px;
    position: relative;
    right: -11px;
  }
`;

export const ShareLinkProviderBody = styled.div`
  padding: 0.625rem;
  width: 100%;
  padding: 0.625rem;
  width: 100%;
  display: flex;
  height: calc(100% - 36px);
  flex-direction: column;
  justify-content: flex-start;
  overflow-y: scroll;
`;

export const IframeCodeTextAreaWrapper = styled.div`
  position: relative;
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 19px;
  position: relative;
  button {
    width: fit-content;
    height: fit-content;
    display: flex;
    align-items: center;
    cursor: pointer;
    position: absolute;
    padding: 5px;
    right: 0px;
    top: 19px;
    z-index: 2;
    font-size: 0.8125rem;
    background: ${({ theme }) => theme.colors.backgroundColor};
    opacity: 0.8;
    svg {
      height: 15px;

      margin-right: 3px;
    }
  }
`;
export const IframeCodeTextArea = styled.textarea`
  font-size: 0.8125rem;
  background-color: ${({ theme }) => theme.colors.backgroundColorAlt};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  color: ${({ theme }) => theme.colors.textColor};
  appearance: none;
  outline: none;
  min-height: 5rem;
  padding: 8px;
  width: 100%;
  resize: none;
  line-height: 1.2;
  overflow: hidden;
  box-sizing: border-box;
`;

export const EmbedUrlInputWrapper = styled.div`
  width: 100%;
  font-size: 0.8125rem;
  margin-top: 0.8125rem;
  font-weight: 600;
  line-height: 19px;
  position: relative;
  input {
    font-size: 0.8125rem;
    background-color: ${({ theme }) => theme.colors.backgroundColorAlt};
    border: 1px solid ${({ theme }) => theme.colors.borderColor};
    color: ${({ theme }) => theme.colors.textColor};
    box-sizing: border-box;
  }

  button {
    width: fit-content;
    height: fit-content;
    display: none;
    align-items: center;
    cursor: pointer;
    position: absolute;
    padding: 5px;
    right: 0px;
    transform: translateY(-101%);
    height: 35px;
    z-index: 2;
    font-size: 0.8125rem;
    background: ${({ theme }) => theme.colors.backgroundColor};
    opacity: 0.8;
    svg {
      height: 15px;

      margin-right: 3px;
    }
  }

  &:hover {
    button {
      display: flex;
    }
  }
`;

export const ShareRightCol = styled.div`
  height: 100%;
  width: 70%;
  display: flex;
  align-items: center;
  pointer-events: none;
  background: ${({ theme }) => theme.colors.backgroundColor};
  color: ${({ theme }) => theme.colors.textColor};
`;

export const PreviewFrame = styled.iframe`
  height: 100%;
  width: 100%;
  background: ${({ theme }) => theme.colors.textColor};
`;

export const PreviewPlaceHolder = styled.h1`
  margin: auto;
  font-size: 1.5rem;
  text-align: center;
`;
