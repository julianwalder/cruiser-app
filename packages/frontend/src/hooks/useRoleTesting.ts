import { useState, useEffect } from 'react';
import { UserRole } from '@components/RoleSwitcher';

interface Capability {
  feature: string;
  accessible: boolean;
  description: string;
}

interface RoleConfig {
  label: string;
  description: string;
  icon: any;
  color: string;
  capabilities: Capability[];
}

const defaultRoleCapabilities: Record<UserRole, RoleConfig> = {
  user: {
    label: 'User',
    description: 'Basic pilot access',
    icon: null,
    color: 'bg-blue-100 text-blue-800',
    capabilities: [
      { feature: 'View Dashboard', accessible: true, description: 'Basic dashboard with flight information' },
      { feature: 'View Flights', accessible: true, description: 'View own flight history and bookings' },
      { feature: 'Manage Flights', accessible: true, description: 'View, edit, and delete own flights' },
      { feature: 'View Flight Logs', accessible: true, description: 'Access to flight log management' },
      { feature: 'Manage Flight Logs', accessible: true, description: 'Create, edit, and delete flight log entries' },
      { feature: 'View Fleet', accessible: true, description: 'Browse available aircraft' },
      { feature: 'View Bases', accessible: true, description: 'View base information and locations' },
      { feature: 'View Services', accessible: true, description: 'Browse available services' },
      { feature: 'View Profile', accessible: true, description: 'Manage personal profile' },
      { feature: 'View Invoices', accessible: true, description: 'View own invoices and billing history' },
      { feature: 'Manage Invoices', accessible: false, description: 'No invoice management access' },
      { feature: 'Manage Users', accessible: false, description: 'No user management access' },
      { feature: 'Manage Bases', accessible: false, description: 'No base management access' },
      { feature: 'Manage Fleet', accessible: false, description: 'No fleet management access' },
      { feature: 'Manage Services', accessible: false, description: 'No service management access' },
      { feature: 'Manage Roles', accessible: false, description: 'No role management access' },
      { feature: 'View Reports', accessible: false, description: 'No reporting access' }
    ]
  },
  instructor: {
    label: 'Instructor',
    description: 'Flight instructor access',
    icon: null,
    color: 'bg-green-100 text-green-800',
    capabilities: [
      { feature: 'View Dashboard', accessible: true, description: 'Instructor dashboard with student overview' },
      { feature: 'View Flights', accessible: true, description: 'View and manage flight schedules' },
      { feature: 'Manage Flights', accessible: true, description: 'View, edit, and delete all flights' },
      { feature: 'View Flight Logs', accessible: true, description: 'Access to flight log management' },
      { feature: 'Manage Flight Logs', accessible: true, description: 'Create, edit, and delete flight log entries' },
      { feature: 'View Fleet', accessible: true, description: 'Browse and select aircraft for lessons' },
      { feature: 'View Bases', accessible: true, description: 'View base information and locations' },
      { feature: 'View Services', accessible: true, description: 'Browse available training services' },
      { feature: 'View Profile', accessible: true, description: 'Manage instructor profile' },
      { feature: 'View Invoices', accessible: false, description: 'No invoice access' },
      { feature: 'Manage Invoices', accessible: false, description: 'No invoice management access' },
      { feature: 'Manage Users', accessible: true, description: 'View student information and progress' },
      { feature: 'Manage Bases', accessible: false, description: 'No base management access' },
      { feature: 'Manage Fleet', accessible: false, description: 'No fleet management access' },
      { feature: 'Manage Services', accessible: false, description: 'No service management access' },
      { feature: 'Manage Roles', accessible: false, description: 'No role management access' },
      { feature: 'View Reports', accessible: false, description: 'No reporting access' }
    ]
  },
  base_manager: {
    label: 'Base Manager',
    description: 'Base operations management',
    icon: null,
    color: 'bg-purple-100 text-purple-800',
    capabilities: [
      { feature: 'View Dashboard', accessible: true, description: 'Base management dashboard' },
      { feature: 'View Flights', accessible: true, description: 'View and manage base flights' },
      { feature: 'Manage Flights', accessible: true, description: 'View, edit, and delete all flights' },
      { feature: 'View Flight Logs', accessible: true, description: 'Access to flight log management' },
      { feature: 'Manage Flight Logs', accessible: true, description: 'Create, edit, and delete flight log entries' },
      { feature: 'View Fleet', accessible: true, description: 'Manage aircraft at the base' },
      { feature: 'View Bases', accessible: true, description: 'View and manage base information' },
      { feature: 'View Services', accessible: true, description: 'Manage base services' },
      { feature: 'View Profile', accessible: true, description: 'Manage base manager profile' },
      { feature: 'View Invoices', accessible: true, description: 'View base-related invoices and billing' },
      { feature: 'Manage Invoices', accessible: false, description: 'No invoice management access' },
      { feature: 'Manage Users', accessible: true, description: 'View user information' },
      { feature: 'Manage Bases', accessible: true, description: 'Full base management capabilities' },
      { feature: 'Manage Fleet', accessible: true, description: 'Manage aircraft at the base' },
      { feature: 'Manage Services', accessible: true, description: 'Manage base services' },
      { feature: 'Manage Roles', accessible: false, description: 'No role management access' },
      { feature: 'View Reports', accessible: false, description: 'No reporting access' }
    ]
  },
  admin: {
    label: 'Admin',
    description: 'System administration',
    icon: null,
    color: 'bg-orange-100 text-orange-800',
    capabilities: [
      { feature: 'View Dashboard', accessible: true, description: 'Admin dashboard with system overview' },
      { feature: 'View Flights', accessible: true, description: 'View and manage all flights' },
      { feature: 'Manage Flights', accessible: true, description: 'View, edit, and delete all flights' },
      { feature: 'View Flight Logs', accessible: true, description: 'Access to flight log management' },
      { feature: 'Manage Flight Logs', accessible: true, description: 'Create, edit, and delete flight log entries' },
      { feature: 'View Fleet', accessible: true, description: 'Full fleet management' },
      { feature: 'View Bases', accessible: true, description: 'Full base management' },
      { feature: 'View Services', accessible: true, description: 'Full service management' },
      { feature: 'View Profile', accessible: true, description: 'Manage admin profile' },
      { feature: 'View Invoices', accessible: true, description: 'View and manage all invoices' },
      { feature: 'Manage Invoices', accessible: true, description: 'Full invoice and billing management' },
      { feature: 'Manage Users', accessible: true, description: 'Full user management' },
      { feature: 'Manage Bases', accessible: true, description: 'Full base management' },
      { feature: 'Manage Fleet', accessible: true, description: 'Full fleet management' },
      { feature: 'Manage Services', accessible: true, description: 'Full service management' },
      { feature: 'Manage Roles', accessible: false, description: 'No role management access' },
      { feature: 'View Reports', accessible: true, description: 'Access to system reports' }
    ]
  },
  super_admin: {
    label: 'Super Admin',
    description: 'Full system control',
    icon: null,
    color: 'bg-red-100 text-red-800',
    capabilities: [
      { feature: 'View Dashboard', accessible: true, description: 'Super admin dashboard with full system overview' },
      { feature: 'View Flights', accessible: true, description: 'View and manage all flights' },
      { feature: 'Manage Flights', accessible: true, description: 'View, edit, and delete all flights' },
      { feature: 'View Flight Logs', accessible: true, description: 'Access to flight log management' },
      { feature: 'Manage Flight Logs', accessible: true, description: 'Create, edit, and delete flight log entries' },
      { feature: 'View Fleet', accessible: true, description: 'Full fleet management' },
      { feature: 'View Bases', accessible: true, description: 'Full base management' },
      { feature: 'View Services', accessible: true, description: 'Full service management' },
      { feature: 'View Profile', accessible: true, description: 'Manage super admin profile' },
      { feature: 'View Invoices', accessible: true, description: 'View and manage all invoices' },
      { feature: 'Manage Invoices', accessible: true, description: 'Full invoice and billing management' },
      { feature: 'Manage Users', accessible: true, description: 'Full user management' },
      { feature: 'Manage Bases', accessible: true, description: 'Full base management' },
      { feature: 'Manage Fleet', accessible: true, description: 'Full fleet management' },
      { feature: 'Manage Services', accessible: true, description: 'Full service management' },
      { feature: 'Manage Roles', accessible: true, description: 'Full role and permission management' },
      { feature: 'View Reports', accessible: true, description: 'Full reporting and analytics access' }
    ]
  }
};

