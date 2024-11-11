import { Button, Container, Stack, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './footer';

const Reports = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('userData')) {
      navigate('/');
    }
  }, [navigate]); // Ensure navigate is not continuously called

  const generateReport = (reportType) => {
    // Example of navigation after generating the report (e.g., to a report details page)
    navigate(`/${reportType}`);
  };

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          Reports
        </Typography>
        <Stack spacing={2} alignItems="stretch">
          <Button variant="contained" color="primary" onClick={() => generateReport('sales-reports')}>
            Generate Sales Report
          </Button>
          {/* <Button variant="contained" color="success" onClick={() => generateReport('inventory')}>
            Generate Inventory Report
          </Button> */}
          <Button variant="contained" color="warning" onClick={() => generateReport('dashboard')}>
            Generate Expiry Report
          </Button>
          <Button variant="contained" color="secondary" onClick={() => generateReport('sales-reports')}>
            Generate Profit Report
          </Button>
        </Stack>
      </Container>
      <Footer />
    </>
  );
};

export default Reports;
