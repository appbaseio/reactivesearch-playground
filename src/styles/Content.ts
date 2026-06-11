import styled from 'styled-components';

interface ContentWrappperProps {}

export const ContentWrappper = styled.div<ContentWrappperProps>`
  display: flex;
  flex: 1;
  height: calc(100% - 95px);
  overflow-x: scroll;
  overflow-y: hidden;
`;

export const QueryArea = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1 1 40%;
`;

export const ResponseArea = styled.div`
  flex: 1 1 60%;
  position: relative;
  min-width: 360px;
  height: 100%;
`;
