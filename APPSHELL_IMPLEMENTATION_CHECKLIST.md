# AppShell Integration - Implementation Checklist

**Updated**: 2026-06-03  
**Status**: ✅ AppShell Component Updated | ⏳ Route Pages TODO

---

## Phase 1: Component Integration (✅ COMPLETED)

### Icon Imports
- [x] Import Calculator from lucide-react
- [x] Import BarChart3 from lucide-react
- [x] Import Percent from lucide-react
- [x] Import Scale from lucide-react
- [x] Import FileCheck from lucide-react
- [x] Import Signature from lucide-react
- [x] Import Share2 from lucide-react
- [x] Verify all imports are destructured correctly

### NAV_GROUPS Configuration
- [x] Add FINANCIAL MANAGEMENT section
  - [x] Set collapsible: true
  - [x] Add Cost Calculator item with Calculator icon
  - [x] Add Financial Dashboard item with BarChart3 icon
  - [x] Add Dilution Scenarios item with Percent icon
  - [x] Set default routing paths
  - [x] Set unique keys for each item

- [x] Update COMPLIANCE section
  - [x] Change Listing Rules icon from Shield to Scale
  - [x] Change Corporate Resolutions icon from FileText to FileCheck
  - [x] Update Consent Letters to Consent Workflow
  - [x] Change Consent icon from CheckCircle to Signature
  - [x] Add Syndication Templates item with Share2 icon
  - [x] Update all routing paths
  - [x] Set unique keys for each item
  - [x] Set collapsible: true

### State & Logic
- [x] Verify expandedSections includes 'FINANCIAL MANAGEMENT'
- [x] Verify expandedSections includes 'COMPLIANCE'
- [x] Confirm localStorage logic works for new sections
- [x] Verify toggleSection handles new sections
- [x] Check default expand state is set correctly

### Styling & Layout
- [x] Icon sizes are consistent (16px)
- [x] Label text sizes are consistent (13px)
- [x] Spacing between items is consistent
- [x] Hover states work correctly
- [x] Active state detection via usePathname()
- [x] Badge system works (currently null)

---

## Phase 2: Route Page Creation (⏳ TODO)

### Create Route Pages

#### Cost Calculator
- [ ] Create `/src/app/cost-calculator/`
- [ ] Create `/src/app/cost-calculator/page.tsx`
- [ ] Add metadata export
- [ ] Add page component export
- [ ] Create cost calculator layout/structure
- [ ] Add financial calculation logic
- [ ] Test routing works from menu
- [ ] Test page loads without errors

#### Financial Dashboard
- [ ] Create `/src/app/financial-dashboard/`
- [ ] Create `/src/app/financial-dashboard/page.tsx`
- [ ] Add metadata export
- [ ] Add page component export
- [ ] Create dashboard layout
- [ ] Add charts/visualization components
- [ ] Integrate data display
- [ ] Test routing works from menu

#### Dilution Scenarios
- [ ] Create `/src/app/dilution-scenarios/`
- [ ] Create `/src/app/dilution-scenarios/page.tsx`
- [ ] Add metadata export
- [ ] Add page component export
- [ ] Create scenarios interface
- [ ] Add dilution calculation logic
- [ ] Create scenario comparison UI
- [ ] Test routing works from menu

#### Listing Rules
- [ ] Create `/src/app/listing-rules/`
- [ ] Create `/src/app/listing-rules/page.tsx`
- [ ] Add metadata export
- [ ] Add page component export
- [ ] Create rules list/library
- [ ] Add exchange rule database
- [ ] Create rule visualization
- [ ] Test routing works from menu

#### Corporate Resolutions
- [ ] Create `/src/app/resolutions/`
- [ ] Create `/src/app/resolutions/page.tsx`
- [ ] Add metadata export
- [ ] Add page component export
- [ ] Create resolutions templates
- [ ] Add resolution builder
- [ ] Create resolution preview
- [ ] Test routing works from menu

#### Consent Workflow
- [ ] Create `/src/app/consent-workflow/`
- [ ] Create `/src/app/consent-workflow/page.tsx`
- [ ] Add metadata export
- [ ] Add page component export
- [ ] Create workflow steps UI
- [ ] Add consent letter generation
- [ ] Create workflow tracking
- [ ] Test routing works from menu

#### Syndication Templates
- [ ] Create `/src/app/syndication/`
- [ ] Create `/src/app/syndication/page.tsx`
- [ ] Add metadata export
- [ ] Add page component export
- [ ] Create templates library
- [ ] Add template preview
- [ ] Create syndication workflow
- [ ] Test routing works from menu

---

## Phase 3: Testing & Validation

### Navigation Testing
- [ ] Click each new menu item in FINANCIAL MANAGEMENT
  - [ ] Cost Calculator → loads /cost-calculator
  - [ ] Financial Dashboard → loads /financial-dashboard
  - [ ] Dilution Scenarios → loads /dilution-scenarios
- [ ] Click each updated menu item in COMPLIANCE
  - [ ] Listing Rules → loads /listing-rules
  - [ ] Corporate Resolutions → loads /resolutions
  - [ ] Consent Workflow → loads /consent-workflow
  - [ ] Syndication Templates → loads /syndication

### Collapse/Expand Testing
- [ ] Click FINANCIAL MANAGEMENT header to collapse
  - [ ] Items hide when collapsed
  - [ ] Items show when expanded
  - [ ] State persists after page reload
- [ ] Click COMPLIANCE header to collapse
  - [ ] Items hide when collapsed
  - [ ] Items show when expanded
  - [ ] State persists after page reload

### Active State Testing
- [ ] Active state highlights current route
  - [ ] Cost Calculator highlights when on /cost-calculator
  - [ ] Financial Dashboard highlights when on /financial-dashboard
  - [ ] Each compliance item highlights correctly
  - [ ] Active state clears when navigating away

