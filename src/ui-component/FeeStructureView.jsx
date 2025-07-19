import React, { useEffect, useState } from 'react';
import {
  Box,
  Fab,
  IconButton,
  Typography,
  useMediaQuery,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Card,
  CardContent,
  Divider,
  Fade,
  Zoom
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ViewList, ViewModule } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import FeeStructurePopupDialog from './FeeStructurePopupDialog';
import SchoolDetailsDialog from './SchoolDetailDialog';
import ConfirmDialog from './ConfirmDialog';
import { SchoolSelectDropdown } from './schoolDropdowns';

const FeeStructureView = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [feeStructures, setFeeStructures] = useState([]);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [schoolDialogOpen, setSchoolDialogOpen] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [viewMode, setViewMode] = useState('table');

  const fetchFeeStructures = async () => {
    if (!selectedSchool) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/fee/fee-structure?school_code=${selectedSchool}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const formatted = res.data.map((item) => ({
        id: item._id,
        ...item,
        school_code: item.school?.school_code || '',
        school_id: item.school?._id || '',
        tuitionFee: item.feeBreakup?.tuition || 0,
        admissionFee: item.feeBreakup?.admission || 0,
        examFee: item.feeBreakup?.exam || 0,
        transportFee: item.feeBreakup?.transport || 0,
        otherFee: item.feeBreakup?.other || 0
      }));

      setFeeStructures(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFeeStructures();
  }, [selectedSchool]);

  const handleRowClick = (params) => {
    setSelectedStructure(params.row);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedStructure(null);
    fetchFeeStructures();
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_APP_API_URL}/fee/fee-structure/${deleteId}`);
      fetchFeeStructures();
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const columns = [
    {
      field: 'school_code',
      headerName: 'School Code',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Button
          variant="text"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedSchoolId(params.row?.school_id);
            setSchoolDialogOpen(true);
          }}
        >
          {params.value}
        </Button>
      )
    },
    { field: 'class', headerName: 'Class', flex: 1, minWidth: 100 },
    { field: 'academicYear', headerName: 'Academic Year', flex: 1.2, minWidth: 150 },
    { field: 'monthlyFee', headerName: 'Monthly Fee', flex: 1, minWidth: 130 },
    { field: 'tuitionFee', headerName: 'Tuition Fee', flex: 1, minWidth: 130 },
    { field: 'admissionFee', headerName: 'Admission Fee', flex: 1, minWidth: 130 },
    { field: 'examFee', headerName: 'Exam Fee', flex: 1, minWidth: 130 },
    { field: 'transportFee', headerName: 'Transport Fee', flex: 1, minWidth: 130 },
    { field: 'otherFee', headerName: 'Other Fee', flex: 1, minWidth: 130 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      width: 100,
      renderCell: (params) => (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setDeleteId(params.row?._id);
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
    <Box sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap">
        <SchoolSelectDropdown
          label="School Code"
          value={selectedSchool}
          onChange={(e) => {
            const newValue = e?.target?.value ?? e;
            setSelectedSchool(newValue);
          }}
        />

        <ToggleButtonGroup value={viewMode} exclusive onChange={(e, val) => val && setViewMode(val)}>
          <ToggleButton value="table">
            <ViewList />
          </ToggleButton>
          <ToggleButton value="card">
            <ViewModule />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {selectedSchool && (
        <Fade in timeout={500}>
          <Box>
            {viewMode === 'table' ? (
              <Paper elevation={0} sx={{ height: 'calc(100vh - 220px)', width: '100%' }}>
                <DataGrid rows={feeStructures} columns={columns} pageSize={10} onRowClick={handleRowClick} getRowId={(row) => row._id} />
              </Paper>
            ) : (
              <Zoom in timeout={500}>
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }} gap={2}>
                  {feeStructures.map((item) => (
                    <Card elevation={1} key={item._id} onClick={() => handleRowClick({ row: item })} sx={{ cursor: 'pointer', p: 1 }}>
                      <CardContent>
                        <Typography variant="h6" color="primary">
                          {item.class} - {item.academicYear}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body2">Monthly: ₹{item.monthlyFee}</Typography>
                        <Typography variant="body2">Tuition: ₹{item.tuitionFee}</Typography>
                        <Typography variant="body2">Admission: ₹{item.admissionFee}</Typography>
                        <Typography variant="body2">Exam: ₹{item.examFee}</Typography>
                        <Typography variant="body2">Transport: ₹{item.transportFee}</Typography>
                        <Typography variant="body2">Other: ₹{item.otherFee}</Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Zoom>
            )}
          </Box>
        </Fade>
      )}

      <FeeStructurePopupDialog open={dialogOpen} onClose={handleDialogClose} feeStructureId={selectedStructure?.id} />
      <SchoolDetailsDialog open={schoolDialogOpen} onClose={() => setSchoolDialogOpen(false)} schoolId={selectedSchoolId} mode="view" />
      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Delete"
        content="Are you sure you want to delete this fee structure?"
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />

      <Zoom in>
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: isMobile ? 70 : 40, right: 40 }}
          onClick={() => {
            setSelectedStructure(null);
            setDialogOpen(true);
          }}
        >
          <AddIcon />
        </Fab>
      </Zoom>
    </Box>
  );
};

export default FeeStructureView;
