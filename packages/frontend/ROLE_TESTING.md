# Role Testing System

This document describes the comprehensive role testing system implemented for the Cruiser Aviation Platform, allowing developers and administrators to test different user roles and their associated permissions.

## Overview

The role testing system provides a unified way to test and manage user roles across the platform, ensuring consistent behavior and proper access control for different user types.

**Availability:**
- **Development**: Available for all users
- **Production**: Available only for superadmin users

## Roles and Permissions

### Available Roles

1. **User** (`user`)
   - Basic pilot access
   - View dashboard, flights, fleet, bases, services
   - Manage personal profile
   - No administrative capabilities

2. **Instructor** (`instructor`)
   - Flight instructor access
   - All user capabilities plus student management
   - View and manage flight schedules
   - No base/fleet/service management

3. **Base Manager** (`base_manager`)
   - Base operations management
   - Full base management capabilities
   - Manage aircraft and services at the base
   - View user information
   - No role management or reporting

4. **Admin** (`admin`)
   - System administration
   - Full user, base, fleet, and service management
   - Access to system reports
   - No role management

5. **Super Admin** (`super_admin`)
   - Full system control
   - All capabilities including role management
   - **Can edit role capabilities for testing (development and production)**
   - Full reporting and analytics access

## Components

### RoleSwitcher Component
- **Location**: `src/components/RoleSwitcher.tsx`
- **Purpose**: Provides a dropdown interface to switch between different user roles
- **Features**:
  - Role selection dropdown
  - Visual role indicators with icons
  - Role testing guide access
  - Persistent role storage in localStorage

### RoleTestingGuide Component
- **Location**: `src/components/RoleTestingGuide.tsx`
- **Purpose**: Comprehensive guide showing capabilities for each role
- **Features**:
  - Visual role selection with icons and descriptions
  - Detailed capability breakdown for each role
  - **NEW**: Role editing capabilities for superadmin users
  - **NEW**: "Update Roles" button in header for superadmin
  - **NEW**: Click-to-toggle capability editing
  - **NEW**: Confirmation modal for discarding changes
  - **NEW**: Save/Cancel functionality with change tracking

### useRoleTesting Hook
- **Location**: `src/hooks/useRoleTesting.ts`
- **Purpose**: Centralized role management and permission checking
- **Features**:
  - Role state management
  - Permission checking methods
  - Accessible sections calculation
  - **NEW**: Dynamic role capabilities management
  - **NEW**: Custom role capabilities storage in localStorage
  - **NEW**: Methods to update and reset role capabilities

### UnifiedDashboardOverview Component
- **Location**: `src/components/UnifiedDashboardOverview.tsx`
- **Purpose**: Adaptive dashboard content based on user role
- **Features**:
  - Role-specific welcome messages
  - Role-appropriate statistics
  - Quick action buttons based on permissions
  - Consistent layout across all roles

## Role Editing Features (Super Admin Only)

### Overview
Super admin users can now edit role capabilities directly through the Role Testing Guide interface. This allows for dynamic testing of different permission configurations without code changes.

### How to Use Role Editing

1. **Access Role Editing**:
   - Switch to Super Admin role using the role switcher
   - Open the Role Testing Guide
   - Click the "Update Roles" button in the header

2. **Edit Capabilities**:
   - Select any role from the role grid
   - Click on individual capabilities to toggle their access
   - Visual feedback shows which capabilities are accessible/inaccessible
   - Changes are tracked and require saving

3. **Save Changes**:
   - Click "Save Changes" to persist modifications
   - Changes are stored in localStorage and immediately applied
   - Success toast notification confirms the update

4. **Cancel Changes**:
   - Click "Cancel" to discard unsaved changes
   - If changes exist, a confirmation modal appears
   - Choose to continue editing or discard all changes

### Technical Implementation

#### Role Capabilities Storage
```typescript
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
```

#### Permission Mapping
The system maps feature names to permission strings:
- `View Dashboard` → `dashboard:read`
- `Manage Users` → `users:read`, `users:write`
- `Manage Bases` → `bases:read`, `bases:write`
- etc.

#### State Management
- Role capabilities are stored in localStorage as `custom_role_capabilities`
- Default capabilities are preserved and can be restored
- Changes are immediately reflected in permission checking

## Usage

### For Developers

1. **Testing Different Roles**:
   ```typescript
   import { useRoleTesting } from './hooks/useRoleTesting';
   
   const { currentRole, setCurrentRole, hasPermission } = useRoleTesting();
   
   // Check specific permissions
   if (hasPermission('users:write')) {
     // Show user management features
   }
   ```

2. **Conditional Rendering**:
   ```typescript
   const { getAccessibleSections } = useRoleTesting();
   const accessibleSections = getAccessibleSections();
   
   return (
     <nav>
       {accessibleSections.includes('users') && (
         <Link to="/admin/users">User Management</Link>
       )}
     </nav>
   );
   ```

### For Administrators

1. **Testing Role Permissions**:
   - **Development**: Available for all users
   - **Production**: Available only for superadmin users
   - Use the role switcher to change roles
   - Navigate through the application
   - Verify that only appropriate features are visible
   - Check that restricted areas are properly hidden

2. **Customizing Role Capabilities** (Super Admin only):
   - **Available in both development and production**
   - Open Role Testing Guide as super admin
   - Click "Update Roles" to enter editing mode
   - Modify capabilities by clicking on them
   - Save changes to apply new permissions
   - Test the modified roles immediately

## Best Practices

### Development
1. **Always check permissions** before rendering sensitive components
2. **Use the role testing system** during development to verify access control
3. **Test all roles** to ensure proper functionality
4. **Document role-specific features** in component comments

### Testing
1. **Test each role** thoroughly before deployment
2. **Verify permission boundaries** are properly enforced
3. **Check that role changes** persist correctly
4. **Test edge cases** like invalid roles or missing permissions

### Role Management
1. **Use the editing interface** for temporary testing only
2. **Document custom role configurations** if used extensively
3. **Reset to defaults** when testing is complete
4. **Backup custom configurations** if needed for future reference

## Integration with Existing Components

The role testing system integrates seamlessly with existing components:

- **AppLayout**: Uses role-based menu generation
- **UnifiedDashboard**: Adapts content based on current role
- **Admin Components**: Check permissions before rendering
- **Navigation**: Filters menu items based on accessible sections

## Troubleshooting

### Common Issues

1. **Role not persisting**:
   - Check localStorage for `test_role` key
   - Verify role name is valid

2. **Permissions not updating**:
   - Clear localStorage and refresh
   - Check that role capabilities are properly loaded

3. **Editing not working**:
   - Ensure you're logged in as super admin
   - Check that the role testing guide is open
   - Verify you're in editing mode

### Reset Options

1. **Reset current role**: Use role switcher to change roles
2. **Reset all custom capabilities**: Use reset function in role testing guide
3. **Clear all testing data**: Clear localStorage completely

## Future Enhancements

- Backend integration for persistent role management
- Role templates for common configurations
- Bulk role capability updates
- Role inheritance and custom role creation
- Audit logging for role changes 