import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, useMediaQuery, useTheme, Fab, Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolDetailsDialog from './SchoolDetailDialog';

export default function SchoolTableWithPopup() {
  const [schools, setSchools] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0
  });

  const fetchSchools = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/schools`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const formatted = res.data.map((school, index) => ({
        id: school._id || index,
        ...school
      }));
      setSchools(formatted);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/auth/login');
      } else {
        console.error('Fetch error:', err);
      }
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleRowClick = (params) => {
    setSelectedSchoolId(params.row._id);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_APP_API_URL}/schools/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConfirmOpen(false);
      setDeleteId(null);
      fetchSchools();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const columns = [
    { field: 'school_code', headerName: 'School Code', minWidth: 120, flex: 1 },
    { field: 'school_name', headerName: 'School Name', minWidth: 200, flex: 2 },
    { field: 'academic_year', headerName: 'Academic Year', minWidth: 120, flex: 1 },
    !isMobile && { field: 'school_category', headerName: 'Category', minWidth: 150, flex: 1 },
    !isMobile && { field: 'school_type', headerName: 'Type', minWidth: 150, flex: 1 },
    !isMobile && { field: 'affiliation_board', headerName: 'Board', minWidth: 150, flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      renderCell: (params) => (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setDeleteId(params.row._id);
            setConfirmOpen(true);
          }}
          color="error"
        >
          <DeleteIcon />
        </IconButton>
      ),
      width: 100
    }
  ].filter(Boolean);

  return (
    <Box sx={{ height: 'auto', width: '100%', overflowX: 'auto', position: 'relative' }}>
      <DataGrid
        rows={schools}
        columns={columns}
        pagination
        pageSizeOptions={[10, 20, 50, 100]}
        paginationModel={paginationModel}
        onPaginationModelChange={(model) => setPaginationModel(model)}
        onRowClick={handleRowClick}
        slots={{ toolbar: GridToolbar }}
        disableRowSelectionOnClick
        sx={{
          minWidth: isMobile ? '600px' : '100%',
          backgroundColor: '#fff'
        }}
      />

      <SchoolDetailsDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          fetchSchools();
        }}
        schoolId={selectedSchoolId}
      />

      <Fab
        color="primary"
        aria-label="add"
        onClick={() => {
          setSelectedSchoolId(null);
          setDialogOpen(true);
        }}
        sx={{
          position: 'fixed',
          bottom: isMobile ? 16 : 32,
          right: isMobile ? 16 : 32,
          zIndex: 1100,
          boxShadow: 6
        }}
      >
        <AddIcon />
      </Fab>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete this school?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
