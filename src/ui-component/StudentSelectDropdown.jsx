import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField, Box } from '@mui/material';
import axios from 'axios';
import UnauthorizedHandler from './UnauthorizedHandler';

export function StudentSelectDropdown({ schoolCode, value, onChange, className }) {
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/students`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const filtered = res.data?.filter(
          (student) => student.school?.school_code === schoolCode && (!className || student.class === className)
        );

        setOptions(filtered || []);
      } catch (err) {
        UnauthorizedHandler(err);
        console.error('Failed to fetch students:', err);
      }
    };

    if (schoolCode) fetchStudents();
    else setOptions([]);
  }, [schoolCode, className]);

  const selectedStudent = options.find((s) => s.studentId === value);

  return (
    <Box sx={{ minWidth: 250 }}>
      <Autocomplete
        options={options}
        getOptionLabel={(option) => (typeof option === 'string' ? option : option.studentId)}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            {option.studentId} - {option.name}
          </Box>
        )}
        filterOptions={(options, { inputValue }) =>
          options.filter(
            (option) =>
              option.studentId?.toLowerCase().includes(inputValue.toLowerCase()) ||
              option.name?.toLowerCase().includes(inputValue.toLowerCase())
          )
        }
        renderInput={(params) => <TextField {...params} label="Student ID" size="small" fullWidth />}
        value={selectedStudent || null}
        onChange={(e, newValue) => onChange(newValue?.studentId || '')}
        inputValue={inputValue}
        onInputChange={(e, newInput) => setInputValue(newInput)}
        isOptionEqualToValue={(option, val) => option.studentId === val.studentId}
      />
    </Box>
  );
}
