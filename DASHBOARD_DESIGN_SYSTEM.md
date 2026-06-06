# IPOReady Mission Control Dashboard Design System

**Last Updated:** June 2026  
**Location:** `/src/app/dashboard/page.tsx`  
**Status:** Production-ready light theme  

---

## 1. COLOR PALETTE

### 1.1 Primary Brand Colors

```css
--color-primary:              #1A1A1A;  /* Primary text, primary buttons */
--color-accent:               #E8312A;  /* Call-to-action, brand highlights — RED */
--color-accent-secondary:     #FF6B35;  /* Secondary CTAs, links — ORANGE */
--color-accent-purple:        #7C3AED;  /* Alternative states, badges — PURPLE */
--color-surface-primary:      #FFFFFF;  /* White elevated surfaces */
```

**Brand Red (#E8312A)** is the dominant accent color used for:
- Primary CTAs (Send, Submit buttons)
- Active state indicators
- Error/alert highlights
- Progress indicators
- Selected states

### 1.2 Text Hierarchy Colors

```css
--color-text-primary:         #1A1A1A;  /* Headings, main body text */
--color-text-secondary:       #717171;  /* Subheadings, secondary labels */
--color-text-tertiary:        #9A9A9A;  /* Captions, disabled, placeholder */
--color-text-muted:           #717171;  /* Hints, very subtle text */
--color-text-inverse:         #FFFFFF;  /* Text on dark backgrounds */
--color-text-chart:           #6B7280;  /* Chart axes, annotations */
```

**Usage Example:**
```tsx
<p style={{ color: 'var(--color-text-primary)' }}>Main heading</p>
<p style={{ color: 'var(--color-text-secondary)' }}>Subheading</p>
<p style={{ color: 'var(--color-text-tertiary)' }}>Helper text</p>
```

### 1.3 Background & Surface Colors

```css
--color-bg-primary:           #F7F6F4;  /* Page background, main surface */
--color-surface-secondary:    #F0EFED;  /* Grouped sections, hover states */
--color-surface-light:        #FAFAF9;  /* Near-white distinction */
--color-surface-warm:         #FFFBEB;  /* Cream/vanilla warmth */
```

**Background Stack (Depth):**
- Page background: `#F7F6F4`
- Cards: `#FFFFFF` (white)
- Hover/secondary sections: `#F0EFED`
- Input fields: `#F0EFED`

### 1.4 Border & Divider Colors

```css
--color-border:               #E5E4E0;  /* Card borders, dividers */
--color-border-medium:        #EEECE8;  /* Medium-emphasis borders */
--color-border-dark:          #C8C7C2;  /* Strong dividers, dark gray */
--color-stroke-dark:          #2A2A2A;  /* SVG strokes, chart elements */
```

**Usage:**
```tsx
<div style={{ border: '1px solid #E5E4E0' }}>Card</div>
<div style={{ borderBottom: '1px solid #E5E4E0' }}>Section divider</div>
```

### 1.5 Status Colors (Semantic)

#### Success State
```css
--color-success:              #2D7A5F;  /* Success indicators */
--color-success-dark:         #15803D;  /* Success hover, strong states */
--color-success-bright:       #22C55E;  /* Progress rings, indicator dots */
--color-success-soft:         #EAF5F0;  /* Success backgrounds */
--color-success-light:        #F0FDF4;  /* Alternative light success bg */
```

**Example — Completed task badge:**
```tsx
<span style={{ 
  background: 'var(--color-success-soft)', 
  color: 'var(--color-success)',
  border: '1px solid var(--color-success-light)'
}}>
  Complete ✓
</span>
```

#### Error State
```css
--color-error:                #DC2626;  /* Error messages, destructive */
--color-error-dark:           #B91C1C;  /* Error hover, strong states */
--color-error-soft:           #FDECEB;  /* Error backgrounds */
--color-error-light:          #FEF2F2;  /* Alternative light error bg */
--color-error-pale:           #FEE2E2;  /* Very light error emphasis */
```

**Example — Overdue task alert:**
```tsx
<div style={{ 
  background: 'var(--color-error-pale)', 
  border: '1px solid var(--color-error-light)'
}}>
  <p style={{ color: 'var(--color-error)' }}>2 days overdue</p>
</div>
```

#### Warning State
```css
--color-warning:              #B45309;  /* Warning badges, due soon */
--color-warning-dark:         #D97706;  /* Warning hover, strong states */
--color-warning-soft:         #FEF3C7;  /* Warning backgrounds */
--color-warning-medium:       #FDE68A;  /* Medium warning emphasis */
--color-warning-pale:         #FFFBEB;  /* Very light warning bg */
```

**Example — At-risk task indicator:**
```tsx
<span style={{
  background: 'var(--color-warning-soft)',
  color: 'var(--color-warning)',
  border: '1px solid var(--color-warning-medium)'
}}>
  At Risk
</span>
```

#### Info State
```css
--color-info:                 #1D4ED8;  /* Info messages, indicators */
--color-info-medium:          #BFDBFE;  /* Medium info blue */
--color-info-soft:            #EFF6FF;  /* Info backgrounds */
```

---

## 2. TYPOGRAPHY HIERARCHY

### 2.1 Font Stack

```css
--font-sans:    "Hanken Grotesk", system-ui, sans-serif;
--font-display: "Plus Jakarta Sans", system-ui, sans-serif;
--font-mono:    "Inter", monospace;
```

**Primary:** Hanken Grotesk (body, labels)  
**Display:** Plus Jakarta Sans (headings, serif class)  
**Mono:** Inter (code, monospace data)

### 2.2 Typography Semantic Classes

#### Headings
| Class | Size | Weight | Use Case |
|-------|------|--------|----------|
| `.h1` | 33.6px (2.1rem) | 700 Bold | Page title ("Mission Control") |
| `.h2` | 30px (1.875rem) | 700 Bold | Section titles |
| `.h3` | 24px (1.5rem) | 700 Bold | Card titles |
| `.h4` | 20px (1.25rem) | 600 Semibold | Subsection titles |

**Example:**
```tsx
<h1 className="serif text-2xl sm:text-3xl text-nav mb-2">Mission Control</h1>
```

#### Body Text
| Class | Size | Weight | Line Height |
|-------|------|--------|-------------|
| `.body` | 16px (1rem) | 400 | 1.5 (relaxed) |
| `.body-sm` | 14px (0.875rem) | 400 | 1.4 |
| `.label` | 14px (0.875rem) | 500 Medium | 1.25 |
| `.label-sm` | 12px (0.75rem) | 600 Semibold | 1.2 |
| `.label-xs` | 11px (0.6875rem) | 700 Bold | 1.1 |

#### Captions
| Class | Size | Weight |
|-------|------|--------|
| `.caption` | 13px (0.8125rem) | 400 |
| `.caption-sm` | 12px (0.75rem) | 400 |

**Dashboard Label Usage:**
```tsx
<p className="text-text-muted text-xs uppercase tracking-wider font-semibold">
  PACE™ Score
</p>
```

### 2.3 Text Color Utilities

```tsx
<p className="text-nav">                    {/* #1A1A1A */}
<p className="text-text-primary">           {/* #1A1A1A */}
<p className="text-text-secondary">         {/* #717171 */}
<p className="text-text-muted">             {/* #717171 */}
<p className="text-text-light">             {/* #9A9A9A */}
<p className="text-accent">                 {/* #E8312A */}
```

---

## 3. CARD & COMPONENT STYLING PATTERNS

### 3.1 Base Card Style

```css
.card {
  background: #FFFFFF;
  border: 1px solid #E5E4E0;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  /* padding: 24px or 28px (set per component) */
}

.card-hover {
  transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}
.card-hover:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06);
  border-color: #C8C7C2;
  transform: translateY(-1px);
}
```

**Usage:**
```tsx
{/* Standard card */}
<div className="card p-6">
  <h2 className="text-nav font-bold text-base mb-4">IPO Phase Roadmap</h2>
  {/* content */}
</div>

{/* Interactive card */}
<motion.div className="card p-6 card-hover cursor-pointer">
  {/* content */}
</motion.div>
```

### 3.2 Card Variants by Status

#### Standard Card
```tsx
<div className="card p-7" style={{ 
  background: '#FFFFFF',
  border: '1px solid #E5E4E0'
}}>
```

#### Active Phase Card
```tsx
<div className="card p-3" style={{
  background: 'var(--color-error-soft)',
  borderColor: '#E8312A30'
}}>
```

#### Completed Phase Card
```tsx
<div className="card p-3" style={{
  background: 'var(--color-success-soft)',
  borderColor: '#2D7A5F30'
}}>
```

#### Alert Card
```tsx
<div className="card p-6" style={{
  background: 'var(--color-error-soft)',
  borderColor: '#E8312A30'
}}>
```

### 3.3 Card Grid Layouts

```tsx
{/* Top metrics — 2-3 column grid */}
<div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
  <motion.div className="card p-6 col-span-2 lg:col-span-2">
    {/* PACE Score — spans 2 columns */}
  </motion.div>
  <motion.div className="card p-6">
    {/* Tasks overview */}
  </motion.div>
  <motion.div className="card p-6">
    {/* Current Phase */}
  </motion.div>
</div>

{/* Phase Roadmap + Milestones — 2-1 layout */}
<div className="grid lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2 card p-7">
    {/* Phase Roadmap */}
  </div>
  <div className="card p-7">
    {/* Milestones */}
  </div>
</div>
```

---

## 4. ANIMATION & MOTION DESIGN

### 4.1 Framer Motion Patterns

**Dashboard uses Framer Motion v6+ for all animated transitions.**

#### Page Load Animation
```tsx
<motion.div 
  initial={{ opacity: 0, y: 20 }} 
  animate={{ opacity: 1, y: 0 }} 
  transition={{ delay: 0.1 }}
  className="card p-6"
>
  {/* Content */}
</motion.div>
```

**Delay staggering for multiple cards:**
```tsx
{/* Delay 0.1s for first card */}
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} />

{/* Delay 0.15s for second card */}
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} />

{/* Delay 0.25s for third card */}
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} />
```

#### List Item Animation
```tsx
{AGING_ITEMS.map((item, idx) => (
  <motion.button
    key={item.id}
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: idx * 0.05 }}
    className="w-full"
  >
    {/* Content */}
  </motion.button>
))}
```

#### Modal Entrance
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className="fixed inset-0 z-50"
>
  <motion.div
    initial={{ scale: 0.93, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.93, opacity: 0 }}
    className="rounded-2xl"
  >
    {/* Modal content */}
  </motion.div>
</motion.div>
```

#### Progress Bar Animation
```tsx
<motion.div
  initial={{ width: 0 }}
  animate={{ width: `${widthPct}%` }}
  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
  style={{ background: 'linear-gradient(90deg, #DC2626, #EF4444)' }}
/>
```

### 4.2 CSS Animations

#### Shimmer (Skeleton Loading)
```css
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.shimmer {
  background: linear-gradient(90deg, #E5E4E0 25%, #EDECE8 50%, #E5E4E0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 10px;
}
```

#### PACE Ring Animation
```css
.pace-ring {
  transform: rotate(-90deg);
  transform-origin: center;
}

/* SVG circle stroke is animated via JavaScript */
strokeDashoffset={`${2 * Math.PI * 26 * (1 - paceAnimated / 100)}`}
style={{ transition: 'stroke-dashoffset 0.3s ease' }}
```

### 4.3 Transition Easing

**Standard Cubic Bezier for UI transitions:**
```css
transition: all 0.18s ease;      /* Short, snappy UI changes */
transition: all 0.2s ease;       /* Borders, shadows, transform */
transition: width 1.2s cubic-bezier(0.4,0,0.2,1); /* Progress bars */
```

### 4.4 Hover Effects

**Card Hover (Subtle lift):**
```tsx
.card-hover:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06);
  border-color: #C8C7C2;
  transform: translateY(-1px);
}
```

**Button Hover (Background change):**
```tsx
onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-deep)')}
onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
```

---

## 5. LAYOUT GRID SYSTEM

### 5.1 Page Container

```tsx
<div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-0">
  {/* All dashboard content */}
