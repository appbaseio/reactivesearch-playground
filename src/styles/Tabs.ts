import styled from 'styled-components';

export const Tabs = styled.div`
  display: flex;
  box-sizing: content-box;
  padding-top: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.backgroundColorAlt};
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  height: 45px;
`;

export const AddTabIconWrapper = styled.div`
  cursor: pointer;
  border-top: 5px;
  padding: 5px 10px;
  background: ${({ theme }) => theme.colors.backgroundColorAlt};
  filter: brightness(75%);
  color: ${({ theme }) => theme.colors.textColor};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 5px;
  border: 1px solid transparent;
  border-bottom: none;

  svg {
    stroke: ${({ theme }) => theme.colors.textColor};
  }

  &:hover {
    filter: unset;
  }

  &:active {
    border-color: ${({ theme }) => theme.colors.textColor};
    svg {
      position: relative;
      top: 1px;
    }
  }
`;
