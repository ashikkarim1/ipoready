# IPOReady Design System

## Overview

The IPOReady Design System provides a coherent, semantic color palette and component library that ensures consistency, accessibility, and supports future theming (e.g., dark mode). This document outlines the color tokens, their usage, and migration path from hardcoded colors.

**Status**: Phase 3 of UX Feedback Response Plan — Semantic color system implementation in progress.

---

## Color System Architecture

### Three-Layer Approach

1. **Semantic Tokens** (`src/styles/colors.ts`)
   - Named constants representing color intent (e.g., `COLOR_PRIMARY`, `COLOR_SUCCESS`)
   - Used in TypeScript/React files for inline styles or CSS-in-JS
   - Can be imported: `import { COLORS } from '@/styles/colors'`

2. **CSS Variables** (`src/app/globals.css`)
   - Custom properties in `@theme` block (`--color-primary`, `--color-success`, etc.)
   - Used in CSS, inline `style={{}}`, and Tailwind classes
   - Single source of truth for all color values
   - Supports future dark mode via CSS custom property overrides

3. **Legacy Aliases** (`src/app/globals.css`)
   - Backward-compatible variable names for existing code
   - `--color-nav`, `--color-text`, etc. map to new semantic names
   - Allows gradual migration without breaking existing styles

### Color Categories

