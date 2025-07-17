import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  useMediaQuery,
  FormControl,
  TextField,
  Tooltip,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  InputLabel
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveIcon from '@mui/icons-material/Save';
import { IconEye } from '@tabler/icons-react';
import ErrorIcon from '@mui/icons-material/Error';
import UnauthorizedHandler from './UnauthorizedHandler';

const InfoCard = ({ title, children }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)} sx={{ mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {children}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

const InfoItem = ({ label, value, field, isEditing, onChange, type = 'text' }) => (
  <Grid item xs={12} sm={6} md={4}>
    <FormControl fullWidth>
      <TextField
        type={type}
        label={label}
        value={value || ''}
        variant="outlined"
        size="small"
        disabled={!isEditing}
        onChange={(e) => isEditing && onChange(field, e.target.value)}
      />
    </FormControl>
  </Grid>
);

export default function SchoolDetailsDialog({ open, onClose, schoolId }) {
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const isCreationMode = !schoolId;

  useEffect(() => {
    if (open) {
      if (isCreationMode) {
        setFormData({
          school_code: '',
          school_name: '',
          academic_year: '',
          established_year: '',
          school_category: '',
          school_type: '',
          school_management: '',
          affiliation_board: '',
          school_shift: '',
          school_building_status: '',
          academic_session_start_month: '',
          location: {
            state: '',
            state_code: '',
            district: '',
            district_code: '',
            block: '',
            cluster: '',
            village_town: '',
            pin_code: '',
            geo: { latitude: '', longitude: '' },
            urban_rural: ''
          },
          headmaster: { name: '', mobile: '', email: '' },
          enrollment_summary: { total_students: '', boys: '', girls: '', cwsn: '' },
          staff_summary: {
            total_teachers: '',
            male_teachers: '',
            female_teachers: '',
            trained_teachers: '',
            non_teaching_staff: ''
          },
          infrastructure: {
            total_classrooms: '',
            rooms_condition: {
              good: '',
              require_minor_repair: '',
              require_major_repair: ''
            },
            electricity: false,
            internet: false,
            computer_lab: false,
            number_of_computers: '',
            library: { available: false, books_count: '' },
            playground: false,
            boundary_wall: '',
            ramp_available: false,
            kitchen_shed: false
          },
          toilets: {
            boys: { total: '', functional: '' },
            girls: { total: '', functional: '' },
            cwsn: { total: '', functional: '', ramp_accessible: false }
          },
          water_facility: { drinking_water_available: false, source: '' },
          mid_day_meal: { provided: false, cooked_on_premises: false, meal_days_per_week: '' },
          school_inspection: { last_inspected_on: '', inspected_by: '', remarks: '' },
          pta_meetings_last_year: '',
          classes_offered: []
        });
        setIsEditing(true);
      } else {
        const fetchSchool = async () => {
          try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/schools/${schoolId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setFormData(res.data);
            setIsEditing(false); // Always start in view mode
          } catch (err) {
            UnauthorizedHandler(err);
            console.error('Error fetching school:', err);
          }
        };
        fetchSchool();
      }
    }
  }, [open, schoolId]);

  const handleCreateSchool = async () => {
    setSaveStatus('saving');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_APP_API_URL}/schools`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('School created:', res.data);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 3000);
      onClose(); // close dialog after successful save
    } catch (err) {
      UnauthorizedHandler(err);
      console.error('Error creating school:', err);
      setSaveStatus('error');
    }
  };

  const handleSaveClick = () => {
    if (isCreationMode) {
      handleCreateSchool();
    } else {
      setIsEditing((prev) => !prev);
    }
  };

  const renderSaveStatusIcon = () => {
    if (saveStatus === 'saving') return <CircularProgress size={16} sx={{ ml: 1 }} />;
    if (saveStatus === 'saved') return <CheckCircleIcon color="success" fontSize="small" sx={{ ml: 1 }} />;
    if (saveStatus === 'error') return <ErrorIcon color="error" fontSize="small" sx={{ ml: 1 }} />;
    return null;
  };

  const handleChange = (fieldPath, value) => {
    const keys = fieldPath.split('.');
    setFormData((prev) => {
      const updated = { ...prev };
      let obj = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      if (!isCreationMode) autoSaveUpdate(updated);
      return updated;
    });
  };

  const autoSaveUpdate = async (data) => {
    setSaveStatus('saving');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${import.meta.env.VITE_APP_API_URL}/schools/${schoolId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Auto-save success:', res.data);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error('Auto-save error:', err);
      setSaveStatus('error');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={false}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          m: isMobile ? '2%' : 'auto',
          width: isMobile ? '96%' : '100%',
          height: isMobile ? '96%' : 'auto',
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" alignItems="center">
          <Typography variant="h3">{isCreationMode ? 'Add New School' : formData?.school_name || 'Loading...'}</Typography>
          {renderSaveStatusIcon()}
        </Box>
        <Tooltip title={isCreationMode ? 'Create School' : isEditing ? 'Switch to View Mode' : 'Switch to Edit Mode'}>
          <IconButton onClick={handleSaveClick} aria-label="action" size="small">
            {isCreationMode ? <SaveIcon /> : isEditing ? <IconEye /> : <EditIcon />}
          </IconButton>
        </Tooltip>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        {formData && (
          <Box>
            <InfoCard title="Basic Details">
              <InfoItem
                label="School Code"
                value={formData.school_code}
                field="school_code"
                isEditing={isEditing}
                onChange={handleChange}
              />
              <InfoItem
                label="School Name"
                value={formData.school_name}
                field="school_name"
                isEditing={isEditing}
                onChange={handleChange}
              />
              <InfoItem
                label="Academic Year"
                value={formData.academic_year}
                field="academic_year"
                isEditing={isEditing}
                onChange={handleChange}
              />
              <InfoItem
                label="Established Year"
                value={formData.established_year}
                field="established_year"
                isEditing={isEditing}
                onChange={handleChange}
              />
              <InfoItem
                label="Category"
                value={formData.school_category}
                field="school_category"
                isEditing={isEditing}
                onChange={handleChange}
              />
              <InfoItem label="Type" value={formData.school_type} field="school_type" isEditing={isEditing} onChange={handleChange} />
              <InfoItem
                label="Management"
                value={formData.school_management}
                field="school_management"
                isEditing={isEditing}
                onChange={handleChange}
              />
              <InfoItem
                label="Board"
                value={formData.affiliation_board}
                field="affiliation_board"
                isEditing={isEditing}
                onChange={handleChange}
              />
              <InfoItem label="Shift" value={formData.school_shift} field="school_shift" isEditing={isEditing} onChange={handleChange} />
              <InfoItem
                label="Building Status"
                value={formData.school_building_status}
                field="school_building_status"
                isEditing={isEditing}
                onChange={handleChange}
              />
              <InfoItem
                label="Academic Session Start"
                value={formData.academic_session_start_month}
                field="academic_session_start_month"
                isEditing={isEditing}
                onChange={handleChange}
              />
            </InfoCard>

            {formData.location && (
              <InfoCard title="Location">
                {Object.entries(formData.location).map(([key, val]) =>
                  typeof val !== 'object' ? (
                    <InfoItem
                      key={key}
                      label={key.replace(/_/g, ' ')}
                      value={val}
                      field={`location.${key}`}
                      isEditing={isEditing}
                      onChange={handleChange}
                    />
                  ) : (
                    Object.entries(val).map(([k, v]) => (
                      <InfoItem
                        key={`${key}.${k}`}
                        label={`${k}`}
                        value={v}
                        field={`location.${key}.${k}`}
                        isEditing={isEditing}
                        onChange={handleChange}
                      />
                    ))
                  )
                )}
              </InfoCard>
            )}

            {formData.headmaster && (
              <InfoCard title="Headmaster">
                <InfoItem
                  label="Name"
                  value={formData.headmaster.name}
                  field="headmaster.name"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <InfoItem
                  label="Mobile"
                  value={formData.headmaster.mobile}
                  field="headmaster.mobile"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <InfoItem
                  label="Email"
                  value={formData.headmaster.email}
                  field="headmaster.email"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
              </InfoCard>
            )}

            {formData.enrollment_summary && (
              <InfoCard title="Enrollment">
                <InfoItem
                  label="Total Students"
                  value={formData.enrollment_summary.total_students}
                  field="enrollment_summary.total_students"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <InfoItem
                  label="Boys"
                  value={formData.enrollment_summary.boys}
                  field="enrollment_summary.boys"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <InfoItem
                  label="Girls"
                  value={formData.enrollment_summary.girls}
                  field="enrollment_summary.girls"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <InfoItem
                  label="CWSN"
                  value={formData.enrollment_summary.cwsn}
                  field="enrollment_summary.cwsn"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
              </InfoCard>
            )}

            {formData.staff_summary && (
              <InfoCard title="Staff">
                <InfoItem
                  label="Total Teachers"
                  value={formData.staff_summary.total_teachers}
                  field="staff_summary.total_teachers"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <InfoItem
                  label="Male Teachers"
                  value={formData.staff_summary.male_teachers}
                  field="staff_summary.male_teachers"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <InfoItem
                  label="Female Teachers"
                  value={formData.staff_summary.female_teachers}
                  field="staff_summary.female_teachers"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <InfoItem
                  label="Trained Teachers"
                  value={formData.staff_summary.trained_teachers}
                  field="staff_summary.trained_teachers"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <InfoItem
                  label="Non-Teaching Staff"
                  value={formData.staff_summary.non_teaching_staff}
                  field="staff_summary.non_teaching_staff"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
              </InfoCard>
            )}

            {formData.infrastructure && (
              <InfoCard title="Infrastructure">
                <InfoItem
                  label="Total Classrooms"
                  value={formData.infrastructure.total_classrooms}
                  field="infrastructure.total_classrooms"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                {formData.infrastructure.rooms_condition &&
                  Object.entries(formData.infrastructure.rooms_condition).map(([key, val]) => (
                    <InfoItem
                      key={key}
                      label={`Rooms - ${key}`}
                      value={val}
                      field={`infrastructure.rooms_condition.${key}`}
                      isEditing={isEditing}
                      onChange={handleChange}
                    />
                  ))}
                <InfoItem
                  label="Electricity"
                  value={formData.infrastructure.electricity ? 'Yes' : 'No'}
                  field="infrastructure.electricity"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <InfoItem
                  label="Internet"
                  value={formData.infrastructure.internet ? 'Yes' : 'No'}
                  field="infrastructure.internet"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <InfoItem
                  label="Computer Lab"
                  value={formData.infrastructure.computer_lab ? 'Yes' : 'No'}
                  field="infrastructure.computer_lab"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <InfoItem
                  label="No. of Computers"
                  value={formData.infrastructure.number_of_computers}
                  field="infrastructure.number_of_computers"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                {formData.infrastructure.library && (
                  <>
                    <InfoItem
                      label="Library Available"
                      value={formData.infrastructure.library.available ? 'Yes' : 'No'}
                      field="infrastructure.library.available"
                      isEditing={isEditing}
                      onChange={handleChange}
                    />
                    <InfoItem
                      label="Books Count"
                      value={formData.infrastructure.library.books_count}
                      field="infrastructure.library.books_count"
                      isEditing={isEditing}
                      onChange={handleChange}
                    />
                  </>
                )}
                <InfoItem
                  label="Playground"
                  value={formData.infrastructure.playground ? 'Yes' : 'No'}
                  field="infrastructure.playground"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <InfoItem
                  label="Boundary Wall"
                  value={formData.infrastructure.boundary_wall}
                  field="infrastructure.boundary_wall"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <InfoItem
                  label="Ramp Available"
                  value={formData.infrastructure.ramp_available ? 'Yes' : 'No'}
                  field="infrastructure.ramp_available"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <InfoItem
                  label="Kitchen Shed"
                  value={formData.infrastructure.kitchen_shed ? 'Yes' : 'No'}
                  field="infrastructure.kitchen_shed"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
              </InfoCard>
            )}

            {formData.toilets && (
              <InfoCard title="Toilets">
                {['boys', 'girls', 'cwsn'].map(
                  (group) =>
                    formData.toilets[group] &&
                    Object.entries(formData.toilets[group]).map(([key, val]) => (
                      <InfoItem
                        key={`${group}.${key}`}
                        label={`${group.toUpperCase()} ${key}`}
                        value={val}
                        field={`toilets.${group}.${key}`}
                        isEditing={isEditing}
                        onChange={handleChange}
                      />
                    ))
                )}
              </InfoCard>
            )}

            {formData.water_facility && (
              <InfoCard title="Water Facility">
                <InfoItem
                  label="Drinking Water Available"
                  value={formData.water_facility.drinking_water_available ? 'Yes' : 'No'}
                  field="water_facility.drinking_water_available"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <InfoItem
                  label="Source"
                  value={formData.water_facility.source}
                  field="water_facility.source"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
              </InfoCard>
            )}

            {formData.mid_day_meal && (
              <InfoCard title="Mid Day Meal">
                <InfoItem
                  label="Provided"
                  value={formData.mid_day_meal.provided ? 'Yes' : 'No'}
                  field="mid_day_meal.provided"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <InfoItem
                  label="Cooked on Premises"
                  value={formData.mid_day_meal.cooked_on_premises ? 'Yes' : 'No'}
                  field="mid_day_meal.cooked_on_premises"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <InfoItem
                  label="Meal Days/Week"
                  value={formData.mid_day_meal.meal_days_per_week}
                  field="mid_day_meal.meal_days_per_week"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
              </InfoCard>
            )}

            {formData.school_inspection && (
              <InfoCard title="Last Inspection">
                <InfoItem
                  label="Date"
                  value={formData.school_inspection.last_inspected_on?.slice(0, 10)}
                  field="school_inspection.last_inspected_on"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <InfoItem
                  label="By"
                  value={formData.school_inspection.inspected_by}
                  field="school_inspection.inspected_by"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <InfoItem
                  label="Remarks"
                  value={formData.school_inspection.remarks}
                  field="school_inspection.remarks"
                  isEditing={isEditing}
                  onChange={handleChange}
                />
              </InfoCard>
            )}

            <InfoCard title="Miscellaneous">
              <InfoItem
                label="PTA Meetings Last Year"
                value={formData.pta_meetings_last_year}
                field="pta_meetings_last_year"
                isEditing={isEditing}
                onChange={handleChange}
              />
              <InfoItem
                label="Classes Offered"
                value={Array.isArray(formData.classes_offered) ? formData.classes_offered.join(', ') : ''}
                field="classes_offered"
                isEditing={isEditing}
                onChange={handleChange}
              />
            </InfoCard>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
