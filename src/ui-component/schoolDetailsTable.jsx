import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, useMediaQuery, useTheme, Fab } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import SchoolDetailsDialog from './SchoolDetailDialog';

export default function SchoolTableWithPopup() {
  const [schools, setSchools] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const columns = [
    { field: 'school_code', headerName: 'School Code', minWidth: 120, flex: 1 },
    { field: 'school_name', headerName: 'School Name', minWidth: 200, flex: 2 },
    { field: 'academic_year', headerName: 'Academic Year', minWidth: 120, flex: 1 },
    !isMobile && { field: 'school_category', headerName: 'Category', minWidth: 150, flex: 1 },
    !isMobile && { field: 'school_type', headerName: 'Type', minWidth: 150, flex: 1 },
    !isMobile && { field: 'affiliation_board', headerName: 'Board', minWidth: 150, flex: 1 }
  ].filter(Boolean); // remove false columns on mobile

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
          fetchSchools(); // refresh on close
        }}
        schoolId={selectedSchoolId}
      />

      <Fab
        color="primary"
        aria-label="add"
        onClick={() => {
          setSelectedSchoolId(null); // create mode
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
    </Box>
  );
}
