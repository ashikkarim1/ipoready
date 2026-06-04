# Prospectus Builder & Validator Design System Alignment

## Overview
The Prospectus Validator Dashboard has been unified with the Prospectus Builder's design system. Both components now share identical typography, colors, spacing, and component patterns, creating a cohesive product experience.

**Commit**: `e37fb7e` - Align Prospectus Validator Dashboard with Builder design system

---

## Design System Unification

### 1. Typography System

#### Headings
```
h2: 30px (text-3xl), 700 weight, 1.2 line-height
   Used for: Section titles, major headings (e.g., "Overall Prospectus Strength")
   
h3: 24px (text-2xl), 700 weight, 1.3 line-height
   Used for: Section card names, subsection titles

h4: 20px (text-xl), 600 weight, 1.3 line-height
   Used for: Card titles, filter labels
```

#### Body Text
```
body: 16px (text-base), 400 weight, 1.5 line-height
   Used for: Main content, issue descriptions

body-sm: 14px (text-sm), 400 weight, 1.4 line-height
   Used for: Secondary information, gap descriptions
```

#### Labels & Captions
```
label: 14px (text-sm), 500 weight, 1.25 line-height
   Used for: Form labels, card field names

label-sm: 12px (text-xs), 600 weight, 1.2 line-height
   Used for: Badge text, severity indicators, filter buttons

label-xs: 11px (text-xs), 700 weight, 1.1 line-height
   Used for: Uppercase labels (Root Cause, Guidance, Fix Options)

caption-sm: 12px (text-xs), 400 weight, 1.3 line-height
   Used for: Empty state hints, small secondary text
```

#### Display Font
```
serif class: Plus Jakarta Sans, 700 weight, -0.02em letter-spacing
   Used for: Large metric numbers (e.g., "5.0/5.0" in strength gauge)
   Example: className="serif text-3xl md:text-4xl text-nav"
```

---

### 2. Color Palette

#### Primary & Accent Colors
```
Primary:          #1A1A1A (Primary text, primary buttons) → text-nav class
Accent (Red):     #E8312A (CTAs, brand highlights, danger actions)
Info (Blue):      #1D4ED8 (Information boxes, info badges)
```

#### Semantic States
```
ERROR STATE
  Color:        #DC2626 (error text, critical severity)
  Background:   #FEF2F2 (error-light)
  Border:       #FEE2E2 (error-pale)
  Dark variant: #B91C1C (hover/emphasis)

WARNING STATE
  Color:        #B45309 (warning text, moderate severity)
  Background:   #FFFBEB (warning-pale)
  Border:       #FEF3C7 (warning-soft)
  Dark variant: #D97706 (hover/emphasis)

SUCCESS STATE
  Color:        #2D7A5F (success text, strong status)
  Background:   #EAF5F0 (success-soft)
  Border:       #D1FAE5 (success light)
  Dark variant: #15803D (hover/emphasis)

INFO STATE
  Color:        #1D4ED8 (info text)
  Background:   #EFF6FF (info-soft)
  Border:       #BFDBFE (info-medium)
```

#### Text Colors
```
text-nav:        #1A1A1A (headings, main body)
text-muted:      #717171 (secondary text, hints)
text-tertiary:   #9A9A9A (captions, disabled, placeholders)
```

#### Background & Surfaces
```
bg-primary:      #F7F6F4 (page background, expanded content)
surface-primary: #FFFFFF (elevated surfaces, cards)
border:          #E5E4E0 (card borders, dividers)
surface-light:   #FAFAF9 (near-white distinction, empty states)
```

---

### 3. Component Styling

#### Cards
```css
.card {
  background: #FFFFFF;
  border: 1px solid #E5E4E0;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
}

.card-hover {
  /* Applied to all interactive cards */
  transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.card-hover:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06);
  border-color: #C8C7C2;
  transform: translateY(-1px);
}
```

