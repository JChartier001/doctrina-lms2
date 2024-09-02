'use client';

import DarkModeTwoToneIcon from '@mui/icons-material/DarkModeTwoTone';
import LightModeTwoToneIcon from '@mui/icons-material/LightModeTwoTone';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import { useContext, useMemo } from 'react';

import { ThemeContext } from '../providers/ThemeContext';

const ThemeToggle = () => {
  const theme = useTheme();
  const { mode, setMode } = useContext(ThemeContext);
  const activateName = useMemo(() => (theme.palette.mode === 'dark' ? 'Light' : 'Dark'), [theme]);

  return (
    <>
      <Tooltip title={`Activate ${activateName} Mode`}>
        <IconButton
          onClick={() => setMode(!mode)}
          sx={{
            p: 1,
            border: 'none',
          }}
          size="large"
        >
          {theme.palette.mode === 'dark' ? <LightModeTwoToneIcon /> : <DarkModeTwoToneIcon />}
        </IconButton>
      </Tooltip>
    </>
  );
};

export default ThemeToggle;
