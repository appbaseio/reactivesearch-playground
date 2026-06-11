import { EditTabNameInput, EditTabNameInputWrapper, Tab } from '../styles/Tab';
import React, { useState, useEffect } from 'react';
import {
  removeTab,
  setActiveTab,
  updateCurrentTabConfig,
} from '../store/slices/tabs';
import { DraggableProps } from './TabsComponent';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../store';
import CloseIconComponent from './shared/CloseIconComponent';

// let timer: NodeJS.Timer;

export interface TabComponentProps extends DraggableProps {
  tabIndex: number;
  tabTitle: string;
  showCloseButton: boolean;
  isDragged: boolean;
  isDraggedOver: boolean;
  dragDirection?: string;
}

const TabComponent: React.FC<TabComponentProps> = ({
  tabIndex,
  tabTitle,
  showCloseButton,
  onDragStart,
  onDragOver,
  onDrop,
  isDragged,
  isDraggedOver,
  dragDirection,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [tabText, setTabText] = useState('');
  const { activeTab } = useSelector((state: RootState) => state.tabs);
  const dispatch = useDispatch();

  const handleTabClick = (event: React.MouseEvent<HTMLElement>) => {
    // clearTimeout(timer);
    if (event.detail === 1) {
      // timer = setTimeout(() =>
      activeTab !== tabIndex && dispatch(setActiveTab(tabIndex));
      // , 200);
    } else if (event.detail === 2) {
      !editMode && setEditMode(true);
    }
  };

  const handleTabRemove = (
    e: React.MouseEvent<HTMLElement>,
    tabIndex: number
  ) => {
    e.stopPropagation();
    dispatch(removeTab(tabIndex));
  };

  const onChangeTabText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTabText(e.target.value);
  };

  const onBlurTabInput = () => {
    dispatch(updateCurrentTabConfig({ tabTitle: tabText }));
    setEditMode(false);
  };

  const handleKeyPressTabInput = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onBlurTabInput();
    }
  };

  useEffect(() => {
    setTabText(tabTitle || `Tab ${tabIndex}`);
  }, []);
  return (
    <Tab
      onClick={handleTabClick}
      isActiveTab={activeTab === tabIndex}
      title={tabTitle}
      draggable={true}
      onDragStart={onDragStart(tabIndex)}
      onDragOver={onDragOver(tabIndex)}
      onDrop={onDrop(tabIndex)}
      isDragged={isDragged}
      isDraggedOver={isDraggedOver}
      dragDirection={dragDirection}
    >
      {!editMode ? (
        <>
          {' '}
          {tabTitle || `Tab ${tabIndex}`}
          <CloseIconComponent
            onClick={(e: React.MouseEvent<HTMLInputElement, MouseEvent>) =>
              handleTabRemove(e, tabIndex)
            }
            showCloseButton={showCloseButton}
          />
        </>
      ) : (
        <EditTabNameInputWrapper>
          <EditTabNameInput
            onBlur={onBlurTabInput}
            autoFocus={true}
            value={tabText}
            onChange={onChangeTabText}
            onKeyDown={handleKeyPressTabInput}
            type="text"
          />
        </EditTabNameInputWrapper>
      )}
    </Tab>
  );
};

export default TabComponent;
