// icons
import { IconSchool, IconBook, IconUsersGroup } from '@tabler/icons-react';

// common icons map
const icons = {
  IconSchool,
  IconBook,
  IconUsersGroup
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
        }
      ]
    }
  ],
  Student: []
};

// return menu by role
const getMenuByRole = (role) => menus[role] || [];

export default getMenuByRole;
