import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));
import AuthGuard from './AuthGaurd';

// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));
const Schools = Loadable(lazy(() => import('views/schools')));
const Teachers = Loadable(lazy(() => import('views/teacher')));
const Students = Loadable(lazy(() => import('views/students')));
const Attendance = Loadable(lazy(() => import('views/attendance')));
const MarkAttendance = Loadable(lazy(() => import('views/markAttendance')));
const FeeStructureView = Loadable(lazy(() => import('views/feestructure')));
const PaymentForm = Loadable(lazy(() => import('views/payment')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <AuthGuard>
      <MainLayout />
    </AuthGuard>
  ),
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'typography',
      element: <UtilsTypography />
    },
    {
      path: 'color',
      element: <UtilsColor />
    },
    {
      path: 'shadow',
      element: <UtilsShadow />
    },
    {
      path: '/sample-page',
      element: <SamplePage />
    },
    {
      path: '/schools',
      element: <Schools />
    },
    {
      path: '/teachers',
      element: <Teachers />
    },
    {
      path: '/students',
      element: <Students />
    },
    {
      path: '/attendancetracker',
      element: <Attendance />
    },
    {
      path: '/mark',
      element: <MarkAttendance />
    },
    {
      path: '/feestructure',
      element: <FeeStructureView />
    },
    {
      path: '/payment',
      element: <PaymentForm />
    }
  ]
};

export default MainRoutes;
