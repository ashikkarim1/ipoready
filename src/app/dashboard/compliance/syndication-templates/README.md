# Syndication Templates Module

## Overview

The Syndication Templates module provides a read-only library of professional syndication agreement templates for IPO/RTO transactions. Users can preview, download, and customize these templates for their specific syndication needs.

## Features

### Template Library
- **3 Core Templates**:
  1. **Lead Underwriter Agreement** - Master agreement defining lead underwriter roles, responsibilities, compensation (3-7% discount), due diligence obligations, stabilization rights, and lock-up terms (180 days)
  2. **Co-Underwriter Agreement** - Framework for secondary underwriters with syndicate participation terms, commission sharing, sales commitments, and indemnification clauses
  3. **Standstill Agreement** - Lock-up and trading restrictions for insiders and syndicate members (180-270 days post-IPO)

### User Interface
- **Template Grid Display** - Visual cards showing template type, description, key terms, and exchange compatibility
- **Advanced Filtering**:
  - Filter by template type (Lead Underwriter, Co-Underwriter, Standstill)
  - Filter by exchange (NYSE, NASDAQ, TSX, TSXV, Euronext, London Stock Exchange)
  - Full-text search across titles and descriptions
- **Interactive Preview Modal** - Detailed template preview with:
  - Full template description
  - Expandable key terms with copy-to-clipboard functionality
  - Exchange compatibility information
  - Usage instructions and disclaimers
  - Download button with direct document generation

### Download Functionality
- **DOCX Format Generation** - Templates are generated as proper Microsoft Word documents (.docx files) on-demand
- **Customizable Content** - Users download templates they can immediately open in Microsoft Word and customize for their transaction
- **Proper Formatting** - Generated documents maintain professional formatting with:
  - Section headings and proper hierarchy
  - Indentation for subsections
  - Proper spacing and line heights
  - Signature blocks and witness sections

## File Structure

```
src/app/dashboard/compliance/syndication-templates/
├── page.tsx                 # Main templates library page
├── TemplatePreview.tsx       # Preview modal component
├── layout.tsx               # Layout wrapper
└── README.md                # This file

src/app/api/compliance/templates/
├── route.ts                 # GET endpoint returning template metadata
└── download/
    └── route.ts             # GET endpoint with ?id=template-id to generate DOCX
```

## API Endpoints

### GET /api/compliance/templates
Returns list of all available templates with metadata.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "template-001",
      "title": "Lead Underwriter Agreement",
      "type": "lead-underwriter",
      "description": "Master agreement between issuer and lead underwriter...",
      "keyTerms": [
        "Commitment: Lead underwriter commits...",
        "Compensation: Underwriting discount..."
      ],
      "exchanges": ["NYSE", "NASDAQ", "TSX"],
      "lastUpdated": "2026-01-15",
      "fileFormat": "docx"
    },
    ...
  ],
  "total": 3
}
```

### GET /api/compliance/templates/download?id={templateId}
Generates and downloads a specific template as a DOCX file.

**Parameters:**
- `id` (required) - Template ID (template-001, template-002, or template-003)

**Response:**
- Binary DOCX file as attachment with proper Content-Disposition header

## Template Content Details

### Template 001: Lead Underwriter Agreement
**Type:** lead-underwriter
**Key Sections:**
1. Commitment - Full commitment to purchase or find purchasers
2. Compensation - Underwriting discount structure (typically 3-7%)
3. Due Diligence - Investigation and access rights
4. Stabilization - 30-day stabilization period post-IPO
5. Lock-up Agreement - 180-day lock-up with limited exceptions
6. Representations and Warranties - Standard corporate reps
7. Indemnification - Mutual indemnification for misstatements
8. Termination - Conditions for termination

**Key Exchanges:** NYSE, NASDAQ, TSX

### Template 002: Co-Underwriter Agreement
**Type:** co-underwriter
**Key Sections:**
1. Syndicate Participation - Share allocation commitments
2. Compensation Structure - Discount and concession sharing
3. Sales Obligations - Good faith sales efforts
4. Lock-up and Standstill - Trading restrictions
5. Indemnification - Mutual indemnification
6. Liability Allocation - Joint and several vs proportionate
7. Expenses - Company payment of syndicate expenses
8. Representations and Warranties

**Key Exchanges:** NYSE, NASDAQ, TSX, Euronext

### Template 003: Standstill Agreement
**Type:** standstill
**Key Sections:**
1. Restricted Period - 180-270 day lock-up
2. Scope of Restrictions - No sales, transfers, shorts, or hedges
3. Permitted Transactions - Estate, hardship, Rule 10b5-1 exceptions
4. Rule 10b5-1 Trading Plans - Pre-arranged trading plan support
5. Enforcement and Penalties - Breach consequences
6. Public Announcement - Extension announcement requirements

**Key Exchanges:** NYSE, NASDAQ, TSX, TSXV

## Usage Instructions

### For IPO Teams
1. Navigate to Compliance → Syndication Templates
2. Use filters to find relevant templates (by type or exchange)
3. Click "Preview" to review full template details
4. Review key terms and exchange compatibility
5. Click "Download Template" to get DOCX file
6. Customize in Microsoft Word for your transaction
7. Share with legal counsel and syndicate members
8. Have legal counsel review all modifications

### Important Notes
- Templates are generic and must be customized for specific transactions
- Legal counsel review is mandatory before use
- Exchange requirements may vary by jurisdiction
- All percentages, timeframes, and terms should be negotiated with syndicate members

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API routes, NextAuth for authentication
- **Document Generation**: docx library for DOCX file creation
- **State Management**: React hooks (useState, useEffect)

## Security & Authentication

- All endpoints require NextAuth authentication
- Only authenticated users can access templates
- API checks session validity on each request
- Download generation is on-demand (no pre-generated files)

## Future Enhancements

- DOCX template generation with dynamic field placeholders
- Custom branding in generated documents (company logo, letterhead)
- Batch download of multiple templates
- Template version history and change tracking
- Custom template creation and storage
- Syndicate member collaboration features
- Integration with e-signature platforms

## Disclaimers

These templates are provided for informational purposes only and should not be considered legal advice. While based on realistic market practice, they are generic templates that must be customized for specific transactions. Users should consult with qualified legal counsel before using any agreement in connection with an IPO.

IPOReady assumes no liability for the use of these templates. Underwriters, companies, and relevant exchanges may have additional requirements or modifications.
