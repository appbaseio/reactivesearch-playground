// Tooltip.tsx
import React from 'react';
import XSS from 'xss';
import { TooltipContainer } from '../../../styles/shared/Tooltip';

interface TooltipProps {
  content: string;
  visible: boolean;
  position: {
    x: number;
    y: number;
  };
}

const Tooltip: React.FC<TooltipProps> = ({ content, visible, position }) => {
  return (
    <TooltipContainer visible={visible} position={position}>
      <pre
        dangerouslySetInnerHTML={{
          __html: XSS(content),
        }}
      ></pre>
    </TooltipContainer>
  );
};

export default Tooltip;
