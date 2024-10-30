import { InsertDriveFile } from '@mui/icons-material';
import SellIcon from '@mui/icons-material/AttachMoney';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import { Badge, Box, Button, Collapse, Container, FormControl, MenuItem, Paper, Select, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OrderPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [pendingOrder, setPendingOrder] = useState([]);
  const [completedOrder, setCompletedOrder] = useState([]);
  const [open, setOpen] = useState({});
  const [paymentType, setPaymentType] = useState({});
  const [searchPending, setSearchPending] = useState('');
  const [searchCompleted, setSearchCompleted] = useState('');
  const [filteredPendingOrders, setFilteredPendingOrders] = useState([]);
  const [filteredCompletedOrders, setFilteredCompletedOrders] = useState([]);
  const [trimmedPendingOrders, setTrimmedPendingOrders] = useState([]);
  const [trimmedCompletedOrders, setTrimmedCompletedOrders] = useState([]);
  const [userData, setUserData] = useState();
      
  const apiUrl = process.env.REACT_APP_API_ENDPOINT;

  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    setUserData(userData);
    if(!userData) {
        navigate('/');
    }

    if (userData) {
      setFirstName(userData.first_name);
      setLastName(userData.last_name);
    }


    const fetchPendingOrder = async () => {
      try {
        const response = await axios.get(`${apiUrl}/inventory/get_pending_orders/`);
        setPendingOrder(response.data);
        setTrimmedPendingOrders((response.data).slice(0, 10));
      } catch (error) {
        console.error('Error fetching pending order:', error);
      }
    };

    const fetchCompletedOrder = async () => {
      try {
        const response = await axios.get(`${apiUrl}/inventory/get_completed_orders/`); // Fetch completed orders
        setCompletedOrder(response.data);
        setTrimmedCompletedOrders((response.data).slice(0, 10));
      } catch (error) {
        console.error('Error fetching completed orders:', error);
      }
    };

    fetchPendingOrder();
    fetchCompletedOrder(); 
  }, []);

  const handlePendingSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchPending(event.target.value);
  
    setFilteredPendingOrders(
      pendingOrder
        .filter(order => order.purchaseCode.toLowerCase().includes(searchValue))
        .slice(0, 10)
    );
  };
  
  const handleCompletedSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchCompleted(event.target.value);
  
    setFilteredCompletedOrders(
      completedOrder
        .filter(order => order.purchaseCode.toLowerCase().includes(searchValue))
        .slice(0, 10)
    );
  };

  const handleToggle = (purchaseCode) => {
    setOpen((prevOpen) => ({
      ...prevOpen,
      [purchaseCode]: !prevOpen[purchaseCode],
    }));
  };

  const handlePaymentChange = (event, purchaseCode) => {
    setPaymentType((prevTypes) => ({
      ...prevTypes,
      [purchaseCode]: event.target.value,
    }));
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit', hour: 'numeric', minute: 'numeric', hour12: true };
    return new Date(dateString).toLocaleString('en-US', options).replace(',', '');
  };

  const calculateTotalPrice = (items) => {
    return items.reduce((total, item) => total + item.quantity * parseFloat(item.price), 0).toFixed(2);
  };

  const handlePrint = (order) => {
    const printDate = new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: 'numeric', minute: 'numeric', hour12: true });
    const printContent = `
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order ${order.purchaseCode}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    background-color: #f9f9f9;
                    color: #333;
                    width: 300px;
                    border: 1px solid #ddd;
                    padding: 15px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 10px;
                }
                .header img {
                    max-width: 100px;
                    height: auto;
                    margin-bottom: 10px;
                }
                .header h1 {
                    font-size: 18px;
                    margin: 0;
                }
                .header p {
                    font-size: 12px;
                    margin: 0;
                }
                .order-summary, .totals {
                    font-size: 12px;
                    margin-top: 10px;
                }
                .order-summary h2, .totals h3 {
                    font-size: 14px;
                    border-bottom: 1px dashed #333;
                    padding-bottom: 5px;
                }
                .order-summary p, .totals p {
                    margin: 5px 0;
                }
                .items-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }
                .items-table th, .items-table td {
                    text-align: left;
                    padding: 5px;
                    font-size: 12px;
                    border-bottom: 1px dashed #ddd;
                }
                .totals {
                    text-align: right;
                }
                .totals p strong {
                    color: #4CAF50;
                }
                .footer {
                    font-size: 10px;
                    text-align: center;
                    margin-top: 20px;
                    border-top: 1px dashed #333;
                    padding-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="${process.env.PUBLIC_URL}/logo1.jpg" alt="Healthy You Pharmacy Logo">
                <h1>Healthy You Pharmacy</h1>
                <p>Commissioner Quarters Near Demonstration Junction, Awka<br>
                Anambra, Nigeria<br>
                support@healthyyoupharmacy.com<br>
                +234 123 456 7890</p>
            </div>

            <div class="order-summary">
                <h2>Order Summary</h2>
                <p><strong>Order Code:</strong> ${order.purchaseCode}</p>
                <p><strong>Sales Rep:</strong> ${userData.first_name} ${userData.last_name}</p>
                <p><strong>Date:</strong> ${printDate}</p>
            </div>

            <table class="items-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.orderedItems.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>₦${parseFloat(item.price).toFixed(2)}</td>
                            <td>${item.quantity}</td>
                            <td>₦${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="totals">
                <p><strong>Subtotal:</strong> ₦${calculateTotalPrice(order.orderedItems)}</p>
                <p><strong>Discount:</strong> ₦${order.discount || "0.00"}</p>
                <p><strong>Paid:</strong> ₦${order.amountPaid || calculateTotalPrice(order.orderedItems)}</p>
                <p><strong>Balance:</strong> ₦${order.balance || "0.00"}</p>
            </div>

            <div class="footer">
                <p>Please confirm your goods before leaving. We shall not be liable for any shortage thereafter.</p>
                <p>Thank you for shopping with us. Please come again!</p>
                <p>Powered By: SalubreTech (08169564675)</p>
            </div>
        </body>
        </html>
    `;
    const newWindow = window.open();
    newWindow.document.write(printContent);
    newWindow.document.close();
    newWindow.print();
  };

  const handleSell = (order) => {
    confirmAlert({
      title: 'Confirm to Sell',
      message: 'Click yes to continue?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            const userData = JSON.parse(localStorage.getItem('userData'));
            // Convert each item's price to a number and prepare the orderedItems array
            const orderedItems = order.orderedItems.map(item => ({
              ...item,
              price: parseFloat(item.price), // Ensure the price is a number
            }));
  
            const dataToSend = {
              purchaseCode: order.purchaseCode,
              orderedItems: orderedItems,
              paymentType: paymentType[order.purchaseCode],
              totalAmount: parseFloat(calculateTotalPrice(order.orderedItems)),
              userType: userData ? userData.user_type : '',  // Fallback if userData is missing
              staff_name: userData ? `${userData.first_name} ${userData.last_name}` : "",
              date_sold: new Date().toISOString(),
            };
  
            try {
              console.log(dataToSend);
              const response = await axios.post(`${apiUrl}/inventory/save_completed_orders/`, dataToSend, {
                headers: {
                  'Content-Type': 'application/json',
                },
              });
      
              if (response.status === 201) {
                // Send DELETE request to delete the pending order
                const deleteResponse = await axios.delete(`${apiUrl}/inventory/delete_pending_order/${dataToSend.purchaseCode}`, {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });
      
                if (deleteResponse.status === 204) {
                  // Show success toast notification
                  toast.success("Product(s) successfully sold");
                  setPendingOrder(prevOrders => prevOrders.filter(order => order.purchaseCode !== dataToSend.purchaseCode));
                }
              }
            } catch (error) {
              console.error('Error saving completed order:', error);
              // Show error toast notification
              toast.error(`Error: ${error.response?.data?.error || 'Could not complete the order'}`);
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
          onClick: () => {
            // No action needed
          },
          style: {
            backgroundColor: 'crimson',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            cursor: 'pointer',
          },
        }
      ]
    });
  };

  const handleRemoveOrder = (purchaseCode) => {
    confirmAlert({
      title: 'Confirm to Remove',
      message: 'Are you sure you want to delete this order?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              const deleteResponse = await axios.delete(`${apiUrl}/inventory/delete_pending_order/${purchaseCode}`, {
                headers: {
                  'Content-Type': 'application/json',
                },
              });

              if (deleteResponse.status === 204) {
                toast.success("Order removed successfully");
                // Optionally, refresh the pending orders list here
                setPendingOrder(prevOrders => prevOrders.filter(order => order.purchaseCode !== purchaseCode));
              }
            } catch (error) {
              console.error('Error removing order:', error);
              toast.error(`Error: ${error.response?.data?.error || 'Could not remove the order'}`);
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
          onClick: () => {
            // No action needed
          },
          style: {
            backgroundColor: 'crimson',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            cursor: 'pointer',
          },
        }
      ]
    });
  };


  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
      <Typography variant="h4" gutterBottom>
        <Badge badgeContent={pendingOrder.length} color="primary" sx={{ '& .MuiBadge-badge': { backgroundColor: '#449516' } }}>
          Pending Orders
        </Badge>
      </Typography>
      <FormControl variant="outlined" style={{ width: '50%', height: '60px' }}>
        <input
          type="text"
          placeholder="Search pending order using Order Code"
          value={searchPending}
          onChange={handlePendingSearch}
          style={{
            height: '45px',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc', // Light border for better visibility
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
            transition: 'border-color 0.3s, box-shadow 0.3s', // Smooth transitions for focus
            width: '100%', // Full width to ensure it takes up space
            outline: 'none', // Remove default outline
          }}
          onFocus={(e) => {
            e.target.style.boxShadow = '0 1px 8px #3E74C9'; // Shadow effect on focus
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#ccc'; // Reset border color
            e.target.style.boxShadow = 'none'; // Remove shadow on blur
          }}
        />
      </FormControl>
      </Box>
    {(pendingOrder.length === 0 && filteredPendingOrders.length === 0) ? (
      <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
        <InsertDriveFile sx={{ marginRight: 1 }} /> {/* Add the icon here */}
        No pending orders at the moment.
      </Typography>
        ) : (
          <Paper sx={{ padding: 2 }}>
            {(filteredPendingOrders.length > 0 ? filteredPendingOrders : trimmedPendingOrders).map((order) => (
              <Box 
                key={order.purchaseCode}
                sx={{ mb: 2, border: '1px solid #ccc', borderRadius: '4px' }}
              >
                <Box 
                  onClick={() => handleToggle(order.purchaseCode)} 
                  sx={{ 
                    cursor: 'pointer', 
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: 2,
                    backgroundColor: open[order.purchaseCode] ? '#f5f5f5' : 'white',
                    '&:hover': { backgroundColor: '#f0f0f0' }
                  }}
                >
                  <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                    Order Code: {order.purchaseCode}
                  </Typography>
                  <Typography variant="body1">{formatDate(order.createdAt)}</Typography>
                  {order.orderedItems.length > 0 && (
                    <Typography variant="body1" sx={{ fontSize: '15px' }}>
                      <i>Ordered by:
                        <Tooltip title={order.orderedItems[0].staff_name}>
                          {order.orderedItems[0].user_type}
                        </Tooltip>
                      </i>
                    </Typography>
                  )}
                </Box>
                
                <Collapse in={open[order.purchaseCode]} timeout="auto" unmountOnExit>
                  <Box marginTop={1} sx={{ padding: 2, borderTop: '1px solid #ccc' }}>
                    <Table sx={{ minWidth: 650 }} aria-label="order items table">
                      <TableHead>
                        <TableRow>
                          <TableCell><b>S/N</b></TableCell>
                          <TableCell><b>Name</b></TableCell>
                          <TableCell><b>Category</b></TableCell>
                          <TableCell><b>Quantity</b></TableCell>
                          <TableCell><b>Price</b></TableCell>
                          <TableCell><b>Subtotal</b></TableCell> {/* New Subtotal Column */}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {order.orderedItems.map((item, index) => (
                          <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.categoryName}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>₦{parseFloat(item.price).toFixed(2)}</TableCell>
                            <TableCell>₦{(item.quantity * parseFloat(item.price)).toFixed(2)}</TableCell> {/* Subtotal Calculation */}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 2 }}>
                      Total Price: ₦{calculateTotalPrice(order.orderedItems)}
                    </Typography>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <Select
                        value={paymentType[order.purchaseCode] || ''}
                        onChange={(e) => handlePaymentChange(e, order.purchaseCode)}
                        displayEmpty
                        sx={{ paddingLeft: '0.5rem' }}
                      >
                        <MenuItem value="">
                          <em>Select Payment Type</em>
                        </MenuItem>
                        <MenuItem value="POS">POS</MenuItem>
                        <MenuItem value="CASH">Cash</MenuItem>
                        <MenuItem value="Transfer">Transfer</MenuItem>
                      </Select>
                    </FormControl>
                    <Box sx={{ marginTop: 2 }}>
                      <p style={{color: 'crimson'}}>* Please make sure you print before clicking on the sell button. *</p>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                        disabled={!paymentType[order.purchaseCode]}
                        onClick={() => handleSell(order)}
                        startIcon={<SellIcon />}
                      >
                        Sell
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handlePrint(order)}
                        disabled={!paymentType[order.purchaseCode]}
                        startIcon={<PrintIcon />}
                      >
                        Print
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        sx={{ marginLeft: 5, bgcolor: 'crimson' }} // Set the button color to crimson
                        onClick={() => handleRemoveOrder(order.purchaseCode)}
                        startIcon={<DeleteIcon />} // Add the delete icon
                      >
                        Remove Order
                      </Button>
                    </Box>
                  </Box>
                </Collapse>
              </Box>
            ))}
          </Paper>
        )}
      <br/><br/><br/>
      <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
      <Typography variant="h4" gutterBottom>
        <Badge badgeContent={completedOrder.length} color="primary" sx={{ '& .MuiBadge-badge': { backgroundColor: '#449516' } }}>
          Completed Orders
        </Badge>
      </Typography>
      <FormControl variant="outlined" style={{ width: '50%', height: '60px' }}>
        <input
          type="text"
          placeholder="Search completed order using Order Code."
          value={searchCompleted}
          onChange={handleCompletedSearch}
          style={{
            height: '45px',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc', // Light border for better visibility
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
            transition: 'border-color 0.3s, box-shadow 0.3s', // Smooth transitions for focus
            width: '100%', // Full width to ensure it takes up space
            outline: 'none', // Remove default outline
          }}
          onFocus={(e) => {
            e.target.style.boxShadow = '0 1px 8px #3E74C9'; // Shadow effect on focus
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#ccc'; // Reset border color
            e.target.style.boxShadow = 'none'; // Remove shadow on blur
          }}
        />
      </FormControl>
      </Box>
      <Paper sx={{ padding: 2 }}>
        {(completedOrder.length === 0 && filteredCompletedOrders === 0) ? (
          <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
            <InsertDriveFile sx={{ marginRight: 1 }} /> {/* Add the icon here */}
            No completed orders at the moment.
          </Typography>
        ) : 
        ((filteredCompletedOrders.length > 0 ? filteredCompletedOrders : trimmedCompletedOrders).map((order) => (
            <Box
              key={order.purchaseCode}
              sx={{ mb: 2, border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <Box
                onClick={() => handleToggle(order.purchaseCode)}
                sx={{
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: 2,
                  backgroundColor: open[order.purchaseCode] ? '#f5f5f5' : 'white',
                  '&:hover': { backgroundColor: '#f0f0f0' }
                }}
              >
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                  Order Code: {order.purchaseCode} 
                </Typography>
                <Typography variant="body1">{formatDate(order.date_sold)}</Typography>
                {order.soldItems.length > 0 && (
                  <Typography variant="body1" sx={{ fontSize: '15px' }}>
                    <i>Sold by: 
                      <Tooltip title={order.soldItems[0].staff_name}>
                          {order.soldItems[0].user_type}
                      </Tooltip>
                    </i>
                  </Typography>
                )}
              </Box>
              
              <Collapse in={open[order.purchaseCode]} timeout="auto" unmountOnExit>
                <Box marginTop={1} sx={{ padding: 2, borderTop: '1px solid #ccc', }}>
                  <Table sx={{ minWidth: 650 }} aria-label="order items table">
                    <TableHead>
                      <TableRow>
                        <TableCell><b>#</b></TableCell>
                        <TableCell><b>Name</b></TableCell>
                        <TableCell><b>Category</b></TableCell>
                        <TableCell><b>Quantity</b></TableCell>
                        <TableCell><b>Price</b></TableCell>
                        <TableCell><b>Subtotal</b></TableCell> {/* New Subtotal Column */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.soldItems.map((item, index) => (
                        <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.categoryName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₦{parseFloat(item.price).toFixed(2)}</TableCell>
                          <TableCell>₦{(item.quantity * parseFloat(item.price)).toFixed(2)}</TableCell> {/* Subtotal Calculation */}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 2 }}>
                    Total Price: ₦{calculateTotalPrice(order.soldItems)}
                  </Typography>
                </Box>
              </Collapse>
            </Box>
          ))
        )}
      </Paper>
      <ToastContainer/>
    </Container>
  );
};

export default OrderPage;
