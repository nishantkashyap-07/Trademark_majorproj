# Verification System - Quick Reference

## 🔍 User Verification

### Access
```
URL: /verify
```

### Search Methods
1. **Registration Number**
   - Format: `TM001234`
   - Example: `TM001234`

2. **Token ID**
   - Format: `1`, `2`, `3`
   - Example: `1`

### Results
- ✅ **Verified** - Green badge, full details, QR code
- ⏳ **Pending** - Yellow badge, awaiting admin approval
- ❌ **Not Found** - Red badge, not registered

### QR Code
- Auto-generated for all valid trademarks
- Click "Download QR Code" to save
- Use on products, packaging, marketing

---

## 👨‍💼 Admin Verification

### Access
```
URL: /admin
Required: Admin wallet address
```

### Workflow

1. **View Pending**
   - Click "Pending Review" tab
   - See all unverified trademarks

2. **Review Trademark**
   - Click "Review & Verify" button
   - Verification panel opens

3. **Check Details**
   - ✓ Company name
   - ✓ Registration number
   - ✓ Category
   - ✓ IPFS metadata
   - ✓ Blockchain data

4. **Take Action**
   - **Approve**: Click "Approve & Verify"
   - **Reject**: Click "Reject Application" + reason

---

## 🔗 API Endpoints

### Lookup Trademark
```http
GET /api/trademarks/lookup?registrationNumber=TM001234
GET /api/trademarks/lookup?tokenId=1
```

### Verify (Admin)
```http
POST /api/admin/verify-trademark
Body: { trademarkId, tokenId, adminAddress }
```

### Reject (Admin)
```http
POST /api/admin/reject-trademark
Body: { trademarkId, reason, adminAddress }
```

---

## 📱 QR Code Usage

### For Businesses
1. Generate QR code from verification page
2. Download high-resolution image
3. Print on:
   - Product packaging
   - Marketing materials
   - Business cards
   - Store displays

### For Customers
1. Scan QR code with phone camera
2. Opens verification page
3. See trademark authenticity
4. View company details

---

## 🔐 Smart Contract Functions

### User Functions
```solidity
getTokenIdByRegistration(string registrationNumber) → uint256
getTrademarkInfo(uint256 tokenId) → Trademark
```

### Admin Functions
```solidity
verifyTrademark(uint256 tokenId) // onlyOwner
```

---

## ⚡ Quick Commands

### Install Dependencies
```bash
npm install qrcode @types/qrcode
```

### Start Dev Server
```bash
npm run dev
```

### Deploy Contracts
```bash
npx hardhat run scripts/deploy.js --network amoy
```

---

## 🎯 Verification Checklist

### Before Approving
- [ ] Company name is legitimate
- [ ] Registration number is unique
- [ ] Category is appropriate
- [ ] IPFS data is accessible
- [ ] No conflicts with existing trademarks
- [ ] Owner address is valid

### After Approving
- [ ] Blockchain status updated
- [ ] Database record updated
- [ ] Admin log created
- [ ] Owner notified (if notifications enabled)

---

## 🚨 Common Issues

### "Trademark not found"
- Check registration number format
- Verify token ID exists
- Ensure blockchain sync is complete

### "Verification failed"
- Connect wallet
- Check admin privileges
- Verify network (Polygon Amoy)
- Ensure sufficient gas

### "QR code not generating"
- Check internet connection
- Verify qrcode package installed
- Clear browser cache

---

## 📊 Status Indicators

| Status | Color | Meaning |
|--------|-------|---------|
| ✅ Verified | Green | Admin approved, blockchain verified |
| ⏳ Pending | Yellow | Awaiting admin review |
| ❌ Rejected | Red | Admin rejected with reason |
| ❓ Not Found | Gray | Not registered on blockchain |

---

## 🔄 Verification States

```
Registration → Pending → Admin Review → Verified/Rejected
                                    ↓
                              QR Code Generated
```

---

## 💡 Best Practices

### For Users
- Save QR codes for offline verification
- Share verification links with customers
- Update trademark info if ownership changes

### For Admins
- Review all details thoroughly
- Provide clear rejection reasons
- Verify IPFS metadata accessibility
- Check for duplicate registrations
- Log all verification decisions

### For Developers
- Cache QR codes for performance
- Implement rate limiting
- Monitor verification metrics
- Regular blockchain sync
- Backup admin logs

---

## 📞 Support

**Issues?**
1. Check this guide
2. Review VERIFICATION_SYSTEM_GUIDE.md
3. Check admin logs
4. Contact system administrator

**Admin Access?**
- Add wallet address to `.env`:
  ```
  NEXT_PUBLIC_ADMIN_ADDRESS=0x...
  ```

---

## 🎓 Training Resources

- Full Guide: `VERIFICATION_SYSTEM_GUIDE.md`
- Demo Video: Coming soon
- API Docs: `/api/docs` (if available)
- Smart Contract: `contracts/TrademarkNFT.sol`

---

**Last Updated:** 2024
**Version:** 1.0.0