#### Buttons
```
Primary (Red Accent):
  Background: #E8312A
  Text: #FFFFFF
  Padding: px-4 py-2.5 (12px 16px)
  Border-radius: rounded-full (999px)
  Font: text-sm font-medium
  Example: "Save Changes" button
  
Secondary (Outlined):
  Background: #FFFFFF
  Border: 1px solid #E5E4E0
  Text: #1A1A1A
  Padding: px-4 py-2.5
  Border-radius: rounded-full
  Font: text-sm font-medium
  Example: "View Guidance" button
  
Filter/Pill:
  Active: Background #E8312A, text white
  Inactive: Background #F7F6F4, text #1A1A1A
  Padding: px-3 py-1.5
  Font: label-sm font-semibold
```

#### Badges & Status Indicators
```
Weak Status:
  Background: #FEF2F2
  Border: 1px solid #FEE2E2
  Text: #DC2626
  
Passable Status:
  Background: #FFFBEB
  Border: 1px solid #FEF3C7
  Text: #B45309
  
Defendable/Strong Status:
  Background: #EAF5F0
  Border: 1px solid #D1FAE5
  Text: #2D7A5F
```

#### Strength Gauge
```
Gradient colors (based on strength value):
  Weak (≤1):        #DC2626 → #B91C1C
  Moderate (1-2.5): #B45309 → #92400E
  Good (2.5-4):     #65A30D → #4B7C0F
  Strong (>4):      #2D7A5F → #15803D

Display text uses text-nav (#1A1A1A)
Background arc: #E5E4E0
```

#### Issue Severity Cards
```
Critical (Red):
  Background: #FEF2F2
  Border: #FEE2E2
  Text: #DC2626
  
Moderate (Amber):
  Background: #FFFBEB
  Border: #FEF3C7
  Text: #B45309
  
Minor (Blue):
  Background: #EFF6FF
  Border: #BFDBFE
  Text: #1D4ED8
```

---

### 4. Spacing & Layout

#### Padding (6px grid)
```
p-3:  12px (inside issue cards, gap items)
p-4:  16px (inside section card headers)
p-6:  24px (inside section card content, summary card)
p-8:  32px (overall summary card)
```

#### Gaps
```
gap-2:  8px
gap-3:  12px
gap-4:  16px (main sections)
gap-6:  24px (between major components)
gap-8:  32px (layout gaps)
gap-12: 48px (between summary columns)
```

#### Spacing Classes
```
mb-2:  8px (small spacing)
mb-3:  12px (medium spacing)
mb-4:  16px (standard spacing)
mb-6:  24px (large spacing)
mb-8:  32px (very large spacing)

pt-4:  16px (padding top)
pt-6:  24px
```

---

### 5. Border & Divider Styling

```
All borders:       1px solid #E5E4E0
Recommended border-radius: 16px (cards), 999px (pills/buttons), 12px (section cards)

Dividers:
  - Use 1px solid #E5E4E0
  - Applied between content sections (pt-4 border-t border-[#E5E4E0])
```

---

## Implementation Details

### Section Card Header
```tsx
<button
  onClick={onToggle}
  className="w-full p-6 hover:bg-opacity-50 transition-colors flex items-center justify-between gap-4"
  style={{ background: isExpanded ? '#F7F6F4' : '#FFFFFF' }}
>
  {/* Content */}
</button>
```
- Padding: 24px (p-6)
- Gap: 16px (gap-4)
- Expanded background: #F7F6F4 (beige)
- Expanded border bottom: 1px solid #E5E4E0

### Issue Card
```tsx
<motion.div className="rounded-lg p-4" style={{ background: severity.bg, border: `1px solid ${severity.border}` }}>
```
- Padding: 16px (p-4)
- Border radius: 12px (rounded-lg)
- Colors: Dynamic based on severity (critical/moderate/minor)
- Dividers within: 1px solid with severity border color

### Overall Summary Card
```tsx
<div className="card p-8">
  <h2 className="h3 text-nav mb-8">Overall Prospectus Strength</h2>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
    {/* Gauge on left */}
    {/* Chart on right */}
  </div>
</div>
```
- Padding: 32px (p-8)
- Heading: h3 (24px, 700 weight)
- Column gap: 48px (gap-12)
- Metric display: serif font, text-3xl/text-4xl

