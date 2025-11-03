# UserLens Brand Assets

> **Complete logo system with light/dark mode support and comprehensive brand guidelines**

![UserLens Logo](userlens-logo.svg)

## 🚀 Quick Start

### React Component
```tsx
import { UserLensLogo, LogoIcon } from './components/UserLensLogo';

// Auto-detects system theme
<UserLensLogo size="lg" />

// Icon only
<LogoIcon size="md" />

// Force dark mode
<UserLensLogo size="lg" theme="dark" />
```

### HTML/CSS
```html
<!-- Light mode -->
<img src="userlens-logo.svg" width="48" height="48" alt="UserLens">

<!-- Dark mode -->
<img src="userlens-logo-dark.svg" width="48" height="48" alt="UserLens">
```

---

## 📦 What's Included

### 🎨 Logo Files
- **`userlens-logo.svg`** - Primary logo (light mode)
- **`userlens-logo-dark.svg`** - Dark mode variant
- **`UserLensLogo-Enhanced.tsx`** - React component with theme support
- **`favicon.ico`** + **PNG favicons** (16px-512px)

### 📚 Documentation
- **`UserLens-Brand-Guide.md`** - Complete brand guidelines
- **`logo-demo-complete.html`** - Interactive demo page
- **`README.md`** - This file

---

## 🎨 Logo Design

### Design Elements
- **User Icon**: Simplified human figure (circle + curved body)
- **Lens Shape**: Circular sweeping curves creating a lens effect
- **Directional Flow**: Forward-pointing negative space suggesting insight & progress
- **Modern Geometry**: Clean, scalable shapes optimized for digital use

### Color Specifications

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| **Gradient Start** | `#785ff9` (Purple) | `#ffffff` (White) |
| **Gradient End** | `#2924fc` (Blue) | `#e5e7eb` (Light Gray) |
| **Direction** | 180° vertical | 180° vertical |
| **Usage** | Light backgrounds | Dark backgrounds |

---

## 📏 Size Guidelines

### Digital Sizes
| Size | Dimensions | Use Case |
|------|------------|----------|
| **Small** | 32px | Mobile UI, compact layouts |
| **Medium** | 48px | Standard headers, navigation |
| **Large** | 64px | Hero sections, feature areas |
| **Extra Large** | 80px+ | Splash screens, large displays |

### Minimum Sizes
- **Digital**: 16px (favicons)
- **Print**: 0.5 inches
- **Recommended**: 32px for optimal clarity

---

## 🌙 Dark Mode Support

The logo automatically adapts to dark environments using:

### Automatic Detection
```tsx
// Detects system preference
<UserLensLogo theme="auto" />
```

### Manual Control
```tsx
// Force specific theme
<UserLensLogo theme="light" />
<UserLensLogo theme="dark" />
```

### CSS Media Query
```css
@media (prefers-color-scheme: dark) {
  .logo-light { display: none; }
  .logo-dark { display: block; }
}
```

---

## ⚛️ React Component API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'full' \| 'icon' \| 'wordmark'` | `'full'` | Logo variation |
| `layout` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Size preset |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Color theme |
| `showTagline` | `boolean` | `true` | Show tagline text |
| `animated` | `boolean` | `false` | Hover animations |
| `className` | `string` | `''` | Additional CSS classes |

### Convenience Components
```tsx
import { 
  LogoIcon,        // Icon only
  LogoWordmark,    // Text only
  LogoHorizontal,  // Horizontal layout
  LogoVertical,    // Vertical layout
  LogoLight,       // Light theme
  LogoDark         // Dark theme
} from './components/UserLensLogo';
```

### Theme Hook
```tsx
import { useTheme } from './components/UserLensLogo';

const { isDark } = useTheme();
```

---

## 🎯 Usage Guidelines

