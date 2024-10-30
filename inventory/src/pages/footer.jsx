import { Box, Typography } from '@mui/material';
import React from 'react';

const Footer = () => {
  const theme = 'light';

  return (
    <Box
      sx={{
        color: theme === 'light' ? 'gray' : 'lightgray',
        textAlign: 'center',
        py: 1,
        width: '100vw',  // Ensures footer takes up the full viewport width without overflow
        position: 'absolute',
        bottom: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
        Powered by SalubreTech
      </Typography>
    </Box>
  );
};

export default Footer;
