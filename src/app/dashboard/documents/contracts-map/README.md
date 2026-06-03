# Contracts Graph: Material Contracts Network Visualization

A stunning, interactive force-directed graph visualization for demonstrating prospectus document relationships and submission status. Built as a central hub for IPO readiness workflow management (Phase 2B.1).

## Feature Overview

### Visual Design
- **Force-Directed Physics Simulation**: Natural node positioning with smooth animations
- **Central Prospectus Node**: Orbiting support documents in a circular layout
- **Color-Coded Status Indicators**:
  - Green (#10b981): Submitted documents
  - Amber (#f59e0b): Recommended documents  
  - Red (#ef4444 pulsing): Required documents missing
- **Interactive Elements**:
  - Hover effects with connection highlighting
  - Click nodes to open detailed sidebar panel
  - Animated pulsing effect on missing required documents
  - Responsive SVG canvas with smooth transitions

### Database-Driven
- **Exchange-Specific Requirements**: Document requirements vary by exchange (TSX, NASDAQ, NYSE, etc.)
- **Real-time Status Tracking**: Dynamically computed based on submission status
- **Document Metadata**: Full descriptions, filing categories, and regulatory context
- **Relationship Tracking**: Source and target document links with relationship types

## Architecture

### Components

#### `ContractsMap.tsx` (Main Component)
The reusable visualization component with:
- Force-directed physics engine (150 iterations)
- SVG-based rendering for crisp graphics
- Right sidebar details panel with animated transitions
- Status legend in bottom-left corner
- Responsive design handling multiple document types

**Props:**
```typescript
interface ContractsMapProps {
  nodes: ContractNode[]
  onNodeClick?: (node: ContractNode) => void
  onUploadClick?: (node: ContractNode) => void
  companyName?: string
}

interface ContractNode {
  id: string
  name: string
  type: string
  status: 'submitted' | 'recommended' | 'required-missing'
  submittedAt?: string
  description: string
  icon: React.ReactNode
}
```

#### `page.tsx` (Demo / Integration Point)
The main page component that:
- Fetches real contract data from the API
- Supports query parameters: `companyId` and `exchange`
- Falls back to mock data for demo purposes
- Manages upload flow with visual feedback
- Shows risk assessment alerts

#### `useContractRelationships.ts` (Custom Hook)
A utility hook for integrating the graph elsewhere:
```typescript
const { nodes, loading, error, summary, refresh } = useContractRelationships(
  companyId,
  exchange
)
```

### API Endpoints

#### `GET /api/documents/relationships`
Fetch document relationships and graph data for a company.

**Query Parameters:**
- `companyId` (required): Company UUID
- `exchange` (optional): Exchange code (tsx, nasdaq, nyse, etc.)

**Response:**
```typescript
{
  relationships: [{
    id: string
    document_type_code: string
    document_type_name: string
    document_type_description: string
    is_required: boolean
    status: 'missing' | 'submitted' | 'approved' | 'rejected'
    submitted_at?: timestamp
    approved_at?: timestamp
    metadata?: object
  }],
  nodes: [],      // Graph node positions
  edges: [],      // Graph relationships
  company_id: string
  exchange: string | null
  summary: {
    total: number
    required: number
    submitted: number
    missing: number
    recommended: number
  }
}
```

#### `POST /api/documents/relationships`
Create or update a document relationship.

**Request Body:**
```typescript
{
  companyId: string
  targetDocumentTypeId: string
  relationshipType?: string        // 'supports', 'references', 'requires', 'supplements'
  isRequired?: boolean
  exchange?: string
  filingCategory?: string
  status?: string                  // 'missing', 'in_progress', 'submitted', 'approved', 'rejected'
  notes?: string
}
```

#### `PUT /api/documents/relationships/:id`
Update relationship status (mark as submitted, approved, etc.).

**Request Body:**
```typescript
{
  relationshipId: string
  status?: string
  uploadedAt?: timestamp
  submittedAt?: timestamp
  approvedAt?: timestamp
  rejectionReason?: string
}
```

#### `POST /api/documents/relationships/initialize`
Initialize document relationships for a company based on exchange requirements.

**Request Body:**
```typescript
{
  companyId: string
  exchange: string  // Required to determine doc requirements
}
```

**Response:**
```typescript
{
  success: boolean
  exchange: string
  company_id: string
  relationships_created: number
  relationships: [] // Sample of created relationships
}
```

## Database Schema

### Key Tables

#### `document_types`
Master list of all document types with metadata:
```sql
CREATE TABLE document_types (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE,        -- 'prospectus', 'financing_agreement', etc.
  display_name VARCHAR(100),
  description TEXT,
  icon_name VARCHAR(50),          -- lucide icon name
  category VARCHAR(50)            -- 'core', 'supporting', 'governance', 'financial'
);
```

#### `document_relationships`
Links between prospectus and supporting documents:
```sql
CREATE TABLE document_relationships (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies,
  target_document_type_id UUID REFERENCES document_types,
  is_required BOOLEAN,
  exchange VARCHAR(20),           -- 'tsx', 'nasdaq', null = all
  status VARCHAR(50),             -- 'missing', 'submitted', 'approved', 'rejected'
  submitted_at TIMESTAMP,
  approved_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### `document_graph_nodes` (Optional)
Persist force-directed layout positions:
```sql
CREATE TABLE document_graph_nodes (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies,
  document_type_id UUID REFERENCES document_types,
  position_x FLOAT,               -- For layout persistence
  position_y FLOAT,
  UNIQUE(company_id, document_type_id)
);
```

#### `document_graph_edges` (Optional)
Define graph relationships:
```sql
CREATE TABLE document_graph_edges (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies,
  source_node_id UUID REFERENCES document_graph_nodes,
  target_node_id UUID REFERENCES document_graph_nodes,
  relationship_label VARCHAR(100),
  edge_type VARCHAR(50),
  weight FLOAT
);
```

## Usage Examples

### Basic Integration
```tsx
import ContractsMap from '@/app/dashboard/documents/contracts-map'

export default function Dashboard() {
  const { nodes, loading } = useContractRelationships(companyId)
  
  if (loading) return <div>Loading...</div>
  
  return (
    <ContractsMap 
      nodes={nodes}
      onNodeClick={(node) => console.log(node)}
      companyName="TechCorp Inc."
    />
  )
}
```

### Fetch & Initialize
```tsx
// On company creation with exchange selection
const initializeContracts = async (companyId, exchange) => {
  // Initialize relationships based on exchange requirements
  const response = await fetch('/api/documents/relationships/initialize', {
    method: 'POST',
    body: JSON.stringify({ companyId, exchange })
  })
  
  const result = await response.json()
  console.log(`Created ${result.relationships_created} relationships`)
}
```

### Update Document Status
```tsx
const submitDocument = async (relationshipId) => {
  await fetch('/api/documents/relationships', {
    method: 'PUT',
    body: JSON.stringify({
      relationshipId,
      status: 'submitted',
      submittedAt: new Date().toISOString()
    })
  })
}
```

## Document Types Reference

The system includes 14 document types:

### Core Documents
- **Prospectus** - Main offering document (always required)

### Required by Default
- **Financing Agreement** - Underwriting/credit facilities
- **Employment Contract** - Key executive agreements
- **IP Assignment** - Intellectual property transfers
- **Board Minutes** - Board resolutions
- **Service Contract** - Material vendor agreements
- **Tax Compliance** - Tax filings and compliance

### Exchange-Specific
- **Auditor Report** - Required by TSX, NASDAQ, NYSE

### Recommended
- **License Agreement** - Material licenses
- **Shareholder Resolution** - Shareholder approvals
- **Insurance Policy** - Material insurance
- **Lease Agreement** - Real estate/equipment leases
- **Regulatory Approval** - Exchange/regulatory clearances

## Exchange Configuration

Document requirements are determined by the exchange configuration:

```typescript
// Exchange-specific requirements
const exchangeConfig = getExchangeConfig('tsx')
// Returns requirements like minFinancialHistory, requiresAuditCommittee, etc.
```

The `initialize` endpoint uses this configuration to automatically set:
- Which documents are required vs. recommended
- Exchange-specific filing categories
- Regulatory requirements

## Performance Characteristics

- **Physics Simulation**: ~150 iterations, stabilizes in ~1-2 seconds
- **SVG Rendering**: Scales smoothly to 7+ document nodes
- **Re-renders**: Minimal with React state management
- **Animation**: 60fps with requestAnimationFrame

## Design Decisions

### 1. Force-Directed Layout
Creates natural, visually pleasing relationships without manual positioning.

### 2. SVG-Based (No D3.js)
Lightweight implementation with smooth transitions and no external dependency bloat.

### 3. Color Status Coding
Red/Amber/Green provides instant visual risk assessment at a glance.

### 4. Pulsing Animation
Missing required documents pulse with visual urgency to drive action.

### 5. Exchange-Driven Schema
Document requirements automatically adapt to selected exchange for compliance.

## Integration Points

### Dashboard Integration
Add to main dashboard to show document progress:
```tsx
<Card title="Material Contracts">
  <ContractsMap nodes={nodes} companyName={company.name} />
</Card>
```

### Onboarding Flow
Initialize during company setup:
```tsx
// After company & exchange selection
await fetch('/api/documents/relationships/initialize', {
  method: 'POST',
  body: JSON.stringify({ companyId, exchange })
})
```

### Task Generation
Create tasks from missing documents:
```tsx
const missingDocs = nodes.filter(n => n.status === 'required-missing')
missingDocs.forEach(doc => {
  createTask({
    title: `Submit ${doc.name}`,
    description: doc.description,
    type: 'document_submission'
  })
})
```

## Future Enhancements

1. **Persistent Layout**: Save node positions to database
2. **Document Upload Integration**: Direct file upload within sidebar
3. **Regulatory Checklist**: Auto-generate compliance checklist
4. **Notification System**: Alert on missing documents approaching deadlines
5. **Audit Trail**: Log all document submissions and approvals
6. **Template Library**: Auto-populate document templates by exchange
7. **Stakeholder Roles**: Different document visibility/approval workflows

## Testing

Run the demo page with mock data:
```bash
# Navigate to /dashboard/documents/contracts-map
# See 7 sample documents with mixed statuses
# Click nodes to open sidebar
# Test upload flow
```

Test with real data:
```bash
# Add ?companyId=<uuid>&exchange=tsx
# Should fetch and display real document relationships
```

## Troubleshooting

### No documents appear
- Verify `companyId` and `exchange` query parameters
- Check that relationships exist in database
- Fall back shows mock data if API fails

### Sidebar doesn't open
- Verify `onNodeClick` handler is passed
- Check browser console for errors
- Ensure node IDs are unique

### Physics simulation stuck
- Normal - simulation stops after 150 iterations
- Nodes should be stable after ~2 seconds
- If not, check for duplicate node IDs

## Performance Optimization

For 20+ documents:
1. Implement clustering (group by category)
2. Use WebGL rendering instead of SVG
3. Implement lazy loading of descriptions
4. Cache relationship data with SWR

## References

- Migration: `/migrations/017_document_relationships.sql`
- Exchange Config: `/src/lib/exchange-config.ts`
- Component Docs: ContractsMap.tsx JSDoc comments