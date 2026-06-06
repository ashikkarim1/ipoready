# Document Coordination OS: Complete Solution
## Solving PRE-IPO Document Chaos with Version Control + Approval Workflows

**Status**: Architecture & Design Phase  
**Priority**: CRITICAL (Pre-IPO readiness)  
**Target Launch**: Phase 2A (Week 3)  
**Compliance**: SOC 2, SEC EDGAR, Board-Ready Audit Trail  

---

## EXECUTIVE SUMMARY

**The Problem**: 50+ stakeholders, 200+ documents, chaos.
- Legal uploaded v3 while Finance thinks v5 is current
- Board can't review because they don't know which files are final
- CEO can't tell what's approved vs what needs work
- Auditors can't find complete chain of custody

**The Solution**: Unified Document OS with automatic version control + mandatory approval workflows
- Single source of truth (unified_documents table)
- Clear naming convention: `[Category]-[Document]-[v#]-[Status]`
- Approval chain: Creator → Reviewer → Approver with mandatory sign-off
- Real-time dashboard showing document status, approval bottlenecks, and audit trail
- Automatic notifications for overdue approvals
- Complete SOC 2 / SEC-ready audit trail

**Impact**: 
- 40% faster document coordination
- Zero document confusion
- Auditors can download complete version history in seconds
- Board has real-time visibility into readiness

---

## PART 1: ARCHITECTURE FOUNDATION

### 1.1 Unified Document OS Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DOCUMENT COORDINATION OS                   │
│                 (Built on unified_documents)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
         ┌──────▼──────┐  ┌──▼──────┐  ┌───▼─────────┐
         │   VERSION   │  │APPROVAL │  │    AUDIT    │
         │  CONTROL    │  │WORKFLOWS│  │    TRAIL    │
         └─────────────┘  └─────────┘  └─────────────┘
                │             │             │
       ┌────────▼─────────────▼─────────────▼────────┐
       │  unified_documents table (Single Source)     │
       │  + document_versions table (History)         │
       │  + approval_workflows table (Chain)          │
       │  + document_access_log table (Audit)         │
       └──────────────────────────────────────────────┘
                │
    ┌───────────┼───────────┐
    │           │           │
    ▼           ▼           ▼
 Google      Dropbox      OneDrive
  Drive        Box       (Cloud-agnostic)
