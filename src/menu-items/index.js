import dashboard from './dashboard';
import getMenuByRole from './utilities';

const role = localStorage.getItem('role');

const menuItems = {
  items: [dashboard, ...getMenuByRole(role)]
};

export default menuItems;
