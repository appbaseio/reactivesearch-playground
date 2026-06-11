import styled from 'styled-components';

interface UrlContainerProps {
  showUrlInput?: boolean;
}
const UrlContainer = styled.div<UrlContainerProps>`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background: ${({ theme }) => theme.colors.backgroundColorAlt};
  max-height: 3.125rem;
  gap: 0.5rem;

  ${({ showUrlInput }) =>
    !showUrlInput &&
    `
    position: relative;
    padding: 0;
    height:0;
  `}
`;

export default UrlContainer;
