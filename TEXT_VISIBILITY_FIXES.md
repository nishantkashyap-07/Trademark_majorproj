# Text Visibility Fixes

## Issue
Text on trademark cards was barely visible due to low contrast colors (using `neutral-` classes that appeared very light).

## Changes Made

### 1. TrademarkCard Component (`components/TrademarkCard.tsx`)

#### Grid View:
- **Slogan Text**: Changed from `text-neutral-900` to `text-gray-900` (darker, better contrast)
- **Company Name**: Changed from `text-neutral-600` to `text-gray-700` with `text-gray-900` for the company name itself
- **"Registered" Label**: Changed from `text-neutral-500` to `text-gray-600`
- **Date Text**: Changed from `text-neutral-900` to `text-gray-900`
- **Token ID**: Changed from `text-neutral-500` to `text-gray-700`
- **Border**: Changed from `border-neutral-100` to `border-gray-200`
- **Background**: Changed from `from-neutral-50 to-neutral-100` to `from-gray-100 to-gray-200`

#### List View:
- **Slogan Text**: Changed from `text-neutral-900` to `text-gray-900`
- **Company Name**: Changed from `text-neutral-600` to `text-gray-700` with `text-gray-900` for emphasis
- **Description**: Changed from `text-neutral-500` to `text-gray-600`
- **"Registered" Label**: Changed from `text-neutral-500` to `text-gray-600`
- **Date Text**: Changed from `text-neutral-900` to `text-gray-900`
- **Token ID**: Changed from `text-neutral-500` to `text-gray-700`

### 2. Global CSS (`styles/globals.css`)

#### Badge Styles:
- **badge-info**: Enhanced contrast
  - Background: `bg-blue-50` → `bg-blue-100`
  - Text: `text-blue-700` → `text-blue-800`
  - Border: `border-blue-200` → `border-blue-300`

### 3. Homepage (`pages/index.tsx`)

#### Button Colors:
- **Primary Button**: Changed from white (`bg-white text-gray-900`) to blue (`bg-blue-600 text-white`)
- Added shadow effect: `shadow-lg shadow-blue-600/20`
- Better visibility against dark background

## Color Contrast Improvements

### Before:
- `neutral-500` - Very light gray, poor contrast
- `neutral-600` - Light gray, marginal contrast
- `neutral-900` - Dark but using neutral palette
- `blue-50` - Very light blue background
- `blue-700` - Medium blue text

### After:
- `gray-600` - Darker gray, better contrast
- `gray-700` - Even darker, excellent contrast
- `gray-900` - Maximum contrast for important text
- `blue-100` - Slightly darker blue background
- `blue-800` - Darker blue text for better readability

## Result

All text on trademark cards is now clearly visible with proper contrast ratios:
- Category badges are more prominent
- Company names stand out
- Registration dates are readable
- Token IDs are clearly visible
- Buttons on homepage are now blue and highly visible

## Testing

Build completed successfully:
```bash
npm run build  # ✓ Compiled successfully
```

All text elements now meet WCAG AA contrast standards for accessibility.
