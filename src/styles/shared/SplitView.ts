import styled, { css } from 'styled-components';

export const SplitView = styled.div`
  max-height: 100%;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

interface SplitDividerProps {
  orientation?: 'horizontal' | 'vertical';
}
export const SplitDivider = styled.div<SplitDividerProps>`
  width: 100%;
  height: 10px;
  border: 2px solid ${({ theme }) => theme.colors.borderColor};
  cursor: row-resize;

  ${({ orientation }) =>
    orientation === 'horizontal' &&
    css`
      width: 10px;
      height: 100%;
      cursor: col-resize;
      z-index: 1;
    `};
`;

export const FirstPanel = styled.div`
  min-height: 0;
  flex: 1;
`;

export const SecondPanel = styled.div`
  height: 40%;
`;
