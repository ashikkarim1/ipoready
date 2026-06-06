# Background Color & Card Styling Consistency Audit

**Date:** June 7, 2026  
**Scope:** All pages in `src/app/`  
**Standard:** IPOReady Design System

## Design System Standards

### Primary Colors
- **Page Background:** `bg-primary` / `#F7F6F4` (warm off-white)
- **Card Background:** `white` / `#FFFFFF` (pure white)
- **Primary Accent:** `#E8312A` (red) — used for status badges and CTAs only
- **Success Color:** `#2D7A5F` (dark green) — for positive status indicators
- **Additional Accents:** `#B91C1C`, `#059669`, etc. — for status-specific badges

---

## FINDINGS: Non-Standard Background Usage

### CRITICAL ISSUES - Wide-Spread Pattern Drift

#### **1. Landing Page (`src/app/page.tsx`)** ⚠️ HIGH PRIORITY

| Line | Element | Current Style | Issue | Recommended |
|------|---------|---------------|-------|-------------|
| 137 | Section background | `bg-gray-50` | Section uses gray instead of primary | Remove class, use white cards if needed |
| 178 | Section background | `bg-gradient-to-b from-red-50 to-white` | Gradient mixing colors | Use `#F7F6F4` background only |
| 190 | Modal header | `bg-gray-100` | Modal uses gray-100 instead of white | Change to `white` |
| 341 | Stats card | `bg-blue-50` | Colored background on information card | Use white with colored accent border |
| 345 | Stats card | `bg-green-50` | Colored background | Use white with colored accent border |
| 349 | Stats card | `bg-yellow-50` | Colored background | Use white with colored accent border |
| 429 | Section background | `bg-blue-50` | Full section uses blue-50 | Use `#F7F6F4` or white cards |
| 478 | Stat boxes | `bg-gradient-to-br from-red-50 to-orange-50` | Gradient mixing colors | Solid white card with border-left accent |
| 508 | Stat boxes | `bg-blue-50` | Stat boxes use color background | Use white card with colored left border |

**Pattern Identified:** All colored stat cards (blue-50, green-50, yellow-50) should be white cards with colored left borders matching existing `.card` pattern.

---

#### **2. Pricing Page (`src/app/pricing/page.tsx`)** ⚠️ CRITICAL

| Line | Element | Current Style | Issue | Recommended |
|------|---------|---------------|-------|-------------|
| 310 | Alert box | `#FEF3C7` (yellow-100 hex) | Yellow background for warnings | Use `white` with `border-l-4 border-yellow-500` |
| 320 | Alert sub | `rgba(180,83,9,0.1)` (custom orange) | Custom inline color | Standardize to design tokens |
| 344 | Card background | `#FDECEB` (red-50 hex) | Red tinted card background | Change to `white` |
| 367 | Card background | `#EAF5F0` (green-50 hex) | Green tinted card background | Change to `white` |
| 388 | Card container | `white` border `#E5E4E0` | ✓ Correct card style | KEEP AS IS |
| 400 | Alert content | `#F0FDF4` (green-50 hex) | Green background | Use `white` with green border |
| 416 | Default section | `#F7F6F4` (primary) | ✓ Correct page background | KEEP AS IS |
| 448 | Card container | `white` with dark border | ✓ Correct card style | KEEP AS IS |
| 466 | Alert content | `#EFF6FF` (blue-50 hex) | Blue background | Use `white` with blue border |
| 482 | Default section | `#F7F6F4` (primary) | ✓ Correct page background | KEEP AS IS |
| 514 | Card container | `white` with border | ✓ Correct card style | KEEP AS IS |
| 526 | Alert content | `#F0FDF4` (green-50 hex) | Green background | Use `white` with green border |
| 559 | Center section | `#F7F6F4` (primary) | ✓ Correct page background | KEEP AS IS |
| 580 | FAQ toggle | `#F7F6F4` vs `white` | Conditional color switching | Use CSS class toggle or single style |
| 605 | Footer CTA | `#1A1A1A` (black) | Dark background CTA | ✓ Acceptable for emphasis |
| 621 | Banner | `#FEF3C7` (yellow-100) | Yellow background | Use white with yellow border |
| 630 | Footer | `#FFFFFF` | ✓ Correct white | KEEP AS IS |
| 639 | Icon container | `#1A1A1A` (black) | Black background for icon | ✓ Acceptable for dark accent |
| 655-669 | Footer links | `#F7F6F4` (primary) | Footer item backgrounds | Use white or transparent |
| 793 | Section divider | `#F7F6F4` (primary) | ✓ Correct background | KEEP AS IS |
| 803 | Toggle group | `#EFEFED` (custom gray) | Custom gray instead of standard | Use `#F7F6F4` or white |

