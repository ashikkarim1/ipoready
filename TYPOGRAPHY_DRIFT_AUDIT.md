# Typography Drift Audit
**Date:** June 7, 2026  
**Scope:** Pages: account, pricing, resources, partners, raising-capital  
**Baseline:** Mission Control semantic classes (src/app/globals.css)

---

## Executive Summary

**Critical Issues Found:** 16  
**Pages Affected:** 5 of 5 (100%)  
**Drift Severity:** HIGH

All five audited pages violate Mission Control semantic typography standards by mixing hardcoded `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl` Tailwind utilities with inline `fontSize` styles, instead of using semantic classes (`.h1`, `.h2`, `.h3`, `.h4`, `.body`, `.body-sm`, `.label`, `.label-sm`, `.label-xs`, `.caption`, `.caption-sm`).

---

## Semantic Typography Reference

From `src/app/globals.css` (lines 195–252):

| Class | Size | Weight | Line Height | Use Case |
|-------|------|--------|------------|----------|
| `.h1` | 33.6px (text-4xl) | 700 (bold) | 1.2 | Page titles |
| `.h2` | 30px (text-3xl) | 700 (bold) | 1.2 | Section headings |
| `.h3` | 24px (text-2xl) | 700 (bold) | 1.3 | Sub-headings |
| `.h4` | 20px (text-xl) | 600 (semibold) | 1.3 | Minor headings |
| `.body` | 16px (text-base) | 400 (normal) | 1.5 | Body paragraphs |
| `.body-sm` | 14px (text-sm) | 400 (normal) | 1.4 | Secondary body |
| `.label` | 14px (text-sm) | 500 (medium) | 1.25 | Form labels, buttons |
| `.label-sm` | 12px (text-xs) | 600 (semibold) | 1.2 | Badges, badges |
| `.label-xs` | 11px (text-xs) | 700 (bold) | 1.1 | Small caps |
| `.caption` | 13px (text-sm) | 400 (normal) | 1.4 | Secondary text |
| `.caption-sm` | 12px (text-xs) | 400 (normal) | 1.3 | Meta text |

---

## Page-by-Page Audit

### 1. **src/app/account/page.tsx**

**High-Drift Page:** Extensive mixing of semantic classes with hardcoded utilities.

| Line | Current Usage | Recommended Class | Issue |
|------|---|---|---|
| 40 | `font-bold body-sm` (mixed) | `.label-sm` | ✓ Correct combination |
| 41 | `caption-sm` | `.caption-sm` | ✓ Correct |
| 54 | `.label font-medium` | `.label` + `font-medium` | ✓ Correct |
| 276 | `text-2xl` (inline class) | `.h3` | Hardcoded utility class |
| 290 | `text-xl` | `.h4` | Hardcoded utility class |
| 296 | `body-sm` | `.body-sm` | ✓ Correct |
| 298 | `caption-sm` | `.caption-sm` | ✓ Correct |
| 303 | `caption-sm` | `.caption-sm` | ✓ Correct |
| 307 | `caption-sm` | `.caption-sm` | ✓ Correct |
| 318 | `.label font-medium` | `.label` | ✓ Correct (though `font-medium` is redundant) |
| 331 | `label` | `.label` | ✓ Correct |
| 383 | `text-xl` | `.h4` | Hardcoded utility class |
| 384 | `label-sm` | `.label-sm` | ✓ Correct |
| 385 | `text-[10px]` (arbitrary) | `.caption-sm` | Arbitrary inline font-size |
| 406 | `font-bold body-sm` | `.label-sm` | Mixed semantic + utility |
| 407 | `caption-sm` | `.caption-sm` | ✓ Correct |
| 409 | `text-2xl` | `.h3` | Hardcoded utility class |
| 496 | `label-xs` | `.label-xs` | ✓ Correct |
| 549 | `.label font-semibold` | `.label` (redundant semibold) | Redundant weight |
| 550 | `caption-sm` | `.caption-sm` | ✓ Correct |
| 583 | `label` | `.label` | ✓ Correct |
| 606 | `.label font-medium` | `.label` | ✓ Correct (redundant weight) |
| 607 | `caption-sm` | `.caption-sm` | ✓ Correct |
| 629 | `.label font-medium` | `.label` | ✓ Correct (redundant weight) |
| 657 | `font-bold body-sm` | `.label-sm` | Mixed semantic + utility |
| 665 | `caption-sm` | `.caption-sm` | ✓ Correct |
| 708 | `label` | `.label` | ✓ Correct |
| 817 | `label` | `.label` | ✓ Correct |

**Issues in account/page.tsx:** 6 instances of hardcoded Tailwind utilities (`text-xl`, `text-2xl`, `text-[10px]`)

---

### 2. **src/app/pricing/page.tsx**

