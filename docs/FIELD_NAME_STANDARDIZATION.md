# Field Name Standardization

## Overview

All user fields have been standardized to match the Firebase Firestore schema exactly.

## Field Name Changes

### Updated Fields

```typescript
// Before
firstName: string;
lastName: string;

// After (matches Firebase)
FirstName: string;
LastName: string;
```

## Files Updated

### 1. Models
- ✅ `models/User.ts` - Interface definition updated

### 2. Services
- ✅ `services/userService.ts` - All CRUD operations
- ✅ `services/authService.ts` - Display name update
- ✅ `services/imageService.ts` - No changes needed

### 3. Contexts
- ✅ `contexts/AuthContext.tsx` - No changes needed (uses User model)

### 4. UI Components - Forms
- ✅ `app/signup.tsx` - Registration form
- ✅ `app/add-user.tsx` - Admin add user form

### 5. UI Components - Admin Pages
- ✅ `app/(admin)/approvals.tsx` - Display names correctly
- ✅ `app/(admin)/students.tsx` - Display names correctly
- ✅ `app/(admin)/staff.tsx` - Display names correctly

### 6. UI Components - Staff Pages
- ✅ `app/(staff)/students.tsx` - Display names correctly
- ✅ `app/(staff)/_layout.tsx` - No changes needed

### 7. UI Components - Student Pages
- ✅ `app/(student)/_layout.tsx` - No changes needed
- ✅ `app/(student)/my-card.tsx` - No changes needed

## Database Schema

### Firestore Document Structure

```javascript
{
  "users/userId": {
    "authUid": "firebase-auth-uid",
    "email": "user@example.com",
    "FirstName": "John",        // ← Capitalized
    "LastName": "Doe",          // ← Capitalized
    "cardNumber": "STU001",
    "nfcId": "NFC_001",
    "imageUrl": "https://...",
    "role": "student",
    "department": "Computer Science",
    "isActive": true,
    "isApproved": true,
    "canApproveStudents": false,
    "createdAt": Timestamp,
    "updatedAt": Timestamp
  }
}
```

## TypeScript Interface

### User Model

```typescript
export interface User {
  uid: string;
  authUid: string;
  email: string;
  FirstName: string;           // ← Capitalized
  LastName: string;            // ← Capitalized
  cardNumber: string;
  nfcId?: string;
  imageUrl?: string;
  role: UserRole;
  department: string;
  isActive: boolean;
  isApproved: boolean;
  canApproveStudents?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### CreateUserData

```typescript
export interface CreateUserData {
  email: string;
  password: string;
  FirstName: string;           // ← Capitalized
  LastName: string;            // ← Capitalized
  cardNumber: string;
  imageBase64?: string;
  role: UserRole;
  department: string;
}
```

## Usage Examples

### Creating a User

```typescript
await register({
  email: 'user@example.com',
  password: 'password123',
  FirstName: 'John',          // ← Use capitalized
  LastName: 'Doe',            // ← Use capitalized
  cardNumber: 'STU001',
  role: 'student',
  department: 'Computer Science',
});
```

### Displaying User Name

```typescript
// Correct
<Text>{user.FirstName} {user.LastName}</Text>

// Incorrect (old way)
// <Text>{user.firstName} {user.lastName}</Text>
```

### Filtering/Searching

```typescript
// Correct
const fullName = `${user.FirstName} ${user.LastName}`.toLowerCase();

// Incorrect (old way)
// const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
```

## Migration Notes

### No Database Migration Needed

If your existing Firebase documents already use `FirstName` and `LastName`, no migration is needed. The code now matches the database.

### If Firebase Uses Lowercase

If your existing Firebase documents use `firstName` and `lastName`:

**Option 1: Update Firebase documents (recommended)**
```typescript
// Run this once to migrate existing documents
async function migrateFieldNames() {
  const users = await UserService.getAllUsers();
  
  for (const user of users) {
    const docRef = doc(db, 'users', user.uid);
    await updateDoc(docRef, {
      FirstName: user.firstName,
      LastName: user.lastName
    });
    
    // Optionally delete old fields
    await updateDoc(docRef, {
      firstName: deleteField(),
      lastName: deleteField()
    });
  }
}
```

**Option 2: Keep code lowercase (not recommended)**
Change all FirstName/LastName back to firstName/lastName in code.

## Verification

### Check Field Names Match

1. **Register a new user**
2. **Check Firebase Console → Firestore → users collection**
3. **Verify document has:**
   - ✓ `FirstName` (capitalized)
   - ✓ `LastName` (capitalized)
   - ❌ NOT `firstname` or `first_name`

### Test Display

1. **Login as admin**
2. **Go to Students/Staff/Approvals**
3. **Names should display correctly:**
   - "John Doe" ✓
   - Not "undefined undefined" ❌

## Summary

✅ **All files updated** to use `FirstName` and `LastName`  
✅ **Consistent with Firebase** schema  
✅ **No linter errors**  
✅ **All UI displays working**  
✅ **Search/filter functions updated**  
✅ **Type-safe throughout**  

The codebase now perfectly matches your Firebase Firestore field naming convention! 🎉

