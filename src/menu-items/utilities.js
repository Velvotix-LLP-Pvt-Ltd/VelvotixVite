// assets
import { IconTypography, IconPalette, IconShadow, IconWindmill, IconSchool, IconBook, IconUsersGroup } from '@tabler/icons-react';

// constant
const icons = {
  IconTypography,
  IconPalette,
  IconShadow,
  IconWindmill,
  IconSchool,
  IconBook,
  IconUsersGroup
};

// ==============================|| UTILITIES MENU ITEMS ||============================== //

const Admin = {
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
};

export default Admin;