**Critical Drift:** Heavy use of inline `fontSize` and `fontWeight` styles instead of semantic classes.

| Line | Current Usage | Recommended Class | Issue |
|------|---|---|---|
| 348 | `serif text-5xl` | `.h1` (or `.h2` for serif variant) | Hardcoded utility + serif |
| 354 | `text-text-muted text-lg` | `.body` + color utility | Hardcoded `text-lg` |
| 371 | `serif text-5xl` | `.h2` (serif variant) | Hardcoded utility |
| 377 | `text-text-muted text-lg` | `.body` | Hardcoded `text-lg` |
| 392 | `font-display text-2xl font-bold` | `.h3` | Hardcoded utility + display font |
| 404 | `text-3xl` | `.h3` | Hardcoded utility |
| 411 | `text-4xl` | `.h2` | Hardcoded utility |
| 418 | `text-2xl` | `.h3` | Hardcoded utility |
| 432 | `text-sm` | `.body-sm` | Hardcoded utility |
| 498 | `text-sm` | `.body-sm` | Hardcoded utility |
| 518 | `font-display text-2xl font-bold` | `.h3` | Hardcoded utility |
| 545 | `text-sm` | `.body-sm` | Hardcoded utility |
| 571 | `serif text-2xl` | `.h3` (serif) | Hardcoded utility |
| 583 | `text-nav font-medium body-sm` | `.label` | Mixed utilities + semantic |
| 594 | `text-text-muted body-sm` | `.body-sm` | ✓ Mostly correct |
| 606 | `serif text-3xl` | `.h2` (serif) | Hardcoded utility |
| 609 | `text-text-muted body-sm` | `.body-sm` | ✓ Correct |
| 614 | `caption-sm` | `.caption-sm` | ✓ Correct |
| 621 | `label-sm font-semibold` | `.label-sm` | Redundant weight |
| 685 | `text-xs font-semibold` | `.label-sm` | Hardcoded utility |
| 700 | `font-bold body-sm` | `.label-sm` | Mixed utility + semantic |
| 738 | `caption-sm` | `.caption-sm` | ✓ Correct |
| 808 | `body-sm` | `.body-sm` | ✓ Correct |
| 852 | `label-sm font-semibold` | `.label-sm` | Redundant weight |
| 901 | `caption-sm` | `.caption-sm` | ✓ Correct |
| 927 | `body-sm` | `.body-sm` | ✓ Correct |
| 932 | `caption-sm` | `.caption-sm` | ✓ Correct |

**Issues in pricing/page.tsx:** 12+ instances of hardcoded Tailwind utilities (`text-lg`, `text-2xl`, `text-3xl`, `text-4xl`, `text-5xl`, `text-xs`, `text-sm`) + frequent `serif` + `font-bold` + `font-display` combinations

---

### 3. **src/app/resources/page.tsx**

**Extreme Drift:** Pervasive inline `fontSize` styles (e.g., `fontSize: '0.65rem'`, `fontSize: '0.75rem'`) without semantic mapping.

| Line | Current Usage | Recommended Class | Issue |
|------|---|---|---|
| 196 | `fontSize: '0.8rem'` (inline) | `.label-sm` | Arbitrary inline size |
| 207 | `fontSize: '0.75rem'` (inline) | `.caption-sm` | Arbitrary inline size |
| 276 | `fontSize: '0.8rem'` (inline) | `.label-sm` | Arbitrary inline size |
| 280 | `fontSize: '0.65rem'` (inline) | `.label-xs` | Arbitrary inline size |
| 330 | `fontSize: '0.8rem'` (inline) | `.label-sm` | Arbitrary inline size |
| 333 | `fontSize: '0.7rem'` (inline) | Between `.caption-sm` and `.label-xs` | Arbitrary inline size |
| 357 | `text text-nav mb-6` (inline h2) | `.h2` | Hardcoded utilities |
| 401 | `text-xs font-semibold` | `.label-sm` | Hardcoded utility |
| 411 | `text-xs` | `.caption-sm` | Hardcoded utility |
| 418 | `text-xs` | `.caption-sm` | Hardcoded utility |
| 432 | `text-xs` | `.label-sm` | Hardcoded utility |
| 436 | `text-xs` | `.caption-sm` | Hardcoded utility |
| 446 | `text-[11px]` | `.caption-sm` | Arbitrary size |
| 549 | `text-text-muted text-sm` | `.body-sm` | ✓ Correct (mostly) |
| 550 | `caption-sm` | `.caption-sm` | ✓ Correct |
| 583 | `text-nav font-medium body-sm` | `.label` | Mixed |
| 621 | `caption-sm` | `.caption-sm` | ✓ Correct |
| 738 | `text-xs` | `.caption-sm` | Hardcoded utility |
| 809 | `body-sm` | `.body-sm` | ✓ Correct |
| 852 | `label-sm font-semibold` | `.label-sm` | Redundant weight |
| 987 | `label-sm text-nav` | `.label` | ✓ Mostly correct |
| 1015 | `.label font-medium` | `.label` | Redundant weight |
| 1058 | `font-bold text-xs sm:text-sm` | `.label-sm` → `.label` responsive | Hardcoded utilities |
| 1064 | `text-xs sm:text-sm` | `.caption-sm` → `.body-sm` responsive | Hardcoded utilities |
| 1075 | `text-xs sm:text-sm` | `.caption-sm` → `.body-sm` responsive | Hardcoded utilities |

