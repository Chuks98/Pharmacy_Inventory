import InfoIcon from '@mui/icons-material/Info';
import { Box, Collapse, Container, FormControl, IconButton, InputLabel, MenuItem, Pagination, Paper, Select, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import axios from 'axios';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';

const SalesReport = () => {
  const [reportType, setReportType] = useState('');
  const [salesData, setSalesData] = useState([]);
  const [filteredSalesData, setFilteredSalesData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [searchDate, setSearchDate] = useState('');
  const [searchMonth, setSearchMonth] = useState('');
  const [searchYear, setSearchYear] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const apiUrl = process.env.REACT_APP_API_ENDPOINT;

  const fetchSalesData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/inventory/get_completed_orders`);
      setSalesData(response.data);
    } catch (error) {
      console.error('Error fetching sales data', error);
    }
  };

  const handleGenerateReport = () => {
    if (!salesData.length || (!searchDate && !searchMonth && !searchYear && !reportType)) {
      setFilteredSalesData([]);
      return;
    }

    let filteredData = [...salesData];
    const today = new Date();

    if (searchDate) {
      const selectedDate = new Date(searchDate);
      filteredData = filteredData.filter(order =>
        format(new Date(order.date_sold), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
      );
    } else if (searchMonth) {
      filteredData = filteredData.filter(order => {
        const orderDate = new Date(order.date_sold);
        return orderDate.getMonth() + 1 === parseInt(searchMonth, 10);
      });
    } else if (searchYear) {
      filteredData = filteredData.filter(order =>
        format(new Date(order.date_sold), 'yyyy') == String(searchYear)
      );
    } else if (reportType) {
      switch (reportType) {
        case 'daily-sales':
          filteredData = filteredData.filter(order =>
            format(new Date(order.date_sold), 'yyyy-MM-dd') == format(today, 'yyyy-MM-dd')
          );
          break;
        case 'weekly-sales':
          const weekStartDate = new Date(today.setDate(today.getDate() - 7));
          filteredData = filteredData.filter(order => new Date(order.date_sold) >= weekStartDate);
          break;
        case 'monthly-sales':
          const monthStartDate = new Date(today.setMonth(today.getMonth() - 1));
          filteredData = filteredData.filter(order => new Date(order.date_sold) >= monthStartDate);
          break;
        default:
          break;
      }
    }

    setFilteredSalesData(filteredData);
    setCurrentPage(1); // Reset to first page for new filtered results
  };

  const calculateTotalRevenue = () => {
    return filteredSalesData.reduce((totalRevenue, order) => {
      return totalRevenue + order.soldItems.reduce((orderTotal, item) => {
        return orderTotal + item.quantity * parseFloat(item.price);
      }, 0);
    }, 0).toFixed(2);
  };

  const calculateTotalProfit = () => {
    return filteredSalesData
      // Filter out orders where any item in soldItems has costPrice as undefined, null, or 0
      .filter(order => order.soldItems.every(item => item.costPrice !== undefined || item.costPrice !== null || item.costPrice !== 0))
      // Calculate the profit for remaining orders
      .reduce((totalProfit, order) => {
        // Adjust totalAmount by removing the prices of items lacking costPrice
        const adjustedTotalAmount = order.soldItems.reduce((amount, item) => {
          if (item.costPrice === undefined || item.costPrice === null || item.costPrice === 0) {
            // If item lacks valid costPrice, subtract its total price from order's totalAmount
            return amount - (parseFloat(item.price) * item.quantity);
          }
          return amount;
        }, parseFloat(order.totalAmount));
  
        // Calculate the cost for items with valid costPrice
        const totalCost = order.soldItems.reduce((cost, item) => {
          return item.costPrice !== undefined && item.costPrice !== null && item.costPrice !== 0
            ? cost + parseFloat(item.costPrice) * item.quantity
            : cost;
        }, 0);
  
        // Calculate profit for the order
        const profitForOrder = adjustedTotalAmount - totalCost;
        return totalProfit + profitForOrder;
      }, 0).toFixed(2);
  };
  

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleExpandClick = (purchaseCode) => {
    setExpandedOrder(expandedOrder === purchaseCode ? null : purchaseCode); // Toggle expanded state
  };

  const years = Array.from({ length: 3000 - 2020 + 1 }, (_, i) => 2020 + i);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredSalesData.slice(indexOfFirstRecord, indexOfLastRecord);

  useEffect(() => {
    fetchSalesData();
  }, []);

  useEffect(() => {
    handleGenerateReport();
  }, [reportType, searchDate, searchMonth, searchYear, salesData]);

  const handleReportTypeChange = (event) => {
    setReportType(event.target.value);
    setSearchDate('');
    setSearchMonth('');
    setSearchYear('');
  };

  const handleSearchDateChange = (event) => {
    setSearchDate(event.target.value);
    setReportType('');
    setSearchMonth('');
    setSearchYear('');
  };

  const handleSearchMonthChange = (event) => {
    setSearchMonth(event.target.value);
    setReportType('');
    setSearchDate('');
    setSearchYear('');
  };

  const handleSearchYearChange = (event) => {
    setSearchYear(event.target.value);
    setReportType('');
    setSearchDate('');
    setSearchMonth('');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" gutterBottom>
          Sales Reports
        </Typography>
        <Typography variant="h6" sx={{ color: 'black' }}>
          Total Revenue Generated: <b>₦{new Intl.NumberFormat().format(calculateTotalRevenue())}</b>
        </Typography>
        <Typography variant="h6" sx={{ color: 'black' }}>
          Total Profit: <b>₦{new Intl.NumberFormat().format(calculateTotalProfit())}</b>
        </Typography>
          <Tooltip title="Only products with cost price are used to calculate this total profit">
            <IconButton>
              <InfoIcon />
            </IconButton>
          </Tooltip>
      </Box>

      

      {/* Report Type Selection */}
      <FormControl variant="outlined" style={{ width: '200px', marginBottom: '20px' }}>
        <InputLabel>Report Type</InputLabel>
        <Select
          value={reportType}
          onChange={handleReportTypeChange}
          label="Report Type"
        >
          <MenuItem value=""><em>Select Report Type</em></MenuItem>
          <MenuItem value="daily-sales">Today's Sales Report</MenuItem>
          <MenuItem value="weekly-sales">Last 7 Days Sales Report</MenuItem>
          <MenuItem value="monthly-sales">Last 1 Month Sales Report</MenuItem>
        </Select>
      </FormControl>

      {/* Search fields */}
      <TextField
        label="Search by Date"
        type="date"
        variant="outlined"
        value={searchDate}
        onChange={handleSearchDateChange}
        style={{ marginBottom: '20px', marginRight: '20px' }}
        InputLabelProps={{
          shrink: true,
        }}
      />

      <FormControl variant="outlined" style={{ width: '200px', marginBottom: '20px' }}>
        <InputLabel>Search by Month</InputLabel>
        <Select
          value={searchMonth}
          onChange={handleSearchMonthChange}
          label="Search by Month"
        >
          <MenuItem value="">
            <em>Select Month</em>
          </MenuItem>
          {[...Array(12).keys()].map((i) => (
            <MenuItem key={i} value={i + 1}>
              {format(new Date(2024, i), 'MMMM')}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl variant="outlined" style={{ width: '200px', marginBottom: '20px' }}>
        <InputLabel>Search by Year</InputLabel>
        <Select
          value={searchYear}
          onChange={handleSearchYearChange}
          label="Search by Year"
        >
          <MenuItem value="">
            <em>Select Year</em>
          </MenuItem>
          {years.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Render filtered data */}
      <Paper sx={{ padding: 2 }}>
        {filteredSalesData.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No reports to display.
          </Typography>
        ) : (
          currentRecords.map((order) => (
            <Box key={order.purchaseCode} sx={{ mb: 2, border: '1px solid #ccc', borderRadius: '4px' }}>
              <Box
                sx={{ padding: 2, cursor: 'pointer' }}
                onClick={() => handleExpandClick(order.purchaseCode)}
              >
                <Typography variant="h6">Order Code: {order.purchaseCode}</Typography>
                <Typography variant="body1">{format(new Date(order.date_sold), 'yyyy-MM-dd')}</Typography>
                <Typography variant="body1">Sold By: {order.staff_name}</Typography>
              </Box>
              <Collapse in={expandedOrder === order.purchaseCode}>
                <Box sx={{ padding: 2 }}>
                  <Table sx={{ minWidth: 650 }} aria-label="order items table">
                    <TableHead>
                      <TableRow>
                        <TableCell><b>S/N</b></TableCell>
                        <TableCell><b>Name</b></TableCell>
                        <TableCell><b>Category</b></TableCell>
                        <TableCell><b>Quantity</b></TableCell>
                        <TableCell><b>Price</b></TableCell>
                        <TableCell><b>Subtotal</b></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.soldItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.categoryName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₦{parseFloat(item.price).toFixed(2)}</TableCell>
                          <TableCell>₦{new Intl.NumberFormat().format((item.quantity * parseFloat(item.price)).toFixed(2))}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 2 }}>
                    Total Price: ₦{new Intl.NumberFormat().format(order.soldItems.reduce((total, item) => total + item.quantity * parseFloat(item.price), 0).toFixed(2))}
                  </Typography>
                </Box>
              </Collapse>
            </Box>
          ))
        )}
      </Paper>

      <Pagination
        count={Math.ceil(filteredSalesData.length / recordsPerPage)}
        page={currentPage}
        onChange={handlePageChange}
        sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}
      />
    </Container>
  );
};

export default SalesReport;
