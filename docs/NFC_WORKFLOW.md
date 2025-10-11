# NFC Card Assignment Workflow

## Overview

NFC card IDs are now assigned by admins **after** user approval, not during registration. This ensures proper control and prevents users from self-assigning NFC access.

## Updated Workflow

### 1. User Registration (No NFC Required)

```
User registers → Fills basic info → No NFC ID field → Registration complete
```

**Fields Required:**
- ✅ First Name
- ✅ Last Name
- ✅ Email
- ✅ Password
- ✅ Card Number (Student/Staff ID)
- ✅ Department
- ✅ Role (Student/Staff)
- ⚪ Profile Picture (Optional)
- ❌ NFC ID (Not collected at registration)

**User Document Created:**
```typescript
{
  uid: "auto-generated",
  authUid: "firebase-auth-uid",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  cardNumber: "STU12345",
  nfcId: undefined,  // ← Not assigned yet
  imageUrl: "https://...",
  role: "student",
  department: "Computer Science",
  isActive: true,
  isApproved: false,  // ← Pending admin approval
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 2. Admin Approval & NFC Assignment

**Admin Workflow:**

```
1. Admin reviews pending users
   ↓
2. Admin approves user (sets isApproved: true)
   ↓
3. Admin assigns NFC card ID
   ↓
4. User can now use NFC card at gates
```

**Admin Functions:**

```typescript
// 1. Get pending approvals
const pendingUsers = await UserService.getPendingApprovals();

// 2. Approve user
await UserService.approveUser(userId);

// 3. Assign NFC ID (checks for duplicates)
await UserService.assignNfcId(userId, "NFC_CARD_12345");
```

### 3. Gate Access Control

```typescript
// At gate, scan NFC card
const nfcId = await scanNFCCard();

// Look up user by NFC ID
const user = await UserService.getUserByNfcId(nfcId);

if (!user) {
  return { access: false, reason: "Unknown NFC card" };
}

if (!user.nfcId) {
  return { access: false, reason: "NFC card not assigned" };
}

if (!user.isApproved) {
  return { access: false, reason: "User not approved" };
}

if (!user.isActive) {
  return { access: false, reason: "Account deactivated" };
}

// Grant access
return { 
  access: true, 
  user: {
    name: `${user.firstName} ${user.lastName}`,
    role: user.role,
    imageUrl: user.imageUrl
  }
};
```

## Implementation Details

### User Model Changes

```typescript
export interface User {
  // ... other fields
  nfcId?: string;  // ← Now optional (undefined until assigned)
}

export interface CreateUserData {
  // ... other fields
  // nfcId removed - not collected during registration
}
```

### UserService New Method

```typescript
/**
 * Assign NFC ID to user (admin only)
 * Validates uniqueness before assignment
 */
