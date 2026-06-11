import styled from 'styled-components';

const LoadingContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  svg {
    height: 50vh;
    path {
      fill: black;
    }
  }
`;

export default LoadingContainer;
