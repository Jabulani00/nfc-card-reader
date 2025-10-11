# Admin Dashboard Functionality

## Overview

The admin dashboard now has full Firebase integration for managing user approvals and access control.

## Features Implemented

### 1. Approvals Page ✅

**File:** `app/(admin)/approvals.tsx`

**Functionality:**
- ✅ Fetches pending approvals from Firestore
- ✅ Displays users waiting for approval
- ✅ Approve/reject individual or multiple users
- ✅ Bulk approve functionality
- ✅ Bulk reject (deactivate) functionality
- ✅ Reject all pending users
- ✅ Search and filter pending users
- ✅ Real-time refresh

**User Flow:**
```
User registers → isApproved: false → Shows in Approvals page → Admin approves → isApproved: true → User can access system
```

### 2. Students Page ✅

**File:** `app/(admin)/students.tsx`

**Functionality:**
- ✅ Fetches all students from Firestore
- ✅ Displays student list with status
- ✅ Activate/deactivate students
- ✅ Bulk activation
- ✅ Bulk deactivation
- ✅ Search and filter students
- ✅ Shows approval status
- ✅ Shows NFC ID if assigned
- ✅ Real-time refresh

### 3. Staff Page ✅

**File:** `app/(admin)/staff.tsx`

**Functionality:**
- ✅ Fetches all staff from Firestore
- ✅ Displays staff list with status
- ✅ Activate/deactivate staff members
- ✅ Bulk activation
- ✅ Bulk deactivation
- ✅ Search and filter staff
- ✅ Shows approval status
- ✅ Shows NFC ID if assigned
- ✅ Real-time refresh

## Firebase Integration

### Services Used

All pages use `UserService` methods:

```typescript
// Approvals Page
UserService.getPendingApprovals()  // Get unapproved users
UserService.approveUser(uid)        // Approve user
UserService.deactivateUser(uid)     // Reject/deactivate user

// Students Page
UserService.getUsersByRole('student')  // Get all students
UserService.updateUser(uid, { isActive: true })   // Activate
UserService.deactivateUser(uid)                   // Deactivate

// Staff Page
UserService.getUsersByRole('staff')    // Get all staff
UserService.updateUser(uid, { isActive: true })   // Activate
UserService.deactivateUser(uid)                   // Deactivate
```

## Admin Actions

### Approve User

**What it does:**
- Sets `isApproved: true` in Firestore
- User can now login to the system
- Updates `updatedAt` timestamp

**Code:**
```typescript
const approveUser = async (uid: string) => {
  await UserService.approveUser(uid);
  // User can now access the system
};
```

**UI:**
- Select users with checkboxes
- Click "✓ Approve (X)" button
- Confirmation dialog appears
- Users are approved in bulk
- List refreshes automatically

### Reject User

**What it does:**
- Sets `isActive: false` in Firestore
- User cannot login (even if approved)
- Updates `updatedAt` timestamp

**Code:**
```typescript
const rejectUser = async (uid: string) => {
  await UserService.deactivateUser(uid);
  // User account is deactivated
};
```

**UI:**
- Select users with checkboxes
- Click "✕ Reject (X)" button
- Confirmation dialog appears
- Users are deactivated
- List refreshes automatically

### Activate User

**What it does:**
- Sets `isActive: true` in Firestore
- User can login (if also approved)
- Re-enables previously deactivated accounts

**Code:**
```typescript
const activateUser = async (uid: string) => {
  await UserService.updateUser(uid, { isActive: true });
};
```

### Deactivate User

**What it does:**
- Sets `isActive: false` in Firestore
- User immediately loses access
- Can be reactivated later

**Code:**
```typescript
const deactivateUser = async (uid: string) => {
  await UserService.deactivateUser(uid);
};
```

## User States

### Complete User Lifecycle

```
1. Registration
   ↓
   isApproved: false
   isActive: true
   Status: Pending Approval
   
2. Admin Approves
   ↓
   isApproved: true
   isActive: true
   Status: Active - Can Access System
   
3. Admin Deactivates (if needed)
   ↓
   isApproved: true
   isActive: false
   Status: Deactivated - No Access
   
4. Admin Reactivates (if needed)
   ↓
   isApproved: true
   isActive: true
   Status: Active - Can Access System
```

### Access Matrix

| isApproved | isActive | Can Login? | Shows In |
|-----------|----------|------------|----------|
| false | true | ❌ No | Approvals page |
| true | true | ✅ Yes | Students/Staff page (Active) |
| true | false | ❌ No | Students/Staff page (Inactive) |
| false | false | ❌ No | Approvals page (Rejected) |

