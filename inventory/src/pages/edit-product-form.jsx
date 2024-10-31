import { Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Assuming we pass product ID through URL params
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditProductForm = () => {
    const { productId } = useParams(); // Get product ID from URL params
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [categoryName, setCategoryName] = useState(''); 
    const [availableQuantity, setAvailableQuantity] = useState('');
    const [image, setImage] = useState(null);
    const [expiryDate, setExpiryDate] = useState(dayjs());
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

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

        const fetchProductDetails = async () => {
            try {
                const response = await axios.get(`${apiUrl}/inventory/get_product_by_id/${productId}/`);
                const product = response.data;
                setProductName(product.name);
                setPrice(product.price);
                setCategory(product.category_id); // Set the category ID from the product details
                setCategoryName(product.categoryName);
                setAvailableQuantity(product.availableQuantity);
                setExpiryDate(dayjs(product.expiry_date));
            } catch (error) {
                console.error('Error fetching product details:', error);
                toast.error('Failed to load product details.', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        };

        fetchCategories();
        fetchProductDetails();
    }, [apiUrl, productId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (category == undefined) {
            return toast.warning('Please select a category');
        } else if (expiryDate == null) {
            return toast.warning('Please select a date');
        }

        const formData = new FormData();
        formData.append('name', productName);
        formData.append('price', price);
        formData.append('category', category);
        formData.append('categoryName', categoryName);
        formData.append('availableQuantity', availableQuantity);
        formData.append('expiry_date', expiryDate.toISOString().split('T')[0]);
        if (image) {
            formData.append('image', image);
        }

        try {
            setLoading(true);
            const response = await axios.patch(`${apiUrl}/inventory/update_product/${productId}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Product Updated:', response.data);
            toast.success('Product updated successfully!', {
                position: 'top-right',
                autoClose: 3000,
            });
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error(error.message, {
                position: 'top-right',
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
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
        // Set categoryName only when a valid category is selected
        setCategoryName(selectedCat ? selectedCat.name : '');
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                }}
            >
                {loading ? <CircularProgress/> :
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
                        Edit Product
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
                        value={parseInt(parseFloat(price))}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                    <FormControl fullWidth>
                        <InputLabel>{`*${categoryName}* was selected. Please select again or another.` || 'Select category'}</InputLabel>
                        <Select
                            value={category} // This will display the category name based on category ID
                            onChange={handleCategoryChange} 
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
                        Update Product
                    </Button>
                    <br/>
                    <Typography variant="body2" align="center">
                        Powered By SalubreTech
                    </Typography>
                </Box>}
                <ToastContainer />
            </Box>
        </LocalizationProvider>
    );
};

export default EditProductForm;
