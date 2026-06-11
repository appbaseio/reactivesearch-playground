import styled from 'styled-components';

const OpenInNewTab = styled.a`
  cursor: pointer;
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: fit-content;
  height: fit-content;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 0.1rem;
  background: ${({ theme }) => theme.colors.backgroundColorAlt};
  color: ${({ theme }) => theme.colors.textColor};
  font-size: 0.75rem;
  padding: 0.5rem;
  text-decoration: none;
  z-index: 14;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  transition: all 0.2s ease-in-out;

  &:hover {
    filter: brightness(1.2);
  }

  &:active {
    filter: brightness(0.9);
  }
`;

export default OpenInNewTab;
