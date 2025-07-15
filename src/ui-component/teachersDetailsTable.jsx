import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, useMediaQuery, useTheme, Fab, Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolDetailsDialog from './SchoolDetailDialog';
import TeacherDetailsDialog from './TeacherDetailDialog';

export default function TeacherTableWithPopup() {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const id = localStorage.getItem('id');

      const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/teachers`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      let teachersData = res.data;

      // 🏫 Filter if role is "School"
      if (role === 'School') {
        teachersData = teachersData.filter((t) => t.school?._id === id);
      }

      const formatted = teachersData.map((teacher, index) => ({
        id: teacher._id || index,
        ...teacher,
        school_code: teacher.school?.school_code || '',
        school_id: teacher.school?._id || ''
      }));

      setTeachers(formatted);
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
    fetchTeachers();
  }, []);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_APP_API_URL}/teachers/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConfirmOpen(false);
      setDeleteId(null);
      fetchTeachers();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const columns = [
    { field: 'teacherId', headerName: 'Teacher ID', minWidth: 120, flex: 1 },
    { field: 'name', headerName: 'Name', minWidth: 180, flex: 1 },
    {
      field: 'dob',
      headerName: 'Date of Birth',
      minWidth: 150,
      flex: 1,
      valueGetter: (params) => {
        const raw = params;
        if (!raw) return '';
        const date = new Date(raw);
        if (isNaN(date)) return '';
        return date.toISOString().split('T')[0];
      }
    },
    { field: 'gender', headerName: 'Gender', minWidth: 100, flex: 1 },
    {
      field: 'school_code',
      headerName: 'School Code',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedSchoolId(params.row.school_id);
          }}
        >
          {params.value}
        </Button>
      )
    },
    { field: 'designation', headerName: 'Designation', minWidth: 150, flex: 1 },
    { field: 'qualification', headerName: 'Qualification', minWidth: 200, flex: 1 },
    {
      field: 'doj',
      headerName: 'Date of Joining',
      minWidth: 150,
      flex: 1,
      valueGetter: (params) => {
        const raw = params;
        if (!raw) return 'k';
        const date = new Date(raw);
        if (isNaN(date)) return '';
        return date.toISOString().split('T')[0];
      }
    },
    {
      field: 'phone',
      headerName: 'Phone',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => {
        const rawPhone = params.value || '';
        const formatted = `+91-${rawPhone}`;
        return (
          <a href={`tel:${formatted}`} style={{ color: '#1976d2', textDecoration: 'none' }}>
            {formatted}
          </a>
        );
      }
    },
    { field: 'trained', headerName: 'Trained', minWidth: 100, flex: 1, type: 'boolean' },
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
  ];

  return (
    <Box sx={{ height: 'auto', width: '100%', overflowX: 'auto', position: 'relative' }}>
      <DataGrid
        rows={teachers}
        columns={columns}
        pagination
        pageSizeOptions={[10, 20, 50, 100]}
        paginationModel={paginationModel}
        onPaginationModelChange={(model) => setPaginationModel(model)}
        onRowClick={(params) => {
          setSelectedTeacherId(params.row._id);
          setDialogOpen(true);
        }}
        slots={{ toolbar: GridToolbar }}
        disableRowSelectionOnClick
        sx={{ minWidth: isMobile ? '600px' : '100%', backgroundColor: '#fff' }}
      />

      <TeacherDetailsDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          fetchTeachers();
        }}
        teacherId={selectedTeacherId}
      />

      <SchoolDetailsDialog open={!!selectedSchoolId} onClose={() => setSelectedSchoolId(null)} schoolId={selectedSchoolId} />

      <Fab
        color="primary"
        aria-label="add"
        onClick={() => {
          setSelectedTeacherId(null);
          setDialogOpen(true);
        }}
        sx={{ position: 'fixed', bottom: isMobile ? 16 : 32, right: isMobile ? 16 : 32, zIndex: 1100, boxShadow: 6 }}
      >
        <AddIcon />
      </Fab>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete this teacher?</DialogContent>
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
