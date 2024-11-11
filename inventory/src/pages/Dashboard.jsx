import { Close as CloseIcon } from '@mui/icons-material';
import { Box, Dialog, DialogContent, DialogTitle, Grid as Grid2, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useMediaQuery, useTheme } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaBoxes, FaCalendarDay, FaClock, FaExclamationTriangle, FaFileAlt, FaTasks } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './footer';

const Dashboard = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [todaysRevenue, setTodaysRevenue] = useState();
  // const [totalSales, getTotalSales] = useState();
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogPurpose, setDialogPurpose] = useState(''); 
  const [totalProductQuantity, getTotalProductQuantity] = useState('');
  const [lowStockItems, setLowStockItems] = useState([]); // Changed to array
  const [pendingOrdersNumber, setPendingOrdersNumber] = useState();
  const [completedOrdersNumber, setCompletedOrdersNumber] = useState();
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [expiredProducts, setExpiredProducts] = useState([]);
  const [userType, setUserType] = useState('');

  const apiUrl = process.env.REACT_APP_API_ENDPOINT;

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      navigate('/');
    } else {
      setUserType(userData.user_type);
    }

    const fetchTodaySales = async () => {
      try {
        const response = await axios.get(`${apiUrl}/inventory/get_today_sales`);
        setTodaysRevenue(response.data.todaySales);
        console.log('Today\'s Sales:', response.data.todaySales);
      } catch (error) {
        console.error('Error fetching today\'s sales:', error);
      }
    };

    // const fetchTotalSales = async () => {
    //   try {
    //     const response = await axios.get(`${apiUrl}/inventory/get_total_sales`);
    //     getTotalSales(response.data.totalSales);
    //     console.log('Total Sales:', totalSales);
    //   } catch (error) {
    //     console.error('Error fetching total sales:', error);
    //   }
    // };

    const fetchTotalProductNumber = async () => {
      try {
        const response = await axios.get(`${apiUrl}/inventory/get_total_products_quantity`);
        getTotalProductQuantity(response.data.total_quantity);
        console.log('Total Quantity:', response.data);
      } catch (error) {
        console.error('Error fetching total product number:', error);
      }
    };

    const fetchLowStockItems = async (threshold = 10) => {
      try {
        const response = await fetch(`${apiUrl}/inventory/get_low_stock_items/${threshold}`);
        const data = await response.json();
        if (data.success) {
          console.log('Low Stock Items:', data.low_stock_items);
          setLowStockItems(data.low_stock_items); // Store the full array
        } else {
          console.error('Error fetching low stock items:', data.error);
        }
      } catch (error) {
        console.error('An error occurred while fetching low stock items:', error);
      }
    };

    const fetchPendingOrdersNumber = async (threshold = 10) => {
      try {
        const response = await fetch(`${apiUrl}/inventory/get_pending_orders_number/`);
        const data = await response.json();
        console.log('Pending Orders:', data);
        setPendingOrdersNumber(data.pending_orders); // Store the full array

      } catch (error) {
        console.error('An error occurred while fetching low stock items:', error);
      }
    };


    const fetchCompletedOrdersNumber = async (threshold = 10) => {
      try {
        const response = await fetch(`${apiUrl}/inventory/get_completed_orders_number/`);
        const data = await response.json();
        console.log('Completed Orders:', data);
        setCompletedOrdersNumber(data.completed_orders); // Store the full array

      } catch (error) {
        console.error('An error occurred while fetching low stock items:', error);
      }
    };

    const fetchExpiringProducts = async () => {
      try {
        const response = await axios.get(`${apiUrl}/inventory/get_expiring_products/`);
        if (response.data.success) {
          setExpiringProducts(response.data.expiring_products);
        }
      } catch (error) {
        console.error('Error fetching expiring products:', error);
      }
    };
  
    const fetchExpiredProducts = async () => {
      try {
        const response = await axios.get(`${apiUrl}/inventory/get_expired_products/`);
        if (response.data.success) {
          setExpiredProducts(response.data.expired_products);
        }
      } catch (error) {
        console.error('Error fetching expired products:', error);
      }
    };

    fetchTodaySales();
    // fetchTotalSales();
    fetchTotalProductNumber();
    fetchLowStockItems();
    fetchPendingOrdersNumber()
    fetchCompletedOrdersNumber();
    fetchExpiringProducts();
    fetchExpiredProducts();
  }, [navigate]);

  const fetchProducts = async (purpose) => {
    let endpoint = '';
    if (purpose === 'expiring') {
      endpoint = '/inventory/get_expiring_products/';
    } else if (purpose === 'expired') {
      endpoint = '/inventory/get_expired_products/';
    } else {
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}${endpoint}`);
      if (response.data.success) {
        if (purpose === 'expiring') {
          setExpiringProducts(response.data.expiring_products);
        } else if (purpose === 'expired') {
          setExpiredProducts(response.data.expired_products);
        }
        setDialogPurpose(purpose);
        setOpenDialog(true);
      } else {
        console.error(`Error fetching ${purpose} products:`, response.data.error);
        toast.error(`Error fetching ${purpose} products.`);
      }
    } catch (error) {
      console.error(`An error occurred while fetching ${purpose} products:`, error);
      toast.error(`Error fetching ${purpose} products.`);
    }
  };

  const showLowStockPopup = () => {
    setDialogPurpose('lowStock');
    setOpenDialog(true);
  };


  // Sample data for demonstration
  const stats = [
    {
      icon: <FaBoxes style={{ color: 'blue', marginRight: 8 }} />,
      label: 'Total Products',
      number: `${new Intl.NumberFormat('en-NG').format(totalProductQuantity)}` || 0,
      helpText: 'In stock',
    },
    {
      icon: <FaExclamationTriangle style={{ color: 'orange', marginRight: 8 }} />,
      label: 'Low Stock Products',
      number: `${lowStockItems.length}` || 0, // Show count of low stock items
      helpText: 'Below threshold (10)',
      onClick: showLowStockPopup, // Add onClick to trigger popup
    },
    {
      icon: <FaClock style={{ color: 'red', marginRight: 8 }} />,
      label: 'Expiring Soon',
      number: expiringProducts.length || 0,
      helpText: 'Within 30 days',
      onClick: () => fetchProducts('expiring'), // Add onClick to fetch expiring products
    },
    {
      icon: <FaClock style={{ color: 'red', marginRight: 8 }} />,
      label: 'Expired Products',
      number: expiredProducts.length || 0,
      helpText: 'Already expired',
      onClick: () => fetchProducts('expired'), // Add onClick to fetch expiring products
    },
    {
      icon: <FaTasks style={{ color: 'purple', marginRight: 8 }} />,
      label: 'Pending Orders',
      number: `${pendingOrdersNumber}` || 0,
      helpText: 'Waiting to be processed',
    },
    {
      icon: <FaTasks style={{ color: 'green', marginRight: 8 }} />,
      label: 'Completed Orders',
      number: `${completedOrdersNumber}` || 0,
      helpText: 'Delivered to customers',
    },
  ];

  // Conditionally add these stats if user_type is Manager
  if (userType == 'Manager') {
    // stats.unshift({
    //   icon: <FaChartLine style={{ color: 'green', marginRight: 8 }} />,
    //   label: 'Total Sales',
    //   number: totalSales ? `₦${new Intl.NumberFormat('en-NG').format(totalSales)}` : 'loading...',
    //   helpText: 'Up To Date.',
    // });
    stats.unshift({
      icon: <FaCalendarDay style={{ color: '#4CAF50', marginRight: 8 }} />, // Bright green for visibility
      label: 'Today\'s Sales',
      number: todaysRevenue ? `₦${new Intl.NumberFormat('en-NG').format(todaysRevenue)}` : 'No Sales yet',
      helpText: 'Total sales made today.',
      onClick: () => navigate('/sales-reports')
    });
    stats.push({
      icon: <FaFileAlt style={{ color: 'brown', marginRight: 8 }} />,
      label: 'Report',
      number: 'Sales Reports',
      helpText: 'Click here',
      onClick: () => navigate('/sales-reports'),
    });
  }


  return (
    <>
    <Box maxWidth="lg" mx="auto" mt={8} px={2}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid2 container spacing={4}>
        {stats.map((stat, index) => (
          <Grid2 item xs={12} sm={6} md={3} key={index} onClick={stat.onClick}>
            <Paper
              elevation={3}
              sx={{
                padding: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                borderRadius: 2,
                cursor: stat.onClick ? 'pointer' : 'default', // Change cursor if clickable
              }}
            >
              <Box display="flex" alignItems="center" mb={1}>
                {stat.icon}
                <Typography variant="subtitle1">{stat.label}</Typography>
              </Box>
              <Typography variant="h5" color={stat.icon.props.style.color}>
                {stat.number}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.helpText}
              </Typography>
            </Paper>
          </Grid2>
        ))}
      </Grid2>
    </Box>

    <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{backgroundColor: '#212121', color: '#ccc'}}>
          {dialogPurpose === 'expiring' && 'Expiring Products - To expire in 30 days'}
          {dialogPurpose === 'expired' && 'Expired Products'}
          {dialogPurpose === 'lowStock' && 'Low Stock Products - Below threshold of 10'}
          <IconButton
            aria-label="close"
            onClick={() => setOpenDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8, color: '#ccc' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{mt: 2}}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
              <TableRow>
                <TableCell><strong>Product Name</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                {dialogPurpose === 'lowStock' ? (
                  <TableCell><strong>Available Quantity</strong></TableCell>
                ) : (
                  <TableCell><strong>Expiry Date</strong></TableCell>
                )}
              </TableRow>
              </TableHead>
              <TableBody>
                {(dialogPurpose === 'expiring' ? expiringProducts :
                  dialogPurpose === 'expired' ? expiredProducts : lowStockItems
                ).map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.categoryName}</TableCell>
                    {dialogPurpose === 'lowStock' ? (
                      <TableCell>{product.availableQuantity}</TableCell>
                    ) : (
                      <TableCell>
                        {new Date(product.expiry_date).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}
                        </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    <Footer/>
    </>
  );
};

export default Dashboard;
