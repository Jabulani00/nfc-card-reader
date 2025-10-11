# Staff Permissions System

## Overview

Staff members now have a permission-based system that controls their ability to approve students. This is managed through the `canApproveStudents` boolean field.

## New Field: canApproveStudents

### User Model Update

```typescript
export interface User {
  // ... existing fields
  canApproveStudents?: boolean; // Staff only - permission to approve students
}
```

**Default Value:** `false` (set during staff registration)

## Permission Levels

### Staff WITHOUT Approval Permission
```typescript
{
  role: "staff",
  canApproveStudents: false  // or undefined
}
```

**Can Access:**
- ✅ My Card page
- ❌ My Students tab (hidden)

**Cannot Do:**
- ❌ View students
- ❌ Approve students
- ❌ Activate/deactivate students

### Staff WITH Approval Permission
```typescript
{
  role: "staff",
  canApproveStudents: true
}
```

**Can Access:**
- ✅ My Card page
- ✅ My Students tab (visible)

**Can Do:**
- ✅ View students in their department
- ✅ Approve students
- ✅ Activate students
- ✅ Deactivate students
- ✅ Search and filter students

## Staff Layout Conditional Tabs

**File:** `app/(staff)/_layout.tsx`

```typescript
// Build tabs based on staff permissions
const baseTabs = [
  { name: 'my-card', label: 'My Card', icon: '💳', path: '/(staff)/my-card' },
];

// Only show students tab if staff has approval permissions
const tabs = user?.canApproveStudents 
  ? [...baseTabs, { name: 'students', label: 'My Students', icon: '👨‍🎓', path: '/(staff)/students' }]
  : baseTabs;
```

**Result:**
- Staff WITHOUT permission: Only sees "My Card" tab
- Staff WITH permission: Sees both "My Card" and "My Students" tabs

## Admin Grant/Remove Permissions

### From Staff Management Page

**File:** `app/(admin)/staff.tsx`

**UI Features:**
- Shows current permission status for each staff member
- ✓ "Can Approve Students" or ✕ "Cannot Approve"
- Button to toggle permission
  - Green "Grant Approval Rights"
  - Orange "Remove Approval Rights"

**Implementation:**
```typescript
const toggleApprovalPermission = async (uid: string, canApprove: boolean) => {
  Alert.alert(
    'Update Permissions',
    canApprove 
      ? 'Grant this staff member permission to approve students?' 
      : 'Remove student approval permissions from this staff member?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          await UserService.updateStaffApprovalPermission(uid, canApprove);
          await fetchStaff();
          Alert.alert('Success', 'Permissions updated successfully');
        }
      }
    ]
  );
};
```

## Staff Students Page Features

**File:** `app/(staff)/students.tsx`

### Department Filter
- Only shows students from staff member's department
- Department displayed in banner
- Student count shown

### Approval Actions (if permitted)
- ✓ Approve - Approve selected students
- Activate - Activate selected students  
- Revoke - Deactivate selected students
- 🔄 Refresh - Reload student list

### Student Information Displayed
- Name and card number
- Email
- Approval status (Pending/Approved)
- Active status (Active/Inactive)
- NFC ID (if assigned)

## Service Methods

### New Method in UserService

```typescript
/**
 * Update staff approval permissions (admin only)
 */
static async updateStaffApprovalPermission(
  uid: string, 
  canApproveStudents: boolean
): Promise<void> {
  await this.updateUser(uid, { canApproveStudents });
}
```

## Security

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Only admins can update canApproveStudents field
      allow update: if request.auth != null && 
                       request.resource.data.diff(resource.data).affectedKeys().hasAny(['canApproveStudents']) &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // Staff with approval permission can update student approval status
      allow update: if request.auth != null &&
                       request.resource.data.diff(resource.data).affectedKeys().hasAny(['isApproved', 'isActive']) &&
                       resource.data.role == 'student' &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.canApproveStudents == true;
    }
  }
}
```

## Workflow Examples

### Admin Grants Permission to Staff

```
1. Admin logs in
   ↓
2. Goes to Staff page
   ↓
3. Sees staff member: "✕ Cannot Approve"
   ↓
4. Clicks "Grant Approval Rights" button
   ↓
5. Confirms action
   ↓
6. canApproveStudents: true is saved
   ↓
7. Staff member now has approval permissions
```

### Staff Member Uses New Permission

```
1. Staff logs in (with canApproveStudents: true)
   ↓
2. Sees "My Students" tab in navigation
   ↓
3. Clicks on "My Students" tab
   ↓
4. Views students from their department
   ↓
5. Selects pending students
   ↓
6. Clicks "✓ Approve"
   ↓
7. Students are approved and can access system
```

### Admin Revokes Permission

```
1. Admin goes to Staff page
   ↓
2. Sees staff member: "✓ Can Approve Students"
   ↓
3. Clicks "Remove Approval Rights" button
   ↓
4. Confirms action
   ↓
5. canApproveStudents: false is saved
   ↓
6. Staff member loses approval permissions
   ↓
7. "My Students" tab disappears from their view
```

## Use Cases

### Department Coordinators
Grant approval permission to department heads or coordinators who need to manage students in their department.

### Teaching Assistants
Grant permission to TAs who help manage student access for specific courses.

### Regular Staff
Don't grant permission to regular staff who only need to access their own card.

## Testing

### Test Permission Grant

1. **Create staff member**
   ```
   Email: coordinator@university.edu
   Role: staff
   Department: Computer Science
   ```

2. **Login as admin**
   - Go to Staff page
   - Should see: "✕ Cannot Approve"
   - Click "Grant Approval Rights"
   - Confirm

3. **Logout and login as staff**
   - Should see "My Students" tab
   - Click tab
   - Should see students from Computer Science department

### Test Permission Revoke

1. **Login as admin**
2. **Go to Staff page**
3. **Find staff with permission**
4. **Click "Remove Approval Rights"**
5. **Staff loses access immediately**

### Test Department Filtering

1. **Create students in different departments**
   - Student A: Computer Science
   - Student B: Engineering
   
2. **Login as staff (Computer Science)**
3. **Go to My Students**
4. **Should only see Student A** (same department)

## Database Migration

### Add Field to Existing Staff

If you have existing staff members, run this once:

```typescript
async function addPermissionField() {
  const staff = await UserService.getUsersByRole('staff');
  
  for (const member of staff) {
    if (member.canApproveStudents === undefined) {
      await UserService.updateUser(member.uid, {
        canApproveStudents: false  // Default to false
      });
    }
  }
  
  console.log('Migration complete');
}
```

## Summary

✅ **New Permission Field:** `canApproveStudents` for staff  
✅ **Conditional UI:** Tab visibility based on permission  
✅ **Admin Control:** Grant/revoke permissions  
✅ **Department Scoped:** Staff only see their department  
✅ **Full Approval Powers:** Staff can approve, activate, deactivate  
✅ **Security Rules:** Only admins can grant permissions  

Staff members now have flexible, department-scoped approval capabilities! 🎉

