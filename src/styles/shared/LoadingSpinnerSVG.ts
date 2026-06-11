import styled from 'styled-components';

const LoadingSpinnerSVG = styled.svg`
  height: 42px;
  width: fit-content;
  max-width: 50px;

  path {
    fill: ${({ theme }) => theme?.colors?.textColor || '#fff'};
  }
`;

export default LoadingSpinnerSVG;
