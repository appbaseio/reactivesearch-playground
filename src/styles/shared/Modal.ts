import styled from 'styled-components';

export const ModalWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 700;
  width: inherit;
  outline: 0;
  height: min(95%, 95vh);
  width: min(95%, 95vw);
  box-shadow: rgb(0 0 0 / 12%) 0px 4px 4px, rgb(0 0 0 / 24%) 0px 16px 32px;
`;
export const ModalBackdrop = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 500;
`;
export const ModalStyled = styled.div`
  z-index: 100;
  background: ${({ theme }) => theme.colors.backgroundColor};
  position: relative;
  margin: auto;
  height: 100%;
  width: 100%;
  color: ${({ theme }) => theme.colors.textColor};
  border: 1px solid ${({ theme }) => theme.colors.backgroundColorAlt};
  box-sizing: border-box;
  font-family: ${({ theme }) => theme.typography.fontFamily};
`;
export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.1875rem;
`;
export const ModalHeaderText = styled.div`
  color: #fff;
  align-self: center;
  color: ${({ theme }) => theme.colors.textColor};
`;
export const ModalCloseButton = styled.button`
  font-size: 0.5rem;
  border: none;
  border-radius: 3px;
  margin-left: 0.3125rem;
  background: none;
  :hover {
    cursor: pointer;
  }
`;
export const ModalContent = styled.div`
  padding: 10px;
  max-height: 18.75rem;
  overflow-x: hidden;
  overflow-y: auto;
`;
