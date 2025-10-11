# Pending Approval Page Documentation

## Overview

A dedicated page for users who have registered but are not yet approved or activated to access the system. This page provides clear information about their account status and what steps to take.

---

## 🎯 Purpose

Users who register in the system must be:
1. **Approved** by an administrator or staff member
2. **Activated** to grant system access

Until both conditions are met, users are redirected to the pending approval page instead of their dashboard.

---

## 📍 File Location

**File:** `app/pending-approval.tsx`

---

## 🚦 Access Logic

### When Users See This Page:
1. **After Registration** - All new users (staff/students) see this page
2. **After Login** - If `isApproved: false` OR `isActive: false`
3. **Deactivated Users** - Users who were previously active but deactivated

### Redirect Logic:
```typescript
// In app/index.tsx and app/login.tsx
if (!user.isApproved || !user.isActive) {
  router.replace('/pending-approval');
  return;
}
```

---

## 📋 Page Features

### 1. **User Information Card**
Displays the current user's registration details:
- Full Name
- Email
- Card Number
- Department
- Role (Student/Staff)
- Current Status (Pending Approval / Inactive)

### 2. **Status Badges**
Visual indicators for account status:
- ⏳ **Pending Approval** (Orange) - Not yet approved
- 🔒 **Inactive** (Red) - Approved but not activated

### 3. **Information Sections**

#### Welcome Message:
- Confirms registration was successful
- Explains approval requirement
- Sets expectations (1-2 business days)

#### What to Do While Waiting:
1. Check email for notifications
2. Contact department administrator for urgent access
3. Verify registration information is correct

#### Contact Information:
- Department name
- Support email (admin@university.edu)
- Direct contact button

### 4. **Action Buttons**

#### Contact Support Button:
- Opens email client with pre-filled subject
- Email: `admin@university.edu`
- Subject: "Account Approval Request"

#### Logout Button:
- Logs user out
- Redirects to landing page

---

## 🎨 Design Features

### Visual Elements:
- ⏳ Large hourglass icon at the top
- Color-coded status badges
- Organized information cards
- Clear call-to-action buttons

### Responsive Design:
- Max width: 600px (centered)
- Scrollable content
- Proper padding and spacing
- Works on all screen sizes

---

## 🔄 User Flows

### New Student Registration Flow:
```
1. User registers → 2. isApproved: false, isActive: false
                   ↓
3. Redirected to pending-approval page
                   ↓
4. Admin approves → isApproved: true
                   ↓
5. Admin/Staff activates → isActive: true
                   ↓
6. User can access dashboard
```

### New Staff Registration Flow:
```
1. Staff registers → 2. isApproved: false, isActive: false
                    ↓
3. Redirected to pending-approval page
                    ↓
4. Admin approves → isApproved: true
                    ↓
5. Admin activates → isActive: true
                    ↓
6. Staff can access dashboard
```

### Deactivated User Flow:
```
1. User logs in → 2. isActive: false (but isApproved: true)
                 ↓
3. Redirected to pending-approval page
                 ↓
4. Shows "Approved but Inactive" status
                 ↓
5. User contacts admin to reactivate
```

---

## 💡 Implementation Details

### Navigation Guards:
Updated in two key files:

#### `app/index.tsx` (Landing page):
```typescript
useEffect(() => {
  if (!loading && user) {
    // Check if user needs approval
    if (!user.isApproved || !user.isActive) {
      router.replace('/pending-approval');
      return;
    }
    
    // Otherwise redirect to appropriate dashboard
    // ... role-based routing ...
  }
}, [user, loading]);
```

#### `app/login.tsx` (After login):
```typescript
useEffect(() => {
  if (user) {
    // Check if user needs approval
    if (!user.isApproved || !user.isActive) {
      router.replace('/pending-approval');
      return;
    }
    
    // Otherwise redirect to appropriate dashboard
    // ... role-based routing ...
  }
}, [user]);
```

### Auto-redirect on Approval:
If an admin approves/activates a user while they're viewing the pending page, they will automatically be redirected to their dashboard on the next render due to the `useEffect` checking their status.

---

## 🎯 Benefits

### For Users:
- ✅ Clear understanding of account status
- ✅ Know what to expect and how long to wait
- ✅ Easy way to contact support
- ✅ Professional, reassuring experience

### For Administrators:
- ✅ Reduces support inquiries
- ✅ Sets clear expectations
- ✅ Professional onboarding experience
- ✅ Users can't access system before approval

---

## 📞 Contact Information

The page displays contact information that can be customized:

### Default Contact:
- **Email:** admin@university.edu
- **Department:** User's department (from profile)

### To Customize:
Edit the email in `app/pending-approval.tsx`:
```typescript
const handleContactSupport = () => {
  Linking.openURL('mailto:YOUR_EMAIL@university.edu?subject=Account Approval Request');
};
```

---

## 🔐 Security

### Access Control:
- Only logged-in users can view this page
- Page checks user authentication status
- Automatically redirects if approval status changes

### Data Privacy:
- Only shows user's own information
- No access to admin functions
- Logout available at any time

---

## 🐛 Error Handling

### Edge Cases Handled:
1. **User session expires** - Redirects to login
2. **User is already approved** - Redirects to dashboard
3. **User logs out** - Returns to landing page
4. **Email client not configured** - Falls back to system email handler

---

## 🎨 Styling

### Color Scheme:
- Adapts to light/dark mode
- Uses app theme colors
- Status badges have fixed colors for consistency:
  - Orange (#F59E0B) for pending
  - Red (#EF4444) for inactive
  - Blue for primary actions

### Typography:
- Clear hierarchy
- Readable font sizes
- Proper line height for readability

---

## 📱 Platform Support

- ✅ iOS
- ✅ Android
- ✅ Web
- ✅ Dark mode
- ✅ Light mode

---

## 🚀 Future Enhancements

Potential features to add:
- Real-time status updates via Firestore listeners
- Push notifications when approved
- Estimated approval time based on pending queue
- Link to FAQ or help documentation
- Chat with support feature
- Approval progress indicator

---

*Last Updated: October 11, 2025*
*This page ensures users have a professional waiting experience during the approval process.*

