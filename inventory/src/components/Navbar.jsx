import { Add, AdminPanelSettings, ArrowDropDown, Assessment, Category, Dashboard, Inventory, Logout, PointOfSaleSharp, ShoppingBag } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Button, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Tooltip, Typography } from '@mui/material';
import React, { useState } from 'react';
import { NavLink, Link as RouterLink } from 'react-router-dom';
import { useUserContext } from './userContext';

const Navbar = () => {
  const { userDataExists } = useUserContext();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const drawerWidth = sidebarExpanded ? 240 : 70;

  const userType = JSON.parse(localStorage.getItem('userData'))?.user_type || '';

  const allLinks = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Inventory', icon: <Inventory />, path: '/inventory', roles: ['Manager', 'Inventory Personnel']},
    { text: 'Sales', icon: <PointOfSaleSharp />, path: '/sales', roles: ['Manager', 'Pharmacy', 'Cashier 1', 'Cashier 2'] },
    { text: 'Orders', icon: <ShoppingBag />, path: '/orders', roles: ['Manager', 'Cashier 1', 'Cashier 2'] },
    { text: 'Create Category', icon: <Category />, path: '/category-form', roles: ['Manager', 'Inventory Personnel'] },
    { text: 'Create Product', icon: <Add />, path: '/product-form', roles: ['Manager', 'Inventory Personnel'] },
    { text: 'Reports', icon: <Assessment />, path: '/reports', roles: ['Manager'] },
    { text: 'Logout', icon: <Logout />, path: '/logout' },
  ];

  const profileMenu = [
    { text: userType, icon: <AdminPanelSettings /> },
    // { text: 'Profile', icon: <AccountCircle />, path: '/profile' },
    // { text: 'Notifications', icon: <Notifications />, path: '/notifications' },
    { text: 'Logout', icon: <Logout />, path: '/logout' },
  ];

  const links = allLinks.filter(link => !link.roles || link.roles.includes(userType));

  const toggleSidebarWidth = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const getFirstName = () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      return parsedData.first_name || '';
    }
    return '';
  };

  const firstName = getFirstName();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: 'white',
          boxShadow: 3,
          width: userDataExists ? `calc(100% - ${drawerWidth}px)` : '100%',
          marginLeft: userDataExists ? `${drawerWidth}px` : '0',
          transition: 'width 0.3s ease, margin 0.3s ease',
        }}
      >
        <Toolbar sx={{ maxWidth: 1200, mx: 'auto', width: '100%', display: 'flex', alignItems: 'center' }}>
          <img
            src={`${process.env.PUBLIC_URL}/logo1.jpg`}
            alt="Logo"
            style={{ height: 80, marginRight: 16 }}
          />

          <Box sx={{ marginLeft: 'auto' }}> {/* Align to the right */}
            {userDataExists ? (
              <Box
                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={handleMenuOpen}
              >
                <Typography variant="h6" sx={{ color: '#3182ce', marginRight: 1 }}>
                  Hello {firstName}
                </Typography>
                <ArrowDropDown sx={{ color: '#3182ce' }} />
              </Box>
            ) : (
              <Button
                component={RouterLink}
                to="/"
                variant="contained"
                sx={{
                  backgroundColor: '#3182ce',
                  color: 'white',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#2c5282',
                  },
                }}
              >
                Login
              </Button>
            )}
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            {profileMenu.map((item) => (
              <MenuItem
                key={item.text}
                component={RouterLink}
                to={item.path}
                onClick={handleMenuClose}
              >
                <IconButton size="small" sx={{ marginRight: 1 }}>
                  {item.icon}
                </IconButton>
                {item.text}
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </AppBar>

      {userDataExists && (
        <Drawer
        variant="persistent"
        anchor="left"
        open={true}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#212121', // Dark background
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
            whiteSpace: 'nowrap',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflowY: 'auto', height: '100vh' }}>
          <List>
            <ListItem button onClick={toggleSidebarWidth}>
              <ListItemIcon sx={{ color: '#53A022' }}> {/* Green icon color */}
                <MenuIcon />
              </ListItemIcon>
            </ListItem>
      
            {links.map((link) => (
              <ListItem button key={link.text}>
                <NavLink
                  to={link.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    color: isActive ? '#3182ce' : 'white', // Active text color
                    textDecoration: 'none',
                    width: '100%',
                  })}
                >
                  {sidebarExpanded ? (
                    <>
                      <ListItemIcon
                        sx={{
                          color: ({ isActive }) => (isActive ? '#3182ce' : '#53A022'), // Active blue or green for icons
                          '&:hover': { color: '#76c043' }, // Lighter green on hover
                        }}
                      >
                        {link.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={link.text}
                        sx={{
                          color: ({ isActive }) => (isActive ? '#3182ce' : 'white'), // Active blue or white for text
                          '&:hover': { color: '#76c043' }, // Lighter green on hover
                        }}
                      />
                    </>
                  ) : (
                    <Tooltip title={link.text}>
                      <ListItemIcon
                        sx={{
                          color: ({ isActive }) => (isActive ? '#3182ce' : '#53A022'), // Active blue or green for icons
                          '&:hover': { color: '#76c043' }, // Lighter green on hover
                        }}
                      >
                        {link.icon}
                      </ListItemIcon>
                    </Tooltip>
                  )}
                </NavLink>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      )}
    </Box>
  );
};

export default Navbar;
