# Documents Page - Mission Control Design System Reference

## Color Palette

### Primary Colors
```css
/* Brand Accent - Used for CTAs, critical alerts */
--color-accent: #E8312A;                    /* Red */
--overlay-accent-subtle: rgba(232,49,42,0.2);
--color-error-soft: #FDECEB;                /* Light red background */
--color-error-pale: #FEE2E2;                /* Lighter red background */

/* Semantic Colors */
--color-success: #2D7A5F;                   /* Green - Approved */
--color-success-soft: #EAF5F0;              /* Light green background */
--color-success-bright: #22C55E;            /* Bright green for indicators */

--color-warning: #B45309;                   /* Amber - In Review */
--color-warning-dark: #D97706;              /* Darker amber */
--color-warning-soft: #FEF3C7;              /* Light amber background */

--color-info: #1D4ED8;                      /* Blue - Draft */
--color-info-soft: #EFF6FF;                 /* Light blue background */
--color-info-medium: #BFDBFE;               /* Medium blue */

/* Text Colors (Hierarchy) */
--color-text-primary: #1A1A1A;              /* Main text, headings */
--color-text-secondary: #717171;            /* Secondary labels */
--color-text-tertiary: #9A9A9A;             /* Captions, disabled */
--color-text-muted: #717171;                /* Hints, subtle text */

/* Background & Surfaces */
--color-bg-primary: #F7F6F4;                /* Page background */
--color-surface-primary: #FFFFFF;           /* Card backgrounds */
--color-surface-secondary: #F0EFED;         /* Grouped sections, hover */
--color-surface-light: #FAFAF9;             /* Near-white distinction */

/* Borders */
--color-border: #E5E4E0;                    /* Card borders */
--color-border-dark: #C8C7C2;               /* Strong dividers */
```

---

## Component Styles

### Page Container
```tsx
style={{
  background: 'var(--color-bg-primary)',    // #F7F6F4
  minHeight: '100vh',
  paddingTop: '2rem',
  paddingBottom: '3rem'
}}
```

### Header Section
```tsx
<h1 className="serif" style={{
  fontSize: '2rem',                          // 32px
  color: 'var(--color-text-primary)',       // #1A1A1A
  marginBottom: '0.5rem'                     // 8px
}}>

<p style={{
  color: 'var(--color-text-muted)',         // #717171
  fontSize: '0.875rem'                       // 14px
}}>
```

### Upload Button (Primary CTA)
```tsx
className="btn"
style={{
  background: 'var(--color-accent)',        // #E8312A
  color: 'var(--color-text-inverse)',       // #FFFFFF
  textDecoration: 'none',
  padding: '11px 22px',                     // btn default padding
  borderRadius: '999px'                      // pill shape
}}
```

### Stats Cards Grid
```tsx
style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: '1rem',                               // 16px
  marginBottom: '2rem'                       // 32px
}}
```

#### Individual Stat Card
```tsx
className="card"
style={{
  padding: '1rem',                           // 16px
  textAlign: 'center',
  cursor: 'pointer',
  border: '1px solid #E5E4E0',
  transition: 'all 0.2s ease',
  borderRadius: '16px',
  background: 'var(--color-surface-primary)' // #FFFFFF
}}
onMouseEnter={{
  transform: 'translateY(-2px)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)'
}}
```

#### Icon Container in Stats
```tsx
style={{
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  background: 'var(--color-success-soft)',  // Example: #EAF5F0
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 0.5rem'
}}
```

### Search Input
```tsx
style={{
  width: '100%',
  paddingLeft: '2.5rem',
  paddingRight: '1rem',
  paddingTop: '0.75rem',
  paddingBottom: '0.75rem',
  border: '1px solid #E5E4E0',
  borderRadius: '12px',
  background: 'var(--color-surface-primary)',
  color: 'var(--color-text-primary)',
  fontSize: '0.875rem',
  transition: 'border-color 0.2s ease'
}}
onFocus={{
  borderColor: 'var(--color-accent)'         // #E8312A
}}
```

