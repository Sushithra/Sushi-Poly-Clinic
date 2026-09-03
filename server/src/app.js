import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import { createServer } from "http";
import routes from "./routes/index.js";
import { connectDB } from "./database/db.js";
import { startNotificationScheduler } from "./services/notification.service.js";
import { registerWebrtcSignaling } from "./services/webrtcSignaling.js";

const app = express();
const httpServer = createServer(app);
const port = Number(process.env.PORT || 10000);
const allowedOrigins = new Set([
  'https://sushi-polyclinic.onrender.com',
  'https://sushi-poly-clinic.onrender.com',
  process.env.FRONTEND_URL,
].filter(Boolean));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(express.json());
// NOTE: patient-record files are served through the authenticated
// GET /api/patient-records/:id/file endpoint, not a public static mount, so
// medical records cannot be fetched without ownership/authorization.

app.get("/", (_request, response) => {
  response.send(`
    <html>
      <body style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h2>Sushi Poly Clinic API is Running! 🚀</h2>
        <p>This is the backend server. The actual website is running on port 5173.</p>
       <a href="https://sushi-polyclinic.onrender.com/" style="display: inline-block; padding: 10px 20px; background: #047857; color: white; text-decoration: none; border-radius: 5px;">Go to Website</a>
      </body>
    </html>
  `);
});

// Lightweight health and metadata endpoints so the server is bootable without business logic.
app.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "eclinic-server",
    mode: "scaffold",
  });
});

app.use("/api", routes);

const startServer = async () => {
  await connectDB();
  startNotificationScheduler();
  registerWebrtcSignaling(httpServer);

  httpServer.listen(port, () => {
    console.log(`Eclinic server listening on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
