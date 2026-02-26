import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import index from "./routes/index.route.js";
import connectDB from "./connection/connection.js";

dotenv.config();

const app = express();

/* ---------- BODY PARSER ---------- */
app.use(express.json());
/* ---------- CORS ---------- */
app.use(
  cors({
    origin:"*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-device-id"],
  })
);
// Replace your cors() block with this
const allowedOrigins = [
  "http://localhost:4200",
  "https://praveensrivastav.vercel.app"
];

app.use("/upload", express.static("upload"));
app.use("/upload", express.static(path.join(process.cwd(), "upload")));


/* ---------- DB ---------- */
connectDB();



/* ---------- ROUTES ---------- */
app.use("/medgyan", index);

/* ---------- SERVER ---------- */
const PORT = process.env.port || 7000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default index;
