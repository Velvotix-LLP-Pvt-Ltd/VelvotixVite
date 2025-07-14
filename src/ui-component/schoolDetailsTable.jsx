import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import SchoolDetailsDialog from './SchoolDetailDialog';

export default function SchoolTableWithPopup() {
  const [schools, setSchools] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
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
    <Box sx={{ height: 'auto', width: '100%', overflowX: 'auto' }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Schools Master Table
      </Typography>

      <DataGrid
        rows={schools}
        columns={columns}
        pageSize={10}
        onRowClick={handleRowClick}
        components={{ Toolbar: GridToolbar }}
        disableRowSelectionOnClick
        sx={{
          minWidth: isMobile ? '600px' : '100%',
          backgroundColor: '#fff'
        }}
      />

      <SchoolDetailsDialog open={dialogOpen} onClose={() => setDialogOpen(false)} schoolId={selectedSchoolId} />
    </Box>
  );
}
