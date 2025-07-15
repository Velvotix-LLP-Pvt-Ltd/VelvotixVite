import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField, Box } from '@mui/material';
import axios from 'axios';

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
        console.error('Failed to fetch schools:', err);
      }
    };

    fetchSchools();
  }, []);

  return (
    <Box sx={{ minWidth: 250 }}>
      <Autocomplete
        options={options}
        getOptionLabel={(option) => `${option.school_code} - ${option.school_name}`}
        renderInput={(params) => <TextField {...params} label="School Code" size="small" fullWidth />}
        value={options.find((s) => s.school_code === value) || null}
        onChange={(e, newValue) => onChange(newValue?.school_code || '')}
        inputValue={inputValue}
        onInputChange={(e, newInput) => setInputValue(newInput)}
        isOptionEqualToValue={(option, val) => option.school_code === val.school_code}
      />
    </Box>
  );
}
