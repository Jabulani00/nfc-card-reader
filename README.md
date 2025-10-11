# NFC Card Reader App 📱

A React Native mobile application built with Expo for managing university NFC card access with role-based authentication.

## Features

### Authentication & User Management
- 🔐 Firebase Authentication with Email/Password
- 👥 Role-based access control (Admin, Staff, Student)
- ✅ Admin approval workflow for new registrations
- 🔒 Secure password reset functionality
- 📱 Persistent authentication state

### Role-Based Features

#### Admin
- Approve/reject user registrations
- Manage students and staff
- Full access to all features
- View all users and their status

#### Staff
- View personal card information
- Access student records
- Requires admin approval

#### Student
- View personal card information
- Access limited features
- Requires admin approval

## Tech Stack

- **Framework**: React Native with Expo
- **Routing**: Expo Router (file-based routing)
- **Authentication**: Firebase Authentication
- **Database**: Cloud Firestore
- **State Management**: React Context API
- **Styling**: React Native StyleSheet with theme support
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- A Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nfc-card-reader
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

   See `.env.example` for reference.

4. **Set up Firebase**
   
   Follow the detailed setup instructions in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

5. **Start the development server**
   ```bash
   npm start
   ```

   Then:
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app for physical device

## Project Structure

```
nfc-card-reader/
├── app/                      # Expo Router pages
│   ├── (admin)/             # Admin-only screens
│   ├── (staff)/             # Staff screens
│   ├── (student)/           # Student screens
│   ├── _layout.tsx          # Root layout with providers
│   ├── login.tsx            # Login screen
│   ├── signup.tsx           # Registration screen
│   └── forgot-password.tsx  # Password reset screen
├── components/              # Reusable components
├── config/                  # Configuration files
│   └── firebase.ts          # Firebase initialization
├── contexts/                # React Context providers
│   └── AuthContext.tsx      # Authentication context
├── models/                  # TypeScript models
│   └── User.ts              # User model and types
├── services/                # Business logic services
│   ├── authService.ts       # Authentication operations
│   └── userService.ts       # User CRUD operations
├── constants/               # App constants and themes
├── hooks/                   # Custom React hooks
└── assets/                  # Images and static files
```

## User Flow

### Registration
1. User signs up with email, password, and profile information
2. Selects role (Student or Staff)
3. Account created but set to "pending approval"
4. Admin must approve before user can access app

### Login
1. User enters email and password
2. System validates credentials
3. Checks if user is active and approved
4. Routes to appropriate screen based on role:
   - Admin → Students management page
   - Staff → My Card page
   - Student → My Card page

### Password Reset
1. User enters email address
2. Firebase sends password reset email
3. User clicks link to reset password

## Firebase Setup

### Authentication
Enable Email/Password authentication in Firebase Console:
1. Go to Authentication → Sign-in method
2. Enable Email/Password
3. Save changes

### Firestore Database
Create a Firestore database and set up security rules:
1. Create database in production mode
2. Add security rules (see FIREBASE_SETUP.md)
3. Create initial admin user

### User Document Structure
```typescript
{
  uid: string;              // Firestore document ID
  authUid: string;          // Firebase Auth UID
  email: string;
  firstName: string;
  lastName: string;
  cardNumber: string;
  role: "admin" | "staff" | "student";
  department: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Available Scripts

```bash
# Start development server
npm start

# Start with cache cleared
npm start -- --clear

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web

# Run linter
npm run lint
```

## Development

### Adding New Features

1. Create new screens in `app/` directory
2. Add business logic to `services/`
3. Create reusable components in `components/`
4. Define types in `models/`
5. Update routing in appropriate layout files

### Theme Support

The app supports both light and dark themes. Use themed components from `components/`:
- `ThemedView` for containers
- `ThemedText` for text
- Access colors via `Colors` from `constants/colors.ts`

## Security

- Firebase Authentication for secure login
- Firestore security rules for data access control
- Environment variables for sensitive data
- Role-based access control throughout the app
- Admin approval required for new users

## Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Restart dev server after changing `.env`
   - Ensure variables start with `EXPO_PUBLIC_`

2. **Firebase errors**
   - Check Firebase Console for error details
   - Verify authentication is enabled
   - Check Firestore security rules

3. **Build errors**
   - Clear cache: `npm start -- --clear`
   - Delete `node_modules` and reinstall
   - Check for TypeScript errors

## Documentation

- [Firebase Setup Guide](./FIREBASE_SETUP.md) - Detailed Firebase configuration
- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)

## Future Enhancements

- [ ] NFC card reading functionality
- [ ] Attendance tracking
- [ ] QR code scanning
- [ ] Push notifications
- [ ] Email verification
- [ ] Two-factor authentication
- [ ] Admin dashboard with analytics
- [ ] Export user data
- [ ] Batch user import

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and confidential.

## Support

For setup assistance or bug reports, please refer to:
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for Firebase configuration
- GitHub Issues for bug reports
- Project documentation for feature guides
