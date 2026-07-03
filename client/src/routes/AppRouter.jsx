import { Link, Navigate, Route, Routes } from "react-router-dom";
import PrimaryButton from "../components/buttons/PrimaryButton.jsx";
import SecondaryButton from "../components/buttons/SecondaryButton.jsx";
import AnalyticsCard from "../components/cards/AnalyticsCard.jsx";
import AppointmentCard from "../components/cards/AppointmentCard.jsx";
import DoctorCard from "../components/cards/DoctorCard.jsx";
import PrescriptionCard from "../components/cards/PrescriptionCard.jsx";
import ProductCard from "../components/cards/ProductCard.jsx";
import ContentContainer from "../components/layout/ContentContainer.jsx";
import DashboardScaffold from "../components/layout/DashboardScaffold.jsx";
import PageScaffold from "../components/layout/PageScaffold.jsx";
import ResponsiveGrid from "../components/layout/ResponsiveGrid.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import AppointmentBooking from "../pages/public/AppointmentBooking.jsx";
import HomePage from "../pages/public/HomePage.jsx";
import DoctorsPage from "../pages/public/DoctorsPage.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";
import RegisterPage from "../pages/auth/RegisterPage.jsx";
import ProfilePage from "../pages/auth/ProfilePage.jsx";
import PatientDashboard from "../pages/patient/PatientDashboard.jsx";
import DoctorLoginPage from "../pages/auth/DoctorLoginPage.jsx";
import DoctorRegisterPage from "../pages/auth/DoctorRegisterPage.jsx";
import DoctorDashboard from "../pages/doctor/DoctorDashboard.jsx";
import PharmacyPage from "../pages/public/PharmacyPage.jsx";
import ConsultationRoom from "../pages/patient/ConsultationRoom.jsx";

const scaffoldAreas = [
  {
    title: "Public",
    items: ["/", "/about", "/contact", "/doctors", "/pharmacy"],
  },
  {
    title: "Auth",
    items: [
      "/login",
      "/register",
      "/auth/forgot-password",
      "/auth/reset-password",
    ],
  },
  {
    title: "Feature Areas",
    items: [
      "/patient/dashboard",
      "/appointments",
      "/consultations",
      "/prescriptions",
      "/payments",
      "/notifications",
    ],
  },
];