</div>
```

**Breakpoints:**
- `px-4` on mobile (xs, sm)
- `px-6` on tablet (md)
- `px-0` on desktop (lg+) with max-width constraint

### 5.2 Responsive Grids

#### 2-3 Column Grid (Top Metrics)
```tsx
<div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
  <motion.div className="card p-6 col-span-2 lg:col-span-2">
    {/* PACE Score — spans 2 cols on mobile, 2 cols on desktop */}
  </motion.div>
  <motion.div className="card p-6">
    {/* Tasks — 1 col on mobile, 1 col on desktop */}
  </motion.div>
  <motion.div className="card p-6">
    {/* Phase — 1 col on mobile, 1 col on desktop */}
  </motion.div>
</div>
```

#### 2-1 Layout (Roadmap + Milestones)
```tsx
<div className="grid lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2 card p-7">
    {/* Full width on mobile, 2/3 on desktop */}
  </div>
  <div className="card p-7">
    {/* Full width on mobile, 1/3 on desktop */}
  </div>
</div>
```

#### 3-Column Grid (Quick Links)
```tsx
<div className="grid grid-cols-3 gap-3">
  {[...].map(({ href, icon: Icon, label }) => (
    <Link key={href} href={href} className="rounded-xl p-3">
      {/* Each item: 1/3 width */}
    </Link>
  ))}
