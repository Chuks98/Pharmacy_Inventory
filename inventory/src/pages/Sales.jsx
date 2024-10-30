import { Add, Cancel, Remove, ShoppingCart } from '@mui/icons-material';
import { Badge, Box, Button, CircularProgress, FormControl, IconButton, ListItem, ListItemText, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './footer';

const Sales = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const [orderedItems, setOrderedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null); 

  const apiUrl = process.env.REACT_APP_API_ENDPOINT;
  const navigate = useNavigate();
  const userType = JSON.parse(localStorage.getItem('userData'))?.user_type;

  useEffect(() => {
    if(!localStorage.getItem('userData')) {
        navigate('/');
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/inventory/get_products/`);
        setProducts(response.data);
        setFilteredProducts(response.data); // Set initial filtered products
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    const loadCartData = () => {
      const storedItems = JSON.parse(localStorage.getItem('orderedItems')) || [];
      setOrderedItems(storedItems);

      const initialQuantities = storedItems.reduce((acc, item) => {
        acc[item.id] = item.quantity;
        return acc;
      }, {});
      setQuantities(initialQuantities);

      const count = storedItems.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(count);
    };

    fetchProducts();
    loadCartData();
  }, []);

  useEffect(() => {
    if (searchTerm !== '') {
      const filtered = products.filter((product) => {
        const productName = product.name ? product.name.toLowerCase() : '';
        const productCategory = product.categoryName ? product.categoryName.toLowerCase() : '';
        return productName.includes(searchTerm.toLowerCase()) || productCategory.includes(searchTerm.toLowerCase());
      }).filter(product => !orderedItems.some(item => item.id === product.id)); // Exclude already added products

      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchTerm, products, orderedItems]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setFilteredProducts([]); // Hide the dropdown
      }
    };

    document.addEventListener('click', handleClickOutside); // Listen for clicks
    return () => {
      document.removeEventListener('click', handleClickOutside); // Cleanup listener on unmount
    };
  }, []);

  const handleQuantityChange = (productId, increment) => {
    setQuantities((prevQuantities) => {
      const currentQuantity = prevQuantities[productId] || 0;
      const product = products.find((p) => p.id === productId);
      const availableQuantity = product ? product.availableQuantity : 0;
  
      let newQuantity = increment ? currentQuantity + 1 : Math.max(0, currentQuantity - 1);
      if (newQuantity > availableQuantity) {
        newQuantity = availableQuantity;
      }
  
      const userData = JSON.parse(localStorage.getItem('userData'));
      const { first_name, last_name,  user_type } = userData || {};
  
      const updatedOrderedItems = [...orderedItems];
      const productIndex = updatedOrderedItems.findIndex((item) => item.id === productId);
  
      if (newQuantity === 0) {
        // Remove product from ordered items if the new quantity is 0
        if (productIndex > -1) {
          updatedOrderedItems.splice(productIndex, 1);
          toast.success(`${product.name} successfully removed from cart`);
        }
      } else {
        if (productIndex > -1) {
          updatedOrderedItems[productIndex].quantity = newQuantity;
        } else if (increment && newQuantity > 0) {
          const { staff_id, ...productDetails } = product;
          updatedOrderedItems.push({ ...productDetails, quantity: newQuantity, staff_name: `${first_name} ${last_name}`, user_type });
        }
      }
  
      localStorage.setItem('orderedItems', JSON.stringify(updatedOrderedItems));
      setOrderedItems(updatedOrderedItems);
      console.log(updatedOrderedItems);
  
      const count = updatedOrderedItems.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(count);
  
      return { ...prevQuantities, [productId]: newQuantity };
    });
  };

  const handleAddToCart = (product) => {
    handleQuantityChange(product.id, true); // Increment the quantity when adding to cart
  };

  const handleRemoveFromCart = (productId, productName) => {
    setQuantities((prevQuantities) => {
      const newQuantities = { ...prevQuantities };
      const currentQuantity = newQuantities[productId] || 0;

      // Remove from ordered items
      const updatedOrderedItems = orderedItems.filter(item => item.id !== productId);
      localStorage.setItem('orderedItems', JSON.stringify(updatedOrderedItems));
      setOrderedItems(updatedOrderedItems);

      const count = updatedOrderedItems.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(count);

      delete newQuantities[productId]; // Remove quantity tracking
      toast.success(`${productName} successfully removed from cart`);
      return newQuantities;
    });
  };

  const generateUniqueCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 7; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleForwardOrder = async () => {
    confirmAlert({
      title: 'Confirm Order',
      message: 'Are you sure you want to forward this order?',
      buttons: [
        {
          label: 'YES',
          onClick: async () => {
            const purchaseCode = generateUniqueCode();
            alert(`Your Purchase Code is: ${purchaseCode}. Please copy this code carefully!`);

            try {
              setLoading(true);
              const response = await axios.post(`${apiUrl}/inventory/save_pending_order/`, { orderedItems, purchaseCode }, { header: { 'content-type': "application/json" } });
              toast.success('Order has been placed successfully!');
              if(response.status == 201) {
                localStorage.removeItem('orderedItems');
                setOrderedItems([]);
                setCartCount(0);
              }
            } catch (error) {
              if (error.response.status === 409) {
                toast.warning('Purchase code already exists. Please try again.');
              } else {
                console.error('Error saving order:', error);
                toast.error('Failed to send order. Please try again.');
              }
            } finally {
              setLoading(false);
            }
          },
          style: { backgroundColor: '#3182ce', color: 'white' },
        },
        {
          label: 'NO',
          onClick: () => {},
          style: { backgroundColor: 'crimson', color: 'white' },
        }
      ],
    });
  };

  return (
    <>
    <Box maxWidth="lg" mx="auto" mt={4} p={2}>
      <Typography variant="h4" gutterBottom>
        Sales
      </Typography>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <FormControl variant="outlined" margin="normal" style={{ width: '50%', height: '60px' }}>
          <input
            type="text"
            placeholder="Search products by product name or category name"
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              height: '45px',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              transition: 'border-color 0.3s, box-shadow 0.3s',
              width: '100%',
              outline: 'none',
            }}
          />
        </FormControl>

        <Box display="flex" alignItems="center">
          <IconButton>
            <Badge badgeContent={cartCount} color="primary" sx={{ '& .MuiBadge-badge': { backgroundColor: '#3182ce' } }}>
              <ShoppingCart />
            </Badge>
          </IconButton>
          {cartCount > 0 && (
            <Button variant="contained" style={{ backgroundColor: '#3182ce', marginLeft: '10px', color: '#fff' }} onClick={handleForwardOrder}>
              Forward Order
            </Button>
          )}
        </Box>
      </Box>

      {/* Dropdown for filtered products */}
      {searchTerm && filteredProducts.length > 0 && (
        <Paper
          style={{
            position: 'absolute',
            zIndex: 1,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            maxHeight: '200px',
            overflowY: 'auto',
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '50%', // Set width to 50%
            padding: '10px',
            left: '50%', // Align the dropdown horizontally
            transform: 'translateX(-50%)', // Center it horizontally
          }}
        >
          {filteredProducts.map((product) => (
            <ListItem ref={dropdownRef} key={product.id}>
              <ListItemText primary={product.name} secondary={`Category: ${product.categoryName}  Qty Available: ${product.availableQuantity}`} />
              <IconButton sx={{backgroundColor: '#3182ce'}} onClick={() => handleAddToCart(product)}>
                <Add />
              </IconButton>
            </ListItem>
          ))}
        </Paper>
      )}


      {/* Table for ordered items */}
      <Typography sx={{marginBottom: '20px', fontWeight: 'bold', fontSize: '20px'}}>Shopping Cart</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="body1" style={{ fontWeight: 'bold' }}>Product Name</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body1" style={{ fontWeight: 'bold' }}>Category</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body1" style={{ fontWeight: 'bold' }}>Available Quantity</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body1" style={{ fontWeight: 'bold' }}>Quantity Selected</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body1" style={{ fontWeight: 'bold' }}>Actions</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orderedItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.categoryName}</TableCell>
                <TableCell>{item.availableQuantity}</TableCell>
                <TableCell>
                  <Tooltip title={`Reduce quantity`}>
                    <IconButton onClick={() => handleQuantityChange(item.id, false)}>
                      <Remove />
                    </IconButton>
                  </Tooltip>
                  {quantities[item.id] || 0}
                  <Tooltip title={`Increase quantity`}>
                    <IconButton onClick={() => handleQuantityChange(item.id, true)}>
                      <Add />
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title={`Remove ${item.name} from cart`}>
                    <IconButton onClick={() => handleRemoveFromCart(item.id, item.name)} disabled={(quantities[item.id] || 0) >= item.availableQuantity}>
                      <Cancel color="error" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ToastContainer />
      {loading && <CircularProgress />}
    </Box>
    <Footer/>
    </>
  );
};

export default Sales;
