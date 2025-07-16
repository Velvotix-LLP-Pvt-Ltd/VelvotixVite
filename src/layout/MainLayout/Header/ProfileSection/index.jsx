import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Avatar,
  Chip,
  ClickAwayListener,
  Divider,
  Grid,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  OutlinedInput,
  Paper,
  Popper,
  Stack,
  Typography,
  Box
} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import useConfig from 'hooks/useConfig';

// assets
import User1 from 'assets/images/users/user-round.svg';
import { IconLogout, IconSearch, IconSettings, IconUser } from '@tabler/icons-react';

export default function ProfileSection() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { borderRadius } = useConfig();

  const [value, setValue] = useState('');
  const [selectedIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const anchorRef = useRef(null);

  const handleToggle = () => setOpen((prevOpen) => !prevOpen);
  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current?.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_APP_API_URL}/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.clear();
      localStorage.setItem('role', '');
      navigate('/auth/login');
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const id = localStorage.getItem('id');

      if (!token || !role || !id) return;

      let endpoint = '';
      switch (role) {
        case 'Admin':
          endpoint = `${import.meta.env.VITE_APP_API_URL}/users/${id}`;
          break;
        case 'Teacher':
          endpoint = `${import.meta.env.VITE_APP_API_URL}/teachers/${id}`;
          break;
        case 'Student':
          endpoint = `${import.meta.env.VITE_APP_API_URL}students/${id}`;
          break;
        case 'School':
          endpoint = `${import.meta.env.VITE_APP_API_URL}/schools/${id}`;
          break;
        default:
          return;
      }

      try {
        const res = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          console.error(`Failed to fetch profile for role ${role}`);
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
      }
    };

    fetchProfile();
  }, []);

  // ✨ Display logic
  const role = localStorage.getItem('role');
  const displayName = role === 'School' ? profile?.school_name || 'School' : profile?.name || 'User';

  let subtitle = '';
  if (role === 'Admin') {
    subtitle = 'Velvotix Admin';
  } else if (role === 'Teacher') {
    subtitle = profile?.teacherId || '';
  } else if (role === 'Student') {
    subtitle = profile?.studentId || '';
  } else if (role === 'School') {
    subtitle =
      profile?.school_code && profile?.academic_year ? `${profile.school_code}-${profile.academic_year}` : profile?.school_code || '';
  }

  const img = profile?.profilePic ? `${import.meta.env.VITE_BASE_URL}${profile.profilePic}` : User1;
  return (
    <>
      <Chip
        sx={{
          ml: 2,
          height: '48px',
          alignItems: 'center',
          borderRadius: '27px',
          '& .MuiChip-label': {
            lineHeight: 0
          }
        }}
        icon={
          <Avatar
            src={img}
            alt="user"
            sx={{
              ...theme.typography.mediumAvatar,
              margin: '8px 0 8px 8px !important',
              cursor: 'pointer'
            }}
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            color="inherit"
          />
        }
        label={<IconSettings stroke={1.5} size="24px" />}
        ref={anchorRef}
        onClick={handleToggle}
        color="primary"
        aria-label="user-account"
      />

      <Popper
        placement="bottom"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 14]
            }
          }
        ]}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Transitions in={open} {...TransitionProps}>
              <Paper>
                {open && (
                  <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                    <Box sx={{ p: 2, pb: 0 }}>
                      <Stack>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                          <Typography variant="h4">Welcome,</Typography>
                          <Typography component="span" variant="h4" sx={{ fontWeight: 400 }}>
                            {displayName}
                          </Typography>
                        </Stack>
                        <Typography variant="subtitle2">{subtitle}</Typography>
                      </Stack>

                      <OutlinedInput
                        sx={{ width: '100%', pr: 1, pl: 2, my: 2 }}
                        id="input-search-profile"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Search profile options"
                        startAdornment={
                          <InputAdornment position="start">
                            <IconSearch stroke={1.5} size="16px" />
                          </InputAdornment>
                        }
                      />
                      <Divider />
                    </Box>

                    <Box
                      sx={{
                        p: 2,
                        py: 0,
                        maxHeight: 'calc(100vh - 250px)',
                        overflowX: 'hidden',
                        '&::-webkit-scrollbar': { width: 5 }
                      }}
                    >
                      {/* <UpgradePlanCard /> */}

                      <List
                        component="nav"
                        sx={{
                          width: '100%',
                          maxWidth: 350,
                          minWidth: 300,
                          borderRadius: `${borderRadius}px`,
                          '& .MuiListItemButton-root': { mt: 0.5 }
                        }}
                      >
                        <ListItemButton sx={{ borderRadius: `${borderRadius}px` }} selected={selectedIndex === 0}>
                          <ListItemIcon>
                            <IconSettings stroke={1.5} size="20px" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography variant="body2">Account Settings</Typography>} />
                        </ListItemButton>

                        <ListItemButton sx={{ borderRadius: `${borderRadius}px` }} selected={selectedIndex === 1}>
                          <ListItemIcon>
                            <IconUser stroke={1.5} size="20px" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Grid container spacing={1} sx={{ justifyContent: 'space-between' }}>
                                <Grid>
                                  <Typography variant="body2">Social Profile</Typography>
                                </Grid>
                                <Grid>
                                  <Chip
                                    label="02"
                                    variant="filled"
                                    size="small"
                                    color="warning"
                                    sx={{ '& .MuiChip-label': { mt: 0.25 } }}
                                  />
                                </Grid>
                              </Grid>
                            }
                          />
                        </ListItemButton>

                        <ListItemButton sx={{ borderRadius: `${borderRadius}px` }} onClick={handleLogout}>
                          <ListItemIcon>
                            <IconLogout stroke={1.5} size="20px" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography variant="body2">Logout</Typography>} />
                        </ListItemButton>
                      </List>
                    </Box>
                  </MainCard>
                )}
              </Paper>
            </Transitions>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
}
