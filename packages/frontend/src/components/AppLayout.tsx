import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  BarChart3, 
  Plane, 
  PlaneTakeoff, 
  User, 
  Settings, 
  LogOut,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  FileText,
  CreditCard,
  MapPin,
  Home,
  Users,
  Crown,
  Building2,
  TrendingUp,
  Globe
} from 'lucide-react';
import { useRoleTesting } from '../hooks/useRoleTesting';

// Modern monocolor icons
const Icons = {
  Home: Home,
  Dashboard: BarChart3,
  Flights: Plane,
  FlightLog: PlaneTakeoff,
  Profile: User,
  Services: Calendar,
  Invoices: FileText,
  Payments: CreditCard,
  Bases: MapPin,
  Settings: Settings,
  Logout: LogOut,
  Users: Users,
  Roles: Crown,
  Fleet: Plane,
  Reports: TrendingUp,
  Globe: Globe
};

type MenuItem = {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  active?: boolean;
  href?: string;
};

interface AppLayoutProps {
  children: React.ReactNode;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  userType?: 'user' | 'admin' | 'instructor' | 'base_manager' | 'super_admin';
  title?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  activeSection = 'dashboard', 
  onSectionChange,
  userType = 'user',
  title = 'Cruiser Aviation Platform'
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Use the role testing hook for dynamic menu generation
  const { getAccessibleMenuItems } = useRoleTesting();

  // Define all possible menu items
  const allMenuItems: Record<string, MenuItem> = {
    dashboard: { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
    flights: { id: 'flights', label: 'Flights', icon: Icons.Flights },
    fleet: { id: 'fleet', label: 'Fleet', icon: Icons.Fleet },
    bases: { id: 'bases', label: 'Bases', icon: Icons.Bases },
    services: { id: 'services', label: 'Services', icon: Icons.Services },
    users: { id: 'users', label: 'Users', icon: Icons.Users },
    roles: { id: 'roles', label: 'Roles', icon: Icons.Roles },
    reports: { id: 'reports', label: 'Reports', icon: Icons.Reports },
    airfields: { id: 'airfields', label: 'Airfields', icon: Icons.Globe },
    flightlog: { id: 'flightlog', label: 'Flight Log', icon: Icons.FlightLog },
    invoices: { id: 'invoices', label: 'Invoices', icon: Icons.Invoices },
    payments: { id: 'payments', label: 'Payments', icon: Icons.Payments },
    profile: { id: 'profile', label: 'Profile', icon: Icons.Profile },
    settings: { id: 'settings', label: 'Settings', icon: Icons.Settings },
  };

  // Get accessible menu items based on role capabilities
  const getMenuItems = (): MenuItem[] => {
    const accessibleMenuIds = getAccessibleMenuItems();
    
    // Filter menu items based on accessible sections
    const menuItems = accessibleMenuIds
      .map(id => allMenuItems[id])
      .filter(item => item !== undefined);
    
    console.log('🔍 Dynamic Menu Generation:', {
      userType,
      accessibleMenuIds,
      menuItems: menuItems.map(item => item.id),
      allMenuItems: Object.keys(allMenuItems),
      flightlogInAccessible: accessibleMenuIds.includes('flightlog'),
      flightlogInMenuItems: menuItems.some(item => item.id === 'flightlog')
    });
    
    return menuItems;
  };

  const menuItems = getMenuItems();

  const handleSectionChange = (sectionId: string) => {
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
  };

  const getUserInfo = () => {
    switch (userType) {
      case 'super_admin':
        return {
          name: 'Super Admin',
          role: 'Super Administrator',
          initial: 'S'
        };
      case 'admin':
        return {
          name: 'Admin User',
          role: 'Administrator',
          initial: 'A'
        };
      case 'base_manager':
        return {
          name: 'Base Manager',
          role: 'Base Manager',
          initial: 'B'
        };
      case 'instructor':
        return {
          name: 'Instructor',
          role: 'Flight Instructor',
          initial: 'I'
        };
      case 'user':
      default:
        return {
          name: 'User',
          role: 'Pilot',
          initial: 'U'
        };
    }
  };

  const userInfo = getUserInfo();

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content="Modern flight school and aircraft rental management platform" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex">
        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:inset-0 lg:flex-shrink-0 lg:h-screen
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}
        `}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-gray-900">
                ✈️ {userType === 'admin' || userType === 'super_admin' || userType === 'base_manager' ? 'Cruiser Admin' : 'Cruiser Aviation'}
              </h1>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700"
            >
              {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="mt-6 px-3">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleSectionChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${activeSection === item.id
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="ml-3">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Logout Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors">
                <Icons.Logout size={20} className="flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="ml-3">Logout</span>
                )}
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Navigation Bar */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu size={20} />
              </button>

              {/* Page title */}
              <div className="flex-1 lg:flex-none">
                <h2 className="text-lg font-semibold text-gray-900">
                  {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
                </h2>
              </div>

              {/* Right side - notifications and profile */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md relative">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
                </button>

                {/* Profile */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{userInfo.initial}</span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">{userInfo.name}</p>
                    <p className="text-xs text-gray-500">{userInfo.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}; 