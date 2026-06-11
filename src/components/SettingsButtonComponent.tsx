import React from 'react';
import { SettingsButton } from '../styles/shared/Buttons';
import SettingsIcon from './shared/SettingsIcon';
import { toggleSettings } from '../store/slices/global';
import { useDispatch } from 'react-redux';

interface SettingsButtonProps {
  classes?: string;
}

const SettingsButtonComponent = ({ classes }: SettingsButtonProps) => {
  const dispatch = useDispatch();

  const handleClick = (_e: React.MouseEvent) => {
    dispatch(toggleSettings());
  };
  return (
    <SettingsButton type="button" onClick={handleClick} className={classes}>
      <SettingsIcon convertToClose={classes === 'convertToClose'} />
    </SettingsButton>
  );
};

export default SettingsButtonComponent;
