import { AddTabIconWrapper, Tabs } from '../styles/Tabs';
import { useDispatch, useSelector } from 'react-redux';

import AddTabIcon from './shared/AddTabIcon';
import React, { useState } from 'react';
import { RootState } from '../store';
import TabComponent from './TabComponent';
import { addNewTab, updateTabs } from '../store/slices/tabs';

export interface DraggableProps {
  onDragStart: (index: number) => (e: React.DragEvent) => void;
  onDragOver: (index: number) => (e: React.DragEvent) => void;
  onDrop: (index: number) => (e: React.DragEvent) => void;
}

const TabsComponent = () => {
  const {
    tabs: { tabs },
  } = useSelector((state: RootState) => state);
  const dispatch = useDispatch();
  const [dragOverTabIndex, setDragOverTabIndex] = useState<{
    index: number;
    direction: string;
  } | null>(null);
  const [draggedTabIndex, setDraggedTabIndex] = useState<number | null>(null);

  const handleAddTab = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(addNewTab());
  };

  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    setDraggedTabIndex(index);
  };

  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const draggingDirection =
      e.clientX > e.currentTarget.getBoundingClientRect().right
        ? 'right'
        : 'left';
    setDragOverTabIndex({ index, direction: draggingDirection });
  };

  const handleDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const fromIndex = Number(e.dataTransfer.getData('text/plain'));
    moveTab(fromIndex, index);
    setDraggedTabIndex(null);
    setDragOverTabIndex(null);
  };

  const moveTab = (fromIndex: number, toIndex: number) => {
    const updatedTabs = [...tabs];
    const movedTab = updatedTabs.splice(fromIndex, 1)[0];
    updatedTabs.splice(toIndex, 0, movedTab);
    dispatch(updateTabs({ tabs: updatedTabs, activeTab: toIndex })); // You need to create this action and update the state in your Redux store
  };

  const renderTabs = (tabsArr: {}[]) => {
    if (tabsArr.length === 0) {
      return;
    }

    return tabsArr.map((_tab: Record<string, any>, index) => (
      <TabComponent
        key={index + _tab.tabTitle}
        tabIndex={index}
        tabTitle={_tab.tabTitle}
        showCloseButton={tabsArr.length > 1}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        isDragged={index === draggedTabIndex}
        isDraggedOver={
          (dragOverTabIndex && dragOverTabIndex.index === index) || false
        }
        dragDirection={
          (dragOverTabIndex && dragOverTabIndex.direction) || undefined
        }
      />
    ));
  };
  return (
    <Tabs>
      {renderTabs(tabs)}

      <AddTabIconWrapper onClick={handleAddTab}>
        <AddTabIcon />
      </AddTabIconWrapper>
    </Tabs>
  );
};

export default TabsComponent;
