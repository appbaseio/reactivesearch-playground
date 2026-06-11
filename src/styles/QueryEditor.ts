import styled from 'styled-components';

const QueryEditor = styled.div`
  position: relative;
  height: 100%;
  flex: 1;
`;

export default QueryEditor;

export const AutoCompletionTriggerFooter = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  color: ${({ theme }) => theme.colors.textColor};
  background: ${({ theme }) => theme.colors.backgroundColorAlt};
  padding: 0.375rem 0.375rem 0.1875rem;
  line-height: 0.8125rem;
  font-size: 0.6875rem;
`;

export const KeyImpression = styled.span`
  display: inline-block;
  box-shadow: 0 0 2px ${({ theme }) => theme.colors.textColor};
  padding: 1px 2.5px;
  cursor: default;
  border-radius: 3px;
`;
