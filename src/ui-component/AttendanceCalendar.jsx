import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Divider, ToggleButtonGroup, ToggleButton, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight, CalendarMonth } from '@mui/icons-material';
import dayjs from 'dayjs';
import axios from 'axios';
import { SchoolSelectDropdown } from './schoolDropdowns';
import { StudentSelectDropdown } from './StudentSelectDropdown';
import { ClassSelectDropdown } from './ClassSelectDropdown';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import UnauthorizedHandler from './UnauthorizedHandler';

const weeklyOffDays = [0]; // Sunday
const holidays = ['2025-07-15', '2025-07-20'];

export default function AttendanceCalendar() {
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [classOptions, setClassOptions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [viewMode, setViewMode] = useState('monthly');
  const [currentDate, setCurrentDate] = useState(dayjs());

  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('id');
  const token = localStorage.getItem('token');

  useEffect(() => {
    setSelectedStudent('');
    setSelectedClass('');
    if (selectedSchool) {
      axios
        .get(`${import.meta.env.VITE_APP_API_URL}/schools/${selectedSchool}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          setClassOptions(res.data.classes_offered || []);
        })
        .catch((err) => console.error('Failed to fetch class options:', err));
    }
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

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedSchool || !selectedStudent) return;

      try {
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/attendance/all`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            school_code: selectedSchool,
            student_code: selectedStudent
          }
        });
        setAttendanceData(res.data || []);
      } catch (err) {
        UnauthorizedHandler(err);
        console.error('Failed to fetch attendance:', err);
      }
    };

    fetchAttendance();
  }, [selectedSchool, selectedStudent]);

  const getDateRange = () => {
    const start = viewMode === 'weekly' ? currentDate.startOf('week') : currentDate.startOf('month');
    const end = viewMode === 'weekly' ? currentDate.endOf('week') : currentDate.endOf('month');
    return { start, end };
  };

  const { start, end } = getDateRange();

  const dateList = [];
  let day = start;
  while (day.isBefore(end) || day.isSame(end)) {
    dateList.push(day);
    day = day.add(1, 'day');
  }

  const getStatusColor = (date) => {
    const today = dayjs().startOf('day');
    const attendance = attendanceData.find((record) => dayjs(record.date).isSame(date, 'day'));
    if (attendance) {
      if (attendance.status === 'Present') return 'green';
      if (attendance.status === 'Absent') return 'red';
      if (attendance.status === 'Leave') return 'darkblue';
    }
    if (holidays.includes(date.format('YYYY-MM-DD'))) return 'orange';
    if (weeklyOffDays.includes(date.day())) return 'purple';
    if (date.isBefore(today)) return 'red';
    return '#eee';
  };

  const getStatusColorBack = (date) => {
    const today = dayjs().startOf('day');
    const formattedDate = date.format('YYYY-MM-DD');
    const attendance = attendanceData.find((rec) => dayjs(rec.date).isSame(date, 'day'));

    if (attendance?.status === 'Present') return '#eafbea';
    if (attendance?.status === 'Absent') return '#ffeaea';
    if (attendance?.status === 'Leave') return '#f1f4fe';

    if (holidays.includes(formattedDate)) return '#fff9e6';
    if (weeklyOffDays.includes(date.day())) return '#f9f0ff';

    return date.isBefore(today) ? '#fff1f1' : '#fafafa';
  };

  const handleNavigate = (direction) => {
    setCurrentDate((prev) =>
      direction === 'prev'
        ? viewMode === 'weekly'
          ? prev.subtract(1, 'week')
          : prev.subtract(1, 'month')
        : viewMode === 'weekly'
          ? prev.add(1, 'week')
          : prev.add(1, 'month')
    );
  };

  const renderDateHeader = () => {
    return viewMode === 'weekly' ? `${start.format('MMM DD')} – ${end.format('MMM DD, YYYY')}` : currentDate.format('MMMM YYYY');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box p={2}>
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
        </Grid>

        <Divider sx={{ my: 3 }} />

        {selectedSchool && selectedStudent && (
          <>
            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'center' }}
              gap={2}
              mb={2}
            >
              <Box display="flex" flexWrap="wrap" alignItems="center" gap={1}>
                <IconButton onClick={() => handleNavigate('prev')}>
                  <ChevronLeft />
                </IconButton>
                <Typography variant="h6" sx={{ minWidth: 120 }}>
                  {renderDateHeader()}
                </Typography>
                <IconButton onClick={() => handleNavigate('next')}>
                  <ChevronRight />
                </IconButton>

                {viewMode === 'monthly' && (
                  <DatePicker
                    views={['year', 'month']}
                    openTo="month"
                    value={currentDate}
                    onChange={(newValue) => newValue && setCurrentDate(newValue)}
                    slots={{ openPickerIcon: CalendarMonth }}
                    slotProps={{
                      textField: {
                        variant: 'outlined',
                        size: 'small',
                        fullWidth: true,
                        sx: {
                          minWidth: { xs: '100%', sm: 160 },
                          maxWidth: { xs: '100%', sm: 'auto' }
                        }
                      }
                    }}
                  />
                )}
              </Box>

              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newView) => newView && setViewMode(newView)}
                size="small"
                sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}
              >
                <ToggleButton value="weekly">Weekly</ToggleButton>
                <ToggleButton value="monthly">Monthly</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box display="flex" flexDirection="column" gap={2}>
              {dateList.map((date, idx) => {
                const record = attendanceData.find((r) => dayjs(r.date).isSame(date, 'day'));
                const statusColor = getStatusColor(date);
                const statusBack = getStatusColorBack(date);
                return (
                  <Paper
                    key={idx}
                    sx={{
                      p: 2,
                      mb: 1,
                      backgroundColor: statusBack,
                      borderLeft: `7px solid ${statusColor}`,
                      width: '100%'
                    }}
                  >
                    <Grid container spacing={2} rowSpacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography>
                          <strong>Date:</strong> {date.format('YYYY-MM-DD')}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography>
                          <strong>Status:</strong>{' '}
                          {record?.status || (statusColor === 'orange' ? 'Holiday' : statusColor === 'purple' ? 'Weekly Off' : '—')}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography>
                          <strong>Remarks:</strong> {record?.remarks || '—'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography>
                          <strong>Recorded By:</strong> {record?.recordedByModel || '—'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                );
              })}
            </Box>
          </>
        )}
      </Box>
    </LocalizationProvider>
  );
}
