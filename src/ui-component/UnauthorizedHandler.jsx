// utils/handleApiError.js
import toast from 'react-hot-toast';

export default function handleApiError(error, navigate) {
  const status = error?.response?.status;
  const message = error?.response?.data?.message || error.message || 'Something went wrong';

  if (status === 401) {
    toast.error('Unauthorized. Redirecting to login.');
    localStorage.clear();
    if (navigate) navigate('/auth/login');
  } else if (status === 403) {
    toast.error('Access Denied');
  } else if (status === 404) {
    toast.error('Not Found');
  } else if (status === 500) {
    toast.error('Internal Server Error');
  } else {
    toast.error(message);
  }
}
