# Services Documentation

## Overview

The application now has dedicated service layers for different user roles and operations.

## Service Architecture

```
┌─────────────────────────────────────────┐
│          Application Layer              │
│  (Admin/Staff/Student Screens)          │
└──────────────┬──────────────────────────┘
               │
               ├── AdminService (Admin operations)
               ├── StaffService (Staff operations)
               ├── AuthService (Authentication)
               ├── UserService (CRUD operations)
               └── ImageService (Image upload)
```

## 1. AdminService

**File:** `services/adminService.ts`

### Purpose
Handles all administrative operations for user management, access control, and permissions.

### Methods

#### User Approval

```typescript
// Approve single user
await AdminService.approveUser(uid);

// Approve multiple users
const result = await AdminService.approveBulk([uid1, uid2, uid3]);
// Returns: { success: 2, failed: 1 }

// Approve and activate in one operation
await AdminService.approveAndActivate(uid);

// Approve and activate multiple
const result = await AdminService.approveAndActivateBulk([uid1, uid2]);
```

#### Access Control

```typescript
// Grant access (activate user)
await AdminService.grantAccess(uid);

// Grant access to multiple users
const result = await AdminService.grantAccessBulk([uid1, uid2, uid3]);

// Revoke access (deactivate user)
await AdminService.revokeAccess(uid);

// Revoke access from multiple users
const result = await AdminService.revokeAccessBulk([uid1, uid2, uid3]);
```

#### User Rejection

```typescript
// Reject single user (deactivates)
await AdminService.rejectUser(uid);

// Reject multiple users
const result = await AdminService.rejectBulk([uid1, uid2, uid3]);
```

#### Staff Permissions

```typescript
// Grant student approval rights to staff
await AdminService.grantApprovalRights(staffUid);

// Revoke student approval rights from staff
await AdminService.revokeApprovalRights(staffUid);

// Toggle approval rights (auto-detects current state)
const newValue = await AdminService.toggleApprovalRights(staffUid);
// Returns: true if granted, false if revoked
```

#### NFC Card Management

```typescript
// Assign NFC card to user
await AdminService.assignNfcCard(uid, 'NFC_CARD_001');

// Remove NFC card from user
await AdminService.removeNfcCard(uid);
```

#### Data Retrieval

```typescript
// Get pending approvals
const pendingUsers = await AdminService.getPendingApprovals();

// Get users by department
const users = await AdminService.getUsersByDepartment('Computer Science');

// Get students by department
const students = await AdminService.getStudentsByDepartment('Engineering');

// Get dashboard statistics
const stats = await AdminService.getDashboardStats();
/* Returns:
{
  totalUsers: 150,
  activeUsers: 120,
  pendingApprovals: 10,
  totalStudents: 100,
  totalStaff: 50,
  staffWithApprovalRights: 5
}
*/
```

#### Validation

```typescript
// Check if user can approve others
const canApprove = AdminService.validateUserCanApprove(user);
// Returns: true for admins, true for staff with permission, false otherwise
```

## 2. StaffService

**File:** `services/staffService.ts`

### Purpose
Handles staff-specific operations with department-scoped permissions.

### Methods

#### Department Students

```typescript
// Get students in staff's department
const students = await StaffService.getDepartmentStudents(staffUser);

// Get pending approvals in department
const pending = await StaffService.getDepartmentPendingApprovals(staffUser);
```

#### Student Approval (Department-Scoped)

```typescript
// Approve single student (validates department)
await StaffService.approveStudent(staffUser, studentUid);

// Approve multiple students (validates all)
const result = await StaffService.approveStudentsBulk(
  staffUser,
  [studentUid1, studentUid2]
);
// Automatically skips students not in staff's department
```

#### Student Activation (Department-Scoped)

```typescript
// Activate single student
await StaffService.activateStudent(staffUser, studentUid);

// Activate multiple students
const result = await StaffService.activateStudentsBulk(
  staffUser,
  [studentUid1, studentUid2]
);
```

#### Student Deactivation (Department-Scoped)

