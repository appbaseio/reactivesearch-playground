import styled from 'styled-components';

interface HeaderProps {}

const Header = styled.div<HeaderProps>`
  height: max-content;
  max-height: 125px;
  position: relative;
`;

export const ButtonContainer = styled.div`
  margin-left: auto;
  display: flex;
  margin-right: 5px;
  align-items: center;
`;

export default Header;
