import mongoose from "mongoose";
import reviewModel from "../models/reviewModel.js";
import productModel from "../models/productModel.js";



// Get All Reviews ==> Admin
export const getAllReviews = async(req, res) => {
  try {
    const reviews = await reviewModel.find({})
    .populate({
                path: "product",
                model: productModel,
                select: "_id title images brand"
            })
            .populate({
                path: "user",
                select: "_id name"
            })
        .sort({ createdAt: -1 });

      console.log(reviews);
    res.status(200).send({
      success: true,
      reviews,
    })
  } catch (error) {
    console.log(error);
    res.status(500).send({
            success: false,
            message:"Internal server error",
            error,
        });
  }
}

// CREATE REVIEW
export const createReview = async (req, res) => {
  try {
    const { product, rating, title, comment, images, user } = req.body;
    console.log(req.body);
    const userId = req.user?._id;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Please login to submit a review",
      });
    }

    if (!mongoose.isValidObjectId(product)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (
      !Number.isInteger(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (!comment?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Review comment is required",
      });
    }

    await reviewModel.create({product,user,rating: Number(rating),title,comment,images,});

    await productModel.findByIdAndUpdate(
      product,
      [
        {
          $set: {
            ratingSum: {
              $add: [{ $ifNull: ["$ratingSum", 0] }, Number(rating)],
            },
            totalReviews: {
              $add: [{ $ifNull: ["$totalReviews", 0] }, 1],
            },
          },
        },
        {
          $set: {
            averageRating: {
              $round: [{ $divide: ["$ratingSum", "$totalReviews"] }, 1],
            },
          },
        },
      ],
      { updatePipeline: true },
    );
    return res.status(201).json({
      success: true,
      message: "Review added successfully",
    });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// GET ALL REVIEWS FOR A PRODUCT
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const filter = { product: productId };

    const [reviews, total, summary] = await Promise.all([
      reviewModel
        .find(filter)
        .populate("user", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      reviewModel.countDocuments(filter),

      reviewModel.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId) } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
            fiveStars: {
              $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] },
            },
            fourStars: {
              $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] },
            },
            threeStars: {
              $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] },
            },
            twoStars: {
              $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] },
            },
            oneStar: {
              $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const ratingSummary = summary[0] || {
      averageRating: 0,
      totalReviews: 0,
      fiveStars: 0,
      fourStars: 0,
      threeStars: 0,
      twoStars: 0,
      oneStar: 0,
    };

    return res.status(200).json({
      success: true,
      reviews,
      ratingSummary: {
        ...ratingSummary,
        averageRating: Number(ratingSummary.averageRating.toFixed(1)),
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get Reviews Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// GET LOGGED-IN USER'S REVIEWS
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await reviewModel
      .find({ user: req.user._id })
      .populate("product", "title images slug price")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      total: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get My Reviews Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// UPDATE OWN REVIEW
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment, images } = req.body;

    if (!mongoose.isValidObjectId(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await reviewModel.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (String(review.user) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own review",
      });
    }

    if (rating !== undefined) {
      const value = Number(rating);

      if (!Number.isInteger(value) || value < 1 || value > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }

      review.rating = value;
    }

    if (title !== undefined) review.title = title;
    if (comment !== undefined) {
      if (!comment.trim()) {
        return res.status(400).json({
          success: false,
          message: "Review comment cannot be empty",
        });
      }

      review.comment = comment;
    }

    if (images !== undefined) review.images = images;

    await review.save();

    const updatedReview = await reviewModel
      .findById(review._id)
      .populate("user", "name")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Update Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// DELETE OWN REVIEW
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!mongoose.isValidObjectId(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await reviewModel.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (String(review.user) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own review",
      });
    }

    await review.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ADMIN: DELETE ANY REVIEW
export const admindeleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await reviewModel.findByIdAndDelete(id);
        if (!review) {
            return res.status(404).send({
                success: false,
                message: "Review not found"
            });
        }
        res.status(200).send({
            success: true,
            message: "Review deleted successfully"
        });

    } catch (error) {
        console.log("Delete Review Error:", error);

        res.status(500).send({
            success: false,
            message: "Failed to delete review",
            error: error.message
        });
    }
};