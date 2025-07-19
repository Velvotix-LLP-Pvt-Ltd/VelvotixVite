import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Grid, TextField, IconButton, Tooltip, CircularProgress, Typography, Box } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import { IconEye } from '@tabler/icons-react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';
import { useMediaQuery, useTheme } from '@mui/material';
import { SchoolSelectDropdown } from './schoolDropdowns';
import UnauthorizedHandler from './UnauthorizedHandler';

export default function FeeStructurePopupDialog({ open, onClose, feeStructureId }) {
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));
  console.log(JSON.stringify(feeStructureId));
  const role = localStorage.getItem('role');
  const id = localStorage.getItem('id');
  const isCreationMode = !feeStructureId;

  useEffect(() => {
    if (open) {
      if (isCreationMode) {
        const empty = {
          school_code: '',
          class: '',
          academicYear: '',
          monthlyFee: '',
          feeBreakup: {
            tuition: '',
            admission: '',
            exam: '',
            transport: '',
            other: ''
          }
        };
        if (role === 'School') {
          const token = localStorage.getItem('token');
          axios
            .get(`${import.meta.env.VITE_APP_API_URL}/schools/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            .then((res) => {
              empty.school_code = res.data.school_code;
              setFormData(empty);
            });
        } else {
          setFormData(empty);
        }
        setIsEditing(true);
      } else {
        fetchFeeStructure();
      }
    } else {
      setFormData(null);
    }
  }, [open]);

  const fetchFeeStructure = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/fee/fee-structure/${feeStructureId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;
      const flat = {
        ...data,
        school_code: data.school?.school_code || ''
      };
      setFormData(flat);
      setIsEditing(false);
    } catch (err) {
      UnauthorizedHandler(err);
      console.error('Fetch error:', err);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (!isCreationMode) autoSave(updated);
      return updated;
    });
  };

  const handleFeeBreakupChange = (field, value) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        feeBreakup: {
          ...prev.feeBreakup,
          [field]: value
        }
      };
      if (!isCreationMode) autoSave(updated);
      return updated;
    });
  };

  const autoSave = async (data) => {
    setSaveStatus('saving');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_APP_API_URL}/fee/fee-structure/${feeStructureId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) {
      setSaveStatus('error');
    }
  };

  const handleCreate = async () => {
    setSaveStatus('saving');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/fee/fee-structure`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSaveStatus('saved');
      onClose();
    } catch (err) {
      console.error('Create error:', err);
      setSaveStatus('error');
    }
  };

  const renderStatusIcon = () => {
    if (saveStatus === 'saving') return <CircularProgress size={16} sx={{ ml: 1 }} />;
    if (saveStatus === 'saved') return <CheckCircleIcon color="success" fontSize="small" sx={{ ml: 1 }} />;
    if (saveStatus === 'error') return <ErrorIcon color="error" fontSize="small" sx={{ ml: 1 }} />;
    return null;
  };

  const handleSaveClick = () => {
    if (isCreationMode) {
      handleCreate();
    } else {
      setIsEditing((prev) => !prev);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          m: isMobile ? '2%' : 'auto',
          width: isMobile ? '96%' : '100%',
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" alignItems="center">
          <Typography variant="h4">{isCreationMode ? 'Add Fee Structure' : `Class ${formData?.class || ''}`}</Typography>
          {renderStatusIcon()}
        </Box>
        <Tooltip title={isCreationMode ? 'Create' : isEditing ? 'Switch to View' : 'Switch to Edit'}>
          <IconButton onClick={handleSaveClick}>{isCreationMode ? <SaveIcon /> : isEditing ? <IconEye /> : <EditIcon />}</IconButton>
        </Tooltip>
      </DialogTitle>

      <DialogContent dividers>
        {formData && (
          <Grid container spacing={2}>
            {role === 'Admin' && isCreationMode ? (
              <Grid item xs={12} sm={6}>
                <SchoolSelectDropdown
                  label="School Code"
                  value={formData.school_code}
                  onChange={(value) => handleChange('school_code', value)}
                  disabled={!isEditing}
                />
              </Grid>
            ) : (
              <Grid item xs={12} sm={6}>
                <TextField label="School Code" value={formData.school_code || ''} fullWidth size="small" disabled />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                label="Class"
                value={formData.class || ''}
                onChange={(e) => handleChange('class', e.target.value)}
                fullWidth
                size="small"
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Academic Year"
                value={formData.academicYear || ''}
                onChange={(e) => handleChange('academicYear', e.target.value)}
                fullWidth
                size="small"
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Monthly Fee"
                type="number"
                value={formData.monthlyFee || ''}
                onChange={(e) => handleChange('monthlyFee', e.target.value)}
                fullWidth
                size="small"
                disabled={!isEditing}
              />
            </Grid>

            {['tuition', 'admission', 'exam', 'transport', 'other'].map((feeKey) => (
              <Grid item xs={12} sm={6} key={feeKey}>
                <TextField
                  label={`${feeKey.charAt(0).toUpperCase() + feeKey.slice(1)} Fee`}
                  type="number"
                  value={formData.feeBreakup?.[feeKey] || ''}
                  onChange={(e) => handleFeeBreakupChange(feeKey, e.target.value)}
                  fullWidth
                  size="small"
                  disabled={!isEditing}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );
}