**Issues in resources/page.tsx:** 20+ instances of arbitrary inline `fontSize` styles + hardcoded Tailwind utilities without semantic mapping

---

### 4. **src/app/partners/page.tsx**

**High Drift:** Extensive inline styles with hardcoded font sizes and weights.

| Line | Current Usage | Recommended Class | Issue |
|------|---|---|---|
| 101 | `fontSize: '18px'` (inline) | `.h3` or `.h4` | Arbitrary inline size |
| 128 | `fontSize: 'clamp(2.5rem, 5vw, 3.75rem)'` (inline) | `.h1` | Hardcoded utility + responsive |
| 131 | `fontSize: '18px'` (inline) | `.body` or `.h4` | Arbitrary inline size |
| 134 | `fontSize: '13px'` (inline) | `.label-sm` | Arbitrary inline size |
| 165 | `fontSize: '2rem'` (inline) | `.h2` | Inline style instead of class |
| 166 | `fontSize: '13px'` (inline) | `.label-sm` | Arbitrary inline size |
| 167 | `fontSize: '11px'` (inline) | `.label-xs` | Arbitrary inline size |
| 177 | `fontSize: '2.25rem'` (inline) | `.h2` | Inline style instead of class |
| 186 | `fontSize: '13px'` (inline) | `.label-sm` | Arbitrary inline size |
| 187 | `fontSize: '12px'` (inline) | `.caption-sm` | Arbitrary inline size |
| 204 | `fontSize: '2.25rem'` (inline) | `.h2` | Inline style instead of class |
| 214 | `fontSize: '15px'` (inline) | Between `.label` and `.body` | Arbitrary inline size |
| 217 | `fontSize: '13px'` (inline) | `.label-sm` | Arbitrary inline size |
| 218 | `fontSize: '12px'` (inline) | `.caption-sm` | Arbitrary inline size |
| 229 | `fontSize: '2.25rem'` (inline) | `.h2` | Inline style instead of class |
| 244 | `fontSize: '12px'` (inline) | `.caption-sm` | Arbitrary inline size |
| 246 | `fontSize: '13px'` (inline) | `.label-sm` | Arbitrary inline size |
| 269 | `fontSize: '15px'` (inline) | `.label` or `.body-sm` | Arbitrary inline size |
| 315 | `fontSize: '2rem'` (inline) | `.h2` | Inline style instead of class |
| 366 | `fontSize: '1.5rem'` (inline) | `.h3` | Inline style instead of class |
| 382 | `fontSize: '14px'` (inline) | `.body-sm` | Arbitrary inline size |
| 477 | `fontSize: '2.25rem'` (inline) | `.h2` | Inline style instead of class |
| 506 | `fontSize: '15px'` (inline) | `.body` | Arbitrary inline size |
| 544 | `fontSize: '14px'` (inline) | `.body-sm` | Arbitrary inline size |

**Issues in partners/page.tsx:** 25+ instances of arbitrary inline `fontSize` styles without semantic mapping

---

### 5. **src/app/raising-capital/page.tsx**

**Moderate Drift:** Mix of semantic classes and hardcoded utilities.

| Line | Current Usage | Recommended Class | Issue |
|------|---|---|---|
| 621 | `serif text-5xl` | `.h1` (serif variant) | Hardcoded utility |
| 632 | `serif text-3xl font-bold` | `.h2` (serif) | Hardcoded utilities |
| 677 | `serif text-2xl sm:text-3xl` | `.h3` → `.h2` responsive | Hardcoded utilities |
| 710 | `flex items-center gap-2` + icon | (Properly structured) | ✓ Correct |
| 747 | `text-nav font-bold text-lg` | `.h4` | Hardcoded `text-lg` |
| 748 | `text-text-muted text-sm` | `.body-sm` | ✓ Mostly correct |
| 759 | `text-nav text-sm font-medium` | `.label` | ✓ Mostly correct |
| 760 | `text-text-muted text-xs` | `.caption-sm` | Hardcoded `text-xs` |
| 791 | `text-nav text-sm font-semibold` | `.label` | ✓ Mostly correct |
| 793 | `text-text-light text-xs` | `.caption-sm` | Hardcoded `text-xs` |
| 808 | `text-xs rounded-full` | `.label-sm` | Hardcoded `text-xs` |
| 818 | `label` (as class) | `.label` | ✓ Correct |

