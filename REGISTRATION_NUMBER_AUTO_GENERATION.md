# Registration Number Auto-Generation

## Overview
The registration number field now includes an auto-generation feature that creates unique registration numbers in a standardized format.

## Format
```
TM{YEAR}{NUMBER}
```

Examples:
- `TM2026001` - First trademark of 2026
- `TM2026002` - Second trademark of 2026
- `TM2026123` - 123rd trademark of 2026

## How It Works

### 1. User Interface
- Registration number field has a "Generate" button next to it
- Users can either:
  - Manually enter a registration number
  - Click "Generate" to auto-create one

### 2. Generation Logic
When the "Generate" button is clicked:

1. Gets the current year (e.g., 2026)
2. Fetches all existing trademarks from the database
3. Filters trademarks with registration numbers for the current year
4. Finds the highest number used (e.g., if TM2026005 exists, finds 5)
5. Increments by 1 and pads with leading zeros (e.g., 6 becomes 006)
6. Creates the new registration number (e.g., TM2026006)
7. Automatically checks if it already exists (validation)

### 3. Validation
- After generation, the system automatically checks if the number exists
- If it exists (rare edge case), user is notified
- User can generate again or manually enter a different number

## Benefits

### For Users
- No need to know the format
- No manual counting or tracking
- Guaranteed unique numbers
- Professional, standardized format

### For System
- Consistent format across all trademarks
- Easy to search and filter by year
- Sequential numbering for tracking
- Prevents duplicate registration numbers

## Technical Implementation

### Frontend (pages/register.tsx)
```typescript
const generateRegistrationNumber = async () => {
  // 1. Get current year
  const year = new Date().getFullYear();
  
  // 2. Fetch all trademarks
  const response = await fetch('/api/trademarks');
  const data = await response.json();
  
  // 3. Filter by current year
  const currentYearTrademarks = data.data.filter((tm: any) => {
    return tm.registrationNumber?.startsWith(`TM${year}`);
  });
  
  // 4. Find max number
  let maxNumber = 0;
  currentYearTrademarks.forEach((tm: any) => {
    const match = tm.registrationNumber.match(/TM\d{4}(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNumber) maxNumber = num;
    }
  });
  
  // 5. Generate next number
  const nextNumber = (maxNumber + 1).toString().padStart(3, '0');
  const newRegNumber = `TM${year}${nextNumber}`;
  
  // 6. Set and validate
  handleInputChange('registrationNumber', newRegNumber);
  await checkRegistrationNumber(newRegNumber);
};
```

### API Endpoint
Uses existing `/api/trademarks` endpoint to fetch all trademarks.

## User Experience

### Step-by-Step Flow
1. User navigates to registration page
2. Fills in company name and slogan
3. Reaches registration number field
4. Sees placeholder: "e.g., TM2026001"
5. Sees format hint: "Format: TM + Year + Number (e.g., TM2026001)"
6. Clicks "Generate" button
7. Button shows "Generating..." while processing
8. Registration number field auto-fills with unique number
9. System validates the number
10. User continues with registration

### Visual Feedback
- Generate button disables during generation
- Shows "Generating..." text while processing
- Error message if generation fails
- Success: field auto-fills with new number
- Format hint always visible for reference

## Edge Cases Handled

### 1. First Trademark of Year
- If no trademarks exist for current year
- Starts with TM{YEAR}001

### 2. Multiple Users Generating Simultaneously
- Each generation fetches fresh data
- Validation check catches duplicates
- User can regenerate if needed

### 3. Manual Entry Still Allowed
- Users can still type their own number
- Useful for importing existing trademarks
- Validation still applies

### 4. Year Rollover
- Automatically resets numbering each year
- TM2026999 → TM2027001 (next year)

## Testing Scenarios

### Test 1: First Generation
1. Empty database
2. Click Generate
3. Should create: TM2026001

### Test 2: Sequential Generation
1. TM2026001 exists
2. Click Generate
3. Should create: TM2026002

### Test 3: Gap in Numbers
1. TM2026001, TM2026003 exist (002 missing)
2. Click Generate
3. Should create: TM2026004 (continues from highest)

### Test 4: Manual Entry
1. Type "TM2026999"
2. Should validate and accept
3. Next generation should create TM20261000

### Test 5: Duplicate Detection
1. TM2026001 exists
2. Manually type "TM2026001"
3. Should show error: "Registration number already exists"

## Future Enhancements

### Possible Improvements
1. Add prefix customization (e.g., TM, REG, MARK)
2. Support different numbering schemes per category
3. Reserve number ranges for different regions
4. Batch generation for multiple trademarks
5. Export registration number report

### Database Optimization
- Add index on registrationNumber field
- Cache last used number per year
- Implement atomic counter for high-volume scenarios

## Presentation Talking Points

When demonstrating this feature:

1. **Problem**: "Users don't know what format to use for registration numbers"
2. **Solution**: "One-click auto-generation with standardized format"
3. **Demo**: Click Generate button, show instant result
4. **Benefits**: "Prevents errors, ensures uniqueness, professional format"
5. **Flexibility**: "Users can still enter manually if needed"

## Summary

The auto-generation feature makes trademark registration more user-friendly by:
- Eliminating format confusion
- Ensuring unique registration numbers
- Maintaining professional standards
- Providing instant, validated results
- Supporting both auto and manual entry

This feature is ready for your presentation tomorrow and demonstrates thoughtful UX design combined with robust backend logic.
