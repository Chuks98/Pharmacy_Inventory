import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './footer';

const ProductForm = () => {
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [categoryName, setCategoryName] = useState(''); // New state for category name
    const [availableQuantity, setAvailableQuantity] = useState('');
    const [image, setImage] = useState(null);
    const [expiryDate, setExpiryDate] = useState(null); // State for expiry date
    const [categories, setCategories] = useState([]);

    const apiUrl = process.env.REACT_APP_API_ENDPOINT;

    const navigate = useNavigate();

    useEffect(() => {
        if(!localStorage.getItem('userData')) {
            navigate('/');
        }
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${apiUrl}/inventory/get-categories/`);
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
                toast.error('Failed to fetch categories.', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        };

        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const storedData = JSON.parse(localStorage.getItem('userData'));
        const staff_id = storedData ? storedData.id : null;

        if (expiryDate == null) {
            return toast.warning('Please insert an expiry date');
        }
        const formData = new FormData();
        formData.append('name', productName);
        formData.append('price', price);
        formData.append('category', category);
        formData.append('categoryName', categoryName);
        formData.append('availableQuantity', availableQuantity);
        formData.append('expiry_date', expiryDate.toISOString().split('T')[0]); // Format to 'YYYY-MM-DD'
        if (image) {
            formData.append('image', image);
        }
        formData.append('staff_id', staff_id);

        try {
            const response = await axios.post(`${apiUrl}/inventory/create-product/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.status == 201) {
                console.log('Product Created:', response.data);
                toast.success('Product created successfully!', {
                    position: 'top-right',
                    autoClose: 3000,
                });
                // Reset form fields
                setProductName('');
                setPrice('');
                setCategory('');
                setCategoryName(''); // Reset category name
                setAvailableQuantity('');
                setImage(null);
                setExpiryDate(null);
                // setExpiryDate(dayjs()); // Reset expiry date after submission
           }
        } catch (error) {
            if (error.response.status == 409) {
                toast.warning('Product already exists. Try changing the product name or updating the existing product.', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            } else {
                console.error('Error creating product:', error);
                toast.error('An error occurred while creating the product.', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
        }
    };

    const handleCategoryChange = (e) => {
        const selectedId = e.target.value;
        setCategory(selectedId);
        const selectedCat = categories.find(cat => cat.id === selectedId);
        if (selectedCat) {
            setCategoryName(selectedCat.name); // Set category name
        } else {
            setCategoryName(''); // Reset if not found
        }
    };

    return (
        <>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
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
                        mt: 8,
                        width: '100%',
                    }}
                >
                    <Typography variant="h5" component="h2" sx={{ textAlign: 'center', marginBottom: 2 }}>
                        Create New Product
                    </Typography>
                    <TextField
                        label="Product Name"
                        variant="outlined"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        required
                    />
                    <TextField
                        label="Price (₦)"
                        type="number"
                        variant="outlined"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                    <FormControl fullWidth>
                        <InputLabel>Select Category</InputLabel>
                        <Select
                            value={category}
                            onChange={handleCategoryChange} // Updated to use the new handler
                            required
                        >
                            <MenuItem value=""><em>Select Category</em></MenuItem>
                            {categories.map((cat) => (
                                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Available Quantity"
                        type="number"
                        variant="outlined"
                        value={availableQuantity}
                        onChange={(e) => setAvailableQuantity(e.target.value)}
                        required
                    />
                    <DatePicker
                        label="Expiry Date"
                        value={expiryDate}
                        onChange={(newValue) => setExpiryDate(newValue)}
                        renderInput={(params) => <TextField {...params} required />}
                        required
                    />
                    <Button variant="outlined" component="label">
                        Upload Image
                        <input type="file" hidden onChange={handleImageChange} />
                    </Button>
                    {image && (
                        <Box sx={{ marginTop: 2, textAlign: 'center' }}>
                            <img
                                src={URL.createObjectURL(image)}
                                alt="Selected"
                                style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px', marginTop: '10px' }}
                            />
                            <p>{image.name}</p>
                        </Box>
                    )}
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{ backgroundColor: '#3182ce', height: '45px', '&:hover': { backgroundColor: '#2c5282' } }}
                    >
                        Create Product
                    </Button>
                </Box>
                <ToastContainer />
            </Box>
        </LocalizationProvider>
        <Footer/>
        </>
    );
};

export default ProductForm;
