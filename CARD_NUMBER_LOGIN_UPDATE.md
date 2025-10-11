# Card Number Login System Update

## Overview
The authentication system has been successfully converted from email-based login to card number-based login. Users will now login using their card number and password instead of email and password.

## Changes Made

### 1. User Model (`models/User.ts`)
- Updated `LoginCredentials` interface to use `cardNumber` instead of `email`
```typescript
export interface LoginCredentials {
  cardNumber: string;  // Changed from email
  password: string;
}
```

### 2. Authentication Service (`services/authService.ts`)
- Modified `login()` method to accept card number instead of email
- Added logic to lookup user by card number first, then use their email for Firebase Authentication
- Added `resetPasswordByCardNumber()` method for password reset using card number
- Security: Error messages are generic to avoid revealing which card numbers are valid

### 3. Login Screen (`app/login.tsx`)
- Changed input field from "Email" to "Card Number"
- Updated state variable from `email` to `cardNumber`
- Updated validation and login call to use card number
- Removed email keyboard type

### 4. Forgot Password Screen (`app/forgot-password.tsx`)
- Changed input field from "Email" to "Card Number"  
- Updated to use `resetPasswordByCardNumber()` instead of `resetPassword()`
- Modified success message to indicate email was sent to the address associated with the card number
- Updated all UI text to reference card number instead of email

### 5. Auth Context (`contexts/AuthContext.tsx`)
- Added `resetPasswordByCardNumber()` function to context
- Exported new function for use throughout the app
- Login flow now accepts card number credentials

## How It Works

### Login Flow
1. User enters their card number and password
2. System looks up the user in Firestore by card number
3. If found, retrieves the user's email address
4. Uses the email + password to authenticate with Firebase Auth
5. Validates the user is active and approved
6. Logs the user in

### Password Reset Flow
1. User enters their card number
2. System looks up the user in Firestore by card number
3. If found, retrieves the user's email address
4. Sends password reset email to that address
5. User receives reset instructions via email

## Important Notes

- **Email is still required** during registration for password reset functionality
- Email addresses are still stored in the database but hidden from the login process
- Firebase Authentication still uses email/password under the hood
- This maintains all Firebase Auth security features (rate limiting, password requirements, etc.)
- Card numbers must be unique in the system (enforced during registration)

## Security Considerations

- Generic error messages prevent card number enumeration
- Firebase Auth security features remain intact
- Passwords are never stored in plain text
- Password reset emails are sent securely through Firebase

## User Experience

### Before (Email Login)
- Users logged in with: email + password
- Users reset password with: email

### After (Card Number Login)
- Users log in with: card number + password
- Users reset password with: card number
- Email is only used internally for password reset delivery

## Files Modified
1. `models/User.ts`
2. `services/authService.ts`
3. `app/login.tsx`
4. `app/forgot-password.tsx`
5. `contexts/AuthContext.tsx`

## Testing Recommendations

1. Test login with valid card number and password
2. Test login with invalid card number
3. Test login with valid card number but wrong password
4. Test password reset with valid card number
5. Test password reset with invalid card number
6. Verify email addresses are still captured during registration
7. Test that password reset emails are received
8. Verify error messages don't reveal valid card numbers

## Backward Compatibility

- Existing users can immediately login with their card number
- No data migration required
- Email addresses remain in the database
- All existing Firebase Auth users remain valid

