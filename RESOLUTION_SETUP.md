# Corporate Resolution Generator - Setup Guide

## Quick Start

### Step 1: Apply Database Schema

Connect to your Neon PostgreSQL database and run:

```sql
-- Copy contents from src/db/schema-resolutions.sql and execute
\i src/db/schema-resolutions.sql
```

This will create:
- `board_resolutions` table
- `resolution_approvals` table
- `resolution_templates` table
- `exchange_resolution_requirements` table (pre-populated)

### Step 2: Verify Files Are in Place

The implementation includes:

**Database**
- `/src/db/schema-resolutions.sql` - Schema definition and initial data

**Backend Libraries**
- `/src/lib/resolution-generator.ts` - Core resolution generation logic

**API Endpoints**
- `/src/app/api/compliance/resolutions/route.ts` - List & Create
- `/src/app/api/compliance/resolutions/[id]/route.ts` - Get, Update, Delete
- `/src/app/api/compliance/resolutions/[id]/download/route.ts` - Download DOCX/PDF
- `/src/app/api/compliance/resolutions/requirements/route.ts` - Get exchange requirements

**UI Pages**
- `/src/app/dashboard/compliance/resolutions/page.tsx` - List view
- `/src/app/dashboard/compliance/resolutions/new/page.tsx` - Create form
- `/src/app/dashboard/compliance/resolutions/[id]/page.tsx` - Detail view

### Step 3: Start Using the Feature

1. Navigate to `/dashboard/compliance/resolutions`
2. Click "+ New Resolution"
3. Fill out the form with:
   - Resolution type (select one)
   - Company name
   - Approval date
   - Board member names
   - Type-specific details
4. Click "Generate Resolution"
5. View the generated document
6. Download as DOCX or PDF

## Configuration

### Adding Exchange Requirements

To add or modify exchange requirements, insert into the database:

```sql
INSERT INTO exchange_resolution_requirements 
  (exchange, resolution_type, is_required, required_by_date, notes)
VALUES 
  ('tsx', 'prospectus_approval', true, 'Before filing', 'Required by TSX rules');
```

Supported exchanges: `tsx`, `tsxv`, `cse`, `nasdaq`, `nyse`, `otc`, `cboe`

### Customizing Templates

To add exchange-specific templates:

```sql
INSERT INTO resolution_templates 
  (resolution_type, exchange, is_required, template_content, template_variables, legal_language, version)
VALUES 
  ('prospectus_approval', 'tsx', true, 'BOARD RESOLUTION...[template text]...', 
   ARRAY['company_name', 'approval_date', 'board_members'], 
   '[legal boilerplate]', '1.1');
```

Template variables are referenced as `{{variable_name}}` in the template text.

## Testing the Implementation

### Test Case 1: Create Prospectus Approval

```bash
curl -X POST http://localhost:3000/api/compliance/resolutions \
  -H "Content-Type: application/json" \
  -d '{
    "resolutionType": "prospectus_approval",
    "companyName": "Test Corp",
    "approvalDate": "2026-06-03",
    "boardMembers": ["Alice Johnson", "Bob Smith"],
    "prospectusDetails": {
      "prospectusTitle": "IPO Prospectus"
    }
  }'
```

### Test Case 2: Download as DOCX

After creating a resolution with ID `xyz`:

```bash
curl http://localhost:3000/api/compliance/resolutions/xyz/download?format=docx \
  -o resolution.docx
```

### Test Case 3: Get Exchange Requirements

```bash
curl http://localhost:3000/api/compliance/resolutions/requirements?exchange=tsx
```

## Dependencies

The implementation uses these npm packages (already in package.json):

- `docx` - DOCX document generation
- `pdfkit` - PDF document generation
- `next-auth` - Authentication
- React UI components from your existing component library

## Troubleshooting

### Database Connection Issues

Verify the `sql` function from `@/lib/db` is properly configured:
- Check connection string in `.env.local`
- Ensure Neon database is running
- Test with: `SELECT * FROM board_resolutions LIMIT 1`

### File Download Issues

1. Check that API route is accessible: `/api/compliance/resolutions/[id]/download`
2. Verify browser allows file downloads
3. Check Content-Disposition header in response

### Template Rendering

If templates don't show correctly:
1. Verify HTML is properly stored in `html_content` field
2. Check that HTML escaping is working: `&amp;`, `&lt;`, etc.
3. Ensure CSS classes exist for styling

## Production Considerations

### Before Going Live

1. **Database Backups**: Set up regular backups of board_resolutions table
2. **Audit Logging**: Implement detailed logging in compliance-schema
3. **Email Notifications**: Integrate with email service for approval requests
4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **File Storage**: Consider adding S3/GCS storage for generated PDFs
6. **Signature Verification**: Integrate signature library (e.g., libsodium)

### Performance Tuning

- Add caching for template queries (frequently accessed)
- Batch approval updates for large boards
- Archive old resolutions to improve list query speed
- Consider CDN for PDF downloads

### Security Hardening

- Implement row-level security (RLS) on board_resolutions
- Add IP whitelisting for API endpoints
- Encrypt stored signature data
- Implement rate limiting per user
- Add CSRF protection (already in Next.js)

## Integration with Existing Systems

### PACE Integration

Link resolutions to companies from PACE:

```sql
-- Get company from PACE system
SELECT * FROM companies WHERE id = $1;

-- Create resolution for that company
INSERT INTO board_resolutions (company_id, ...) VALUES ($1, ...);
```

### Prospectus Integration

The Prospectus Approval resolution can link to prospectus documents:

```javascript
// In UI: Show linked prospectus after approving
const prospectusId = linkedProspectus?.id;
const resolutionId = newResolution?.id;
```

### Checklist Integration

Add resolution generation to compliance checklist:

```javascript
// Mark "Generate Prospectus Approval Resolution" as complete
updateChecklistItem(checklist.id, 'prospectus_approval', 'completed');
```

## File Sizes and Storage

Expected document sizes:
- DOCX: 10-50 KB (depending on content)
- PDF: 20-100 KB (depending on content)

Not stored permanently (generated on-demand), so no long-term storage concerns.

## Next Steps

After setup, consider:

1. **Email Workflow**: Notify board members to sign
2. **Signature Capture**: Implement signature collection
3. **Archival**: Auto-archive after execution date
4. **Reporting**: Build compliance status dashboard
5. **Exchange Connectivity**: Auto-submit to exchanges (if supported)

## Support

For issues or questions:
1. Check this guide and CORPORATE_RESOLUTION_GENERATOR.md
2. Review API response error messages
3. Check browser console for client-side errors
4. Review server logs for API errors
5. Verify database queries with: `SELECT * FROM board_resolutions ORDER BY created_at DESC LIMIT 5;`

## API Reference

### Status Values
- `draft` - Initial state, editable
- `approved` - Board has approved, ready to execute
- `executed` - Signed and executed
- `archived` - Historical record

### Approval Status Values
- `pending` - Waiting for signature
- `approved` - Board member has signed
- `rejected` - Board member rejected

### Resolution Type Values
- `prospectus_approval`
- `listing_approval`
- `underwriting_authorization`
- `material_contracts`

### Exchange Values
- `tsx` - Toronto Venture Exchange
- `tsxv` - TSX Venture Exchange
- `cse` - Canadian Securities Exchange
- `nasdaq` - NASDAQ
- `nyse` - New York Stock Exchange
- `otc` - Over-The-Counter
- `cboe` - Chicago Board Options Exchange
