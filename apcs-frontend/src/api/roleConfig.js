// Role-based menu configuration
export const menuConfig = {
  // ADMIN - Full system access (NO Create Booking - read only for bookings)
  admin: [
    { icon: 'LayoutDashboard', label: 'Dashboard', path: '/dashboard' },
    { icon: 'Calendar', label: 'Bookings', path: '/bookings' },
    { icon: 'RefreshCw', label: 'Reschedule & Late', path: '/reschedule' },
    { icon: 'Clock', label: 'Slot Management', path: '/slots' },
    { icon: 'Truck', label: 'Fleet Management', path: '/fleet' },
    { icon: 'MessageSquare', label: 'AI Assistant', path: '/ai-assistant' },
    { icon: 'Activity', label: 'Operations', path: '/operations' },
    { icon: 'FileText', label: 'Traceability', path: '/logs' },
    { icon: 'Bell', label: 'Notifications', path: '/notifications' },
    { icon: 'Users', label: 'Users & Roles', path: '/users' },
    { icon: 'Settings', label: 'Settings', path: '/settings' },
  ],

  // OPERATOR - Gate operations & booking validation only
  operator: [
    { icon: 'Activity', label: 'Operations', path: '/operations' },
    { icon: 'Calendar', label: 'Validate Bookings', path: '/bookings' },
    { icon: 'Bell', label: 'Notifications', path: '/notifications' },
    { icon: 'Settings', label: 'Settings', path: '/settings' },
  ],

  // CARRIER - Booking & fleet for their own company + Reschedule
  carrier: [
    { icon: 'Package', label: 'Create Booking', path: '/create-booking' },
    { icon: 'Calendar', label: 'My Bookings', path: '/bookings' },
    { icon: 'RefreshCw', label: 'Reschedule & Late', path: '/reschedule' },
    { icon: 'Truck', label: 'My Fleet', path: '/fleet' },
    { icon: 'Bell', label: 'Notifications', path: '/notifications' },
    { icon: 'Settings', label: 'Settings', path: '/settings' },
  ],
};

// Check if user has access to a specific route
export const hasAccess = (userRole, path) => {
  const menu = menuConfig[userRole];
  if (!menu) return false;
  return menu.some((item) => item.path === path);
};

// Get default route for a role
export const getDefaultRoute = (userRole) => {
  const routes = {
    admin: '/dashboard',
    operator: '/operations',
    carrier: '/create-booking',
  };
  return routes[userRole] || '/login';
};
