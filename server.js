import express from "express";
import cors from "cors";
import morgan from "morgan";
import { httpServerHandler } from "cloudflare:node";

import authRoute from "./routes/authRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import cartRoute from "./routes/cartRoute.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import connectDB from './db.js';

const app = express();
connectDB();


// Set ALLOWED_ORIGINS in Worker variables, comma-separated.
// Example: https://buygen.in,https://www.buygen.in
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(morgan("tiny"));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "BuyGen API is running",
  });
});

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/cart", cartRoute);
app.use("/api/v1/review", reviewRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

app.use((err, _req, res, _next) => {
  console.error("API error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Cloudflare's Node HTTP bridge for Express.
app.listen(3000);
export default httpServerHandler({ port: 3000 });