// Menu item to permission mapping
const menuItemPermissions: Record<string, string[]> = {
  dashboard: ['dashboard:read'],
  flights: ['flights:read'],
  fleet: ['fleet:read'],
  bases: ['bases:read'],
  services: ['services:read'],
  users: ['users:read'],
  roles: ['roles:read'],
  reports: ['reports:read'],
  flightlog: ['flightlog:read'],
  invoices: ['invoices:read'],
  payments: ['payments:read'],
  profile: ['profile:read'],
  settings: ['settings:read']
};

export const useRoleTesting = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('user');
  const [isRoleSwitcherVisible, setIsRoleSwitcherVisible] = useState(true);
  const [roleCapabilities, setRoleCapabilities] = useState<Record<UserRole, RoleConfig>>(defaultRoleCapabilities);

  // Load role and custom capabilities from localStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('test_role') as UserRole;
    console.log('🔍 Role Testing Init:', { savedRole, validRoles: ['user', 'admin', 'super_admin', 'base_manager', 'instructor'] });
    
    if (savedRole && ['user', 'admin', 'super_admin', 'base_manager', 'instructor'].includes(savedRole)) {
      setCurrentRole(savedRole);
      console.log('🔍 Setting current role to:', savedRole);
    } else if (process.env.NODE_ENV === 'production') {
      // In production, if no test role is set, we'll use the actual user role
      // This will be handled by the component that uses this hook
      console.log('🔍 Production mode, no saved role found');
    } else {
      console.log('🔍 Development mode, no saved role found, using default: user');
    }

    const savedCapabilities = localStorage.getItem('custom_role_capabilities');
    if (savedCapabilities) {
      try {
        const parsed = JSON.parse(savedCapabilities);
        setRoleCapabilities(parsed);
        console.log('🔍 Loaded custom role capabilities');
      } catch (error) {
        console.warn('Failed to parse saved role capabilities, using defaults');
      }
    }
  }, []);

  // Initialize role for production superadmin users
  const initializeRole = (userRole: UserRole) => {
    if (process.env.NODE_ENV === 'production' && userRole === 'super_admin') {
      const savedRole = localStorage.getItem('test_role') as UserRole;
      if (savedRole && ['user', 'admin', 'super_admin', 'base_manager', 'instructor'].includes(savedRole)) {
        setCurrentRole(savedRole);
      } else {
        setCurrentRole('super_admin');
      }
    }
  };

  // Save role to localStorage when it changes
  const handleRoleChange = (role: UserRole) => {
    console.log('🔍 Role Change:', { from: currentRole, to: role });
    setCurrentRole(role);
    localStorage.setItem('test_role', role);
  };

  // Toggle role switcher visibility
  const toggleRoleSwitcher = () => {
    setIsRoleSwitcherVisible(!isRoleSwitcherVisible);
  };

  // Update role capabilities
  const updateRoleCapabilities = (newCapabilities: Record<UserRole, RoleConfig>) => {
    setRoleCapabilities(newCapabilities);
    localStorage.setItem('custom_role_capabilities', JSON.stringify(newCapabilities));
  };

  // Reset role capabilities to defaults
  const resetRoleCapabilities = () => {
    setRoleCapabilities(defaultRoleCapabilities);
    localStorage.removeItem('custom_role_capabilities');
  };

  // Convert feature-based capabilities to permission strings
  const getRolePermissions = (role: UserRole): string[] => {
    const capabilities = roleCapabilities[role]?.capabilities || [];
    const permissions: string[] = [];
    
    capabilities.forEach(capability => {
      if (capability.accessible) {
        // Map feature names to permission strings
        switch (capability.feature) {
          case 'View Dashboard':
            permissions.push('dashboard:read');
            break;
          case 'View Flights':
            permissions.push('flights:read');
            break;
          case 'Manage Flights':
            permissions.push('flights:read', 'flights:write');
            break;
          case 'View Flight Logs':
            permissions.push('flightlog:read');
            break;
          case 'Manage Flight Logs':
            permissions.push('flightlog:read', 'flightlog:write');
            break;
          case 'View Fleet':
            permissions.push('fleet:read');
            break;
          case 'View Bases':
            permissions.push('bases:read');
            break;
          case 'View Services':
            permissions.push('services:read');
            break;
          case 'View Profile':
            permissions.push('profile:read');
            break;
          case 'View Invoices':
            permissions.push('invoices:read');
            break;
          case 'Manage Invoices':
            permissions.push('invoices:read', 'invoices:write');
            break;
          case 'Manage Users':
            permissions.push('users:read', 'users:write');
            break;
          case 'Manage Bases':
            permissions.push('bases:read', 'bases:write');
            break;
          case 'Manage Fleet':
            permissions.push('fleet:read', 'fleet:write');
            break;
          case 'Manage Services':
            permissions.push('services:read', 'services:write');
            break;
          case 'Manage Roles':
            permissions.push('roles:read', 'roles:write');
            break;
          case 'View Reports':
            permissions.push('reports:read');
            break;
          default:
            // Add generic permission for unknown features
            const featureKey = capability.feature.toLowerCase().replace(/\s+/g, '_');
            permissions.push(`${featureKey}:read`);
        }
      }
    });
    
    // Add common permissions that should always be available
    permissions.push('profile:read', 'settings:read');
    
    return [...new Set(permissions)]; // Remove duplicates
  };

  // Check if user has permission
  const hasPermission = (permission: string): boolean => {
    const permissions = getRolePermissions(currentRole);
    return permissions.includes('*') || permissions.includes(permission);
  };

  // Check if user has any of the required permissions
  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some(permission => hasPermission(permission));
  };

  // Check if user has all required permissions
  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every(permission => hasPermission(permission));
  };

  // Get accessible sections based on role
  const getAccessibleSections = (): string[] => {
    const baseSections = ['dashboard', 'flights', 'fleet', 'bases', 'services'];
    const adminSections = ['users', 'roles', 'reports'];
    const userSpecificSections = ['flightlog', 'invoices', 'payments'];
    const commonSections = ['profile', 'settings'];
    
    let accessibleSections = [...baseSections];
    
    // Add admin sections based on current capabilities
    if (hasPermission('users:read') || hasPermission('bases:write') || hasPermission('fleet:write')) {
      accessibleSections = [...accessibleSections, ...adminSections];
    }
    
    // Add user-specific sections for users with invoice permissions or admin roles
    // All users now have access to flight log management
    if (hasPermission('invoices:read') || hasPermission('flightlog:read') || currentRole === 'admin' || currentRole === 'super_admin' || currentRole === 'base_manager' || currentRole === 'instructor' || currentRole === 'user') {
      accessibleSections = [...accessibleSections, ...userSpecificSections];
    }
    
    // Add common sections
    accessibleSections = [...accessibleSections, ...commonSections];
    
    // Debug logging
    console.log('🔍 Role Testing Debug:', {
      currentRole,
      hasInvoicePermission: hasPermission('invoices:read'),
      rolePermissions: getRolePermissions(currentRole),
      accessibleSections,
      userSpecificSections
    });
    
    return accessibleSections;
  };

  // Get accessible menu items based on role capabilities
  const getAccessibleMenuItems = (): string[] => {
    const allMenuItems = Object.keys(menuItemPermissions);
    const accessibleItems: string[] = [];
    
    allMenuItems.forEach(menuItem => {
      const requiredPermissions = menuItemPermissions[menuItem];
      if (requiredPermissions && requiredPermissions.some(permission => hasPermission(permission))) {
        accessibleItems.push(menuItem);
      }
    });
    
    // Special handling for flightlog - check if user has flight log capabilities
    if (hasPermission('flightlog:read') && !accessibleItems.includes('flightlog')) {
      accessibleItems.push('flightlog');
    }
    
    // Always include dashboard and profile
    if (!accessibleItems.includes('dashboard')) {
      accessibleItems.unshift('dashboard');
    }
    if (!accessibleItems.includes('profile')) {
      accessibleItems.push('profile');
    }
    
    // Debug logging
    console.log('🔍 Menu Items Debug:', {
      currentRole,
      allMenuItems,
      accessibleItems,
      hasFlightLogPermission: hasPermission('flightlog:read'),
      roleCapabilities: roleCapabilities[currentRole]
    });
    
    return accessibleItems;
  };

  return {
    currentRole,
    setCurrentRole: handleRoleChange,
    isRoleSwitcherVisible,
    toggleRoleSwitcher,
    roleCapabilities,
    updateRoleCapabilities,
    resetRoleCapabilities,
    initializeRole,
    getRolePermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getAccessibleSections,
    getAccessibleMenuItems
  };
}; 