**Pattern Identified:** Pricing page extensively uses colored hex codes (`#FEF3C7`, `#EAF5F0`, etc.) instead of white cards with colored accents. This is the most inconsistent page.

---

#### **3. Dashboard Compliance Pages** ⚠️ MEDIUM PRIORITY

**File:** `src/app/dashboard/compliance/page.tsx`

| Line | Element | Current Style | Issue | Recommended |
|------|---------|---------------|-------|-------------|
| 488 | Hover state | `hover:bg-slate-50` | Slate color on hover | Use `bg-primary` or white |

**File:** `src/app/dashboard/compliance/listing-rules/page.tsx`
- Multiple instances of `bg-gray-*`, `bg-blue-*`, `bg-green-*`, `bg-red-*`, `bg-yellow-*`, `bg-orange-*`
- These are likely for status badges and should remain (e.g., `bg-green-100` for "compliant")

**Pattern Identified:** Dashboard uses color classes correctly for status badges. Cards properly use white backgrounds.

---

#### **4. Data Room Page (`src/app/dashboard/investor-readiness/data-room/page.tsx`)** ⚠️ HIGH PRIORITY

| Line | Element | Current Style | Issue | Recommended |
|------|---------|---------------|-------|-------------|
| 132, 141 | Page background | `min-h-screen bg-gray-50` | Page uses gray-50 instead of primary | Change to `bg-primary` or remove (default) |
| 155, 354, 433 | Button | `bg-blue-600` | Blue button (action color) | ✓ Acceptable for CTA buttons |
| 184 | Alert box | `bg-red-50` | Red background alert | Use `white` with red left border |
| 239 | Info box | `bg-blue-50` | Blue background info | Use `white` with blue left border |
| 288 | Badge | `bg-gray-100` | Gray background badge | ✓ Acceptable for status indicators |
| 329, 332 | Hover state | `hover:bg-gray-100` | Gray hover background | Use subtle primary hover |
| 365 | Avatar placeholder | `bg-gray-200` | Gray placeholder | ✓ Acceptable for media placeholder |
| 373-375 | Status badges | `bg-green-100`, `bg-yellow-100`, `bg-gray-100` | Colored status badges | ✓ Correct badge pattern |

**Pattern Identified:** Page background incorrectly set to `bg-gray-50`. Alert/info boxes use colored backgrounds instead of white + border.

---

#### **5. Public Pages (Disclaimer, Privacy, Terms, etc.)** ⚠️ MEDIUM PRIORITY

**Files Affected:**
- `src/app/disclaimer/page.tsx`
- `src/app/privacy/page.tsx`
- `src/app/terms/page.tsx`
- `src/app/guidance-library/page.tsx`

**Common Issues:**
- Use of `bg-gray-50`, `bg-gray-100` for section backgrounds
- Use of `bg-blue-50`, `bg-green-50`, `bg-yellow-50`, `bg-red-50`, `bg-orange-50` for alert/info boxes
- Should use white cards with colored left borders instead

**Recommendation:** Audit each file individually and convert colored backgrounds to white + border pattern.

---

#### **6. Other Dashboard Pages** ⚠️ MEDIUM PRIORITY

Pages with non-standard background color patterns:
- `src/app/dashboard/compliance/consent-letters/components/*.tsx` (multiple color classes)
- `src/app/dashboard/compliance/listing-rules/components/*.tsx` (multiple color classes)
- `src/app/dashboard/compliance/resolutions/*.tsx` (multiple color classes)
- `src/app/dashboard/listed-services/page.tsx` (multiple color backgrounds)
- `src/app/trial/cap-table-setup/page.tsx` (multiple color classes)

