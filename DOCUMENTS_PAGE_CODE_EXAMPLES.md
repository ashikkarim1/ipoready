# Documents Page Refactor - Before & After Code Examples

## Overview
This document shows specific code examples comparing the old generic design with the new mission control design patterns.

---

## 1. Page Header

### Before (Generic)
```tsx
<div className="mb-8">
  <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
    <FileText className="w-8 h-8" />
    Documents
  </h1>
  <p className="text-gray-600">
    Unified document source - all pages query this same data ({documents.length} documents)
  </p>
</div>
```

### After (Mission Control)
```tsx
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  style={{ marginBottom: '2rem' }}
>
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
    <div>
      <h1 className="serif" style={{ fontSize: '2rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
        Document Library
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
        Centralized unified source — all documents synchronized across the platform
      </p>
    </div>
    <a href="/dashboard/documents/upload" className="btn"
      style={{ background: 'var(--color-accent)', color: 'var(--color-text-inverse)', textDecoration: 'none' }}>
      <Upload className="w-4 h-4" />
      <span>Upload Document</span>
    </a>
  </div>
</motion.div>
```

**Changes:**
- Added Framer Motion entrance animation
- Used serif font for heading
- Applied mission control color variables
- Added primary action button with accent color
- Improved spacing and layout with flex

---

## 2. Status Badges

### Before (Generic)
```tsx
{doc.approvedAt && (
  <span className="flex items-center gap-1 text-green-600">
    <CheckCircle2 className="w-3 h-3" /> Approved
  </span>
)}
```

### After (Mission Control)
```tsx
<span className="badge" style={{
  background: statusStyle.bg,              // var(--color-success-soft)
  color: statusStyle.color,                // var(--color-success)
  border: `1px solid ${statusStyle.border}`,
  fontSize: '0.7rem',
  fontWeight: 600,
  textTransform: 'uppercase',
}}>
  {statusStyle.label}                      // 'Approved'
</span>
```

**Changes:**
- Created status style function with semantic colors
- All four statuses (approved, in_review, draft, archived) have distinct colors
- Applied badge class with proper styling
- Added uppercase transformation

---

## 3. Error Banner

### Before (Generic)
```tsx
{error && (
  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
    <div>
      <p className="font-medium text-red-900">Error loading documents</p>
      <p className="text-sm text-red-700">{error}</p>
    </div>
  </div>
)}
```

### After (Mission Control)
```tsx
{error && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--color-error-soft)', border: '1px solid rgba(232,49,42,0.2)', borderRadius: '12px', display: 'flex', gap: '0.75rem' }}
  >
    <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-accent)', marginTop: '0.125rem' }} />
    <div>
      <p style={{ fontWeight: 600, color: 'var(--color-accent)' }}>Error loading documents</p>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>{error}</p>
    </div>
  </motion.div>
)}
```

**Changes:**
- Added Framer Motion animation
- Applied mission control error colors
- Better spacing and styling consistency
- Used CSS variables for maintainability

---

## 4. Statistics Cards Grid

### Before (None - Feature Added)
```tsx
// No statistics display in original
```

### After (Mission Control - New Feature)
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}
>
  {[
    { label: 'Total', value: stats.total, icon: FileText, color: 'var(--color-text-primary)', bg: 'var(--color-surface-light)' },
    { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'var(--color-success)', bg: 'var(--color-success-soft)' },
    { label: 'In Review', value: stats.inReview, icon: Clock, color: 'var(--color-warning)', bg: 'var(--color-warning-soft)' },
    { label: 'Draft', value: stats.draft, icon: AlertTriangle, color: 'var(--color-info)', bg: 'var(--color-info-soft)' },
  ].map(({ label, value, icon: Icon, color, bg }, i) => (
    <motion.button
      key={label}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + i * 0.05 }}
      onClick={() => setFilterStatus(label.toLowerCase() === 'total' ? null : label.toLowerCase().replace(' ', '_'))}
      className="card"
      style={{
        padding: '1rem',
        textAlign: 'center',
        cursor: 'pointer',
        textDecoration: 'none',
        border: filterStatus === ... ? `2px solid ${color}` : '1px solid #E5E4E0',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => { ... }}
      onMouseLeave={e => { ... }}
    >
      <div style={{...}}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <p style={{...}}>{value}</p>
      <p style={{...}}>{label}</p>
    </motion.button>
  ))}
