import { Box, Grid as Grid2, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaBoxes, FaChartLine, FaClock, FaExclamationTriangle, FaFileAlt, FaTasks } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Import SweetAlert2
import Footer from './footer';

const Dashboard = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [totalSales, getTotalSales] = useState();
  const [totalProductQuantity, getTotalProductQuantity] = useState('');
  const [lowStockItems, setLowStockItems] = useState([]); // Changed to array
  const [pendingOrdersNumber, setPendingOrdersNumber] = useState();
  const [completedOrdersNumber, setCompletedOrdersNumber] = useState();
  const [userType, setUserType] = useState('');

  const apiUrl = process.env.REACT_APP_API_ENDPOINT;

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      navigate('/');
    } else {
      setUserType(userData.user_type);
    }

    const fetchTotalSales = async () => {
      try {
        const response = await axios.get(`${apiUrl}/inventory/get_total_sales`);
        getTotalSales(response.data.totalSales);
        console.log('Total Sales:', totalSales);
      } catch (error) {
        console.error('Error fetching total sales:', error);
      }
    };

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

    fetchTotalSales();
    fetchTotalProductNumber();
    fetchLowStockItems();
    fetchPendingOrdersNumber()
    fetchCompletedOrdersNumber();
  }, [navigate]);

  const showLowStockPopup = () => {
    const items = lowStockItems.map(item => `${item.name}: ${item.availableQuantity}`).join('<br>');
    Swal.fire({
      title: 'Low Stock Products',
      html: items || 'No low stock items found',
      icon: 'warning',
      confirmButtonText: 'Close',
      showCloseButton: true,
    });
  };

  // Function to fetch expiring products
  const fetchExpiringProducts = async () => {
    try {
      const response = await axios.get(`${apiUrl}/inventory/get_expiring_products/`);
      if (response.data.success) {
        const expiringProducts = response.data.expiring_products;
        const productsList = expiringProducts.map(product => 
          `${product.name}: ${new Date(product.expiry_date).toLocaleDateString()}`
        ).join('\n');

        // Display SweetAlert2 popup
        Swal.fire({
          title: 'Expiring Products Soon',
          text: productsList,
          icon: 'info',
          confirmButtonText: 'Close',
        });
      } else {
        console.error('Error fetching expiring products:', response.data.error);
      }
    } catch (error) {
      console.error('An error occurred while fetching expiring products:', error);
    }
  };

  // Sample data for demonstration
  const stats = [
    {
      icon: <FaBoxes style={{ color: 'blue', marginRight: 8 }} />,
      label: 'Total Products',
      number: `${new Intl.NumberFormat('en-NG').format(totalProductQuantity)}`,
      helpText: 'In stock',
    },
    {
      icon: <FaExclamationTriangle style={{ color: 'orange', marginRight: 8 }} />,
      label: 'Low Stock Products',
      number: `${lowStockItems.length}`, // Show count of low stock items
      helpText: 'Below threshold (10)',
      onClick: showLowStockPopup, // Add onClick to trigger popup
    },
    {
      icon: <FaClock style={{ color: 'red', marginRight: 8 }} />,
      label: 'Expiring Soon',
      number: 'Check',
      helpText: 'Within 30 days',
      onClick: fetchExpiringProducts, // Add onClick to fetch expiring products
    },
    {
      icon: <FaTasks style={{ color: 'purple', marginRight: 8 }} />,
      label: 'Pending Orders',
      number: `${pendingOrdersNumber}`,
      helpText: 'Waiting to be processed',
    },
    {
      icon: <FaTasks style={{ color: 'green', marginRight: 8 }} />,
      label: 'Completed Orders',
      number: `${completedOrdersNumber}`,
      helpText: 'Delivered to customers',
    },
  ];

  // Conditionally add these stats if user_type is Manager
  if (userType === 'Manager') {
    stats.unshift({
      icon: <FaChartLine style={{ color: 'green', marginRight: 8 }} />,
      label: 'Total Sales',
      number: `₦${new Intl.NumberFormat('en-NG').format(totalSales)}`,
      helpText: 'Up To Date',
    });
    stats.push({
      icon: <FaFileAlt style={{ color: 'brown', marginRight: 8 }} />,
      label: 'Report',
      number: 'Monthly Report',
      helpText: 'Coming soon...',
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
    <Footer/>
    </>
  );
};

export default Dashboard;
