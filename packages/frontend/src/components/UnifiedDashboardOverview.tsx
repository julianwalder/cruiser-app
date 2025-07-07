import React from 'react';
import { BarChart3, Users, Plane, MapPin, Calendar, TrendingUp, Crown, Building2 } from 'lucide-react';
import { UserRole } from './RoleSwitcher';

interface UnifiedDashboardOverviewProps {
  userRole: UserRole;
}

export const UnifiedDashboardOverview: React.FC<UnifiedDashboardOverviewProps> = ({ userRole }) => {
  const getRoleSpecificStats = () => {
    switch (userRole) {
      case 'super_admin':
        return [
          { label: 'Total Users', value: '1,247', icon: Users, color: 'bg-blue-500' },
          { label: 'Active Bases', value: '12', icon: MapPin, color: 'bg-green-500' },
          { label: 'Fleet Size', value: '45', icon: Plane, color: 'bg-purple-500' },
          { label: 'System Health', value: '100%', icon: Crown, color: 'bg-red-500' },
        ];
      case 'admin':
        return [
          { label: 'Total Users', value: '1,247', icon: Users, color: 'bg-blue-500' },
          { label: 'Active Bases', value: '12', icon: MapPin, color: 'bg-green-500' },
          { label: 'Fleet Size', value: '45', icon: Plane, color: 'bg-purple-500' },
          { label: 'Active Services', value: '28', icon: Calendar, color: 'bg-orange-500' },
        ];
      case 'base_manager':
        return [
          { label: 'Base Users', value: '156', icon: Users, color: 'bg-blue-500' },
          { label: 'Base Aircraft', value: '8', icon: Plane, color: 'bg-purple-500' },
          { label: 'Active Services', value: '12', icon: Calendar, color: 'bg-orange-500' },
          { label: 'Monthly Flights', value: '342', icon: TrendingUp, color: 'bg-green-500' },
        ];
      case 'instructor':
        return [
          { label: 'Active Students', value: '24', icon: Users, color: 'bg-blue-500' },
          { label: 'Scheduled Flights', value: '18', icon: Plane, color: 'bg-purple-500' },
          { label: 'Training Hours', value: '156', icon: Calendar, color: 'bg-orange-500' },
          { label: 'Student Progress', value: '85%', icon: TrendingUp, color: 'bg-green-500' },
        ];
      case 'user':
      default:
        return [
          { label: 'Total Flight Hours', value: '127.5', icon: Plane, color: 'bg-blue-500' },
          { label: 'Completed Flights', value: '45', icon: Calendar, color: 'bg-green-500' },
          { label: 'Available Aircraft', value: '12', icon: Plane, color: 'bg-purple-500' },
          { label: 'Active Bookings', value: '3', icon: TrendingUp, color: 'bg-orange-500' },
        ];
    }
  };

  const getWelcomeMessage = () => {
    switch (userRole) {
      case 'super_admin':
        return {
          title: 'Super Administrator Dashboard',
          subtitle: 'Complete system overview and control',
          description: 'Welcome to the comprehensive system administration dashboard. You have full access to all platform features and can manage users, roles, bases, fleet, and system-wide operations.'
        };
      case 'admin':
        return {
          title: 'Administrator Dashboard',
          subtitle: 'System administration and management',
          description: 'Welcome to the administrator dashboard. You can manage users, bases, fleet, services, and access system reports.'
        };
      case 'base_manager':
        return {
          title: 'Base Manager Dashboard',
          subtitle: 'Base operations and management',
          description: 'Welcome to the base manager dashboard. You can manage your base operations, fleet, services, and user activities.'
        };
      case 'instructor':
        return {
          title: 'Flight Instructor Dashboard',
          subtitle: 'Student management and training',
          description: 'Welcome to the instructor dashboard. You can manage your students, schedule flights, and track training progress.'
        };
      case 'user':
      default:
        return {
          title: 'Pilot Dashboard',
          subtitle: 'Flight information and bookings',
          description: 'Welcome to your pilot dashboard. View your flight history, book new flights, and manage your profile.'
        };
    }
  };

  const stats = getRoleSpecificStats();
  const welcome = getWelcomeMessage();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            {userRole === 'super_admin' && <Crown className="w-6 h-6 text-blue-600" />}
            {userRole === 'admin' && <BarChart3 className="w-6 h-6 text-blue-600" />}
            {userRole === 'base_manager' && <Building2 className="w-6 h-6 text-blue-600" />}
            {userRole === 'instructor' && <Users className="w-6 h-6 text-blue-600" />}
            {userRole === 'user' && <Plane className="w-6 h-6 text-blue-600" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{welcome.title}</h1>
            <p className="text-gray-600">{welcome.subtitle}</p>
          </div>
        </div>
        <p className="mt-4 text-gray-700">{welcome.description}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 ${stat.color} rounded-md flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.label}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {userRole === 'super_admin' && (
            <>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Users className="w-6 h-6 text-blue-600 mb-2" />
                <h4 className="font-medium text-gray-900">Manage Users</h4>
                <p className="text-sm text-gray-600">Add, edit, or remove users</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Crown className="w-6 h-6 text-red-600 mb-2" />
                <h4 className="font-medium text-gray-900">Manage Roles</h4>
                <p className="text-sm text-gray-600">Configure permissions and roles</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <BarChart3 className="w-6 h-6 text-green-600 mb-2" />
                <h4 className="font-medium text-gray-900">System Reports</h4>
                <p className="text-sm text-gray-600">View comprehensive analytics</p>
              </button>
            </>
          )}
          {userRole === 'admin' && (
            <>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Users className="w-6 h-6 text-blue-600 mb-2" />
                <h4 className="font-medium text-gray-900">Manage Users</h4>
                <p className="text-sm text-gray-600">Add, edit, or remove users</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <MapPin className="w-6 h-6 text-green-600 mb-2" />
                <h4 className="font-medium text-gray-900">Manage Bases</h4>
                <p className="text-sm text-gray-600">Configure base operations</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Plane className="w-6 h-6 text-purple-600 mb-2" />
                <h4 className="font-medium text-gray-900">Manage Fleet</h4>
                <p className="text-sm text-gray-600">Add or modify aircraft</p>
              </button>
            </>
          )}
          {userRole === 'base_manager' && (
            <>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Users className="w-6 h-6 text-blue-600 mb-2" />
                <h4 className="font-medium text-gray-900">View Users</h4>
                <p className="text-sm text-gray-600">Check user information</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Plane className="w-6 h-6 text-purple-600 mb-2" />
                <h4 className="font-medium text-gray-900">Manage Fleet</h4>
                <p className="text-sm text-gray-600">Manage base aircraft</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Calendar className="w-6 h-6 text-orange-600 mb-2" />
                <h4 className="font-medium text-gray-900">Manage Services</h4>
                <p className="text-sm text-gray-600">Configure base services</p>
              </button>
            </>
          )}
          {userRole === 'instructor' && (
            <>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Users className="w-6 h-6 text-blue-600 mb-2" />
                <h4 className="font-medium text-gray-900">View Students</h4>
                <p className="text-sm text-gray-600">Check student progress</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Plane className="w-6 h-6 text-purple-600 mb-2" />
                <h4 className="font-medium text-gray-900">Schedule Flight</h4>
                <p className="text-sm text-gray-600">Book training flights</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
                <h4 className="font-medium text-gray-900">Track Progress</h4>
                <p className="text-sm text-gray-600">Monitor student advancement</p>
              </button>
            </>
          )}
          {userRole === 'user' && (
            <>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Plane className="w-6 h-6 text-blue-600 mb-2" />
                <h4 className="font-medium text-gray-900">Book Flight</h4>
                <p className="text-sm text-gray-600">Schedule a new flight</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Calendar className="w-6 h-6 text-green-600 mb-2" />
                <h4 className="font-medium text-gray-900">View Services</h4>
                <p className="text-sm text-gray-600">Browse available services</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
                <h4 className="font-medium text-gray-900">Flight Log</h4>
                <p className="text-sm text-gray-600">View flight history</p>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 