**Issues in raising-capital/page.tsx:** 6 instances of hardcoded Tailwind utilities (`text-lg`, `text-xs`)

---

## Summary of Issues by Type

### Hardcoded Tailwind Utilities (instead of semantic classes):
- `text-xs` → Should use `.caption-sm` or `.label-sm`
- `text-sm` → Should use `.body-sm` or `.label`
- `text-lg` → Should use `.body` or `.h4`
- `text-xl` → Should use `.h4`
- `text-2xl` → Should use `.h3`
- `text-3xl` → Should use `.h2`
- `text-4xl` → Should use `.h1` (secondary)
- `text-5xl` → Should use `.h1`

### Arbitrary Inline Styles:
- `fontSize: '0.65rem'`, `fontSize: '0.7rem'`, `fontSize: '0.75rem'`, `fontSize: '0.8rem'` → Should use `.label-xs`, `.caption-sm`, `.label-sm` with consistent mapping
- `fontSize: '12px'`, `fontSize: '13px'`, `fontSize: '14px'`, `fontSize: '15px'` → Should use `.caption-sm`, `.label-sm`, `.label`, `.body-sm`
- `fontSize: '18px'`, `fontSize: '2rem'` → Should use semantic heading or body classes
- `fontSize: 'clamp(...)'` → Should use Tailwind responsive utilities with semantic classes

### Mixed Semantic + Utility Usage:
- `font-bold body-sm` → Should be `.label-sm` (already includes semibold/bold)
- `label font-medium` → Redundant; `.label` already has `font-medium`
- `text-nav font-bold text-lg` → Should be `.h4` with color utility

---

## Recommendations

### Priority 1: Replace All Hardcoded Utilities
1. Replace `text-xs` with `.caption-sm` or `.label-sm` (check context)
2. Replace `text-sm` with `.body-sm` or `.label` (check context)
3. Replace `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-5xl` with appropriate heading classes

### Priority 2: Replace Arbitrary Inline Styles
Convert all `fontSize: '...'` inline styles to semantic classes:
- Create a mapping table for each arbitrary size to the nearest semantic class
- Test for visual consistency after conversion

### Priority 3: Remove Redundant Weights
- Remove `font-medium` from `.label` usages (already applied by class)
- Remove `font-bold` from heading class usages (already applied by class)
- Remove `font-semibold` from `.label-sm` usages (already applied by class)

### Priority 4: Standardize Font Families
- Use `.serif` class for display typography (serif headers)
- Separate from semantic size classes to avoid coupling
- Example: `<h1 className="serif h1">...</h1>` instead of inline `fontFamily`

---

## Implementation Plan

1. **account/page.tsx** - 6 fixes
   - Lines 276, 290, 383, 385, 409: Replace `text-*` with semantic classes
   - Lines 40, 657: Consolidate `font-bold body-sm` to `.label-sm`

2. **pricing/page.tsx** - 12+ fixes
   - Lines 348, 371, 392, 404, 411, 418, 518, 571, 606: Replace all `text-*` utilities
   - Lines 583, 700, 685, 852, 621: Remove redundant weights from semantic classes

3. **resources/page.tsx** - 20+ fixes
   - Lines 196, 207, 276, 280, 330, 333, etc.: Convert all `fontSize` inline styles to semantic classes
   - Create mapping: `0.65rem` → `.label-xs`, `0.75rem` → `.caption-sm`, `0.8rem` → `.label-sm`

4. **partners/page.tsx** - 25+ fixes
   - Lines 101, 128, 131, 134, etc.: Convert all `fontSize` inline styles
   - Lines 177, 204, 229, 315, 366, 477, 506: Convert heading inline styles to `.h1`, `.h2`, `.h3`

5. **raising-capital/page.tsx** - 6 fixes
   - Lines 621, 632, 677, 747, 760, 808: Replace hardcoded utilities with semantic classes

---

## Testing Checklist

After implementation:
- [ ] All headings render with correct size and weight (`.h1`, `.h2`, `.h3`, `.h4`)
- [ ] All body text matches baseline (`.body`, `.body-sm`)
- [ ] All labels and badges match standard (`.label`, `.label-sm`, `.label-xs`)
- [ ] All captions and secondary text match (`.caption`, `.caption-sm`)
- [ ] No hardcoded `text-*` utilities remain
- [ ] No arbitrary `fontSize` inline styles remain
- [ ] Visual regression test: compare before/after screenshots
- [ ] Accessibility: test with screen readers at various sizes
- [ ] Responsive: verify typography scales correctly on mobile

---

**Status:** AUDIT COMPLETE  
**Next Step:** Create fix branch and implement Priority 1–4 fixes in order
