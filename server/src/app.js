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
const port = Number(process.env.PORT || 5000);

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());

// Add a friendly root endpoint so visiting localhost:5000 directly doesn't say "Cannot GET /"
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
    console.log(`Eclinic server listening on http://localhost:${port}`);
  });
};

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
