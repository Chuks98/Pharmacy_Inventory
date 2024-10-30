import { Box, CssBaseline } from '@mui/material';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import { UserProvider } from './components/userContext';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Login from './pages/Login';
import Reports from './pages/Reports';
import Sales from './pages/Sales';
import CategoryForm from './pages/category-form';
import EditProductForm from './pages/edit-product-form';
import ErrorBoundary from './pages/error-boundary';
import Logout from './pages/logout';
import NotFound from './pages/not-found';
import OrderPage from './pages/order-page';
import ProductForm from './pages/product-form';
import Register from './pages/register';

function App() {
  const theme = 'light';

  return (
    <UserProvider>
      <Router>
        <CssBaseline />
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          {/* Wrap Navbar and Main Content in ErrorBoundary */}
          <ErrorBoundary>
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
                <Route path="/register" element={<Register />} />
                <Route path="/category-form" element={<CategoryForm />} />
                <Route path="/product-form" element={<ProductForm />} />
                <Route path="/edit-product/:productId" element={<EditProductForm />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Box>
          </ErrorBoundary>
        </Box>
      </Router>
    </UserProvider>
  );
}

export default App;
