# Material Contracts Graph - Implementation Summary

## Overview
Successfully implemented a comprehensive Material Contracts Graph feature for IPOReady that visualizes the relationships between a prospectus and supporting documents. This feature enables IPO teams to track document requirements, status, and dependencies across different exchanges.

## Architecture

### 1. Database Schema (Migration: `017_document_relationships.sql`)

#### Tables Created:
- **document_types**: Master list of document types (14 pre-seeded types)
  - Prospectus (core)
  - Financing Agreement, Employment Contracts, IP Assignments, License Agreements, Service Contracts
  - Board Minutes, Shareholder Resolutions
  - Auditor Reports, Tax Compliance
  - Insurance Policies, Lease Agreements
  - Regulatory & Exchange Approvals

- **document_relationships**: Links between prospectus and supporting documents
  - Tracks required vs optional status per exchange
  - Status tracking: missing, in_progress, submitted, rejected, approved
  - Supports filing category tagging (e.g., "Section 2A", "Item 10")
  - Timestamps for uploaded, submitted, and approved states

- **document_graph_nodes**: Node metadata for graph visualization
  - Persists node positions for layout stability
  - Color coding by status
  - Icons and descriptions

- **document_graph_edges**: Edge definitions for graph relationships
  - Supports multiple relationship types: supports, references, requires
  - Weight-based attraction forces

#### Indexes:
- Company ID lookups
- Exchange filtering
- Status queries
- Graph traversal optimization

### 2. API Layer (`src/app/api/documents/relationships/route.ts`)

#### Endpoints:
- **GET /api/documents/relationships**
  - Query params: companyId, exchange (optional)
  - Returns relationships, nodes, and edges
  - Exchange-specific filtering

- **POST /api/documents/relationships**
  - Create/upsert document relationships
  - Validates company access
  - Handles initial document setup

- **PUT /api/documents/relationships**
  - Update relationship status
  - Track status transitions with timestamps
  - Support for rejection reasons

#### Security:
- NextAuth session validation on all endpoints
- Company-level access control
- User ownership verification

### 3. Frontend Components

#### Page Component (`page.tsx`)
- Main orchestrator for the contracts map view
- Manages session and authentication flow
- Handles API data fetching
- Coordinates between sidebar, graph, and details panel

#### DocumentGraphViewer (`DocumentGraphViewer.tsx`)
- Canvas-based force-directed graph visualization
- Custom physics simulation (repulsive + attractive forces)
- Interactive node dragging
- Real-time status-based color coding
  - Green: Submitted/Approved
  - Amber: In Progress
  - Red: Missing/Required
  - Gray: Optional
- Legend and instructions overlay

#### DocumentSidebar (`DocumentSidebar.tsx`)
- Hierarchical document list organized by category
- Search functionality across document names and filing categories
- Expandable category sections
- Status indicators with icons
- Document count and progress metrics
- Exchange requirement summary

#### DocumentDetailsPanel (`DocumentDetailsPanel.tsx`)
- Right-slide-in detail view
- Status-specific descriptions
- Timeline visualization (uploaded, submitted, approved)
- Category and requirement indicators
- Status transition buttons
- Requirements and notes display

## Features

### 1. Visual Graph Representation
- Central prospectus node (yellow/amber)
- Supporting documents arranged in circle
- Force-directed layout with physics simulation
- Draggable nodes for reorganization
- Edge weights influence attraction strength

### 2. Status Management
- 5-state status machine: missing → in_progress → submitted → approved/rejected
- Visual status indicators across all components
- Timestamp tracking for each status transition
- Status-specific action buttons

### 3. Exchange-Specific Requirements
- Filter documents by target exchange
- Mark documents as required vs recommended
- Filing category associations
- Exchange approval tracking

### 4. Document Categories
- Core (prospectus)
- Supporting (contracts, licenses, insurance)
- Governance (board minutes, resolutions, approvals)
- Financial (auditor reports, tax compliance)

### 5. Search and Navigation
- Full-text search across document names and filing categories
- Category expansion/collapse
- Status-based filtering
- Quick-select sidebar with icons

## User Workflow

1. **Initialization**: User navigates to Material Contracts Graph via dashboard
2. **Explore**: View force-directed graph of all required documents
3. **Select**: Click a node or sidebar item to view details
4. **Review**: Read requirements, status, and timeline
5. **Update**: Mark documents as in-progress, submitted, or approved
6. **Track**: Monitor progress with sidebar counters
7. **Submit**: Exchange-aware checklist prevents incomplete filings

## Key Implementation Details

### Force-Directed Layout
- Repulsive forces between all nodes prevent overlap
- Attractive forces along edges create document clusters
- Damping coefficient (0.95) stabilizes simulation
- Boundary constraints keep nodes on canvas
- Prospectus node locked to center

### Color Coding Strategy
- Status determines primary color
- Required vs optional affects missing state color
- Selected nodes highlighted with blue border
- Consistent across all components

### Performance Optimizations
- Canvas rendering (not DOM-based) for 100+ nodes
- Incremental force simulation with early exit
- Memoized component callbacks
- Efficient state updates

### Data Flow
```
API Fetch
  ↓
Page Component State
  ↓
DocumentGraphViewer (rendering)
DocumentSidebar (list + search)
DocumentDetailsPanel (details + actions)
  ↓
Status Update
  ↓
API PUT
  ↓
State Update
  ↓
Re-render All Components
```

## Database Seeding

Pre-seeded 14 document types with icons from lucide-react:
- BookOpen (Prospectus)
- FileContract (Financing Agreement)
- Users (Employment Contracts)
- Copyright (IP Assignment)
- FileCheck (License Agreement)
- Building2 (Service Contract)
- FileText (Board Minutes)
- CheckSquare (Shareholder Resolution)
- BarChart3 (Auditor Report)
- Receipt (Tax Compliance)
- Shield (Insurance Policy)
- Home (Lease Agreement)
- CheckCircle (Regulatory Approval)
- Zap (Exchange Approval)

## Usage

### For IPO Teams
1. Navigate to `/dashboard/documents/contracts-map?companyId=<id>&exchange=tsx`
2. View all required and optional documents
3. Click documents to see detailed requirements
4. Update status as documents are prepared
5. Monitor progress with sidebar metrics

### For Developers
- Extend with additional document types by adding rows to document_types table
- Customize edge weights in document_graph_edges for different relationship strengths
- Integrate with document upload system via document_file_id field
- Add approval workflows by tracking approved_at timestamps

## Files Created

1. `/migrations/017_document_relationships.sql` - Database schema
2. `/src/app/api/documents/relationships/route.ts` - API endpoints
3. `/src/app/dashboard/documents/contracts-map/page.tsx` - Main page
4. `/src/app/dashboard/documents/contracts-map/DocumentGraphViewer.tsx` - Graph visualization
5. `/src/app/dashboard/documents/contracts-map/DocumentSidebar.tsx` - Document list
6. `/src/app/dashboard/documents/contracts-map/DocumentDetailsPanel.tsx` - Details view

## Next Steps

### Phase 2A Extensions
- Integrate with document upload system
- Add approval workflow management
- Connect to exchange-specific requirements config
- Implement document version history
- Add bulk status operations
- Create exchange requirement templates

### Future Enhancements
- D3.js-based graph with zoom/pan
- Collaborative document editing indicators
- Real-time status notifications
- Dependency chain validation
- Automated document requirements fetcher
- PDF preview for submitted documents
