import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Paper,
  Fade,
  MenuItem,
  TextField,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import { SchoolSelectDropdown } from './schoolDropdowns';
import { ClassSelectDropdown } from './ClassSelectDropdown';
import { StudentSelectDropdown } from './StudentSelectDropdown';
import UnauthorizedHandler from './UnauthorizedHandler';

const PaymentPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('id');
  const token = localStorage.getItem('token');

  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [availableYears, setAvailableYears] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const handleInvoiceOpen = (payment) => {
    setSelectedPayment(payment);
    setInvoiceOpen(true);
  };

  const handleInvoiceClose = () => {
    setInvoiceOpen(false);
    setSelectedPayment(null);
  };

  useEffect(() => {
    const fetchSchoolCode = async () => {
      if (role === 'Admin') return;

      try {
        let url = '';
        if (role === 'School') url = `/schools/${userId}`;
        else if (role === 'Teacher') url = `/teachers/${userId}`;
        else if (role === 'Student') url = `/students/${userId}`;
        else return;

        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}${url}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const schoolCode = role === 'School' ? res.data.school_code : res.data.school.school_code;
        setSelectedSchool(schoolCode);

        const schoolDetails = await axios.get(`${import.meta.env.VITE_APP_API_URL}/schools/${schoolCode}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setClassOptions(schoolDetails.data.classes_offered || []);
      } catch (err) {
        UnauthorizedHandler(err);
        console.error('Failed to fetch school code:', err);
      }
    };

    fetchSchoolCode();
  }, [role, userId, token]);

  useEffect(() => {
    const fetchSchoolClasses = async () => {
      if (role !== 'Admin' || !selectedSchool) return;

      try {
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/schools/${selectedSchool}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClassOptions(res.data.classes_offered || []);
      } catch (err) {
        UnauthorizedHandler(err);
        console.error('Failed to fetch classes:', err);
      }
    };

    fetchSchoolClasses();
  }, [selectedSchool]);

  useEffect(() => {
    if (!selectedStudent) {
      setPayments([]);
      setFilteredPayments([]);
      setAvailableYears([]);
      return;
    }

    const fetchPayments = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/fee/payments/${selectedStudent}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPayments(res.data);
        setAvailableYears([...new Set(res.data.map((p) => p.academicYear))]);
      } catch (err) {
        UnauthorizedHandler(err);
        console.error('Failed to fetch payments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [selectedStudent]);

  useEffect(() => {
    if (!selectedYear) {
      setFilteredPayments(payments);
    } else {
      setFilteredPayments(payments.filter((p) => p.academicYear === selectedYear));
    }
  }, [selectedYear, payments]);

  const columns = [
    { field: 'academicYear', headerName: 'Academic Year', flex: 1, minWidth: 130 },
    { field: 'amountPaid', headerName: 'Amount Paid', flex: 1, type: 'number', minWidth: 120 },
    { field: 'mode', headerName: 'Payment Mode', flex: 1, minWidth: 130 },
    { field: 'remarks', headerName: 'Remarks', flex: 2, minWidth: 180 },
    {
      field: 'paymentDate',
      headerName: 'Payment Date',
      flex: 1.5,
      minWidth: 180,
      valueGetter: (params) => {
        const date = params;
        return date ? dayjs.utc(date).format('YYYY-MM-DD') : 'N/A';
      }
    }
  ];

  return (
    <Box p={isMobile ? 1 : 3} sx={{ overflowX: 'auto' }}>
      <Grid container spacing={2} mb={2}>
        {role === 'Admin' && (
          <Grid item xs={12} sm={6} md={3}>
            <SchoolSelectDropdown
              value={selectedSchool}
              onChange={(schoolCode) => {
                setSelectedSchool(schoolCode);
                setSelectedClass('');
                setSelectedStudent('');
              }}
              required
              fullWidth
            />
          </Grid>
        )}

        <Grid item xs={12} sm={6} md={3}>
          <ClassSelectDropdown
            value={selectedClass}
            onChange={(cls) => {
              setSelectedClass(cls);
              setSelectedStudent('');
            }}
            options={classOptions}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StudentSelectDropdown
            schoolCode={selectedSchool}
            className={selectedClass}
            value={selectedStudent}
            onChange={setSelectedStudent}
            required
            fullWidth
          />
        </Grid>

        {selectedStudent && (
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Academic Year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              sx={{ minWidth: '200px', height: '20%' }}
            >
              <MenuItem value="">All</MenuItem>
              {availableYears.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}
      </Grid>

      <Fade in={!!selectedStudent}>
        <Paper elevation={0.1} sx={{ width: '100%', overflowX: 'auto' }}>
          {loading ? (
            <Box p={4} textAlign="center">
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <DataGrid
              rows={filteredPayments.map((row, index) => ({ id: index, ...row }))}
              columns={columns}
              autoHeight
              disableRowSelectionOnClick
              pageSize={10}
              onRowClick={(params) => handleInvoiceOpen(params.row)}
              rowsPerPageOptions={[10, 25, 50]}
              sx={{
                p: 2,
                minWidth: 600,
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#e8f0fe'
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: '#f1f1f1'
                }
              }}
            />
          )}
        </Paper>
      </Fade>

      <InvoiceDialog open={invoiceOpen} onClose={handleInvoiceClose} payment={selectedPayment} />
    </Box>
  );
};

const InvoiceDialog = ({ open, onClose, payment }) => {
  const printRef = useRef();

  if (!payment) return null;

  const { student, school, academicYear, amountPaid, mode, remarks, paymentDate, RemainingBalance } = payment;

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    // window.location.reload();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Fee Receipt</DialogTitle>
      <DialogContent>
        <div ref={printRef} style={{ padding: 16, fontFamily: 'Arial, sans-serif', color: '#000' }}>
          <Box textAlign="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              {school.school_name}
            </Typography>
            <Typography variant="body2">
              {school.location.village_town}, {school.location.district}, {school.location.state} - {school.location.pin_code}
            </Typography>
            <Typography variant="body2">
              Phone: {school.headmaster?.mobile} | Email: {school.headmaster?.email}
            </Typography>
            <Typography variant="subtitle1" mt={2} fontWeight="bold" style={{ textDecoration: 'underline' }}>
              Fee Receipt
            </Typography>
            <Typography variant="body2" mt={1}>
              Date of Payment: <strong>{dayjs.utc(paymentDate).format('YYYY-MM-DD')}</strong>
            </Typography>
          </Box>

          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" mb={2} gap={2}>
            <Box flex={1}>
              <Typography variant="body2">
                <strong>Academic Year:</strong> {academicYear}
              </Typography>
              <Typography variant="body2">
                <strong>Payment Mode:</strong> {mode}
              </Typography>
              <Typography variant="body2">
                <strong>Remarks:</strong> {remarks || '-'}
              </Typography>
            </Box>

            <Box flex={1}>
              <Typography variant="body2">
                <strong>Student Name:</strong> {student.name}
              </Typography>
              <Typography variant="body2">
                <strong>Student ID:</strong> {student.studentId}
              </Typography>
              <Typography variant="body2">
                <strong>Class:</strong> {student.class} - {student.section}
              </Typography>
              <Typography variant="body2">
                <strong>Father's Name:</strong> {student.fatherName}
              </Typography>
              <Typography variant="body2">
                <strong>Phone:</strong> {student.contact?.phone}
              </Typography>
            </Box>
          </Box>

          <Box border={1} borderColor="#000" p={1} mt={3} overflow="auto">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid black', padding: '8px' }}>S.No.</th>
                  <th style={{ border: '1px solid black', padding: '8px' }}>Description</th>
                  <th style={{ border: '1px solid black', padding: '8px' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>1</td>
                  <td style={{ border: '1px solid black', padding: '8px' }}>Fee Payment</td>
                  <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{amountPaid.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="2" style={{ border: '1px solid black', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                    Total Paid
                  </td>
                  <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                    {amountPaid.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </Box>

          <Box mt={3}>
            <Typography variant="body2">
              <strong>Remaining Balance as on {dayjs.utc(paymentDate).format('YYYY-MM-DD')}:</strong> ₹{' '}
              {RemainingBalance?.toFixed(2) || '0.00'}
            </Typography>
          </Box>

          <Box mt={4}>
            <Typography variant="caption">* This is a computer-generated receipt and does not require a signature.</Typography>
            <Typography variant="caption">Receipt generated on {dayjs().format('YYYY-MM-DD HH:mm')}</Typography>
          </Box>
        </div>

        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button variant="outlined" onClick={onClose} sx={{ mr: 1 }}>
            Close
          </Button>
          <Button variant="contained" onClick={handlePrint}>
            Print
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentPage;