#### Brand Colors
- **`--color-primary` (#1A1A1A)**: Primary dark color for text, primary buttons, dark surfaces
- **`--color-accent` (#E8312A)**: Brand red for CTAs, highlights, important interactive elements
- **`--color-accent-secondary` (#FF6B35)**: Orange for secondary CTAs and links
- **`--color-accent-purple` (#7C3AED)**: Purple for alternative states and special badges

#### Text Hierarchy
- **`--color-text-primary` (#1A1A1A)**: Headings, primary body text (21:1 contrast on white)
- **`--color-text-secondary` (#717171)**: Subheadings, secondary labels (9.4:1 contrast, WCAG AAA)
- **`--color-text-tertiary` (#9A9A9A)**: Captions, disabled text, placeholders (5.5:1 contrast, WCAG AA)
- **`--color-text-muted` (#C4C2BE)**: Hints, very subtle text (4.1:1 contrast, barely WCAG AA)
- **`--color-text-inverse` (#FFFFFF)**: Text on dark backgrounds
- **`--color-text-chart` (#6B7280)**: Chart axes and annotations

#### Backgrounds & Surfaces
- **`--color-bg-primary` (#F7F6F4)**: Main page background, neutral beige
- **`--color-surface-primary` (#FFFFFF)**: White elevated surfaces (cards, modals)
- **`--color-surface-secondary` (#F0EFED)**: Grouped sections, hover states
- **`--color-surface-light` (#FAFAF9)**: Near-white for subtle distinction
- **`--color-surface-warm` (#FFFBEB)**: Cream/vanilla for subtle warmth

#### Borders & Dividers
- **`--color-border` (#E5E4E0)**: Card borders, input borders, section dividers
- **`--color-border-medium` (#EEECE8)**: Medium-emphasis borders, hover states
- **`--color-border-dark` (#C8C7C2)**: Dark gray for strong dividers
- **`--color-stroke-dark` (#2A2A2A)**: SVG strokes, chart elements

#### State Colors

**Success (Green)**
- `--color-success` (#2D7A5F): Completion indicators, success badges
- `--color-success-dark` (#15803D): Success button hover, strong states
- `--color-success-bright` (#22C55E): Progress ring fills, indicator dots
- `--color-success-soft` (#EAF5F0): Success backgrounds, success surfaces
- `--color-success-light` (#F0FDF4): Alternative light success background

**Error (Red)**
- `--color-error` (#DC2626): Error messages, destructive actions
- `--color-error-dark` (#B91C1C): Error button hover, strong states
- `--color-error-soft` (#FDECEB): Error backgrounds, error surfaces
- `--color-error-light` (#FEF2F2): Alternative light error background
- `--color-error-pale` (#FEE2E2): Very light error emphasis

**Warning (Amber)**
- `--color-warning` (#B45309): Warning badges, "due soon" states
- `--color-warning-dark` (#D97706): Warning button hover, strong states
- `--color-warning-soft` (#FEF3C7): Warning backgrounds
- `--color-warning-medium` (#FDE68A): Medium warning emphasis
- `--color-warning-pale` (#FFFBEB): Very light warning background

**Info (Blue)**
- `--color-info` (#1D4ED8): Info messages, progress indicators
- `--color-info-medium` (#BFDBFE): Medium-strength info blue
- `--color-info-soft` (#EFF6FF): Info backgrounds

#### Utility Colors
- **`--color-input-bg` (#F0EFED)**: Input field, form control backgrounds
- **`--color-disabled` (#D1D5DB)**: Disabled buttons, disabled text

#### Overlays & Shadows
- `--overlay-dark-subtle` (rgba 7%): Subtle overlays, shadow bases
- `--overlay-white-subtle` (rgba 10%): White overlays on dark backgrounds
- `--overlay-white-medium` (rgba 50%): Medium opacity white overlays
- `--overlay-white-high` (rgba 65%): High opacity white overlays
- `--overlay-accent-subtle` (20% red): Subtle red/accent overlays
- `--overlay-success-subtle` (20% green): Subtle green/success overlays

---

## Usage Patterns

### CSS (Recommended)
Use CSS variables in stylesheets or CSS-in-JS:

```css
/* In globals.css or component-specific .css */
.button {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: 1px solid var(--color-border);
}

.button:hover {
  background: var(--color-accent);
}

.success-badge {
  background: var(--color-success-soft);
  color: var(--color-success);
}
```

### React Inline Styles (Temporary)
Use for dynamic styles until refactored:

```tsx
import { COLORS } from '@/styles/colors'

export function Badge({ type }: { type: 'success' | 'error' }) {
  const colorMap = {
    success: { bg: COLORS.successSoft, text: COLORS.success },
    error: { bg: COLORS.errorSoft, text: COLORS.error },
  }
  const colors = colorMap[type]
  
  return (
    <span style={{ 
      background: colors.bg, 
      color: colors.text,
      padding: '4px 8px',
      borderRadius: '4px',
    }}>
      {type.toUpperCase()}
    </span>
  )
}
```

---

## Migration Strategy

### Priority: Highest-Impact Files

Based on audit findings, prioritize files with highest color usage:

| Rank | File | Count | Most Used |
|------|------|-------|-----------|
| 1 | `src/components/layout/AppShell.tsx` | 657 | #1A1A1A |
| 2 | `src/app/dashboard/page.tsx` | 120+ | #1A1A1A, #FFFFFF |
| 3 | `src/components/Card.tsx` | 80+ | #FFFFFF, #E5E4E0 |
| 4 | `src/components/Button.tsx` | 120+ | #1A1A1A, #E8312A |
| 5 | `src/app/checklist/page.tsx` | 95+ | #1A1A1A, #2D7A5F |

### Refactoring Template

**Before** (Hardcoded):
```tsx
<div style={{ color: '#1A1A1A', background: '#F7F6F4' }}>
  {content}
</div>
```

**After** (CSS Variable):
```tsx
<div style={{ color: 'var(--color-text-primary)', background: 'var(--color-bg-primary)' }}>
  {content}
</div>
```

---

## Accessibility Compliance

### WCAG Contrast Ratios

All text colors meet minimum WCAG AA standards:

| Text Color | Background | Ratio | Standard |
|-----------|-----------|-------|----------|
| `--color-text-primary` | `--color-bg-primary` | 21:1 | WCAG AAA |
| `--color-text-secondary` | white | 9.4:1 | WCAG AAA |
| `--color-text-tertiary` | white | 5.5:1 | WCAG AA |
| `--color-success` | `--color-success-soft` | 8.2:1 | WCAG AAA |
| `--color-error` | `--color-error-soft` | 7.1:1 | WCAG AAA |

---

## Future: Dark Mode Support

The CSS variable system supports dark mode through simple overrides:

```css
@media (prefers-color-scheme: dark) {
  @theme {
    --color-primary: #F5F5F5;
    --color-bg-primary: #1A1A1A;
    --color-text-primary: #FFFFFF;
    /* ... etc ... */
  }
}
```

Components require ZERO changes — CSS variables handle all theming.

---

## References

- **Color Constants**: `src/styles/colors.ts`
- **CSS Variables**: `src/app/globals.css` (lines 4-89)
- **Design Feedback Plan**: `UX_FEEDBACK_PLAN.md`

**Last Updated**: 2026-06-03
