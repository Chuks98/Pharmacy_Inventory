import { Button, Container, Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import Footer from './footer';

const NotFound = () => {
  return (
    <>
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center', bgcolor: 'white', boxShadow: 3, p: 4, borderRadius: 2 }}>
      <Typography variant="h2" gutterBottom sx={{ color: '#8B0000' }}>
        404
      </Typography>
      <Typography variant="h6" gutterBottom>
        Oops! The page you're looking for doesn't exist.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to="/"
        sx={{ mt: 2, backgroundColor: '#3182ce', '&:hover': { backgroundColor: '#2c5282' } }}
      >
        Go Back Home
      </Button>
    </Container>
    <Footer/>
    </>
  );
};

export default NotFound;