### Filter Bar
```tsx
<div className="flex flex-wrap items-center gap-4 pb-6" style={{ borderBottom: '1px solid #E5E4E0' }}>
```
- Gap: 16px (gap-4)
- Bottom border: 1px solid #E5E4E0
- Bottom padding: 24px (pb-6)

---

## Validator-Specific Styling

### Main Dashboard Container
```tsx
<div className="space-y-8">  {/* 32px spacing between sections */}
```

### Section Grid
```tsx
className="grid grid-cols-1 lg:grid-cols-2 gap-6"  {/* 24px gap */}
```

### Completeness Progress Bar
```
Background: #E5E4E0
Fill: linear-gradient(to right, #2D7A5F, #2D7A5F)  /* Success green */
Height: 8px (h-2)
Border radius: rounded-full (999px)
```

### Empty State
```tsx
style={{ border: '2px dashed #E5E4E0', background: '#FAFAF9' }}
```
- Dashed border (2px) for distinction
- Light background surface-light color

---

## Migration Guide

### Before → After

**Typography**
- `text-3xl font-bold text-gray-900` → `h2 text-nav`
- `font-semibold text-gray-900` → `label font-semibold text-nav`
- `text-sm text-gray-600` → `body-sm text-text-muted`
- `text-xs font-semibold text-gray-700` → `label-sm text-text-muted`

**Colors**
- `text-gray-*` → Use semantic classes (`text-nav`, `text-text-muted`, `text-text-tertiary`)
- `bg-red-50` → `#FEF2F2` (error-light)
- `bg-yellow-50` → `#FFFBEB` (warning-pale)
- `bg-green-50` → `#EAF5F0` (success-soft)
- `bg-blue-50` → `#EFF6FF` (info-soft)

**Components**
- `rounded-lg` → `card` class for card styling
- `border border-gray-200` → `border` class (1px solid #E5E4E0)
- Custom borders → Use `style={{ border: '1px solid #E5E4E0' }}`

**Buttons**
- Primary CTA → `#E8312A` (accent red)
- Secondary → `#FFFFFF` with `#E5E4E0` border
- Padding → `px-4 py-2.5` (16px 12px)

---

## Files Modified

- `/src/components/prospectus/ProspectusValidatorDashboard.tsx` (commit: e37fb7e)
  - Updated all typography to use semantic classes
  - Unified color palette with Builder
  - Aligned spacing and layout
  - Updated card, button, and badge styling

---

## Verification Checklist

- [x] Strength gauge colors match Builder's severity indicators
- [x] All headings use h2/h3 classes
- [x] Body text uses body/body-sm classes
- [x] Error state uses #DC2626 (red)
- [x] Warning state uses #B45309 (amber)
- [x] Success state uses #2D7A5F (green)
- [x] Info state uses #1D4ED8 (blue)
- [x] Cards use #FFFFFF background with #E5E4E0 border
- [x] Buttons use red accent (#E8312A) for primary actions
- [x] Spacing follows 16px/24px/32px grid
- [x] Icons remain Lucide throughout
- [x] All semantic CSS classes applied consistently

---

## Future Consistency

When updating either Prospectus Builder or Validator:
1. Reference this document for color codes and typography classes
2. Use semantic classes from `globals.css` instead of Tailwind gray-* classes
3. Apply the spacing grid (6px units: 16px, 24px, 32px, 48px)
4. Maintain the card styling (border-radius: 16px, border: 1px solid #E5E4E0)
5. Use the exact color hex values provided here for consistency

---

## Support & Questions

For questions about color values, typography, spacing, or component styling, refer to:
- `/src/app/globals.css` - Complete color system and base classes
- Prospectus Builder (`/src/app/prospectus-builder/page.tsx`) - Reference implementation
- This document - Detailed specifications
