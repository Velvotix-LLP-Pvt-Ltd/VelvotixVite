import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Button, useMediaQuery, IconButton, Tooltip, Card, CardContent, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from 'axios';
import toast from 'react-hot-toast';
import UnauthorizedHandler from './UnauthorizedHandler';
import { SchoolSelectDropdown } from './schoolDropdowns';
import { ClassSelectDropdown } from './ClassSelectDropdown';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const AttendancePage = () => {
  const [selectedSchool, setSelectedSchool] = useState('');
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('id');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const fetchSchoolAndClass = async () => {
    let url = '';
    if (role === 'School') url = `/schools/${userId}`;
    else if (role === 'Teacher') url = `/teachers/${userId}`;
    else if (role === 'Student') url = `/students/${userId}`;
    else return;

    try {
      const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}${url}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const schoolCode = role === 'School' ? res.data.school_code : res.data.school.school_code;
      setSelectedSchool(schoolCode);
    } catch (err) {
      toast.error('Failed to fetch school/class info.');
    }
  };

  useEffect(() => {
    if (role !== 'Admin') {
      fetchSchoolAndClass();
    } else {
      axios
        .get(`${import.meta.env.VITE_APP_API_URL}/schools`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          const schoolOpts = res.data.map((s) => ({
            label: s.school_code,
            value: s._id
          }));
          setSchoolOptions(schoolOpts);
        })
        .catch(() => toast.error('Failed to fetch schools.'));
    }
  }, []);

  useEffect(() => {
    setSelectedClass('');
    setAttendanceData([]);

    if (selectedSchool) {
      axios
        .get(`${import.meta.env.VITE_APP_API_URL}/schools/${selectedSchool}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => setClassOptions(res.data.classes_offered || []))
        .catch(() => toast.error('Failed to fetch classes.'));
    }
  }, [selectedSchool]);

  useEffect(() => {
    if (selectedSchool && selectedClass) {
      axios
        .get(`${import.meta.env.VITE_APP_API_URL}/students?school_code=${selectedSchool}&class=${selectedClass}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          const students = res.data.map((s) => ({
            name: s.name,
            school: s.school._id,
            code: s.studentId,
            studentId: s._id,
            status: 'Absent',
            remarks: ''
          }));
          setAttendanceData(students);
        })
        .catch((err) => UnauthorizedHandler(err));
    }
  }, [selectedClass]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceData((prev) => prev.map((item) => (item.studentId === studentId ? { ...item, status } : item)));
  };

  const markAll = (status) => {
    setAttendanceData((prev) => prev.map((s) => ({ ...s, status })));
  };

  const handleSubmit = async () => {
    try {
      const payload = attendanceData.map((entry) => ({
        schoolId: entry.school,
        studentId: entry.studentId,
        date: selectedDate.format('YYYY-MM-DD'),
        status: entry.status,
        remarks: entry.remarks
      }));

      await axios.post(`${import.meta.env.VITE_APP_API_URL}/attendance`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Attendance submitted successfully');
      setSelectedClass('');
      setAttendanceData([]);
    } catch (err) {
      UnauthorizedHandler(err, navigate);
    }
  };

  const isDateDisabled = (date) => {
    const today = dayjs();
    const yesterday = today.subtract(1, 'day');
    return !date.isSame(today, 'day') && !date.isSame(yesterday, 'day');
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 4 }}>
      <Paper sx={{ p: 2, mb: 3 }} elevation={0}>
        <Grid container spacing={2}>
          {role === 'Admin' && (
            <Grid item xs={12} sm={6} md={4}>
              <SchoolSelectDropdown value={selectedSchool} onChange={setSelectedSchool} options={schoolOptions} />
            </Grid>
          )}

          <Grid item xs={12} sm={6} md={4}>
            <ClassSelectDropdown value={selectedClass} onChange={setSelectedClass} options={classOptions} />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Select Date"
                value={selectedDate}
                shouldDisableDate={isDateDisabled}
                onChange={(date) => setSelectedDate(date)}
                format="YYYY-MM-DD"
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </Paper>

      {attendanceData.length > 0 && (
        <>
          <Grid container justifyContent="space-between" sx={{ mb: 2 }}>
            <Button onClick={() => markAll('Present')} variant="outlined" color="success">
              Mark All Present
            </Button>
            <Button onClick={() => markAll('Absent')} variant="outlined" color="error">
              Mark All Absent
            </Button>
          </Grid>

          <Grid container spacing={2}>
            {attendanceData.map((entry) => (
              <Grid item xs={12} sm={6} md={4} key={entry.studentId}>
                <Card
                  sx={{
                    backgroundColor: selectedDate.isBefore(dayjs(), 'day') ? '#fff4f4' : '#ffff',
                    borderLeft: `6px solid ${entry.status === 'Present' ? '#2e7d32' : '#d32f2f'}`
                  }}
                  elevation={2}
                >
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {entry.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      ID: {entry.code}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="body2" fontWeight={500}>
                        Status:
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Tooltip title="Mark Present">
                          <IconButton
                            onClick={() => handleStatusChange(entry.studentId, 'Present')}
                            color={entry.status === 'Present' ? 'success' : 'default'}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Mark Absent">
                          <IconButton
                            onClick={() => handleStatusChange(entry.studentId, 'Absent')}
                            color={entry.status === 'Absent' ? 'error' : 'default'}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box mt={4} textAlign="right">
            <Button variant="contained" color="primary" onClick={handleSubmit} size="large" sx={{ px: 4 }}>
              Submit Attendance
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default AttendancePage;