function ShellPage({ title, description }) {
  return (
    <MainLayout>
      <ContentContainer>
        <main className="app-shell">
          <PageScaffold eyebrow="Eclinic Foundation" title={title} description={description}>
            <div className="hero-actions">
              <PrimaryButton>Primary CTA</PrimaryButton>
              <SecondaryButton>Secondary CTA</SecondaryButton>
            </div>
          </PageScaffold>
          <ResponsiveGrid>
            {scaffoldAreas.map((group) => (
              <article key={group.title} className="info-card">
                <h2>{group.title}</h2>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>
                      <Link to={item}>{item}</Link>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </ResponsiveGrid>
          <DashboardScaffold>
            <ResponsiveGrid>
              <DoctorCard />
              <AppointmentCard />
              <PrescriptionCard />
              <ProductCard />
              <AnalyticsCard />
            </ResponsiveGrid>
          </DashboardScaffold>
        </main>
      </ContentContainer>
    </MainLayout>
  );
}

function ProfileRedirect() {
  const doctorInfo = localStorage.getItem('doctorInfo');
  const userInfo = localStorage.getItem('userInfo');
  if (doctorInfo) return <Navigate to="/doctor/profile" replace />;
  if (userInfo) return <Navigate to="/patient/profile" replace />;
  return <Navigate to="/login" replace />;
}

// Root routing composition placeholder.
// These routes intentionally render generic scaffold pages until feature-specific UI is implemented.
export default function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainLayout showTopNav={false}>
            <HomePage />
          </MainLayout>
        }
      />
      <Route
        path="/login"
        element={
          <MainLayout showTopNav={false}>
            <LoginPage />
          </MainLayout>
        }
      />
      <Route
        path="/register"
        element={
          <MainLayout showTopNav={false}>
            <RegisterPage />
          </MainLayout>
        }
      />
      <Route
        path="/onboarding"
        element={<Navigate to="/login" replace />}
      />
      <Route
        path="/profile"
        element={<ProfileRedirect />}
      />
      <Route
        path="/patient/profile"
        element={<ProfilePage />}
      />
      <Route
        path="/doctor/profile"
        element={<ProfilePage />}
      />
      <Route
        path="/about"
        element={
          <ShellPage
            title="About Eclinic"
            description="Architecture-first healthcare platform foundation for patient, doctor, pharmacy, payment, consultation, and admin workflows."
          />
        }
      />
      <Route
        path="/contact"
        element={
          <ShellPage
            title="Contact Placeholder"
            description="Contact workflows have not been implemented yet. This route exists so navigation structure can be validated."
          />
        }
      />
      <Route
        path="/doctors"
        element={
          <MainLayout showTopNav={false}>
            <DoctorsPage />
          </MainLayout>
        }
      />
      <Route
        path="/pharmacy"
        element={
          <MainLayout showTopNav={false}>
            <PharmacyPage />
          </MainLayout>
        }
      />
      <Route
        path="/appointments/*"
        element={
          <ShellPage
            title="Appointments Module Placeholder"
            description="Appointment booking and scheduling routes are reserved and the application shell is ready for future implementation."
          />
        }
      />
      <Route path="/appointments/book" element={<MainLayout showTopNav={false}><AppointmentBooking /></MainLayout>} />
      <Route
        path="/consultations"
        element={
          <ShellPage
            title="Consultations Module Placeholder"
            description="Consultation and telemedicine routes are wired into the app shell, with implementation intentionally deferred."
          />
        }
      />
      <Route
        path="/consultations/:appointmentId"
        element={<ConsultationRoom />}
      />
      <Route
        path="/prescriptions/*"
        element={
          <ShellPage
            title="Prescriptions Module Placeholder"
            description="Prescription, records, and report-management pages are reserved and ready for phased implementation."
          />
        }
      />
      <Route
        path="/payments"
        element={
          <ShellPage
            title="Payments Module Placeholder"
            description="Payment, billing, invoice, and refund routes are bootable placeholders only at this stage."
          />
        }
      />
      <Route
        path="/payments/appointments/:appointmentId"
        element={<Navigate to="/patient/dashboard" replace />}
      />
      <Route
        path="/notifications/*"
        element={
          <ShellPage
            title="Notifications Module Placeholder"
            description="Notification, communication, and engagement routes are available as scaffolded entry points."
          />
        }
      />
      <Route
        path="/patient/dashboard"
        element={<PatientDashboard />}
      />
      <Route
        path="/doctor/login"
        element={
          <DoctorLoginPage />
        }
      />
      <Route
        path="/doctor/register"
        element={
          <DoctorRegisterPage />
        }
      />
      <Route path="/doctor-portal" element={<Navigate to="/doctor/login" replace />} />
      <Route
        path="/doctor/dashboard"
        element={<DoctorDashboard />}
      />
      <Route
        path="/doctor/*"
        element={
          <ShellPage
            title="Doctor Area Placeholder"
            description="Doctor profile, schedule, earnings, and related routes are scaffolded but intentionally non-functional."
          />
        }
      />
      <Route
        path="/admin/*"
        element={
          <ShellPage
            title="Admin Area Placeholder"
            description="Admin dashboard, governance, verification, analytics, and monitoring routes are scaffolded but intentionally non-functional."
          />
        }
      />
      <Route
        path="/auth/*"
        element={
          <ShellPage
            title="Authentication Placeholder"
            description="Authentication flows are structurally prepared, but login, registration, and recovery behavior are not implemented yet."
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
