# Spline 3D Background - Usage Guide

## 📦 Component Overview

The `SplineBackground` component is a reusable wrapper that makes it easy to add the 3D Spline model to any page in your application.

## 🚀 Quick Start

### 1. Import the Component

```tsx
import SplineBackground from '@/components/SplineBackground';
```

### 2. Add to Your Page

```tsx
<section className="relative min-h-screen">
  {/* Add Spline Background */}
  <SplineBackground />
  
  {/* Your Content (must have relative z-10 or higher) */}
  <div className="relative z-10">
    <h1>Your Content Here</h1>
  </div>
</section>
```

## 🎨 Component Props

### All Available Props

```tsx
interface SplineBackgroundProps {
  scene?: string;              // Spline scene URL
  opacity?: number;            // 0-100 (default: 70)
  showGradient?: boolean;      // Show overlay gradient (default: true)
  gradientDirection?: string;  // 'left' | 'right' | 'top' | 'bottom' | 'none'
  gradientOpacity?: number;    // 0-100 (default: 95)
  zIndex?: number;             // Z-index value (default: 0)
  className?: string;          // Additional CSS classes
}
```

## 📝 Usage Examples

### Example 1: Default (Homepage Style)

```tsx
<section className="relative min-h-screen bg-gray-950">
  <SplineBackground />
  
  <div className="relative z-10 container mx-auto px-4 py-20">
    <h1 className="text-6xl font-bold text-white">Welcome</h1>
  </div>
</section>
```

### Example 2: Subtle Background (50% opacity)

```tsx
<section className="relative min-h-screen bg-gray-950">
  <SplineBackground 
    opacity={50}
    gradientDirection="left"
  />
  
  <div className="relative z-10">
    {/* Your content */}
  </div>
</section>
```

### Example 3: No Gradient Overlay

```tsx
<section className="relative min-h-screen bg-gray-950">
  <SplineBackground 
    opacity={80}
    showGradient={false}
  />
  
  <div className="relative z-10">
    {/* Your content */}
  </div>
</section>
```

### Example 4: Custom Scene

```tsx
<section className="relative min-h-screen bg-gray-950">
  <SplineBackground 
    scene="https://prod.spline.design/YOUR-SCENE-ID/scene.splinecode"
    opacity={60}
  />
  
  <div className="relative z-10">
    {/* Your content */}
  </div>
</section>
```

### Example 5: Top Gradient (for headers)

```tsx
<section className="relative h-96 bg-gray-950">
  <SplineBackground 
    opacity={70}
    gradientDirection="bottom"
  />
  
  <div className="relative z-10">
    {/* Header content */}
  </div>
</section>
```

## 🎯 Page-Specific Examples

### Marketplace Page

```tsx
import SplineBackground from '@/components/SplineBackground';

export default function Marketplace() {
  return (
    <>
      <Navbar />
      
      {/* Hero Section with 3D Background */}
      <section className="relative bg-gray-950 py-20">
        <SplineBackground 
          opacity={40}
          gradientDirection="bottom"
        />
        
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-5xl font-bold text-white mb-4">
            Trademark Marketplace
          </h1>
          <p className="text-xl text-gray-300">
            Discover and license verified trademarks
          </p>
        </div>
      </section>
      
      {/* Rest of your page */}
      <section className="bg-gray-900 py-20">
        {/* Marketplace content */}
      </section>
      
      <Footer />
    </>
  );
}
```

### Dashboard Page

```tsx
import SplineBackground from '@/components/SplineBackground';

export default function Dashboard() {
  return (
    <>
      <Navbar />
      
      {/* Dashboard with subtle 3D background */}
      <div className="relative min-h-screen bg-gray-950">
        <SplineBackground 
          opacity={30}
          showGradient={false}
        />
        
        <div className="relative z-10 container mx-auto px-4 py-10">
          <h1 className="text-4xl font-bold text-white mb-8">
            My Dashboard
          </h1>
          
          {/* Dashboard content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats cards */}
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}
```

### Verify Page

```tsx
import SplineBackground from '@/components/SplineBackground';

export default function Verify() {
  return (
    <>
      <Navbar />
      
      {/* Verification section with 3D background */}
      <section className="relative bg-gray-950 py-16">
        <SplineBackground 
          opacity={50}
          gradientDirection="right"
        />
        
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-5xl font-bold text-white mb-6">
            Verify Trademark
          </h1>
          
          {/* Verification form */}
        </div>
      </section>
      
      <Footer />
    </>
  );
}
```

### Register Page

```tsx
import SplineBackground from '@/components/SplineBackground';

export default function Register() {
  return (
    <>
      <Navbar />
      
      {/* Registration with 3D background */}
      <div className="relative min-h-screen bg-gray-950">
        <SplineBackground 
          opacity={35}
          gradientDirection="left"
        />
        
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-white mb-8">
              Register Your Trademark
            </h1>
            
            {/* Registration form */}
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}
```

## 🎨 Styling Tips

### 1. Content Readability

Always ensure your content has proper contrast:

```tsx
{/* Good - High contrast */}
<div className="relative z-10 bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8">
  <h1 className="text-white">Clear Text</h1>
</div>

{/* Better - Glass morphism */}
<div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
  <h1 className="text-white">Clear Text</h1>
</div>
```