</div>
```

#### 4-Column Grid (Metrics)
```tsx
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
  {/* 2 columns on mobile/tablet, can adapt on desktop */}
</div>
```

### 5.3 Spacing System

**Gap (Flex/Grid spacing):**
```css
gap-1   = 0.25rem (4px)
gap-2   = 0.5rem (8px)
gap-3   = 0.75rem (12px)
gap-4   = 1rem (16px)
gap-5   = 1.25rem (20px)
gap-6   = 1.5rem (24px)
gap-8   = 2rem (32px)
```

**Padding (Internal spacing):**
```css
p-3  = 0.75rem (12px)  /* Compact cards */
p-4  = 1rem (16px)     /* Default card padding */
p-5  = 1.25rem (20px)
p-6  = 1.5rem (24px)   /* Most dashboard cards */
p-7  = 1.75rem (28px)  /* Large section cards */
```

**Margin (External spacing):**
```css
mb-1 = 0.25rem (4px)
mb-2 = 0.5rem (8px)
mb-3 = 0.75rem (12px)
mb-4 = 1rem (16px)
mb-6 = 1.5rem (24px)
```

---

## 6. ICON USAGE & SPACING

### 6.1 Icon Library

**All icons from `lucide-react` library:**
```tsx
import {
  TrendingUp, CheckCircle2, Clock, Zap,
  Trophy, Star, Target, Bell, FileText, Users,
  ArrowRight, Award, Flame, Globe, ExternalLink, Mail, X,
  AlertOctagon, Send, BarChart2, ChevronRight, Edit3, Sparkles,
  HelpCircle, Info, Activity
} from 'lucide-react'
```

### 6.2 Icon Sizing

| Size | Usage |
|------|-------|
| `w-3 h-3` (12px) | Inline labels, secondary icons |
| `w-3.5 h-3.5` (14px) | Status indicators, small badges |
| `w-4 h-4` (16px) | Main button icons, list icons |
| `w-5 h-5` (20px) | Modal close buttons, section headers |
| `w-7 h-7` (28px) | Avatar icons, large indicators |
| `w-8 h-8` (32px) | Card header icons |

**Example:**
```tsx
<TrendingUp className="w-3 h-3" />           {/* Inline status */}
<CheckCircle2 className="w-4 h-4" />        {/* Button icon */}
<Trophy className="w-8 h-8" />              {/* Card header */}
```

### 6.3 Icon Color Mapping

```tsx
{/* Success state */}
<CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-success)' }} />

