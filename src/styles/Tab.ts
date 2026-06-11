import styled, { css } from 'styled-components';

interface TabComponentProps extends React.HTMLAttributes<HTMLElement> {
  isActiveTab?: boolean;
  isDragged: boolean;
  isDraggedOver: boolean;
  dragDirection?: string;
}

export const Tab = styled.div<TabComponentProps>`
  cursor: pointer;
  border-top: 5px;
  padding: 5px 8px 5px 15px;
  background: ${({ theme }) => theme.colors.backgroundColorAlt};
  color: ${({ theme }) => theme.colors.textColor};
  display: flex;
  align-items: center;
  margin-left: 5px;
  font-size: 0.875rem;
  ${props => (!props.isActiveTab ? 'filter: brightness(75%);' : '')}

  &:hover {
    ${props => (!props.isActiveTab ? 'filter: brightness(90%);' : '')}
  }
  ${({ isDragged }) =>
    isDragged &&
    css`
      opacity: 0.5;
      cursor: grabbing;
    `}
  ${({ isDraggedOver, dragDirection }) => {
    return isDraggedOver
      ? dragDirection &&
          css`
            ${dragDirection === 'left' &&
              css`
                margin-left: 5px;
              `}
            ${dragDirection === 'right' &&
              css`
                margin-right: 5px;
              `}
          `
      : css`
          margin-left: 5px;
          margin-right: 0px;
        `;
  }}
`;

interface EditTabNameInputProps extends React.HTMLAttributes<HTMLElement> {
  editMode?: boolean;
}

export const EditTabNameInputWrapper = styled.div`
  height: 100%;
  width: 100%;
`;

export const EditTabNameInput = styled.input<EditTabNameInputProps>`
  border: none;
  background: transparent;
  border-bottom: 1px solid ${({ theme }) => theme.colors.textColor};
  caret-color: ${({ theme }) => theme.colors.textColor};
  color: ${({ theme }) => theme.colors.textColor};
  padding: 0;
  height: 100%;
  width: 15ch;
  outline: none;
  position: relative;
  left: -3px;
  font-size: 0.875rem;
`;
