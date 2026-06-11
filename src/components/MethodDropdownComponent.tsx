import React, { useState, useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import { RootState } from '../store';
import { updateCurrentTabConfig } from '../store/slices/tabs';
import {
  SelectWrapper,
  SelectHeader,
  SelectListWrapper,
} from '../styles/MethodDropdown';
import { METHODS } from '../utils/constants';

const MethodDropdownComponent = () => {
  const dispatch = useDispatch();
  const {
    tabs: { tabs: tabsArray, activeTab },
    global: {
      settings: {
        'components.showURLInput': showUrlInput,
        'components.showTabs': showTabs,
        'components.showSettings': showSettings,
        'components.showCopyCURL': showCopyCURL,
      },
    },
  } = useSelector(
    ({ tabs, global }: RootState) => ({ tabs, global }),
    shallowEqual
  );
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState(
    tabsArray[activeTab].method ?? METHODS.POST
  );
  const toggle = () => setOpen(!open);

  useEffect(() => {
    if (tabsArray[activeTab].method !== selection) {
      dispatch(updateCurrentTabConfig({ method: selection }));
    }
  }, [selection]);

  useEffect(() => {
    if (
      tabsArray[activeTab].method &&
      selection !== tabsArray[activeTab].method
    )
      setSelection(tabsArray[activeTab].method);
  }, [activeTab]);

  return (
    <SelectWrapper
      showUrlInput={showUrlInput}
      showTabs={showTabs}
      showSettings={showSettings}
      showCopyCURL={showCopyCURL}
    >
      <SelectHeader
        title="Select Method type"
        tabIndex={0}
        role="button"
        onClick={toggle}
      >
        <p className="title">{selection}</p>
      </SelectHeader>
      {open && (
        <SelectListWrapper>
          {Object.values(METHODS).map(item => (
            <li
              tabIndex={1}
              className={`${selection === item ? 'selected' : ''}`}
              key={item}
              onBlur={toggle}
            >
              <button
                type="button"
                onClick={() => {
                  setSelection(item);
                  setOpen(false);
                }}
              >
                <span>{item}</span>
              </button>
            </li>
          ))}
        </SelectListWrapper>
      )}
    </SelectWrapper>
  );
};

export default MethodDropdownComponent;
