import { Button, Container, Grid, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './footer';

const Register = () => {
  const [user_type, setUsertype] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessages, setErrorMessages] = useState({});
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const apiUrl = process.env.REACT_APP_API_ENDPOINT;
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('userData')) {
      navigate('/dashboard');
    }
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Check if the passwords match
    if (password !== confirmPassword) {
      setErrorMessages({ match: 'Passwords do not match.' });
      setIsPasswordValid(false);
      return;
    }

    setErrorMessages({});
    setIsPasswordValid(true);



    try {

      const data = {
        user_type: user_type,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNumber: phoneNumber,
        address: address,
        username: username,
        password: password,
      };
      
      const response = await axios.post(`${apiUrl}/users/register/`, data);

      console.log(response);
    
      // Handle successful registration
      if (response.status === 200 || response.status === 201) {
        await alert('Registration successful! You can now log in.');
        navigate('/');
      } else if (response.status == 202) {
        toast.warning("Username already exists");
      } else if (response.status == 203) {
        toast.warning("Email already exists");
      } else if (response.status == 204) {
        toast.warning("User type already exists");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    // Clear password match error
    if (value === confirmPassword) {
      setErrorMessages((prev) => ({ ...prev, match: undefined }));
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    // Check if confirm password matches the original password
    if (password !== value) {
      setErrorMessages({ match: 'Passwords do not match.' });
      setIsPasswordValid(false);
    } else {
      setErrorMessages((prev) => ({ ...prev, match: undefined }));
      setIsPasswordValid(true);
    }
  };

  return (
    <>
    <Container maxWidth="sm" sx={{ mt: 8, bgcolor: 'white', boxShadow: 3, p: 4, borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom>
        Register
      </Typography>
      {errorMessages.api && <Typography color="error">{errorMessages.api}</Typography>}
      <form onSubmit={handleRegister}>
        <Grid container spacing={2} direction="column">
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="User Type"
              variant="outlined"
              required
              value={user_type}
              onChange={(e) => setUsertype(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="" disabled></option>
              <option value="Manager">Manager</option>
              <option value="Inventory Personnel">Inventory Personnel</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Cashier 1">Cashier 1</option>
              <option value="Cashier 2">Cashier 2</option>
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="First Name"
              variant="outlined"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Last Name"
              variant="outlined"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Grid>

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
              label="Email"
              variant="outlined"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Phone Number"
              variant="outlined"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              variant="outlined"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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
              onChange={(e) => handlePasswordChange(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              variant="outlined"
              required
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            />
            {errorMessages.match && <Typography color="error" variant="caption">{errorMessages.match}</Typography>}
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
              sx={{
                backgroundColor: '#3182ce',
                height: '45px',
                '&:hover': { backgroundColor: '#2c5282' },
              }}
              disabled={
                !user_type || !firstName || !lastName || !email || !phoneNumber || 
                !address || !username || !password || !confirmPassword || !isPasswordValid
              }
            >
              Register
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" align="center">
              Already have an account? <Link to="/">Login</Link>
            </Typography>
          </Grid>
        </Grid>
      </form>
      <ToastContainer />
    </Container>
    <Footer/>
    </>
  );
};

export default Register;
