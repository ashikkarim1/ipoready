# Public Pages Standardization Audit

**Status:** CRITICAL BLOCKER  
**Date:** June 5, 2026  
**Issue:** All public pages (pre-sign-in) have inconsistent titles, spacing, fonts, and headers

---

## The Problem

✗ **Before Standardization:**
- Resource Centre: h1 = `text-2xl` (tiny)
- Pricing page: different title style
- Prospectus Builder: different spacing
- Each page has unique header heights, margins, padding

**Visual Result:** Messy, unprofessional, inconsistent brand experience

✅ **After Standardization:**
- ALL pages: h1 = `.h1` (text-3xl md:text-4xl, serif font)
- Consistent subtitle styling (`.body-sm`)
- Consistent container width (`max-w-7xl`)
- Consistent spacing (16px padding, consistent gaps)
- Professional, cohesive brand experience

---

## Standard Template

All public pages should use `PublicPageLayout` component:

```tsx
import { PublicPageLayout, PageSection } from '@/app/components/PublicPageLayout'
import { BookOpen } from 'lucide-react'

export default function ResourcesPage() {
  return (
    <PublicPageLayout
      icon={<BookOpen className="w-6 h-6" />}
      title="Resource Centre"
      subtitle="Recent filings, regulatory policies, and procedures across all major listing exchanges."
    >
      <PageSection
        title="IPO & Compliance Learning Centre"
        subtitle="Everything you need to know — from first filing to post-listing compliance"
      >
        {/* Section content */}
      </PageSection>

      <PageSection
        title="Regulatory Filings"
        variant="highlighted"
      >
        {/* Section content */}
      </PageSection>
    </PublicPageLayout>
  )
}
```

---

## Pages to Standardize

### **Public Pages (Pre-Sign-In)**

| Page | Current Status | Title Size | Header Height | Fix Priority |
|------|---|---|---|---|
| `/` (Landing) | ✅ STANDARD | `text-6xl` serif | Correct | — |
| `/pricing` | ❌ INCONSISTENT | Custom | Different | HIGH |
| `/resources` | ❌ INCONSISTENT | `text-2xl` | Too small | HIGH |
| `/prospectus-builder` | ❌ INCONSISTENT | Custom | Different | HIGH |
| `/help` | ❌ INCONSISTENT | `h1` class | Different padding | MEDIUM |
| `/for-investors` | ❌ INCONSISTENT | `text-6xl` | Different from landing | MEDIUM |
| `/for-investors/data` | ❌ INCONSISTENT | `h1` class | Different | MEDIUM |
| `/for-investors/datasets` | ❌ INCONSISTENT | Custom | Different | MEDIUM |

### **Dashboard Pages (After Sign-In)**
- Already using dashboard layout (no changes needed)

---

## Standardization Checklist

### Component: `PublicPageLayout`
- ✅ Created at `src/app/components/PublicPageLayout.tsx`
- ✅ Includes `PageSection` helper
- ✅ Includes `PageGrid` helper
- ✅ Uses semantic typography (`.h1`, `.h3`, `.body-sm`)
- ✅ Uses `max-w-7xl` container
- ✅ Consistent 16px padding on all sides
- ✅ Consistent section spacing

### Pages to Update

#### **1. `/pricing` — PRIORITY: HIGH**
```
Current:
- Header: Unclear
- Title: Custom size
- Subtitle: Unclear

Should be:
- Icon: DollarSign
- Title: "Flexible Pricing for Every Stage"
- Subtitle: "Choose the plan that fits your listing journey"
```

#### **2. `/resources` — PRIORITY: HIGH**
```
Current:
- Header: Mixed inline styles
- Title: text-2xl (too small)
- Subtitle: .body-sm (correct)

Should be:
- Icon: BookOpen
- Title: "Resource Centre" (using .h1)
- Subtitle: "Recent filings, regulatory policies, and procedures..."
```

