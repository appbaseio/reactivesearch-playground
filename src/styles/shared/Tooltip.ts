import styled from 'styled-components';

export const TooltipContainer = styled.div<{
  visible: boolean;
  position: { x: number; y: number };
}>`
  position: fixed;
  background-color: ${({ theme }) => theme.colors.textColor};
  border: 1px solid ${({ theme }) => theme.colors.backgroundColor};
  color: ${({ theme }) => theme.colors.backgroundColorlineContent};
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 100;
  pointer-events: auto;
  display: ${props => (props.visible ? 'block' : 'none')};
  top: ${props => props.position.y}px;
  left: ${props => props.position.x}px;
  pre {
    white-space: -moz-pre-wrap; /* Mozilla, supported since 1999 */
    white-space: -pre-wrap; /* Opera */
    white-space: -o-pre-wrap; /* Opera */
    white-space: pre-line; /* CSS3 - Text module (Candidate Recommendation) http://www.w3.org/TR/css3-text/#white-space */
    word-wrap: break-word; /* IE 5.5+ */
  }
`;
