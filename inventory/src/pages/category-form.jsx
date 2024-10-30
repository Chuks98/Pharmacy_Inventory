import { Box, Button, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './footer';

const CategoryForm = () => {
    const apiUrl = process.env.REACT_APP_API_ENDPOINT;
    const [categoryName, setCategoryName] = useState('');

    const navigate = useNavigate();

    // Retrieve the stored object from localStorage and parse it
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    useEffect(() => {
        if(!localStorage.getItem('userData')) {
            navigate('/');
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const staff_id = userData ? userData.id : null;
    
        if (!staff_id) {
            toast.error('Staff ID is missing. Please check your login status.', {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }
    
        if (categoryName !== '') {
            const data = {
                name: categoryName,
                staff_id: staff_id  // Add staff_id to the data object
            };
    
            try {
                const response = await axios.post(`${apiUrl}/inventory/create-category/`, data);
    
                if (response.status === 200 || response.status === 201) {
                    toast.success('Category created successfully!', {
                        position: 'top-right',
                        autoClose: 3000,
                    });
                    setCategoryName('');
                }
            } catch (error) {
                console.log(error);
                if (error.response && error.response.status === 409) {
                    toast.warning('Category already exists', {
                        position: 'top-right',
                        autoClose: 3000,
                    });
                    setCategoryName('');
                } else {
                    toast.error('An error occurred. Please try again.', {
                        position: 'top-right',
                        autoClose: 3000,
                    });
                }
            }
        } else {
            toast.warning('The category name must not be empty.', {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };
    

    return (
        <>
        <Box
            sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
            }}
        >
            <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                padding: 4,
                borderRadius: 2,
                boxShadow: 3,
                backgroundColor: 'white',
                maxWidth: 600,
                width: '100%',
            }}>

            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', marginBottom: 2 }}>
            Create New Category
            </Typography>
            <TextField
            label="Category Name"
            variant="outlined"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
            />
            <Button type="submit" variant="contained" sx={{ backgroundColor: '#3182ce', height: '45px', '&:hover': { backgroundColor: '#2c5282' } }}>
            Create Category
            </Button>
        </Box>
        
        {/* Notification Container */}
        <ToastContainer />
        </Box>
    <Footer/>
    </>
  );
};

export default CategoryForm;
