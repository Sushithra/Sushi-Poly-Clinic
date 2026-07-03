import { Router } from "express";
import authRoutes from "./auth.routes.js";
import doctorRoutes from "./doctor.routes.js";
import appointmentRoutes from "./appointment.routes.js";
import notificationRoutes from "./notification.routes.js";
import uploadRoutes from "./upload.routes.js";
import aiRoutes from "./ai.routes.js";
import productRoutes from "./product.routes.js";
import paymentRoutes from "./payment.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/doctors", doctorRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/notifications", notificationRoutes);
router.use("/upload", uploadRoutes);
router.use("/ai", aiRoutes);
router.use("/products", productRoutes);
router.use("/", paymentRoutes);

router.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    api: "eclinic-api",
    modules: [
      "auth",
      "patient",
      "doctor",
      "appointments",
      "consultations",
      "prescriptions",
      "pharmacy",
      "payments",
      "notifications",
      "admin",
    ],
  });
});

router.get("/meta/routes", (_request, response) => {
  response.json({
    message:
      "API route groups are scaffolded. Business endpoints are intentionally not implemented yet.",
    routeGroups: {
      auth: ["authRoutes", "patientAuthRoutes", "doctorAuthRoutes", "adminAuthRoutes"],
      patient: ["patientRoutes", "patientProfileRoutes", "medicalHistoryRoutes", "reportRoutes"],
      doctor: ["doctorRoutes", "specializationRoutes", "availabilityRoutes", "consultationRoutes"],
      appointments: ["appointmentRoutes", "bookingRoutes", "scheduleRoutes"],
      consultations: ["consultationRoutes", "sessionRoutes", "telemedicineRoutes"],
      prescriptions: ["prescriptionRoutes", "medicalRecordRoutes", "reportRoutes"],
      pharmacy: ["pharmacyRoutes", "productRoutes", "orderRoutes", "checkoutRoutes"],
      payments: ["paymentRoutes", "invoiceRoutes", "transactionRoutes", "refundRoutes"],
      notifications: ["notificationRoutes", "messagingRoutes", "reminderRoutes"],
      admin: ["adminRoutes", "analyticsRoutes", "monitoringRoutes", "verificationRoutes"],
    },
  });
});

export default router;
