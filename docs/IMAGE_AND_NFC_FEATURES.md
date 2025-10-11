# Image Upload and NFC ID Features

## Overview

Added two new critical features to the user management system:
1. **Profile Image Upload** - Base64 image upload to Firebase Storage
2. **NFC ID** - Unique identifier for NFC card reading at gates

## 1. Profile Image Upload

### How It Works

**Image Flow:**
```
User selects image → Convert to base64 → Upload to Firebase Storage → Get download URL → Save URL in Firestore
```

### Implementation

#### User Model
```typescript
export interface User {
  // ... other fields
  imageUrl?: string;  // Optional profile picture URL
}

export interface CreateUserData {
  // ... other fields
  imageBase64?: string;  // Optional base64 image for upload
}
```

#### Image Service (`services/imageService.ts`)

**Key Methods:**

1. **`uploadBase64Image(base64Image, userId, folder)`**
   - Uploads base64 encoded image to Firebase Storage
   - Creates unique filename with timestamp
   - Returns download URL

2. **`deleteImage(imageUrl)`**
   - Deletes image from Firebase Storage
   - Used when updating or removing profile pictures

3. **`updateProfileImage(base64Image, userId, oldImageUrl)`**
   - Uploads new image and deletes old one
   - Atomic operation for profile picture updates

4. **`isValidBase64Image(base64String)`**
   - Validates base64 image format
   - Supports data URLs and raw base64

5. **`isWithinSizeLimit(base64String, maxSizeMB)`**
   - Checks if image size is within limits
   - Default: 5MB

### Firebase Storage Setup

#### Enable Storage in Firebase Console