### ✅ Do's
- Use official logo files only
- Maintain proper clear space (0.5× logo height minimum)
- Ensure sufficient contrast with backgrounds
- Use dark mode variant on dark backgrounds
- Scale proportionally (maintain aspect ratio)
- Choose appropriate size for context

### ❌ Don'ts
- Don't stretch, skew, or distort the logo
- Don't change colors arbitrarily
- Don't add effects (shadows, glows, outlines)
- Don't rotate or flip the logo
- Don't place on busy or low-contrast backgrounds
- Don't use low-resolution or pixelated versions
- Don't recreate or modify the logo design

### Background Guidelines
**Preferred backgrounds:**
- Pure white or light gray (light mode)
- Dark charcoal (#1a1a1a) or black (dark mode)
- Subtle, low-contrast gradients
- Clean photography with clear space

**Avoid:**
- Busy patterns or textures
- Competing gradients or colors
- Low contrast combinations
- Cluttered imagery

---

## 📁 File Structure

```
brand-assets/
├── logos/
│   ├── userlens-logo.svg          # Primary logo
│   ├── userlens-logo-dark.svg     # Dark mode version
│   └── UserLensLogo-Enhanced.tsx  # React component
├── favicons/
│   ├── favicon.ico                # Multi-size ICO
│   ├── favicon-16x16.png         # Browser tabs
│   ├── favicon-32x32.png         # Standard
│   ├── favicon-48x48.png         # Windows taskbar
│   ├── favicon-64x64.png         # Windows tiles
│   ├── favicon-128x128.png       # Chrome store
│   ├── favicon-180x180.png       # Apple touch
│   ├── favicon-192x192.png       # Android
│   └── favicon-512x512.png       # PWA/High-res
├── documentation/
│   ├── UserLens-Brand-Guide.md    # Complete guidelines
│   ├── logo-demo-complete.html    # Interactive demo
│   └── README.md                  # This file
└── examples/
    └── usage-examples.html        # Implementation examples
```

---

## 🛠️ Installation & Setup

### 1. Copy Files
```bash
# React component
cp UserLensLogo-Enhanced.tsx src/components/

# SVG logos
cp userlens-logo*.svg public/assets/

# Favicons
cp favicon*.png favicon.ico public/
```

### 2. Import Component
```tsx
import { UserLensLogo } from './components/UserLensLogo';

function App() {
  return (
    <header>
      <UserLensLogo size="lg" />
    </header>
  );
}
```

### 3. Add Favicons to HTML
```html
<head>
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" sizes="32x32" href="/favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/favicon-180x180.png">
  <link rel="icon" sizes="192x192" href="/favicon-192x192.png">
  <link rel="manifest" href="/site.webmanifest">
</head>
```

---

## 🎨 CSS Custom Properties

```css
:root {
  /* Brand colors */
  --userlens-blue: #2924fc;
  --userlens-purple: #785ff9;
  --userlens-gradient: linear-gradient(180deg, #785ff9 0%, #2924fc 100%);
  
  /* Dark mode colors */
  --userlens-dark-gradient: linear-gradient(180deg, #ffffff 0%, #e5e7eb 100%);
  
  /* Supporting colors */
  --userlens-dark-charcoal: #1a1a1a;
  --userlens-medium-gray: #6b7280;
  --userlens-light-gray: #f3f4f6;
}

/* Usage example */
.brand-element {
  background: var(--userlens-gradient);
  color: var(--userlens-blue);
}
```

---

## 📱 Responsive Design

### Breakpoint Recommendations
```css
/* Mobile first approach */
.logo {
  width: 32px; /* Mobile */
}

@media (min-width: 768px) {
  .logo {
    width: 48px; /* Tablet */
  }
}

@media (min-width: 1024px) {
  .logo {
    width: 64px; /* Desktop */
  }
}
```

### React Responsive Example
```tsx
import { UserLensLogo } from './components/UserLensLogo';

function ResponsiveLogo() {
  return (
    <UserLensLogo 
      size="sm"
      className="md:hidden" // Mobile only
    />
    <UserLensLogo 
      size="lg"
      className="hidden md:block" // Desktop only
    />
  );
}
```

---

## 🔍 Accessibility

### Alt Text Guidelines
```html
<!-- Informative -->
<img src="userlens-logo.svg" alt="UserLens">

<!-- Decorative in branded context -->
<img src="userlens-logo.svg" alt="" role="presentation">

<!-- With context -->
<img src="userlens-logo.svg" alt="UserLens - User Research Platform">
```

### Contrast Requirements
- **Light mode**: Meets WCAG AA standards on white/light backgrounds
- **Dark mode**: Optimized for dark backgrounds with sufficient contrast
- **Minimum contrast ratio**: 4.5:1 for normal text, 3:1 for large text

---

## 🚀 Performance

### File Sizes
- **SVG logos**: ~2KB each (optimized)
- **React component**: ~8KB (uncompressed)
- **Favicons**: 1KB-15KB depending on size
- **Total package**: <50KB

### Optimization Tips
```html
<!-- Preload critical logos -->
<link rel="preload" href="/userlens-logo.svg" as="image">

<!-- Lazy load non-critical sizes -->
<img src="userlens-logo.svg" loading="lazy" alt="UserLens">
```

---

## 📊 Browser Support

### SVG Support
- ✅ All modern browsers (IE9+)
- ✅ Mobile browsers
- ✅ Print media

### React Component
- ✅ React 16.8+ (Hooks support)
- ✅ TypeScript ready
- ✅ SSR compatible

---

## 🔄 Updates & Versioning

### Current Version: 1.0.0

### Changelog
- **1.0.0** (November 2025)
  - Initial release with light/dark mode support
  - Complete React component with theme detection
  - Comprehensive brand guidelines
  - Full favicon suite

### Future Roadmap
- [ ] Animated logo variants
- [ ] Additional color themes
- [ ] Vue.js component
- [ ] Figma design system integration

---

## 🤝 Contributing

### Reporting Issues
Found a problem with the logo or components? Please check:

1. **Design Issues**: Verify against brand guidelines
2. **Technical Issues**: Test in multiple browsers/devices
3. **Performance Issues**: Check file sizes and optimization

### Requesting Changes
For logo modifications or new variants:

1. **Review brand guidelines** first
2. **Document use case** and requirements
3. **Provide context** for the change request

---

## 📞 Support & Resources

### Documentation
- 📖 **[Complete Brand Guide](UserLens-Brand-Guide.md)** - Comprehensive guidelines
- 🎨 **[Interactive Demo](logo-demo-complete.html)** - Live examples
- 💻 **[React Docs](UserLensLogo-Enhanced.tsx)** - Component documentation

### Quick References
- **Brand Colors**: Blue `#2924fc`, Purple `#785ff9`
- **Minimum Size**: 16px digital, 0.5" print
- **Clear Space**: 0.5× logo height minimum
- **File Format**: SVG preferred, PNG for raster needs

### Design Assets
- **Figma**: [Design system components] (coming soon)
- **Sketch**: [Symbol library] (coming soon)
- **Adobe**: [Creative Cloud library] (coming soon)

---

## 📄 License

UserLens brand assets are proprietary and intended for official UserLens projects only. 

**Permitted uses:**
- Official UserLens products and services
- Authorized partner integrations
- Press and media coverage (with permission)

**Restricted uses:**
- Commercial use without authorization
- Modification or derivative works
- Use that implies endorsement

---

## 🎉 Credits

**Design**: UserLens Design Team  
**Development**: Technical Content Team  
**Documentation**: Brand Guidelines Team  

*Created with ❤️ for the UserLens community*

---

**Need help?** Check the [Brand Guide](UserLens-Brand-Guide.md) or view the [Interactive Demo](logo-demo-complete.html)

**Version**: 1.0.0 | **Updated**: November 2025