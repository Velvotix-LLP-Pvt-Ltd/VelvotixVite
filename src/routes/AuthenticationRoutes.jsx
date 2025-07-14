import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';
import GuestGuard from './GuestGaurd';

const LoginPage = Loadable(lazy(() => import('views/pages/authentication/Login')));
const RegisterPage = Loadable(lazy(() => import('views/pages/authentication/Register')));

const AuthenticationRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    {
      path: '/auth/login',
      element: (
        <GuestGuard>
          <LoginPage />
        </GuestGuard>
      )
    },
    {
      path: '/pages/register',
      element: (
        <GuestGuard>
          <RegisterPage />
        </GuestGuard>
      )
    }
  ]
};

export default AuthenticationRoutes;
