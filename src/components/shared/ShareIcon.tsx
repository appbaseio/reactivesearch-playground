import React from 'react';
import styled from 'styled-components';

const ShareSvg = styled.svg`
  box-sizing: border-box;
  padding: 0px 8px;
  background-color: transparent;
  color: rgb(255, 255, 255);
  display: inline-flex;
  -webkit-box-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  align-items: center;
  flex: 0 0 auto;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  border: none;
  border-radius: 2px;
  transition: all 100ms ease-in 0s;
  text-decoration: none;
  width: fit-content;
  padding: 0;
`;

const ShareIcon = () => {
  return (
    <ShareSvg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.6 10.4125V13.6937L16 8.0875L9.6 2.5V5.6875C3.38 6.49375 0.9 10.4875 0 14.5C2.22 11.6875 5.16 10.4125 9.6 10.4125V10.4125Z"
        fill="currentColor"
      ></path>
    </ShareSvg>
  );
};

export default ShareIcon;