{/* Error/alert */}
<AlertOctagon className="w-4 h-4" style={{ color: 'var(--color-error)' }} />

{/* Warning */}
<AlertOctagon className="w-4 h-4" style={{ color: 'var(--color-warning)' }} />

{/* Info */}
<Info className="w-4 h-4" style={{ color: 'var(--color-info)' }} />

{/* Brand accent */}
<Trophy className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
```

### 6.4 Icon + Text Spacing

```tsx
{/* Typical icon + text button */}
<button className="flex items-center gap-2 px-4 py-2.5 rounded-xl">
  <Mail className="w-4 h-4 flex-shrink-0" />
  <span>Send Email</span>
</button>

{/* Gap values: */}
gap-1   = 4px
gap-2   = 8px    {/* Most common for icon + text */}
gap-3   = 12px
```

---

## 7. STATUS BADGES & INDICATORS

### 7.1 Inline Status Badge

```tsx
<span className="badge"
  style={{
    background: 'var(--color-error-soft)',
    color: 'var(--color-accent)',
    borderColor: '#E8312A30',
    padding: '0.2rem 0.55rem'
  }}>
  Critical
</span>
```

### 7.2 Task Status Indicators

#### Completed
```tsx
<div className="flex items-center gap-2">
  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--color-success)' }} />
  <span className="text-text-muted text-xs">Completed</span>
  <span className="text-nav text-xs font-semibold">6</span>
</div>
```

#### In Progress
```tsx
<div className="flex items-center gap-2">
  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--color-info)' }} />
  <span className="text-text-muted text-xs">In Progress</span>
  <span className="text-nav text-xs font-semibold">5</span>
</div>
```

#### Blocked
```tsx
<div className="flex items-center gap-2">
  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--color-accent)' }} />
  <span className="text-text-muted text-xs">Blocked</span>
  <span className="text-nav text-xs font-semibold">1</span>
</div>
```

#### Not Started
```tsx
<div className="flex items-center gap-2">
  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--color-border)' }} />
  <span className="text-text-muted text-xs">Not Started</span>
  <span className="text-nav text-xs font-semibold">31</span>
