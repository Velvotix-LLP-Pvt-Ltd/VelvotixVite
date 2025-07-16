import { memo, useEffect, useState } from 'react';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import NavItem from './NavItem';
import NavGroup from './NavGroup';
import dashboard from 'menu-items/dashboard';
import getMenuByRole from 'menu-items/utilities';

import { useGetMenuMaster } from 'api/menu';

function MenuList() {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const [selectedID, setSelectedID] = useState('');
  const [menuItems, setMenuItems] = useState([]);

  // Load menu items dynamically on mount or when role changes
  useEffect(() => {
    const role = localStorage.getItem('role');
    const dynamicMenu = [dashboard, ...getMenuByRole(role)];
    setMenuItems(dynamicMenu);
  }, []);

  const navItems = menuItems.map((item, index) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} setSelectedID={setSelectedID} selectedID={selectedID} item={item} />;
      case 'item':
        return (
          <List key={item.id}>
            <NavItem item={item} level={1} isParents setSelectedID={() => setSelectedID('')} />
            {index !== 0 && <Divider sx={{ py: 0.5 }} />}
          </List>
        );
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  });

  return <Box {...(drawerOpen && { sx: { mt: 1.5 } })}>{navItems}</Box>;
}

export default memo(MenuList);
