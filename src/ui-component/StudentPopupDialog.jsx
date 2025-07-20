import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  Typography,
  Box,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { ClassSelectDropdown } from './ClassSelectDropdown';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import { IconEye } from '@tabler/icons-react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';
import { useMediaQuery, useTheme } from '@mui/material';
import { SchoolSelectDropdown } from './schoolDropdowns';
import UnauthorizedHandler from './UnauthorizedHandler';

export default function StudentPopupDialog({ open, onClose, studentId }) {
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));
  const [classOptions, setClassOptions] = useState([]);

  const role = localStorage.getItem('role');
  const id = localStorage.getItem('id');
  const isCreationMode = !studentId;

  useEffect(() => {
    if (open) {
      if (isCreationMode) {
        const empty = {
          school_code: '',
          studentId: '',
          name: '',
          gender: '',
          dob: '',
          class: '',
          section: '',
          admissionDate: '',
          category: '',
          religion: '',
          motherTongue: '',
          aadhar: '',
          fatherName: '',
          motherName: '',
          address: {
            line1: '',
            line2: '',
            city: '',
            district: '',
            state: '',
            pincode: ''
          },
          contact: {
            phone: '',
            email: ''
          },
          cwsn: false,
          password: ''
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
              // Fetch class options for the school
              return axios.get(`${import.meta.env.VITE_APP_API_URL}/schools/${res.data.school_code}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
            })
            .then((res) => {
              setClassOptions(res.data.classes_offered || []);
            })
            .catch((err) => console.error('Error initializing school and classes:', err));
        } else {
          setFormData(empty);
          setClassOptions([]);
        }

        setIsEditing(true);
      } else {
        fetchStudent();
      }
    } else {
      setFormData(null);
    }
  }, [open]);

  useEffect(() => {
    if (isCreationMode && role === 'Admin' && formData?.school_code) {
      const token = localStorage.getItem('token');
      axios
        .get(`${import.meta.env.VITE_APP_API_URL}/schools/${formData.school_code}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          setClassOptions(res.data.classes_offered || []);
        })
        .catch((err) => console.error('Failed to fetch class options:', err));
    }
  }, [formData?.school_code]);

  const fetchStudent = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = res.data;
      setClassOptions(data?.school?.classes_offered);
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

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [parent]: { ...prev[parent], [field]: value }
      };
      if (!isCreationMode) autoSave(updated);
      return updated;
    });
  };

  const autoSave = async (data) => {
    setSaveStatus('saving');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_APP_API_URL}/students/${studentId}`, data, {
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
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/students`, formData, {
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
          <Typography variant="h4">{isCreationMode ? 'Add Student' : formData?.name || 'Loading...'}</Typography>
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
                label="Student ID"
                value={formData.studentId}
                onChange={(e) => handleChange('studentId', e.target.value)}
                fullWidth
                size="small"
                disabled={!isEditing || (!isCreationMode && role === 'School')}
              />
            </Grid>

            {[
              'name',
              'gender',
              'dob',
              'class',
              'section',
              'admissionDate',
              'category',
              'religion',
              'motherTongue',
              'aadhar',
              'fatherName',
              'motherName'
            ].map((field) => (
              <Grid item xs={12} sm={6} key={field}>
                {field === 'class' ? (
                  <ClassSelectDropdown
                    value={formData.class}
                    onChange={(value) => handleChange('class', value)}
                    options={classOptions}
                    editable={isEditing}
                  />
                ) : (
                  <TextField
                    label={field.replace(/([A-Z])/g, ' $1')}
                    value={formData[field] || ''}
                    onChange={(e) => handleChange(field, e.target.value)}
                    fullWidth
                    size="small"
                    disabled={!isEditing}
                  />
                )}
              </Grid>
            ))}

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox checked={formData.cwsn} onChange={(e) => handleChange('cwsn', e.target.checked)} disabled={!isEditing} />
                }
                label="CWSN"
              />
            </Grid>

            {isCreationMode && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Password"
                  value={formData.password || ''}
                  onChange={(e) => handleChange('password', e.target.value)}
                  fullWidth
                  size="small"
                  disabled={!isEditing}
                />
              </Grid>
            )}

            {['line1', 'line2', 'city', 'district', 'state', 'pincode'].map((field) => (
              <Grid item xs={12} sm={6} key={`address.${field}`}>
                <TextField
                  label={`Address ${field}`}
                  value={formData.address?.[field] || ''}
                  onChange={(e) => handleNestedChange('address', field, e.target.value)}
                  fullWidth
                  size="small"
                  disabled={!isEditing}
                />
              </Grid>
            ))}

            {['phone', 'email'].map((field) => (
              <Grid item xs={12} sm={6} key={`contact.${field}`}>
                <TextField
                  label={`Contact ${field}`}
                  value={formData.contact?.[field] || ''}
                  onChange={(e) => handleNestedChange('contact', field, e.target.value)}
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
