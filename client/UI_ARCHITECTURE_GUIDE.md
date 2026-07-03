# eCLINIC - Frontend UI Architecture & Responsive Design Guide

## Overview

This document provides a complete guide to the responsive UI architecture of the eCLINIC medical consultation platform. The design is **mobile-first**, optimized for all screen sizes from 320px (small phones) to 1536px+ (large desktops).

---

## 📱 Responsive Breakpoints

All layouts use these Tailwind breakpoints:

```javascript
xs:  320px   // Extra small phones
sm:  480px   // Small phones
md:  768px   // Tablets
lg:  1024px  // Laptops
xl:  1280px  // Large desktops
2xl: 1536px  // Extra large displays
```

**Mobile-First Strategy**: Design starts with mobile, then add complexity for larger screens using `md:`, `lg:`, etc.

---

## 🎨 Color Palette

### Primary Colors
- **Primary Blue**: `#006FE5` - Healthcare action buttons, links, primary CTA
- **Secondary Teal**: `#24e1d8` - Accents, highlights, secondary CTAs

### Status Colors
- **Success**: `#22c55e` - Approved, confirmed, online status
- **Warning**: `#f59e0b` - Pending actions, caution alerts
- **Danger**: `#ef4444` - Errors, cancellations, destructive actions
- **Info**: `#0ea5e9` - Information messages, notifications

### Neutral Grays
- Used for text, backgrounds, borders
- Range from 50 (lightest) to 900 (darkest)

---

## 🏗️ Layouts

### 1. PublicLayout
For unauthenticated pages (landing, about, pricing)

**Features:**
- Responsive navbar with mobile menu toggle
- Multi-column footer (stacked on mobile)
- Hero sections with responsive typography

**Responsive Behavior:**
- **Mobile**: Single column, full-width sections
- **Desktop**: Multi-column footer, side-by-side content

```jsx
import { PublicLayout } from './layouts';

export default function HomePage() {
  return (
    <PublicLayout>
      <h1>Welcome to eCLINIC</h1>
    </PublicLayout>
  );
}
```

### 2. AuthLayout
For login, signup, password reset pages

**Features:**
- Centered form container
- Optional side illustration (desktop only)
- Touch-friendly form inputs
- SSL security message

**Responsive Behavior:**
- **Mobile**: Full-screen centered form
- **Desktop**: Form + side illustration

### 3. MainLayout
Primary layout for authenticated users

**Features:**
- Collapsible sidebar (desktop/tablet)
- Mobile bottom navigation
- Top navbar with user menu
- Responsive notification bell

**Responsive Behavior:**
- **Mobile**: Stacked, bottom nav only
- **Tablet**: Collapsible sidebar, swipeable
- **Desktop**: Full sidebar, expandable content

### 4. PatientLayout
Patient-specific dashboard

**Sidebar Navigation:**
```
Dashboard
├── Dashboard
└── Health Overview

Appointments
├── My Appointments
└── Book Appointment

Health Records
├── Medical History
├── Prescriptions
└── Medical Reports

More
├── Pharmacy
└── Profile
```

### 5. DoctorLayout
Doctor consultation management

**Sidebar Navigation:**
```
Dashboard
├── Dashboard
└── Today's Schedule

Consultations
├── Active Consultations (with badge)
└── Patient Queue

Patients
├── My Patients
└── Patient History

Availability
└── Manage Availability

Business
├── Earnings
├── Analytics
└── Profile
```

### 6. AdminLayout
Admin governance & management

**Sidebar Navigation:**
```
Dashboard
├── Dashboard
└── Platform Analytics

User Management
├── Users
├── Doctors
└── Patients

Verification
├── Doctor Verification (badge)
└── Pharmacy Verification (badge)

Content Management
├── Categories
└── Specializations

Monitoring
├── Transactions
├── Audit Logs
└── Settings
```

---

## 🔘 Button Components

All buttons are touch-friendly (minimum 44px height on mobile).

### PrimaryButton
Main action button, blue background

```jsx
<PrimaryButton 
  onClick={handleClick}
  size="md"  // sm | md | lg
  fullWidth={false}
  loading={false}
>
  Book Appointment
</PrimaryButton>
```

### SecondaryButton
Alternative action, light background

```jsx
<SecondaryButton>
  Cancel
</SecondaryButton>
```

### TextButton
Low-emphasis action (links)

```jsx
<TextButton>
  Forgot Password?
</TextButton>
```

