import styled from 'styled-components';

export const InputWrapper = styled.div`
  flex: 1;
  overflow: hidden;
`;
export const Input = styled.input`
  width: 100%;
  outline: 0;
  padding: 8px 10px;
  background: ${({ theme }) => theme.colors.backgroundColor};
  border: 0;
  color: ${({ theme }) => theme.colors.textColor};
  font-size: 0.75rem;
  letter-spacing: 0.0625em;
`;