### 2. Z-Index Layering

```tsx
{/* Background Layer */}
<SplineBackground zIndex={0} />

{/* Content Layer */}
<div className="relative z-10">
  {/* Your content */}
</div>

{/* Modal/Overlay Layer */}
<div className="relative z-50">
  {/* Modals, dropdowns, etc. */}
</div>
```

### 3. Section Heights

```tsx
{/* Full screen */}
<section className="relative min-h-screen">
  <SplineBackground />
</section>

{/* Fixed height */}
<section className="relative h-96">
  <SplineBackground />
</section>

{/* Auto height with padding */}
<section className="relative py-20">
  <SplineBackground />
</section>
```

## ⚡ Performance Tips

### 1. Use Lower Opacity for Better Performance

```tsx
{/* Lighter load */}
<SplineBackground opacity={30} />

{/* Heavier load */}
<SplineBackground opacity={90} />
```

### 2. Disable on Mobile (Optional)

```tsx
import { useEffect, useState } from 'react';

export default function MyPage() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);
  
  return (
    <section className="relative min-h-screen">
      {!isMobile && <SplineBackground />}
      
      <div className="relative z-10">
        {/* Content */}
      </div>
    </section>
  );
}
```

### 3. Lazy Load on Scroll

```tsx
import { useEffect, useState } from 'react';

export default function MyPage() {
  const [showSpline, setShowSpline] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowSpline(true), 500);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <section className="relative min-h-screen">
      {showSpline && <SplineBackground />}
      
      <div className="relative z-10">
        {/* Content */}
      </div>
    </section>
  );
}
```

## 🎭 Opacity Recommendations

| Use Case | Opacity | Description |
|----------|---------|-------------|
| Hero Section | 70-80% | Prominent, eye-catching |
| Content Pages | 40-50% | Subtle, not distracting |
| Forms | 30-40% | Minimal, focus on content |
| Dashboards | 20-30% | Very subtle background |
| Modals | 0-20% | Barely visible or none |

## 🌈 Gradient Direction Guide

### When to Use Each Direction

**Right (default):**
- Content on the left
- Reading flow left-to-right
- Hero sections

**Left:**
- Content on the right
- Sidebar layouts
- Alternative hero style

**Bottom:**
- Header sections
- Top navigation areas
- Short sections

**Top:**
- Footer sections
- Bottom content areas
- Inverted layouts

**None:**
- Full 3D visibility
- Minimal content
- Artistic pages

## 🔧 Customization Examples

### Custom Colors

```tsx
{/* Modify the component to use custom colors */}
<SplineBackground 
  className="bg-blue-950"  // Custom background
/>
```

### Multiple Scenes

```tsx
{/* Different scenes for different sections */}
<section className="relative h-screen">
  <SplineBackground 
    scene="https://prod.spline.design/SCENE-1/scene.splinecode"
  />
</section>

<section className="relative h-screen">
  <SplineBackground 
    scene="https://prod.spline.design/SCENE-2/scene.splinecode"
  />
</section>
```

## 🐛 Troubleshooting

### Issue: Content Not Visible

**Solution:** Ensure content has proper z-index

```tsx
{/* Wrong */}
<div>Content</div>

{/* Correct */}
<div className="relative z-10">Content</div>
```

### Issue: 3D Model Not Loading

**Solution:** Check dependencies and scene URL

```bash
npm install @splinetool/react-spline @splinetool/runtime
```

### Issue: Performance Problems

**Solution:** Reduce opacity or disable on mobile

```tsx
<SplineBackground opacity={30} />
```

## 📱 Mobile Considerations

### Responsive Opacity

```tsx
{/* Desktop: 70%, Mobile: 40% */}
<SplineBackground 
  opacity={typeof window !== 'undefined' && window.innerWidth < 768 ? 40 : 70}
/>
```

### Conditional Rendering

```tsx
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function MyPage() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <section className="relative min-h-screen">
      <SplineBackground 
        opacity={isMobile ? 30 : 70}
      />
    </section>
  );
}
```

## ✅ Best Practices

1. **Always use relative positioning** on parent container
2. **Set z-10 or higher** on content elements
3. **Use backdrop-blur** for better text readability
4. **Test on mobile devices** for performance
5. **Consider opacity** based on content importance
6. **Use gradient overlays** for text-heavy sections
7. **Keep it subtle** on form pages
8. **Make it prominent** on landing pages

## 🎯 Quick Reference

```tsx
{/* Minimal - Subtle background */}
<SplineBackground opacity={30} showGradient={false} />

{/* Balanced - Good for most pages */}
<SplineBackground opacity={50} />

{/* Prominent - Hero sections */}
<SplineBackground opacity={70} />

{/* Maximum - Full visibility */}
<SplineBackground opacity={90} showGradient={false} />
```

## 📚 Additional Resources

- **Spline Website:** https://spline.design/
- **Component File:** `components/SplineBackground.tsx`
- **Example Usage:** `pages/index.tsx`
- **Documentation:** `SPLINE_3D_INTEGRATION.md`

---

**Component Version:** 1.0.0
**Last Updated:** 2024
**Status:** Production Ready