### IconButton
Icon-only button, 44px+ size

```jsx
<IconButton icon={<SearchIcon />} label="Search" />
```

### DangerButton
Destructive actions

```jsx
<DangerButton>
  Delete Account
</DangerButton>
```

### FloatingActionButton
Fixed position action button

```jsx
<FloatingActionButton 
  icon={<PlusIcon />}
  position="bottom-right"
  label="New Appointment"
  onClick={handleNew}
/>
```

---

## 📝 Form Components

All form inputs are responsive and accessible with proper labels and error states.

### InputField
Text input with icon support

```jsx
<InputField
  label="Email Address"
  type="email"
  placeholder="doctor@hospital.com"
  value={email}
  onChange={handleChange}
  error={emailError}
  hint="We'll never share your email"
  required
  icon={<EnvelopeIcon />}
/>
```

**Responsive Sizing:** Auto-adjusts height on mobile for touch

### PasswordField
Password input with show/hide toggle

```jsx
<PasswordField
  label="Password"
  placeholder="••••••••"
  value={password}
  onChange={handleChange}
/>
```

### TextArea
Multi-line textarea with character count

```jsx
<TextArea
  label="Medical Notes"
  placeholder="Enter observations..."
  maxLength={500}
  rows={4}
/>
```

### SelectField
Dropdown with keyboard support

```jsx
<SelectField
  label="Specialization"
  options={[
    { value: 'cardio', label: 'Cardiology' },
    { value: 'neuro', label: 'Neurology' }
  ]}
  value={specialization}
  onChange={handleChange}
/>
```

### SearchField
Search input with submit

```jsx
<SearchField
  placeholder="Search doctors..."
  value={query}
  onChange={setQuery}
  onSubmit={handleSearch}
/>
```

### CheckboxField
Checkbox with label

```jsx
<CheckboxField
  label="I agree to terms and conditions"
  checked={agree}
  onChange={setAgree}
/>
```

### RadioGroup
Radio button group

```jsx
<RadioGroup
  label="Consultation Type"
  options={[
    { value: 'video', label: 'Video Call' },
    { value: 'audio', label: 'Audio Call' },
    { value: 'chat', label: 'Chat' }
  ]}
  value={type}
  onChange={setType}
/>
```

---

## 🎴 Card Components

### DoctorCard
Display doctor profile with rating

```jsx
<DoctorCard
  doctorName="Dr. Rajesh Kumar"
  specialization="Cardiology"
  rating={4.8}
  reviewCount={128}
  profileImage={imageUrl}
  availability="Available"
  consultationFee={500}
  onBook={handleBooking}
/>
```

**Responsive:**
- Mobile: Vertical layout
- Desktop: Horizontal with image on left

### AppointmentCard
Show appointment with status

```jsx
<AppointmentCard
  patientOrDoctorName="Dr. Sarah Johnson"
  date="Dec 20, 2024"
  time="2:30 PM"
  specialization="Neurology"
  status="scheduled"  // scheduled | completed | cancelled
  consultationType="video"
  onViewDetails={handleView}
/>
```

### PrescriptionCard
Display prescription information

```jsx
<PrescriptionCard
  medicineNames={['Aspirin', 'Metformin']}
  prescribedDate="Dec 15, 2024"
  doctorName="Dr. Rajesh Kumar"
  status="active"  // active | expired | completed
  onViewDetails={handleView}
/>
```

### ProductCard
Pharmacy product display

```jsx
<ProductCard
  productName="Ibuprofen 400mg"
  category="Pain Relief"
  price={150}
  originalPrice={200}
  rating={4.5}
  image={imageUrl}
  inStock={true}
  onAddToCart={handleAdd}
/>
```

**Features:**
- Discount percentage display
- Stock status
- Star rating

### AnalyticsCard
Display metrics (admin)

```jsx
<AnalyticsCard
  title="Total Consultations"
  value={1250}
  trend="up"
  trendPercentage={12}
  icon={<ChartIcon />}
/>
```

---

## 📊 Data Display

### DataTable
Responsive table component

**Desktop:** Full table layout
**Mobile:** Card-based layout

```jsx
<DataTable
  columns={[
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => <Badge>{value}</Badge>
    }
  ]}
  rows={doctors}
  actions={[
    { label: 'Edit', onClick: handleEdit },
    { label: 'Delete', onClick: handleDelete, variant: 'danger' }
  ]}
/>
```

