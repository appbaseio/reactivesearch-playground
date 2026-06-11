import React, { useCallback, useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import { RootState } from '../store';
import { fetchMappingsForCurrentUrl } from '../store/slices/mappings';
import { fetchAPISchema } from '../store/slices/tabs';
import { updateUrl } from '../store/slices/tabs';
import { Input, InputWrapper } from '../styles/Input';
import { useDebounce } from '../utils/hooks';

const InputComponent = () => {
  const dispatch = useDispatch();
  const { tabs: tabsArray, activeTab } = useSelector(
    ({ tabs }: RootState) => tabs,
    shallowEqual
  );
  const [inputUrl, setInputUrl] = useState('');
  const debouncedInputUrl: string = useDebounce<string>(inputUrl, 50);
  const activeTabURL = tabsArray[activeTab].url;

  const updateCurrentTabURLinStore = useCallback(
    urlValue => {
      dispatch(updateUrl({ url: urlValue }));
    },
    [dispatch]
  );

  useEffect(
    () => {
      if (activeTabURL !== inputUrl) {
        updateCurrentTabURLinStore(inputUrl);
      }
    },
    [debouncedInputUrl] // Only call effect if debounced inputurl term changes
  );

  useEffect(() => {
    if (activeTabURL !== inputUrl) {
      setInputUrl(activeTabURL);
      updateCurrentTabURLinStore(activeTabURL);
    }
    dispatch(fetchAPISchema());
  }, [activeTabURL, updateCurrentTabURLinStore]);

  const handleUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      updateCurrentTabURLinStore(inputUrl);
    }
  };
  const handleOnBlur = () => {
    dispatch(fetchMappingsForCurrentUrl({}));
  };

  return (
    <InputWrapper>
      <Input
        type="url"
        placeholder="Enter Reactivesearch URL"
        onChange={handleUrlChange}
        autoComplete="on"
        name="urlInput"
        id="urlInput"
        value={inputUrl}
        onBlur={handleOnBlur}
        onKeyPress={handleKeyPress}
      />
    </InputWrapper>
  );
};

export default InputComponent;