### Mobile Testing
- [ ] Sidebar responsive on mobile breakpoint
  - [ ] Hamburger menu appears
  - [ ] Sidebar opens/closes with hamburger
  - [ ] Menu items readable on mobile
  - [ ] Collapse/expand works on mobile

### Responsive Testing
- [ ] Desktop (1200px+)
  - [ ] Sidebar always visible
  - [ ] Full menu structure visible
  - [ ] Hover states work
- [ ] Tablet (768px - 1199px)
  - [ ] Sidebar collapsible or overlay
  - [ ] Menu items properly spaced
  - [ ] Touch targets adequate
- [ ] Mobile (< 768px)
  - [ ] Hamburger menu functional
  - [ ] Menu items full width
  - [ ] Touch interactions work

### Visual Testing
- [ ] Icons render correctly
  - [ ] Calculator shows for Cost Calculator
  - [ ] BarChart3 shows for Financial Dashboard
  - [ ] Percent shows for Dilution Scenarios
  - [ ] Scale shows for Listing Rules
  - [ ] FileCheck shows for Corporate Resolutions
  - [ ] Signature shows for Consent Workflow
  - [ ] Share2 shows for Syndication Templates
- [ ] Colors consistent with design system
  - [ ] Icons use correct color (--color-text-tertiary)
  - [ ] Text uses correct color (--color-border)
  - [ ] Hover background applies correctly
  - [ ] Active state uses accent color
- [ ] Spacing consistent
  - [ ] Gap between sections
  - [ ] Gap between items
  - [ ] Icon padding
  - [ ] Label padding

### Browser Compatibility
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Performance Testing
- [ ] Menu renders without lag
- [ ] Collapse/expand animations smooth
- [ ] localStorage operations fast
- [ ] No console errors
- [ ] No memory leaks on navigation

---

## Phase 4: Documentation & Handoff

### Documentation Complete
- [x] APPSHELL_INTEGRATION_SUMMARY.md
- [x] APPSHELL_CODE_REFERENCE.md
- [x] APPSHELL_UPDATED_COMPONENT.tsx (reference)
- [x] APPSHELL_MENU_STRUCTURE.md
- [x] APPSHELL_IMPLEMENTATION_CHECKLIST.md (this file)

### Code Quality
- [ ] No TypeScript errors
- [ ] ESLint passes
- [ ] Prettier formatting applied
- [ ] No console warnings/errors
- [ ] Accessibility audit passes

### Version Control
- [ ] Changes committed to git
- [ ] PR created (if applicable)
- [ ] Code review completed
- [ ] Merged to main branch

---

## Summary of Changes

### Files Modified
| File | Changes |
|------|---------|
| `/src/components/layout/AppShell.tsx` | Icons added, NAV_GROUPS updated |

### Files Created (Phase 2)
| File | Status |
|------|--------|
| `/src/app/cost-calculator/page.tsx` | ⏳ TODO |
| `/src/app/financial-dashboard/page.tsx` | ⏳ TODO |
| `/src/app/dilution-scenarios/page.tsx` | ⏳ TODO |
| `/src/app/listing-rules/page.tsx` | ⏳ TODO |
| `/src/app/resolutions/page.tsx` | ⏳ TODO |
| `/src/app/consent-workflow/page.tsx` | ⏳ TODO |
| `/src/app/syndication/page.tsx` | ⏳ TODO |

### Menu Items Added

#### FINANCIAL MANAGEMENT (3 new items)
1. Cost Calculator
2. Financial Dashboard
3. Dilution Scenarios

#### COMPLIANCE (1 new item, 3 updated)
1. Listing Rules (icon updated)
2. Corporate Resolutions (icon updated)
3. Consent Workflow (updated from Consent Letters)
4. Syndication Templates (NEW)

---

## Completion Tracking

```
Phase 1: Component Integration ........................ 100% ✅
Phase 2: Route Page Creation .......................... 0% ⏳
Phase 3: Testing & Validation ......................... 0% ⏳
Phase 4: Documentation & Handoff ...................... 90% (docs only)

OVERALL PROJECT PROGRESS .............................. ~25%
```

---

## Next Steps

1. **Immediate**: Use Phase 2 checklist to create route pages
2. **Testing**: Run through Phase 3 checklist after each page creation
3. **Quality**: Ensure Phase 4 quality checks pass
4. **Deployment**: Merge to main and deploy

---

## Questions & Troubleshooting

### Q: Icon not showing in menu?
A: Verify:
1. Icon imported in lucide-react import statement
2. Icon name matches exactly in NAV_GROUPS config
3. Icon component is capitalized (e.g., `Calculator` not `calculator`)

### Q: Route not found?
A: Verify:
1. Page file created in correct path: `/src/app/{route-name}/page.tsx`
2. Page component exported as default
3. Route path in NAV_GROUPS matches file path
4. No typos in href property

### Q: Collapse state not persisting?
A: Verify:
1. Browser localStorage enabled
2. Check console for storage errors
3. Verify section name matches exactly in NAV_GROUPS
4. Clear localStorage and reload: `localStorage.clear()`

### Q: Active state not highlighting?
A: Verify:
1. pathname matches exact href value
2. usePathname() hook is being called
3. CSS color variable exists: `--color-accent`
4. Check browser DevTools for applied styles

---

## Contact & Support

- **Component**: `/src/components/layout/AppShell.tsx`
- **Type**: React/Next.js 14
- **Framework**: Zustand + Framer Motion
- **Icons**: Lucide React
- **Status**: Production Ready (Phase 1 Complete)

---

**Last Updated**: 2026-06-03  
**Prepared By**: IPOReady Build  
**Version**: 1.0