### DataList
Better for mobile, list-based display

```jsx
<DataList
  items={patients}
  renderItem={(patient) => (
    <div>
      <h4>{patient.name}</h4>
      <p>{patient.email}</p>
    </div>
  )}
  actions={[{ label: 'View', onClick: handleView }]}
/>
```

---

## ⚠️ Feedback Components

### Loader
Loading spinner

```jsx
<Loader size="md" message="Loading..." />

// Full screen overlay
<Loader size="md" fullScreen message="Processing..." />
```

### EmptyState
No data message

```jsx
<EmptyState
  title="No Appointments"
  message="You don't have any appointments yet"
  action={handleBookNow}
  actionLabel="Book Now"
/>
```

### Error States & Banners
Contextual feedback messages

```jsx
<SuccessBanner 
  title="Success"
  message="Appointment booked successfully"
  onClose={handleClose}
/>

<WarningBanner
  title="Pending Verification"
  message="Your profile is pending verification"
/>

<DangerBanner
  title="Error"
  message="An error occurred. Please try again"
  onClose={handleClose}
/>
```

### ProgressBar
Show progress

```jsx
<ProgressBar progress={65} showLabel={true} />
```

---

## 🪟 Modals

### Confirmation Modal
Yes/No confirmation

```jsx
<ConfirmationModal
  isOpen={isOpen}
  title="Cancel Appointment"
  message="Are you sure you want to cancel this appointment?"
  confirmLabel="Cancel Appointment"
  isDangerous={true}
  onConfirm={handleCancel}
  onCancel={handleClose}
/>
```

### Alert Modal
Simple alert

```jsx
<AlertModal
  isOpen={isOpen}
  type="success"  // success | error | warning | info
  title="Success"
  message="Appointment scheduled successfully"
  onClose={handleClose}
/>
```

### Form Modal
Modal with form

```jsx
<FormModal
  isOpen={isOpen}
  title="Book Appointment"
  submitLabel="Book"
  onSubmit={handleSubmit}
  onCancel={handleClose}
>
  {/* Form content */}
</FormModal>
```

### Sheet Modal
Bottom drawer (mobile optimized)

```jsx
<SheetModal
  isOpen={isOpen}
  title="Filter Options"
  height="half"  // auto | half | full
  onClose={handleClose}
  actions={<ActionButtons />}
>
  {/* Content */}
</SheetModal>
```

---

## 🧭 Navigation

### Breadcrumbs
Navigation path

```jsx
<Breadcrumbs
  items={[
    { label: 'Home', href: '/' },
    { label: 'Doctors', href: '/doctors' },
    { label: 'Cardiology' }
  ]}
/>
```

### Tabs
Tabbed navigation

```jsx
<Tabs
  tabs={[
    { label: 'Overview', content: <Overview /> },
    { label: 'Details', content: <Details /> }
  ]}
  activeTab={0}
  onChange={setActiveTab}
/>
```

### Pagination
Page navigation

```jsx
<Pagination
  currentPage={currentPage}
  totalPages={10}
  onPageChange={setCurrentPage}
/>
```

### Stepper
Multi-step wizard

```jsx
<Stepper
  steps={[
    { label: 'Basic Info', description: 'Your information' },
    { label: 'Medical History' },
    { label: 'Review' }
  ]}
  currentStep={0}
  onStepClick={setCurrentStep}
/>
```

---

## 🪝 Responsive Hooks

### useResponsive
Get current breakpoint and device info

```jsx
const { breakpoint, isMobile, isTablet, isDesktop } = useResponsive();

if (isMobile) {
  return <MobileView />;
}
return <DesktopView />;
```

### useWindowSize
Get window dimensions

```jsx
const { width, height } = useWindowSize();
```

### useMobileMenu
Manage mobile menu state

```jsx
const { isOpen, toggle, open, close } = useMobileMenu();
```

### useMediaQuery
Watch specific media query

```jsx
const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
const isLandscape = useMediaQuery('(orientation: landscape)');
```

### useOrientation
Detect device orientation

```jsx
const orientation = useOrientation(); // 'portrait' | 'landscape'
```

### useTouchDetection
Check if device supports touch

```jsx
const isTouchDevice = useTouchDetection();
```

### useInfiniteScroll
Detect scroll to bottom

```jsx
const { isFetching, setIsFetching } = useInfiniteScroll(() => {
  loadMoreItems();
}, 100); // threshold in pixels
```

