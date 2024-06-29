import React from 'react';
import Stack from '@mui/material/Stack';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return <Stack sx={{
        justifyContent: 'center', alignItems: 'center', height: '100%', bgcolor: 'background.default'
     }}>{children}</Stack>;
};

export default AuthLayout;