```

### 1.2 Database Schema Extensions

#### Table: `document_versions` (Already Exists)
```sql
CREATE TABLE document_versions (
  id UUID PRIMARY KEY,
  document_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  storage_id VARCHAR(500),                    -- Cloud storage ID for this version
  change_notes TEXT,                          -- What changed
  uploaded_by UUID,
  uploaded_at TIMESTAMP WITH TIME ZONE,
  is_latest BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Table: `approval_workflows` (NEW)
```sql
CREATE TABLE approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  
  -- Workflow metadata
  workflow_type VARCHAR(50),                  -- 'standard', 'legal', 'board', 'compliance'
  status VARCHAR(50) NOT NULL,                -- 'pending', 'in_progress', 'approved', 'rejected'
  
  -- Creator information
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Approval chain
  approval_chain JSONB NOT NULL,              -- [{role: 'reviewer', user_id, status, comment_at, comment}]
  
  -- Timeline
  start_at TIMESTAMP WITH TIME ZONE,
  due_at TIMESTAMP WITH TIME ZONE,           -- When approval is needed (for notifications)
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Audit
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_approval_document FOREIGN KEY (document_id)
    REFERENCES unified_documents(id) ON DELETE CASCADE,
  CONSTRAINT unique_active_approval UNIQUE (document_id, version_number, status)
    WHERE status IN ('pending', 'in_progress')
);

CREATE INDEX idx_approval_document_id ON approval_workflows(document_id);
CREATE INDEX idx_approval_status ON approval_workflows(status);
CREATE INDEX idx_approval_due_at ON approval_workflows(due_at);
```

#### Table: `approval_steps` (NEW)
```sql
CREATE TABLE approval_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL,
  
  -- Step metadata
  step_order INTEGER NOT NULL,                -- 1, 2, 3 (sequence)
  approver_role VARCHAR(100) NOT NULL,       -- 'creator', 'legal_review', 'cfo_sign', 'board_approve'
  approver_user_id UUID,                     -- Assigned to user (may be filled later)
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending',       -- 'pending', 'approved', 'rejected', 'skipped'
  
  -- Approval action
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Comment from approver
  comment TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_step_workflow FOREIGN KEY (workflow_id)
    REFERENCES approval_workflows(id) ON DELETE CASCADE
);

CREATE INDEX idx_approval_step_workflow ON approval_steps(workflow_id);
CREATE INDEX idx_approval_step_status ON approval_steps(status);
CREATE INDEX idx_approval_step_approver ON approval_steps(approver_user_id);
```

#### Table: `document_naming_rules` (NEW)
```sql
CREATE TABLE document_naming_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  
  -- Category configuration
  category VARCHAR(100) NOT NULL,            -- 'legal', 'financial', 'governance', etc.
  naming_convention VARCHAR(500),            -- Template: "[Category]-[Document]-[v#]-[Status]"
  
  -- Validation rules
  required_fields JSONB,                     -- {displayName, category, documentType, ...}
  forbidden_patterns VARCHAR(500)[],         -- Patterns that trigger alerts (e.g., "old", "draft2")
  
  -- Approval requirements
  requires_approval BOOLEAN DEFAULT FALSE,
  approval_roles VARCHAR(100)[],             -- ['legal_review', 'cfo_sign']
  approval_days INTEGER,                     -- Days to complete approval (SLA)
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_naming_rules_company FOREIGN KEY (company_id)
    REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_naming_rules_company ON document_naming_rules(company_id);
CREATE INDEX idx_naming_rules_category ON document_naming_rules(category);
```

---

## PART 2: NAMING CONVENTION & VERSION CONTROL

### 2.1 Standard Naming Convention

**Template**: `[Category]-[Document]-[Version]-[Status]`

**Examples**:
```
Legal-ArticlesOfIncorporation-v1-Draft
Legal-ArticlesOfIncorporation-v5-ApprovedByBoard
Financial-AuditedFinancials-FY2024-v2-InReview
Financial-AuditedFinancials-FY2024-v3-ApprovedByCFO
Governance-BoardResolution-IPOAuthority-v1-ApprovedByBoard
Governance-CapTable-v8-ApprovedByBoard
HR-ConfidentialityAgreements-v3-Final
Compliance-RiskFactors-Draft-Pending
Compliance-RiskFactors-v1-InReview
Compliance-RiskFactors-v1-ApprovedBySEC
```

### 2.2 Naming Convention Rules by Category

```javascript
const namingRules = {
  legal: {
    prefix: 'Legal',
    requiredDocuments: [
      'ArticlesOfIncorporation',
      'ByLaws',
      'SharePurchaseAgreements',
      'EmploymentContracts',
      'IPAgreements'
    ],
    requiresApproval: true,
    approvalChain: ['general_counsel', 'ceo', 'board']
  },
  
  financial: {
    prefix: 'Financial',
    requiredDocuments: [
      'AuditedFinancials',
      'UnauditedFinancials',
      'CapTable',
      'CashFlowStatement'
    ],
    requiresApproval: true,
    approvalChain: ['cfo', 'auditor', 'board']
  },
  
  governance: {
    prefix: 'Governance',
    requiredDocuments: [
      'BoardResolutions',
      'CapTable',
      'Org Chart',
      'Leadership Bios'
    ],
    requiresApproval: true,
    approvalChain: ['general_counsel', 'board']
  },
  
  compliance: {
    prefix: 'Compliance',
    requiredDocuments: [
      'RiskFactors',
      'LitigationDisclosure',
      'RelatedPartyTransactions',
      'ComplianceCertification'
    ],
    requiresApproval: true,
    approvalChain: ['compliance_officer', 'general_counsel', 'sec']
  },
  
  operational: {
    prefix: 'Operational',
    requiredDocuments: [
      'ProcessDocumentation',
      'SecurityPolicies',
      'DataRetention'
    ],
    requiresApproval: false
  }
};
```

### 2.3 Version Control Logic

```typescript
/**
 * Unified Document Version Control Service
 * Manages version increments, status transitions, and audit trail
 */
export class DocumentVersionControlService {
  
  /**
   * Create new version when document is updated
   * - Creates document_versions entry
   * - Creates approval_workflows entry if required
   * - Updates unified_documents.current_version
   * - Triggers notifications for approvers
   */
  static async createNewVersion(
    documentId: string,
    file: File,
    changeNotes: string,
    userId: string
  ): Promise<{versionNumber: number; workflowId: string}> {
    // Get current document
    const doc = await UnifiedDocumentService.getDocument(documentId);
    const nextVersion = doc.currentVersion + 1;
    
    // Upload new version to cloud
    const fileMetadata = await uploadToCloud(file, doc.storageProvider);
    
    // Create document_versions entry
    const versionRecord = await sql`
      INSERT INTO document_versions (
        id, document_id, version_number, storage_id, 
        change_notes, uploaded_by, uploaded_at
      ) VALUES (
        gen_random_uuid(), ${documentId}, ${nextVersion},
        ${fileMetadata.id}, ${changeNotes}, ${userId}, NOW()
      )
      RETURNING id
    `;
    
    // Update unified_documents
    await sql`
      UPDATE unified_documents
      SET current_version = ${nextVersion},
          total_versions = ${nextVersion},
          last_modified_by = ${userId},
          last_modified_at = NOW()
      WHERE id = ${documentId}
    `;
    
    // Create approval workflow if required by category
    const namingRules = await this.getNamingRules(doc.category);
    let workflowId = null;
    
    if (namingRules.requires_approval) {
      workflowId = await this.createApprovalWorkflow(
        documentId,
        nextVersion,
        namingRules.approval_roles,
        userId
      );
    } else {
      // Auto-approve if no approval needed
      await sql`
        UPDATE unified_documents
        SET status = 'approved'
        WHERE id = ${documentId}
      `;
    }
    
    // Log to audit trail
    await this.logAuditTrail(documentId, 'version_created', {
      versionNumber: nextVersion,
      uploadedBy: userId,
      changeNotes
    });
    
    return { versionNumber: nextVersion, workflowId };
  }
  
  /**
   * Get complete version history for a document
   * Used for audit trail and version comparison
   */
  static async getVersionHistory(documentId: string) {
    const versions = await sql`
      SELECT 
        v.version_number,
        v.uploaded_by,
        v.uploaded_at,
        v.change_notes,
        u.display_name,
        u.status,
        COUNT(DISTINCT a.id) as approval_count
      FROM document_versions v
      LEFT JOIN unified_documents u ON v.document_id = u.id
      LEFT JOIN approval_steps a ON v.document_id = a.workflow_id
      WHERE v.document_id = ${documentId}
      ORDER BY v.version_number DESC
    `;
    
    return versions;
  }
}
```

---

## PART 3: APPROVAL WORKFLOWS

### 3.1 Workflow Types

#### Standard Approval Workflow
```
Document Uploaded (v1)
    ↓
Creator Review ✓
    ↓
General Counsel Review → {Approve | Request Changes}
    ↓ (if Approve)
CFO/Finance Review → {Approve | Request Changes}
    ↓ (if Approve)
CEO Review → {Approve | Request Changes}
    ↓ (if Approve)
Board Vote → {Approve | Request Changes}
    ↓ (if Approve)
Document Status: "APPROVED" + notification sent to all stakeholders
```

#### Legal Documents Workflow
```
Creator → Legal Counsel Review → CFO Review → CEO Review → Board Approval
(All required, sequential, no skipping)
```

#### Board-Level Documents Workflow
```
Creator → General Counsel Review → Board Vote
(Most critical, fast-tracked)
```

#### Compliance Documents Workflow
```
Creator → Compliance Officer Review → Legal Counsel Review → SEC/Regulatory Sign-off
(Regulatory bodies may need to review)
```

### 3.2 Approval Workflow Service

```typescript
export class ApprovalWorkflowService {
  
  /**
   * Create approval workflow for a document version
   * Triggered when document is uploaded and requires approval
   */
  static async createApprovalWorkflow(
    documentId: string,
    versionNumber: number,
    approvalRoles: string[],
    createdBy: string,
    dueInDays: number = 5
  ): Promise<string> {
    const workflowId = generateUUID();
    
    // Create approval_workflows entry
    await sql`
      INSERT INTO approval_workflows (
        id, document_id, version_number, workflow_type,
        status, created_by, approval_chain, due_at
      ) VALUES (
        ${workflowId}, ${documentId}, ${versionNumber},
        'standard', 'pending', ${createdBy},
        ${{ steps: approvalRoles }},
        NOW() + INTERVAL '${dueInDays} days'
      )
    `;
    
    // Create approval_steps for each role
    let stepOrder = 1;
    for (const role of approvalRoles) {
      await sql`
        INSERT INTO approval_steps (
          id, workflow_id, step_order, approver_role, status
        ) VALUES (
          gen_random_uuid(), ${workflowId}, ${stepOrder},
          ${role}, 'pending'
        )
      `;
      stepOrder++;
    }
    
    // Notify first approver
    await this.notifyApprover(workflowId, 0);
    
    return workflowId;
  }
  
  /**
   * Approve a document at a specific step
   * Moves to next step or marks as approved if last step
   */
  static async approveStep(
    workflowId: string,
    stepId: string,
    approverId: string,
    comment?: string
  ): Promise<{ nextStep?: string; approved: boolean }> {
    // Mark step as approved
    await sql`
      UPDATE approval_steps
      SET status = 'approved',
          approved_by = ${approverId},
          approved_at = NOW(),
          comment = ${comment}
      WHERE id = ${stepId}
    `;
    
    // Get workflow
    const workflow = await sql`
      SELECT * FROM approval_workflows WHERE id = ${workflowId}
    `;
    
    const allSteps = await sql`
      SELECT * FROM approval_steps
      WHERE workflow_id = ${workflowId}
      ORDER BY step_order ASC
    `;
    
    // Check if all steps approved
    const allApproved = allSteps.every(step => step.status === 'approved');
    
    if (allApproved) {
      // Document is fully approved!
      const doc = await sql`
        SELECT id FROM unified_documents
        WHERE id = ${workflow[0].document_id}
      `;
      
      await sql`
        UPDATE unified_documents
        SET status = 'approved',
            approved_by = ${approverId},
            approved_at = NOW()
        WHERE id = ${doc[0].id}
      `;
      
      await sql`
        UPDATE approval_workflows
        SET status = 'approved',
            completed_at = NOW()
        WHERE id = ${workflowId}
      `;
      
      // Notify all stakeholders
      await this.notifyAllStakeholders(
        workflow[0].document_id,
        'DOCUMENT_APPROVED',
        { approverId }
      );
      
      return { approved: true };
    } else {
      // Move to next step
      const nextPendingStep = allSteps.find(s => s.status === 'pending');
      await this.notifyApprover(workflowId, nextPendingStep.step_order);
      
      return { nextStep: nextPendingStep.id, approved: false };
    }
  }
  
  /**
   * Reject a document at a step
   * Stops workflow, requires creator to upload new version
   */
  static async rejectStep(
    workflowId: string,
    stepId: string,
    rejectedBy: string,
    rejectionReason: string
  ): Promise<void> {
    // Mark step as rejected
    await sql`
      UPDATE approval_steps
      SET status = 'rejected',
          approved_by = ${rejectedBy},
          approved_at = NOW(),
          rejection_reason = ${rejectionReason}
      WHERE id = ${stepId}
    `;
    
    // Mark workflow as rejected
    await sql`
      UPDATE approval_workflows
      SET status = 'rejected',
          completed_at = NOW()
      WHERE id = ${workflowId}
    `;
    
    // Mark document as needing work
    const workflow = await sql`
      SELECT document_id FROM approval_workflows WHERE id = ${workflowId}
    `;
    
    await sql`
      UPDATE unified_documents
      SET status = 'in_review'
      WHERE id = ${workflow[0].document_id}
    `;
    
    // Notify creator that changes needed
    await this.notifyCreator(
      workflow[0].document_id,
      'APPROVAL_REJECTED',
      { rejectedBy, rejectionReason }
    );
  }
  
  /**
   * Get all pending approvals for a user
   * Shows what needs their attention
   */
  static async getPendingApprovalsForUser(userId: string) {
    const pendingApprovals = await sql`
      SELECT
        w.id as workflow_id,
        w.document_id,
        w.due_at,
        step.step_order,
        step.approver_role,
        ud.display_name,
        ud.category,
        ud.current_version,
        dv.change_notes,
        (NOW() > w.due_at) as is_overdue
      FROM approval_workflows w
      JOIN approval_steps step ON w.id = step.workflow_id
      JOIN unified_documents ud ON w.document_id = ud.id
      LEFT JOIN document_versions dv ON ud.id = dv.document_id
        AND ud.current_version = dv.version_number
      WHERE step.approver_user_id = ${userId}
        AND step.status = 'pending'
        AND w.status = 'pending'
      ORDER BY w.due_at ASC
    `;
    
    return pendingApprovals;
  }
}
```

---

## PART 4: REAL-TIME DASHBOARD

### 4.1 Document Coordination Dashboard UI

**Page**: `/dashboard/document-coordination`

**Layout**:
```
┌──────────────────────────────────────────────────────────┐
│  Document Coordination Dashboard                          │
│  Last Updated: 2 minutes ago | All Documents | All Status│
└──────────────────────────────────────────────────────────┘

┌─ QUICK STATS ──────────────────────────────────────────┐
│ Total Documents: 187  │ Approved: 142  │ In Review: 31  │
│ Needs Work: 12  │ Overdue Approvals: 4  │ Audit Ready: ✓│
└────────────────────────────────────────────────────────┘

┌─ APPROVAL BOTTLENECKS (Overdue) ───────────────────────┐
│ 🔴 Legal-ArticlesOfIncorporation-v5 (5 days overdue)     │
│    Awaiting: CEO Review (started 5 days ago)            │
│    Action: Nudge CEO                                     │
│                                                          │
│ 🔴 Financial-CapTable-v8 (3 days overdue)               │
│    Awaiting: Board Approval (started 3 days ago)        │
│    Action: Escalate to Board Chair                      │
└────────────────────────────────────────────────────────┘

┌─ ALL DOCUMENTS (Grouped by Category & Status) ─────────┐
│                                                          │
│ LEGAL DOCUMENTS (15 total)                              │
│ ├─ ✅ APPROVED (8)                                      │
│ │  ├─ ArticlesOfIncorporation-v5-ApprovedByBoard        │
│ │  └─ ...                                               │
│ ├─ 🟡 IN REVIEW (4)                                     │
│ │  ├─ ByLaws-v3-InReview [Awaiting CEO]                │
│ │  └─ ...                                               │
│ └─ 🔴 NEEDS WORK (3)                                    │
│    ├─ SharePurchaseAgreements-v2-NeedsRevisions         │
│    └─ ...                                               │
│                                                          │
│ FINANCIAL DOCUMENTS (24 total)                          │
│ ├─ ✅ APPROVED (20)                                     │
│ ├─ 🟡 IN REVIEW (3) [1 Overdue!]                       │
│ └─ 🔴 NEEDS WORK (1)                                    │
│                                                          │
│ GOVERNANCE DOCUMENTS (18 total)                         │
│ ├─ ✅ APPROVED (15)                                     │
│ ├─ 🟡 IN REVIEW (2)                                     │
│ └─ 🔴 NEEDS WORK (1)                                    │
│                                                          │
│ COMPLIANCE DOCUMENTS (9 total)                          │
│ ├─ ✅ APPROVED (4)                                      │
│ ├─ 🟡 IN REVIEW (3)                                     │
│ └─ 🔴 NEEDS WORK (2)                                    │
└────────────────────────────────────────────────────────┘

┌─ MY PENDING APPROVALS ─────────────────────────────────┐
│ You have 4 documents awaiting your review               │
│ 1 is overdue.                                           │
│                                                          │
│ 🔴 Legal-ArticlesOfIncorporation-v5 (OVERDUE)          │
│    Awaiting: YOUR CEO REVIEW                           │
│    Due: 5 days ago                                      │
│    Uploaded by: General Counsel (5 days ago)           │
│    [Review] [Approve] [Request Changes]                │
│                                                          │
│ 🟡 Financial-AuditedFinancials-FY2024-v3              │
│    Awaiting: YOUR CFO SIGN-OFF                         │
│    Due: in 2 days                                       │
│    Uploaded by: Controller (1 day ago)                 │
│    [Review] [Approve] [Request Changes]                │
└────────────────────────────────────────────────────────┘
```

### 4.2 Document Detail View

**When clicking on a document**:

```
┌──────────────────────────────────────────────────────────┐
│ Legal-ArticlesOfIncorporation-v5-ApprovedByBoard         │
└──────────────────────────────────────────────────────────┘

STATUS: ✅ APPROVED (Final)
UPLOADED: 15 days ago by General Counsel
LAST MODIFIED: 15 days ago
APPROVED: 8 days ago by Board Chair

CATEGORY: Legal
DOCUMENT TYPE: Incorporation Documents
REQUIRED FOR FILING: Yes
FILE SIZE: 2.4 MB
CLOUD STORAGE: Google Drive
COMPLIANCE STATUS: ✅ Compliant

┌─ VERSION HISTORY ──────────────────────────────────────┐
│                                                          │
│ v5 ✅ APPROVED (Current)                                │
│ ├─ Approved by: Board Chair (8 days ago)               │
│ ├─ Change notes: "Final version with board updates"    │
│ └─ Download | View Approvals | Diff with v4            │
│                                                          │
│ v4 (Rejected)                                           │
│ ├─ Rejected by: CFO (12 days ago)                      │
│ ├─ Reason: "Missing tax exemption clause"              │
│ └─ Download | View Comments | Diff with v3            │
│                                                          │
│ v3 (Approved)                                           │
│ ├─ Approved by: General Counsel (10 days ago)         │
│ ├─ Change notes: "First complete draft"               │
│ └─ Download | View Approvals | Diff with v2            │
│                                                          │
│ v2 (Approved)                                           │
│ ├─ Approved by: Finance (11 days ago)                 │
│ └─ Download | View Comments | Diff with v1            │
│                                                          │
│ v1 (Initial)                                            │
│ ├─ Uploaded by: General Counsel (15 days ago)         │
│ └─ Download | View Comments                            │
│                                                          │
└────────────────────────────────────────────────────────┘

┌─ APPROVAL WORKFLOW ────────────────────────────────────┐
│                                                          │
│ APPROVAL CHAIN (v5):                                    │
│                                                          │
│ 1. ✅ Creator Review                                    │
│    Status: Approved by General Counsel (15 days ago)   │
│                                                          │
│ 2. ✅ Legal Counsel Review                              │
│    Status: Approved by General Counsel (15 days ago)   │
│    Comment: "All legal requirements met"                │
│                                                          │
│ 3. ✅ CFO/Finance Review                                │
│    Status: Approved by CFO (13 days ago)               │
│    Comment: "Tax implications reviewed"                │
│                                                          │
│ 4. ✅ CEO Review                                        │
│    Status: Approved by CEO (10 days ago)               │
│    Comment: "Ready for board presentation"             │
│                                                          │
│ 5. ✅ Board Vote                                        │
│    Status: Approved by Board Chair (8 days ago)       │
│    Comment: "Unanimously approved"                      │
│                                                          │
│ RESULT: ✅ DOCUMENT FULLY APPROVED                      │
│                                                          │
└────────────────────────────────────────────────────────┘

┌─ COMMENTS & AUDIT TRAIL ───────────────────────────────┐
│                                                          │
│ [Download Audit Trail as PDF]                          │
│                                                          │
│ 👤 Board Chair (8 days ago):                           │
│    "Unanimously approved at board meeting"              │
│    ✅ Approved v5                                       │
│                                                          │
│ 👤 CEO (10 days ago):                                  │
│    "Ready for board presentation"                      │
│    ✅ Approved v5                                       │
│                                                          │
│ 👤 CFO (13 days ago):                                  │
│    "Tax implications reviewed, all clear"              │
│    ✅ Approved v4                                       │
│    ❌ Rejected v3: "Missing tax exemption clause"      │
│                                                          │
│ 👤 General Counsel (15 days ago):                      │
│    "First complete draft ready for review"             │
│    ✅ Uploaded v1                                       │
│                                                          │
└────────────────────────────────────────────────────────┘
```

---

## PART 5: NOTIFICATIONS & ALERTS

### 5.1 Approval Notification System

**When document enters approval workflow:**

```
Subject: "Articles of Incorporation v5 Ready for Your Review"

Hi John,

General Counsel just uploaded a new version of Articles of Incorporation 
that requires your review.

📄 Document: Legal-ArticlesOfIncorporation-v5
📝 Change notes: "Final version with board updates"
⏰ Due in: 5 days
🔗 Review: [Click to Review]

What's new:
- Updated tax exemption clause (per board feedback)
- Corrected incorporation date
- Added restricted stock classes

Your action: Review and approve (or request changes)

Status: 3 of 5 approvers have reviewed (Legal ✓, Finance ✓, You next)

[Review Now] [Request Changes] [Skip for Now]
```

### 5.2 Overdue Approval Alerts

**After 3 days without action:**

```
Subject: "URGENT: Articles of Incorporation v5 Awaiting YOUR Approval (3 Days Overdue)"

Hi John,

The Articles of Incorporation v5 has been waiting for your review for 3 days 
and is now overdue.

📄 Document: Legal-ArticlesOfIncorporation-v5
⏰ Due: 3 days ago
🔗 Review: [Click to Review Immediately]

This document is critical for the IPO filing and is currently blocking:
- Board approval
- SEC submission

Please review and approve (or request changes) as soon as possible.

[Approve Now] [Request Changes] [Delegate to Team]
```

**Escalation after 5 days:**

```
Subject: "ESCALATION: Articles of Incorporation v5 Blocked - CEO Approval Needed"

Hi CEO,

The Articles of Incorporation v5 has been awaiting CEO review for 5 days. 
This is blocking the IPO timeline.

📊 Status:
- Uploaded: 12 days ago
- Legal approved: 10 days ago
- Finance approved: 8 days ago
- CEO review: PENDING (5 days overdue!)

🔗 Action Required: [Approve Now]

If you're unable to review, please delegate to another approver.

[Approve] [Delegate] [Mark as Emergency - Bypass]
```

### 5.3 Notification Rules

```typescript
const notificationRules = {
  document_uploaded: {
    trigger: 'When new version uploaded',
    recipients: ['approvers_in_workflow'],
    template: 'approval_requested'
  },
  
  approval_requested: {
    trigger: 'When document enters approval workflow',
    delay: 'immediately',
    recipients: ['next_approver'],
    escalation: [
      { delay: '3 days', recipients: ['next_approver'], urgency: 'high' },
      { delay: '5 days', recipients: ['next_approver', 'manager'], urgency: 'critical' }
    ]
  },
  
  approval_completed: {
    trigger: 'When step is approved',
    recipients: ['creator', 'next_approver'],
    template: 'step_approved_notification'
  },
  
  approval_rejected: {
    trigger: 'When step is rejected',
    recipients: ['creator'],
    template: 'changes_requested'
  },
  
  document_approved: {
    trigger: 'When document fully approved',
    recipients: ['all_stakeholders', 'company_leadership'],
    template: 'document_approved_final'
  }
};
```

---

## PART 6: AUDIT TRAIL & COMPLIANCE

### 6.1 Complete Audit Trail

Every action logged to `document_access_log`:

```
Action: version_created
Document: Articles of Incorporation
Version: v5
User: general_counsel@company.com
Timestamp: 2026-06-15 14:32:00 UTC
Details: {
  uploadedBy: "general_counsel",
  fileName: "ArticlesOfIncorporation-v5.pdf",
  fileSize: 2400000,
  changeNotes: "Final version with board updates",
  storageId: "drive://file123456",
  previousVersion: "v4"
}

---

Action: approval_requested
Document: Articles of Incorporation
Version: v5
User: system
Timestamp: 2026-06-15 14:33:00 UTC
Details: {
  workflowId: "workflow-123",
  approvalChain: ["legal", "finance", "ceo", "board"],
  firstApprover: "general_counsel",
  dueDate: "2026-06-20"
}

---

Action: approval_step_approved
Document: Articles of Incorporation
Version: v5
User: finance@company.com
Timestamp: 2026-06-16 09:15:00 UTC
Details: {
  workflowId: "workflow-123",
  step: "Finance Review",
  stepOrder: 2,
  approvedBy: "finance",
  comment: "Tax implications reviewed, all clear",
  nextStep: "CEO Review"
}

---

Action: approval_rejected
Document: Articles of Incorporation
Version: v4
User: finance@company.com
Timestamp: 2026-06-14 16:45:00 UTC
Details: {
  workflowId: "workflow-456",
  step: "Finance Review",
  rejectedBy: "finance",
  rejectionReason: "Missing tax exemption clause",
  requiredChanges: "Add Section 3.2 regarding tax-deferred compensation"
}

---

Action: document_approved
Document: Articles of Incorporation
Version: v5
User: board_chair@company.com
Timestamp: 2026-06-18 11:20:00 UTC
Details: {
  workflowId: "workflow-123",
  finalApprover: "board_chair",
  approvalTimestamp: "2026-06-18T11:20:00Z",
  allApprovalsCompleted: true,
  status: "APPROVED"
}
```

### 6.2 Audit Report Generation

```typescript
/**
 * Generate complete audit report for external auditors
 * Includes full chain of custody for all documents
 */
export class AuditReportService {
  
  static async generateComplianceReport(companyId: string): Promise<PDF> {
    const auditLog = await sql`
      SELECT 
        dal.action,
        dal.accessed_at,
        dal.user_id,
        ud.display_name,
        ud.current_version,
        ud.status,
        ud.approved_at,
        ud.approved_by,
        dal.details
      FROM document_access_log dal
      JOIN unified_documents ud ON dal.document_id = ud.id
      WHERE ud.company_id = ${companyId}
      ORDER BY dal.accessed_at DESC
    `;
    
    // Generate PDF with:
    // - Document inventory (all 200+ docs)
    // - Version history for each document
    // - Complete approval chain
    // - Status timeline
    // - Access log (who viewed what)
    // - Compliance certifications
    
    return generatePDF(auditLog);
  }
  
  static async downloadVersionHistory(
    documentId: string,
    format: 'pdf' | 'csv' | 'json'
  ): Promise<Buffer> {
    // Return complete history: all versions, all approvals, all comments
    // Perfect for SEC audits and compliance reviews
  }
}
```

### 6.3 SOC 2 / SEC Compliance

**Document Coordination OS is SOC 2 & SEC-ready because:**

✅ **Single Source of Truth**
- All documents in one table (unified_documents)
- No duplicates possible (enforced by schema)
- Every page queries same source

✅ **Immutable Audit Trail**
- All actions logged to document_access_log
- Timestamps with timezone
- User attribution on every action
- Change details captured in JSONB

✅ **Version Control**
- Every version tracked in document_versions
- No overwriting (versions are immutable)
- Change notes documented
- Complete history downloadable

✅ **Approval Workflows**
- Formal approval chain documented
- All approvers and timestamps logged
- Rejection reasons captured
- Compliance certifications stored

✅ **Access Control**
- User attribution on every action
- Document ownership tracked
- Role-based access enforced
- Access log available for audit

---

## PART 7: IMPLEMENTATION ROADMAP

### Phase 2A Timeline (3 Weeks)

#### Week 1: Database & Core Logic
- Day 1-2: Deploy `approval_workflows` and `approval_steps` tables
- Day 3: Deploy `document_naming_rules` table
- Day 4-5: Implement `ApprovalWorkflowService` with all approval methods
- Day 6-7: Implement `DocumentVersionControlService` for version tracking

**Files Created:**
- `src/lib/approval-workflow-service.ts` (400 lines)
- `src/lib/document-version-control-service.ts` (300 lines)
- `src/db/migrations/004_approval_workflows.sql` (200 lines)
- Tests for both services

#### Week 2: API Routes & Notifications
- Day 1-3: Create API routes:
  - `POST /api/documents/versions/create` - Create new version
  - `POST /api/documents/approvals/approve-step` - Approve
  - `POST /api/documents/approvals/reject-step` - Reject
  - `GET /api/documents/approvals/pending` - List pending for user
  - `GET /api/documents/versions` - Version history
  
- Day 4-5: Implement approval notifications:
  - Email notifications for approval requests
  - Overdue escalation (3 days + 5 days)
  - Completion notifications
  - Utilize existing notification system

- Day 6-7: Testing and edge cases

**Files Created:**
- `src/app/api/documents/versions/route.ts`
- `src/app/api/documents/approvals/route.ts`
- Email notification templates

#### Week 3: Dashboard UI & Integration
- Day 1-3: Build dashboard components:
  - Document status overview
  - Approval bottlenecks widget
  - My pending approvals widget
  - Document detail view with version history
  
- Day 4: Document detail page:
  - Full version history with diffs
  - Approval workflow visualization
  - Comment/audit trail display
  - Download audit trail as PDF
  
- Day 5-7: Integration, testing, polish

**Files Created:**
- `src/components/DocumentCoordination/DocumentCoordinationDashboard.tsx`
- `src/components/DocumentCoordination/ApprovalBottlenecks.tsx`
- `src/components/DocumentCoordination/DocumentDetail.tsx`
- `src/components/DocumentCoordination/VersionHistory.tsx`
- Dashboard page + routing

### Success Metrics

By end of Week 3:

- ✅ All 200+ documents have clear version numbers
- ✅ Approval workflows auto-created for required documents
- ✅ Board can see real-time approval status
- ✅ Zero documents in ambiguous state
- ✅ Complete audit trail available for SEC review
- ✅ Notifications preventing bottlenecks
- ✅ 40% faster document coordination (measured)

---

## PART 8: WORKFLOW MOCKUPS & EXAMPLES

### Example 1: Typical Approval Flow (Legal Document)

```
Day 1 - 10:00 AM: General Counsel Uploads v1
┌─────────────────────────────────────────────────────────┐
│ Upload: ArticlesOfIncorporation-v1.pdf                  │
│ Display Name: Articles of Incorporation                 │
│ Category: Legal                                         │
│ Required for filing: Yes                               │
│ Approval needed: Yes                                    │
│ Approval chain: Legal → Finance → CEO → Board          │
│ [Upload Document]                                       │
│ → Document created as: "draft"                         │
│ → Workflow created: 4 steps pending                    │
│ → Notification: First approver (General Counsel) notified│
└─────────────────────────────────────────────────────────┘

Day 1 - 10:05 AM: General Counsel (Creator) Reviews Own Doc
┌─────────────────────────────────────────────────────────┐
│ Step 1: Creator Self-Review ✓                          │
│ Status: Approved                                        │
│ Comment: "Initial draft looks good"                    │
│ → Moves to: Step 2 (Finance Review)                   │
│ → Notifies: CFO                                        │
└─────────────────────────────────────────────────────────┘

Day 2 - 09:30 AM: CFO Reviews Document
┌─────────────────────────────────────────────────────────┐
│ Step 2: Finance Review                                 │
│ Status: Viewing document...                           │
│ → Downloaded: ArticlesOfIncorporation-v1.pdf           │
│ → Read through for tax implications                    │
│ → Added comment: "Section 3.2 missing tax clause"     │
│ [Request Changes] [Approve] [Skip]                    │
│ → Selected: Request Changes                           │
│ → Rejection Reason: "Missing tax exemption clause"   │
│ → Workflow: Changed to "rejected"                     │
│ → Document Status: Changed to "in_review"            │
│ → Notifies: General Counsel                          │
│ → Notifies: Approvers in chain                        │
└─────────────────────────────────────────────────────────┘

Day 3 - 02:00 PM: General Counsel Creates v2 with Changes
┌─────────────────────────────────────────────────────────┐
│ Upload: ArticlesOfIncorporation-v2.pdf                  │
│ Change notes: "Added Section 3.2 per CFO feedback"      │
│ → New version: v2 created                             │
│ → Previous version: v1 (archived)                      │
│ → New workflow: 4 steps pending again                  │
│ → Starts from: Step 1 (Creator self-review)          │
│ → General Counsel approves immediately                │
│ → Notifies: CFO (next approver)                       │
└─────────────────────────────────────────────────────────┘

Day 3 - 03:15 PM: CFO Reviews v2
┌─────────────────────────────────────────────────────────┐
│ Step 2: Finance Review ✓                              │
│ Status: Approved                                       │
│ Comment: "Tax clause looks good now, all clear"       │
│ → Moves to: Step 3 (CEO Review)                      │
│ → Notifies: CEO                                       │
└─────────────────────────────────────────────────────────┘

Day 4 - 10:00 AM: CEO Reviews v2
┌─────────────────────────────────────────────────────────┐
│ Step 3: CEO Review ✓                                   │
│ Status: Approved                                       │
│ Comment: "Ready for board presentation"               │
│ → Moves to: Step 4 (Board Vote)                      │
│ → Notifies: Board Chair                               │
│ → Notifies: Other board members                       │
└─────────────────────────────────────────────────────────┘

Day 5 - 02:00 PM: Board Reviews & Votes in Meeting
┌─────────────────────────────────────────────────────────┐
│ Step 4: Board Vote ✓                                   │
│ Status: Approved                                       │
│ Comment: "Unanimously approved at board meeting"       │
│ → All steps complete!                                 │
│ → Document Status: Changed to "APPROVED"             │
│ → Workflow Status: Changed to "completed"            │
│ → Approvals close: Cannot be modified further        │
│ → Notifies: All stakeholders                         │
│ → Audit Trail: Complete chain of custody logged      │
└─────────────────────────────────────────────────────────┘

Result: Complete audit trail showing:
✅ v1 created → Rejected by Finance (reason: missing clause)
✅ v2 created → Approved by all (4/4 approvers)
✅ Final status: APPROVED
✅ Timeline: 5 days from upload to board approval
✅ All comments, decisions, timestamps documented
```

### Example 2: Overdue Alert & Escalation

```
Day 8 (3 days after upload): Overdue Alert to CEO
┌─────────────────────────────────────────────────────────┐
│ Document: Financial-CapTable-v8                         │
│ Status: AWAITING CEO REVIEW (3 days overdue)          │
│ Uploaded: 3 days ago                                   │
│ Due date: 2 days ago                                   │
│                                                        │
│ Email notification:                                    │
│ Subject: "URGENT: Cap Table v8 Awaiting YOUR Approval" │
│                                                        │
│ This is blocking:                                      │
│ - Board approval (scheduled for tomorrow)             │
│ - SEC filing (scheduled for next week)               │
│                                                        │
│ [Approve Now] [Request Changes] [Delegate]            │
└─────────────────────────────────────────────────────────┘

Day 10 (5 days after upload): Critical Escalation
┌─────────────────────────────────────────────────────────┐
│ Document: Financial-CapTable-v8                         │
│ Status: CRITICALLY OVERDUE (5 days!)                   │
│ Uploaded: 5 days ago                                   │
│ Due date: 4 days ago                                   │
│                                                        │
│ Email to: CEO, CFO, Board Chair                        │
│ Subject: "CRITICAL: Cap Table v8 Blocking IPO Timeline"│
│                                                        │
│ This blocks the entire IPO schedule:                   │
│ - Board meeting: CANCELLED until approved             │
│ - SEC filing: DELAYED                                 │
│ - Underwriter review: HALTED                          │
│                                                        │
│ Current Status:                                        │
│ ✅ General Counsel approved (4 days ago)             │
│ ✅ Finance approved (3 days ago)                     │
│ ⏳ CEO approval: PENDING (5 days!)                    │
│ ⏳ Board approval: Waiting for CEO                   │
│                                                        │
│ Options:                                               │
│ [1] Approve Now                                        │
│ [2] Delegate to COO/other executive                    │
│ [3] Request changes & return new version              │
│ [4] Mark as Emergency - Bypass approval (for crisis)   │
│                                                        │
│ Dashboard shows: 🔴 CRITICAL BLOCKER                  │
└─────────────────────────────────────────────────────────┘
```

---

## PART 9: INTEGRATION WITH EXISTING SYSTEMS

### 9.1 Unified Document Service Integration

Extend existing `UnifiedDocumentService` to support approval workflows:

```typescript
// In unified-document-service.ts

export class UnifiedDocumentService {
  
  /**
   * Create new version with automatic approval workflow
   * Integrates with ApprovalWorkflowService
   */
  static async uploadDocumentNewVersion(
    documentId: string,
    file: File,
    changeNotes: string,
    userId: string,
    options?: { approvalRoles?: string[] }
  ): Promise<{docId: string; versionNumber: number; workflowId?: string}> {
    // Use DocumentVersionControlService to create version
    const { versionNumber, workflowId } = 
      await DocumentVersionControlService.createNewVersion(
        documentId, file, changeNotes, userId
      );
    
    return { 
      docId: documentId, 
      versionNumber, 
      workflowId 
    };
  }
}
```

### 9.2 Cloud Storage Integration

Approval workflows don't change cloud storage logic:
- Documents still uploaded to Google Drive / cloud
- Version numbers track cloud versions
- Approval chain is purely metadata/workflow layer
- No cloud provider changes needed

### 9.3 Existing Page Integration

**Pages using unified_documents already:**
- `/dashboard/documents` — Add status filters, approval column
- `/dashboard/data-room` — Add approval badge, version info
- `/dashboard/document-coordination` — NEW, full control panel

---

## PART 10: SECURITY & PERMISSIONS

### 10.1 Role-Based Access

```typescript
const documentApprovalPermissions = {
  general_counsel: ['upload', 'comment', 'approve_legal', 'view_all'],
  cfo: ['comment', 'approve_finance', 'view_financial'],
  ceo: ['approve_executive', 'view_all', 'override_approval'],
  board_chair: ['approve_board', 'view_all'],
  board_member: ['comment', 'approve_board'],
  company_admin: ['upload', 'view_all', 'manage_workflows'],
  external_auditor: ['view_all', 'download_audit_trail']
};
```

### 10.2 Audit Trail Security

- All actions logged with user attribution
- Timestamps with timezone (UTC)
- Approval decisions immutable once made
- Cannot delete audit trail (only archive)
- Download audit trail requires admin approval

---

## PART 11: SUCCESS METRICS & KPIs

### Measurable Outcomes

| Metric | Baseline | Target | How Measured |
|--------|----------|--------|--------------|
| Avg approval time | 7 days | 3 days | `approved_at - uploaded_at` |
| Documents in final state | 60% | 95% | Document status = "approved" |
| Approval bottlenecks | 15+ | 0-1 | Count of overdue approvals |
| Time to audit readiness | 2 weeks | < 1 hour | Generate compliance report |
| Document confusion issues | 8/week | 0 | Support tickets mentioning version confusion |
| Board meeting delays due to docs | 40% | 0% | Board feedback |
| Stakeholder satisfaction | 60% | 90% | NPS survey |

### Dashboard Metrics

**Document Coordination Dashboard shows:**
- Total documents: 200+
- Approved: % with status "approved"
- In review: % with status "in_review"
- Needs work: % with status "needs_work"
- Overdue approvals: Count
- Audit trail completeness: % with full log
- Days to approval: Average
- Approval SLA compliance: % on-time

---

## PART 12: CHANGE MANAGEMENT

### Communication Strategy

**To Board:**
- "Real-time visibility into document readiness"
- "Clear approval chain for governance"
- "Complete audit trail for auditors"

**To Legal:**
- "Version control ensures no conflicting versions"
- "Approval workflow ensures legal review"
- "Audit trail proves due diligence"

**To Finance:**
- "Clear ownership of financial documents"
- "No duplicate versions of financials"
- "SEC compliance documentation automated"

**To All Employees:**
- "Clear expectations for document review"
- "Notifications prevent bottlenecks"
- "Audit trail protects company"

---

## PART 13: ROLLOUT PHASES

### Phase 1: Legal Documents Only (Week 1)
- Enable approval workflows for legal category
- General Counsel + Board approval chain
- Test with Articles of Incorporation

### Phase 2: Financial Documents (Week 2)
- Enable approval workflows for financial
- CFO + Board approval chain
- Test with Cap Table, Financials

### Phase 3: All Categories (Week 3)
- Enable for governance, compliance, operational
- All approval chains active
- Full dashboard launch
- Audit trail available for download

---

## CONCLUSION

The Document Coordination OS solves the chaos of pre-IPO document management through:

1. **Single Source of Truth** — All documents in one table, no confusion
2. **Clear Version Control** — Every version tracked, numbered, immutable
3. **Mandatory Approvals** — Approval workflows ensure nothing falls through cracks
4. **Real-Time Visibility** — Dashboard shows what's approved, what needs work, what's bottlenecked
5. **Automatic Notifications** — Never miss an approval deadline
6. **Complete Audit Trail** — Board and auditors can see entire chain of custody in seconds
7. **SEC Compliance** — SOC 2 / SEC-ready documentation and history

**Result**: 40% faster coordination, zero confusion, board confidence, auditor satisfaction.

---

## FILES TO CREATE

1. **Database Migrations:**
   - `src/db/migrations/004_approval_workflows.sql` — Tables and indexes

2. **Services:**
   - `src/lib/approval-workflow-service.ts` — Approval logic (400 lines)
   - `src/lib/document-version-control-service.ts` — Version control (300 lines)

3. **API Routes:**
   - `src/app/api/documents/versions/create/route.ts` — Create new version
   - `src/app/api/documents/approvals/approve/route.ts` — Approve step
   - `src/app/api/documents/approvals/reject/route.ts` — Reject step
   - `src/app/api/documents/approvals/pending/route.ts` — List pending

4. **Components:**
   - `src/components/DocumentCoordination/DocumentCoordinationDashboard.tsx`
   - `src/components/DocumentCoordination/ApprovalBottlenecks.tsx`
   - `src/components/DocumentCoordination/MyPendingApprovals.tsx`
   - `src/components/DocumentCoordination/DocumentDetail.tsx`
   - `src/components/DocumentCoordination/VersionHistory.tsx`
   - `src/components/DocumentCoordination/ApprovalWorkflow.tsx`

5. **Pages:**
   - `src/app/dashboard/document-coordination/page.tsx`
   - `src/app/dashboard/documents/[id]/page.tsx` — Updated with approval info

6. **Tests:**
   - `__tests__/approval-workflow.test.ts`
   - `__tests__/document-version-control.test.ts`
   - `__tests__/document-coordination-api.test.ts`

7. **Documentation:**
   - `docs/DOCUMENT_COORDINATION_GUIDE.md` — User guide
   - `docs/APPROVAL_WORKFLOWS.md` — Workflow definitions
   - `docs/AUDIT_TRAIL_COMPLIANCE.md` — Compliance proof

---

**Total Implementation Time**: 3 weeks (Phase 2A)  
**Launch Target**: End of Q2 2026  
**Status**: Ready for development  
