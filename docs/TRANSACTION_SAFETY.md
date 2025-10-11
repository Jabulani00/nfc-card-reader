# Transaction Safety in Registration

## Problem

Firebase Authentication and Firestore are separate services. When registering a new user, we need to perform two operations:

1. Create a Firebase Auth account (email/password)
2. Create a user document in Firestore

If operation #1 succeeds but operation #2 fails, we end up with:
- ✅ An auth account that can login
- ❌ No user document with profile data, role, etc.

This creates an **orphaned account** that can authenticate but has no associated data in the database.

## Solution: Automatic Rollback

We've implemented a rollback mechanism that ensures **both operations succeed or both fail**:

```typescript
const register = async (userData: CreateUserData) => {
  let firebaseUser: FirebaseUser | null = null;
  
  try {
    // Step 1: Create Firebase Auth account
    firebaseUser = await AuthService.register(userData);

    // Step 2: Create Firestore document
    const newUser = await UserService.createUser(firebaseUser.uid, userDataWithoutPassword);

    // Both succeeded - update state
    setUser(newUser);
    setFirebaseUser(firebaseUser);
    
  } catch (err) {
    // Rollback: Delete auth account if it was created
    if (firebaseUser) {
      await firebaseUser.delete();
    }
    throw err;
  }
};
```

## How It Works

### Successful Registration Flow

```
1. User submits registration form
   ↓
2. Create Firebase Auth account ✅
   ↓
3. Create Firestore document ✅
   ↓
4. User registered successfully
```

### Failed Registration with Rollback

```
1. User submits registration form
   ↓
2. Create Firebase Auth account ✅
   ↓
3. Create Firestore document ❌ (Network error, validation error, etc.)
   ↓
4. ROLLBACK: Delete Firebase Auth account ✅
   ↓
5. User sees error, no accounts created
```

## Failure Scenarios Handled

### Scenario 1: Firestore Permission Denied
```
Auth: Created ✅
Firestore: Failed (permission denied)
Result: Auth account deleted, user sees error
```

### Scenario 2: Network Timeout
```
Auth: Created ✅
Firestore: Failed (network timeout)
Result: Auth account deleted, user sees error
```

### Scenario 3: Invalid Data
```
Auth: Created ✅
Firestore: Failed (validation error)
Result: Auth account deleted, user sees error
```

### Scenario 4: Database Rules Violation
```
Auth: Created ✅
Firestore: Failed (security rules denied)
Result: Auth account deleted, user sees error
```

## Code Implementation

### In AuthContext.tsx

```typescript
const register = async (userData: CreateUserData) => {
  let firebaseUser: FirebaseUser | null = null;
  
  try {
    setLoading(true);
    setError(null);

    // Step 1: Create Firebase auth user
    firebaseUser = await AuthService.register(userData);

    // Step 2: Create user document in Firestore
    const { password, ...userDataWithoutPassword } = userData;
    const newUser = await UserService.createUser(
      firebaseUser.uid, 
      userDataWithoutPassword
    );

    // Both operations succeeded
    setUser(newUser);
    setFirebaseUser(firebaseUser);
    
  } catch (err: any) {
    console.error('Registration error:', err);
    
    // Rollback: Delete auth user if it was created
    if (firebaseUser) {
      try {
        console.log('Rolling back Firebase Auth user creation...');
        await firebaseUser.delete();
        console.log('Firebase Auth user deleted successfully');
      } catch (deleteErr: any) {
        console.error('Failed to rollback auth user:', deleteErr);
        // Fallback: Sign out the user
        await AuthService.logout();
      }
    }
    
    setError(err.message || 'Failed to register');
    throw err;
  } finally {
    setLoading(false);
  }
};
```

## Benefits

### Data Consistency
- ✅ No orphaned auth accounts
- ✅ No partial registrations
- ✅ Database always in consistent state

### Better User Experience
- ✅ Clear error messages
- ✅ Can retry registration immediately
- ✅ No confusion about account status

### Easier Debugging
- ✅ Clear logs for rollback operations
- ✅ Easy to trace registration failures
- ✅ No ghost accounts in Firebase Auth

