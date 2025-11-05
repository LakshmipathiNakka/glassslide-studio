# User Menu & Footer Navigation Fix

## Issues Identified

### 1. User Menu Dropdown Not Opening
**Problem**: When clicking the user menu button (showing "Rahul"), the dropdown menu was not displaying the user data and sign-out option.

**Root Cause**: 
- Click event propagation issues between the button and portal overlay
- `menuRef` was being used on both the container div and the portal content, causing reference conflicts
- Missing event handlers for proper click isolation

### 2. Footer "Explore" Link Navigation
**Status**: ✅ **Working Correctly**
- The Footer "Explore" link correctly points to `href="#cta"`
- When clicked, it smoothly scrolls to the CTA section with `id="cta"`
- This is the expected behavior

## Solutions Implemented

### UserMenu Component Fixes

#### 1. Improved Click Event Handling
```typescript
// Button click handler
onClick={(e) => {
  e.stopPropagation();
  console.log('[UserMenu] Button clicked, current state:', isOpen);
  setIsOpen(!isOpen);
}}
onMouseDown={(e) => e.stopPropagation()}
```

**Changes:**
- Added `e.stopPropagation()` to prevent event bubbling
- Added `onMouseDown` handler to prevent conflicts
- Added console logging for debugging
- Added `type="button"` attribute to prevent form submission

#### 2. Portal Overlay Enhancement
```typescript
<div 
  className="fixed inset-0 z-[9999] bg-black/10" 
  onClick={(e) => {
    e.stopPropagation();
    setIsOpen(false);
  }}
  onMouseDown={(e) => e.stopPropagation()}
>
```

**Changes:**
- Added semi-transparent background (`bg-black/10`) for better UX
- Proper click handling to close menu when clicking outside
- Added `onMouseDown` prevention to avoid conflicts

#### 3. Menu Ref Management
```typescript
<div 
  ref={menuRef}  // Moved from parent container to portal content
  className="absolute bg-white/95 backdrop-blur-xl..."
>
```

**Changes:**
- Moved `menuRef` from the relative container to the portal content
- This allows proper click-outside detection
- Removed duplicate ref usage

#### 4. Enhanced Styling
```typescript
className="absolute bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/50..."
boxShadow: '0 8px 30px rgba(0,0,0,0.15), 0 2px 10px rgba(0,0,0,0.1)'
```

**Changes:**
- Improved background opacity for better visibility
- Enhanced shadow for better depth perception
- Better border styling

## Testing Checklist

### User Menu Functionality
- [x] Click user menu button → Dropdown opens
- [x] Click outside dropdown → Dropdown closes  
- [x] Click "Sign Out" → Logout process initiates
- [x] User data displays correctly (name, email, subtitle)
- [x] Avatar or default icon shows correctly
- [x] Chevron icon rotates when menu opens

### Footer Navigation
- [x] "Explore" link redirects to `#cta`
- [x] Smooth scroll behavior works
- [x] CTA section comes into view
- [x] Other footer links work correctly

## User Menu Flow

```
1. USER CLICKS BUTTON
   ↓
   Button onClick handler fires
   ↓
   e.stopPropagation() prevents bubbling
   ↓
   setIsOpen(true) triggers state change
   ↓
   
2. PORTAL RENDERS
   ↓
   Position calculated from buttonRef
   ↓
   createPortal renders to document.body
   ↓
   Full-screen overlay with menu content
   ↓
   
3. USER SEES MENU
   ↓
   User data displayed:
   - Avatar/Icon
   - Full name (userName)
   - Subtitle (if provided)
   - Email (userEmail)
   ↓
   Sign Out button visible
   ↓
   
4. USER CLICKS "SIGN OUT"
   ↓
   handleLogout() executes
   ↓
   - Calls sign-out API (if configured)
   - Clears cookies
   - Calls logout() from AuthProvider
   - Navigates to /login
   ↓
   
5. OR USER CLICKS OUTSIDE
   ↓
   Overlay onClick fires
   ↓
   setIsOpen(false) closes menu
```

## User Data Source

The user menu receives data from the `UserMenuLanding` component:

```typescript
// From useUserProfile hook
const { data, isLoading, error } = useUserProfile();

// Data structure
{
  name: "Rahul",           // Full name
  email: "rahul@gmail.com", // Email address
  title: undefined,         // Optional subtitle (job title, etc.)
  avatarUrl: undefined      // Optional avatar image URL
}

// Passed to UserMenu
<UserMenu
  userName={name}      // "Rahul"
  userEmail={email}    // "rahul@gmail.com"
  avatar={avatar}      // undefined (shows default icon)
  subtitle={subtitle}  // undefined
/>
```

### Data Fallback Logic

1. **Primary**: Fetch from `VITE_USER_URL` API endpoint
2. **Secondary**: Decode from JWT token
3. **Tertiary**: Check localStorage for `auth_username`
4. **Final Fallback**: Display "User"

## Authentication Flow

```
Landing Page (Index.tsx)
  ↓
  Checks: isAuthenticated
  ↓
  IF authenticated:
    → Show UserMenuLanding
       ↓
       useUserProfile() fetches data
       ↓
       Displays UserMenu with data
  ↓
  IF not authenticated:
    → Show Login/Try Demo buttons
```

## Console Debugging

Enable these console logs to debug:

```typescript
// Button click
console.log('[UserMenu] Button clicked, current state:', isOpen);

// Sign-out mousedown
console.info('[UserMenu] Sign-out mousedown');

// Sign-out process
console.info('[UserMenu] Sign-out clicked');
console.info('[UserMenu] Calling sign-out endpoint', { signoutUrl, isExternal });
console.info('[UserMenu] Sign-out response', r.status);
console.info('[UserMenu] Redirected to /login');
```

## Related Files

- `src/components/editor/UserMenu.tsx` - Main user menu component
- `src/components/landing/UserMenuLanding.tsx` - Landing page wrapper
- `src/auth/useUserProfile.ts` - User data fetching hook
- `src/auth/AuthProvider.tsx` - Authentication context
- `src/components/landing/Footer.tsx` - Footer with navigation links
- `src/pages/Index.tsx` - Landing page layout

## Summary

✅ **User Menu Fixed**: Dropdown now opens correctly and displays all user data and sign-out option  
✅ **Click Handling**: Proper event propagation and outside-click detection  
✅ **Footer Navigation**: "Explore" link correctly navigates to CTA section  
✅ **User Data**: Fetched from API/JWT and displayed correctly  
✅ **Sign Out**: Logout functionality works as expected  

The user menu is now fully functional with proper click handling, data display, and sign-out capability.
