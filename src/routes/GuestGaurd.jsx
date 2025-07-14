// src/routes/GuestGuard.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GuestGuard({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // User is already logged in, redirect to dashboard/home
      navigate('/', { replace: true });
    }
  }, [navigate]);

  return children;
}
