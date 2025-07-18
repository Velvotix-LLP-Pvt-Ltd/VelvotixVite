import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography } from '@mui/material';
import { RiseLoader } from 'react-spinners';

export default function AuthGuard({ children }) {
  const navigate = useNavigate();
  const location = useLocation(); // 🔁 Detects route change
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/auth/login', { replace: true });
        return;
      }

      setLoading(true); // Show loader during validation

      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/checktoken`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data?.valid) {
          setLoading(false); // Token valid, hide loader
        } else {
          localStorage.removeItem('token');
          navigate('/auth/login', { replace: true });
        }
      } catch (err) {
        localStorage.removeItem('token');
        navigate('/auth/login', { replace: true });
      }
    };

    checkToken();
  }, [location.pathname, navigate]); // ✅ Re-run on every route change

  return (
    <>
      {children}

      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 2000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <RiseLoader color="#800080" size={15} />
          <Typography variant="h6" mt={2} color="text.primary">
            Validating session...
          </Typography>
        </Box>
      )}
    </>
  );
}