```typescript
// Deactivate single student
await StaffService.deactivateStudent(staffUser, studentUid);

// Deactivate multiple students
const result = await StaffService.deactivateStudentsBulk(
  staffUser,
  [studentUid1, studentUid2]
);
```

#### Permission Validation

```typescript
// Check if staff has approval permission
const hasPermission = StaffService.hasApprovalPermission(staffUser);
// Returns: true if canApproveStudents === true
```

### Security Features

**Department Scoping:**
- All operations validate student is in staff's department
- Operations on students from other departments are automatically skipped
- Clear error messages for permission violations

**Permission Checks:**
- Validates `canApproveStudents === true` before operations
- Throws error if staff lacks permission
- Prevents unauthorized approvals

## 3. Return Types

### Bulk Operation Results

All bulk operations return:

```typescript
{
  success: number;  // Number of successful operations
  failed: number;   // Number of failed operations
}
```

**Usage:**
```typescript
const result = await AdminService.approveBulk([uid1, uid2, uid3]);

if (result.failed > 0) {
  Alert.alert(
    'Partial Success',
    `Approved ${result.success} users. ${result.failed} failed.`
  );
} else {
  Alert.alert('Success', `All ${result.success} users approved!`);
}
```

## Usage Examples

### Admin Approving Pending Users

```typescript
// In Admin Approvals page
import { AdminService } from '@/services/adminService';

const approveSelected = async () => {
  try {
    const result = await AdminService.approveBulk(
      Array.from(selectedUserIds)
    );
    
    await refreshList();
    
    if (result.failed === 0) {
      Alert.alert('Success', `Approved ${result.success} users`);
    } else {
      Alert.alert(
        'Partial Success',
        `Approved ${result.success}, failed ${result.failed}`
      );
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to approve users');
  }
};
```

### Admin Managing Staff Permissions

```typescript
// In Admin Staff page
import { AdminService } from '@/services/adminService';

const grantPermission = async (staffUid: string) => {
  try {
    await AdminService.grantApprovalRights(staffUid);
    Alert.alert('Success', 'Staff can now approve students');
    await refreshStaffList();
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

### Staff Approving Department Students

```typescript
// In Staff Students page
import { StaffService } from '@/services/staffService';
import { useAuth } from '@/contexts/AuthContext';

