# Admin Dashboard Access Guide

## ✅ Setup Complete!

Your admin dashboard is now configured and ready to use.

## 🔑 Admin Credentials

**Admin Wallet Address:** `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

This is the default Hardhat account #0 with the private key already in your `.env` file.

## 🚀 How to Access

### Method 1: Direct URL
1. Make sure your dev server is running: `npm run dev`
2. Connect your wallet with the admin address above
3. Navigate to: `http://localhost:3000/admin`

### Method 2: Navbar Link (NEW!)
1. Connect your wallet with the admin address
2. Look for the **"Admin"** link in the navbar (appears only for admin users)
3. Click it to access the dashboard

## 📱 Admin Link Features

- **Desktop**: Shows as "Admin" with a shield icon in amber/gold color
- **Mobile**: Shows as "Admin Dashboard" in the mobile menu
- **Auto-detection**: Only appears when you're connected with the admin wallet
- **Visual indicator**: Amber color scheme to distinguish from regular navigation

## 🎯 Admin Dashboard Features

Once logged in, you can:

### 1. Pending Review Tab
- View all unverified trademarks
- Review trademark details
- Verify or reject submissions
- Add rejection reasons

### 2. Verified Tab
- See all verified trademarks
- Review verification history
- Monitor approved submissions

### 3. Reports Tab
- Handle user reports
- Review reported content
- Resolve or dismiss reports
- Take action on violations

### 4. Statistics Dashboard
- Total trademarks count
- Pending reviews count
- Verified trademarks count
- Active reports count

## 🔐 Security

The admin check happens on both:
- **Frontend**: Navbar link visibility and page access
- **Backend**: API endpoints verify admin address

## 🛠️ Changing Admin Address

To use a different wallet as admin:

1. Open `.env` file
2. Update `NEXT_PUBLIC_ADMIN_ADDRESS` with your wallet address
3. Restart the dev server
4. Connect with the new admin wallet

Example:
```env
NEXT_PUBLIC_ADMIN_ADDRESS=0xYourWalletAddressHere
```

## 📝 Notes

- Admin access is restricted to the configured wallet address only
- Non-admin users will be redirected if they try to access `/admin`
- The admin link automatically appears/disappears based on connected wallet
- All admin actions are logged for audit purposes

## 🎨 Visual Design

The admin link uses:
- **Color**: Amber/gold (`text-amber-400`)
- **Icon**: Shield with checkmark
- **Hover**: Subtle amber glow effect
- **Active**: Amber border and background

This makes it easy to identify admin-specific features at a glance!

---

**Ready to use!** Just connect with the admin wallet and you'll see the Admin link appear in your navbar.