### useConsultationLayout
Optimize consultation room

```jsx
const { layout, videoHeight, chatWidth } = useConsultationLayout();
```

---

## 📱 Device Type Optimization

### Mobile (< 768px)
- **Navigation**: Bottom navigation bar, hamburger menu
- **Forms**: Single column, full-width inputs
- **Tables**: Card-based layout, swipe actions
- **Modals**: Bottom sheet style
- **Images**: 1x resolution
- **Touch**: 44px minimum tap targets
- **Safe Areas**: Notch and home indicator support

### Tablet (768px - 1024px)
- **Layout**: Sidebar + content (70/30 split)
- **Navigation**: Collapsible sidebar
- **Grids**: 2-3 columns
- **Tables**: Horizontal scroll
- **Modals**: Centered, 80% width

### Desktop (> 1024px)
- **Layout**: Full sidebar + expanded content
- **Navigation**: Persistent top nav + sidebar
- **Grids**: 3-4 columns
- **Tables**: Full width, all columns visible
- **Modals**: Centered, 60% width

---

## 🎯 Best Practices

### 1. Mobile-First Development
Always design for mobile first, then enhance for larger screens:
```jsx
// Good: Starts mobile, enhanced on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Bad: Starts with desktop
<div className="grid grid-cols-3 sm:grid-cols-2 xs:grid-cols-1">
```

### 2. Touch-Friendly
- Minimum 44px x 44px touch targets
- 12px minimum font size
- Adequate spacing (16px+ gaps)

### 3. Responsive Images
```jsx
<img
  src="desktop.jpg"
  srcSet="mobile.jpg 320w, tablet.jpg 768w"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### 4. Safe Areas
Support notched devices:
```jsx
<div className="safe-top safe-right safe-bottom safe-left">
  Content with safe areas
</div>
```

### 5. Performance
- Lazy load below-the-fold images
- Use `useResponsive` to avoid rendering large components on mobile
- Minimize animations for reduced motion preference

```jsx
const { prefersReducedMotion } = useReducedMotion();
```

---

## 📦 Export Structure

Components are organized by category:

```
components/
├── buttons/
│   └── Button.jsx
├── forms/
│   └── FormInput.jsx
├── cards/
│   └── Card.jsx
├── feedback/
│   └── Feedback.jsx
├── modals/
│   └── Modal.jsx
├── navigation/
│   └── Navigation.jsx
└── common/
    └── DataTable.jsx

layouts/
├── PublicLayout.jsx
├── AuthLayout.jsx
├── MainLayout.jsx
├── PatientLayout.jsx
├── DoctorLayout.jsx
└── AdminLayout.jsx

hooks/
└── useResponsive.js

styles/
└── index.css

tailwind.config.js
```

---

## 🎓 Usage Examples

### Complete Patient Dashboard Page
```jsx
import { PatientLayout } from './layouts';
import { useResponsive } from './hooks';
import { Card, AppointmentCard, AnalyticsCard } from './components';

export default function PatientDashboard() {
  const { isMobile } = useResponsive();

  return (
    <PatientLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnalyticsCard title="Total Consultations" value={12} />
        <AnalyticsCard title="Upcoming Appointments" value={3} />
        <AnalyticsCard title="Prescriptions" value={5} />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Upcoming Appointments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appointments.map((apt) => (
            <AppointmentCard key={apt.id} {...apt} />
          ))}
        </div>
      </div>
    </PatientLayout>
  );
}
```

---

## 🚀 Getting Started

1. Import the layout:
   ```jsx
   import { PatientLayout } from './layouts';
   ```

2. Wrap your page content:
   ```jsx
   <PatientLayout>{children}</PatientLayout>
   ```

3. Use responsive components:
   ```jsx
   <InputField label="Email" type="email" />
   <PrimaryButton onClick={handleSubmit}>Submit</PrimaryButton>
   ```

4. Leverage responsive hooks:
   ```jsx
   const { isMobile } = useResponsive();
   ```

5. Test across devices using Chrome DevTools device emulation

---

## 📚 Additional Resources

- Tailwind CSS: https://tailwindcss.com
- Mobile-First Design: https://www.nngroup.com/articles/mobile-first/
- Touch Target Sizes: https://www.nngroup.com/articles/mobile-touch-target-sizing/
- Accessible Forms: https://www.nngroup.com/articles/web-form-design/