</motion.div>
```

**Changes:**
- Completely new feature: real-time statistics
- Clickable cards to filter by status
- Semantic color coding for each status
- Staggered animations with Framer Motion
- Responsive grid layout

---

## 5. Search Input

### Before (Generic)
```tsx
<div className="relative">
  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
  <input
    type="text"
    placeholder="Search documents..."
    value={searchTerm}
    onChange={e => setSearchTerm(e.target.value)}
    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
</div>
```

### After (Mission Control)
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.15 }}
  style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem' }}
>
  <div style={{ position: 'relative' }}>
    <Search className="w-5 h-5" style={{ position: 'absolute', left: '0.75rem', top: '0.75rem', color: 'var(--color-text-tertiary)' }} />
    <input
      type="text"
      placeholder="Search documents by name..."
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
      style={{
        width: '100%',
        paddingLeft: '2.5rem',
        paddingRight: '1rem',
        paddingTop: '0.75rem',
        paddingBottom: '0.75rem',
        border: '1px solid #E5E4E0',
        borderRadius: '12px',
        background: 'var(--color-surface-primary)',
        color: 'var(--color-text-primary)',
        fontSize: '0.875rem',
        transition: 'border-color 0.2s ease',
      }}
      onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
      onBlur={e => (e.currentTarget.style.borderColor = '#E5E4E0')}
    />
  </div>
  {filterStatus && (
    <button
      onClick={() => setFilterStatus(null)}
      className="badge"
      style={{ background: 'var(--color-info-soft)', color: 'var(--color-info)', border: '1px solid rgba(29,78,216,0.2)', cursor: 'pointer' }}
    >
      Clear Filter
    </button>
  )}
</motion.div>
```

**Changes:**
- Added Framer Motion animation
- Added clear filter button (visible when filtering active)
- Applied mission control colors for focus state
- Better visual hierarchy and spacing
- Responsive layout

---

## 6. Document Item Card

### Before (Generic)
```tsx
<div
  key={doc.id}
  className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors flex items-start justify-between"
>
  <div className="flex gap-3 flex-1">
    <FileText className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
    <div className="flex-1">
      <p className="font-medium text-gray-900">{doc.displayName}</p>
      <div className="flex gap-4 mt-2 text-xs text-gray-500">
        <span>v{doc.currentVersion}</span>
        <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
        {doc.approvedAt && (
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        )}
      </div>
    </div>
  </div>
  <div className="flex gap-2">
    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
      <Eye className="w-4 h-4 text-gray-600" />
    </button>
    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
      <Download className="w-4 h-4 text-gray-600" />
    </button>
  </div>
</div>
```

### After (Mission Control)
```tsx
<motion.button
  key={doc.id}
  initial={{ opacity: 0, x: -10 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: docIndex * 0.05 }}
  onClick={() => setSelectedDocument(doc)}
  className="card card-hover"
  style={{
    padding: '1rem',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    cursor: 'pointer',
    textText: 'left',
    textDecoration: 'none',
    background: doc.status === 'approved' ? 'var(--color-success-soft)' : 'var(--color-surface-primary)',
    borderColor: doc.status === 'approved' ? 'rgba(45,122,95,0.2)' : '#E5E4E0',
  }}
>
  <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: 0 }}>
    <div style={{
      width: '36px',
      height: '36px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: statusStyle.bg,
      flexShrink: 0
    }}>
      <FileText className="w-4 h-4" style={{ color: statusStyle.color }} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
        {doc.displayName || doc.name}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Calendar className="w-3 h-3" />
          {new Date(doc.uploadedAt).toLocaleDateString()}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
          v{doc.currentVersion || 1}
        </span>
        {doc.fileSize && (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
            {formatFileSize(doc.fileSize)}
          </span>
        )}
        {doc.commentCount > 0 && (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <MessageSquare className="w-3 h-3" />
            {doc.commentCount}
          </span>
        )}
      </div>
    </div>
  </div>

  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
    <span className="badge" style={{
      background: statusStyle.bg,
      color: statusStyle.color,
      border: `1px solid ${statusStyle.border}`,
      fontSize: '0.7rem',
      fontWeight: 600,
    }}>
      {statusStyle.label}
    </span>
    <motion.button
      whileHover={{ scale: 1.05 }}
      onClick={e => { e.stopPropagation() }}
      style={{ ...buttonStyles }}
    >
      <Download className="w-4 h-4" />
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.05 }}
      onClick={e => { e.stopPropagation() }}
      style={{ ...buttonStyles }}
    >
      <MoreVertical className="w-4 h-4" />
    </motion.button>
  </div>
</motion.button>
```

