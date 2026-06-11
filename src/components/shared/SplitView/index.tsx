import React, { createRef, useEffect } from 'react';
import {
  FirstPanel,
  SecondPanel,
  SplitDivider,
  SplitView,
} from '../../../styles/shared/SplitView';
// import FirstPanelComponent from './FirstPanel';

export interface SplitViewComponentProps {
  firstPanel: React.ReactElement; // could be left/ top element
  secondPanel: React.ReactElement; // could be right/ bottom element,
  collapsePanel?: 'first' | 'second' | undefined;
  orientation?: 'vertical' | 'horizontal';
}

// The current position of mouse
let x = 0;
let y = 0;

// height of second panel
let secondPanelHeight = 0;
let secondPanelWidth = 0;

const SplitViewComponent: React.FC<SplitViewComponentProps> = ({
  firstPanel,
  secondPanel,
  collapsePanel = undefined,
  orientation = 'vertical',
}) => {
  const firstPanelRef = createRef<HTMLDivElement>();
  const dividerRef = createRef<HTMLDivElement>();
  const secondPanelRef = createRef<HTMLDivElement>();

  const handleDragStart = (clientX: number, clientY: number) => {
    if (!!collapsePanel || !secondPanelRef.current) return;

    if (orientation === 'vertical') {
      y = clientY;
      secondPanelHeight = secondPanelRef.current.getBoundingClientRect().height;
    } else {
      x = clientX;
      secondPanelWidth = secondPanelRef.current.getBoundingClientRect().width;
    }
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (dividerRef.current && firstPanelRef.current && secondPanelRef.current) {
      const cursor = orientation === 'vertical' ? 'row-resize' : 'col-resize';
      dividerRef.current.style.cursor = cursor;
      document.body.style.cursor = cursor;

      firstPanelRef.current.style.userSelect = 'none';
      firstPanelRef.current.style.pointerEvents = 'none';
      secondPanelRef.current.style.userSelect = 'none';
      secondPanelRef.current.style.pointerEvents = 'none';

      if (orientation === 'vertical') {
        const dy = y - clientY;
        const newSecondPanelHeight = secondPanelHeight + dy;
        secondPanelRef.current.style.height = `${newSecondPanelHeight}px`;
      } else {
        const dx = x - clientX;
        const newSecondPanelWidth = secondPanelWidth + dx;
        secondPanelRef.current.style.width = `${newSecondPanelWidth}px`;
      }
    }
  };

  const handleDragEnd = () => {
    if (dividerRef.current && firstPanelRef.current && secondPanelRef.current) {
      dividerRef.current.style.removeProperty('cursor');
      document.body.style.removeProperty('cursor');
      firstPanelRef.current.style.removeProperty('user-select');
      firstPanelRef.current.style.removeProperty('pointer-events');
      secondPanelRef.current.style.removeProperty('user-select');
      secondPanelRef.current.style.removeProperty('pointer-events');
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX, e.clientY);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  };

  const onMouseUp = () => {
    handleDragEnd();
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);
  };

  const onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  };

  const onTouchEnd = () => {
    handleDragEnd();
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
  };

  useEffect(() => {
    if (collapsePanel) {
      let collapsePanelRef =
        collapsePanel === 'first' ? firstPanelRef : secondPanelRef;
      if (collapsePanelRef.current) {
        collapsePanelRef.current.style.height = `0px`;
      }
    } else if (orientation === 'vertical') {
      secondPanelRef.current && (secondPanelRef.current.style.height = `40%`);
    }
  }, [collapsePanel]);

  return (
    <SplitView
      style={{ flexDirection: orientation === 'vertical' ? 'column' : 'row' }}
    >
      <FirstPanel
        style={orientation === 'vertical' ? {} : { minWidth: '20%', flex: '1' }}
        ref={firstPanelRef}
      >
        {firstPanel}
      </FirstPanel>
      {!collapsePanel && (
        <SplitDivider
          orientation={orientation}
          ref={dividerRef}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        />
      )}
      <SecondPanel
        ref={secondPanelRef}
        style={
          orientation === 'vertical'
            ? { height: '40%' }
            : { height: '100%', width: '60%', minWidth: '20%', zIndex: 1 }
        }
      >
        {secondPanel}
      </SecondPanel>
    </SplitView>
  );
};

export default SplitViewComponent;