</div>
```

### 7.3 Phase Status Icons

```tsx
{isDone   ? '✅' : ''}         {/* Completed phase */}
{isActive ? '⚡' : ''}         {/* Active/current phase */}
{i < currentIdx ? '⏳' : ''} {/* Past phase */}
{'🔒'}                          {/* Locked/future phase */}
```

### 7.4 Milestone Status

```tsx
{/* Earned milestone */}
<div className="flex items-center gap-3 p-3 rounded-xl border transition-all"
  style={{
    background: 'var(--color-error-soft)',
    borderColor: 'rgba(232, 49, 42, 0.2)'
  }}>
  <span className="text-base">{milestone.icon}</span>
  <div className="flex-1">
    <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
      {milestone.title}
    </p>
    <p className="text-xs" style={{ color: 'var(--color-accent)' }}>
      +{milestone.xp.toLocaleString()} XP · {milestone.date}
    </p>
  </div>
  <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
</div>

{/* Not yet earned milestone */}
<div className="flex items-center gap-3 p-3 rounded-xl border transition-all"
  style={{
    background: 'var(--color-bg-primary)',
    borderColor: 'var(--color-border)'
  }}>
  <span className="text-base opacity-30 grayscale">{milestone.icon}</span>
  <div className="flex-1">
    <p className="text-xs font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>
      {milestone.title}
    </p>
    <p className="text-xs" style={{ color: 'var(--color-border-dark)' }}>
      +{milestone.xp.toLocaleString()} XP
    </p>
  </div>
</div>
```

---

## 8. DATA VISUALIZATION STYLE

### 8.1 Progress Bars

```css
.progress-bar {
  height: 6px;
  border-radius: 3px;
  background: #E5E4E0;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #1A1A1A, #717171);
  transition: width 1.2s cubic-bezier(0.4,0,0.2,1);
}
```

**Usage:**
```tsx
<div className="progress-bar">
  <div className="progress-fill" style={{ width: `${percentage}%` }} />
</div>
<p className="text-text-light text-xs mt-1">
  {completed}/{total} tasks
</p>
```

### 8.2 Progress Ring (PACE Score)

```tsx
<svg className="w-20 h-20 pace-ring" viewBox="0 0 64 64">
  {/* Background circle */}
  <circle cx="32" cy="32" r="26" fill="none" stroke="#E5E4E0" strokeWidth="6" />
  
  {/* Animated progress circle */}
  <circle
    cx="32" cy="32" r="26"
    fill="none"
    stroke="#1A1A1A"
    strokeWidth="6"
    strokeLinecap="round"
    strokeDasharray={`${2 * Math.PI * 26}`}
    strokeDashoffset={`${2 * Math.PI * 26 * (1 - paceAnimated / 100)}`}
    style={{ transition: 'stroke-dashoffset 0.3s ease' }}
  />
</svg>

{/* Center value */}
<div className="absolute inset-0 flex items-center justify-center">
  <span className="text-nav font-black text-lg">{paceAnimated}</span>
</div>
```

### 8.3 Aging Timeline Bars

```tsx
<motion.div
  initial={{ width: 0 }}
  animate={{ width: `${widthPct}%` }}
  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
  style={{
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    background: item.status === 'overdue'
      ? 'linear-gradient(90deg, #DC2626, #EF4444)'
      : item.status === 'at_risk'
      ? 'linear-gradient(90deg, #B45309, #D97706)'
      : 'linear-gradient(90deg, #1D4ED8, #3B82F6)',
    borderRadius: '6px',
    opacity: 0.85,
  }}
/>
```

---

## 9. BUTTON & CTA STYLING

### 9.1 Primary Button (Brand Red)

```tsx
<button className="px-5 py-2.5 rounded-xl text-sm font-semibold"
  style={{
    background: 'var(--color-accent)',
    color: 'var(--color-text-inverse)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.18s ease'
  }}
  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-error-dark)')}
  onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
>
  Send Reminder
</button>
```

### 9.2 Secondary Button (Outlined)

```tsx
<button className="px-4 py-2.5 rounded-xl text-sm font-semibold"
  style={{
    background: 'white',
    border: '1px solid #E5E4E0',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    transition: 'all 0.18s ease'
  }}
>
  Cancel
</button>
```

### 9.3 Icon Button

```tsx
<button
  className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap"
  style={{
    background: 'white',
    border: '1px solid #E5E4E0',
    color: 'var(--color-text-primary)',
    cursor: 'pointer'
  }}>
  <Mail className="w-4 h-4 flex-shrink-0" />
  <span className="hidden sm:inline">Send Dashboard</span>
  <span className="sm:hidden">Send</span>
