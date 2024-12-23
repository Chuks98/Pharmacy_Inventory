import { Box, CssBaseline } from '@mui/material';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import { UserProvider } from './components/userContext';
import ErrorBoundary from './handlers/error-boundary';
import Dashboard from './pages/Dashboard';
import HR from './pages/HR';
import Inventory from './pages/Inventory';
import Login from './pages/Login';
import Reports from './pages/Reports';
import Sales from './pages/Sales';
import CategoryForm from './pages/category-form';
import EditProductForm from './pages/edit-product-form';
import Logout from './pages/logout';
import NotFound from './pages/not-found';
import OrderPage from './pages/order-page';
import ProductForm from './pages/product-form';
import Register from './pages/register';
import SalesReport from './pages/sales-report';

function App() {
  const theme = 'light';

  return (
    <UserProvider>
      <ErrorBoundary>
      <Router>
        <CssBaseline />
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          {/* Wrap Navbar and Main Content in ErrorBoundary */}
            <Navbar />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                backgroundColor: theme === 'light' ? '#f7fafc' : '#1a202c',
                paddingTop: '64px',
                minHeight: '100vh',
                overflow: 'auto',
              }}
            >
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/orders" element={<OrderPage />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/sales-reports" element={<SalesReport />} />
                <Route path="/register" element={<Register />} />
                <Route path="/category-form" element={<CategoryForm />} />
                <Route path="/product-form" element={<ProductForm />} />
                <Route path="/edit-product/:productId" element={<EditProductForm />} />
                <Route path="/human-resources" element={<HR/>} />
                <Route path="/logout" element={<Logout />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Box>
        </Box>
      </Router>
      </ErrorBoundary>
    </UserProvider>
  );
}

export default App;
