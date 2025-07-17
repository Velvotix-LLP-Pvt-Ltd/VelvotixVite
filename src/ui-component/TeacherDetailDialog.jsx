import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  TextField,
  Grid,
  MenuItem
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { IconEye } from '@tabler/icons-react';
import axios from 'axios';
import { SchoolSelectDropdown } from './schoolDropdowns';
import UnauthorizedHandler from './UnauthorizedHandler';

const InfoItem = ({ label, value, field, isEditing, onChange, type = 'text', disabled = false }) => (
  <Grid item xs={12} sm={6}>
    <TextField
      label={label}
      value={value || ''}
      onChange={(e) => isEditing && !disabled && onChange(field, e.target.value)}
      fullWidth
      size="small"
      variant="outlined"
      disabled={disabled || !isEditing}
      type={type}
    />
  </Grid>
);

export default function TeacherDetailsDialog({ open, onClose, teacherId, schoolViewOnly = false }) {
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [schoolsList, setSchoolsList] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const role = localStorage.getItem('role');
  const localSchoolId = localStorage.getItem('id');
  const isCreationMode = !teacherId;

  useEffect(() => {
    if (open) {
      if (isCreationMode) {
        const initialForm = {
          school_code: '',
          teacherId: '',
          name: '',
          dob: '',
          gender: '',
          designation: '',
          qualification: '',
          doj: '',
          phone: '',
          trained: false,
          password: ''
        };

        if (role === 'School' && localSchoolId) {
          axios
            .get(`${import.meta.env.VITE_APP_API_URL}/schools/${localSchoolId}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            .then((res) => {
              setFormData({ ...initialForm, school_code: res.data.school_code });
            })
            .catch((err) => {
              UnauthorizedHandler(err);
              console.error('Error fetching school:', err);
              setFormData(initialForm); // fallback
            });
        } else {
          // Admin case: blank form + fetch schools
          setFormData(initialForm);
          fetchSchoolsList();
        }

        setIsEditing(true);
      } else {
        fetchTeacher();
      }
    } else {
      setFormData(null); // reset on dialog close
    }
  }, [open, teacherId]);

  const fetchTeacher = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/teachers/${teacherId}`, {
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
      console.error('Fetch teacher error:', err);
    }
  };

  const fetchSchoolsList = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/schools`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchoolsList(res.data);
    } catch (err) {
      UnauthorizedHandler(err);
      console.error('Error fetching schools list:', err);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (!isCreationMode) autoSaveUpdate(updated);
      return updated;
    });
  };

  const autoSaveUpdate = async (data) => {
    setSaveStatus('saving');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_APP_API_URL}/teachers/${teacherId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      UnauthorizedHandler(err);
      console.error('Auto-save error:', err);
      setSaveStatus('error');
    }
  };

  const handleCreate = async () => {
    setSaveStatus('saving');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/teachers`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 3000);
      onClose();
    } catch (err) {
      UnauthorizedHandler(err);
      console.error('Create error:', err);
      setSaveStatus('error');
    }
  };

  const renderSaveStatusIcon = () => {
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
      maxWidth="sm"
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
          <Typography variant="h4">{isCreationMode ? 'Add Teacher' : formData?.name || 'Loading...'}</Typography>
          {renderSaveStatusIcon()}
        </Box>
        {!schoolViewOnly && (
          <Tooltip title={isCreationMode ? 'Create' : isEditing ? 'Switch to View Mode' : 'Switch to Edit Mode'}>
            <IconButton onClick={handleSaveClick}>{isCreationMode ? <SaveIcon /> : isEditing ? <IconEye /> : <EditIcon />}</IconButton>
          </Tooltip>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {formData && (
          <Grid container spacing={2}>
            {role === 'Admin' && isCreationMode ? (
              <Grid item xs={12} sm={6} md={4}>
                <SchoolSelectDropdown
                  schoolsList={schoolsList}
                  value={formData.school_code}
                  onChange={(val) => handleChange('school_code', val)}
                />
              </Grid>
            ) : (
              <InfoItem
                label="School Code"
                value={formData.school_code}
                field="school_code"
                isEditing={false}
                onChange={handleChange}
                disabled
              />
            )}

            <InfoItem
              label="Teacher ID"
              value={formData.teacherId}
              field="teacherId"
              isEditing={isCreationMode || isEditing}
              onChange={handleChange}
            />

            <InfoItem label="Name" value={formData.name} field="name" isEditing={isEditing} onChange={handleChange} />
            <InfoItem
              label="Date of Birth"
              value={formData.dob?.slice(0, 10)}
              field="dob"
              isEditing={isEditing}
              onChange={handleChange}
              type="date"
            />
            <InfoItem label="Gender" value={formData.gender} field="gender" isEditing={isEditing} onChange={handleChange} />
            <InfoItem label="Designation" value={formData.designation} field="designation" isEditing={isEditing} onChange={handleChange} />
            <InfoItem
              label="Qualification"
              value={formData.qualification}
              field="qualification"
              isEditing={isEditing}
              onChange={handleChange}
            />
            <InfoItem
              label="Date of Joining"
              value={formData.doj?.slice(0, 10)}
              field="doj"
              isEditing={isEditing}
              onChange={handleChange}
              type="date"
            />
            <InfoItem
              label="Phone"
              value={formData.phone ? `${formData.phone}` : ''}
              field="phone"
              isEditing={isEditing}
              onChange={handleChange}
            />
            <InfoItem
              label="Trained"
              value={formData.trained ? 'Yes' : 'No'}
              field="trained"
              isEditing={isEditing}
              onChange={(f, val) => handleChange(f, val === 'Yes')}
            />
            {isCreationMode && (
              <InfoItem label="Password" value={formData.password} field="password" isEditing={true} onChange={handleChange} />
            )}
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );
}
