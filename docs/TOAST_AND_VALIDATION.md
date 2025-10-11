# Toast Notifications & Card Number Validation

## Summary of Changes

### 1. Fixed NFC ID Firestore Error ✅

**Problem:** Firestore doesn't allow `undefined` values in documents.

**Solution:** Don't include the `nfcId` field at all when creating user documents.

```typescript
// Before (❌ Error)
const newUser = {
  nfcId: undefined,  // Firestore rejects this
  // ... other fields
};

// After (✅ Works)
const newUserData: any = {
  // nfcId not included at all
  // ... other fields
};

// Only add fields that have values
if (imageUrl) {
  newUserData.imageUrl = imageUrl;
}
```

### 2. Added Card Number Validation ✅

**Feature:** Prevents duplicate card numbers during registration.

**Implementation:**
```typescript
static async createUser(authUid: string, userData: Omit<CreateUserData, 'password'>): Promise<User> {
  // Check for duplicate card number
  const existingCard = await this.getUserByCardNumber(userData.cardNumber);
  if (existingCard) {
    throw new Error('Card number already exists');
  }
  
  // Continue with user creation...
}
```

**New Method:**
```typescript
/**
 * Get user by card number
 * Used for duplicate checking during registration
 */
static async getUserByCardNumber(cardNumber: string): Promise<User | null> {
  const q = query(
    collection(db, USERS_COLLECTION),
    where('cardNumber', '==', cardNumber)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  return mapUserData(querySnapshot.docs[0]);
}
```

### 3. Implemented Toast Notifications ✅

**Replaced:** `Alert.alert()` (native alerts)  
**With:** `Toast.show()` (elegant toast notifications)

**Benefits:**
- ✅ Non-blocking (user can continue interacting)
- ✅ Auto-dismisses after timeout
- ✅ Better UX with success/error colors
- ✅ More modern and mobile-friendly
- ✅ Consistent across all screens

## Toast Examples

### Success Toast
```typescript
Toast.show({
  type: 'success',
  text1: 'Registration Successful',
  text2: 'Your account has been created',
});
```

### Error Toast
```typescript
Toast.show({
  type: 'error',
  text1: 'Duplicate Card Number',
  text2: 'This card number is already registered',
});
```

### Info Toast
```typescript
Toast.show({
  type: 'info',
  text1: 'Processing',
  text2: 'Please wait...',
});
```

## Files Updated

