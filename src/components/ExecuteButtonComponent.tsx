import { Button, ExecuteButton } from '../styles/shared/Buttons';
import PlayIcon from './shared/PlayIcon';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { fetchResponse } from '../store/slices/tabs';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import LoaderIcon from './shared/LoaderIcon';

interface ExecuteButtonProps {
  disableButton?: boolean | undefined;
}

const ExecuteButtonComponent = ({ disableButton }: ExecuteButtonProps) => {
  const dispatch = useDispatch();
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const [showCancelButton, setShowCancelButton] = useState(false);

  const {
    tabs: { tabs: tabsArray, activeTab },
  } = useSelector((state: RootState) => state);
  const { isFetching } = tabsArray[activeTab];
  const handleClick = useCallback(
    (_e?: React.MouseEvent) => {
      // Initialize an AbortController and store it in the ref
      abortControllerRef.current = new AbortController();
      dispatch(fetchResponse(abortControllerRef.current));
    },
    [dispatch]
  );
  const handleAbortClick = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);
  useEffect(() => {
    if (isFetching) {
      timeoutRef.current = window.setTimeout(() => {
        setShowCancelButton(true);
      }, 5000);
    } else {
      setShowCancelButton(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isFetching]);

  useEffect(() => {
    function handleKeyPress(event: React.KeyboardEvent) {
      if (event.ctrlKey && event.key === 'Enter') {
        handleClick();
      }
    }

    document.addEventListener('keydown', handleKeyPress as () => void);

    return () => {
      document.removeEventListener('keydown', handleKeyPress as () => void);
    };
  }, [handleClick]);
  return (
    <ExecuteButton type="button" disabled={disableButton} onClick={handleClick}>
      {isFetching ? <LoaderIcon /> : <PlayIcon />}
      {showCancelButton && (
        <Button onClick={handleAbortClick} className="cancel-btn">
          Cancel
        </Button>
      )}
    </ExecuteButton>
  );
};

export default ExecuteButtonComponent;