#### **3. `/prospectus-builder` — PRIORITY: HIGH**
```
Current:
- Header: Custom styling
- Title: Unknown size
- Spacing: Unknown

Should be:
- Icon: FileText
- Title: "Prospectus Builder"
- Subtitle: "Auto-generate professional prospectuses with AI..."
```

#### **4. `/help` — PRIORITY: MEDIUM**
```
Current:
- Header: Mostly correct
- Title: Using .h1 (correct)
- Spacing: Could be tightened

Should use:
- PublicPageLayout wrapper
- Consistent padding
```

#### **5. `/for-investors` — PRIORITY: MEDIUM**
```
Current:
- Header: Dark background hero
- Title: Different from landing

Should use:
- PublicPageLayout (or custom hero wrapper)
- Consistent title styling
```

#### **6. `/for-investors/data` — PRIORITY: MEDIUM**
```
Current:
- Header: Correct general structure
- Title: Using .h1 (correct)
- Spacing: Could be tightened

Should use:
- PublicPageLayout wrapper
```

#### **7. `/for-investors/datasets` — PRIORITY: MEDIUM**
```
Current:
- Header: Accordion-style
- Title: Uses semantic classes

Should use:
- PublicPageLayout wrapper
- Consistent section styling
```

---

## Typography Standard

### Heading Hierarchy

```
Landing Page Hero:
  h1: text-6xl font-bold serif → ".h1" class (text-3xl md:text-4xl)

All Public Pages:
  h1: .h1 class (text-3xl md:text-4xl serif)
  h2: .h3 class (text-2xl font-bold)
  h3: .h4 class (text-xl font-semibold)

Subtitle:
  All pages: .body-sm class (text-sm text-text-muted)

Section labels:
  All pages: .label-sm class (text-xs font-semibold uppercase)
```

### Spacing Standard

```
Container:
  max-width: max-w-7xl
  padding: px-4 sm:px-6 lg:px-8
  margin: mx-auto

Page header section:
  padding-top: py-16
  padding-bottom: pb-0

Page content section:
  padding-bottom: pb-16
  margin-bottom between sections: mb-8

Section padding:
  inside sections: p-8

Gap between elements:
  title to subtitle: mb-4
  subtitle to content: mb-8
  section to section: mb-8
```

---

## Visual Comparison

### Landing Page (STANDARD ✅)
```
┌─ Header ────────────────────────┐
│ Navigation                      │
└─────────────────────────────────┘

┌─ Hero Section ──────────────────┐
│                                 │
│  [Icon]                         │
│  Start Your IPO Journey         ← h1 (serif, large)
│  Answer 4 questions...          ← subtitle (body-sm)
│                                 │
│  [CTA buttons]                  │
│                                 │
└─────────────────────────────────┘
```

### Resources Page (INCONSISTENT ✗)
```
┌─ Header ────────────────────────┐
│ Navigation                      │
└─────────────────────────────────┘

┌─ Content ───────────────────────┐
│ [BookOpen icon]                 │
│ Resource Centre                 ← h1 (text-2xl, TINY!)
│ Recent filings, policies...     ← subtitle
│                                 │
│ Learning Centre                 ← h2 (inline style 1.15rem!)
│ [Cards]                         │
│                                 │
│ ──────────────────────────────  │
│ Regulatory Filings              ← h2 (text with borders)
│ [Complex layout]                │
│                                 │
└─────────────────────────────────┘
```

### After Standardization (✅)
```
┌─ Header ────────────────────────┐
│ Navigation                      │
└─────────────────────────────────┘

┌─ Page Header ───────────────────┐
│ [BookOpen icon]                 │
│ Resource Centre                 ← h1 (.h1 class)
│ Recent filings, policies...     ← subtitle (.body-sm)
└─────────────────────────────────┘

┌─ Section ───────────────────────┐
│ Learning Centre                 ← h3 (.h3 class)
│ Everything you need to know...  ← subtitle (.body-sm)
│ [Cards with consistent spacing] │
└─────────────────────────────────┘

┌─ Section ───────────────────────┐
│ Regulatory Filings              ← h3 (.h3 class)
│ [Consistent content]            │
└─────────────────────────────────┘
```