### Group Header
```tsx
className="card card-hover"
style={{
  padding: '1.25rem 1.5rem',                 // 20px 24px
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: group.categoryGroup === 'Mandatory' 
    ? 'var(--color-error-soft)'              // #FDECEB
    : 'var(--color-surface-primary)',        // #FFFFFF
  borderColor: group.categoryGroup === 'Mandatory'
    ? 'rgba(232,49,42,0.2)'
    : '#E5E4E0'
}}
```

#### Group Icon
```tsx
style={{
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: group.categoryGroup === 'Mandatory'
    ? '#E8312A15'                            // Very light red
    : 'var(--color-surface-secondary)',      // #F0EFED
  flexShrink: 0
}}
```

#### Group Title
```tsx
<p style={{
  fontWeight: 600,
  color: 'var(--color-text-primary)',       // #1A1A1A
  fontSize: '0.95rem'                        // 15px
}}>

<p style={{
  fontSize: '0.75rem',                       // 12px
  color: 'var(--color-text-secondary)',      // #717171
  marginTop: '0.25rem'
}}>
```

#### Document Count Badge
```tsx
className="badge"
style={{
  background: 'var(--color-surface-secondary)', // #F0EFED
  color: 'var(--color-text-secondary)',         // #717171
  border: 'none',
  fontSize: '0.8rem'
}}
```

### Document Item Card
```tsx
className="card card-hover"
style={{
  padding: '1rem',                           // 16px
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  cursor: 'pointer',
  textDecoration: 'none',
  background: doc.status === 'approved'
    ? 'var(--color-success-soft)'            // #EAF5F0
    : 'var(--color-surface-primary)',        // #FFFFFF
  borderColor: doc.status === 'approved'
    ? 'rgba(45,122,95,0.2)'
    : '#E5E4E0',
  transition: 'all 0.2s ease'
}}
```

#### Document Icon Container
```tsx
style={{
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: statusStyle.bg,                // Dynamic based on status
  flexShrink: 0
}}
```

#### Document Title
```tsx
<p style={{
  fontWeight: 500,
  color: 'var(--color-text-primary)',       // #1A1A1A
  marginBottom: '0.25rem'
}}>
```

#### Document Metadata
```tsx
style={{
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  flexWrap: 'wrap',
  marginTop: '0.25rem'
}}

<span style={{
  fontSize: '0.75rem',                       // 12px
  color: 'var(--color-text-tertiary)',       // #9A9A9A
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem'
}}>
```

#### Status Badge
```tsx
className="badge"
style={{
  background: statusStyle.bg,                // Dynamic color
  color: statusStyle.color,                  // Dynamic color
  border: `1px solid ${statusStyle.border}`, // Dynamic border
  fontSize: '0.7rem',                        // 11px
  fontWeight: 600,
  textTransform: 'uppercase'
}}
```

#### Action Button
```tsx
style={{
  background: 'var(--color-surface-secondary)', // #F0EFED
  border: '1px solid #E5E4E0',
  borderRadius: '8px',
  padding: '0.5rem',                         // 8px
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--color-text-secondary)',      // #717171
  transition: 'all 0.2s ease'
}}
onMouseEnter={{
  background: '#E5E4E0',
  color: 'var(--color-text-primary)'         // #1A1A1A
}}
onMouseLeave={{
  background: 'var(--color-surface-secondary)',
  color: 'var(--color-text-secondary)'
}}
```

### Error Banner
```tsx
style={{
  marginBottom: '1.5rem',                    // 24px
  padding: '1rem',                           // 16px
  background: 'var(--color-error-soft)',     // #FDECEB
  border: '1px solid rgba(232,49,42,0.2)',
  borderRadius: '12px',
  display: 'flex',
  gap: '0.75rem'
}}
```

### Empty State
```tsx
className="card"
style={{
  padding: '3rem 2rem',                      // 48px 32px
  textAlign: 'center',
  background: 'var(--color-surface-light)',  // #FAFAF9
  borderColor: '#E5E4E0'
}}
```

