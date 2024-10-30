import { Button, Container, Stack, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './footer';

const Reports = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if(!localStorage.getItem('userData')) {
        navigate('/');
    }
  });
  
  const generateReport = (reportType) => {
    // Implement report generation logic here
    console.log(`Generating ${reportType} report`);
  };

  return (
    <>
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>
      <Stack spacing={2} alignItems="stretch">
        <Button variant="contained" color="primary" onClick={() => generateReport('sales')}>
          Generate Sales Report
        </Button>
        <Button variant="contained" color="success" onClick={() => generateReport('inventory')}>
          Generate Inventory Report
        </Button>
        <Button variant="contained" color="warning" onClick={() => generateReport('expiry')}>
          Generate Expiry Report
        </Button>
        <Button variant="contained" color="secondary" onClick={() => generateReport('profit')}>
          Generate Profit Report
        </Button>
      </Stack>
    </Container>
    <Footer/>
    </>
  );
};

export default Reports;