</button>
```

### 9.4 Ghost/Link Button

```tsx
<Link href="/checklist"
  className="flex items-center gap-1 text-accent text-xs font-medium"
  style={{ textDecoration: 'none' }}
  onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
  Full checklist <ArrowRight className="w-3 h-3" />
</Link>
```

### 9.5 Button Loading State

```tsx
<button
  disabled={sendingReport}
  style={{
    background: 'var(--color-accent)',
    color: 'var(--color-text-inverse)',
    opacity: sendingReport ? 0.7 : 1,
    cursor: sendingReport ? 'not-allowed' : 'pointer'
  }}>
  {sendingReport ? (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
    </svg>
  ) : (
    <Mail className="w-4 h-4" />
  )}
  {sendingReport ? 'Sending…' : 'Send Now'}
</button>
```

---

## 10. ALERT & ERROR MESSAGING DESIGN

### 10.1 Notification Banner

```tsx
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  className="flex items-start gap-3 p-4 rounded-xl card">
  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
    style={{ background: notif.type === 'milestone' ? 'var(--color-warning-soft)' : 'var(--color-info-soft)' }}>
    {notif.type === 'milestone'
      ? <Trophy className="w-4 h-4 text-amber" />
      : <Bell className="w-4 h-4 text-blue" />}
  </div>
  <div className="flex-1 min-w-0">
    <p className="text-nav text-sm font-semibold">{notif.title}</p>
    <p className="text-text-muted text-xs mt-0.5">{notif.message}</p>
  </div>
  <button onClick={() => markNotificationRead(notif.id)}
    className="text-text-light hover:text-text-muted transition-colors text-xs">
    Dismiss
  </button>
</motion.div>
```

### 10.2 Alert Box (Blocker/Warning)

```tsx
<div className="flex items-start gap-2 rounded-xl mt-2"
  style={{
    background: 'var(--color-warning-soft)',
    border: '1px solid #FDE68A',
    padding: '0.75rem'
  }}>
  <AlertOctagon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-warning)' }} />
  <div>
    <p className="text-xs font-bold" style={{ color: 'var(--color-warning-dark)' }}>Current Blocker</p>
    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-warning-dark)' }}>
      {item.blockers}
    </p>
  </div>
</div>
```

### 10.3 Error Message

```tsx
<p className="text-xs mt-2 text-center" style={{ color: 'var(--color-error)' }}>
  {boardError}
</p>
```

### 10.4 Success State Modal

```tsx
<div className="text-center py-4">
  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
    style={{
      background: 'var(--color-success-light)',
      border: '1px solid #86EFAC'
    }}>
    <CheckCircle2 className="w-7 h-7" style={{ color: 'var(--color-success-bright)' }} />
  </div>
  <h2 className="font-bold text-lg mb-2" style={{ color: 'var(--color-text-primary)' }}>
    Dashboard Sent
  </h2>
  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
    A live snapshot of your IPO progress has been sent to {emailAddress || 'your email'}.
  </p>
</div>
```

### 10.5 Risk Severity Badge

```tsx
{/* High Risk */}
<span className="text-[9px] font-black px-1.5 py-0.5 rounded"
  style={{
    background: 'var(--color-error-pale)',
    color: 'var(--color-error)'
  }}>
  HIGH RISK
</span>

{/* Medium Risk */}
<span className="text-[9px] font-black px-1.5 py-0.5 rounded"
  style={{
    background: 'var(--color-warning-soft)',
    color: 'var(--color-warning)'
  }}>
  MEDIUM RISK
</span>

{/* Low Risk */}
<span className="text-[9px] font-black px-1.5 py-0.5 rounded"
  style={{
    background: 'var(--color-success-light)',
    color: 'var(--color-success-dark)'
  }}>
  LOW RISK
