import { Button, Container } from '@mui/material';
import React from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../components/userContext'; // Import your UserContext
import Footer from './footer';

const Logout = () => {
  const navigate = useNavigate();
  const { updateUserData } = useUserContext(); // Use the context

    const handleLogout = () => {
        confirmAlert({
            title: 'Confirm Logout',
            message: 'Are you sure you want to logout?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        updateUserData(null); // Call the context function to remove user data
                        navigate('/'); // Navigate to the login page
                    },
                    style: {
                        backgroundColor: '#3182ce',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 20px',
                        cursor: 'pointer',
                    },
                },
                {
                    label: 'No',
                    onClick: () => {}, // No action on cancel
                    style: {
                        backgroundColor: 'crimson',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 20px',
                        cursor: 'pointer',
                    },
                },
            ],
        });
    };

  return (
    <>
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh',
      }}
    >
      <Button
        variant="contained"
        sx={{
          backgroundColor: 'crimson',
          height: '45px',
          '&:hover': { backgroundColor: '#DC143C' },
        }}
        onClick={handleLogout}
      >
        Logout
      </Button>
    </Container>
    <Footer/>
    </>
  );
};

export default Logout;
