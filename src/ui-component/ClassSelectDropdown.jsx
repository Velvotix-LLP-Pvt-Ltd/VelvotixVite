import React, { useState } from 'react';
import { Autocomplete, TextField, Box } from '@mui/material';

export function ClassSelectDropdown({ value, onChange, options = [], editable = true }) {
  const [inputValue, setInputValue] = useState('');

  return (
    <Box sx={{ minWidth: 250 }}>
      <Autocomplete
        options={options}
        getOptionLabel={(option) => option}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Class"
            size="small"
            fullWidth
            InputProps={{
              ...params.InputProps,
              readOnly: !editable
            }}
          />
        )}
        value={value || null}
        onChange={(e, newValue) => editable && onChange(newValue || '')}
        inputValue={inputValue}
        onInputChange={(e, newInput) => setInputValue(newInput)}
        isOptionEqualToValue={(option, val) => option === val}
        disableClearable
        disabled={!editable}
      />
    </Box>
  );
}
