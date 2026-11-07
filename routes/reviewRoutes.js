import express from "express";

import {
  createReview,
  getProductReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  getAllReviews,
  admindeleteReview,
} from "../controllers/reviewController.js";

// import authMiddleware from "../middlewares/authMiddleware.js";
// import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/get", getAllReviews);

// Public: product reviews
router.get("/product/:productId", getProductReviews);

// Protected: logged-in user

router.post("/create", createReview);
router.get("/my-reviews", getMyReviews);
router.put("/:reviewId", updateReview);
router.delete("/:reviewId", deleteReview);

router.delete("/admindeletereview/:id", admindeleteReview);
// router.post("/", authMiddleware, createReview);
// router.get("/my-reviews", authMiddleware, getMyReviews);
// router.put("/:reviewId", authMiddleware, updateReview);
// router.delete("/:reviewId", authMiddleware, deleteReview);

// Admin: delete any review
// router.delete(
//   "/admin/:reviewId",
//   authMiddleware,
//   adminMiddleware,
//   adminDeleteReview
// );

export default router;