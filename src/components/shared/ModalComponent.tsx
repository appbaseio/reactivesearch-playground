import React from 'react';

import {
  ModalBackdrop,
  ModalStyled,
  ModalWrapper,
} from '../../styles/shared/Modal';
// import CloseIconComponent from './CloseIconComponent';

export interface ModalComponentProps {
  isShown: boolean;
  children: React.ReactChild | React.ReactChildren;
  headerText?: string;
  onClose: () => void;
}

const ModalComponent: React.FC<ModalComponentProps> = ({
  isShown,
  onClose,
  // headerText,
  children,
}) => {
  const handleBackDropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };
  const modal = (
    <>
      <ModalBackdrop onClick={handleBackDropClick} />
      <ModalWrapper>
        <ModalStyled>
          {children}
          {/* <ModalHeader>
            <ModalHeaderText>{headerText}</ModalHeaderText>
            <CloseIconComponent onClick={onClose} />
          </ModalHeader> */}
          {/* <ModalContent>{children}</ModalContent> */}
        </ModalStyled>
      </ModalWrapper>
    </>
  );

  return isShown ? modal : null;
};

export default ModalComponent;
