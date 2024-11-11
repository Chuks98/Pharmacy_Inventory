import { Button, Container, Grid, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUserContext } from '../components/userContext'; // Import the context
import Footer from './footer';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { updateUserData } = useUserContext(); // Access the updateUserData function from context
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_ENDPOINT;

  useEffect(() => {
    if (localStorage.getItem('userData')) {
      navigate('/dashboard');
    }
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/users/login/`, {
        username,
        password,
      });

      if (response.status === 200 || response.status === 201) {
        toast.success('Login Successful.');

        // Now, retrieve user data based on username
        const userResponse = await axios.get(`${apiUrl}/users/get_single_user/${username}/`); // Adjust endpoint as necessary
        if (userResponse.status === 200) {
          // Save user data to localStorage and update context
          updateUserData(userResponse.data); // Update context with user data
        }
        navigate('/dashboard'); // Navigate to dashboard or home
      } else if (response.status === 203) {
        toast.warning('Username does not exist. Please check and try again.');
      } else if (response.status === 204) {
        toast.warning('Incorrect password.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
      toast.error('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <>
    <Container maxWidth="sm" sx={{ mt: 8, bgcolor: 'white', boxShadow: 3, p: 4, borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <form onSubmit={handleLogin}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
              sx={{ backgroundColor: '#3182ce', height: '45px', '&:hover': { backgroundColor: '#2c5282' } }}
            >
              Login
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" align="center">
              Don't have an account?{' '}
              <Link to="/register">Register</Link>
            </Typography>
          </Grid>
        </Grid>
      </form>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnFocusLoss draggable pauseOnHover />
    </Container>
    <Footer/>
    </>
  );
};

export default Login;
