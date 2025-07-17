import React, { useState } from 'react';
import { Autocomplete, TextField, Box } from '@mui/material';

export function ClassSelectDropdown({ value, onChange, options = [] }) {
  const [inputValue, setInputValue] = useState('');

  return (
    <Box sx={{ minWidth: 250 }}>
      <Autocomplete
        options={options}
        getOptionLabel={(option) => option}
        renderInput={(params) => <TextField {...params} label="Class" size="small" fullWidth />}
        value={value || null}
        onChange={(e, newValue) => onChange(newValue || '')}
        inputValue={inputValue}
        onInputChange={(e, newInput) => setInputValue(newInput)}
        isOptionEqualToValue={(option, val) => option === val}
      />
    </Box>
  );
}
