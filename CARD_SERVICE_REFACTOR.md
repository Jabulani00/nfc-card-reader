# User Card Service - Code Refactoring

## Overview
Created a centralized service and custom hook to eliminate code duplication across all "My Card" screens (admin, staff, and student). This follows the DRY (Don't Repeat Yourself) principle and makes the codebase more maintainable.

## Files Created

### 1. **`utils/userCardUtils.ts`** - Utility Service Class
A static utility class containing all reusable functions for user card operations.

#### Key Functions:

**User Information Functions:**
- `getInitials(user, fallback)` - Get user initials from first and last name
- `getFullName(user)` - Get formatted full name
- `formatDate(date)` - Format date to readable string
- `formatDateTime(date)` - Format date with time

**Status Functions:**
- `getCardStatus(user)` - Get card status text (Active & Valid / Inactive / Pending Approval)
- `getAccessStatusText(user, role)` - Get role-specific access status text
- `getAccessLevel(role)` - Get access level description by role
- `getRoleDisplayName(role)` - Get display name for role

**Boolean Check Functions:**
- `hasProfileImage(user)` - Check if user has profile image
- `hasNfcId(user)` - Check if user has NFC ID assigned
- `shouldShowWarning(user)` - Check if warning color should be shown
- `shouldShowError(user)` - Check if error color should be shown
- `shouldShowSuccess(user)` - Check if success color should be shown

**Utility Functions:**
- `getCardValidYear()` - Get current year + 1 for card validity

### 2. **`hooks/use-user-card.ts`** - Custom Hook
A custom React hook that wraps the utility service and provides convenient access to all functions with the current user context.

#### Returns:
```typescript
{
  // Auth state
  user,                    // Current user object
  loading,                 // Loading state
  isReady,                 // Boolean: !loading && !!user
  
  // Helper functions (bound to current user)
  getInitials,
  getFullName,
  formatDate,
  formatDateTime,
  getCardStatus,
  getAccessStatusText,
  getAccessLevel,
  getRoleDisplayName,
  
  // User state checks
  hasProfileImage,
  hasNfcId,
  shouldShowWarning,
  shouldShowError,
  shouldShowSuccess,
  
  // Utilities
  getCardValidYear,
}
```

### 3. **`components/user-card-loading.tsx`** - Reusable Loading Component
A reusable loading component for card screens with customizable color and message.

#### Props:
- `color?: string` - Custom loading indicator color
- `message?: string` - Custom loading message (default: "Loading your card...")

## Before and After Comparison

### Before (Duplicated Code in Each Screen)
```typescript
// app/(admin)/my-card.tsx, app/(staff)/my-card.tsx, app/(student)/my-card.tsx
// All had duplicate code:

const { user, loading } = useAuth();

const getInitials = () => {
  if (!user) return 'XX';
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

if (loading || !user) {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={styles.loadingText}>Loading your card...</ThemedText>
      </View>
    </ThemedView>
  );
}

// ... more duplicate logic for status checks, role names, etc.
```

### After (Using Service and Hook)
```typescript
// app/(admin)/my-card.tsx
import { useUserCard } from '@/hooks/use-user-card';
import { UserCardLoading } from '@/components/user-card-loading';

const card = useUserCard();

if (!card.isReady) {
  return <UserCardLoading color={colors.primary} />;
}

const { user } = card;

// Now use helper functions:
card.getInitials('AD')
card.getFullName()
card.formatDate(user!.createdAt)
card.getCardStatus()
card.getRoleDisplayName('admin')
card.shouldShowSuccess()
```

## Benefits

### 1. **Code Reduction**
- **Removed ~30 lines of duplicate code** from each of the 3 screens
- **Total reduction: ~90 lines** of duplicate code
- Each screen is now **cleaner and more focused** on UI rendering

### 2. **Maintainability**
- ✅ Single source of truth for all utility functions
- ✅ Easy to update logic in one place
- ✅ Consistent behavior across all screens
- ✅ Easier to add new features

### 3. **Type Safety**
- All functions are strongly typed with TypeScript
- Better IntelliSense support in editors
- Compile-time error checking

### 4. **Testability**
- Utility functions can be unit tested independently
- Mock hook responses easily for component testing
- Separation of concerns (logic vs. UI)

### 5. **Reusability**
- Can use the same utilities in other screens/components
- Hook can be used anywhere user card data is needed
- Loading component can be reused for other loading states

## Usage Examples

### Basic User Information
```typescript
const card = useUserCard();

// Get user initials with fallback
const initials = card.getInitials('NA');

// Get full name
const fullName = card.getFullName();

// Check if profile image exists
if (card.hasProfileImage()) {
  // Show image
} else {
  // Show initials
}
```

### Status Checking
```typescript
// Get appropriate status color
const statusColor = card.shouldShowSuccess() 
  ? colors.success 
  : card.shouldShowWarning() 
    ? colors.warning 
    : colors.error;

// Get status text
const statusText = card.getCardStatus();
// Returns: "Active & Valid", "Inactive", or "Pending Approval"

// Get role-specific access text
const accessText = card.getAccessStatusText('admin');
// Returns: "All systems operational" for admin when active
```

### Date Formatting
```typescript
// Format registration date
const memberSince = card.formatDate(user!.createdAt);
// Output: "Oct 11, 2025"

// Format with time
const lastLogin = card.formatDateTime(lastLoginDate);
// Output: "Oct 11, 2025, 10:30 AM"
```

### Role Information
```typescript
// Get role display name
const roleName = card.getRoleDisplayName('staff');
// Returns: "Staff Member"

// Get access level
const accessLevel = card.getAccessLevel('admin');
// Returns: "Full Administrator"
```

## Code Organization

```
project/
├── utils/
│   └── userCardUtils.ts          # Static utility class
├── hooks/
│   └── use-user-card.ts          # Custom React hook
├── components/
│   └── user-card-loading.tsx     # Reusable loading component
└── app/
    ├── (admin)/my-card.tsx       # Uses the service
    ├── (staff)/my-card.tsx       # Uses the service
    └── (student)/my-card.tsx     # Uses the service
```

## Migration Guide

### For Future Features

When adding new card-related functionality:

1. **Add function to `userCardUtils.ts`** if it's a pure utility function
2. **Expose it in `use-user-card.ts`** hook for easy access
3. **Use it in components** via the hook

Example:
```typescript
// 1. Add to utils/userCardUtils.ts
static getExpirationDate(user: User | null): Date | null {
  if (!user?.createdAt) return null;
  const expiration = new Date(user.createdAt);
  expiration.setFullYear(expiration.getFullYear() + 1);
  return expiration;
}

// 2. Expose in hooks/use-user-card.ts
export function useUserCard() {
  // ... existing code ...
  return {
    // ... existing returns ...
    getExpirationDate: () => UserCardUtils.getExpirationDate(user),
  };
}

// 3. Use in component
const expirationDate = card.getExpirationDate();
```

## Performance Considerations

- ✅ **No performance overhead** - utility functions are static
- ✅ **Hook is lightweight** - just wraps auth context and utilities
- ✅ **Loading component is memoized** - efficient re-renders
- ✅ **Type-safe** - no runtime type checking needed

## Testing Examples

### Testing Utilities
```typescript
import { UserCardUtils } from '@/utils/userCardUtils';

describe('UserCardUtils', () => {
  it('should return correct initials', () => {
    const user = {
      firstName: 'John',
      lastName: 'Doe',
      // ... other fields
    };
    
    expect(UserCardUtils.getInitials(user)).toBe('JD');
  });

  it('should handle null user gracefully', () => {
    expect(UserCardUtils.getInitials(null, 'XX')).toBe('XX');
  });
});
```

### Testing Hook
```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useUserCard } from '@/hooks/use-user-card';

describe('useUserCard', () => {
  it('should return isReady false when loading', () => {
    // Mock useAuth to return loading: true
    const { result } = renderHook(() => useUserCard());
    
    expect(result.current.isReady).toBe(false);
  });
});
```

## Future Enhancements

Potential additions to the service:

1. **Card Analytics**
   - Track card usage statistics
   - Last scan location/time
   - Access history

2. **Validation Functions**
   - Validate card number format
   - Check card expiration
   - Verify NFC ID format

3. **Action Functions**
   - Report lost/stolen card
   - Request card renewal
   - Update profile information

4. **Export/Share Functions**
   - Generate QR code for card
   - Export card details
   - Share digital card

## Summary

### Lines of Code Saved
- **Admin Card**: ~30 lines removed
- **Staff Card**: ~30 lines removed  
- **Student Card**: ~30 lines removed
- **Total**: ~90 lines of duplicate code eliminated

### New Files Added
- `utils/userCardUtils.ts`: 150 lines (reusable)
- `hooks/use-user-card.ts`: 50 lines (reusable)
- `components/user-card-loading.tsx`: 30 lines (reusable)
- **Total**: 230 lines of **reusable, maintainable** code

### Net Result
- Reduced technical debt
- Improved code maintainability
- Better developer experience
- Easier to test and debug
- Consistent behavior across all screens
- Foundation for future features