---

## Implementation Steps

### Step 1: Update `/pricing`
1. Replace current header with `PublicPageLayout`
2. Use `.h1` for title, `.body-sm` for subtitle
3. Wrap content sections in `PageSection` components
4. Test responsive design (mobile, tablet, desktop)

### Step 2: Update `/resources`
1. Replace current header with `PublicPageLayout`
2. Remove inline style heading sizes
3. Use `PageSection` for each major section
4. Use `PageGrid` for card layouts
5. Test responsive design

### Step 3: Update `/prospectus-builder`
1. Replace current header with `PublicPageLayout`
2. Standardize all heading sizes
3. Wrap sections properly
4. Test responsive design

### Step 4: Update `/help`
1. Wrap entire page in `PublicPageLayout`
2. Update section headings to `.h3`
3. Test responsive design

### Step 5: Update `/for-investors*` pages
1. Wrap in `PublicPageLayout`
2. Standardize all section headings
3. Test responsive design

### Step 6: Final QA
- [ ] Compare all public pages side-by-side
- [ ] Check mobile responsiveness (all breakpoints)
- [ ] Check tablet responsiveness
- [ ] Check desktop responsiveness
- [ ] Verify consistent font sizes across pages
- [ ] Verify consistent spacing across pages
- [ ] Verify consistent button styling
- [ ] Screenshot comparison before/after

---

## Semantic Classes Reference

```
Headings:
  .h1 → text-3xl md:text-4xl font-bold serif
  .h2 → text-2xl font-bold (not used on public pages)
  .h3 → text-2xl font-bold
  .h4 → text-xl font-semibold

Body:
  .body → text-base font-normal leading-relaxed
  .body-sm → text-sm font-normal leading-relaxed

Labels:
  .label → text-sm font-medium
  .label-sm → text-xs font-semibold uppercase
  .label-xs → text-xs font-bold uppercase

Colors:
  .text-nav → #1A1A1A (dark text)
  .text-text-muted → #717171 (muted gray)
  .text-accent → #E8312A (red)
```

---

## Expected Timeline

- **Step 1 (Pricing):** 15 minutes
- **Step 2 (Resources):** 30 minutes
- **Step 3 (Prospectus Builder):** 15 minutes
- **Step 4 (Help):** 10 minutes
- **Step 5 (For-Investors pages):** 20 minutes
- **Step 6 (QA & Testing):** 20 minutes

**Total: ~110 minutes (2 hours)**

---

## Success Criteria

✅ All public pages use `PublicPageLayout` component  
✅ All h1 titles use `.h1` class (text-3xl md:text-4xl)  
✅ All subtitles use `.body-sm` class  
✅ All section headings use `.h3` class  
✅ Consistent `max-w-7xl` container on all pages  
✅ Consistent padding (px-4 sm:px-6 lg:px-8)  
✅ Consistent spacing between sections (mb-8)  
✅ Mobile responsive (tested on iPhone, iPad, desktop)  
✅ Visual comparison: all pages look like siblings  
✅ No inline style font sizes (use semantic classes)  

---

## Before & After Screenshots

**TODO: Add screenshots after implementation**

```
BEFORE: 
- Screenshot of /resources (text-2xl title, messy)
- Screenshot of /pricing (custom styling)
- Side-by-side comparison (inconsistent!)

AFTER:
- Screenshot of /resources (standardized .h1 title)
- Screenshot of /pricing (matching /resources)
- Side-by-side comparison (consistent!)
```

---

**Status: Ready to implement**

All pages should look like professional siblings, not orphans.
