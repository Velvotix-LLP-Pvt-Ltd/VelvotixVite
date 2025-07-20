import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  MenuItem,
  Button,
  InputLabel,
  FormControl,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  Card
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { SchoolSelectDropdown } from './schoolDropdowns';
import { StudentSelectDropdown } from './StudentSelectDropdown';
import { ClassSelectDropdown } from './ClassSelectDropdown';
import UnauthorizedHandler from './UnauthorizedHandler';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function PaymentPage() {
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [classOptions, setClassOptions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [mode, setMode] = useState('Cash');
  const [remarks, setRemarks] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('id');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!selectedSchool) return;
    axios
      .get(`${import.meta.env.VITE_APP_API_URL}/schools/${selectedSchool}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => setClassOptions(res.data.classes_offered || []))
      .catch((err) => console.error('Failed to fetch class options:', err));
  }, [selectedSchool]);

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
        console.error(`Failed to fetch school code for ${role}:`, err);
      }
    };

    fetchSchoolCode();
  }, [role, userId, token]);

  const handleSubmit = async () => {
    if (!selectedStudent || !amountPaid || !mode) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/students/${selectedStudent}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudentInfo(res.data);
      setConfirmOpen(true);
    } catch (err) {
      UnauthorizedHandler(err);
      toast.error('Failed to fetch student details');
    }
  };

  const handleConfirmSubmit = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/fee/pay`,
        {
          studentId: selectedStudent,
          amountPaid: parseFloat(amountPaid),
          mode,
          remarks
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Payment recorded successfully!');
      setAmountPaid('');
      setRemarks('');
      setSelectedStudent('');
      setSelectedClass('');
    } catch (err) {
      UnauthorizedHandler(err);
      toast.error('Payment failed');
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box p={isMobile ? 2 : 3}>
        <Paper elevation={0} sx={{ padding: isMobile ? 1 : 4, borderRadius: 3 }}>
          <Grid container spacing={2}>
            {role === 'Admin' && (
              <Grid item xs={12} md={6}>
                <SchoolSelectDropdown value={selectedSchool} onChange={setSelectedSchool} required />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <ClassSelectDropdown
                value={selectedClass}
                onChange={(cls) => {
                  setSelectedClass(cls);
                  setSelectedStudent('');
                }}
                options={classOptions}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <StudentSelectDropdown
                schoolCode={selectedSchool}
                className={selectedClass}
                value={selectedStudent}
                onChange={setSelectedStudent}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField label="Amount Paid" type="number" fullWidth value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Mode</InputLabel>
                <Select value={mode} label="Mode" onChange={(e) => setMode(e.target.value)}>
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="UPI">UPI</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField label="Remarks" fullWidth value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </Grid>

            <Grid item xs={12}>
              <Button variant="contained" color="primary" fullWidth onClick={handleSubmit} size={isMobile ? 'medium' : 'large'}>
                Submit Payment
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Confirmation Dialog */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>Confirm Payment</DialogTitle>

          <DialogContent dividers>
            {studentInfo ? (
              <Card variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Student Name
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {studentInfo.name}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Father's Name
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {studentInfo.fatherName}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Class
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {studentInfo.class}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Mode
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {mode}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Amount
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      ₹{amountPaid}
                    </Typography>
                  </Grid>

                  {remarks && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Remarks
                      </Typography>
                      <Typography variant="body1">{remarks}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Card>
            ) : (
              <Typography>Loading student details...</Typography>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => {
                setConfirmOpen(false);
                setAmountPaid('');
                setRemarks('');
                setSelectedStudent('');
                setSelectedClass('');
              }}
              color="error"
              variant="outlined"
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmSubmit} variant="contained" color="primary">
              Confirm & Submit
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </motion.div>
  );
}
