import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import index from "./routes/index.route.js";
import connectDB from "./connection/connection.js";
import cron from "node-cron";
import { checkSubscriptionExpiry } from "./constant/subscriptioncheck.js";
dotenv.config();

const app = express();

/* ---------- BODY PARSER ---------- */
app.use(express.json());

/* ---------- CORS ---------- */
const allowedOrigins = [
  "http://localhost:4200",
  "https://praveensrivastav.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-device-id"],
  })
);

/* ---------- STATIC FILES ---------- */
app.use("/upload", express.static(path.join(process.cwd(), "upload")));

/* ---------- DB ---------- */
connectDB();

/* ---------- ROUTES ---------- */
app.use("/medgyan", index);
/* ---------- Corn Job ---------- */
// runs daily at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("⏰ Running subscription check...");
  await checkSubscriptionExpiry();
});

/* ---------- SERVER ---------- */
const PORT = process.env.port || 7000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


export default index;