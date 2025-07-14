// assets
import { IconTypography, IconPalette, IconShadow, IconWindmill, IconSchool } from '@tabler/icons-react';

// constant
const icons = {
  IconTypography,
  IconPalette,
  IconShadow,
  IconWindmill,
  IconSchool
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
    }
  ]
};

export default Admin;
