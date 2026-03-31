# Get Test MATIC - Step by Step Guide

## Problem: "Invalid ETH mainnet balance"

Some faucets check if you have ETH on Ethereum mainnet to prevent abuse. Don't worry - there are many faucets that don't require this!

## ✅ RECOMMENDED: Alchemy Faucet (No ETH Required)

### Step 1: Get Your Wallet Address
1. Open MetaMask
2. Click on your account name at the top
3. Click "Copy" to copy your address (starts with 0x...)

### Step 2: Go to Alchemy Faucet
Open this link: https://www.alchemy.com/faucets/polygon-amoy

### Step 3: Sign In
Choose one option:
- Sign in with Google
- Sign in with GitHub  
- Sign in with Email

### Step 4: Request MATIC
1. Paste your wallet address in the field
2. Click "Send Me MATIC"
3. Wait 10-30 seconds

### Step 5: Verify You Received MATIC
1. Open MetaMask
2. Switch to "Polygon Amoy" network
3. Check your balance - should show ~0.5 MATIC

---

## Alternative Faucets (If Alchemy Doesn't Work)

### Option A: QuickNode Faucet
1. Go to: https://faucet.quicknode.com/polygon/amoy
2. Paste wallet address
3. Complete CAPTCHA
4. Get 0.1 MATIC

### Option B: Chainlink Faucet
1. Go to: https://faucets.chain.link/polygon-amoy
2. Connect MetaMask wallet
3. Click "Request"
4. Get 0.1 MATIC

### Option C: GetBlock Faucet
1. Go to: https://getblock.io/faucet/matic-amoy/
2. Enter wallet address
3. Complete verification
4. Get 0.05 MATIC

### Option D: All That Node (Requires Signup)
1. Go to: https://www.allthatnode.com/faucet/polygon.dsrv
2. Sign up (free account)
3. Request MATIC
4. Get 1 MATIC (highest amount!)

---

## How Much MATIC Do You Need?

For deploying and testing:
- Deploy contracts: ~0.05 MATIC
- Register 10 trademarks: ~0.02 MATIC
- Create 5 listings: ~0.005 MATIC
- **Total needed: ~0.1 MATIC**

So getting 0.5 MATIC from Alchemy is more than enough!

---

## Troubleshooting

### "Faucet is empty" or "Try again later"
- Faucets sometimes run out
- Try a different faucet from the list above
- Wait 24 hours and try again

### "Already claimed today"
- Most faucets limit to once per day
- Try a different faucet
- Use a different wallet address

### "Network error"
- Check your internet connection
- Try refreshing the page
- Try a different browser

### Still can't get MATIC?
You have two options:

**Option 1: Use Multiple Faucets**
- Get 0.1 from QuickNode
- Get 0.1 from Chainlink
- Get 0.05 from GetBlock
- Total: 0.25 MATIC (enough!)

**Option 2: Ask in Community**
- Polygon Discord: https://discord.gg/polygon
- Ask in #faucet channel
- Community members often help

---

## After Getting MATIC

### Verify Your Balance
```bash
# In MetaMask:
1. Switch to "Polygon Amoy" network
2. Check balance shows MATIC
3. Should see ~0.5 MATIC
```

### Deploy Contracts
```bash
# Run deployment:
npx hardhat compile
npx hardhat run scripts/deploy.js --network polygon
```

### Expected Output
```
Deploying contracts with account: 0x...
Account balance: 0.5 MATIC

Deploying TrademarkNFT contract...
TrademarkNFT deployed to: 0x...

Deploying TrademarkMarketplace contract...
TrademarkMarketplace deployed to: 0x...

✅ DEPLOYMENT COMPLETE!
```

---

## Quick Reference

| Faucet | Amount | Requires | Link |
|--------|--------|----------|------|
| Alchemy | 0.5 MATIC | Login | https://www.alchemy.com/faucets/polygon-amoy |
| QuickNode | 0.1 MATIC | CAPTCHA | https://faucet.quicknode.com/polygon/amoy |
| Chainlink | 0.1 MATIC | Wallet | https://faucets.chain.link/polygon-amoy |
| GetBlock | 0.05 MATIC | Email | https://getblock.io/faucet/matic-amoy/ |
| All That Node | 1.0 MATIC | Signup | https://www.allthatnode.com/faucet/polygon.dsrv |

---

## Success Checklist

- [ ] Got test MATIC from faucet
- [ ] Verified balance in MetaMask
- [ ] Switched to Polygon Amoy network
- [ ] Ready to deploy contracts

Once you have MATIC, proceed with deployment!
