# UI Theme Update Plan - Dark Theme Consistency

## Status: In Progress
**Date:** November 22, 2024

---

## ✅ Completed

### 1. Homepage (pages/index.tsx)
- ✅ Dark gradient hero section
- ✅ Stats card with dark theme
- ✅ How It Works section
- ✅ Recent trademarks grid
- ✅ Minimal, clean design

### 2. Navbar (components/Navbar.tsx)
- ✅ Dark background (gray-900)
- ✅ Updated logo and branding
- ✅ Dark search bar
- ✅ Updated navigation links
- ✅ Dark mobile menu
- ✅ Connect wallet button styled

### 3. Footer (components/Footer.tsx)
- ✅ Simplified minimal footer
- ✅ Dark theme
- ✅ Essential information only

---

## 🔄 In Progress / To Do

### 4. Marketplace Page (pages/marketplace.tsx)
- [ ] Update to dark theme
- [ ] Verify filters work
- [ ] Check trademark cards display
- [ ] Test search functionality
- [ ] Verify navigation links

### 5. Register Page (pages/register.tsx)
- [ ] Update to dark theme
- [ ] Verify multi-step form works
- [ ] Check file upload
- [ ] Test form validation
- [ ] Verify wallet connection required

### 6. Verify Page (pages/verify.tsx)
- [ ] Update to dark theme
- [ ] Check verification flow
- [ ] Test QR code scanning
- [ ] Verify blockchain queries work

### 7. Dashboard Page (pages/dashboard.tsx)
- [ ] Update to dark theme
- [ ] Check owned trademarks display
- [ ] Verify create listing works
- [ ] Test transaction history

### 8. Admin Page (pages/admin/index.tsx)
- [ ] Update to dark theme
- [ ] Check admin access control
- [ ] Verify trademark approval/rejection
- [ ] Test report management

### 9. Categories Page (pages/categories.tsx)
- [ ] Update to dark theme
- [ ] Verify category grid
- [ ] Check navigation to marketplace

### 10. Trademark Detail Page (pages/trademark/[id].tsx)
- [ ] Update to dark theme
- [ ] Check all tabs work
- [ ] Verify rating system
- [ ] Test license creation

---

## 🎨 Design System

### Colors
```css
Background: gray-950, gray-900
Cards: gray-900/50, gray-800
Borders: gray-800, gray-700
Text: white, gray-300, gray-400
Accent: blue-600, blue-500
Success: green-600
Error: red-600
```

### Components
- Buttons: bg-blue-600 hover:bg-blue-700
- Cards: bg-gray-900/50 border-gray-800
- Inputs: bg-gray-800 border-gray-700
- Links: text-blue-400 hover:text-blue-300

---

## 🔗 Navigation Links to Verify

### Navbar
- [x] Home (/)
- [x] Marketplace (/marketplace)
- [x] Register IP (/register)
- [x] Verify IP (/verify)
- [x] Dashboard (/dashboard)

### Homepage
- [x] Register Trademark → /register
- [x] View Marketplace → /marketplace
- [x] View All (trademarks) → /marketplace

### Footer
- [x] Logo → /

---

## 🧪 Testing Checklist

### Functionality
- [ ] Wallet connection works
- [ ] Search works
- [ ] Filters work
- [ ] Forms submit correctly
- [ ] File uploads work
- [ ] Blockchain interactions work
- [ ] Admin functions work

### Navigation
- [ ] All links go to correct pages
- [ ] Back button works
- [ ] Mobile menu works
- [ ] Breadcrumbs work (if present)

### Responsive
- [ ] Mobile (< 640px)
- [ ] Tablet (640px - 1024px)
- [ ] Desktop (> 1024px)

### Dark Theme
- [ ] All pages use dark theme
- [ ] Text is readable
- [ ] Buttons are visible
- [ ] Forms are usable
- [ ] Cards have proper contrast

---

## 📝 Notes

- Keep minimal information
- Focus on core functionality
- Maintain professional appearance
- Ensure academic project suitability
- All features must work correctly

---

**Next Steps:**
1. Update Marketplace page
2. Update Register page
3. Update remaining pages
4. Test all navigation
5. Test all functionality
6. Final review
