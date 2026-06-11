import styled from 'styled-components';

export const ResponseEditor = styled.div`
  height: 100%;
  position: relative;
`;

export const ResponseEditorPlaceholder = styled.span`
  position: absolute;
  inset: 0;
  z-index: 13;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textColor};
  font-size: 1rem;
  line-height: 1.5;
  text-align: center;
  flex-direction: column;
`;