**Note:** These may be intentional for status indicators and should be reviewed individually.

---

## Design System Recommendations

### 1. **Page Backgrounds**
- Use `bg-primary` / `#F7F6F4` as default
- Do NOT use `bg-gray-50`, `bg-blue-50`, etc. for page-level backgrounds
- If using Tailwind: add custom color to `tailwind.config.js`:
  ```js
  bg: {
    'primary': '#F7F6F4'
  }
  ```

### 2. **Card Backgrounds**
- Always use `white` / `#FFFFFF` for card backgrounds
- Border: `border border-slate-200` or `border-gray-200`
- Hover: subtle shadow increase, NOT background color change

### 3. **Alert / Info Boxes**
**Current (Incorrect):**
```jsx
<div className="bg-blue-50 p-4 rounded-lg">...</div>
```

**Recommended (Correct):**
```jsx
<div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">...</div>
```

Pattern:
- Blue alerts: `border-l-4 border-blue-500`
- Green alerts: `border-l-4 border-green-500`
- Yellow/warning: `border-l-4 border-yellow-500`
- Red/error: `border-l-4 border-red-500`

### 4. **Status Badges**
- Keep colored backgrounds for status badges (these are intentional)
- Examples: `bg-green-100 text-green-800`, `bg-yellow-100 text-yellow-800`
- These should remain as-is

### 5. **Button Colors**
- Keep CTA buttons with colored backgrounds (e.g., `bg-red-500`, `bg-blue-600`)
- Hover states should adjust opacity or shade, not switch to gray

---

## Summary Statistics

| Category | Count | Priority | Status |
|----------|-------|----------|--------|
| Pages with color-background sections | 8 | High | Needs Fix |
| Cards with light gray/off-white | 12+ | Medium | Needs Audit |
| Alert boxes with colored backgrounds | 15+ | High | Needs Fix |
| Status badges (intentional color) | 30+ | Low | Keep As Is |
| CTA buttons (intentional color) | 20+ | Low | Keep As Is |

---

## Files Requiring Updates (Priority Order)

### **Tier 1 - Critical (Most Visible Impact)**
1. `src/app/pricing/page.tsx` — 20+ color background instances
2. `src/app/page.tsx` — Landing page sections and stat cards
3. `src/app/dashboard/investor-readiness/data-room/page.tsx` — Page background + alerts

### **Tier 2 - High Priority**
4. `src/app/disclaimer/page.tsx` — Multiple colored alert boxes
5. `src/app/privacy/page.tsx` — Multiple alert boxes
6. `src/app/dashboard/compliance/consent-letters/page.tsx` — Multiple color classes

### **Tier 3 - Medium Priority**
7. All compliance sub-component pages
8. `src/app/leads/capture/page.tsx`
9. `src/app/trial/cap-table-setup/page.tsx`
10. `src/app/learning-compliance/*.tsx` pages

---

## Recommendations for Implementation

1. **Create a reusable Alert component** in `src/components/` with variants:
   - `variant="info"` → blue border-l
   - `variant="warning"` → yellow border-l
   - `variant="success"` → green border-l
   - `variant="error"` → red border-l

2. **Update Tailwind config** to include design system colors as named classes

3. **Create a color audit checklist** for code review:
   - ✓ Page backgrounds are white or `#F7F6F4`
   - ✓ Cards are pure white with subtle borders
   - ✓ Alerts use white background + left border accent
   - ✓ Only badges/buttons have colored backgrounds

4. **Run automated checks** in pre-commit hooks to prevent drift

---

## Conclusion

**Overall Assessment:** The codebase shows significant background color drift from the design system standard. The pricing page is the most problematic, followed by public pages (disclaimer, privacy, terms) and certain dashboard sections.

**Estimated Effort:** 
- Tier 1 fixes: 3-4 hours
- Tier 2 fixes: 2-3 hours
- Tier 3 fixes: 1-2 hours
- **Total: 6-9 hours**

**Timeline:** Can be completed in parallel with other sprint work or as a dedicated cleanup task.
