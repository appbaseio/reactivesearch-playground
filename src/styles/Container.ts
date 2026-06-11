import styled from 'styled-components';

const Container = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.colors.backgroundColor};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-sizing: border-box !important;
`;
export default Container;