1. Go to Firebase Console
2. Navigate to **Storage**
3. Click **Get Started**
4. Choose security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile-images/{userId}_{timestamp}.jpg {
      // Allow authenticated users to read any profile image
      allow read: if request.auth != null;
      
      // Allow users to upload their own profile image
      allow write: if request.auth != null && 
                      request.auth.uid == userId;
      
      // Limit file size to 5MB
      allow write: if request.resource.size < 5 * 1024 * 1024;
      
      // Only allow image files
      allow write: if request.resource.contentType.matches('image/.*');
    }
    
    // Admin can manage all images
    match /{allPaths=**} {
      allow read, write: if request.auth != null && 
                            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Usage in Registration

**In Signup Form:**
```typescript
// User picks image
const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
    base64: true,
  });
  
  if (!result.canceled && result.assets[0].base64) {
    setImageBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
  }
};

// Registration includes optional image
await register({
  email,
  password,
  firstName,
  lastName,
  cardNumber,
  nfcId,
  imageBase64,  // Optional
  role,
  department,
});
```

**In UserService:**
```typescript
static async createUser(authUid: string, userData: Omit<CreateUserData, 'password'>): Promise<User> {
  // Upload image if provided
  let imageUrl: string | undefined;
  if (userData.imageBase64) {
    try {
      imageUrl = await ImageService.uploadBase64Image(
        userData.imageBase64,
        userRef.id,
        'profile-images'
      );
    } catch (imageError) {
      console.error('Error uploading profile image:', imageError);
      // Continue without image - don't fail registration
    }
  }
  
  // Create user with imageUrl
  const newUser = {
    ...userData,
    imageUrl,
    // ... other fields
  };
  
  await setDoc(userRef, newUser);
  return newUser;
}
```

### Image Features

#### Specifications
- **Format**: JPEG (converted from any format)
- **Aspect Ratio**: 1:1 (square)
- **Quality**: 70% (configurable)
- **Max Size**: 5MB (recommended)
- **Storage Path**: `profile-images/{userId}_{timestamp}.jpg`

#### User Experience
1. Tap circular placeholder to select image
2. Image picker opens with editing options
3. User crops to square aspect ratio
4. Image displayed immediately in UI
5. Uploaded during registration (non-blocking)
6. If upload fails, registration still succeeds

#### Error Handling
- **Permission Denied**: Prompt user for photo library access
- **Upload Failed**: Continue registration without image
- **Invalid Format**: Show error, allow re-selection
- **Size Limit**: Compress or reject image

## 2. NFC ID Feature

### Purpose

The NFC ID is a unique identifier stored on physical NFC cards that will be used for:
- Gate access control
- Attendance tracking
- Identity verification at entry/exit points
- Quick user lookup without authentication

### Implementation

#### User Model
```typescript
export interface User {
  // ... other fields
  nfcId: string;  // Required - unique NFC card identifier
}

export interface CreateUserData {
  // ... other fields
  nfcId: string;  // Required during registration
}
```

#### UserService Method

**Get User by NFC ID:**
```typescript
static async getUserByNfcId(nfcId: string): Promise<User | null> {
  const q = query(
    collection(db, USERS_COLLECTION),
    where('nfcId', '==', nfcId)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  return mapUserData(querySnapshot.docs[0]);
}
```

### Firestore Index

Create a composite index for NFC ID queries:

```
Collection: users
Fields:
  - nfcId (Ascending)
  - isActive (Ascending)
  - isApproved (Ascending)
```

This allows efficient queries like:
```typescript
// Find active, approved user by NFC ID
const user = await UserService.getUserByNfcId(nfcId);
if (user && user.isActive && user.isApproved) {
  // Grant access
}
```

### Security Considerations

#### NFC ID Best Practices

1. **Uniqueness**: Ensure NFC IDs are unique across all users
2. **Format**: Use consistent format (e.g., hexadecimal string)
3. **Validation**: Validate format during registration
4. **Read-Only**: Users shouldn't be able to change their NFC ID
5. **Encryption**: Consider encrypting NFC IDs in storage

#### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Allow NFC lookup for authenticated users
      allow read: if request.auth != null;
      
      // Prevent users from changing their NFC ID
      allow update: if request.auth != null && 
                       !request.resource.data.diff(resource.data).affectedKeys().hasAny(['nfcId']);
      
      // Only admins can create/update NFC IDs
      allow create, update: if request.auth != null && 
                               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### NFC Card Reading Integration

#### Future Implementation

```typescript
// Pseudo-code for NFC reader at gate
import { NFC } from 'react-native-nfc-manager';
import { UserService } from '@/services/userService';

async function scanNFCCard() {
  try {
    // Read NFC card
    const tag = await NFC.readTag();
    const nfcId = tag.id;
    
    // Look up user
    const user = await UserService.getUserByNfcId(nfcId);
    
    if (!user) {
      return { success: false, message: 'Unknown card' };
    }
    
    if (!user.isActive) {
      return { success: false, message: 'Account deactivated' };
    }
    
    if (!user.isApproved) {
      return { success: false, message: 'Account not approved' };
    }
    
    // Log access
    await logAccess(user.uid, nfcId);
    
    // Grant access
    return {
      success: true,
      user: {
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        imageUrl: user.imageUrl,
      }
    };
  } catch (error) {
    return { success: false, message: 'Card read error' };
  }
}
```

#### Access Control Flow

```
1. User taps NFC card at gate
   ↓
2. Reader scans NFC ID
   ↓
3. System queries Firestore by nfcId
   ↓
4. Check user status (isActive, isApproved)
   ↓
5. Display user info (name, photo, role)
   ↓
6. Log access event
   ↓
7. Grant or deny access
```

### Database Migrations

If adding to existing users, you'll need to:

1. **Add NFC ID field to existing documents:**
```javascript
// Firebase Admin SDK or Cloud Functions
const users = await admin.firestore().collection('users').get();

for (const doc of users.docs) {
  if (!doc.data().nfcId) {
    await doc.ref.update({
      nfcId: generateUniqueNfcId(),  // Your generation logic
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
}
```

2. **Validate uniqueness:**
```typescript
async function validateNfcIdUniqueness(nfcId: string): Promise<boolean> {
  const existing = await UserService.getUserByNfcId(nfcId);
  return existing === null;
}
```

## Testing

### Test Image Upload

1. Register new user with profile picture
2. Check Firebase Storage for uploaded file
3. Verify Firestore has correct imageUrl
4. Test image display in UI

### Test NFC ID

1. Register user with NFC ID
2. Use `getUserByNfcId()` to fetch user
3. Verify unique constraint (try duplicate)
4. Test access control logic

## Performance Considerations

### Image Upload
- **Async**: Upload happens asynchronously during registration
- **Fallback**: Registration succeeds even if upload fails
- **Size**: Keep images under 5MB for fast uploads
- **Quality**: 70% quality balances size and quality

### NFC ID Lookup
- **Index**: Create Firestore index on `nfcId` for fast queries
- **Cache**: Consider caching frequent lookups
- **Offline**: Plan for offline NFC scanning

## Future Enhancements

### Image Features
- [ ] Image compression before upload
- [ ] Multiple photo sizes (thumbnail, full)
- [ ] Default avatars/initials
- [ ] Batch image processing
- [ ] CDN integration for faster delivery

### NFC Features
- [ ] NFC card programming
- [ ] Offline NFC database sync
- [ ] Real-time access logging
- [ ] Multi-factor authentication (NFC + PIN)
- [ ] Temporary access tokens
- [ ] NFC analytics dashboard

## Troubleshooting

### Image Upload Issues

**Problem**: Images not uploading
- Check Firebase Storage rules
- Verify storage bucket in config
- Check image size (< 5MB)
- Ensure base64 format is correct

**Problem**: Images not displaying
- Verify imageUrl is saved in Firestore
- Check Storage URL permissions
- Test URL in browser directly

### NFC ID Issues

**Problem**: Duplicate NFC IDs
- Add validation in registration form
- Create unique index in Firestore
- Implement server-side validation

**Problem**: NFC lookup slow
- Create Firestore index on nfcId
- Implement caching layer
- Optimize query patterns

## Summary

✅ **Profile Images**
- Optional during registration
- Stored in Firebase Storage
- Base64 upload with URL return
- Square aspect ratio, compressed
- Graceful failure handling

✅ **NFC IDs**
- Required during registration
- Unique identifier per user
- Fast lookup by NFC ID
- Used for gate access control
- Secure and immutable

Both features integrate seamlessly with the existing authentication and user management system while maintaining transaction safety and data consistency.

