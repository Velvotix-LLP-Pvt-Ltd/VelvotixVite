// StudentTableWithPopup.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  useMediaQuery,
  useTheme,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import StudentDetailsDialog from './StudentPopupDialog';
import SchoolDetailsDialog from './SchoolDetailDialog';

export default function StudentTableWithPopup() {
  const [students, setStudents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [schoolDialogOpen, setSchoolDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({
    gender: false,
    studentId: false,
    section: false,
    admissionDate: false,
    category: false,
    religion: false,
    motherName: false
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const role = localStorage.getItem('role');
  const schoolId = localStorage.getItem('id');

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const filtered = role === 'School' ? res.data.filter((s) => s.school?._id === schoolId) : res.data;
      const formatted = filtered.map((s, i) => ({
        id: s._id || i,
        ...s,
        school_code: s.school?.school_code || '',
        school_id: s.school?._id || ''
      }));
      setStudents(formatted);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/auth/login');
      } else console.error('Error:', err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleRowClick = (params) => {
    setSelectedStudentId(params.row._id);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_APP_API_URL}/students/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteId(null);
      setConfirmOpen(false);
      fetchStudents();
    } catch (err) {
      console.error('Delete Error:', err);
    }
  };

  const formatDate = (dateString) => {
    return dateString?.slice(0, 10);
  };

  const columns = [
    {
      field: 'school_code',
      headerName: 'School Code',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Button
          variant="text"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedSchoolId(params.row.school_id);
            setSchoolDialogOpen(true);
          }}
        >
          {params.value}
        </Button>
      )
    },
    { field: 'name', headerName: 'Name', flex: 1.5, minWidth: 160 },
    {
      field: 'dob',
      headerName: 'DOB',
      flex: 1,
      minWidth: 140,
      valueGetter: (params) => {
        const raw = params;
        if (!raw) return '';
        const date = new Date(raw);
        if (isNaN(date)) return '';
        return date.toISOString().split('T')[0];
      }
    },
    { field: 'class', headerName: 'Class', flex: 0.5, minWidth: 100 },
    { field: 'fatherName', headerName: 'Father Name', flex: 1, minWidth: 160 },
    { field: 'gender', headerName: 'Gender', flex: 1, minWidth: 120 },
    { field: 'studentId', headerName: 'Student ID', flex: 1, minWidth: 150 },
    { field: 'section', headerName: 'Section', flex: 0.5, minWidth: 100 },
    {
      field: 'admissionDate',
      headerName: 'Admission Date',
      flex: 1,
      minWidth: 140,
      valueFormatter: ({ value }) => formatDate(value)
    },
    { field: 'category', headerName: 'Category', flex: 1, minWidth: 130 },
    { field: 'religion', headerName: 'Religion', flex: 1, minWidth: 130 },
    { field: 'motherName', headerName: 'Mother Name', flex: 1, minWidth: 160 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      width: 120,
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
      )
    }
  ];

  return (
    <Box sx={{ width: '100%', height: 'auto', position: 'relative' }}>
      <DataGrid
        rows={students}
        columns={columns}
        pagination
        pageSizeOptions={[10, 20, 50]}
        onRowClick={handleRowClick}
        disableRowSelectionOnClick
        slots={{ toolbar: GridToolbar }}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
        sx={{ minWidth: isMobile ? '600px' : '100%', backgroundColor: '#fff' }}
      />

      <StudentDetailsDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          fetchStudents();
        }}
        studentId={selectedStudentId}
      />

      <SchoolDetailsDialog open={schoolDialogOpen} onClose={() => setSchoolDialogOpen(false)} schoolId={selectedSchoolId} viewOnly />

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1100 }}
        onClick={() => {
          setSelectedStudentId(null);
          setDialogOpen(true);
        }}
      >
        <AddIcon />
      </Fab>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete this student?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
