import { Add, Delete, Edit } from '@mui/icons-material';
import { Box, Button, CircularProgress, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select'; // Import react-select
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './footer';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state

  const apiUrl = process.env.REACT_APP_API_ENDPOINT;
  const navigate = useNavigate();
  const userType = JSON.parse(localStorage.getItem('userData'))?.user_type;

  useEffect(() => {
    if (!localStorage.getItem('userData')) {
      navigate('/');
    }

    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${apiUrl}/inventory/get-categories/`);
        const options = response.data.map(category => ({
          value: category.id,
          label: category.name,
        }));
        setCategories(options);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = async (selectedOption) => {
    setSelectedCategory(selectedOption); // Set selected category

    if (selectedOption) {
      setLoading(true); // Set loading to true
      try {
        const response = await axios.get(`${apiUrl}/inventory/get_products_by_category/?category_id=${selectedOption.value}`);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    } else {
      setProducts([]);
    }
  };

  const handleEdit = (productId) => {
    navigate(`/edit-product/${productId}`);
  };

  const handleDelete = (productId) => {
    confirmAlert({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this product?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              const response = await axios.delete(`${apiUrl}/inventory/delete_product/${productId}/`);
              console.log('Product deleted successfully:', response);
              toast.success('Product deleted successfully!');
              setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
            } catch (error) {
              console.error('Error deleting product:', error.response ? error.response.data : error.message);
              toast.error('Error deleting product!');
            }
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
          onClick: () => {},
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
    <Box maxWidth="lg" mx="auto" mt={4} p={2}>
      <Typography variant="h4" gutterBottom>
        Inventory
      </Typography>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box style={{ width: '50%' }}>
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
            options={categories}
            placeholder="Search or Select a Category"
            isClearable
            styles={{
              container: base => ({
                ...base,
                zIndex: 10, // Ensure dropdown appears above other elements
              }),
            }}
          />
        </Box>

        <Box display="flex" alignItems="center">
          <Link to="/product-form" style={{ textDecoration: 'none' }}>
            <Button variant="contained" style={{ backgroundColor: '#3182ce', marginLeft: '10px', color: '#fff' }}>
              <Add /> Add product
            </Button>
          </Link>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Price (₦)</strong></TableCell>
                <TableCell><strong>Available Quantity</strong></TableCell>
                <TableCell><strong>Date Created</strong></TableCell>
                <TableCell><strong>Expiry Date</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.availableQuantity}</TableCell>
                  <TableCell>{new Date(product.date_created).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(product.expiry_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(product.id)} style={{ color: '#3182ce' }}>
                    <Tooltip title={`Edit ${product.name}`}>
                        <Edit />
                      </Tooltip>
                    </IconButton>
                    <IconButton onClick={() => handleDelete(product.id)} style={{ color: 'crimson' }}>
                      <Tooltip title={`Delete ${product.name}`}>
                        <Delete />
                      </Tooltip>
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <ToastContainer />
    </Box>
    <Footer/>
    </>
  );
};

export default Inventory;