### Unified Source Status Banner
```tsx
className="card"
style={{
  marginTop: '3rem',                         // 48px
  padding: '1.25rem',                        // 20px
  background: 'var(--color-info-soft)',      // #EFF6FF
  borderColor: 'rgba(29,78,216,0.2)',
  display: 'flex',
  gap: '1rem',                               // 16px
  alignItems: 'flex-start'
}}
```

---

## Status Indicator Styles

### Approved
```tsx
{
  bg: 'var(--color-success-soft)',           // #EAF5F0
  color: 'var(--color-success)',             // #2D7A5F
  border: 'rgba(45,122,95,0.2)',
  icon: CheckCircle2,
  label: 'Approved'
}
```

### In Review
```tsx
{
  bg: 'var(--color-warning-soft)',           // #FEF3C7
  color: 'var(--color-warning)',             // #B45309
  border: 'rgba(180,83,9,0.2)',
  icon: Clock,
  label: 'In Review'
}
```

### Draft
```tsx
{
  bg: 'var(--color-info-soft)',              // #EFF6FF
  color: 'var(--color-info)',                // #1D4ED8
  border: 'rgba(29,78,216,0.2)',
  icon: AlertTriangle,
  label: 'Draft'
}
```

### Archived
```tsx
{
  bg: 'var(--color-surface-secondary)',      // #F0EFED
  color: 'var(--color-text-secondary)',      // #717171
  border: 'rgba(197,196,192,0.3)',
  icon: ZapOff,
  label: 'Archived'
}
```

---

## Animation Specifications

### Page Animations
```tsx
// Header
initial={{ opacity: 0, y: -20 }}
animate={{ opacity: 1, y: 0 }}

// Stats Grid Items
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.1 + i * 0.05 }}

// Group Sections
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.2 + groupIndex * 0.1 }}

// Document Items
initial={{ opacity: 0, x: -10 }}
animate={{ opacity: 1, x: 0 }}
transition={{ delay: docIndex * 0.05 }}
```

### Expandable Animations
```tsx
// On Click
motion.div
initial={{ opacity: 0, height: 0 }}
animate={{ opacity: 1, height: 'auto' }}
exit={{ opacity: 0, height: 0 }}
transition={{ duration: 0.2 }}
```

### Hover Animations
```tsx
// Button Hover
whileHover={{ scale: 1.05 }}

// Card Hover
onMouseEnter: transform: translateY(-2px), enhanced shadow
onMouseLeave: restore original state
transition: 0.2s ease
```

### Loading Spinner
```tsx
animate={{ rotate: 360 }}
transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
```

---

## Typography Specifications

### Fonts
```css
--font-sans: "Hanken Grotesk", system-ui, sans-serif;
--font-display: "Plus Jakarta Sans", system-ui, sans-serif;
--font-mono: "Inter", monospace;
```

### Size & Weight Scale
| Element | Size | Weight | Line Height |
|---------|------|--------|---|
| Page Title (h1) | 2rem (32px) | bold | 1.2 |
| Group Header | 0.95rem (15px) | 600 | 1.4 |
| Document Name | base | 500 | normal |
| Metadata | 0.75rem (12px) | 400 | normal |
| Labels/Badges | 0.7-0.8rem | 600 | 1.2 |
| Captions | 0.75rem (12px) | 400 | 1.4 |

---

## Spacing Reference

| Value | Size | Usage |
|-------|------|-------|
| xs | 0.25rem | Small gaps |
| sm | 0.5rem | Icon-text spacing |
| md | 0.75rem | Item spacing |
| lg | 1rem | Card padding |
| xl | 1.5rem | Section spacing |
| xxl | 2rem | Major spacing |

---

## Shadow Specifications

```css
/* Light shadows for cards */
box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);

/* Hover/elevated shadows */
box-shadow: 0 4px 12px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06);
```

---

## Responsive Breakpoints

```css
xs: 320px   /* Extra small mobile */
sm: 640px   /* Small mobile (landscape) */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large desktop */
```

---

**Last Updated:** June 6, 2026  
**Design System Version:** 1.0  
**Status:** Complete Reference