const approveStudents = async () => {
  const { user } = useAuth();
  
  if (!user) return;
  
  try {
    const result = await StaffService.approveStudentsBulk(
      user,
      selectedStudentIds
    );
    
    await refreshList();
    Alert.alert('Success', `Approved ${result.success} students`);
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

## Error Handling

### All Services Include

1. **Try-Catch Blocks**
   - Every method wrapped in try-catch
   - Errors logged to console
   - User-friendly error messages

2. **Validation**
   - Permission checks before operations
   - User existence verification
   - Department scope validation (for staff)

3. **Error Messages**
   - Specific error for each failure scenario
   - Original error message preserved
   - Console logging for debugging

### Example Error Handling

```typescript
try {
  await AdminService.grantApprovalRights(staffUid);
} catch (error) {
  // Error thrown with clear message:
  // "Only staff members can be granted approval rights"
  // "User not found"
  // "Failed to grant approval rights"
}
```

## Service Methods Summary

### AdminService (13 methods)

| Method | Purpose | Returns |
|--------|---------|---------|
| `approveUser(uid)` | Approve single user | void |
| `approveBulk(uids)` | Approve multiple users | { success, failed } |
| `grantAccess(uid)` | Activate user | void |
| `grantAccessBulk(uids)` | Activate multiple users | { success, failed } |
| `revokeAccess(uid)` | Deactivate user | void |
| `revokeAccessBulk(uids)` | Deactivate multiple users | { success, failed } |
| `rejectUser(uid)` | Reject user (deactivate) | void |
| `rejectBulk(uids)` | Reject multiple users | { success, failed } |
| `grantApprovalRights(staffUid)` | Grant staff permission | void |
| `revokeApprovalRights(staffUid)` | Revoke staff permission | void |
| `toggleApprovalRights(staffUid)` | Toggle staff permission | boolean |
| `approveAndActivate(uid)` | Approve + activate | void |
| `approveAndActivateBulk(uids)` | Bulk approve + activate | { success, failed } |
| `assignNfcCard(uid, nfcId)` | Assign NFC card | void |
| `removeNfcCard(uid)` | Remove NFC card | void |
| `getPendingApprovals()` | Get pending users | User[] |
| `getUsersByDepartment(dept)` | Get users by department | User[] |
| `getStudentsByDepartment(dept)` | Get students by dept | User[] |
| `getDashboardStats()` | Get admin statistics | Stats object |
| `validateUserCanApprove(user)` | Check approval permission | boolean |

### StaffService (10 methods)

| Method | Purpose | Returns |
|--------|---------|---------|
| `getDepartmentStudents(staff)` | Get dept students | User[] |
| `approveStudent(staff, uid)` | Approve student (dept check) | void |
| `approveStudentsBulk(staff, uids)` | Bulk approve (dept check) | { success, failed } |
| `activateStudent(staff, uid)` | Activate student (dept check) | void |
| `activateStudentsBulk(staff, uids)` | Bulk activate (dept check) | { success, failed } |
| `deactivateStudent(staff, uid)` | Deactivate student (dept check) | void |
| `deactivateStudentsBulk(staff, uids)` | Bulk deactivate (dept check) | { success, failed } |
| `hasApprovalPermission(staff)` | Check permission | boolean |
| `getDepartmentPendingApprovals(staff)` | Get dept pending | User[] |

## Import Methods

### Recommended Import

```typescript
// Import from index
import { AdminService, StaffService, UserService } from '@/services';

// Or import directly
import { AdminService } from '@/services/adminService';
import { StaffService } from '@/services/staffService';
```

### Available Services

```typescript
export { AuthService } from './authService';
export { UserService } from './userService';
export { ImageService } from './imageService';
export { AdminService } from './adminService';
export { StaffService } from './staffService';
```

## Benefits

### Separation of Concerns
- ✅ Admin logic separated from staff logic
- ✅ Role-specific validations
- ✅ Cleaner code organization

### Security
- ✅ Permission checks in services
- ✅ Department scoping for staff
- ✅ Input validation
- ✅ Error handling

### Maintainability
- ✅ Single source of truth for operations
- ✅ Reusable across components
- ✅ Easy to test
- ✅ Consistent error handling

### Better UX
- ✅ Partial success reporting (X succeeded, Y failed)
- ✅ Clear error messages
- ✅ Logging for debugging
- ✅ Bulk operations for efficiency

## Testing

### Test AdminService

```typescript
// Test approve
await AdminService.approveUser('user123');

// Test bulk approve with partial failure
const result = await AdminService.approveBulk([
  'validUser1',
  'validUser2',
  'invalidUser'  // This will fail
]);
console.log(result); // { success: 2, failed: 1 }

// Test staff permissions
await AdminService.grantApprovalRights('staff123');
await AdminService.revokeApprovalRights('staff123');
```

### Test StaffService

```typescript
// Get staff user
const staffUser = await UserService.getUserByAuthUid(authUid);

// Test department students
const students = await StaffService.getDepartmentStudents(staffUser);

// Test approve with wrong department (should fail)
try {
  await StaffService.approveStudent(staffUser, 'studentFromOtherDept');
} catch (error) {
  // Error: "Can only approve students in your department"
}
```

## Migration from Old Code

### Before (Direct UserService calls)

```typescript
// Old way - no error reporting for bulk ops
const promises = userIds.map(uid => UserService.approveUser(uid));
await Promise.all(promises);
```

### After (Using AdminService)

```typescript
// New way - tracks success/failure
const result = await AdminService.approveBulk(userIds);
if (result.failed > 0) {
  Alert.alert('Partial Success', `${result.success} succeeded, ${result.failed} failed`);
}
```

## Summary

✅ **AdminService** - Complete admin functionality  
✅ **StaffService** - Department-scoped operations  
✅ **Bulk Operations** - Success/failure tracking  
✅ **Permission Validation** - Built into services  
✅ **Department Scoping** - Automatic for staff  
✅ **Error Handling** - Consistent throughout  
✅ **Better UX** - Partial success reporting  

All admin and staff operations now use dedicated, secure service methods! 🎉

