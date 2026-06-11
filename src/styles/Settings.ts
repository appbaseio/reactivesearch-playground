import styled from 'styled-components';

const Settings = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  height: 100%;
  width: 100%;
  z-index: 15;
  background: ${({ theme }) => theme.colors.backgroundColor};
  padding-top: 44px;
`;
export default Settings;
