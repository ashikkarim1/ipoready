# Directors & Officers Management Page

A world-class governance dashboard for managing board members, executive officers, and significant shareholders with full regulatory compliance tracking for IPO listings.

## Quick Start

### Accessing the Page
Navigate to `/dashboard/prospectus/[prospectus-id]/directors-officers`

### Key Features

#### 1. Board Composition Overview
- Real-time statistics on directors, committees, and independence
- Exchange requirement checklist (TSXV, TSX, NASDAQ, NYSE)
- Quick-add buttons for new directors/officers

#### 2. Directors Management
- Full board member profiles with governance roles
- Independence status tracking
- Committee assignments (Audit, Compensation, Governance, Nomination)
- Residency verification for Canadian exchanges
- PIF (Personal Information Form) status tracking
- Document attachment (board resolutions, declarations, etc.)

#### 3. Officers Management
- Executive team profiles with compensation tracking
- SEDI (System for Electronic Disclosure) registration status
- Share holdings tracking (common shares, options, warrants)
- Insider trading reporting indicators
- 5-day notification requirements

#### 4. Significant Shareholders
- Track all 10%+ shareholders
- PIF requirements and status
- Shareholder agreement documentation
- Cap table verification

#### 5. Regulatory Compliance
- Exchange-specific requirements checklist
- Real-time compliance status
- Category-based organization (Board Composition, Committees, Independence, Expertise, Documentation)
- Progress tracking with days-to-completion estimates

## Component Structure

```
directors-officers/
├── page.tsx                          # Main page with state management
├── types.ts                          # TypeScript interfaces
├── components/
│   ├── BoardCompositionOverview.tsx  # Top section with stats
│   ├── DirectorsTable.tsx            # Directors list table
│   ├── OfficersTable.tsx             # Officers list table
│   ├── SignificantShareholdersTable.tsx  # Shareholders list table
│   ├── RegulatoryChecklist.tsx       # Sticky compliance checklist
│   ├── AddPersonModal.tsx            # Add/Edit modal form
│   └── index.ts                      # Component exports
├── IMPLEMENTATION_GUIDE.md           # Detailed development guide
└── README.md                         # This file
```

## Data Flow

### Adding a Person

1. User clicks "+ Add Director/Officer/Shareholder"
2. Modal opens with appropriate form fields
3. User fills in details and submits
4. Data sent to API endpoint: `/api/prospectus/[id]/{directors|officers|shareholders}`
5. API creates record and returns data
6. Component updates local state
7. Table refreshes with new entry

### Editing a Person (Todo)

1. User clicks Edit icon on table row
2. Modal opens with person's current data
3. User updates fields
4. PUT request sent to `/api/prospectus/[id]/{directors|officers|shareholders}/[personId]`
5. State updated and table refreshes

### Deleting a Person

1. User clicks Delete icon on table row
2. DELETE request sent to endpoint
3. Item removed from local state and table

## API Endpoints

### Directors
- `GET /api/prospectus/[id]/directors` - List all directors
- `POST /api/prospectus/[id]/directors` - Create director
- `PUT /api/prospectus/[id]/directors/[directorId]` - Update director
- `DELETE /api/prospectus/[id]/directors/[directorId]` - Delete director

### Officers
- `GET /api/prospectus/[id]/officers` - List all officers
- `POST /api/prospectus/[id]/officers` - Create officer
- `PUT /api/prospectus/[id]/officers/[officerId]` - Update officer
- `DELETE /api/prospectus/[id]/officers/[officerId]` - Delete officer

### Shareholders
- `GET /api/prospectus/[id]/shareholders` - List all 10%+ shareholders
- `POST /api/prospectus/[id]/shareholders` - Create shareholder
- `PUT /api/prospectus/[id]/shareholders/[shareholderId]` - Update shareholder
- `DELETE /api/prospectus/[id]/shareholders/[shareholderId]` - Delete shareholder

### Regulatory Checklist
- `GET /api/prospectus/[id]/regulatory-checklist?exchange=tsxv` - Get checklist items

## Styling & Design

### IPOReady Brand Colors
- Primary Red: `#E8312A` - Used for buttons and highlights
- Beige Background: `#F7F6F4` - Page background color

### UI Components Used
- **Card system**: CardHeader, CardTitle, CardDescription, CardContent
- **Buttons**: Default and custom styled
- **Tables**: Responsive with hover effects
- **Forms**: Input, Label, select elements
- **Modals**: AnimatePresence with Framer Motion
- **Icons**: lucide-react icons (Check, AlertCircle, Edit2, Trash2, etc.)

### Responsive Design
- Mobile-first approach
- Stacked layout on mobile (< 768px)
- Side-by-side layout on desktop
- Sticky sidebar for checklist
- Horizontal scroll for wide tables (optional)

## Development Tips

### Mock Data
The page includes mock data generators for development:
- `getMockDirectors()` - Sample directors
- `getMockOfficers()` - Sample officers
- `getMockShareholders()` - Sample shareholders
- `getMockRegulatoryItems()` - Sample regulatory items

These are used if API endpoints aren't available.

### State Management
- React hooks for local state (useState)
- useParams for URL parameters
- useRouter for navigation
- useSession for authentication

### Error Handling
- Try-catch blocks in data fetching
- Graceful fallback to mock data
- Console error logging
- User-friendly error messages (todo)

## Next Steps - Phase 2

### High Priority
1. Implement database integration using Prisma
2. Build edit functionality with PUT endpoints
3. Create PIF workflow (email invitations, tracking)
4. Add document upload functionality

### Medium Priority
1. SEDI registration integration
2. Advanced filtering and search
3. Export to PDF reports
4. Audit trail tracking
5. Validation rule enforcement

### Nice to Have
1. Photo upload and display
2. Integration with cap table
3. Email notifications
4. Real-time collaboration
5. Historical tracking

## Testing

### Component Tests
Test rendering of each component with various data states.

### Integration Tests
Test API endpoints with database.

### E2E Tests
Test complete user workflows:
- Add director → Send PIF → Verify status
- Add officer → Register SEDI → Update holdings
- Filter and search functionality
- Export governance report

## Troubleshooting

### Modal doesn't appear
- Check `showAddModal` state in main page
- Verify `AddPersonModal` component is rendered
- Check for z-index conflicts

### API returns empty list
- Verify database tables exist and have data
- Check route parameter is correct
- Ensure API endpoint exists and returns proper JSON
- Check browser console for fetch errors

### Styling looks off
- Verify Tailwind CSS is configured
- Check color classes match design system
- Ensure custom color values are set (E8312A, F7F6F4)
- Verify responsive breakpoints

### Data doesn't persist
- Check if API endpoint is saving to database
- Verify database connection is working
- Check for validation errors
- Look for console errors

## Contributing

When adding new features:
1. Update types.ts with new interfaces
2. Create new component in components/ directory
3. Update main page.tsx to use new component
4. Create/update API routes as needed
5. Update IMPLEMENTATION_GUIDE.md
6. Test with mock data first
7. Implement database integration
8. Add error handling
9. Update this README

## Resources

- [TSXV Governance Requirements](https://www.tsx.com/)
- [SEC Corporate Governance](https://www.sec.gov/)
- [NASDAQ Listing Rules](https://www.nasdaq.com/)
- [NYSE Governance](https://www.nyse.com/)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)
