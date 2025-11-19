# Mbeki Healthcare Patient Management System - Design Guidelines

## Design Approach: Material Design Healthcare Adaptation
**Rationale:** Material Design provides excellent support for information-dense interfaces while maintaining visual hierarchy and accessibility - critical for healthcare applications where clarity saves lives.

## Core Design Elements

### A. Color Palette

**Primary Colors (Professional Medical Blue):**
- Primary: 210 85% 45% (Deep trustworthy blue)
- Primary Hover: 210 85% 38%
- Primary Light: 210 70% 92% (Subtle backgrounds)

**Accent Colors:**
- Success/Healthy: 145 70% 42% (Medical green)
- Warning/Attention: 35 92% 55% (Amber alerts)
- Critical/Urgent: 0 75% 50% (Medical emergency red)
- Info: 200 80% 50% (Informational cyan)

**Neutral Palette:**
- Background Light: 210 20% 98%
- Background Dark: 215 25% 12%
- Surface Light: 0 0% 100%
- Surface Dark: 215 20% 16%
- Border Light: 210 15% 88%
- Border Dark: 215 15% 25%
- Text Primary Light: 215 25% 15%
- Text Primary Dark: 210 20% 95%
- Text Secondary Light: 215 15% 45%
- Text Secondary Dark: 210 15% 70%

### B. Typography

**Font Stack:**
- Primary: 'Inter' via Google Fonts CDN - exceptional readability for medical data
- Monospace: 'JetBrains Mono' for patient IDs, medical codes, measurements

**Scale:**
- Hero Heading: text-5xl md:text-6xl font-bold (Patient names, dashboard headers)
- Section Heading: text-3xl font-semibold (Module titles)
- Card Heading: text-xl font-semibold (Patient cards, vital signs)
- Body Large: text-base font-medium (Primary medical information)
- Body: text-sm (Secondary details, notes)
- Caption: text-xs (Timestamps, metadata)
- Code/Data: font-mono text-sm (Patient IDs, measurements)

### C. Layout System

**Spacing Primitives:** Consistent use of 4, 6, 8, 12, 16, 24 units
- Component padding: p-6 (cards), p-4 (compact elements)
- Section spacing: space-y-8 between major sections
- Grid gaps: gap-6 for card grids, gap-4 for dense lists
- Container: max-w-7xl mx-auto px-6

**Grid System:**
- Dashboard: 3-column layout (lg:grid-cols-3) - sidebar navigation, main content, quick stats
- Patient List: 1-column responsive cards (md:grid-cols-2 lg:grid-cols-3)
- Data Tables: Full-width with horizontal scroll on mobile
- Forms: 2-column layout (md:grid-cols-2) for efficient data entry

### D. Component Library

**Navigation:**
- Top Bar: Fixed header with logo, search, notifications, user profile (h-16)
- Sidebar: Collapsible navigation (w-64 expanded, w-16 collapsed) with icon + label
- Breadcrumbs: Location context for deep navigation
- Tabs: For patient record sections (Overview, Vitals, History, Documents)

**Data Display:**
- Patient Cards: White surface, shadow-sm, rounded-lg, p-6, with photo, name, ID, status badge
- Vital Signs Cards: Grid display with large numbers, trend indicators, mini sparklines
- Data Tables: Striped rows, sticky headers, sortable columns, row hover states
- Status Badges: Pill-shaped, color-coded (bg-success/warning/critical with text)
- Charts: Line graphs for vitals over time, bar charts for statistics

**Forms & Inputs:**
- Input Fields: Outlined style (border-2), focus:ring-2, clear labels above
- Date Pickers: Calendar overlay with range selection for appointments
- Dropdowns: Searchable for medication/diagnosis selection
- Checkboxes/Radio: Large touch targets (w-5 h-5) with labels
- File Upload: Drag-drop zone for medical documents/images

**Actions:**
- Primary Button: Filled primary color, px-6 py-3, rounded-lg, font-medium
- Secondary Button: Outlined, border-2 border-primary
- Danger Button: Filled critical color for destructive actions
- Icon Buttons: Square (w-10 h-10), rounded-lg, hover:bg-surface for toolbar actions
- FAB: Fixed bottom-right for quick patient add (w-14 h-14, rounded-full)

**Overlays:**
- Modals: Center screen, max-w-2xl, with backdrop blur
- Sidepanels: Slide from right for patient details (w-full md:w-96)
- Notifications: Top-right toast stack (w-96) with auto-dismiss
- Alerts: Full-width banner for system-critical messages

**Dashboard Widgets:**
- Statistics Cards: Large number display with trend arrows, compact 4-column grid
- Appointment Timeline: Vertical timeline with color-coded appointment types
- Recent Activity Feed: Chronological list with timestamps and user avatars
- Quick Actions Panel: Icon grid for common tasks (New Patient, Schedule, Reports)

### E. Animations
- Page Transitions: None - instant for data access speed
- Micro-interactions: Button hover/active states (built-in)
- Loading States: Skeleton screens for tables/cards, spinner for async actions
- Notifications: Slide-in from top-right (300ms ease-out)

## Images

**Hero Section:**
- Large hero image showing modern medical facility interior or healthcare professionals collaborating
- Image overlay: gradient from transparent to background color (opacity-60)
- Dimensions: Full viewport width, h-96 on desktop, h-64 on mobile
- Position: Top of dashboard/home page
- Treatment: Slightly desaturated for professional look, blur buttons placed on image

**Secondary Images:**
- Patient avatars: Circular (w-12 h-12 for lists, w-24 h-24 for profiles)
- Medical document thumbnails: Square with border, clickable for full view
- Facility photos: In about/contact sections if applicable
- Empty states: Friendly illustrations for "No patients found" scenarios

**Icons:**
Use Heroicons (outline for navigation, solid for statuses) via CDN for medical contexts: heart (vitals), calendar (appointments), document-text (records), user-group (patients), bell (notifications).

## Accessibility Requirements
- WCAG AA compliance minimum (4.5:1 text contrast)
- Dark mode: Full implementation across all components with consistent color mapping
- Keyboard navigation: Full support with visible focus indicators (ring-2 ring-offset-2)
- Screen reader: Proper ARIA labels for all interactive elements, live regions for updates
- Form validation: Inline error messages, clear required field indicators
- Touch targets: Minimum 44x44px for mobile interactions