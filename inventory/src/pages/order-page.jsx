import { InsertDriveFile } from '@mui/icons-material';
import SellIcon from '@mui/icons-material/AttachMoney';
import DeleteIcon from '@mui/icons-material/Delete';
import { Badge, Box, Button, Checkbox, Collapse, Container, FormControl, FormControlLabel, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { generatePrintCompletedOrder } from '../functions/print-completed-order';
import { generatePrintPendingOrder } from '../functions/print-pending-order';

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
  const [paymentAmounts, setPaymentAmounts] = useState({});
  const apiUrl = process.env.REACT_APP_API_ENDPOINT;

  const navigate = useNavigate();

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

  const handlePaymentTypeChange = (purchaseCode, type) => {
    setPaymentType(prevTypes => {
        const currentTypes = prevTypes[purchaseCode] || [];
        const isCurrentlySelected = currentTypes.includes(type);

        // Toggle the type in the list
        const updatedTypes = isCurrentlySelected
            ? currentTypes.filter(t => t !== type) // Remove type if already selected
            : [...currentTypes, type]; // Add type if not selected

        // Update paymentAmounts immediately to clear the amount when unchecked
        setPaymentAmounts(prevAmounts => {
            const updatedAmounts = { ...prevAmounts };
            if (!updatedAmounts[purchaseCode]) updatedAmounts[purchaseCode] = {};

            if (isCurrentlySelected) {
                // Clear the amount for the deselected payment type
                updatedAmounts[purchaseCode][type] = '';
            }

            return updatedAmounts;
        });

        return {
            ...prevTypes,
            [purchaseCode]: updatedTypes,
        };
    });
};

  
  // Handle amount change for a specific payment method (when user types an amount)
  const handleAmountChange = (purchaseCode, type, amount) => {
    setPaymentAmounts(prevAmounts => {
      return {
        ...prevAmounts,
        [purchaseCode]: {
          ...prevAmounts[purchaseCode],
          [type]: parseFloat(amount) || '', // Store the amount (0 if invalid input)
        },
      };
    });
  };
  
  // Check if selected payment types have corresponding amounts that sum to totalPrice
  const isSellEnabled = (purchaseCode, totalPrice) => {
    const amounts = paymentAmounts[purchaseCode] || {};
    const selectedTypes = paymentType[purchaseCode] || [];
  
    // Calculate the total of the entered amounts for the selected types
    const totalEntered = selectedTypes.reduce((sum, type) => sum + (amounts[type] || 0), 0);
  
    // Check if the total amount matches the total price and only selected types are considered
    return totalEntered === parseFloat(totalPrice) && selectedTypes.length > 0;
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit', hour: 'numeric', minute: 'numeric', hour12: true };
    return new Date(dateString).toLocaleString('en-US', options).replace(',', '');
  };

  const calculateTotalPrice = (items) => {
    return items.reduce((total, item) => total + item.quantity * parseFloat(item.price), 0).toFixed(2);
  };

  const handlePrintPendingOrder = async (order, paymentType) => {
    const printDate = new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: 'numeric', minute: 'numeric', hour12: true });
    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';

    // Append iframe to the document
    document.body.appendChild(iframe);

    // Write the print content to the iframe document
    const doc = iframe.contentWindow.document || iframe.contentDocument;
    doc.open();
    doc.write(generatePrintPendingOrder(order, userData, printDate, calculateTotalPrice, paymentType));
    doc.close();

    // Print the content of the iframe
    iframe.contentWindow.focus(); // Focus to ensure it prints correctly on some browsers
    iframe.contentWindow.print();

    // Clean up after printing
    iframe.addEventListener('afterprint', () => {
        document.body.removeChild(iframe);
    });
    return true;
  };


  const handlePrintCompletedOrder = async (order) => {
    const printDate = new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: 'numeric', minute: 'numeric', hour12: true });
    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';

    // Append iframe to the document
    document.body.appendChild(iframe);

    // Write the print content to the iframe document
    const doc = iframe.contentWindow.document || iframe.contentDocument;
    doc.open();
    doc.write(generatePrintCompletedOrder(order, formatDate(order.date_sold), calculateTotalPrice));
    doc.close();

    // Print the content of the iframe
    iframe.contentWindow.focus(); // Focus to ensure it prints correctly on some browsers
    iframe.contentWindow.print();

    // Clean up after printing
    iframe.addEventListener('afterprint', () => {
        document.body.removeChild(iframe);
    });
    return true;
  };

  const handleSell = (order) => {
    confirmAlert({
      title: 'Confirm to Sell',
      message: 'Do you wish to continue?',
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
              // Dynamically create paymentType with only non-zero values
              paymentType: Object.fromEntries(
                Object.entries({
                  CASH: paymentAmounts[order.purchaseCode]?.['CASH'] || 0,
                  POS: paymentAmounts[order.purchaseCode]?.['POS'] || 0,
                  TRANSFER: paymentAmounts[order.purchaseCode]?.['TRANSFER'] || 0,
                }).filter(([key, value]) => value !== 0)  // Filter out entries with value 0
              ),
              totalAmount: parseFloat(calculateTotalPrice(order.orderedItems)),
              userType: userData ? userData.user_type : '',  // Fallback if userData is missing
              staff_name: userData ? `${userData.first_name} ${userData.last_name}` : "",
              date_sold: new Date().toISOString(),
            };
  
            try {
              console.log(dataToSend.paymentType);
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
                  await Swal.fire({
                    title: 'Print Transaction!',
                    text: 'Transaction successful. Do you want to print this transaction?',
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonText: 'Print',
                    cancelButtonText: 'No',
                    confirmButtonColor: '#3182ce', // Color for OK button
                    cancelButtonColor: 'crimson',   // Color for Cancel button
                }).then(async (result) => {
                    if (result.isConfirmed) {
                      const printed = await handlePrintPendingOrder(order, dataToSend.paymentType);
                      if (printed == true) {
                        setPendingOrder(prevOrders => prevOrders.filter(order => order.purchaseCode !== dataToSend.purchaseCode));
                        // window.location.reload();
                        fetchPendingOrder();
                        fetchCompletedOrder();
                      }
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                      setPendingOrder(prevOrders => prevOrders.filter(order => order.purchaseCode !== dataToSend.purchaseCode));
                      window.location.reload();
                    }
                  });
                }
              }
            } catch (error) {
              console.error('Error saving completed order:', error);
              // Show error toast notification
              toast.error(`Error: ${error.response?.data?.error || 'Could not complete the order'}`);
              if(error.response?.data?.error == 'Order not found') {
                fetchPendingOrder();
                fetchCompletedOrder();
              } 
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
                fetchPendingOrder();
                fetchCompletedOrder();

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
    <Container maxWidth="lg" sx={{ mt: 6 }}>
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
            fontSize: '15px',
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
                      <i>Ordered by: &nbsp;
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
                            <TableCell>₦{new Intl.NumberFormat().format((item.quantity * parseFloat(item.price)).toFixed(2))}</TableCell> {/* Subtotal Calculation */}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 2 }}>
                      Total Price: ₦{new Intl.NumberFormat().format(calculateTotalPrice(order.orderedItems))}
                    </Typography>
                    <Box sx={{ marginTop: 2 }}>
                      <Typography variant="h6">Select Payment Method</Typography>
                      <Grid container spacing={2}>
                        {/* Render payment options (CASH POS and TRANSFER) horizontally */}
                        {['CASH', 'POS', 'TRANSFER'].map((type) => (
                          <Grid item key={type} xs={6} sm={3}>
                            <FormControlLabel
                              key={type}
                              control={
                                <Checkbox
                                  checked={paymentType[order.purchaseCode]?.includes(type) || false}
                                  onChange={() => handlePaymentTypeChange(order.purchaseCode, type)}
                                  color="primary"
                                />
                              }
                              label={type.charAt(0).toUpperCase() + type.slice(1)}
                            />
                            {/* Input for the corresponding payment amount */}
                            <TextField
                              label={`Amount for ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                              type="number"
                              variant="outlined"
                              fullWidth
                              value={paymentAmounts[order.purchaseCode]?.[type] || ''}
                              onChange={(e) => handleAmountChange(order.purchaseCode, type, e.target.value)}
                              sx={{ mt: 1 }}
                              disabled={!paymentType[order.purchaseCode]?.includes(type)} // Disable input if checkbox is not checked
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  
                    <Box sx={{ marginTop: 2 }}>
                      <Button
                        disabled={!isSellEnabled(order.purchaseCode, calculateTotalPrice(order.orderedItems))}
                        onClick={() => handleSell(order)}
                        variant="contained"
                        color="primary"
                        sx={{ padding: '5px 20px', borderRadius: '4px' }}
                      >
                        ₦ Sell
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
        <hr/>
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
            fontSize: '15px',
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
                    <i>Sold by: &nbsp;
                      <Tooltip title={order.staff_name}>
                          {order.userType}
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
                        <TableCell><b>S/N</b></TableCell>
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
                          <TableCell>₦{new Intl.NumberFormat().format((item.quantity * parseFloat(item.price)).toFixed(2))}</TableCell> {/* Subtotal Calculation */}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <span style={{fontSize: '16px', fontWeight: "bold"}}>Payment Type(s): </span>
                  {order.paymentType && typeof order.paymentType === 'object' && !Array.isArray(order.paymentType) ?
                    Object.entries(order.paymentType).map(([type, amount]) => (
                      <span key={type} style={{ marginRight: '10px', fontSize: '14px' }}>
                        <strong>{type}:</strong> ₦{amount}
                      </span>
                    )) :
                    // Optionally display the value as a string if `paymentType` is not an object
                    typeof order.paymentType === 'string' && (
                      <span style={{ fontSize: '14px' }}>
                        {order.paymentType}
                      </span>
                    )
                  }
                  <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 2 }}>
                    Total Price: ₦{new Intl.NumberFormat().format(calculateTotalPrice(order.soldItems))}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ mr: 1, backgroundColor: '#53A022', marginTop: '5px' }}
                    onClick={() => handlePrintCompletedOrder(order)}
                    startIcon={<SellIcon />}
                  >
                    Print
                  </Button>
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