## UI Features

### Common to All Pages

1. **Loading State**
   - Shows spinner while fetching data
   - "Loading..." message

2. **Empty State**
   - Shows when no users found
   - Friendly message and icon

3. **Search**
   - Real-time filtering
   - Searches name, email, card number
   - Updates results instantly

4. **Multi-Select**
   - Checkbox for each user
   - "Select All" option
   - Bulk operations on selected users

5. **Refresh**
   - 🔄 Refresh button
   - Reloads data from Firestore
   - Updates UI with latest changes

6. **Loading States**
   - Buttons disabled during operations
   - Shows "..." while processing
   - Prevents double-clicks

### Approvals Page Specific

**Buttons:**
- ✓ Approve (X) - Green - Approve selected users
- ✕ Reject (X) - Orange - Reject selected users
- Reject All - Red - Reject all pending users
- 🔄 Refresh - Blue - Reload pending users

**Information Shown:**
- Full name
- Email
- Card number
- Department
- Role badge (Student/Staff)
- Registration date

### Students/Staff Pages Specific

**Buttons:**
- + Add Student/Staff - Primary - Add new user
- Activate (X) - Green - Activate selected users
- Revoke (X) - Red - Deactivate selected users
- 🔄 Refresh - Blue - Reload users

**Information Shown:**
- Full name
- Email
- Card number
- Department
- Status badge (Active/Inactive)
- Approval status (✓ Approved / ⏳ Pending)
- NFC ID (if assigned)

## Error Handling

All operations include error handling:

```typescript
try {
  await UserService.approveUser(uid);
  Alert.alert('Success', 'User approved');
} catch (error) {
  console.error('Error approving user:', error);
  Alert.alert('Error', 'Failed to approve user');
}
```

**Error Scenarios:**
- Network failure
- Permission denied
- User not found
- Firestore errors

All errors are:
- Logged to console
- Shown to admin via Alert
- Don't crash the app

## Performance

### Optimizations

1. **Batch Operations**
   - Uses `Promise.all()` for bulk operations
   - All updates run in parallel
   - Fast even with many users

2. **Efficient Queries**
   - Uses Firestore indexes
   - Only fetches needed data
   - Filtered on client side

3. **Loading States**
   - Prevents multiple simultaneous operations
   - Shows feedback to user
   - Disables buttons during processing

## Testing

### Test Approvals

1. Register a new user (student/staff)
2. Login as admin
3. Go to Approvals page
4. Should see the new user
5. Select user and click Approve
6. User should disappear from list
7. User can now login

### Test Activation/Deactivation

1. Login as admin
2. Go to Students or Staff page
3. Select an active user
4. Click "Revoke"
5. User status should change to "Inactive"
6. Try to login as that user → Should fail
7. Reactivate the user
8. User can login again

### Test Bulk Operations

1. Register multiple users
2. Go to Approvals
3. Click "Select All"
4. Click "Approve (X)"
5. All users should be approved at once

## Security

### Admin-Only Access

All these operations require admin role:

```typescript
// In Firestore security rules
match /users/{userId} {
  allow update: if request.auth != null && 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### Validation

- Check user exists before update
- Validate inputs
- Handle errors gracefully
- Log all admin actions

## Future Enhancements

### Approvals Page
- [ ] Add notes/comments to approvals
- [ ] Email notifications on approval/rejection
- [ ] Bulk NFC ID assignment
- [ ] Export pending users list
- [ ] Approval history/audit log

### Students/Staff Pages
- [ ] Edit user details
- [ ] Assign/change NFC IDs inline
- [ ] View user activity history
- [ ] Export user lists
- [ ] Advanced filters (by department, status, etc.)
- [ ] Sort options (by name, date, status)

### General
- [ ] Real-time updates (listen to Firestore changes)
- [ ] Pagination for large lists
- [ ] Activity logs
- [ ] Analytics dashboard
- [ ] Bulk import from CSV
- [ ] Email notifications

## Summary

✅ **Approvals Page** - Fully functional with Firebase  
✅ **Students Page** - Complete activation/deactivation  
✅ **Staff Page** - Complete activation/deactivation  
✅ **Bulk Operations** - Approve/reject/activate multiple users  
✅ **Search** - Filter users by name, email, card number  
✅ **Error Handling** - Proper error messages and logging  
✅ **Loading States** - Visual feedback during operations  
✅ **Refresh** - Manual data reload option  

The admin dashboard is now fully operational with real Firebase data! 🎉