</span>
```

---

## 11. MODAL & DIALOG DESIGN

### 11.1 Modal Wrapper

```tsx
<AnimatePresence>
  {modalOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={() => setModalOpen(false)}>
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.93, opacity: 0 }}
        className="rounded-2xl w-full overflow-hidden"
        style={{
          background: 'white',
          border: '1px solid #E5E4E0',
          maxWidth: '680px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        {/* Body */}
        {/* Footer */}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

### 11.2 Modal Header

```tsx
<div style={{
  padding: '1.25rem 1.5rem',
  borderBottom: '1px solid #E5E4E0',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '1rem',
  background: 'var(--color-bg-primary)',
  flexShrink: 0
}}>
  <div className="flex items-start gap-3 min-w-0">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: 'var(--color-bg-primary)', border: '1px solid #E5E4E0' }}>
      <Mail className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
    </div>
    <div className="min-w-0">
      <h2 className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>
        Send Dashboard
      </h2>
      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        Send your live IPO progress snapshot
      </p>
    </div>
  </div>
  <button onClick={() => setModalOpen(false)} style={{ color: 'var(--color-text-secondary)' }}>
    <X className="w-5 h-5" />
  </button>
</div>
```

### 11.3 Modal Body

```tsx
<div className="overflow-y-auto" style={{ flex: 1 }}>
  <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F0EFED' }}>
    {/* Content sections */}
  </div>
</div>
```

### 11.4 Modal Footer

```tsx
<div style={{
  padding: '1rem 1.5rem',
  borderTop: '1px solid #E5E4E0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  background: 'var(--color-bg-primary)',
  flexShrink: 0
}}>
  <button className="px-4 py-2.5 rounded-xl text-sm font-semibold"
    style={{
      background: 'var(--color-bg-primary)',
      border: '1px solid #E5E4E0',
      color: 'var(--color-text-primary)',
      cursor: 'pointer'
    }}>
    Cancel
  </button>
  <button className="px-5 py-2.5 rounded-xl text-sm font-semibold"
    style={{
      background: 'var(--color-accent)',
      color: 'var(--color-text-inverse)',
      cursor: 'pointer'
    }}>
    Send
  </button>
</div>
```

---

## 12. INPUT & FORM ELEMENTS

### 12.1 Text Input

```tsx
<input
  type="email"
  value={emailAddress}
  onChange={e => setEmailAddress(e.target.value)}
  placeholder="you@company.com"
  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
  style={{
    border: '1px solid #E5E4E0',
    background: 'var(--color-surface-light)',
    color: 'var(--color-text-primary)'
  }}
  onFocus={e => {
    e.target.style.borderColor = 'var(--color-text-primary)';
    e.target.style.boxShadow = '0 0 0 3px rgba(26,26,26,0.07)';
  }}
  onBlur={e => {
    e.target.style.borderColor = 'var(--color-border)';
    e.target.style.boxShadow = 'none';
  }}
/>
```

### 12.2 Textarea

```tsx
<textarea
  value={message}
  onChange={e => setMessage(e.target.value)}
  rows={12}
  className="w-full rounded-xl text-xs outline-none resize-none font-mono leading-relaxed"
  style={{
    background: 'var(--color-bg-primary)',
    border: '1px solid #1A1A1A',
    padding: '0.875rem',
    color: 'var(--color-text-primary)',
    boxShadow: '0 0 0 3px rgba(26,26,26,0.07)'
  }}
/>
```

### 12.3 Form Label

```tsx
<label className="text-xs font-semibold uppercase tracking-wider block mb-2"
  style={{ color: 'var(--color-text-secondary)' }}>
  Send To
</label>
```

### 12.4 Radio/Toggle Button Group

```tsx
<div className="flex gap-2">
  {(['html', 'pdf'] as const).map(fmt => (
    <button
      key={fmt}
      onClick={() => setEmailFormat(fmt)}
      className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all"
      style={emailFormat === fmt
        ? {
            background: 'var(--color-accent)',
            border: '1px solid var(--color-accent)',
            color: 'var(--color-text-inverse)'
          }
        : {
            background: 'var(--color-bg-primary)',
            border: '1px solid #E5E4E0',
            color: 'var(--color-text-secondary)'
          }}>
      {fmt === 'html' ? '📧 Email (HTML)' : '📄 PDF Attachment'}
    </button>
  ))}
</div>
```

---

## 13. RESPONSIVE DESIGN

### 13.1 Mobile-First Approach

**Breakpoints:**
```css
xs: 320px   /* Extra small mobile */
sm: 640px   /* Small mobile (landscape) */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### 13.2 Common Responsive Patterns

#### Header (flex-direction changes)
```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
  {/* Vertical stack on mobile, horizontal on desktop */}
</div>
```

#### Grid (2 cols → 3 cols)
```tsx
<div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
  {/* 2 columns on mobile, 3 on desktop */}
</div>
```

#### Hidden/Shown by breakpoint
```tsx
<span className="hidden sm:inline">Full Text</span>
<span className="sm:hidden">Short</span>
```

### 13.3 Touch-Friendly Sizing

```css
min-height: 3rem;   /* 48px minimum touch target */
min-width: 3rem;    /* 48px minimum touch target */
```

---

## 14. EXAMPLE: COMPLETE COMPONENT

### Dashboard Card with All Design Elements

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.15 }}
  className="card p-6">
  
  {/* Header with icon */}
  <div className="flex items-center gap-2 mb-4">
    <p className="text-text-muted text-xs uppercase tracking-wider font-semibold">
      Tasks
    </p>
    <HelpCircle className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
  </div>

  {/* Content grid */}
  <div className="space-y-2">
    {[
      { label: 'Completed', value: 11, color: 'var(--color-success)' },
      { label: 'In Progress', value: 5, color: 'var(--color-info)' },
      { label: 'Blocked', value: 1, color: 'var(--color-accent)' },
      { label: 'Not Started', value: 31, color: 'var(--color-border)' },
    ].map(({ label, value, color }) => (
      <div key={label} className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
        <span className="text-text-muted text-xs flex-1">{label}</span>
        <span className="text-nav text-xs font-semibold">{value}</span>
      </div>
    ))}
  </div>

  {/* Progress bar */}
  <div className="mt-3 progress-bar">
    <div className="progress-fill" style={{ width: '23%' }} />
  </div>
  <p className="text-text-light text-xs mt-1">11/48 tasks</p>

  {/* Link */}
  <Link href="/checklist" className="mt-3 text-accent text-xs flex items-center gap-1 hover:text-accent-deep transition-colors font-medium">
    View all tasks <ArrowRight className="w-3 h-3" />
  </Link>
</motion.div>
```

---

## 15. ACCESSIBILITY & BEST PRACTICES

### 15.1 Focus States

```css
:where(
  a, button, input, select, textarea,
  [role="button"], [tabindex]:not([tabindex="-1"])
):focus-visible {
  outline: 2px solid #E8312A;
  outline-offset: 2px;
  border-radius: 8px;
}
```

### 15.2 Semantic HTML

```tsx
{/* ✅ Correct */}
<button onClick={handleClick}>Send</button>
<a href="/checklist">View checklist</a>
<input type="email" placeholder="your@email.com" />

{/* ❌ Avoid */}
<div onClick={handleClick} style={{ cursor: 'pointer' }}>Send</div>
<span onClick={() => navigate('/checklist')}>View</span>
```

### 15.3 Color Contrast

All text meets WCAG AA standards:
- Primary text (#1A1A1A) on light backgrounds
- Secondary text (#717171) on light backgrounds with minimum 4.5:1 ratio
- White text (#FFFFFF) on dark/accent backgrounds

### 15.4 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```

---

## 16. TROUBLESHOOTING & MIGRATION GUIDE

### 16.1 Common Issues

**Problem:** Button text overlapping with icons on mobile
```tsx
/* ❌ Wrong */
<button className="flex items-center gap-1 px-2 py-1">
  <Mail className="w-4 h-4" />
  <span>Send Email</span>
</button>

/* ✅ Correct */
<button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5">
  <Mail className="w-4 h-4 flex-shrink-0" />
  <span className="hidden sm:inline">Send Email</span>
  <span className="sm:hidden">Send</span>
</button>
```

**Problem:** Hydration mismatches with animations
```tsx
/* ✅ Solution */
const [isMounted, setIsMounted] = useState(false);
useEffect(() => {
  setIsMounted(true);
}, []);

{isMounted && (
  <motion.div>
    {/* Framer Motion content */}
  </motion.div>
)}
```

### 16.2 CSS Variable Fallbacks

```tsx
/* Always provide fallback colors */
style={{
  background: 'var(--color-accent, #E8312A)',
  color: 'var(--color-text-inverse, #FFFFFF)'
}}
```

---

## 17. PERFORMANCE CONSIDERATIONS

### 17.1 Loading Skeleton

```tsx
const shimmerStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, #E5E4E0 25%, #EDECE8 50%, #E5E4E0 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.4s infinite',
  borderRadius: '10px',
};
```

### 17.2 Image Optimization

- Use SVG for icons (lucide-react)
- Use Next.js Image component for static images
- Lazy-load off-screen content

### 17.3 Animation Performance

- Use `will-change` sparingly
- Prefer CSS transforms and opacity for animations
- Keep motion transitions under 800ms

---

## 18. EXPORT & IMPLEMENTATION CHECKLIST

- [x] All color tokens defined in CSS variables
- [x] Typography system standardized
- [x] Component patterns documented
- [x] Animation specifications included
- [x] Responsive breakpoints defined
- [x] Icon sizing guide provided
- [x] Status badge patterns documented
- [x] Button states specified
- [x] Modal & dialog templates provided
- [x] Form elements styled
- [x] Accessibility guidelines included
- [x] Performance tips documented

---

**Design System Maintained By:** IPOReady Design Team  
**Last Review:** June 2026  
**Compatibility:** Next.js 14+, Tailwind CSS v4, Framer Motion v6+