static async assignNfcId(uid: string, nfcId: string): Promise<void> {
  // Check if NFC ID is already assigned
  const existingUser = await this.getUserByNfcId(nfcId);
  if (existingUser && existingUser.uid !== uid) {
    throw new Error('NFC ID already assigned to another user');
  }
  
  // Assign NFC ID
  await this.updateUser(uid, { nfcId });
}
```

### Signup Form Changes

**Removed:**
- ❌ NFC ID input field
- ❌ NFC ID state variable
- ❌ NFC ID validation

**Added:**
- ✅ Helper text: "NFC card will be assigned after admin approval"

## Benefits of This Approach

### Security
- ✅ Users cannot self-assign NFC IDs
- ✅ Admin controls all physical access
- ✅ Prevents unauthorized NFC card registration

### Workflow
- ✅ Cleaner registration process (fewer fields)
- ✅ Centralized NFC card management
- ✅ Easy to track assigned vs unassigned cards

### Flexibility
- ✅ Can assign/reassign NFC cards anytime
- ✅ Can revoke access by removing NFC ID
- ✅ Can reuse NFC cards for different users

## Admin Dashboard Implementation (Future)

**Approval Screen:**
```
┌────────────────────────────────────────┐
│ Pending Approvals                      │
├────────────────────────────────────────┤
│ John Doe (student)                     │
│ Email: john@example.com                │
│ Department: Computer Science           │
│ Card Number: STU12345                  │
│                                        │
│ [Approve] [Reject]                     │
│                                        │
│ After approval:                        │
│ NFC ID: [____________]  [Assign]       │
└────────────────────────────────────────┘
```

**User Management Screen:**
```
┌────────────────────────────────────────┐
│ Active Users                           │
├────────────────────────────────────────┤
│ Jane Smith (staff) ✓ Approved          │
│ NFC ID: NFC_CARD_001                   │
│ [Edit] [Deactivate] [Change NFC]      │
│                                        │
│ Bob Johnson (student) ✓ Approved       │
│ NFC ID: Not assigned                   │
│ [Assign NFC Card]                      │
└────────────────────────────────────────┘
```

## API Examples

### For Mobile App (Admin)

```typescript
// Approve user and assign NFC in one flow
async function approveAndAssignNfc(userId: string, nfcId: string) {
  try {
    // Step 1: Approve user
    await UserService.approveUser(userId);
    
    // Step 2: Assign NFC card
    await UserService.assignNfcId(userId, nfcId);
    
    Alert.alert('Success', 'User approved and NFC card assigned');
  } catch (error) {
    Alert.alert('Error', error.message);
  }
}
```

### For Gate System

```typescript
// Scan and verify NFC card
async function verifyNfcAccess(nfcId: string) {
  try {
    const user = await UserService.getUserByNfcId(nfcId);
    
    if (!user?.nfcId || !user.isApproved || !user.isActive) {
      return { granted: false };
    }
    
    // Log access
    await logAccess(user.uid, nfcId);
    
    return { 
      granted: true,
      userName: `${user.firstName} ${user.lastName}`,
      role: user.role
    };
  } catch (error) {
    return { granted: false, error: error.message };
  }
}
```

## Database Structure

### Before Approval
```json
{
  "users/user123": {
    "firstName": "John",
    "lastName": "Doe",
    "cardNumber": "STU12345",
    "nfcId": null,           // ← Not assigned
    "isApproved": false,     // ← Pending
    "isActive": true
  }
}
```

### After Approval & NFC Assignment
```json
{
  "users/user123": {
    "firstName": "John",
    "lastName": "Doe",
    "cardNumber": "STU12345",
    "nfcId": "NFC_CARD_001", // ← Assigned by admin
    "isApproved": true,      // ← Approved
    "isActive": true
  }
}
```

## Security Rules Update

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Users cannot modify their own NFC ID
      allow update: if request.auth != null && 
                       request.auth.uid == resource.data.authUid &&
                       !request.resource.data.diff(resource.data).affectedKeys().hasAny(['nfcId', 'isApproved']);
      
      // Only admins can assign NFC IDs and approve users
      allow update: if request.auth != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Migration for Existing Users

If you have existing users without NFC IDs:

```typescript
// Run this once to add nfcId field to all users
async function migrateUsers() {
  const users = await UserService.getAllUsers();
  
  for (const user of users) {
    if (user.nfcId === undefined) {
      await UserService.updateUser(user.uid, {
        nfcId: null  // Explicitly set to null
      });
    }
  }
  
  console.log('Migration complete');
}
```

## Testing Checklist

- [ ] Register new user without NFC ID
- [ ] Verify user document has nfcId: undefined
- [ ] Admin approves user
- [ ] Admin assigns NFC ID
- [ ] Try to assign duplicate NFC ID (should fail)
- [ ] Scan NFC card at gate (should grant access)
- [ ] Deactivate user
- [ ] Scan NFC card again (should deny access)
- [ ] Remove NFC ID from user
- [ ] Scan NFC card (should show "not assigned")

## Summary

✅ **NFC IDs are now admin-assigned after approval**  
✅ **Registration is simpler (no NFC field)**  
✅ **Better security and access control**  
✅ **Centralized NFC card management**  
✅ **Flexible assignment/reassignment**  

This workflow ensures that only approved users with properly assigned NFC cards can access the system through physical gates.