## Testing Rollback

### Test 1: Simulate Firestore Failure

Temporarily modify `createUser` in `userService.ts`:

```typescript
static async createUser(authUid: string, userData: any): Promise<User> {
  // Simulate failure
  throw new Error('Simulated Firestore error');
}
```

Expected Result:
- Registration fails
- Auth account is deleted
- User can retry registration

### Test 2: Check Firebase Console

After a failed registration:
1. Go to Firebase Console → Authentication
2. Check that no new user was created
3. Go to Firestore → users collection
4. Verify no document was created

### Test 3: Network Failure

1. Disconnect internet after auth creation
2. Firestore write will fail
3. Rollback should trigger
4. Auth account should be deleted

## Limitations

### Recent Authentication Required

Firebase requires "recent authentication" to delete a user account. If the rollback happens immediately (which it does), this shouldn't be an issue. However, if you try to delete a user's account later, they may need to re-authenticate first.

### Async Timing

There's a small window where:
1. Auth account exists
2. Firestore document doesn't exist yet
3. Another process tries to fetch the user

This is typically only a few milliseconds and won't affect normal operation.

## Edge Cases

### What if rollback fails?

If we can't delete the auth account (rare), we:
1. Log the error
2. Sign out the user
3. Show error message

The orphaned account may still exist, but:
- User is not logged in
- No user document exists
- Admin can manually clean up in Firebase Console

### What if user closes app during registration?

The transaction completes server-side. Either:
- Both operations complete ✅
- Auth completes, Firestore fails, rollback completes ✅
- Auth completes, Firestore fails, rollback pending (user can't login anyway)

## Alternative Approaches Considered

### 1. Cloud Functions
Use a Cloud Function triggered on auth user creation to create Firestore document.

**Pros:** Server-side, more reliable
**Cons:** Requires Firebase Blaze plan, more complex, harder to debug

### 2. Firestore First
Create Firestore document before auth account.

**Pros:** Can use Firestore transaction
**Cons:** Can't create document without authUid, would need to generate UID client-side

### 3. Manual Cleanup
Just create orphaned accounts and clean up manually.

**Pros:** Simpler code
**Cons:** Poor data consistency, manual work, confusing for users

### 4. Retry Logic
Automatically retry Firestore creation multiple times.

**Pros:** Higher success rate
**Cons:** Doesn't solve the fundamental problem, delays rollback

## Chosen Approach: Immediate Rollback ✅

We chose immediate rollback because:
- ✅ Maintains data consistency
- ✅ Simple to implement
- ✅ Easy to understand
- ✅ Works with free Firebase plan
- ✅ Fast failure recovery
- ✅ No manual cleanup needed

## Monitoring

To monitor rollback occurrences, check console logs for:

```
Registration error: [error message]
Rolling back Firebase Auth user creation...
Firebase Auth user deleted successfully
```

If you see frequent rollbacks, investigate:
- Firestore security rules
- Network connectivity
- Data validation
- Firebase service status

## Best Practices

### 1. Always Use the AuthContext
```typescript
// ✅ Good
const { register } = useAuth();
await register(userData);

// ❌ Bad - No rollback protection
await AuthService.register(userData);
await UserService.createUser(uid, userData);
```

### 2. Handle Errors in UI
```typescript
try {
  await register(userData);
  // Success
} catch (error) {
  // Show error to user
  Alert.alert('Registration Failed', error.message);
}
```

### 3. Don't Cache Intermediate State
```typescript
// ❌ Bad
setFirebaseUser(user);  // Don't set until both succeed
await createFirestoreDoc();

// ✅ Good
const user = await createAuth();
const doc = await createFirestoreDoc();
setFirebaseUser(user);  // Only after both succeed
```

## Summary

✅ **Transaction safety** ensures database consistency
✅ **Automatic rollback** prevents orphaned accounts  
✅ **Clear error handling** improves user experience  
✅ **Simple implementation** with immediate rollback  
✅ **No manual cleanup** required  
✅ **Works on free tier** - no Cloud Functions needed

This approach ensures that your database remains in a consistent state, and users never experience partial registrations.

