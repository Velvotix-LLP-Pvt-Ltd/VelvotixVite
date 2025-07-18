// icons
import { IconSchool, IconBook, IconUsersGroup, IconListCheck, IconListDetails, IconMoneybag } from '@tabler/icons-react';

// common icons map
const icons = {
  IconSchool,
  IconBook,
  IconUsersGroup,
  IconListCheck,
  IconListDetails,
  IconMoneybag
};

// role-based menu definitions
const menus = {
  Admin: [
    {
      id: 'admin',
      title: 'Admin',
      type: 'group',
      children: [
        {
          id: 'schools',
          title: 'Schools',
          type: 'item',
          url: '/schools',
          icon: icons.IconSchool,
          breadcrumbs: true
        },
        {
          id: 'teachers',
          title: 'Teachers',
          type: 'item',
          url: '/teachers',
          icon: icons.IconBook,
          breadcrumbs: true
        },
        {
          id: 'students',
          title: 'Students',
          type: 'item',
          url: '/students',
          icon: icons.IconUsersGroup,
          breadcrumbs: true
        },
        {
          id: 'attendance',
          title: 'Attendance',
          type: 'collapse',
          icon: icons.IconListCheck,
          children: [
            {
              id: 'mark',
              title: 'Mark Attendance',
              type: 'item',
              url: '/mark',
              icon: icons.IconKey,
              breadcrumbs: true
            },
            {
              id: 'attendancetracker',
              title: 'Track Attendance',
              type: 'item',
              url: '/attendancetracker',
              icon: icons.IconKey,
              breadcrumbs: true
            }
          ]
        },
        {
          id: 'fees',
          title: 'Fee Management',
          type: 'collapse',
          icon: icons.IconMoneybag,
          children: [
            {
              id: 'feestructure',
              title: 'Fee Structure',
              type: 'item',
              url: '/feestructure',
              icon: icons.IconKey,
              breadcrumbs: true
            }
          ]
        }
      ]
    }
  ],
  School: [
    {
      id: 'school',
      title: 'School',
      type: 'group',
      children: [
        {
          id: 'teachers',
          title: 'Teachers',
          type: 'item',
          url: '/teachers',
          icon: icons.IconBook,
          breadcrumbs: true
        },
        {
          id: 'students',
          title: 'Students',
          type: 'item',
          url: '/students',
          icon: icons.IconUsersGroup,
          breadcrumbs: true
        },
        {
          id: 'attendance',
          title: 'Attendance',
          type: 'collapse',
          icon: icons.IconKey,
          children: [
            {
              id: 'mark',
              title: 'Mark Attendance',
              type: 'item',
              url: '/mark',
              icon: icons.IconListCheck,
              breadcrumbs: true
            },
            {
              id: 'attendancetracker',
              title: 'Track Attendance',
              type: 'item',
              url: '/attendancetracker',
              icon: icons.IconListCheck,
              breadcrumbs: true
            }
          ]
        }
      ]
    }
  ],
  Teacher: [
    {
      id: 'teacher',
      title: 'Teacher',
      type: 'group',
      children: [
        {
          id: 'students',
          title: 'Students',
          type: 'item',
          url: '/students',
          icon: icons.IconUsersGroup,
          breadcrumbs: true
        },
        {
          id: 'attendance',
          title: 'Attendance',
          type: 'collapse',
          icon: icons.IconKey,
          children: [
            {
              id: 'mark',
              title: 'Mark Attendance',
              type: 'item',
              url: '/mark',
              icon: icons.IconListCheck,
              breadcrumbs: true
            },
            {
              id: 'attendancetracker',
              title: 'Track Attendance',
              type: 'item',
              url: '/attendancetracker',
              icon: icons.IconListCheck,
              breadcrumbs: true
            }
          ]
        }
      ]
    }
  ],
  Student: []
};

// return menu by role
const getMenuByRole = (role) => menus[role] || [];

export default getMenuByRole;