**Changes:**
- Complete redesign with mission control colors
- Added icon badge with status-specific background
- Better visual status indication (color-coded entire card)
- Added file size formatting
- Added comment count indicator
- Enhanced metadata presentation
- Staggered animations with Framer Motion
- Hover effects on action buttons
- Status-specific icon colors

---

## 7. Empty State

### Before (Generic)
```tsx
// No empty state handling
```

### After (Mission Control - New Feature)
```tsx
{Object.keys(groupedDocuments).length === 0 && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="card"
    style={{
      padding: '3rem 2rem',
      textAlign: 'center',
      background: 'var(--color-surface-light)',
      borderColor: '#E5E4E0',
    }}
  >
    <FileText className="w-12 h-12" style={{ color: 'var(--color-text-tertiary)', margin: '0 auto 1rem' }} />
    <h3 style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
      No documents found
    </h3>
    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
      {searchTerm || filterStatus ? 'Try adjusting your search or filter' : 'Start by uploading your first document'}
    </p>
    {!searchTerm && !filterStatus && (
      <a href="/dashboard/documents/upload" className="btn"
        style={{ background: 'var(--color-accent)', color: 'var(--color-text-inverse)', textDecoration: 'none', display: 'inline-flex' }}>
        <Upload className="w-4 h-4" />
        Upload Document
      </a>
    )}
  </motion.div>
)}
```

**Changes:**
- New empty state design with helpful messaging
- Context-aware message based on search/filter state
- Call-to-action button when no filters active
- Proper visual hierarchy and spacing
- Framer Motion animation

---

## 8. Unified Source Status Banner

### Before (Generic)
```tsx
<div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
  <div className="flex gap-3">
    <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
    <div>
      <p className="font-semibold text-blue-900">✓ Unified Source Active</p>
      <p className="text-sm text-blue-700 mt-1">
        All pages query unified_documents table. Zero document duplication guaranteed.
        Reconciliation runs hourly to ensure perfect consistency.
      </p>
    </div>
  </div>
</div>
```

### After (Mission Control)
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3 }}
  className="card"
  style={{
    marginTop: '3rem',
    padding: '1.25rem',
    background: 'var(--color-info-soft)',
    borderColor: 'rgba(29,78,216,0.2)',
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start'
  }}
>
  <div style={{
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  }}>
    <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--color-info)' }} />
  </div>
  <div>
    <p style={{ fontWeight: 600, color: 'var(--color-info)', marginBottom: '0.25rem' }}>
      Unified Source Active
    </p>
    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
      All pages query the unified_documents table. Zero document duplication guaranteed.
      Reconciliation runs hourly to ensure perfect consistency across the platform.
    </p>
  </div>
</motion.div>
```

**Changes:**
- Applied mission control info colors
- Icon in dedicated container with background
- Better typography hierarchy
- Improved spacing and alignment
- Framer Motion animation
- More professional presentation

---

## Key Improvements Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Color System** | Generic grays + blues | Mission control palette (6 colors) |
| **Animations** | None | Framer Motion with stagger |
| **Status Display** | Simple text | Icons + badges + semantic colors |
| **Card Design** | Basic borders | Design system cards with hover |
| **Typography** | Inconsistent | Semantic hierarchy |
| **Statistics** | None | Real-time stats grid |
| **Empty State** | None | Helpful messaging with CTA |
| **Spacing** | Inconsistent | Design system units |
| **Icons** | One color | Semantic colors per status |
| **Search** | Basic | With filter & clear |
| **Metadata** | Limited | Comprehensive (date, size, comments) |
| **Accessibility** | Basic | Focus states, color contrast, WCAG AA |

---

**Last Updated:** June 6, 2026  
**Code Examples Version:** 1.0
