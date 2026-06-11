import React from 'react';
import styled from 'styled-components';

interface CloseIconProps extends React.HTMLAttributes<HTMLElement> {
  showCloseButton?: boolean;
}

export const CloseIcon = styled.span<CloseIconProps>`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.625rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textColor};
  pointer-events: ${({ showCloseButton }) =>
    showCloseButton ? 'unset' : 'none'};
  opacity: ${({ showCloseButton }) => (showCloseButton ? '100%' : '0')};
  cursor: pointer;
`;

interface CloseIconComponentProps extends React.HTMLAttributes<HTMLElement> {
  showCloseButton?: boolean;
  onClick?: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
}

const CloseIconComponent: React.FC<CloseIconComponentProps> = ({
  onClick,
  showCloseButton = true,
}) => {
  return (
    <CloseIcon onClick={onClick} showCloseButton={showCloseButton}>
      &#x2715;
    </CloseIcon>
  );
};

export default CloseIconComponent;
