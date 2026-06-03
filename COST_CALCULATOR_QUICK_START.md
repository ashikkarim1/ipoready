# Cost Calculator 2A.1 - Quick Start Guide

## Files to Use

| File | Purpose | Location |
|------|---------|----------|
| `CostCalculator2A1.tsx` | Main React component | `src/components/` |
| `CostCalculator2A1.css` | Complete styling | `src/components/` |
| `route.ts` | API endpoints | `src/app/api/costs/` |

## 5-Minute Setup

### 1. Copy Component Files
```bash
# Already done - files are in place:
# - src/components/CostCalculator2A1.tsx
# - src/components/CostCalculator2A1.css
```

### 2. Import Component
```tsx
import { CostCalculator2A1 } from '@/components/CostCalculator2A1'
```

### 3. Use in Your Page
```tsx
export default function Page() {
  return (
    <main className="p-6">
      <CostCalculator2A1 />
    </main>
  )
}
```

### 4. That's It!
- Component loads with sample $30.6M IPO data
- All features work out of the box
- Try adding/deleting costs, exporting CSV

## Features at a Glance

### ✅ Interactive Cost Management
- Add new cost items with form
- Delete items with trash icon
- View all costs in table
- Real-time total calculations

### ✅ Cost Categories
**CAPEX (Equipment, Build-out, Legal)**
- $12.45M with 41% breakdown shown

**OPEX (Personnel, Services, Marketing, Regulatory)**
- $18.15M with 59% breakdown shown

### ✅ Timeline Tracking
- Pre-IPO: $17.8M (58%)
- Pre-Launch: $10.2M (33%)
- Post-Launch: $2.6M (9%)

### ✅ Visualizations
1. **Summary Cards** - CAPEX, OPEX, Total
2. **Timeline Chart** - Stacked bar by phase
3. **Pie Chart** - Cost breakdown
4. **Line Chart** - 12-month projection
5. **Category Cards** - Individual totals
6. **Detail Table** - All line items

### ✅ Export
- Download as CSV with date stamp
- Includes all items and totals

### ✅ Responsive
- Works on mobile, tablet, desktop
- Dark mode support included

## Component Properties

```typescript
// No props needed - uses internal state
<CostCalculator2A1 />

// Component manages:
// - costs: array of 20 sample items
// - form: add new cost dialog
// - visualizations: auto-calculated
// - export: CSV download
```

## Sample Data Included

20 realistic IPO cost items:
- Trading Systems: $2.5M
- Office Build-out: $3.2M
- Legal Docs: $2.8M
- CFO/Finance Salaries: $3.6M
- Underwriter Fees: $8.5M
- Brand Campaign: $3.2M
- + 14 more items

## Customization

### Add to Dashboard
```tsx
<Tabs defaultValue="costs">
  <TabsTrigger value="costs">Cost Calculator</TabsTrigger>
  <TabsContent value="costs">
    <CostCalculator2A1 />
  </TabsContent>
</Tabs>
```

### Use in Modal
```tsx
<Dialog>
  <DialogContent className="max-w-7xl max-h-[90vh]">
    <CostCalculator2A1 />
  </DialogContent>
</Dialog>
```

### Add Custom Title
```tsx
<div>
  <h1>IPO Expenses</h1>
  <p>Track all costs across CAPEX and OPEX</p>
  <CostCalculator2A1 />
</div>
```

## API Integration (Optional)

When ready to add backend:

```tsx
// API endpoints available in src/app/api/costs/route.ts
// GET    /api/costs           - Load costs
// POST   /api/costs           - Save costs
// PUT    /api/costs           - Update costs
// DELETE /api/costs?id=...    - Delete cost

// Example: Save costs to backend
async function saveCosts(costs) {
  await fetch('/api/costs', {
    method: 'POST',
    body: JSON.stringify({ costs })
  })
}
```

## Troubleshooting

**Charts not showing?**
- Verify Recharts installed: `npm ls recharts`
- Check browser console for errors

**Styles look wrong?**
- Ensure Tailwind CSS v4 is installed
- CSS file is imported

**Responsive broken?**
- Component uses Tailwind responsive classes
- Mobile breakpoints: sm, md, lg, xl

**Dark mode not working?**
- Add `dark` class to parent element
- Or use system preference with `prefers-color-scheme`

## Keyboard Shortcuts

- `Tab` - Navigate through form fields
- `Enter` - Submit form or confirm action
- Click trash icon - Delete cost item

## Next Steps

1. **View the component**: Open `/src/components/CostCalculator2A1.tsx`
2. **Read documentation**: See `BUILD_2A1_COST_CALCULATOR.md`
3. **See examples**: Check `COST_CALCULATOR_2A1_DEMO.tsx`
4. **Integrate**: Add to your dashboard/page
5. **Test**: Verify on mobile and desktop
6. **Deploy**: Push to production

## Documentation Files

| File | Content |
|------|---------|
| `BUILD_2A1_COST_CALCULATOR.md` | Complete technical guide |
| `COST_CALCULATOR_2A1_SUMMARY.md` | Full delivery summary |
| `COST_CALCULATOR_2A1_DEMO.tsx` | 9 integration examples |
| `COST_CALCULATOR_QUICK_START.md` | This file |

## File Sizes

- Component: 26KB (.tsx)
- Styling: 14KB (.css)
- API: 10KB (route.ts)
- Docs: 21KB (3 files)
- **Total**: ~71KB source (minified: ~15KB)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- iOS Safari 14+

## Support

For questions:
1. Check `BUILD_2A1_COST_CALCULATOR.md` (detailed guide)
2. Review `COST_CALCULATOR_2A1_DEMO.tsx` (9 examples)
3. Look at component JSDoc comments
4. Check console for error messages

## Summary

**Status**: Production-ready ✅

- 26KB React component with full features
- 20 sample IPO cost items ($30.6M total)
- 4 different chart types
- CSV export
- Dark mode
- Mobile responsive
- All documented

**Ready to use**: Import and drop into any page!

```tsx
import { CostCalculator2A1 } from '@/components/CostCalculator2A1'

export default function Page() {
  return <CostCalculator2A1 />
}
```

That's it. You're done. The component does the rest.
