import styled from 'styled-components';

export const Tag = styled.span`
  box-sizing: border-box;
  color: #000000d9;
  font-size: 14px;
  font-weight: 500;
  font-variant: tabular-nums;
  line-height: 1.5715;
  list-style: none;
  font-feature-settings: 'tnum';
  display: inline-block;
  height: auto;
  padding: 0 7px;
  line-height: 20px;
  white-space: nowrap;
  background: #fafafa;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  opacity: 1;
  transition: all 0.3s;
  margin-left: 11px;
  user-select: none;

  &.time-status {
    color: rgb(249, 107, 4);
    background: rgb(255, 202, 89);
    border-color: rgb(255, 213, 145);
  }

  &.success {
    color: rgb(37, 106, 7);
    background: rgb(177, 229, 126);
    border-color: rgb(183, 235, 143);
  }

  &.error {
    color: #f30003;
    background: #ffcdcd;
    border-color: #ffccc7;
  }
`;
