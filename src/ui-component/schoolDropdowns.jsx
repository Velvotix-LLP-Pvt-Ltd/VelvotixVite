import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField, Box } from '@mui/material';
import axios from 'axios';
import UnauthorizedHandler from './UnauthorizedHandler';

export function SchoolSelectDropdown({ value, onChange }) {
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/schools`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOptions(res.data || []);
      } catch (err) {
        UnauthorizedHandler(err);
        console.error('Failed to fetch schools:', err);
      }
    };

    fetchSchools();
  }, []);

  const selectedSchool = options.find((s) => s.school_code === value);

  return (
    <Box sx={{ minWidth: 250 }}>
      <Autocomplete
        options={options}
        getOptionLabel={(option) => (typeof option === 'string' ? option : option.school_code)}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            {option.school_code} - {option.school_name}
          </Box>
        )}
        filterOptions={(options, { inputValue }) =>
          options.filter(
            (option) =>
              option.school_code?.toLowerCase().includes(inputValue.toLowerCase()) ||
              option.school_name?.toLowerCase().includes(inputValue.toLowerCase())
          )
        }
        renderInput={(params) => <TextField {...params} label="School Code" size="small" fullWidth />}
        value={selectedSchool || null}
        onChange={(e, newValue) => onChange(newValue?.school_code || '')}
        inputValue={inputValue}
        onInputChange={(e, newInput) => setInputValue(newInput)}
        isOptionEqualToValue={(option, val) => option.school_code === val.school_code}
      />
    </Box>
  );
}
