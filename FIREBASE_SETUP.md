# Firebase Setup Guide

This guide will help you set up Firebase for the NFC Card Reader application.

## Prerequisites

- Node.js and npm installed
- Expo CLI installed (`npm install -g expo-cli`)
- A Firebase account

## Step 1: Create Environment File

Create a `.env` file in the root directory of your project with the following content:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyBzTJcpZASSot-tAgBCOwWl9rvnyvh5mF8
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=chrono-scan.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=chrono-scan
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=chrono-scan.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=218618224396
EXPO_PUBLIC_FIREBASE_APP_ID=1:218618224396:web:4d5eeacaaad37a56513329
```

**Important:** Make sure this file is added to `.gitignore` to keep your credentials secure.

## Step 2: Install Dependencies

All required dependencies are already installed. If you need to reinstall them:

```bash
npm install
```

## Step 3: Firebase Configuration

The Firebase configuration is already set up in `config/firebase.ts`. It automatically:
- Initializes Firebase with environment variables
- Sets up Firebase Authentication with AsyncStorage persistence
- Configures Firestore for database operations

## Step 4: Firestore Database Setup

### 4.1 Create Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (chrono-scan)
3. Navigate to **Firestore Database**
4. Click **Create database**
5. Choose **Start in production mode** (recommended) or **Start in test mode**
6. Select your preferred location

### 4.2 Set Up Firestore Security Rules

Add the following security rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Allow users to read their own data
      allow read: if request.auth != null && 
                     (request.auth.uid == resource.data.authUid || 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      
      // Allow users to update their own data (except role and approval status)
      allow update: if request.auth != null && 
                       request.auth.uid == resource.data.authUid &&
                       !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'isApproved']);
      
      // Only allow admins to create, update role, or delete users
      allow create, delete: if request.auth != null && 
                               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // Allow admins to update any user
      allow update: if request.auth != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // Allow list for admins
      allow list: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 4.3 Create Initial Admin User

You need to create an initial admin user manually:

1. Sign up through the app with admin credentials
2. Go to Firebase Console > Firestore Database
3. Find the newly created user document in the `users` collection
4. Edit the document and set:
   - `role`: "admin"
   - `isApproved`: true
   - `isActive`: true

Or use the Firebase Console to create a user document directly:

```
Collection: users
Document ID: (auto-generated)

Fields:
- authUid: (Firebase Auth UID)
- email: "admin@university.edu"
- firstName: "Administrative"
- lastName: "User"
- cardNumber: "Admin01"
- role: "admin"
- department: "Administrative"
- isActive: true
- isApproved: true
- createdAt: (Timestamp - current time)
- updatedAt: (Timestamp - current time)
```

## Step 5: Firebase Authentication Setup

### 5.1 Enable Email/Password Authentication

1. Go to Firebase Console
2. Navigate to **Authentication** > **Sign-in method**
3. Enable **Email/Password** provider
4. Save changes

### 5.2 Configure Email Templates (Optional)

Customize the email templates for:
- Password reset
- Email verification
- Email change notification

## Architecture Overview

### User Model

The user model includes the following fields:

```typescript
{
  uid: string;              // Firestore document ID
  authUid: string;          // Firebase Auth UID
  email: string;
  firstName: string;
  lastName: string;
  cardNumber: string;       // Student/Staff card number
  role: "admin" | "staff" | "student";
  department: string;
  isActive: boolean;        // Account status
  isApproved: boolean;      // Admin approval status
  createdAt: Date;
  updatedAt: Date;
}
```

### Role-Based Access

The application supports three user roles:

1. **Admin**
   - Full access to all features
   - Can approve/reject user registrations
   - Can manage students and staff
   - Can view all users

2. **Staff**
   - Access to staff features
   - Can view their card
   - Can view students
   - Requires admin approval after registration

3. **Student**
   - Access to student features
   - Can view their card
   - Requires admin approval after registration

### Authentication Flow

1. **Registration**:
   - User fills out registration form (student or staff)
   - Firebase Auth creates user account
   - User document created in Firestore
   - Non-admin users set to `isApproved: false`
   - Admin users auto-approved

2. **Login**:
   - User enters email and password
   - Firebase Auth validates credentials
   - App fetches user data from Firestore
   - Checks if user is active and approved
   - Routes to appropriate screen based on role

3. **Password Reset**:
   - User enters email
   - Firebase sends password reset email
   - User clicks link in email to reset password

## Services

### AuthService (`services/authService.ts`)

Handles Firebase Authentication operations:
- `register()` - Create new user account
- `login()` - Sign in with email/password
- `logout()` - Sign out current user
- `resetPassword()` - Send password reset email

### UserService (`services/userService.ts`)

Handles Firestore user operations:
- `createUser()` - Create user document
- `getUserByAuthUid()` - Fetch user by Auth UID
- `getUserByUid()` - Fetch user by document ID
- `getAllUsers()` - Get all users (admin only)
- `getUsersByRole()` - Get users by role
- `updateUser()` - Update user data
- `approveUser()` - Approve pending user
- `deactivateUser()` - Deactivate user account
- `getPendingApprovals()` - Get users awaiting approval

## Running the Application

```bash
# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

## Testing the Integration

### Test Admin Login

1. Create an admin user as described in Step 4.3
2. Open the app
3. Navigate to Login
4. Enter admin credentials
5. Should redirect to admin dashboard (Students page)

### Test Student/Staff Registration

1. Open the app
2. Navigate to Sign Up
3. Fill in all fields
4. Toggle Student/Staff switch
5. Submit registration
6. Should see "pending approval" message
7. Login as admin to approve the user

## Troubleshooting

### Common Issues

1. **"Firebase not initialized" error**
   - Make sure `.env` file exists with correct values
   - Restart the Expo dev server
   - Clear Metro bundler cache: `expo start -c`

2. **Authentication errors**
   - Verify Email/Password provider is enabled in Firebase Console
   - Check Firebase Auth error messages in console

3. **Firestore permission denied**
   - Verify security rules are correctly set
   - Ensure user document exists in Firestore
   - Check user has proper role and approval status

4. **Environment variables not loading**
   - Ensure variables start with `EXPO_PUBLIC_`
   - Restart dev server after changing `.env`
   - Check `app.config.js` includes the variables in `extra`

## Security Best Practices

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use environment-specific configs** - Different configs for dev/staging/prod
3. **Enable App Check** - Protect against abuse
4. **Review security rules regularly** - Ensure proper access control
5. **Enable email verification** - Verify user email addresses
6. **Implement rate limiting** - Prevent brute force attacks
7. **Monitor authentication attempts** - Use Firebase Console to track suspicious activity

## Next Steps

1. Implement email verification
2. Add two-factor authentication
3. Implement NFC card reading functionality
4. Add attendance tracking features
5. Create admin dashboard for user management
6. Add analytics and monitoring

## Support

For issues or questions:
1. Check Firebase Console logs
2. Review Expo error messages
3. Check React Native debugger console
4. Refer to Firebase Documentation: https://firebase.google.com/docs
5. Refer to Expo Documentation: https://docs.expo.dev