### 1. `services/userService.ts`
- ✅ Fixed NFC ID creation (don't include if undefined)
- ✅ Added `getUserByCardNumber()` method
- ✅ Added duplicate card number validation
- ✅ Better error handling

### 2. `app/signup.tsx`
- ✅ Imported `react-native-toast-message`
- ✅ Replaced all `Alert.alert()` with `Toast.show()`
- ✅ Added specific error messages for:
  - Missing fields
  - Password mismatch
  - Weak password
  - Duplicate card number
  - Duplicate email
- ✅ Success toast on registration
- ✅ Added `<Toast />` component

### 3. `app/login.tsx`
- ✅ Imported `react-native-toast-message`
- ✅ Replaced alerts with toasts
- ✅ Success toast on login
- ✅ Error toast for invalid credentials
- ✅ Added `<Toast />` component

### 4. `app/forgot-password.tsx`
- ✅ Imported `react-native-toast-message`
- ✅ Replaced alerts with toasts
- ✅ Success toast when email sent
- ✅ Error toast for failures
- ✅ Added `<Toast />` component

## Error Handling Matrix

### Signup Errors

| Error Type | Toast Title | Toast Message |
|-----------|-------------|---------------|
| Missing fields | "Missing Fields" | "Please fill in all required fields" |
| Password mismatch | "Password Mismatch" | "Passwords do not match" |
| Weak password | "Weak Password" | "Password must be at least 6 characters" |
| Duplicate card | "Duplicate Card Number" | "This card number is already registered" |
| Duplicate email | "Email Already Used" | "This email is already registered" |
| Generic error | "Registration Failed" | Error message from exception |

### Login Errors

| Error Type | Toast Title | Toast Message |
|-----------|-------------|---------------|
| Missing fields | "Missing Fields" | "Please fill in all fields" |
| Invalid credentials | "Login Failed" | "Invalid credentials" |
| Account deactivated | "Login Failed" | "Your account has been deactivated" |
| Pending approval | "Login Failed" | "Your account is pending approval" |

### Password Reset Errors

| Error Type | Toast Title | Toast Message |
|-----------|-------------|---------------|
| Missing email | "Missing Email" | "Please enter your email address" |
| Email sent | "Email Sent" | "Check your inbox for reset instructions" |
| Failed | "Error" | Error message from exception |

## Firestore Indexes Required

### 1. Card Number Index (New)

Create an index for fast card number lookups:

**Collection:** `users`  
**Fields:**
- `cardNumber` (Ascending)

**Or composite index:**
- `cardNumber` (Ascending)
- `isActive` (Ascending)

**Firebase Console:**
```
1. Go to Firestore
2. Click "Indexes" tab
3. Click "Create Index"
4. Collection: users
5. Add field: cardNumber (Ascending)
6. Create Index
```

### 2. NFC ID Index (Existing)

**Collection:** `users`  
**Fields:**
- `nfcId` (Ascending)
- `isActive` (Ascending)
- `isApproved` (Ascending)

## Testing Checklist

### Card Number Validation
- [ ] Register user with card number "STU001"
- [ ] Try to register another user with "STU001"
- [ ] Should show toast: "Duplicate Card Number"
- [ ] Registration should fail
- [ ] Auth account should be rolled back

### Toast Notifications
- [ ] All toasts appear at the top of screen
- [ ] Success toasts are green
- [ ] Error toasts are red
- [ ] Toasts auto-dismiss after 3-4 seconds
- [ ] Multiple toasts stack properly
- [ ] Toasts don't block interaction

### NFC ID Fix
- [ ] Register new user
- [ ] Check Firestore document
- [ ] Should NOT have `nfcId` field
- [ ] Admin can later add `nfcId` via update

## Configuration

### Toast Configuration (Optional)

You can customize toast appearance in `app.config.js`:

```javascript
// Default configuration is fine, but you can customize:
const toastConfig = {
  success: {
    duration: 3000,
    position: 'top',
  },
  error: {
    duration: 4000,
    position: 'top',
  },
};
```

## API Changes

### UserService New Methods

```typescript
// Check if card number exists
const user = await UserService.getUserByCardNumber('STU001');
if (user) {
  console.log('Card number already taken');
}

// This is automatically called during registration
// No need to call it manually
```

### Error Messages

All error messages are now user-friendly:

**Before:**
```
"FirebaseError: auth/email-already-in-use"
```

**After:**
```
Toast: "Email Already Used"
"This email is already registered"
```

## Best Practices

### When to Use Toast

✅ **Use Toast for:**
- Form validation errors
- Success messages
- Network errors
- Non-critical errors
- Quick feedback

❌ **Don't Use Toast for:**
- Critical errors that need acknowledgment
- Long messages (use Alert)
- Messages that require user action
- Confirmation dialogs

### Toast Duration

- **Success:** 3 seconds (default)
- **Error:** 4 seconds (read longer messages)
- **Info:** 3 seconds

### Toast Positioning

- **Top:** Best for most cases (default)
- **Bottom:** Use if top conflicts with navigation
- **Center:** Rare, only for very important messages

## Migration Guide

If you want to add toasts to other screens:

```typescript
// 1. Import Toast
import Toast from 'react-native-toast-message';

// 2. Replace Alert.alert
// Before:
Alert.alert('Error', 'Something went wrong');

// After:
Toast.show({
  type: 'error',
  text1: 'Error',
  text2: 'Something went wrong',
});

// 3. Add Toast component to render
return (
  <View>
    {/* Your content */}
    <Toast />
  </View>
);
```

## Troubleshooting

### Toast Not Showing

**Problem:** Toast doesn't appear

**Solutions:**
1. Ensure `<Toast />` is added to the component
2. Check that `react-native-toast-message` is installed
3. Restart Expo dev server
4. Check console for errors

### Toast Hidden Behind Modal

**Problem:** Toast appears behind modals

**Solution:**
```typescript
// Add Toast to modal instead
<Modal>
  <YourContent />
  <Toast />
</Modal>
```

### Multiple Toasts Overlapping

**Problem:** New toasts replace old ones

**Solution:** This is expected behavior. If you need to show multiple messages, concatenate them or use a queue system.

## Summary

✅ **Fixed Issues:**
1. Firestore `undefined` error for NFC ID
2. No duplicate card number validation
3. Poor error UX with native alerts

✅ **Added Features:**
1. Card number uniqueness validation
2. Toast notifications throughout app
3. Better error messages
4. Auto-dismissing notifications

✅ **Improved UX:**
1. Non-blocking notifications
2. Clear, concise error messages
3. Visual feedback (colors)
4. Professional appearance

The app now has robust validation and excellent error handling! 🎉

