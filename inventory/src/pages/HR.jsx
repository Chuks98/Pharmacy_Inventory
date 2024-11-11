import { Add, Delete, Edit } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HR = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);  // State to control the edit dialog
  const [currentUser, setCurrentUser] = useState(null);  // State to store the user being edited
  const [updatedUser, setUpdatedUser] = useState({}); // State to hold updated user data

  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('userData'));

  const apiUrl = process.env.REACT_APP_API_ENDPOINT;

  useEffect(() => {
    if(userData) {
        if(userData.user_type !== 'Manager') {
            navigate('/');
        }
    } else {
        navigate('/');
    }
    fetchUsers();
  }, []);

  // Fetch users from the database
  const fetchUsers = async () => {
    setLoading(true);
    try {
        const response = await axios.get(`${apiUrl}/users/get_all_users`, {
            headers: {
                'Accept': 'application/json',
            }
        });
        setUsers(response.data);
    } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle user edit action
  const handleEdit = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      setCurrentUser(user);
      setUpdatedUser({ ...userWithoutPassword }); // Set initial values for editing without password
      setOpenEditDialog(true);
    }
  };
  // Handle user update
  const handleUpdate = async () => {
    if ((updatedUser.password == undefined) || (updatedUser.password == '')) {
        return toast.warning('Please enter a password.');
    }
    try {
      setDialogLoading(true);
      const response = await axios.patch(`${apiUrl}/users/update_single_user/${updatedUser.id}`, updatedUser, {
        headers: {
          'Accept': 'application/json',
        },
      });
  
      // Handle success response based on status codes
      const { status, data } = response;
  
      if (status === 200) {
        toast.success("User updated successfully.");
        setOpenEditDialog(false);
        fetchUsers(); // Refresh the list after update
      } else if (status === 203) {
        toast.warning("Username already exists. Please choose another one.");
      } else if (status === 204) {
        toast.warning("Email already exists. Please use a different email.");
      } else if (status === 205) {
        toast.warning("User type already exists. Please select a different user type.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
  
    } catch (error) {
      console.error("Error updating user:", error);
      
      // Handle errors that occur during the network request (e.g., server issues or network failure)
      toast.error("Failed to update user. Please try again.");
    } finally {
      setDialogLoading(false);
    }
  };

  // Handle user delete action
  const handleDelete = async (userId, username) => {
    confirmAlert({
      title: 'Confirm Logout',
      message: `Are you sure you want to delete ${username}?`,
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              const response = await axios.delete(`${apiUrl}/users/delete_single_user/${userId}`);
              if (response.status == 200) {
                toast.success("User deleted successfully.");
                fetchUsers(); // Refresh the list after deletion
              }
            } catch (error) {
              console.error("Error deleting user:", error);
              toast.error("Failed to delete user. Please try again.");
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
          onClick: () => {}, // No action on cancel
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
    <Container sx={{ mt: 7 }}>
      <Box sx={{position: 'relative', display: 'flex', justifyContent: 'space-between'}}>
        <Typography variant="h4" gutterBottom>
          Staff Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => navigate('/register')}
          sx={{height: '38px'}}
        >Add New User
        </Button> 
      </Box>

      {loading ? <CircularProgress/> :

      <TableContainer sx={{ backgroundColor: 'white', borderRadius: 2, overflow: 'hidden' }}>
        <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>S/N</TableCell> 
              <TableCell sx={{ fontWeight: 'bold', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '15%' }}>Username</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '15%' }}>User Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '15%' }}>First Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '15%' }}>Last Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '20%' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '15%' }}>Phone Number</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '20%' }}>Address</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((user, index) => (
              <TableRow key={user.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  <Tooltip title={user.username} placement="top">
                    <span>{user.username}</span>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  <Tooltip title={user.user_type} placement="top">
                    <span>{user.user_type}</span>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  <Tooltip title={user.first_name} placement="top">
                    <span>{user.first_name}</span>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  <Tooltip title={user.last_name} placement="top">
                    <span>{user.last_name}</span>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  <Tooltip title={user.email} placement="top">
                    <span>{user.email}</span>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  <Tooltip title={user.phone_number} placement="top">
                    <span>{user.phone_number}</span>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  <Tooltip title={user.address} placement="top">
                    <span>{user.address}</span>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ display: 'flex' }}>
                  <Tooltip title={`Edit ${user.username}`} placement="top">
                    <IconButton onClick={() => handleEdit(user.id)} color="primary">
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={`Delete ${user.username}`} placement="top">
                    <IconButton onClick={() => handleDelete(user.id, user.username)} color="error">
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>}

      {/* Edit Dialog */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
          {dialogLoading ? <CircularProgress/> :
          <>
            <DialogTitle sx={{backgroundColor: '#212121', color: '#ccc'}}>Edit User
                <IconButton
                aria-label="close"
                onClick={() => setOpenEditDialog(false)}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{marginTop: '10px'}}>
                {currentUser && (
                <>
                    <TextField
                    label="Username"
                    fullWidth
                    value={updatedUser.username}
                    onChange={(e) => setUpdatedUser({ ...updatedUser, username: e.target.value })}
                    sx={{ mb: 2, marginTop: '5px' }}
                    />
                    <Select
                    label="User Type"
                    fullWidth
                    value={updatedUser.user_type}
                    onChange={(e) => setUpdatedUser({ ...updatedUser, user_type: e.target.value })}
                    displayEmpty
                    sx={{ mb: 2 }}
                    >
                        <MenuItem value="Manager">Manager</MenuItem>
                        <MenuItem value="Inventory Personnel">Inventory Personnel</MenuItem>
                        <MenuItem value="Pharmacy">Pharmacy</MenuItem>
                        <MenuItem value="Cashier 1">Cashier 1</MenuItem>
                        <MenuItem value="Cashier 2">Cashier 2</MenuItem>
                    </Select>
                    <TextField
                    label="First Name"
                    fullWidth
                    value={updatedUser.first_name}
                    onChange={(e) => setUpdatedUser({ ...updatedUser, first_name: e.target.value })}
                    sx={{ mb: 2 }}
                    />
                    <TextField
                    label="Last Name"
                    fullWidth
                    value={updatedUser.last_name}
                    onChange={(e) => setUpdatedUser({ ...updatedUser, last_name: e.target.value })}
                    sx={{ mb: 2 }}
                    />
                    <TextField
                    label="Email"
                    fullWidth
                    value={updatedUser.email}
                    onChange={(e) => setUpdatedUser({ ...updatedUser, email: e.target.value })}
                    sx={{ mb: 2 }}
                    />
                    <TextField
                    label="Phone Number"
                    fullWidth
                    value={updatedUser.phone_number}
                    onChange={(e) => setUpdatedUser({ ...updatedUser, phone_number: e.target.value })}
                    sx={{ mb: 2 }}
                    />
                    <TextField
                    label="Address"
                    fullWidth
                    value={updatedUser.address}
                    onChange={(e) => setUpdatedUser({ ...updatedUser, address: e.target.value })}
                    sx={{ mb: 2 }}
                    />
                    <TextField
                      label="Enter New Password"
                      fullWidth
                      type="password"  // Mask characters for password input
                      value={updatedUser.password || ''}  // Ensure it starts empty
                      onChange={(e) => setUpdatedUser({ ...updatedUser, password: e.target.value })}
                      sx={{ mb: 2 }}
                      required  // Make the field required
                  />
                </>
                )}
            </DialogContent>
            <DialogActions>
                <Button sx={{ backgroundColor: 'crimson', color: 'white' }} onClick={() => setOpenEditDialog(false)} color="primary">
                Cancel
                </Button>
                <Button sx={{ backgroundColor: '#3182ce', color: 'white' }} onClick={handleUpdate} color="primary">
                Update
                </Button>
            </DialogActions>
            </>
          }
        </Dialog>

      <ToastContainer />
    </Container>
  );
};

export default HR;
